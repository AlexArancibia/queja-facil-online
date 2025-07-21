
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useBranchesStore } from '@/stores/branchesStore';
import { type Branch, type CreateBranchDto, type UpdateBranchDto } from '@/types/api';
import { 
  Store, 
  Plus, 
  MapPin, 
  Phone, 
  Clock, 
  Edit3, 
  Trash2,
  Save,
  X,
  Loader2
} from 'lucide-react';

const StoreManagement = () => {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    isActive: true
  });

  // Store
  const { 
    branches, 
    loading, 
    fetchBranches, 
    createBranch, 
    updateBranch, 
    deleteBranch 
  } = useBranchesStore();

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const saveBranch = async () => {
    if (!formData.name || !formData.address) {
      toast({
        title: "Error",
        description: "El nombre y dirección son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingBranch) {
        const updateData: UpdateBranchDto = {
          name: formData.name,
          address: formData.address,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          isActive: formData.isActive
        };
        await updateBranch(editingBranch, updateData);
        toast({
          title: "Sucursal actualizada",
          description: "Los datos de la sucursal han sido actualizados correctamente",
        });
      } else {
        const createData: CreateBranchDto = {
          name: formData.name,
          address: formData.address,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          isActive: formData.isActive
        };
        await createBranch(createData);
        toast({
          title: "Sucursal agregada",
          description: "La nueva sucursal ha sido registrada correctamente",
        });
      }
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar la sucursal",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      await deleteBranch(branchId);
      toast({
        title: "Sucursal eliminada",
        description: "La sucursal ha sido eliminada del sistema",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la sucursal",
        variant: "destructive",
      });
    }
  };

  const startEdit = (branch: Branch) => {
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone || '',
      email: branch.email || '',
      isActive: branch.isActive
    });
    setEditingBranch(branch.id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      isActive: true
    });
    setShowAddForm(false);
    setEditingBranch(null);
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
      {/* Add Store Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-siclo-dark">Gestión de Sucursales</h3>
        <Button
          onClick={() => setShowAddForm(true)}
          className="siclo-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Sucursal
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="siclo-card border-siclo-green/20">
          <CardHeader className="bg-gradient-to-r from-siclo-green/5 to-siclo-blue/5">
            <CardTitle className="text-siclo-dark flex items-center">
              <Store className="h-5 w-5 mr-2" />
              {editingBranch ? 'Editar Sucursal' : 'Agregar Nueva Sucursal'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-siclo-dark font-medium">Nombre de la Sucursal *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Siclo Centro"
                  className="border-siclo-light"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-siclo-dark font-medium">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej: +51 999 888 777"
                  className="border-siclo-light"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address" className="text-siclo-dark font-medium">Dirección *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección completa de la sucursal"
                className="border-siclo-light"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-siclo-dark font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sucursal@siclo.com"
                className="border-siclo-light"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-siclo-light"
              />
              <Label htmlFor="isActive" className="text-siclo-dark font-medium">
                Sucursal Activa
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={saveBranch} className="siclo-button">
                <Save className="h-4 w-4 mr-2" />
                {editingBranch ? 'Actualizar' : 'Guardar'}
              </Button>
              <Button onClick={resetForm} variant="outline" className="border-siclo-light">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stores List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <Card key={branch.id} className="siclo-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <Store className="h-5 w-5 text-siclo-green" />
                  <CardTitle className="text-lg text-siclo-dark">{branch.name}</CardTitle>
                </div>
                <Badge 
                  variant={branch.isActive ? "default" : "secondary"}
                  className={branch.isActive ? "bg-siclo-green/10 text-siclo-green" : "bg-gray-100 text-gray-600"}
                >
                  {branch.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-siclo-blue mt-0.5" />
                <p className="text-sm text-siclo-dark/70">{branch.address}</p>
              </div>
              
              {branch.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-siclo-blue" />
                  <p className="text-sm text-siclo-dark/70">{branch.phone}</p>
                </div>
              )}

              {branch.email && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-siclo-blue" />
                  <p className="text-sm text-siclo-dark/70">{branch.email}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => startEdit(branch)}
                  variant="outline"
                  size="sm"
                  className="border-siclo-green/30 text-siclo-green hover:bg-siclo-green hover:text-white"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  onClick={() => handleDeleteBranch(branch.id)}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {branches.length === 0 && !loading && (
        <Card className="siclo-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <Store className="h-12 w-12 text-siclo-green/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-siclo-dark mb-2">
                No hay sucursales registradas
              </h3>
              <p className="text-siclo-dark/60">
                Comienza agregando la primera sucursal al sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StoreManagement;
