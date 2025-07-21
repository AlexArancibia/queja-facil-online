import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, CheckCircle } from 'lucide-react';
import { ComplaintPriority, type CreateComplaintDto } from '@/types/api';
import { useComplaintsStore } from '@/stores/complaintsStore';
import { useBranchesStore } from '@/stores/branchesStore';
import { useEmailStore } from '@/stores/emailStore';
import { ImageUploader } from '@/components/ImageUploader';
import { generateComplaintConfirmationEmail } from '@/lib/emailTemplates';
import { emailConfig } from '@/lib/envConfig';
import { getBranchEmailMetadataSync } from '@/lib/emailHelpers';

interface ComplaintFormData {
  fullName: string;
  email: string;
  branchId: string;
  observationType: string;
  detail: string;
  priority: ComplaintPriority;
}

const OBSERVATION_TYPES = [
  'Instalaciones',
  'Servicio',
  'Instructor',
  'Limpieza',
  'Seguridad',
  'Otro'
];

const ComplaintForm = () => {
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const { toast } = useToast();
  
  // Stores
  const { createComplaint } = useComplaintsStore();
  const { branches, fetchBranches, loading: branchesLoading } = useBranchesStore();
  const { sendEmail } = useEmailStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ComplaintFormData>();

  const selectedBranch = watch('branchId');
  const selectedObservationType = watch('observationType');
  const selectedPriority = watch('priority');

  useEffect(() => {
    // Fetch active branches when component mounts
    if (!branches.length && !branchesLoading) {
      fetchBranches(true);
    }
  }, [fetchBranches, branches, branchesLoading]);

  const handleImagesChange = (imageUrls: string[]) => {
    setUploadedImageUrls(imageUrls);
  };

  const onSubmit = async (data: ComplaintFormData) => {
    setHasAttemptedSubmit(true);
    setIsSubmitting(true);
    
    try {
      // Usar las URLs de las imágenes ya subidas
      const attachments = uploadedImageUrls.map((url, index) => ({
        filename: `image-${index + 1}.jpg`,
        url: url
      }));

      const formData: CreateComplaintDto = {
        fullName: data.fullName,
        email: data.email,
        branchId: data.branchId,
        observationType: data.observationType,
        detail: data.detail,
        priority: data.priority,
        attachments: attachments
      };

      console.log('📝 FormData preparado:', JSON.stringify(formData, null, 2));

      const createdComplaint = await createComplaint(formData);
      
      setComplaintId(createdComplaint.id);
      setSubmitted(true);

      // Enviar email de confirmación
      try {
        const selectedBranchData = branches.find(b => b.id === data.branchId);
        const branchName = selectedBranchData?.name || 'Local';
        
        const emailHtml = generateComplaintConfirmationEmail(createdComplaint, branchName);
        
        // Obtener metadata del branch y managers
        const metadata = getBranchEmailMetadataSync(data.branchId, 'complaint', createdComplaint.id);
        
        await sendEmail({
          to: data.email,
          subject: `✅ Queja Registrada - ID: ${createdComplaint.id}`,
          html: emailHtml,
          from: {
            name: emailConfig.fromName,
            address: emailConfig.fromAddress
          },
          metadata
        });

        console.log('✅ Email de confirmación enviado exitosamente');
      } catch (emailError) {
        console.error('❌ Error enviando email de confirmación:', emailError);
        // No mostramos error al usuario ya que la queja se registró exitosamente
      }
      
      toast({
        title: "¡Queja registrada exitosamente!",
        description: `Tu ID de queja es: ${createdComplaint.id}. Te hemos enviado un email de confirmación.`,
      });

    } catch (error: any) {
      console.error('❌ Error en ComplaintForm:', error);
      toast({
        title: "Error al registrar la queja",
        description: error.message || "Por favor intenta nuevamente",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset();
    setUploadedImageUrls([]);
    setSubmitted(false);
    setComplaintId('');
    setHasAttemptedSubmit(false);
  };

  if (submitted) {
    return (
      <Card className="siclo-card border-emerald-200 w-full max-w-full overflow-hidden shadow-sm">
        <CardContent className="pt-6 px-4 sm:px-6">
          <div className="text-center">
            <div className="mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" /> 
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3">
              ¡Queja Registrada Exitosamente!
            </h3>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 max-w-full overflow-hidden">
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-2">Tu ID de queja es</p>
              <div className="bg-white rounded-md py-2 px-2 sm:px-4 max-w-full overflow-hidden border border-emerald-200">
                <p className="font-mono text-base sm:text-xl font-semibold text-emerald-800 break-all">
                  {complaintId}
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 leading-relaxed px-2">
              Hemos enviado un correo de confirmación a tu email con todos los detalles.
              <br />
              <span className="font-medium text-slate-700">El manager del local ha sido notificado</span> y pronto recibirás una respuesta.
            </p>
            <Button 
              onClick={resetForm} 
              variant="outline" 
              className="w-full sm:w-auto border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium"
            >
              Registrar Nueva Queja
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="siclo-card w-full max-w-full overflow-hidden border-slate-200 shadow-sm">
      <CardContent className="pt-6 px-4 sm:px-6">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">Registrar Nueva Queja</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Describe detalladamente tu experiencia. Tu retroalimentación es importante para nosotros.
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-slate-800">
                Nombre Completo *
              </Label>
              <Input
                id="fullName"
                {...register('fullName', { required: 'El nombre es requerido' })}
                placeholder="Tu nombre completo"
                className="w-full border-slate-300 focus:border-siclo-green focus:ring-siclo-green/20 text-sm"
              />
              {errors.fullName && (
                <p className="text-xs sm:text-sm text-red-600 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-800">
                Correo Electrónico *
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'El correo es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo electrónico inválido'
                  }
                })}
                placeholder="tu@email.com"
                className="w-full border-slate-300 focus:border-siclo-green focus:ring-siclo-green/20 text-sm"
              />
              {errors.email && (
                <p className="text-xs sm:text-sm text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Location and Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-800">Local *</Label>
              <Select 
                onValueChange={(value) => setValue('branchId', value)}
                value={selectedBranch}
              >
                <SelectTrigger className="w-full border-slate-300 focus:border-siclo-green focus:ring-siclo-green/20 text-sm">
                  <SelectValue placeholder="Selecciona un local" />
                </SelectTrigger>
                <SelectContent>
                  {branchesLoading ? (
                    <SelectItem value="loading" disabled>
                      <span className="text-slate-500">Cargando locales...</span>
                    </SelectItem>
                  ) : (
                    branches.map((branch) => (
                      <SelectItem 
                        key={branch.id} 
                        value={branch.id}
                      >
                        <div className="select-item-content">
                          <span className="select-item-title font-medium text-slate-800">{branch.name}</span>
                          <span className="select-item-subtitle text-slate-600">{branch.address}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {hasAttemptedSubmit && !selectedBranch && (
                <p className="text-xs sm:text-sm text-red-600 font-medium">Debes seleccionar un local</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-800">Tipo de Observación *</Label>
              <Select 
                onValueChange={(value) => setValue('observationType', value)}
                value={selectedObservationType}
              >
                <SelectTrigger className="w-full border-slate-300 focus:border-siclo-green focus:ring-siclo-green/20 text-sm">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {OBSERVATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      <span className="font-medium text-slate-800">{type}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasAttemptedSubmit && !selectedObservationType && (
                <p className="text-xs sm:text-sm text-red-600 font-medium">Debes seleccionar un tipo</p>
              )}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-800">Prioridad *</Label>
            <Select 
              onValueChange={(value) => setValue('priority', value as ComplaintPriority)}
              value={selectedPriority}
            >
              <SelectTrigger className="w-full border-slate-300 focus:border-siclo-green focus:ring-siclo-green/20 text-sm">
                <SelectValue placeholder="Selecciona la prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ComplaintPriority.HIGH}>
                  <span className="font-medium text-red-700">🔴 Alta</span>
                </SelectItem>
                <SelectItem value={ComplaintPriority.MEDIUM}>
                  <span className="font-medium text-orange-700">🟡 Media</span>
                </SelectItem>
                <SelectItem value={ComplaintPriority.LOW}>
                  <span className="font-medium text-green-700">🟢 Baja</span>
                </SelectItem>
              </SelectContent>
            </Select>
            {hasAttemptedSubmit && !selectedPriority && (
              <p className="text-xs sm:text-sm text-red-600 font-medium">Debes seleccionar una prioridad</p>
            )}
          </div>

          {/* Detail */}
          <div className="space-y-2">
            <Label htmlFor="detail" className="text-sm font-medium text-slate-800">
              Detalle de la Queja *
            </Label>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Describe detalladamente el problema o sugerencia que quieres reportar
            </p>
            <Textarea
              id="detail"
              {...register('detail', { 
                required: 'El detalle es requerido',
                minLength: {
                  value: 20,
                  message: 'El detalle debe tener al menos 20 caracteres'
                }
              })}
              placeholder="Describe detalladamente tu queja o sugerencia..."
              className="min-h-20 sm:min-h-24 w-full border-slate-300 focus:border-siclo-green focus:ring-siclo-green/20 resize-y text-sm"
              rows={4}
            />
            {errors.detail && (
              <p className="text-xs sm:text-sm text-red-600 font-medium">{errors.detail.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-800">
                Adjuntar Imágenes (Opcional)
              </Label>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Puedes adjuntar hasta 5 imágenes para apoyar tu queja (máximo 3MB por imagen)
              </p>
            </div>
            <div className="w-full max-w-full overflow-hidden">
              <ImageUploader
                onImagesChange={handleImagesChange}
                maxImages={5}
                maxFileSize={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 border-t border-slate-200">
            <Button 
              type="submit" 
              className="w-full siclo-button bg-gradient-to-r from-siclo-orange via-siclo-purple to-siclo-deep-blue text-base sm:text-lg py-4 sm:py-6 font-medium shadow-md hover:shadow-lg transition-shadow" 
              disabled={isSubmitting || !selectedBranch || !selectedObservationType || !selectedPriority || branchesLoading}
            >
              {isSubmitting ? (
                <span className="text-white/90">Enviando queja...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Enviar Queja
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ComplaintForm;