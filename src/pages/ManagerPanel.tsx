import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useComplaintsStore } from '@/stores/complaintsStore';
import { useRatingsStore } from '@/stores/ratingsStore';
import { useBranchesStore } from '@/stores/branchesStore';
import { useEmailStore } from '@/stores/emailStore';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  MessageSquareText, 
  LogOut, 
  Filter, 
  CheckCircle,
  Calendar,
  User,
  Store,
  Eye,
  Building2,
  Star,
  Activity,
  BarChart3
} from 'lucide-react';
import DashboardStats from '@/components/DashboardStats';
import { generateComplaintStatusUpdateEmail } from '@/lib/emailTemplates';
import { emailConfig } from '@/lib/envConfig';
import { getBranchEmailMetadataSync } from '@/lib/emailHelpers';
import type { 
  Complaint, 
  ComplaintStatus, 
  ComplaintPriority,
  Rating,
  Branch
} from '@/types/api';

type ComplaintActivity = Complaint & { type: 'complaint'; activityDate: Date };
type RatingActivity = Omit<Rating, 'date'> & { 
  type: 'rating'; 
  activityDate: Date; 
  branchId: string; 
  fullName: string;
  date: string;
};

type CombinedActivity = ComplaintActivity | RatingActivity;

const ManagerPanel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Stores
  const { user, logout } = useAuthStore();
  const { 
    complaints, 
    fetchComplaints, 
    updateComplaint,
    getComplaintStats,
    pagination
  } = useComplaintsStore();
  const { 
    ratings, 
    fetchRatings,
    getRatingStats
  } = useRatingsStore();
  const { branches, fetchBranches, getBranchById } = useBranchesStore();
  const { sendEmail } = useEmailStore();

  // State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>();
  const [resolution, setResolution] = useState('');
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'complaint' | 'rating'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [managerBranch, setManagerBranch] = useState<Branch | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'activity';
  });
  const itemsPerPage = 10;

  // Obtener la primera branch del manager
  const managerBranchId = user?.branches?.[0]?.id;

  useEffect(() => {
    if (!user || user.role !== 'MANAGER') {
      navigate('/login');
      return;
    }
    
    loadInitialData();
  }, [user, navigate]);

  useEffect(() => {
    if (managerBranchId) {
      fetchData();
    }
  }, [currentPage, filterStatus, filterType, managerBranchId]);

  // Escuchar cambios en los search params para actualizar el tab activo
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['activity', 'stats'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadInitialData = async () => {
    try {
      if (managerBranchId) {
        await fetchBranches();
        const branch = await getBranchById(managerBranchId);
        setManagerBranch(branch);
        await fetchData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    }
  };

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchComplaints({ 
          page: currentPage,
          limit: itemsPerPage,
          branchId: managerBranchId,
          status: filterStatus !== 'all' ? filterStatus : undefined
        }),
        fetchRatings({ branchId: managerBranchId })
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    }
  };

  // Función para manejar el cambio en el Select de tipo
  const handleFilterTypeChange = (value: string) => {
    setFilterType(value as 'all' | 'complaint' | 'rating');
  };

  // Función para manejar el cambio en el Select de estado
  const handleFilterStatusChange = (value: string) => {
    setFilterStatus(value as ComplaintStatus | 'all');
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedComplaint || !newStatus) return;

    const oldStatus = selectedComplaint.status;

    try {
      const updatedComplaint = await updateComplaint(selectedComplaint.id, {
        status: newStatus,
        resolution: resolution || undefined,
        managerComments: resolution || undefined
      });

      // Enviar email de notificación si el estado cambió
      if (oldStatus !== newStatus) {
        try {
          const branchName = managerBranch?.name || 'Local';
          const emailHtml = generateComplaintStatusUpdateEmail(
            updatedComplaint,
            branchName,
            oldStatus,
            newStatus,
            resolution || undefined
          );

          // Obtener metadata del branch y managers
          const metadata = getBranchEmailMetadataSync(
            selectedComplaint.branchId, 
            'status_update', 
            selectedComplaint.id
          );

          await sendEmail({
            to: selectedComplaint.email,
            subject: `📋 Actualización de Queja - ID: ${selectedComplaint.id}`,
            html: emailHtml,
            from: {
              name: emailConfig.fromName,
              address: emailConfig.fromAddress
            },
            metadata
          });

          console.log('✅ Email de actualización de estado enviado exitosamente');
        } catch (emailError) {
          console.error('❌ Error enviando email de actualización:', emailError);
          // No mostramos error al usuario ya que la actualización se realizó exitosamente
        }
      }
      
      setSelectedComplaint(null);
      setNewStatus(undefined);
      setResolution('');
      
      toast({
        title: "Estado actualizado",
        description: "La queja ha sido actualizada exitosamente y se ha notificado al cliente",
      });

      await fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la queja",
        variant: "destructive"
      });
    }
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
      branchId: rating.branchId,
      fullName: `Calificación de ${rating.instructorName}`,
      date: rating.date
    }))
  ];

  const filteredData = combinedData.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (item.type === 'complaint' && filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => b.activityDate.getTime() - a.activityDate.getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
 

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200 h-14">
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white font-medium"
            >
              <Activity className="h-4 w-4 mr-2" />
              Actividad
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white font-medium"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-6">
            {/* Filters */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="min-w-40">
                    <Label className="text-gray-700 font-medium flex items-center mb-2">
                      <Filter className="h-4 w-4 mr-1" />
                      Tipo
                    </Label>
                    <Select 
                      value={filterType} 
                      onValueChange={handleFilterTypeChange}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-primary bg-white">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="complaint">Quejas</SelectItem>
                        <SelectItem value="rating">Calificaciones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-48">
                    <Label className="text-gray-700 font-medium flex items-center mb-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Estado (Quejas)
                    </Label>
                    <Select 
                      value={filterStatus} 
                      onValueChange={handleFilterStatusChange}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-primary bg-white">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="PENDING">Pendiente</SelectItem>
                        <SelectItem value="IN_PROGRESS">En proceso</SelectItem>
                        <SelectItem value="RESOLVED">Resuelta</SelectItem>
                        <SelectItem value="REJECTED">Rechazada</SelectItem>
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
                    className="border-primary/30 text-primary hover:bg-primary hover:text-white"
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
                  <h2 className="text-lg font-semibold text-gray-900">
                    Actividad Reciente ({filteredData.length})
                  </h2>
                  <Badge variant="outline" className="border-primary text-primary">
                    Página {currentPage} de {pagination.totalPages || 1}
                  </Badge>
                </div>
                
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {filteredData.map((item) => (
                    <Card 
                      key={item.id} 
                      className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                        (item.type === 'complaint' && selectedComplaint?.id === item.id) ||
                        (item.type === 'rating' && selectedRating?.id === item.id)
                          ? 'ring-2 ring-primary shadow-md' 
                          : 'hover:shadow-sm'
                      }`}
                      onClick={() => {
                        if (item.type === 'complaint') {
                          setSelectedComplaint(item);
                          setSelectedRating(null);
                        } else {
                          // Convertimos RatingActivity a Rating
                          const rating: Rating = {
                            ...item,
                            date: item.date
                          };
                          setSelectedRating(rating);
                          setSelectedComplaint(null);
                        }
                      }}
                    >
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-2">
                            <Badge className={`${
                              item.type === 'complaint' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                            } border`}>
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
                                {typeof item.npsScore === 'number' ? item.npsScore.toFixed(1) : item.npsScore}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {item.activityDate.toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <User className="h-4 w-4 mr-2 text-primary" />
                            <span className="font-medium text-gray-900">
                              {item.type === 'complaint' ? item.fullName : item.instructorName}
                            </span>
                          </div>
                          {item.type === 'complaint' && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {item.observationType}: {item.detail}
                            </p>
                          )}
                          {item.type === 'rating' && (
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span>NPS: {item.npsScore}</span>
                              <span>Instructor: {item.instructorRating}</span>
                              <span>Limpieza: {item.cleanlinessRating}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredData.length === 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center text-gray-500">
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No hay actividad que coincida con los filtros seleccionados</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            aria-disabled={currentPage === 1}
                            className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(pageNum);
                                }}
                                isActive={currentPage === pageNum}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < pagination.totalPages) setCurrentPage(currentPage + 1);
                            }}
                            aria-disabled={currentPage === pagination.totalPages}
                            className={currentPage === pagination.totalPages ? "opacity-50 cursor-not-allowed" : ""}
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
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
                      <CardTitle className="text-gray-900">Detalle de Queja</CardTitle>
                      <CardDescription className="font-mono text-blue-500">
                        ID: {selectedComplaint.id}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Estado actual</Label>
                          <Badge className={`${getStatusColor(selectedComplaint.status)} border mt-1`}>
                            {selectedComplaint.status}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Prioridad</Label>
                          <Badge className={`${getPriorityColor(selectedComplaint.priority)} border mt-1`}>
                            {selectedComplaint.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <Label className="text-sm font-medium text-gray-600">Cliente</Label>
                        <p className="font-medium text-gray-900">{selectedComplaint.fullName}</p>
                        <p className="text-sm text-gray-600">{selectedComplaint.email}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                        <p className="text-gray-900">{selectedComplaint.observationType}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Detalle</Label>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-900">
                          {selectedComplaint.detail}
                        </div>
                      </div>

                      {selectedComplaint.resolution && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Resolución actual</Label>
                          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-sm text-gray-900 mt-2">
                            {selectedComplaint.resolution}
                          </div>
                        </div>
                      )}

                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-semibold mb-4 text-gray-900">Actualizar Estado</h4>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Nuevo Estado</Label>
                            <Select 
                              value={newStatus} 
                              onValueChange={(value: string) => setNewStatus(value as ComplaintStatus)}
                            >
                              <SelectTrigger className="border-gray-300 focus:border-primary">
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pendiente</SelectItem>
                                <SelectItem value="IN_PROGRESS">En proceso</SelectItem>
                                <SelectItem value="RESOLVED">Resuelta</SelectItem>
                                <SelectItem value="REJECTED">Rechazada</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-gray-700 font-medium">Comentario/Resolución</Label>
                            <Textarea
                              value={resolution}
                              onChange={(e) => setResolution(e.target.value)}
                              placeholder="Ingresa comentarios o detalles de la resolución..."
                              className="min-h-20 border-gray-300 focus:border-primary"
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
                ) : selectedRating ? (
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-blue-50">
                      <CardTitle className="text-gray-900 flex items-center">
                        <Star className="h-5 w-5 mr-2 text-amber-500" />
                        Detalle de Calificación
                      </CardTitle>
                      <CardDescription className="font-mono text-blue-500">
                        ID: {selectedRating.id}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <Label className="text-sm font-medium text-gray-600">Instructor</Label>
                        <p className="font-medium text-gray-900">{selectedRating.instructorName}</p>
                        <p className="text-sm text-gray-600">{selectedRating.discipline}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Horario</Label>
                          <p className="text-gray-900">{selectedRating.schedule}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Fecha</Label>
                          <p className="text-gray-900">{selectedRating.date}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-medium text-gray-600">Puntuación NPS</Label>
                          <Badge className="bg-amber-100 text-amber-800 text-lg px-3 py-1">
                            {typeof selectedRating.npsScore === 'number' ? selectedRating.npsScore.toFixed(1) : selectedRating.npsScore}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Instructor</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="font-medium">{selectedRating.instructorRating}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Limpieza</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="font-medium">{selectedRating.cleanlinessRating}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Audio</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="font-medium">{selectedRating.audioRating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Atención</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="font-medium">{selectedRating.attentionQualityRating}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Comodidades</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="font-medium">{selectedRating.amenitiesRating}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Puntualidad</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="font-medium">{selectedRating.punctualityRating}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedRating.comments && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Comentarios</Label>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-900 mt-2">
                            {selectedRating.comments}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 flex items-center justify-between pt-4 border-t border-gray-200">
                        <span>Registrado: {new Date(selectedRating.createdAt).toLocaleDateString('es-ES')}</span>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          Solo lectura
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-gray-500">
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
            <DashboardStats 
              complaints={complaints} 
              ratings={ratings} 
              branch={managerBranch}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerPanel;