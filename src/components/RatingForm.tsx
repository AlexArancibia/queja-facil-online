
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Calendar, Clock, User, Building2 } from 'lucide-react';
import { MOCK_STORES } from '@/types/complaint';
import { MOCK_INSTRUCTORS } from '@/types/instructor';
import type { Rating } from '@/types/instructor';
import TimePicker from './TimePicker';

const ratingSchema = z.object({
  storeId: z.string().min(1, 'Selecciona un local'),
  instructorId: z.string().min(1, 'Selecciona un instructor'),
  date: z.string().min(1, 'Ingresa la fecha de la clase'),
  schedule: z.string().min(1, 'Selecciona el horario'),
  npsScore: z.number().min(1, 'Califica al menos con 1').max(10),
  instructorRating: z.number().min(1, 'Califica al menos con 1').max(10),
  cleanlinessRating: z.number().min(1, 'Califica al menos con 1').max(10),
  audioRating: z.number().min(1, 'Califica al menos con 1').max(10),
  attentionQualityRating: z.number().min(1, 'Califica al menos con 1').max(10),
  amenitiesRating: z.number().min(1, 'Califica al menos con 1').max(10),
  punctualityRating: z.number().min(1, 'Califica al menos con 1').max(10),
  comments: z.string().optional()
});

type RatingFormData = z.infer<typeof ratingSchema>;

