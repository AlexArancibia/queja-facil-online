import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useComplaintsStore } from '@/stores/complaintsStore';
import { useRatingsStore } from '@/stores/ratingsStore';
import { useBranchesStore } from '@/stores/branchesStore';
import { useEmailStore } from '@/stores/emailStore';
import { useImageUpload } from '@/hooks/use-image-upload';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Filter, 
  CheckCircle,
  Calendar,
  User,
  Store,
  Eye,
  Building2,
  Star,
  Activity,
  BarChart3,
  MoreHorizontal,
  Edit,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  Target,
  Users
} from 'lucide-react';
import DashboardStats from '@/components/DashboardStats';
import LoadingSpinner from '@/components/LoadingSpinner';
import { generateComplaintStatusUpdateEmail } from '@/lib/emailTemplates';
import { emailConfig } from '@/lib/envConfig';
import { getBranchEmailMetadataSync } from '@/lib/emailHelpers';
import type { 
  Complaint, 
  ComplaintStatus, 
  ComplaintPriority,
  Rating,
  Branch,
  Attachment
} from '@/types/api';
import AttachmentsViewer from '@/components/AttachmentsViewer';

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
    // pagination, // Eliminado paginación
    loading: complaintsLoading
  } = useComplaintsStore();
  const { 
    ratings, 
    fetchRatings,
    getRatingStats,
    loading: ratingsLoading
  } = useRatingsStore();
  const { branches, fetchBranches, getBranchById } = useBranchesStore();
  const { sendEmail } = useEmailStore();

  // State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>();
  const [resolution, setResolution] = useState('');
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<ComplaintPriority | 'all'>('all');
  const [filterInstructor, setFilterInstructor] = useState<string>('all');
  const [managerBranch, setManagerBranch] = useState<Branch | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'complaints';
  });
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [resolutionFiles, setResolutionFiles] = useState<File[]>([]);
  const [resolutionPreviews, setResolutionPreviews] = useState<string[]>([]);
  const [isUpdatingComplaint, setIsUpdatingComplaint] = useState(false);

  // Hook de subida de imágenes
  const {
    uploadMultipleImages,
    isUploading,
    uploadProgress
  } = useImageUpload({
    maxFileSize: 10, // MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    onError: (error) => {
      toast({
        title: "Error al subir imagen",
        description: error,
        variant: "destructive"
      });
    }
  });

  // Obtener la primera branch del manager
  const managerBranchId = user?.branches?.[0]?.id;

  useEffect(() => {
    if (!user || (user.role !== 'MANAGER' && user.role !== 'SUPERVISOR')) {
      navigate('/login');
      return;
    }
    
    loadInitialData();
  }, [user, navigate]);

  // useEffect para recargar datos al cambiar filtros
  useEffect(() => {
    if (managerBranchId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterPriority, managerBranchId]);

  // Escuchar cambios en los search params para actualizar el tab activo
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['complaints', 'ratings', 'stats'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadInitialData = async () => {
    setIsInitialLoading(true);
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
        description: "No se pudieron cargar los datos del panel",
        variant: "destructive"
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  // fetchData simplificado (sin paginación)
  const fetchData = async () => {
    try {
      await Promise.all([
        fetchComplaints({ 
          limit: 100,
          branchId: managerBranchId,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          priority: filterPriority !== 'all' ? filterPriority : undefined
        }),
        fetchRatings({ limit: 100, branchId: managerBranchId })
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos",
        variant: "destructive"
      });
    }
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

  const getStatusText = (status: ComplaintStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'IN_PROGRESS':
        return 'En Proceso';
      case 'RESOLVED':
        return 'Resuelta';
      case 'REJECTED':
        return 'Rechazada';
      default:
        return status;
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

  const getPriorityText = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'HIGH':
        return 'Alta';
      case 'MEDIUM':
        return 'Media';
      case 'LOW':
        return 'Baja';
      default:
        return priority;
    }
  };

  const handleResolutionFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setResolutionFiles(files);
    setResolutionPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleStatusUpdate = async () => {
    if (!selectedComplaint || !newStatus) return;

    const oldStatus = selectedComplaint.status;

    try {
      setIsUpdatingComplaint(true);
      let uploadedAttachments: Attachment[] = [];
      if (resolutionFiles.length > 0) {
        // Subir imágenes usando el hook useImageUpload
        const uploadResults = await uploadMultipleImages(resolutionFiles);
        uploadedAttachments = uploadResults
          .filter(r => r.success && r.fileUrl)
          .map((r, idx) => ({
            filename: resolutionFiles[idx].name,
            url: r.fileUrl!
          }));
      }
      const updatedComplaint = await updateComplaint(selectedComplaint.id, {
        status: newStatus,
        resolution: resolution || undefined,
        managerComments: resolution || undefined,
        resolutionAttachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
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
      setResolutionFiles([]);
      setResolutionPreviews([]);
      setIsStatusDialogOpen(false);
      setIsUpdatingComplaint(false);
      
      toast({
        title: "Estado actualizado exitosamente",
        description: "La queja ha sido actualizada y se ha notificado al cliente por email",
      });

      await fetchData();
    } catch (error) {
      setIsUpdatingComplaint(false);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la queja",
        variant: "destructive"
      });
    }
  };

  const handleViewDetail = (item: CombinedActivity) => {
    if (item.type === 'complaint') {
      setSelectedComplaint(item);
      setSelectedRating(null);
    } else {
      const rating: Rating = {
        ...item,
        date: item.date
      };
      setSelectedRating(rating);
      setSelectedComplaint(null);
    }
    setIsDetailDialogOpen(true);
  };

  const handleEditComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setResolution(complaint.resolution || '');
    setIsStatusDialogOpen(true);
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
    if (item.type === 'complaint' && filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => b.activityDate.getTime() - a.activityDate.getTime());

  // Handle tab changes with URL navigation
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    navigate(`/manager?tab=${newTab}`);
    if (newTab !== 'complaints') {
      setFilterStatus('all');
      setFilterPriority('all');
    }
  };

  // Loading state
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-siclo-light flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando panel de gestión..." />
      </div>
    );
  }

  // Datos filtrados para cada tab
  // Ordena las quejas: primero las que no son PENDING, luego las PENDING, y al final las RESOLVED
  const filteredComplaints: ComplaintActivity[] = complaints
    .filter(c => (filterStatus === 'all' || c.status === filterStatus) && (filterPriority === 'all' || c.priority === filterPriority))
    .map(c => ({
      ...c,
      type: 'complaint' as const,
      activityDate: new Date(c.createdAt),
    }))
    .sort((a, b) => {
      // Primero los que no son RESOLVED ni PENDING, luego PENDING, luego RESOLVED
      if (a.status === 'RESOLVED' && b.status !== 'RESOLVED') return 1;
      if (a.status !== 'RESOLVED' && b.status === 'RESOLVED') return -1;
      if (a.status === 'PENDING' && b.status !== 'PENDING') return 1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return -1;
      return b.activityDate.getTime() - a.activityDate.getTime();
    });

  // Filtro de instructor en ratings
  const instructorOptions = Array.from(new Set(ratings.map(r => r.instructorName))).filter(Boolean);
  const filteredRatings: RatingActivity[] = ratings
    .filter(r => filterInstructor === 'all' || r.instructorName === filterInstructor)
    .map(r => ({
      ...r,
      type: 'rating' as const,
      activityDate: new Date(r.createdAt),
      branchId: r.branchId,
      fullName: `Calificación de ${r.instructorName}`,
      date: r.date,
    }))
    .sort((a, b) => b.activityDate.getTime() - a.activityDate.getTime());

  return (
    <div className="min-h-screen pt-16 bg-siclo-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 pt-0 pb-8 md:py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg border border-siclo-light/50 h-14 hidden md:grid">
            <TabsTrigger 
              value="complaints" 
              className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium"
            >
              <MessageSquareText className="h-4 w-4 mr-2" />
              Quejas
            </TabsTrigger>
            <TabsTrigger 
              value="ratings" 
              className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium"
            >
              <Star className="h-4 w-4 mr-2" />
              Calificaciones
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          {/* TAB QUEJAS */}
          <TabsContent value="complaints" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-siclo-light/30 shadow-md">
              <div>
                <h2 className="text-xl font-bold text-siclo-dark flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Panel de Gestión - {managerBranch?.name || 'Sucursal'}
                </h2>
                <p className="text-sm text-siclo-dark/70 mt-1">
                  Gestiona las quejas de tu sucursal ({filteredComplaints.length} elementos)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-siclo-green text-siclo-green">
                  {user?.role === 'MANAGER' ? 'Manager' : 'Supervisor'}
                </Badge>
              </div>
            </div>
            {/* Filtros de estado y prioridad */}
            <Card className="siclo-card border-0 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  <h3 className="text-lg font-medium text-siclo-dark/80 mr-2 flex-shrink-0">Filtros:</h3>
                  {/* Estado */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200/70 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                      <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 shadow-none text-sm min-w-[100px]">
                        <SelectValue placeholder="Estado" />
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
                  {/* Prioridad */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200/70 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as any)}>
                      <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 shadow-none text-sm min-w-[100px]">
                        <SelectValue placeholder="Prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las prioridades</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="MEDIUM">Media</SelectItem>
                        <SelectItem value="LOW">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Limpiar filtros */}
                  {(filterStatus !== 'all' || filterPriority !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setFilterStatus('all'); setFilterPriority('all'); }}
                      className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 h-auto"
                    >
                      ✕ Limpiar
                    </Button>
                  )}
                  {/* Indicador de resultados */}
                  <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-siclo-green/10 text-siclo-green text-xs font-medium flex-shrink-0">
                    <MessageSquareText className="w-3 h-3" />
                    <span className="hidden sm:inline">{filteredComplaints.length} quejas</span>
                    <span className="sm:hidden">{filteredComplaints.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="siclo-card overflow-hidden">
              <CardContent className="p-0">
                {filteredComplaints.length > 0 ? (
                  <>
                    {/* Vista móvil - Cards */}
                    <div className="lg:hidden">
                      <div className="space-y-3 p-2">
                        {filteredComplaints.map((item) => (
                          <Card key={item.id} className="border border-siclo-light/50 hover:shadow-md transition-all duration-200 rounded-xl">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                {/* Header del item */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className={`flex-shrink-0 p-2 rounded-lg ${
                                      item.type === 'complaint' ? 'bg-red-100' : 'bg-blue-100'
                                    }`}>
                                      {item.type === 'complaint' ? (
                                        <MessageSquareText className="h-4 w-4 text-red-600" />
                                      ) : (
                                        <Star className="h-4 w-4 text-blue-600" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Badge className={`${getStatusColor(item.status)} text-xs`}>
                                          {getStatusText(item.status)}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[160px]">
                                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetail(item); }}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Ver detalle
                                      </DropdownMenuItem>
                                      {item.type === 'complaint' && (
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditComplaint(item); }}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          Actualizar estado
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                {/* Información del item */}
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center text-siclo-dark/70">
                                    <User className="h-3 w-3 mr-2 flex-shrink-0 text-siclo-green" />
                                    <span className="font-medium truncate">
                                      {item.fullName}
                                    </span>
                                  </div>
                                  {item.type === 'complaint' && (
                                    <>
                                      <div className="flex items-center text-siclo-dark/70">
                                        <AlertTriangle className="h-3 w-3 mr-2 flex-shrink-0 text-amber-500" />
                                        <span className="text-xs truncate">{item.observationType}</span>
                                      </div>
                                      <div className="flex items-center text-siclo-dark/70">
                                        <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                                        <span className="text-xs truncate">{item.email}</span>
                                      </div>
                                    </>
                                  )}
                                  <div className="flex items-center text-siclo-dark/70">
                                    <Calendar className="h-3 w-3 mr-2 flex-shrink-0 text-gray-400" />
                                    <span className="text-xs">
                                      {item.activityDate.toLocaleDateString('es-ES', { 
                                        day: '2-digit', 
                                        month: '2-digit',
                                        year: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                                {/* Detalle truncado */}
                                {item.type === 'complaint' && (
                                  <div className="pt-2 border-t border-gray-100">
                                    <p className="text-xs text-siclo-dark/60 line-clamp-2" title={item.detail}>
                                      {item.detail}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    {/* Vista desktop - Tabla */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table className="min-w-[900px]">
                        <TableHeader className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
                          <TableRow className="bg-gray-50/50">
                            <TableHead className="font-semibold text-siclo-dark">Usuario</TableHead>
                            <TableHead className="font-semibold text-siclo-dark">Estado</TableHead>
                            <TableHead className="font-semibold text-siclo-dark">Prioridad</TableHead>
                            <TableHead className="font-semibold text-siclo-dark">Fecha</TableHead>
                            <TableHead className="font-semibold text-siclo-dark">Detalle</TableHead>
                            <TableHead className="w-[100px] font-semibold text-siclo-dark">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredComplaints.map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50/50">
                              {/* Usuario */}
                              <TableCell>
                                <div>
                                  <p className="font-medium text-siclo-dark text-sm">{item.fullName}</p>
                                  <p className="text-xs text-siclo-dark/60">{item.email}</p>
                                </div>
                              </TableCell>
                              {/* Estado */}
                              <TableCell>
                                <Badge className={`${getStatusColor(item.status)} text-xs`}>
                                  {getStatusText(item.status)}
                                </Badge>
                              </TableCell>
                              {/* Prioridad */}
                              <TableCell>
                                <Badge variant="outline" className={`${getPriorityColor(item.priority)} text-xs block w-fit`}>
                                  {getPriorityText(item.priority)}
                                </Badge>
                              </TableCell>
                              {/* Fecha */}
                              <TableCell>
                                <div className="text-sm text-siclo-dark/60">
                                  {item.activityDate.toLocaleDateString('es-ES', { 
                                    day: '2-digit', 
                                    month: '2-digit',
                                    year: '2-digit'
                                  })}
                                </div>
                              </TableCell>
                              {/* Detalle */}
                              <TableCell className="max-w-[200px]">
                                <div>
                                  <div className="text-xs text-siclo-dark/80 font-medium truncate">{item.observationType}</div>
                                  <div className="text-xs text-siclo-dark/60 truncate" title={item.detail}>
                                    {item.detail}
                                  </div>
                                </div>
                              </TableCell>
                              {/* Acciones */}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[160px]">
                                    <DropdownMenuItem onClick={() => handleViewDetail(item)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Ver detalle
                                    </DropdownMenuItem>
                                    {item.type === 'complaint' && (
                                      <DropdownMenuItem onClick={() => handleEditComplaint(item)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Actualizar estado
                                      </DropdownMenuItem>
                                    )}
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
                    <MessageSquareText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium mb-2">No hay quejas para mostrar</h3>
                    <p className="text-sm text-siclo-dark/50 mb-6">
                      {filterStatus !== 'all' || filterPriority !== 'all' 
                        ? 'No hay quejas que coincidan con el filtro seleccionado'
                        : 'Aún no hay quejas registradas en tu sucursal'
                      }
                    </p>
                    {(filterStatus !== 'all' || filterPriority !== 'all') && (
                      <Button 
                        variant="outline"
                        onClick={() => { setFilterStatus('all'); setFilterPriority('all'); }}
                        className="border-siclo-green text-siclo-green hover:bg-siclo-green hover:text-white"
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB CALIFICACIONES */}
          <TabsContent value="ratings" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-siclo-light/30 shadow-md">
              <div>
                <h2 className="text-xl font-bold text-siclo-dark flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Panel de Gestión - {managerBranch?.name || 'Sucursal'}
                </h2>
                <p className="text-sm text-siclo-dark/70 mt-1">
                  Gestiona las calificaciones de tu sucursal ({filteredRatings.length} elementos)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-siclo-green text-siclo-green">
                  {user?.role === 'MANAGER' ? 'Manager' : 'Supervisor'}
                </Badge>
              </div>
            </div>
            {/* Filtro de instructor */}
            <Card className="siclo-card border-0 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  <h3 className="text-lg font-medium text-siclo-dark/80 mr-2 flex-shrink-0">Filtros:</h3>
                  {/* Instructor */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200/70 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <Select value={filterInstructor} onValueChange={setFilterInstructor}>
                      <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 shadow-none text-sm min-w-[120px]">
                        <SelectValue placeholder="Instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los instructores</SelectItem>
                        {instructorOptions.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Limpiar filtro */}
                  {filterInstructor !== 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilterInstructor('all')}
                      className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 h-auto"
                    >
                      ✕ Limpiar
                    </Button>
                  )}
                  {/* Indicador de resultados */}
                  <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-siclo-green/10 text-siclo-green text-xs font-medium flex-shrink-0">
                    <Star className="w-3 h-3" />
                    <span className="hidden sm:inline">{filteredRatings.length} calificaciones</span>
                    <span className="sm:hidden">{filteredRatings.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="siclo-card overflow-hidden">
              <CardContent className="p-0">
                {filteredRatings.length > 0 ? (
                  <>
                    {/* Vista móvil - Cards */}
                    <div className="lg:hidden">
                      <div className="space-y-3 p-2">
                        {filteredRatings.map((item) => (
                          <Card key={item.id} className="border border-siclo-light/50 hover:shadow-md transition-all duration-200 rounded-xl">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                {/* Header del item */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className={`flex-shrink-0 p-2 rounded-lg ${
                                      item.type === 'complaint' ? 'bg-red-100' : 'bg-blue-100'
                                    }`}>
                                      {item.type === 'complaint' ? (
                                        <MessageSquareText className="h-4 w-4 text-red-600" />
                                      ) : (
                                        <Star className="h-4 w-4 text-blue-600" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Badge className={`${getStatusColor(item.status)} text-xs`}>
                                          {getStatusText(item.status)}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[160px]">
                                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetail(item); }}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Ver detalle
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                {/* Información del item */}
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center text-siclo-dark/70">
                                    <User className="h-3 w-3 mr-2 flex-shrink-0 text-siclo-green" />
                                    <span className="font-medium truncate">
                                      {item.fullName}
                                    </span>
                                  </div>
                                  {item.type === 'complaint' && (
                                    <>
                                      <div className="flex items-center text-siclo-dark/70">
                                        <AlertTriangle className="h-3 w-3 mr-2 flex-shrink-0 text-amber-500" />
                                        <span className="text-xs truncate">{item.observationType}</span>
                                      </div>
                                      <div className="flex items-center text-siclo-dark/70">
                                        <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                                        <span className="text-xs truncate">{item.email}</span>
                                      </div>
                                    </>
                                  )}
                                  <div className="flex items-center text-siclo-dark/70">
                                    <Calendar className="h-3 w-3 mr-2 flex-shrink-0 text-gray-400" />
                                    <span className="text-xs">
                                      {item.activityDate.toLocaleDateString('es-ES', { 
                                        day: '2-digit', 
                                        month: '2-digit',
                                        year: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                                {/* Detalle truncado */}
                                {item.type === 'complaint' && (
                                  <div className="pt-2 border-t border-gray-100">
                                    <p className="text-xs text-siclo-dark/60 line-clamp-2" title={item.detail}>
                                      {item.detail}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    {/* Vista desktop - Tabla */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table className="min-w-[900px]">
                        <TableHeader className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
                          <TableRow className="bg-gray-50/50">
                            <TableHead className="font-semibold text-siclo-dark">Instructor</TableHead>
                            <TableHead className="font-semibold text-siclo-dark">Calificación</TableHead>
                            <TableHead className="font-semibold text-siclo-dark">Fecha</TableHead>
                            <TableHead className="font-semibold text-siclo-dark">Detalle</TableHead>
                            <TableHead className="w-[100px] font-semibold text-siclo-dark">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRatings.map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50/50">
                              {/* Instructor */}
                              <TableCell>
                                <div>
                                  <p className="font-medium text-siclo-dark text-sm">{item.instructorName}</p>
                                  <p className="text-xs text-siclo-dark/60">{item.discipline}</p>
                                </div>
                              </TableCell>
                              {/* Calificación */}
                              <TableCell>
                                <div className="space-y-1">
                                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                                    ⭐ {typeof item.npsScore === 'number' ? item.npsScore.toFixed(1) : item.npsScore}
                                  </Badge>
                                  <div className="text-xs text-siclo-dark/60">
                                    Instructor: {item.instructorRating}/5
                                  </div>
                                </div>
                              </TableCell>
                              {/* Fecha */}
                              <TableCell>
                                <div className="text-sm text-siclo-dark/60">
                                  {item.activityDate.toLocaleDateString('es-ES', { 
                                    day: '2-digit', 
                                    month: '2-digit',
                                    year: '2-digit'
                                  })}
                                </div>
                              </TableCell>
                              {/* Detalle (comentarios) */}
                              <TableCell className="max-w-[200px]">
                                <div className="text-xs text-siclo-dark/60">
                                  {item.comments ? (
                                    <span className="truncate" title={item.comments}>{item.comments}</span>
                                  ) : (
                                    <span className="text-gray-400">Sin comentarios</span>
                                  )}
                                </div>
                              </TableCell>
                              {/* Acciones */}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[160px]">
                                    <DropdownMenuItem onClick={() => handleViewDetail(item)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Ver detalle
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
                    <Star className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium mb-2">No hay calificaciones para mostrar</h3>
                    <p className="text-sm text-siclo-dark/50 mb-6">
                      {'Aún no hay calificaciones registradas en tu sucursal'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB ESTADÍSTICAS */}
          <TabsContent value="stats" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-siclo-light/30 shadow-md">
              <div>
                <h2 className="text-xl font-bold text-siclo-dark flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Panel de Gestión - {managerBranch?.name || 'Sucursal'}
                </h2>
                <p className="text-sm text-siclo-dark/70 mt-1">
                  Estadísticas de tu sucursal
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-siclo-green text-siclo-green">
                  {user?.role === 'MANAGER' ? 'Manager' : 'Supervisor'}
                </Badge>
              </div>
            </div>
            <DashboardStats 
              complaints={complaints} 
              ratings={ratings} 
              branch={managerBranch}
            />
          </TabsContent>
        </Tabs>
        {/* Dialogs y lógica de detalle/edición permanecen igual, pero asegúrate de que funcionen con el tab activo */}

        {/* Dialog de detalle */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedComplaint ? (
                  <>
                    <MessageSquareText className="h-5 w-5 text-red-600" />
                    Detalle de Queja
                  </>
                ) : (
                  <>
                    <Star className="h-5 w-5 text-blue-600" />
                    Detalle de Calificación
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                ID: {selectedComplaint?.id || selectedRating?.id}
              </DialogDescription>
            </DialogHeader>
            
            {selectedComplaint ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Estado</Label>
                    <Badge className={`${getStatusColor(selectedComplaint.status)} mt-1`}>
                      {getStatusText(selectedComplaint.status)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Prioridad</Label>
                    <Badge className={`${getPriorityColor(selectedComplaint.priority)} mt-1`}>
                      {getPriorityText(selectedComplaint.priority)}
                    </Badge>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-sm font-medium text-gray-600">Cliente</Label>
                  <p className="font-medium text-gray-900">{selectedComplaint.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedComplaint.email}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Tipo de Observación</Label>
                  <p className="text-gray-900">{selectedComplaint.observationType}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Detalle</Label>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-900 mt-1">
                    {selectedComplaint.detail}
                  </div>
                </div>

                {selectedComplaint.attachments?.length > 0 || selectedComplaint.resolutionAttachments?.length > 0 ? (
                  <AttachmentsViewer
                    attachments={selectedComplaint.attachments}
                    resolutionAttachments={selectedComplaint.resolutionAttachments}
                    title="Archivos Adjuntos"
                  />
                ) : null}

                {selectedComplaint.resolution && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Resolución</Label>
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-sm text-gray-900 mt-1">
                      {selectedComplaint.resolution}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      handleEditComplaint(selectedComplaint);
                    }}
                    className="w-full siclo-button"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Actualizar Estado
                  </Button>
                </div>
              </div>
            ) : selectedRating ? (
              <div className="space-y-4">
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

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
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
                      <span className="font-medium">{selectedRating.instructorRating}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Limpieza</span>
                      <span className="font-medium">{selectedRating.cleanlinessRating}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Audio</span>
                      <span className="font-medium">{selectedRating.audioRating}/5</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Atención</span>
                      <span className="font-medium">{selectedRating.attentionQualityRating}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Comodidades</span>
                      <span className="font-medium">{selectedRating.amenitiesRating}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Puntualidad</span>
                      <span className="font-medium">{selectedRating.punctualityRating}/5</span>
                    </div>
                  </div>
                </div>

                {selectedRating.comments && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Comentarios</Label>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-900 mt-1">
                      {selectedRating.comments}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Dialog de actualización de estado */}
        <Dialog open={isStatusDialogOpen} onOpenChange={(open) => {
          setIsStatusDialogOpen(open);
          if (!open) {
            setNewStatus(undefined);
            setResolution('');
            setResolutionFiles([]);
            setResolutionPreviews([]);
            setIsUpdatingComplaint(false);
          }
        }}>
          <DialogContent className="max-w-md p-0">
            {isUpdatingComplaint && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl transition-all">
                <div className="flex flex-col items-center gap-4">
                  <LoadingSpinner size="xl" />
                  <span className="text-lg font-semibold text-siclo-green animate-pulse">Actualizando queja...</span>
                </div>
              </div>
            )}
            <div className="rounded-xl overflow-hidden bg-white shadow-lg">
              {/* Header visual mejorado */}
              <div className="flex items-center gap-3 px-5 pt-5 pb-2 border-b border-gray-100">
 
                <div>
                  <DialogTitle className="text-lg font-bold text-siclo-dark mb-0">Actualizar Estado de Queja</DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 mt-0">
                    ID: <span className="font-mono text-gray-700">{selectedComplaint?.id}</span><br/>
                    {selectedComplaint && (
                      <>
                        Estado actual: <Badge className={`font-semibold ml-1 ${getStatusColor(selectedComplaint.status)}`}>{getStatusText(selectedComplaint.status)}</Badge>
                      </>
                    )}
                  </DialogDescription>
                </div>
              </div>

              <div className="space-y-5 px-5 py-5">
                {/* Select de estado */}
                <div>
                  <Label className="text-gray-700 text-sm font-medium mb-1 block">Nuevo Estado</Label>
                  <Select 
                    value={newStatus} 
                    onValueChange={(value: string) => setNewStatus(value as ComplaintStatus)}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-siclo-green mt-1 w-full text-base">
                      <SelectValue placeholder="Seleccionar estado" className="text-base" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">
                        <span className="flex items-center gap-2 text-base"><Clock className="w-4 h-4 text-amber-500" /> Pendiente</span>
                      </SelectItem>
                      <SelectItem value="IN_PROGRESS">
                        <span className="flex items-center gap-2 text-base"><Activity className="w-4 h-4 text-blue-500" /> En proceso</span>
                      </SelectItem>
                      <SelectItem value="RESOLVED">
                        <span className="flex items-center gap-2 text-base"><CheckCircle className="w-4 h-4 text-emerald-600" /> Resuelta</span>
                      </SelectItem>
                      <SelectItem value="REJECTED">
                        <span className="flex items-center gap-2 text-base"><AlertTriangle className="w-4 h-4 text-red-500" /> Rechazada</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Input de imágenes con previews en grid */}
                <div>
                  <Label className="text-gray-700 text-sm font-medium mb-1 block">Imágenes de resolución</Label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleResolutionFilesChange}
                    className="block mt-2 file:mr-3 file:py-2 file:px-4 text-xs file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-siclo-green/10 file:text-siclo-green hover:file:bg-siclo-green/20 transition"
                    disabled={isUploading}
                  />
                  {resolutionPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {resolutionPreviews.map((src, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={src}
                            alt={`preview-${idx}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md transition"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {isUploading && (
                    <div className="text-xs text-siclo-green mt-2 flex items-center gap-2">
                      <LoadingSpinner size="sm" /> Subiendo imágenes... {uploadProgress}%
                    </div>
                  )}
                </div>

                {/* Textarea de resolución */}
                <div>
                  <Label className="text-gray-700 text-sm font-medium mb-1 block">Comentario / Resolución</Label>
                  <Textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Describe cómo se resolvió la queja o deja un comentario para el cliente..."
                    className="min-h-20 border-gray-300 focus:border-siclo-green mt-1 w-full rounded-lg text-sm"
                    rows={4}
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-2 justify-end">
                  <Button 
                    onClick={handleStatusUpdate} 
                    disabled={!newStatus || isUploading}
                    className="flex-1 siclo-button bg-siclo-green hover:bg-siclo-green/90 text-white font-semibold text-base py-3 rounded-lg flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
                  >
                    {isUploading ? <LoadingSpinner size="sm" /> : <CheckCircle className="h-5 w-5" />}
                    {isUploading ? 'Subiendo...' : 'Actualizar Estado'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsStatusDialogOpen(false);
                      setNewStatus(undefined);
                      setResolution('');
                      setResolutionFiles([]);
                      setResolutionPreviews([]);
                    }}
                    disabled={isUploading}
                    className="rounded-lg border-gray-300 text-gray-600 bg-white hover:bg-gray-50 text-base"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ManagerPanel;