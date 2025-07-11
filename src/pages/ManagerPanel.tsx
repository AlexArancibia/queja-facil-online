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
import { type Rating } from '@/types/instructor';
import DashboardStats from '@/components/DashboardStats';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
  Activity,
  BarChart3,
  Eye
} from 'lucide-react';

// Create a proper combined type for unified activity view
type ComplaintActivity = Complaint & { type: 'complaint'; activityDate: Date };
type RatingActivity = Omit<Rating, 'date'> & { type: 'rating'; activityDate: Date; store: string; fullName: string };
type CombinedActivity = ComplaintActivity | RatingActivity;

const ManagerPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [resolutionFiles, setResolutionFiles] = useState<File[]>([]);
  const [resolutionPreviews, setResolutionPreviews] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
  const combinedData: CombinedActivity[] = [
    ...complaints.map(complaint => ({
      ...complaint,
      type: 'complaint' as const,
      activityDate: new Date(complaint.createdAt)
    })),
    ...ratings.map(rating => ({
      ...rating,
      type: 'rating' as const,
      activityDate: new Date(rating.createdAt),
      store: rating.storeId,
      fullName: `Calificación de ${rating.instructorName}`
    }))
  ];

  const filteredData = combinedData.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && item.type === 'complaint' && item.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => b.activityDate.getTime() - a.activityDate.getTime());

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm shadow-lg border border-siclo-light/50 h-14">
            <TabsTrigger value="activity" className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium">
              <Activity className="h-4 w-4 mr-2" />
              Actividad
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium">
              <BarChart3 className="h-4 w-4 mr-2" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-6">
            {/* Elegant Filters */}
            <Card className="siclo-card border-2 border-siclo-light/30 bg-gradient-to-r from-white/90 to-siclo-light/20">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="min-w-40">
                    <Label className="text-siclo-dark font-medium flex items-center mb-2">
                      <Filter className="h-4 w-4 mr-1" />
                      Tipo
                    </Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="border-siclo-light focus:border-siclo-green bg-white/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="complaint">Quejas</SelectItem>
                        <SelectItem value="rating">Calificaciones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-48">
                    <Label className="text-siclo-dark font-medium flex items-center mb-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Estado (Quejas)
                    </Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="border-siclo-light focus:border-siclo-green bg-white/80">
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
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilterType('all');
                      setFilterStatus('all');
                      setCurrentPage(1);
                    }}
                    className="border-siclo-green/30 text-siclo-green hover:bg-siclo-green hover:text-white"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity List and Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-siclo-dark">
                    Actividad Reciente ({filteredData.length})
                  </h2>
                  <Badge variant="outline" className="border-siclo-green text-siclo-green">
                    Página {currentPage} de {totalPages || 1}
                  </Badge>
                </div>
                
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {paginatedData.map((item) => (
                    <Card 
                      key={item.id} 
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        (item.type === 'complaint' && selectedComplaint?.id === item.id) ||
                        (item.type === 'rating' && selectedRating?.id === item.id)
                          ? 'ring-2 ring-siclo-green shadow-lg siclo-card' 
                          : 'siclo-card hover:shadow-md'
                      }`}
                      onClick={() => {
                        if (item.type === 'complaint') {
                          setSelectedComplaint(item);
                          setSelectedRating(null);
                        } else {
                          setSelectedRating(item as any);
                          setSelectedComplaint(null);
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
                              <Badge className={`${getStatusColor(item.status)} border`}>
                                {item.status}
                              </Badge>
                            )}
                            {item.type === 'rating' && (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                <Star className="h-3 w-3 mr-1" />
                                {item.npsScore.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-siclo-dark/60 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {item.activityDate.toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <User className="h-4 w-4 mr-2 text-siclo-green" />
                            <span className="font-medium text-siclo-dark">
                              {item.type === 'complaint' ? item.fullName : item.instructorName}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Store className="h-4 w-4 mr-2 text-siclo-blue" />
                            <span className="text-siclo-dark/70">{getStoreName(item.store)}</span>
                          </div>
                          {item.type === 'complaint' && (
                            <p className="text-sm text-siclo-dark/70 truncate">
                              {item.observationType}: {item.detail}
                            </p>
                          )}
                          {item.type === 'rating' && (
                            <div className="flex items-center space-x-3 text-xs text-siclo-dark/70">
                              <span>NPS: {item.npsScore}</span>
                              <span>Instructor: {item.instructorRating}</span>
                              <span>Limpieza: {item.cleanlinessRating}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {paginatedData.length === 0 && (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>

              {/* Detail Panel */}
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
                ) : selectedRating ? (
                  <Card className="siclo-card">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-blue-50">
                      <CardTitle className="text-siclo-dark flex items-center">
                        <Star className="h-5 w-5 mr-2 text-amber-500" />
                        Detalle de Calificación
                      </CardTitle>
                      <CardDescription className="font-mono text-siclo-blue">ID: {selectedRating.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="bg-siclo-light/50 rounded-lg p-4">
                        <Label className="text-sm font-medium text-siclo-dark/70">Instructor</Label>
                        <p className="font-medium text-siclo-dark">{selectedRating.instructorName}</p>
                        <p className="text-sm text-siclo-dark/70">{selectedRating.discipline}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-siclo-dark/70">Local</Label>
                          <p className="text-siclo-dark">{getStoreName(selectedRating.storeId)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-siclo-dark/70">Horario</Label>
                          <p className="text-siclo-dark">{selectedRating.schedule}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-medium text-siclo-dark/70">Puntuación NPS</Label>
                          <Badge className="bg-amber-100 text-amber-800 text-lg px-3 py-1">
                            {selectedRating.npsScore.toFixed(1)}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-siclo-dark/70">Instructor</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="font-medium">{selectedRating.instructorRating}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-siclo-dark/70">Limpieza</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="font-medium">{selectedRating.cleanlinessRating}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-siclo-dark/70">Audio</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="font-medium">{selectedRating.audioRating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-siclo-dark/70">Atención</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="font-medium">{selectedRating.attentionQualityRating}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-siclo-dark/70">Comodidades</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="font-medium">{selectedRating.amenitiesRating}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-siclo-dark/70">Puntualidad</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="font-medium">{selectedRating.punctualityRating}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedRating.comments && (
                        <div>
                          <Label className="text-sm font-medium text-siclo-dark/70">Comentarios</Label>
                          <div className="bg-white p-4 rounded-lg border border-siclo-light text-sm text-siclo-dark mt-2">
                            {selectedRating.comments}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-siclo-dark/60 flex items-center justify-between pt-4 border-t border-siclo-light">
                        <span>Fecha: {new Date(selectedRating.createdAt).toLocaleDateString('es-ES')}</span>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          Solo lectura
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="siclo-card">
                    <CardContent className="pt-6">
                      <div className="text-center text-siclo-dark/60">
                        <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Selecciona una queja o calificación para ver los detalles</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <DashboardStats complaints={complaints} ratings={ratings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerPanel;
