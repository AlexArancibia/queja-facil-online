
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useBranchesStore } from '@/stores/branchesStore';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, User, Store, Key, Loader2, Phone } from 'lucide-react';
import { UserRole, type RegisterDto } from '@/types/api';

interface ManagerFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  company: string;
  branchId: string;
}

interface AddManagerFormProps {
  onManagerAdded: () => void;
}

const AddManagerForm = ({ onManagerAdded }: AddManagerFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Stores
  const { branches, loading: branchesLoading, fetchBranches } = useBranchesStore();
  const { register: registerUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<ManagerFormData>();

  useEffect(() => {
    if (!branches.length && !branchesLoading) {
      fetchBranches(true); // Solo sucursales activas
    }
  }, [fetchBranches, branches, branchesLoading]);

  const onSubmit = async (data: ManagerFormData) => {
    setIsSubmitting(true);
    
    try {
      const managerData: RegisterDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        company: data.company,
        role: UserRole.MANAGER,
        branchId: data.branchId
      };

      console.log('📝 Creando manager:', managerData);

      await registerUser(managerData);

      // Reset form
      reset();

      toast({
        title: "Manager agregado exitosamente",
        description: `${data.firstName} ${data.lastName} ha sido agregado al sistema`,
      });

      onManagerAdded();

    } catch (error: any) {
      console.error('❌ Error al crear manager:', error);
      toast({
        title: "Error al agregar manager",
        description: error.message || "Por favor intenta nuevamente",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (branchesLoading) {
    return (
      <Card className="siclo-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-siclo-green" />
            <span className="ml-2 text-siclo-dark">Cargando sucursales...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              <Label htmlFor="firstName" className="text-siclo-dark font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                Nombre *
              </Label>
              <Input
                id="firstName"
                {...register('firstName', { required: 'El nombre es requerido' })}
                placeholder="Nombre del manager"
                className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-siclo-dark font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                Apellido *
              </Label>
              <Input
                id="lastName"
                {...register('lastName', { required: 'El apellido es requerido' })}
                placeholder="Apellido del manager"
                className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-siclo-dark font-medium flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Teléfono *
              </Label>
              <Input
                id="phone"
                {...register('phone', { required: 'El teléfono es requerido' })}
                placeholder="+51 55 1234 5678"
                className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-siclo-dark font-medium flex items-center">
              <Store className="h-4 w-4 mr-2" />
              Empresa
            </Label>
            <Input
              id="company"
              {...register('company')}
              placeholder="Nombre de la empresa (opcional)"
              className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
            />
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

          <div className="space-y-2">
            <Label htmlFor="branchId" className="text-siclo-dark font-medium flex items-center">
              <Store className="h-4 w-4 mr-2" />
              Sucursal Asignada *
            </Label>
            <Select onValueChange={(value) => setValue('branchId', value)}>
              <SelectTrigger className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20">
                <SelectValue placeholder="Selecciona una sucursal" />
              </SelectTrigger>
              <SelectContent>
                {branches.filter(b => b.isActive).map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.branchId && (
              <p className="text-sm text-red-600">Debes seleccionar una sucursal</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full siclo-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Agregando Manager...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
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
