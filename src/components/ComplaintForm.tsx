
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { OBSERVATION_TYPES, MOCK_STORES, type Complaint } from '@/types/complaint';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Send, CheckCircle } from 'lucide-react';

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
      setFiles(Array.from(e.target.files));
    }
  };

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);
    
    try {
      // Generate unique ID
      const newComplaintId = `QJ-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
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
    setSubmitted(false);
    setComplaintId('');
  };

  if (submitted) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              ¡Queja Registrada Exitosamente!
            </h3>
            <p className="text-green-700 mb-4">
              Tu ID de queja es: <strong className="font-mono text-lg">{complaintId}</strong>
            </p>
            <p className="text-sm text-green-600 mb-4">
              Hemos enviado un correo de confirmación a tu email con todos los detalles.
              El manager del local ha sido notificado y pronto recibirás una respuesta.
            </p>
            <Button onClick={resetForm} variant="outline">
              Registrar Nueva Queja
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="fullName">Nombre Completo *</Label>
          <Input
            id="fullName"
            {...register('fullName', { required: 'El nombre es requerido' })}
            placeholder="Tu nombre completo"
            className="mt-1"
          />
          {errors.fullName && (
            <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Correo Electrónico *</Label>
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
            className="mt-1"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="store">Local *</Label>
          <Select onValueChange={(value) => setValue('store', value)}>
            <SelectTrigger className="mt-1">
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
            <p className="text-sm text-red-600 mt-1">Debes seleccionar un local</p>
          )}
        </div>

        <div>
          <Label htmlFor="observationType">Tipo de Observación *</Label>
          <Select onValueChange={(value) => setValue('observationType', value)}>
            <SelectTrigger className="mt-1">
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
            <p className="text-sm text-red-600 mt-1">Debes seleccionar un tipo</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="priority">Prioridad *</Label>
        <Select onValueChange={(value) => setValue('priority', value as 'Alta' | 'Media' | 'Baja')}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecciona la prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alta">🔴 Alta</SelectItem>
            <SelectItem value="Media">🟡 Media</SelectItem>
            <SelectItem value="Baja">🟢 Baja</SelectItem>
          </SelectContent>
        </Select>
        {!selectedPriority && (
          <p className="text-sm text-red-600 mt-1">Debes seleccionar una prioridad</p>
        )}
      </div>

      <div>
        <Label htmlFor="detail">Detalle de la Queja *</Label>
        <Textarea
          id="detail"
          {...register('detail', { required: 'El detalle es requerido' })}
          placeholder="Describe detalladamente tu queja o sugerencia..."
          className="mt-1 min-h-24"
        />
        {errors.detail && (
          <p className="text-sm text-red-600 mt-1">{errors.detail.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="attachments">Adjuntar Imágenes (Opcional)</Label>
        <div className="mt-1">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Haz clic para subir</span> o arrastra archivos
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB cada uno)</p>
            </div>
            <input
              id="attachments"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {files.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Archivos seleccionados:</p>
              <ul className="text-sm text-gray-600">
                {files.map((file, index) => (
                  <li key={index}>• {file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting || !selectedStore || !selectedObservationType || !selectedPriority}
      >
        {isSubmitting ? (
          <>Enviando...</>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Enviar Queja
          </>
        )}
      </Button>
    </form>
  );
};

export default ComplaintForm;
