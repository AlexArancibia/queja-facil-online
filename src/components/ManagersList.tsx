
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useManagersStore, type Manager } from '@/stores/managersStore';
import { MOCK_STORES } from '@/types/complaint';
import { Edit, Trash2, UserCheck, UserX, Phone, Mail, Building2 } from 'lucide-react';

const ManagersList = () => {
  const { managers, loading, fetchManagers, updateManager, deleteManager, toggleManagerStatus } = useManagersStore();
  const { toast } = useToast();
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [editForm, setEditForm] = useState<Partial<Manager>>({});

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleEdit = (manager: Manager) => {
    setEditingManager(manager);
    setEditForm({ ...manager });
  };

  const handleSaveEdit = async () => {
    if (!editingManager || !editForm.name || !editForm.email) return;

    try {
      await updateManager(editingManager.id, editForm);
      toast({
        title: "Manager actualizado",
        description: "Los datos del manager han sido actualizados exitosamente",
      });
      setEditingManager(null);
      setEditForm({});
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el manager",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este manager?')) return;

    try {
      await deleteManager(id);
      toast({
        title: "Manager eliminado",
        description: "El manager ha sido eliminado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el manager",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleManagerStatus(id);
      toast({
        title: "Estado actualizado",
        description: "El estado del manager ha sido actualizado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  };

  const getStoreNames = (storeIds: string[]) => {
    return storeIds.map(id => {
      const store = MOCK_STORES.find(s => s.id === id);
      return store?.name || id;
    }).join(', ');
  };

  if (loading) {
    return (
      <Card className="siclo-card">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-siclo-green"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="siclo-card">
      <CardHeader>
        <CardTitle className="text-siclo-dark">Managers Existentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {managers.map((manager) => (
            <div key={manager.id} className="border border-siclo-light rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-siclo-dark">{manager.name}</h4>
                    <Badge 
                      variant={manager.isActive ? "default" : "secondary"}
                      className={manager.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}
                    >
                      {manager.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-siclo-dark/70">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {manager.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {manager.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {manager.company || 'Sin asignar'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(manager)}
                        className="border-siclo-green text-siclo-green hover:bg-siclo-green hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Manager</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-name">Nombre</Label>
                          <Input
                            id="edit-name"
                            value={editForm.name || ''}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-email">Email</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={editForm.email || ''}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-phone">Teléfono</Label>
                          <Input
                            id="edit-phone"
                            value={editForm.phone || ''}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Empresa</Label>
                          <Input
                            value={editForm.company || ''}
                            onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                            placeholder="Empresa o división"
                          />
                        </div>
                        <Button onClick={handleSaveEdit} className="w-full siclo-button">
                          Guardar Cambios
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(manager.id)}
                    className={`border-${manager.isActive ? 'amber' : 'emerald'}-500 text-${manager.isActive ? 'amber' : 'emerald'}-600 hover:bg-${manager.isActive ? 'amber' : 'emerald'}-50`}
                  >
                    {manager.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(manager.id)}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {managers.length === 0 && (
            <div className="text-center py-8 text-siclo-dark/60">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay managers registrados</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagersList;
