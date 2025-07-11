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

const ratingSchema = z.object({
  storeId: z.string().min(1, 'Selecciona un local'),
  instructorId: z.string().min(1, 'Selecciona un instructor'),
  date: z.string().min(1, 'Ingresa la fecha de la clase'),
  schedule: z.string().min(1, 'Ingresa el horario'),
  npsScore: z.number().min(1).max(10),
  instructorRating: z.number().min(1).max(10),
  cleanlinessRating: z.number().min(1).max(10),
  audioRating: z.number().min(1).max(10),
  attentionQualityRating: z.number().min(1).max(10),
  amenitiesRating: z.number().min(1).max(10),
  punctualityRating: z.number().min(1).max(10),
  comments: z.string().optional()
});

type RatingFormData = z.infer<typeof ratingSchema>;

const RatingForm = () => {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState('');
  const [ratings, setRatings] = useState({
    npsScore: 10,
    instructorRating: 10,
    cleanlinessRating: 10,
    audioRating: 10,
    attentionQualityRating: 10,
    amenitiesRating: 10,
    punctualityRating: 10
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      npsScore: 10,
      instructorRating: 10,
      cleanlinessRating: 10,
      audioRating: 10,
      attentionQualityRating: 10,
      amenitiesRating: 10,
      punctualityRating: 10
    }
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
    fieldName 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void;
    fieldName: keyof typeof ratings;
  }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-siclo-dark font-medium">{label}</Label>
        <span className="text-lg font-bold text-siclo-green">{value}</span>
      </div>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => {
              onChange(score);
              setValue(fieldName, score);
              setRatings(prev => ({ ...prev, [fieldName]: score }));
            }}
            className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
              score <= value
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Store and Instructor Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-siclo-dark font-medium flex items-center">
            <Building2 className="h-4 w-4 mr-2 text-siclo-green" />
            Local
          </Label>
          <Select onValueChange={(value) => {
            setValue('storeId', value);
            setSelectedStore(value);
            setValue('instructorId', ''); // Reset instructor when store changes
          }}>
            <SelectTrigger className="border-siclo-light/50 focus:border-siclo-green">
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
          {errors.storeId && <p className="text-red-500 text-sm">{errors.storeId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-siclo-dark font-medium flex items-center">
            <User className="h-4 w-4 mr-2 text-siclo-blue" />
            Instructor
          </Label>
          <Select 
            onValueChange={(value) => setValue('instructorId', value)}
            disabled={!selectedStore}
          >
            <SelectTrigger className="border-siclo-light/50 focus:border-siclo-green">
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
          {errors.instructorId && <p className="text-red-500 text-sm">{errors.instructorId.message}</p>}
        </div>
      </div>

      {/* Date and Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-siclo-dark font-medium flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-siclo-green" />
            Fecha de la clase
          </Label>
          <Input
            type="date"
            {...register('date')}
            className="border-siclo-light/50 focus:border-siclo-green"
          />
          {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-siclo-dark font-medium flex items-center">
            <Clock className="h-4 w-4 mr-2 text-siclo-blue" />
            Horario
          </Label>
          <Input
            placeholder="Ej: 9:00 AM - 10:00 AM"
            {...register('schedule')}
            className="border-siclo-light/50 focus:border-siclo-green"
          />
          {errors.schedule && <p className="text-red-500 text-sm">{errors.schedule.message}</p>}
        </div>
      </div>

      {/* NPS Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <RatingSlider
            label="1. Calificación de cliente NPS (1-10)"
            value={ratings.npsScore}
            onChange={(value) => {}}
            fieldName="npsScore"
          />
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <span className="font-medium text-emerald-600">Promedio: 9-10</span>
            </div>
            <div className="text-center">
              <span className="font-medium text-amber-600">Neutral: 7-8</span>
            </div>
            <div className="text-center">
              <span className="font-medium text-red-600">Bajo: 1-6</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold text-siclo-dark mb-6">2. Observaciones</h3>
          <div className="space-y-6">
            <RatingSlider
              label="Instructor (1-10)"
              value={ratings.instructorRating}
              onChange={(value) => {}}
              fieldName="instructorRating"
            />
            
            <RatingSlider
              label="Limpieza (1-10)"
              value={ratings.cleanlinessRating}
              onChange={(value) => {}}
              fieldName="cleanlinessRating"
            />
            
            <RatingSlider
              label="Audio (1-10)"
              value={ratings.audioRating}
              onChange={(value) => {}}
              fieldName="audioRating"
            />
            
            <RatingSlider
              label="Calidad de atención (1-10)"
              value={ratings.attentionQualityRating}
              onChange={(value) => {}}
              fieldName="attentionQualityRating"
            />
            
            <RatingSlider
              label="Amenities (1-10)"
              value={ratings.amenitiesRating}
              onChange={(value) => {}}
              fieldName="amenitiesRating"
            />
            
            <RatingSlider
              label="Puntualidad (1-10)"
              value={ratings.punctualityRating}
              onChange={(value) => {}}
              fieldName="punctualityRating"
            />
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="space-y-2">
        <Label className="text-siclo-dark font-medium">Comentarios adicionales (opcional)</Label>
        <Textarea
          placeholder="Comparte cualquier comentario adicional sobre tu experiencia..."
          {...register('comments')}
          className="border-siclo-light/50 focus:border-siclo-green min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full siclo-button h-12 text-lg font-medium"
      >
        {isSubmitting ? 'Enviando calificación...' : 'Enviar Calificación'}
      </Button>
    </form>
  );
};

export default RatingForm;
