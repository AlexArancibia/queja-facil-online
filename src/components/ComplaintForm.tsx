
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { OBSERVATION_TYPES, MOCK_STORES, type Complaint } from '@/types/complaint';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Send, CheckCircle, X, FileImage } from 'lucide-react';

interface ComplaintFormData {
  fullName: string;
  email: string;
  store: string;
  observationType: string;
  detail: string;
  priority: 'Alta' | 'Media' | 'Baja';
}

const ComplaintForm = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState('');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ComplaintFormData>();

  const selectedStore = watch('store');
  const selectedObservationType = watch('observationType');
  const selectedPriority = watch('priority');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      // Generate previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);
    
    try {
      // Generate unique ID
      const newComplaintId = `SICLO-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Mock complaint creation
      const newComplaint: Complaint = {
        id: newComplaintId,
        ...data,
        status: 'Pendiente',
        attachments: files,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store in localStorage for demo
      const existingComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
      existingComplaints.push(newComplaint);
      localStorage.setItem('complaints', JSON.stringify(existingComplaints));

      console.log('Nueva queja registrada:', newComplaint);
      console.log('Archivos adjuntos:', files);

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500));

      setComplaintId(newComplaintId);
      setSubmitted(true);
      
      toast({
        title: "¡Queja registrada exitosamente!",
        description: `Tu ID de queja es: ${newComplaintId}`,
      });

    } catch (error) {
      toast({
        title: "Error al registrar la queja",
        description: "Por favor intenta nuevamente",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset();
    setFiles([]);
    setPreviews([]);
    setSubmitted(false);
    setComplaintId('');
  };

  if (submitted) {
    return (
      <Card className="siclo-card border-emerald-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-siclo-dark mb-3">
              ¡Queja Registrada Exitosamente!
            </h3>
            <div className="bg-siclo-light rounded-lg p-4 mb-6">
              <p className="text-siclo-dark font-medium mb-2">Tu ID de queja es:</p>
              <p className="font-mono text-xl font-bold text-siclo-blue bg-white rounded-md py-2 px-4 inline-block">
                {complaintId}
              </p>
            </div>
            <p className="text-siclo-dark/70 mb-6 leading-relaxed">
              Hemos enviado un correo de confirmación a tu email con todos los detalles.
              El manager del local ha sido notificado y pronto recibirás una respuesta.
            </p>
            <Button onClick={resetForm} variant="outline" className="border-siclo-green text-siclo-green hover:bg-siclo-green hover:text-white">
              Registrar Nueva Queja
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="siclo-card">
      <CardHeader className="bg-gradient-to-r from-siclo-green/10 to-siclo-blue/10 rounded-t-lg">
        <CardTitle className="text-siclo-dark text-xl">Registrar Nueva Queja</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-siclo-dark font-medium">Nombre Completo *</Label>
              <Input
                id="fullName"
                {...register('fullName', { required: 'El nombre es requerido' })}
                placeholder="Tu nombre completo"
                className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
              />
              {errors.fullName && (
                <p className="text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-siclo-dark font-medium">Correo Electrónico *</Label>
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
                className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-siclo-dark font-medium">Local *</Label>
              <Select onValueChange={(value) => setValue('store', value)}>
                <SelectTrigger className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20">
                  <SelectValue placeholder="Selecciona un local" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_STORES.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} - {store.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedStore && (
                <p className="text-sm text-red-600">Debes seleccionar un local</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-siclo-dark font-medium">Tipo de Observación *</Label>
              <Select onValueChange={(value) => setValue('observationType', value)}>
                <SelectTrigger className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {OBSERVATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedObservationType && (
                <p className="text-sm text-red-600">Debes seleccionar un tipo</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-siclo-dark font-medium">Prioridad *</Label>
            <Select onValueChange={(value) => setValue('priority', value as 'Alta' | 'Media' | 'Baja')}>
              <SelectTrigger className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20">
                <SelectValue placeholder="Selecciona la prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alta">🔴 Alta</SelectItem>
                <SelectItem value="Media">🟡 Media</SelectItem>
                <SelectItem value="Baja">🟢 Baja</SelectItem>
              </SelectContent>
            </Select>
            {!selectedPriority && (
              <p className="text-sm text-red-600">Debes seleccionar una prioridad</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="detail" className="text-siclo-dark font-medium">Detalle de la Queja *</Label>
            <Textarea
              id="detail"
              {...register('detail', { required: 'El detalle es requerido' })}
              placeholder="Describe detalladamente tu queja o sugerencia..."
              className="min-h-24 border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
            />
            {errors.detail && (
              <p className="text-sm text-red-600">{errors.detail.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-siclo-dark font-medium">Adjuntar Imágenes (Opcional)</Label>
            <div className="border-2 border-dashed border-siclo-light rounded-lg p-6 text-center hover:border-siclo-green transition-colors">
              <label className="cursor-pointer block">
                <Upload className="w-8 h-8 mx-auto mb-3 text-siclo-green" />
                <p className="text-siclo-dark font-medium mb-1">
                  Haz clic para subir imágenes
                </p>
                <p className="text-sm text-siclo-dark/60">PNG, JPG, JPEG (MAX. 5MB cada uno)</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            
            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-siclo-light"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      <FileImage className="w-3 h-3 inline mr-1" />
                      {files[index]?.name.substring(0, 10)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full siclo-button text-lg py-6" 
            disabled={isSubmitting || !selectedStore || !selectedObservationType || !selectedPriority}
          >
            {isSubmitting ? (
              <>Enviando queja...</>
            ) : (
              <>
                <Send className="w-5 h-5 mr-3" />
                Enviar Queja
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ComplaintForm;
