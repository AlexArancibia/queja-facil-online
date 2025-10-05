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
import { useAreasStore } from '@/stores/areasStore';
import { useEmailStore } from '@/stores/emailStore';
import { ImageUploader } from '@/components/ImageUploader';
import { generateComplaintConfirmationEmail } from '@/lib/emailTemplates';
import { emailConfig } from '@/lib/envConfig';
import { getBranchEmailMetadataSync, getGeneralComplaintEmailMetadata } from '@/lib/emailHelpers';

interface ComplaintFormData {
  fullName: string;
  email: string;
  branchId: string;
  areaId?: string;
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
  const { areas, fetchAreas, loading: areasLoading } = useAreasStore();
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
    // Fetch active branches and areas when component mounts
    const loadData = async () => {
      try {
        // Only fetch if we don't have data and we're not already loading
        if (branches.length === 0 && !branchesLoading) {
          await fetchBranches(true);
        }
        if (areas.length === 0 && !areasLoading) {
          await fetchAreas(true);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };

    loadData();
  }, []); // Empty dependency array to run only once

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
        areaId: data.areaId,
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
        const branchName = selectedBranchData?.name || 'Todas las sucursales';
        
        console.log('📧 INICIANDO ENVÍO DE EMAIL DE CONFIRMACIÓN');
        console.log('📋 Datos de la queja:', {
          id: createdComplaint.id,
          fullName: data.fullName,
          email: data.email,
          branchId: data.branchId,
          branchName: branchName,
          observationType: data.observationType,
          priority: data.priority
        });
        
        const emailHtml = generateComplaintConfirmationEmail(createdComplaint, branchName);
        
        // Obtener metadata según si hay sucursal o no
        console.log('🔍 Obteniendo metadata de email...');
        const metadata = data.branchId 
          ? await getBranchEmailMetadataSync(data.branchId, 'complaint', createdComplaint.id)
          : await getGeneralComplaintEmailMetadata('complaint', createdComplaint.id);
        
        console.log('📊 Metadata obtenida:', {
          branchId: metadata.branchId,
          branchName: metadata.branchName,
          type: metadata.type,
          entityId: metadata.entityId,
          managersCount: metadata.managers?.length || 0,
          managers: metadata.managers?.map(m => ({ name: m.name, email: m.email })) || []
        });
        
        const emailData = {
          to: data.email,
          subject: `✅ Sugerencia Registrada - ID: ${createdComplaint.id}`,
          html: emailHtml,
          from: {
            name: emailConfig.fromName,
            address: emailConfig.fromAddress
          },
          metadata
        };
        
        console.log('📤 Enviando email con los siguientes datos:', {
          to: emailData.to,
          subject: emailData.subject,
          from: emailData.from,
          hasMetadata: !!emailData.metadata,
          managersInMetadata: emailData.metadata?.managers?.length || 0
        });
        
        await sendEmail(emailData);

        console.log('✅ Email de confirmación enviado exitosamente');
        console.log('📬 Destinatario principal:', data.email);
        console.log('👥 Copias enviadas a:', metadata.managers?.map(m => `${m.name} (${m.email})`).join(', ') || 'Ninguna');
        console.log('🏢 Sucursal:', branchName);
        console.log('📝 Motivo: Confirmación de queja registrada');
      } catch (emailError) {
        console.error('❌ Error enviando email de confirmación:', emailError);
        // No mostramos error al usuario ya que la queja se registró exitosamente
      }
      
      toast({
        title: "¡Sugerencia registrada exitosamente!",
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
              ¡Sugerencia Registrada Exitosamente!
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
              Registrar Nueva Sugerencia
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
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">Registrar Nueva Sugerencia</h2>
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

          {/* Local y Área */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-800">Local</Label>
              <Select 
                onValueChange={(value) => setValue('branchId', value === 'all' ? undefined : value)}
                value={selectedBranch || 'all'}
              >
                <SelectTrigger className="w-full border-slate-300 focus:border-siclo-green focus:ring-siclo-green/20 text-sm">
                  <SelectValue placeholder="Selecciona un local" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="font-medium text-slate-800">🌐 Todas las sucursales</span>
                  </SelectItem>
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
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-800">Área</Label>
              <Select 
                onValueChange={(value) => setValue('areaId', value === 'none' ? undefined : value)}
                value={watch('areaId') || 'none'}
              >
                <SelectTrigger className="w-full border-slate-300 focus:border-siclo-green focus:ring-siclo-green/20 text-sm">
                  <SelectValue placeholder="Selecciona un área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-slate-500">Sin área específica</span>
                  </SelectItem>
                  {areasLoading ? (
                    <SelectItem value="loading" disabled>
                      <span className="text-slate-500">Cargando áreas...</span>
                    </SelectItem>
                  ) : (
                    areas.filter(area => area.isActive).map((area) => (
                      <SelectItem 
                        key={area.id} 
                        value={area.id}
                      >
                        <span className="font-medium text-slate-800">{area.name}</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tipo de Observación y Prioridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
          </div>

          {/* Detail */}
          <div className="space-y-2">
            <Label htmlFor="detail" className="text-sm font-medium text-slate-800">
              Detalle de la Sugerencia *
            </Label>
  
            <Textarea
              id="detail"
              {...register('detail', { 
                required: 'El detalle es requerido',
                minLength: {
                  value: 20,
                  message: 'El detalle debe tener al menos 20 caracteres'
                }
              })}
              placeholder="Describe detalladamente tu sugerencia..."
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
                Puedes adjuntar hasta 5 imágenes para apoyar tu sugerencia (máximo 3MB por imagen)
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
              disabled={isSubmitting || !selectedObservationType || !selectedPriority || branchesLoading}
            >
              {isSubmitting ? (
                <span className="text-white/90">Enviando queja...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Enviar Sugerencia
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