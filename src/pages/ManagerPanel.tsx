
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { type Complaint, MOCK_STORES } from '@/types/complaint';
import { 
  MessageSquareText, 
  LogOut, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  User,
  Store
} from 'lucide-react';

const ManagerPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      navigate('/login');
      return;
    }
    loadComplaints();
  }, [user, navigate]);

  const loadComplaints = () => {
    const allComplaints: Complaint[] = JSON.parse(localStorage.getItem('complaints') || '[]');
    
    // Filter complaints for manager's stores
    const managerComplaints = allComplaints.filter(complaint => 
      user?.stores?.includes(complaint.store)
    );
    
    setComplaints(managerComplaints);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'En proceso':
        return 'bg-blue-100 text-blue-800';
      case 'Resuelta':
        return 'bg-green-100 text-green-800';
      case 'Rechazada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStoreName = (storeId: string) => {
    const store = MOCK_STORES.find(s => s.id === storeId);
    return store ? store.name : storeId;
  };

  const handleStatusUpdate = () => {
    if (!selectedComplaint || !newStatus) return;

    const allComplaints: Complaint[] = JSON.parse(localStorage.getItem('complaints') || '[]');
    const updatedComplaints = allComplaints.map(complaint => {
      if (complaint.id === selectedComplaint.id) {
        return {
          ...complaint,
          status: newStatus as any,
          resolution: resolution || complaint.resolution,
          managerComments: resolution || complaint.managerComments,
          updatedAt: new Date()
        };
      }
      return complaint;
    });

    localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
    loadComplaints();
    setSelectedComplaint(null);
    setNewStatus('');
    setResolution('');

    toast({
      title: "Estado actualizado",
      description: "La queja ha sido actualizada exitosamente",
    });
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filterStatus === 'all') return true;
    return complaint.status === filterStatus;
  });

  const getStatusStats = () => {
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pendiente').length,
      inProgress: complaints.filter(c => c.status === 'En proceso').length,
      resolved: complaints.filter(c => c.status === 'Resuelta').length,
      rejected: complaints.filter(c => c.status === 'Rechazada').length
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MessageSquareText className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel Manager</h1>
                <p className="text-sm text-gray-600">Bienvenido, {user?.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <MessageSquareText className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">En Proceso</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Resueltas</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Rechazadas</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div>
                <Label>Estado</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En proceso">En proceso</SelectItem>
                    <SelectItem value="Resuelta">Resuelta</SelectItem>
                    <SelectItem value="Rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Quejas ({filteredComplaints.length})
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredComplaints.map((complaint) => (
                <Card 
                  key={complaint.id} 
                  className={`cursor-pointer transition-all ${
                    selectedComplaint?.id === complaint.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status}
                        </Badge>
                        <Badge className={getPriorityColor(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(complaint.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">{complaint.fullName}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Store className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{getStoreName(complaint.store)}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {complaint.observationType}: {complaint.detail}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredComplaints.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      <MessageSquareText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay quejas que coincidan con los filtros seleccionados</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Complaint Detail */}
          <div>
            {selectedComplaint ? (
              <Card>
                <CardHeader>
                  <CardTitle>Detalle de Queja</CardTitle>
                  <CardDescription>ID: {selectedComplaint.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Estado actual</Label>
                      <Badge className={getStatusColor(selectedComplaint.status)}>
                        {selectedComplaint.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Prioridad</Label>
                      <Badge className={getPriorityColor(selectedComplaint.priority)}>
                        {selectedComplaint.priority}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Cliente</Label>
                    <p className="font-medium">{selectedComplaint.fullName}</p>
                    <p className="text-sm text-gray-600">{selectedComplaint.email}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Local</Label>
                    <p>{getStoreName(selectedComplaint.store)}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                    <p>{selectedComplaint.observationType}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Detalle</Label>
                    <p className="bg-gray-50 p-3 rounded-md text-sm">{selectedComplaint.detail}</p>
                  </div>

                  {selectedComplaint.resolution && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Resolución actual</Label>
                      <p className="bg-green-50 p-3 rounded-md text-sm">{selectedComplaint.resolution}</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Actualizar Estado</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Nuevo Estado</Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pendiente">Pendiente</SelectItem>
                            <SelectItem value="En proceso">En proceso</SelectItem>
                            <SelectItem value="Resuelta">Resuelta</SelectItem>
                            <SelectItem value="Rechazada">Rechazada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Comentario/Resolución</Label>
                        <Textarea
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          placeholder="Ingresa comentarios o detalles de la resolución..."
                          className="min-h-20"
                        />
                      </div>

                      <Button 
                        onClick={handleStatusUpdate} 
                        disabled={!newStatus}
                        className="w-full"
                      >
                        Actualizar Estado
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <MessageSquareText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecciona una queja para ver los detalles</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerPanel;
