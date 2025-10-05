import { useState, useEffect } from 'react';
import { useAreasStore } from '@/stores/areasStore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Building2, 
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Area } from '@/types/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const AreaManagement = () => {
  const { toast } = useToast();
  const { 
    areas, 
    loading, 
    error, 
    fetchAreas, 
    createArea, 
    updateArea, 
    deleteArea 
  } = useAreasStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const handleCreateArea = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del área es requerido",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createArea(formData);
      toast({
        title: "Área creada",
        description: "El área ha sido creada exitosamente",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al crear el área",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateArea = async () => {
    if (!selectedArea || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del área es requerido",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateArea(selectedArea.id, formData);
      toast({
        title: "Área actualizada",
        description: "El área ha sido actualizada exitosamente",
      });
      setIsEditDialogOpen(false);
      setSelectedArea(null);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al actualizar el área",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArea = async (area: Area) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el área "${area.name}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteArea(area.id);
        toast({
          title: "Área eliminada",
          description: `El área "${area.name}" ha sido eliminada exitosamente`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Error al eliminar el área",
          variant: "destructive"
        });
      }
    }
  };

  const handleEditArea = (area: Area) => {
    setSelectedArea(area);
    setFormData({
      name: area.name,
      description: area.description || '',
      isActive: area.isActive
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando áreas..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-siclo-light/30">
        <div>
          <h2 className="text-xl font-bold text-siclo-dark flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Gestión de Áreas
          </h2>
          <p className="text-sm text-siclo-dark/70 mt-1">
            Gestiona las áreas para categorizar sugerencias ({areas.length} áreas)
          </p>
        </div>
        <Button 
          className="bg-siclo-green text-white hover:bg-siclo-green/90 w-full sm:w-auto" 
          onClick={openCreateDialog}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Área
        </Button>
      </div>

      {/* Areas Table */}
      <Card className="siclo-card overflow-hidden">
        <CardContent className="p-0">
          {areas.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-siclo-dark">Área</TableHead>
                    <TableHead className="font-semibold text-siclo-dark">Descripción</TableHead>
                    <TableHead className="font-semibold text-siclo-dark">Estado</TableHead>
                    <TableHead className="font-semibold text-siclo-dark">Creado</TableHead>
                    <TableHead className="w-[100px] font-semibold text-siclo-dark">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {areas.map((area) => (
                    <TableRow key={area.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-siclo-dark">{area.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="text-sm text-siclo-dark/70 truncate" title={area.description}>
                            {area.description || 'Sin descripción'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            area.isActive 
                              ? 'border-emerald-300 text-emerald-700 bg-emerald-50' 
                              : 'border-red-300 text-red-700 bg-red-50'
                          }`}
                        >
                          {area.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-siclo-dark/60">
                          {new Date(area.createdAt).toLocaleDateString('es-ES')}
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
                            <DropdownMenuItem onClick={() => handleEditArea(area)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteArea(area)}
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
          ) : (
            <div className="text-center text-siclo-dark/60 py-16">
              <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No hay áreas registradas</h3>
              <p className="text-sm text-siclo-dark/50 mb-6">
                Comienza agregando áreas para categorizar las sugerencias
              </p>
              <Button 
                className="bg-siclo-green text-white hover:bg-siclo-green/90" 
                onClick={openCreateDialog}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Área
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Area Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-siclo-dark text-xl">
              <Plus className="h-6 w-6 mr-3 text-siclo-green" />
              Crear Nueva Área
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Agrega una nueva área para categorizar sugerencias
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 text-sm font-medium mb-1 block">Nombre del Área *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Recepción, Clases, Estacionamiento..."
                className="border-gray-300 focus:border-siclo-green focus:ring-siclo-green/20"
              />
            </div>

            <div>
              <Label className="text-gray-700 text-sm font-medium mb-1 block">Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe brevemente qué incluye esta área..."
                className="border-gray-300 focus:border-siclo-green focus:ring-siclo-green/20 min-h-20"
                rows={3}
              />
            </div>


            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className="flex items-center space-x-2"
              >
                {formData.isActive ? (
                  <ToggleRight className="h-4 w-4 text-emerald-600" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                )}
                <span>{formData.isActive ? 'Activa' : 'Inactiva'}</span>
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 justify-end">
            <Button 
              onClick={handleCreateArea} 
              disabled={isSubmitting || !formData.name.trim()}
              className="bg-siclo-green hover:bg-siclo-green/90 text-white"
            >
              {isSubmitting ? 'Creando...' : 'Crear Área'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Area Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-siclo-dark text-xl">
              <Edit className="h-6 w-6 mr-3 text-siclo-green" />
              Editar Área
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Modifica la información del área
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 text-sm font-medium mb-1 block">Nombre del Área *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Recepción, Clases, Estacionamiento..."
                className="border-gray-300 focus:border-siclo-green focus:ring-siclo-green/20"
              />
            </div>

            <div>
              <Label className="text-gray-700 text-sm font-medium mb-1 block">Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe brevemente qué incluye esta área..."
                className="border-gray-300 focus:border-siclo-green focus:ring-siclo-green/20 min-h-20"
                rows={3}
              />
            </div>


            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className="flex items-center space-x-2"
              >
                {formData.isActive ? (
                  <ToggleRight className="h-4 w-4 text-emerald-600" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                )}
                <span>{formData.isActive ? 'Activa' : 'Inactiva'}</span>
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 justify-end">
            <Button 
              onClick={handleUpdateArea} 
              disabled={isSubmitting || !formData.name.trim()}
              className="bg-siclo-green hover:bg-siclo-green/90 text-white"
            >
              {isSubmitting ? 'Actualizando...' : 'Actualizar Área'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AreaManagement;