const RatingForm = () => {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState('');
  const [ratings, setRatings] = useState({
    npsScore: 0,
    instructorRating: 0,
    cleanlinessRating: 0,
    audioRating: 0,
    attentionQualityRating: 0,
    amenitiesRating: 0,
    punctualityRating: 0
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema)
  });

  const watchedStore = watch('storeId');
  const availableInstructors = MOCK_INSTRUCTORS.filter(instructor => 
    instructor.storeId === watchedStore && instructor.isActive
  );

  const onSubmit = async (data: RatingFormData) => {
    try {
      const instructor = MOCK_INSTRUCTORS.find(i => i.id === data.instructorId);
      
      const newRating: Rating = {
        id: `rating-${Date.now()}`,
        instructorId: data.instructorId,
        storeId: data.storeId,
        discipline: instructor?.discipline || '',
        instructorName: instructor?.name || '',
        date: data.date,
        schedule: data.schedule,
        npsScore: data.npsScore,
        instructorRating: data.instructorRating,
        cleanlinessRating: data.cleanlinessRating,
        audioRating: data.audioRating,
        attentionQualityRating: data.attentionQualityRating,
        amenitiesRating: data.amenitiesRating,
        punctualityRating: data.punctualityRating,
        comments: data.comments,
        createdAt: new Date()
      };

      // Save to localStorage
      const existingRatings = JSON.parse(localStorage.getItem('ratings') || '[]');
      existingRatings.push(newRating);
      localStorage.setItem('ratings', JSON.stringify(existingRatings));

      toast({
        title: "¡Calificación enviada!",
        description: `Gracias por tu evaluación. ID: ${newRating.id.slice(-8)}`,
      });

      // Reset form
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la calificación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const RatingSlider = ({ 
    label, 
    value, 
    onChange,
    fieldName,
    hasError
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void;
    fieldName: keyof typeof ratings;
    hasError?: boolean;
  }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className={`text-sm font-medium ${hasError ? 'text-red-500' : 'text-gray-700'}`}>
          {label}
        </Label>
        <div className="flex items-center space-x-2">
          {value > 0 ? (
            <div className="flex items-center text-amber-600">
              <Star className="h-3 w-3 mr-1 fill-current" />
              <span className="text-sm font-medium">{value}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Sin calificar</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => {
              onChange(score);
              setValue(fieldName, score);
              setRatings(prev => ({ ...prev, [fieldName]: score }));
            }}
            className={`h-8 rounded text-xs font-medium transition-all duration-200 border ${
              score <= value
                ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm'
                : hasError
                ? 'bg-red-50 text-red-400 hover:bg-red-100 border-red-200'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-gray-200'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
      {hasError && (
        <p className="text-red-500 text-xs">Debes calificar al menos con 1 punto</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Store and Instructor Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center text-gray-700">
            <Building2 className="h-4 w-4 mr-2 text-siclo-green" />
            Local
          </Label>
          <Select onValueChange={(value) => {
            setValue('storeId', value);
            setSelectedStore(value);
            setValue('instructorId', '');
          }}>
            <SelectTrigger className="border-gray-200 focus:border-siclo-green">
              <SelectValue placeholder="Selecciona el local" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_STORES.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.storeId && <p className="text-red-500 text-xs">{errors.storeId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center text-gray-700">
            <User className="h-4 w-4 mr-2 text-siclo-blue" />
            Instructor
          </Label>
          <Select 
            onValueChange={(value) => setValue('instructorId', value)}
            disabled={!selectedStore}
          >
            <SelectTrigger className="border-gray-200 focus:border-siclo-green">
              <SelectValue placeholder="Selecciona el instructor" />
            </SelectTrigger>
            <SelectContent>
              {availableInstructors.map((instructor) => (
                <SelectItem key={instructor.id} value={instructor.id}>
                  {instructor.name} - {instructor.discipline.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.instructorId && <p className="text-red-500 text-xs">{errors.instructorId.message}</p>}
        </div>
      </div>

      {/* Date and Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center text-gray-700">
            <Calendar className="h-4 w-4 mr-2 text-siclo-green" />
            Fecha de la clase
          </Label>
          <Input
            type="date"
            {...register('date')}
            className="border-gray-200 focus:border-siclo-green"
          />
          {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center text-gray-700">
            <Clock className="h-4 w-4 mr-2 text-siclo-blue" />
            Horario de la clase
          </Label>
          <TimePicker
            onValueChange={(value) => setValue('schedule', value)}
          />
          {errors.schedule && <p className="text-red-500 text-xs">{errors.schedule.message}</p>}
        </div>
      </div>

      {/* NPS Score */}
      <Card className="bg-blue-50/50 border-blue-100">
        <CardContent className="pt-4">
          <RatingSlider
            label="1. ¿Recomendarías esta clase? (NPS 1-10)"
            value={ratings.npsScore}
            onChange={(value) => {}}
            fieldName="npsScore"
            hasError={!!errors.npsScore}
          />
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-emerald-100/50 rounded">
              <span className="text-emerald-700">Promotores: 9-10</span>
            </div>
            <div className="text-center p-2 bg-amber-100/50 rounded">
              <span className="text-amber-700">Pasivos: 7-8</span>
            </div>
            <div className="text-center p-2 bg-red-100/50 rounded">
              <span className="text-red-700">Detractores: 1-6</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Ratings */}
      <Card className="bg-amber-50/30 border-amber-100">
        <CardContent className="pt-4">
          <h3 className="text-base font-semibold text-gray-800 mb-4">2. Evaluación detallada</h3>
          <div className="space-y-4">
            <RatingSlider
              label="Instructor"
              value={ratings.instructorRating}
              onChange={(value) => {}}
              fieldName="instructorRating"
              hasError={!!errors.instructorRating}
            />
            
            <RatingSlider
              label="Limpieza"
              value={ratings.cleanlinessRating}
              onChange={(value) => {}}
              fieldName="cleanlinessRating"
              hasError={!!errors.cleanlinessRating}
            />
            
            <RatingSlider
              label="Audio"
              value={ratings.audioRating}
              onChange={(value) => {}}
              fieldName="audioRating"
              hasError={!!errors.audioRating}
            />
            
            <RatingSlider
              label="Calidad de atención"
              value={ratings.attentionQualityRating}
              onChange={(value) => {}}
              fieldName="attentionQualityRating"
              hasError={!!errors.attentionQualityRating}
            />
            
            <RatingSlider
              label="Amenities"
              value={ratings.amenitiesRating}
              onChange={(value) => {}}
              fieldName="amenitiesRating"
              hasError={!!errors.amenitiesRating}
            />
            
            <RatingSlider
              label="Puntualidad"
              value={ratings.punctualityRating}
              onChange={(value) => {}}
              fieldName="punctualityRating"
              hasError={!!errors.punctualityRating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Comentarios adicionales (opcional)</Label>
        <Textarea
          placeholder="Comparte cualquier comentario adicional sobre tu experiencia..."
          {...register('comments')}
          className="border-gray-200 focus:border-siclo-green min-h-[80px] text-sm"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full siclo-button h-11 text-base font-medium"
      >
        {isSubmitting ? 'Enviando calificación...' : 'Enviar Calificación'}
      </Button>
    </form>
  );
};

export default RatingForm;
