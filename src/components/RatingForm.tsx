import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Calendar as CalendarIcon, Clock, User, Building2, CheckCircle, Home, Mail } from 'lucide-react';
import { useBranchesStore } from '@/stores/branchesStore';
import { useInstructorsStore } from '@/stores/instructorsStore';
import { useRatingsStore } from '@/stores/ratingsStore';
import { useEmailStore } from '@/stores/emailStore';
import { Discipline, type CreateRatingDto } from '@/types/api';
import TimePicker from './TimePicker';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { generateRatingConfirmationEmail } from '@/lib/emailTemplates';
import { emailConfig } from '@/lib/envConfig';
import { getBranchEmailMetadataSync } from '@/lib/emailHelpers';

const ratingSchema = z.object({
  branchId: z.string().min(1, 'Selecciona un local'),
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
  const navigate = useNavigate();
  const [ratings, setRatings] = useState({
    npsScore: 0,
    instructorRating: 0,
    cleanlinessRating: 0,
    audioRating: 0,
    attentionQualityRating: 0,
    amenitiesRating: 0,
    punctualityRating: 0
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [submitted, setSubmitted] = useState(false);

  // Stores
  const { branches, fetchBranches, loading: branchesLoading } = useBranchesStore();
  const { instructors, fetchInstructors } = useInstructorsStore();
  const { createRating } = useRatingsStore();
  const { sendEmail } = useEmailStore();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema)
  });

  const watchedBranch = watch('branchId');
  const watchedInstructor = watch('instructorId');

  // Load branches when component mounts
  useEffect(() => {
    if (!branches.length && !branchesLoading) {
      fetchBranches(true);
    }
  }, [fetchBranches, branches, branchesLoading]);

  // Load instructors when branch changes
  useEffect(() => {
    if (watchedBranch) {
      fetchInstructors({ branchId: watchedBranch, active: true });
    }
  }, [watchedBranch, fetchInstructors]);

  const onSubmit = async (data: RatingFormData) => {
    try {
      const instructor = instructors.find(i => i.id === data.instructorId);
      
      const newRating: CreateRatingDto = {
        instructorId: data.instructorId,
        branchId: data.branchId,
        instructorName: instructor?.name || '',
        discipline: instructor?.discipline || Discipline.SICLO,
        date: data.date,
        schedule: data.schedule,
        npsScore: data.npsScore,
        instructorRating: data.instructorRating,
        cleanlinessRating: data.cleanlinessRating,
        audioRating: data.audioRating,
        attentionQualityRating: data.attentionQualityRating,
        amenitiesRating: data.amenitiesRating,
        punctualityRating: data.punctualityRating,
        comments: data.comments
      };

      const createdRating = await createRating(newRating);
      setSubmitted(true);

      // Mostrar mensaje de éxito
      toast({
        title: "¡Calificación registrada exitosamente!",
        description: "Gracias por tu feedback.",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la calificación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const getRatingColor = (value: number) => {
    if (value <= 6) return 'red';
    if (value <= 8) return 'amber';
    return 'emerald';
  };

  const getButtonColor = (score: number, currentValue: number) => {
    if (score <= currentValue) {
      const color = getRatingColor(currentValue);
      if (color === 'red') return 'bg-red-50 text-red-700 border-red-200';
      if (color === 'amber') return 'bg-amber-50 text-amber-700 border-amber-200';
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    return 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200';
  };

  const RatingSlider = ({ 
    label, 
    value, 
    onChange,
    fieldName,
    hasError,
    isNPS = false
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void;
    fieldName: keyof typeof ratings;
    hasError?: boolean;
    isNPS?: boolean;
  }) => {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className={`text-sm font-medium ${hasError ? 'text-red-600' : isNPS ? 'text-white' : 'text-slate-800'}`}>
            {label}
          </Label>
          {value > 0 && (
            <div className={`flex items-center ${isNPS ? 'text-white' : 'text-siclo-yellow'}`}>
              <Star className="h-3 w-3 mr-1 fill-current" />
              <span className="text-sm font-medium">{value}</span>
            </div>
          )}
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
                getButtonColor(score, value)
              } ${hasError && value === 0 ? 'border-red-300' : ''}`}
            >
              {score}
            </button>
          ))}
        </div>
        {hasError && (
          <p className="text-xs sm:text-sm text-red-600 font-medium">Debes calificar al menos con 1 punto</p>
        )}
      </div>
    );
  };

  if (submitted) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">
              ¡Gracias por tu evaluación!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 leading-relaxed max-w-md mx-auto">
              Tu opinión es muy valiosa para nosotros y nos ayuda a 
              <span className="font-medium text-slate-700"> mejorar continuamente</span>.
            </p>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium"
            >
              <Home className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      {/* Email Field eliminado */}

      {/* Branch and Instructor Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-800 flex items-center">
            <Building2 className="h-4 w-4 mr-2 text-siclo-green" />
            Local *
          </Label>
          <Select 
            onValueChange={(value) => {
              setValue('branchId', value);
              setValue('instructorId', '');
            }}
            
            value={watchedBranch}
          >
            <SelectTrigger className="border-border focus:border-border focus:ring-siclo-green/20 text-sm">
              <SelectValue placeholder="Selecciona el local" />
            </SelectTrigger>
            <SelectContent>
              {branchesLoading ? (
                <SelectItem value="loading" disabled>
                  <span className="text-slate-500">Cargando locales...</span>
                </SelectItem>
              ) : (
                branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    <div className="select-item-content">
                      <span className="select-item-title font-medium text-slate-800">{branch.name}</span>
                      <span className="select-item-subtitle text-slate-600">{branch.address}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.branchId && <p className="text-xs sm:text-sm text-red-600 font-medium">{errors.branchId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-800 flex items-center">
            <User className="h-4 w-4 mr-2 text-siclo-blue" />
            Instructor *
          </Label>
          <Select 
            onValueChange={(value) => setValue('instructorId', value)}
            disabled={!watchedBranch}
            value={watchedInstructor}
          >
            <SelectTrigger className="border-border focus:border-border focus:ring-siclo-green/20 text-sm">
              <SelectValue placeholder="Selecciona el instructor" />
            </SelectTrigger>
            <SelectContent>
              {instructors.length > 0 ? (
                instructors.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    <span className="font-medium text-slate-800">
                      {instructor.name} - {instructor.discipline.toUpperCase()}
                    </span>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-instructors" disabled>
                  <span className="text-slate-500">
                    {watchedBranch ? 'No hay instructores disponibles' : 'Selecciona un local primero'}
                  </span>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.instructorId && <p className="text-xs sm:text-sm text-red-600 font-medium">{errors.instructorId.message}</p>}
        </div>
      </div>

      {/* Date and Schedule */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-800 flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-siclo-green" />
            Fecha de la clase *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal  border-border  text-sm",
                  !selectedDate && "text-slate-500"
                )}
              >
               
                {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (date) {
                    setValue('date', format(date, 'yyyy-MM-dd'));
                  }
                }}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-xs sm:text-sm text-red-600 font-medium">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-800 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-siclo-green" />
            Horario de la clase *
          </Label>
          <TimePicker
          
            onValueChange={(value) => setValue('schedule', value)}
          />
          {errors.schedule && <p className="text-xs sm:text-sm text-red-600 font-medium">{errors.schedule.message}</p>}
        </div>
      </div>

      {/* NPS Score */}
      <Card className="bg-gradient-to-r from-siclo-green/80 to-siclo-green border-slate-200 shadow-sm">
        <CardContent className="pt-4 sm:pt-6 p-4">
          <RatingSlider
            label="1. ¿Recomendarías esta clase?"
            value={ratings.npsScore}
            onChange={(value) => {}}
            fieldName="npsScore"
            hasError={!!errors.npsScore}
            isNPS={true}
          />
        </CardContent>
      </Card>

      {/* Detailed Ratings */}
      <Card className="bg-slate-50/50 border-slate-200 shadow-sm " >
        <CardContent className="pt-4 sm:pt-6 p-4">
          <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-4 sm:mb-6">
            2. Evaluación detallada
          </h3>
          <div className="space-y-4 sm:space-y-6">
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
        <Label className="text-sm font-medium text-slate-800">
          Comentarios adicionales (opcional)
        </Label>
        <p className="text-xs text-slate-600 leading-relaxed">
          Comparte cualquier comentario adicional sobre tu experiencia en la clase
        </p>
        <Textarea
          placeholder="Escribe tus comentarios aquí..."
          {...register('comments')}
          className="border-border focus:border-border focus:ring-siclo-green/20 min-h-20 sm:min-h-24 text-sm resize-y"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2 border-t border-slate-200">
        <Button
          type="submit"
          disabled={isSubmitting || !watchedBranch || !watchedInstructor}
          className="w-full siclo-button bg-gradient-to-r from-siclo-orange via-siclo-purple to-siclo-deep-blue text-base sm:text-lg py-4 sm:py-6 font-medium shadow-md hover:shadow-lg transition-shadow"
        >
          {isSubmitting ? (
            <span className="text-white/90">Enviando calificación...</span>
          ) : (
            <>
              <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Enviar Calificación
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default RatingForm;