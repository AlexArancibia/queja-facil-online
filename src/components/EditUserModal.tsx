import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Store, Key, X } from 'lucide-react';
import { UserRole, type User as UserType } from '@/types/api';
import { useEffect } from 'react';

interface EditUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  newPassword?: string;
}

interface EditUserModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, userData: any) => Promise<void>;
}

const EditUserModal = ({ user, isOpen, onClose, onSave }: EditUserModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<EditUserFormData>();

  // Reset form when user changes
  useEffect(() => {
    if (user && isOpen) {
      reset();
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('email', user.email);
      setValue('phone', user.phone || '');
      setValue('company', user.company || '');
    }
  }, [user, isOpen, reset, setValue]);

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company
      };

      if (data.newPassword && data.newPassword.trim()) {
        updateData.newPassword = data.newPassword;
      }

      await onSave(user.id, updateData);
      onClose();
      reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar usuario",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-siclo-dark">
            <User className="h-5 w-5 mr-2" />
            Editar Usuario
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-siclo-dark font-medium">
                Nombre *
              </Label>
              <Input
                id="firstName"
                {...register('firstName', { required: 'El nombre es requerido' })}
                placeholder="Nombre"
                className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-siclo-dark font-medium">
                Apellido *
              </Label>
              <Input
                id="lastName"
                {...register('lastName', { required: 'El apellido es requerido' })}
                placeholder="Apellido"
                className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-siclo-dark font-medium flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Teléfono
            </Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+51 55 1234 5678"
              className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-siclo-dark font-medium flex items-center">
              <Store className="h-4 w-4 mr-2" />
              Empresa
            </Label>
            <Input
              id="company"
              {...register('company')}
              placeholder="Nombre de la empresa"
              className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-siclo-dark font-medium flex items-center">
              <Key className="h-4 w-4 mr-2" />
              Nueva Contraseña (opcional)
            </Label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword', {
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                }
              })}
              placeholder="Dejar vacío para mantener la actual"
              className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
            />
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-siclo-green hover:bg-siclo-green/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal; 