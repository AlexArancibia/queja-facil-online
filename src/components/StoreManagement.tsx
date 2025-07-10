import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { MOCK_STORES } from '@/types/complaint';
import { 
  Store, 
  Plus, 
  MapPin, 
  Phone, 
  Clock, 
  Edit3, 
  Trash2,
  Save,
  X
} from 'lucide-react';

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  hours: string;
  status: 'active' | 'inactive';
}

const StoreManagement = () => {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStore, setEditingStore] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    manager: '',
    hours: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = () => {
    // First load any custom stores from localStorage
    const customStores = JSON.parse(localStorage.getItem('stores') || '[]');
    
    // Convert MOCK_STORES to the expected format and combine with custom stores
    const mockStoresFormatted = MOCK_STORES.map(store => ({
      id: store.id,
      name: store.name,
      address: store.address || 'Dirección no especificada',
      phone: '',
      manager: '',
      hours: '',
      status: 'active' as 'active' | 'inactive'
    }));

    // Merge existing stores, avoiding duplicates
    const existingIds = customStores.map((s: Store) => s.id);
    const newMockStores = mockStoresFormatted.filter(store => !existingIds.includes(store.id));
    
    const allStores = [...customStores, ...newMockStores];
    setStores(allStores);
    
    // Save the merged stores back to localStorage
    localStorage.setItem('stores', JSON.stringify(allStores));
  };

  const generateStoreId = () => {
    return `store-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  };

  const saveStore = () => {
    if (!formData.name || !formData.address) {
      toast({
        title: "Error",
        description: "El nombre y dirección son obligatorios",
        variant: "destructive",
      });
      return;
    }

    const updatedStores = [...stores];
    
    if (editingStore) {
      const index = updatedStores.findIndex(s => s.id === editingStore);
      if (index !== -1) {
        updatedStores[index] = { ...updatedStores[index], ...formData };
      }
      toast({
        title: "Local actualizado",
        description: "Los datos del local han sido actualizados correctamente",
      });
    } else {
      const newStore: Store = {
        id: generateStoreId(),
        ...formData
      };
      updatedStores.push(newStore);
      toast({
        title: "Local agregado",
        description: "El nuevo local ha sido registrado correctamente",
      });
    }

    localStorage.setItem('stores', JSON.stringify(updatedStores));
    setStores(updatedStores);
    resetForm();
  };

  const deleteStore = (storeId: string) => {
    const updatedStores = stores.filter(s => s.id !== storeId);
    localStorage.setItem('stores', JSON.stringify(updatedStores));
    setStores(updatedStores);
    toast({
      title: "Local eliminado",
      description: "El local ha sido eliminado del sistema",
    });
  };

  const startEdit = (store: Store) => {
    setFormData({
      name: store.name,
      address: store.address,
      phone: store.phone,
      manager: store.manager,
      hours: store.hours,
      status: store.status
    });
    setEditingStore(store.id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      manager: '',
      hours: '',
      status: 'active'
    });
    setShowAddForm(false);
    setEditingStore(null);
  };

  return (
    <div className="space-y-6">
      {/* Add Store Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-siclo-dark">Gestión de Locales</h3>
        <Button
          onClick={() => setShowAddForm(true)}
          className="siclo-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Local
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="siclo-card border-siclo-green/20">
          <CardHeader className="bg-gradient-to-r from-siclo-green/5 to-siclo-blue/5">
            <CardTitle className="text-siclo-dark flex items-center">
              <Store className="h-5 w-5 mr-2" />
              {editingStore ? 'Editar Local' : 'Agregar Nuevo Local'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-siclo-dark font-medium">Nombre del Local *</Label>
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
                placeholder="Dirección completa del local"
                className="border-siclo-light"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manager" className="text-siclo-dark font-medium">Manager Asignado</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="Nombre del manager"
                  className="border-siclo-light"
                />
              </div>
              <div>
                <Label htmlFor="hours" className="text-siclo-dark font-medium">Horario de Atención</Label>
                <Input
                  id="hours"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="Ej: Lun-Vie 9:00-18:00"
                  className="border-siclo-light"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={saveStore} className="siclo-button">
                <Save className="h-4 w-4 mr-2" />
                {editingStore ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stores List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <Card key={store.id} className="siclo-card hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-siclo-green to-siclo-blue rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-siclo-dark">{store.name}</h4>
                    <Badge 
                      className={store.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                      }
                    >
                      {store.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(store)}
                    className="border-siclo-green/30 text-siclo-green hover:bg-siclo-green hover:text-white"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteStore(store.id)}
                    className="border-red-300 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center text-siclo-dark/70">
                  <MapPin className="h-4 w-4 mr-2 text-siclo-blue" />
                  <span className="truncate">{store.address}</span>
                </div>
                
                {store.phone && (
                  <div className="flex items-center text-siclo-dark/70">
                    <Phone className="h-4 w-4 mr-2 text-siclo-green" />
                    <span>{store.phone}</span>
                  </div>
                )}
                
                {store.hours && (
                  <div className="flex items-center text-siclo-dark/70">
                    <Clock className="h-4 w-4 mr-2 text-siclo-blue" />
                    <span>{store.hours}</span>
                  </div>
                )}

                {store.manager && (
                  <div className="bg-siclo-light/50 rounded-lg p-2 mt-3">
                    <p className="text-xs text-siclo-dark/60 font-medium">Manager:</p>
                    <p className="text-sm text-siclo-dark font-medium">{store.manager}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {stores.length === 0 && (
          <div className="col-span-full text-center text-siclo-dark/60 py-12">
            <Store className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No hay locales registrados</p>
            <p className="text-sm">Agrega el primer local para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreManagement;
