
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MOCK_STORES } from '@/types/complaint';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, User, Store, Key } from 'lucide-react';

interface ManagerFormData {
  name: string;
  email: string;
  password: string;
  stores: string[];
}

interface AddManagerFormProps {
  onManagerAdded: () => void;
}

const AddManagerForm = ({ onManagerAdded }: AddManagerFormProps) => {
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ManagerFormData>();

  const handleStoreToggle = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  const onSubmit = async (data: ManagerFormData) => {
    if (selectedStores.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un local",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get existing managers
      const existingManagers = JSON.parse(localStorage.getItem('managers') || '[]');
      
      // Check if email already exists
      if (existingManagers.some((m: any) => m.email === data.email)) {
        toast({
          title: "Error",
          description: "Ya existe un manager con este correo electrónico",
          variant: "destructive"
        });
        return;
      }

      // Create new manager
      const newManager = {
        id: `manager-${Date.now()}`,
        name: data.name,
        email: data.email,
        password: data.password, // In real app, this would be hashed
        role: 'manager',
        stores: selectedStores,
        createdAt: new Date()
      };

      // Save to localStorage
      existingManagers.push(newManager);
      localStorage.setItem('managers', JSON.stringify(existingManagers));

      // Reset form
      reset();
      setSelectedStores([]);

      toast({
        title: "Manager agregado exitosamente",
        description: `${data.name} ha sido agregado al sistema`,
      });

      onManagerAdded();

    } catch (error) {
      toast({
        title: "Error al agregar manager",
        description: "Por favor intenta nuevamente",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="siclo-card">
      <CardHeader className="bg-gradient-to-r from-siclo-green/10 to-siclo-blue/10">
        <CardTitle className="flex items-center text-siclo-dark">
          <UserPlus className="h-5 w-5 mr-2" />
          Agregar Nuevo Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-siclo-dark font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                Nombre Completo *
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'El nombre es requerido' })}
                placeholder="Nombre del manager"
                className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-siclo-dark font-medium flex items-center">
                <Mail className="h-4 w-4 mr-2" />
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
                placeholder="manager@siclo.com"
                className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-siclo-dark font-medium flex items-center">
              <Key className="h-4 w-4 mr-2" />
              Contraseña *
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password', { 
                required: 'La contraseña es requerida',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                }
              })}
              placeholder="Contraseña segura"
              className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-siclo-dark font-medium flex items-center">
              <Store className="h-4 w-4 mr-2" />
              Locales Asignados *
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MOCK_STORES.map((store) => (
                <div 
                  key={store.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedStores.includes(store.id)
                      ? 'border-siclo-green bg-siclo-green/10'
                      : 'border-siclo-light hover:border-siclo-green/50'
                  }`}
                  onClick={() => handleStoreToggle(store.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-siclo-dark">{store.name}</p>
                      <p className="text-sm text-siclo-dark/60">{store.address}</p>
                    </div>
                    <div className={`w-4 h-4 rounded border-2 ${
                      selectedStores.includes(store.id)
                        ? 'bg-siclo-green border-siclo-green'
                        : 'border-siclo-light'
                    }`}>
                      {selectedStores.includes(store.id) && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selectedStores.length === 0 && (
              <p className="text-sm text-red-600">Debes seleccionar al menos un local</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full siclo-button text-lg py-6" 
            disabled={isSubmitting || selectedStores.length === 0}
          >
            {isSubmitting ? (
              <>Agregando manager...</>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-3" />
                Agregar Manager
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddManagerForm;
