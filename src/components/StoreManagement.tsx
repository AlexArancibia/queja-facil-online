
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useBranchesStore } from '@/stores/branchesStore';
import { type Branch, type CreateBranchDto, type UpdateBranchDto } from '@/types/api';
import { 
  Store, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Edit, 
  Trash2,
  Loader2,
  MoreHorizontal,
  Building2
} from 'lucide-react';
import { useForm } from 'react-hook-form';

interface BranchFormData {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

const StoreManagement = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Store
  const { 
    branches, 
    loading, 
    fetchBranches, 
    createBranch, 
    updateBranch, 
    deleteBranch 
  } = useBranchesStore();

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<BranchFormData>({
    defaultValues: {
      isActive: true
    }
  });

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const onSubmit = async (data: BranchFormData) => {
    try {
      if (editingBranch) {
        const updateData: UpdateBranchDto = {
          name: data.name,
          address: data.address,
          phone: data.phone || undefined,
          email: data.email || undefined,
          isActive: data.isActive
        };
        await updateBranch(editingBranch.id, updateData);
        toast({
          title: "Sucursal actualizada",
          description: "Los datos de la sucursal se han actualizado correctamente",
        });
      } else {
        const createData: CreateBranchDto = {
          name: data.name,
          address: data.address,
          phone: data.phone || undefined,
          email: data.email || undefined,
          isActive: data.isActive
        };
        await createBranch(createData);
        toast({
          title: "Sucursal agregada",
          description: "La nueva sucursal se ha registrado correctamente en el sistema",
        });
      }
      
      setIsDialogOpen(false);
      setEditingBranch(null);
      reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la sucursal",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setValue('name', branch.name);
    setValue('address', branch.address);
    setValue('phone', branch.phone || '');
    setValue('email', branch.email || '');
    setValue('isActive', branch.isActive);
    setIsDialogOpen(true);
  };

  const handleDelete = async (branchId: string, branchName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la sucursal "${branchName}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteBranch(branchId);
        toast({
          title: "Sucursal eliminada",
          description: `${branchName} ha sido eliminada del sistema`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "No se pudo eliminar la sucursal",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-siclo-green" />
        <span className="ml-2 text-siclo-dark">Cargando sucursales...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header optimizado para móvil y desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-siclo-light/30">
        <div>
          <h2 className="text-xl font-bold text-siclo-dark flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Gestión de Sucursales
          </h2>
          <p className="text-sm text-siclo-dark/70 mt-1">
            Administra las sucursales del sistema ({branches.length} sucursales)
          </p>
        </div>
        <Button 
          className="bg-siclo-green text-white hover:bg-siclo-green/90 w-full sm:w-auto" 
          onClick={() => {
            setEditingBranch(null);
            reset();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Sucursal
        </Button>
      </div>

      <Card className="siclo-card overflow-hidden">
        <CardContent className="p-0">
          {branches.length > 0 ? (
            <>
              {/* Vista móvil - Cards */}
              <div className="lg:hidden">
                <div className="space-y-3 p-4">
                  {branches.map((branch) => (
                    <Card key={branch.id} className="border border-siclo-light/50 hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header de la sucursal */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="flex-shrink-0 p-2 bg-siclo-green/10 rounded-lg">
                                <Store className="h-5 w-5 text-siclo-green" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="font-semibold text-siclo-dark truncate">{branch.name}</p>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    branch.isActive ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-gray-300 text-gray-600 bg-gray-50'
                                  }`}
                                >
                                  {branch.isActive ? 'Activa' : 'Inactiva'}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(branch); }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => { e.stopPropagation(); handleDelete(branch.id, branch.name); }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Información de la sucursal */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start text-siclo-dark/70">
                              <MapPin className="h-3 w-3 mr-2 flex-shrink-0 text-siclo-blue mt-0.5" />
                              <span className="text-xs leading-relaxed">{branch.address}</span>
                            </div>
                            {branch.phone && (
                              <div className="flex items-center text-siclo-dark/70">
                                <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                                <span className="text-xs">{branch.phone}</span>
                              </div>
                            )}
                            {branch.email && (
                              <div className="flex items-center text-siclo-dark/70">
                                <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                                <span className="truncate text-xs">{branch.email}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <div className="text-xs text-siclo-dark/40">
                              {new Date(branch.createdAt).toLocaleDateString('es-ES')}
                            </div>
                            <div className="text-xs text-siclo-green font-medium">
                              {new Date(branch.updatedAt).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Vista desktop - Tabla */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold text-siclo-dark">Sucursal</TableHead>
                      <TableHead className="font-semibold text-siclo-dark">Dirección</TableHead>
                      <TableHead className="font-semibold text-siclo-dark">Contacto</TableHead>
                      <TableHead className="font-semibold text-siclo-dark">Estado</TableHead>
                      <TableHead className="font-semibold text-siclo-dark">Creada</TableHead>
                      <TableHead className="w-[100px] font-semibold text-siclo-dark">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 p-2 bg-siclo-green/10 rounded-lg">
                              <Store className="h-4 w-4 text-siclo-green" />
                            </div>
                            <div>
                              <p className="font-medium text-siclo-dark">{branch.name}</p>
                              <p className="text-sm text-siclo-dark/60">{branch.email || 'Sin email'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start text-sm text-siclo-dark/70 max-w-[200px]">
                            <MapPin className="h-3 w-3 mr-1 text-siclo-blue mt-0.5 flex-shrink-0" />
                            <span className="truncate">{branch.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {branch.phone && (
                            <div className="flex items-center text-sm text-siclo-dark/70">
                              <Phone className="h-3 w-3 mr-1" />
                              {branch.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              branch.isActive 
                                ? 'border-emerald-300 text-emerald-700 bg-emerald-50' 
                                : 'border-gray-300 text-gray-600 bg-gray-50'
                            }`}
                          >
                            {branch.isActive ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-siclo-dark/60">
                            {new Date(branch.createdAt).toLocaleDateString('es-ES')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem onClick={() => handleEdit(branch)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(branch.id, branch.name)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center text-siclo-dark/60 py-16">
              <Store className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No hay sucursales registradas</h3>
              <p className="text-sm text-siclo-dark/50 mb-6">
                Comienza agregando la primera sucursal al sistema
              </p>
              <Button 
                className="bg-siclo-green text-white hover:bg-siclo-green/90" 
                onClick={() => {
                  setEditingBranch(null);
                  reset();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Sucursal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de formulario */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-siclo-dark text-xl">
              <Store className="h-6 w-6 mr-3 text-siclo-green" />
              {editingBranch ? 'Editar Sucursal' : 'Agregar Sucursal'}
            </DialogTitle>
            <DialogDescription className="text-siclo-dark/70">
              {editingBranch 
                ? 'Modifica los datos de la sucursal' 
                : 'Completa la información de la nueva sucursal'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-siclo-dark font-medium flex items-center">
                  <Store className="h-4 w-4 mr-2" />
                  Nombre de la Sucursal *
                </Label>
                <Input
                  id="name"
                  {...register('name', { required: 'El nombre es requerido' })}
                  placeholder="Ej: Siclo Centro"
                  className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-siclo-dark font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+51 999 888 777"
                  className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-siclo-dark font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Dirección *
              </Label>
              <Textarea
                id="address"
                {...register('address', { required: 'La dirección es requerida' })}
                placeholder="Dirección completa de la sucursal"
                className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
                rows={3}
              />
              {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-siclo-dark font-medium flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="sucursal@siclo.com"
                className="border-siclo-light focus:border-siclo-green focus:ring-siclo-green/20"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked as boolean)}
              />
              <Label htmlFor="isActive" className="text-siclo-dark font-medium">
                Sucursal activa
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 siclo-button">
                <Plus className="h-4 w-4 mr-2" />
                {editingBranch ? 'Actualizar Sucursal' : 'Agregar Sucursal'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingBranch(null);
                  reset();
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreManagement;
