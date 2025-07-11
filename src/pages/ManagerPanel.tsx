import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { type Complaint, MOCK_STORES } from '@/types/complaint';
import { type Rating } from '@/types/instructor';
import DashboardStats from '@/components/DashboardStats';
import RecentActivity from '@/components/RecentActivity';
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
  Store,
  Upload,
  X,
  TrendingUp,
  Building2,
  Star,
  Activity
} from 'lucide-react';

const ManagerPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [resolutionFiles, setResolutionFiles] = useState<File[]>([]);
  const [resolutionPreviews, setResolutionPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = () => {
    const allComplaints: Complaint[] = JSON.parse(localStorage.getItem('complaints') || '[]');
    const allRatings: Rating[] = JSON.parse(localStorage.getItem('ratings') || '[]');
    
    // Filter for manager's stores
    const managerComplaints = allComplaints.filter(complaint => 
      user?.stores?.includes(complaint.store)
    );
    
    const managerRatings = allRatings.filter(rating => 
      user?.stores?.includes(rating.storeId)
    );
    
    setComplaints(managerComplaints);
    setRatings(managerRatings);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'En proceso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resuelta':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rechazada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Media':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Baja':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStoreName = (storeId: string) => {
    const store = MOCK_STORES.find(s => s.id === storeId);
    return store ? store.name : storeId;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setResolutionFiles(prev => [...prev, ...newFiles]);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setResolutionPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeResolutionFile = (index: number) => {
    setResolutionFiles(prev => prev.filter((_, i) => i !== index));
    setResolutionPreviews(prev => prev.filter((_, i) => i !== index));
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
          resolutionAttachments: resolutionFiles.map(f => f.name),
          updatedAt: new Date()
        };
      }
      return complaint;
    });

    localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
    loadData();
    setSelectedComplaint(null);
    setNewStatus('');
    setResolution('');
    setResolutionFiles([]);
    setResolutionPreviews([]);

    toast({
      title: "Estado actualizado",
      description: "La queja ha sido actualizada exitosamente",
    });
  };

  // Combine complaints and ratings for unified view
  const combinedData = [
    ...complaints.map(complaint => ({
      ...complaint,
      type: 'complaint' as const,
      date: new Date(complaint.createdAt)
    })),
    ...ratings.map(rating => ({
      ...rating,
      type: 'rating' as const,
      date: new Date(rating.createdAt),
      store: rating.storeId,
      fullName: `Calificación de ${rating.instructorName}`
    }))
  ];

  const filteredData = combinedData.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && item.type === 'complaint' && (item as Complaint).status !== filterStatus) return false;
    return true;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-siclo-light to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-siclo-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 siclo-gradient rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-siclo-dark">Panel Manager - Siclo</h1>
                <p className="text-sm text-siclo-dark/70">Bienvenido, {user?.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="border-siclo-green text-siclo-green hover:bg-siclo-green hover:text-white">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Statistics Dashboard */}
        <DashboardStats complaints={complaints} ratings={ratings} />

        {/* Recent Activity */}
        <RecentActivity complaints={complaints} ratings={ratings} />

        {/* Filters */}
        <Card className="siclo-card">
          <CardHeader className="bg-gradient-to-r from-siclo-green/5 to-siclo-blue/5">
            <CardTitle className="flex items-center text-siclo-dark">
              <Filter className="h-5 w-5 mr-2" />
              Filtros de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-siclo-dark font-medium">Tipo</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="border-siclo-light focus:border-siclo-green">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="complaint">Quejas</SelectItem>
                    <SelectItem value="rating">Calificaciones</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-siclo-dark font-medium">Estado (Quejas)</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-siclo-light focus:border-siclo-green">
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

        {/* Activity List and Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-siclo-dark">
              Actividad Reciente ({filteredData.length})
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredData.map((item) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    item.type === 'complaint' && selectedComplaint?.id === item.id
                      ? 'ring-2 ring-siclo-green shadow-lg siclo-card' 
                      : 'siclo-card hover:shadow-md'
                  }`}
                  onClick={() => {
                    if (item.type === 'complaint') {
                      setSelectedComplaint(item as Complaint);
                    }
                  }}
                >
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2">
                        <Badge className={`${item.type === 'complaint' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200'} border`}>
                          {item.type === 'complaint' ? 'Queja' : 'Calificación'}
                        </Badge>
                        {item.type === 'complaint' && (
                          <Badge className={`${getStatusColor((item as Complaint).status)} border`}>
                            {(item as Complaint).status}
                          </Badge>
                        )}
                        {item.type === 'rating' && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <Star className="h-3 w-3 mr-1" />
                            {((item as Rating).npsScore).toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-siclo-dark/60 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.date.toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-siclo-green" />
                        <span className="font-medium text-siclo-dark">
                          {item.type === 'complaint' ? (item as Complaint).fullName : (item as Rating).instructorName}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Store className="h-4 w-4 mr-2 text-siclo-blue" />
                        <span className="text-siclo-dark/70">{getStoreName(item.store)}</span>
                      </div>
                      {item.type === 'complaint' && (
                        <p className="text-sm text-siclo-dark/70 truncate">
                          {(item as Complaint).observationType}: {(item as Complaint).detail}
                        </p>
                      )}
                      {item.type === 'rating' && (
                        <div className="flex items-center space-x-3 text-xs text-siclo-dark/70">
                          <span>NPS: {(item as Rating).npsScore}</span>
                          <span>Instructor: {(item as Rating).instructorRating}</span>
                          <span>Limpieza: {(item as Rating).cleanlinessRating}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredData.length === 0 && (
                <Card className="siclo-card">
                  <CardContent className="pt-6">
                    <div className="text-center text-siclo-dark/60">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay actividad que coincida con los filtros seleccionados</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Complaint Detail (only for complaints) */}
          <div>
            {selectedComplaint ? (
              <Card className="siclo-card">
                <CardHeader className="bg-gradient-to-r from-siclo-green/10 to-siclo-blue/10">
                  <CardTitle className="text-siclo-dark">Detalle de Queja</CardTitle>
                  <CardDescription className="font-mono text-siclo-blue">ID: {selectedComplaint.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-siclo-dark/70">Estado actual</Label>
                      <Badge className={`${getStatusColor(selectedComplaint.status)} border mt-1`}>
                        {selectedComplaint.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-siclo-dark/70">Prioridad</Label>
                      <Badge className={`${getPriorityColor(selectedComplaint.priority)} border mt-1`}>
                        {selectedComplaint.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-siclo-light/50 rounded-lg p-4">
                    <Label className="text-sm font-medium text-siclo-dark/70">Cliente</Label>
                    <p className="font-medium text-siclo-dark">{selectedComplaint.fullName}</p>
                    <p className="text-sm text-siclo-dark/70">{selectedComplaint.email}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-siclo-dark/70">Local</Label>
                    <p className="text-siclo-dark">{getStoreName(selectedComplaint.store)}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-siclo-dark/70">Tipo</Label>
                    <p className="text-siclo-dark">{selectedComplaint.observationType}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-siclo-dark/70">Detalle</Label>
                    <div className="bg-white p-4 rounded-lg border border-siclo-light text-sm text-siclo-dark">
                      {selectedComplaint.detail}
                    </div>
                  </div>

                  {selectedComplaint.resolution && (
                    <div>
                      <Label className="text-sm font-medium text-siclo-dark/70">Resolución actual</Label>
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-sm text-siclo-dark">
                        {selectedComplaint.resolution}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-siclo-light pt-6">
                    <h4 className="font-semibold mb-4 text-siclo-dark">Actualizar Estado</h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-siclo-dark font-medium">Nuevo Estado</Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger className="border-siclo-light focus:border-siclo-green">
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
                        <Label className="text-siclo-dark font-medium">Comentario/Resolución</Label>
                        <Textarea
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          placeholder="Ingresa comentarios o detalles de la resolución..."
                          className="min-h-20 border-siclo-light focus:border-siclo-green"
                        />
                      </div>

                      <div>
                        <Label className="text-siclo-dark font-medium">Adjuntar Evidencias (Opcional)</Label>
                        <div className="border-2 border-dashed border-siclo-light rounded-lg p-4 text-center hover:border-siclo-green transition-colors">
                          <label className="cursor-pointer block">
                            <Upload className="w-6 h-6 mx-auto mb-2 text-siclo-green" />
                            <p className="text-sm text-siclo-dark">Subir imágenes de resolución</p>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                        
                        {resolutionPreviews.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {resolutionPreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={preview} 
                                  alt={`Resolution ${index + 1}`}
                                  className="w-full h-20 object-cover rounded border border-siclo-light"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeResolutionFile(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button 
                        onClick={handleStatusUpdate} 
                        disabled={!newStatus}
                        className="w-full siclo-button"
                      >
                        Actualizar Estado
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="siclo-card">
                <CardContent className="pt-6">
                  <div className="text-center text-siclo-dark/60">
                    <MessageSquareText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecciona una queja para ver los detalles</p>
                    <p className="text-sm mt-2">Las calificaciones no requieren gestión</p>
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
