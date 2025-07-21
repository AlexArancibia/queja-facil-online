import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useComplaintsStore } from '@/stores/complaintsStore';
import { useRatingsStore } from '@/stores/ratingsStore';
import { useBranchesStore } from '@/stores/branchesStore';
import { useInstructorsStore } from '@/stores/instructorsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  type Complaint, 
  type Rating, 
  type Branch, 
  type Instructor,
  ComplaintStatus,
  ComplaintPriority,
  Discipline,
  UserRole
} from '@/types/api';
import AddManagerForm from '@/components/AddManagerForm';
import StoreManagement from '@/components/StoreManagement';
import InstructorManagement from '@/components/InstructorManagement';
import DashboardStats from '@/components/DashboardStats';
import RecentActivity from '@/components/RecentActivity';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmailMetadataDebug from '@/components/EmailMetadataDebug';
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
  Users,
  Store,
  Calendar,
  User,
  BarChart3,
  TrendingUp,
  Building2,
  Shield,
  PieChart,
  Activity,
  GraduationCap,
  Star,
  Mail,
  Phone,
  Edit,
  Trash2
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import EditUserModal from '@/components/EditUserModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Create a proper combined type for unified activity view
type ComplaintActivity = Complaint & { type: 'complaint'; activityDate: Date };
type RatingActivity = Rating & { type: 'rating'; activityDate: Date };
type CombinedActivity = ComplaintActivity | RatingActivity;

const AdminPanel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Auth store
  const { user, logout, users, usersLoading, getAllUsers, updateUser, deleteUser } = useAuthStore();
  
  // Data stores
  const { 
    complaints, 
    loading: complaintsLoading, 
    fetchComplaints, 
    getComplaintStats 
  } = useComplaintsStore();
  
  const { 
    ratings, 
    loading: ratingsLoading, 
    fetchRatings, 
    getRatingStats 
  } = useRatingsStore();
  
  const { 
    branches, 
    loading: branchesLoading, 
    fetchBranches 
  } = useBranchesStore();
  
  const { 
    instructors, 
    loading: instructorsLoading, 
    fetchInstructors 
  } = useInstructorsStore();

  // Local state
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [complaintStats, setComplaintStats] = useState<any>(null);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'complaints';
  });
  const itemsPerPage = 15;

  // Estado para modal de agregar manager
  const [addManagerModalOpen, setAddManagerModalOpen] = useState(false);
  // 1. Estado para dialog de detalle
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<CombinedActivity | null>(null);

  useEffect(() => {
    console.log('🔍 AdminPanel useEffect - user:', user);
    if (!user || user.role !== 'ADMIN') {
      console.log('❌ Usuario no autorizado, redirigiendo a login');
      navigate('/login');
      return;
    }
    console.log('✅ Usuario autorizado, cargando datos...');
    loadData();
  }, [user, navigate]);

  // Escuchar cambios en los search params para actualizar el tab activo
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['complaints', 'ratings', 'managers', 'instructors', 'stores', 'analytics'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadData = async () => {
    console.log('🚀 Iniciando carga de datos para admin...');
    setIsInitialLoading(true);
    try {
      // Load all data for admin (no filters - admin sees everything)
      await Promise.all([
        fetchComplaints({ limit: 1000 }), // Get all complaints
        fetchRatings({ limit: 1000 }), // Get all ratings
        fetchBranches(), // Get all branches
        fetchInstructors(), // Get all instructors
        getAllUsers(), // Get all users
        loadStats()
      ]);
      console.log('✅ Datos cargados exitosamente');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive"
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [complaintStatsData, ratingStatsData] = await Promise.all([
        getComplaintStats(),
        getRatingStats()
      ]);
      setComplaintStats(complaintStatsData);
      setRatingStats(ratingStatsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case ComplaintStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ComplaintStatus.RESOLVED:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case ComplaintStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return 'Pendiente';
      case ComplaintStatus.IN_PROGRESS:
        return 'En proceso';
      case ComplaintStatus.RESOLVED:
        return 'Resuelta';
      case ComplaintStatus.REJECTED:
        return 'Rechazada';
      default:
        return status;
    }
  };

  const getPriorityText = (priority: ComplaintPriority) => {
    switch (priority) {
      case ComplaintPriority.HIGH:
        return 'Alta';
      case ComplaintPriority.MEDIUM:
        return 'Media';
      case ComplaintPriority.LOW:
        return 'Baja';
      default:
        return priority;
    }
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : branchId;
  };

  const getInstructorName = (instructorId: string) => {
    const instructor = instructors.find(i => i.id === instructorId);
    return instructor ? instructor.name : instructorId;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'US';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Shield className="h-4 w-4" />;
      case UserRole.MANAGER:
        return <Building2 className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleText = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.MANAGER:
        return 'Manager';
      default:
        return 'Usuario';
    }
  };

  // Filtrar solo managers para la sección de managers
  const managers = users.filter(user => user.role === UserRole.MANAGER);

  // Estado para modal de edición
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUpdateUser = async (userId: string, userData: any) => {
    try {
      await updateUser(userId, userData);
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar usuario",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${userName}? Esta acción no se puede deshacer.`)) {
      try {
        await deleteUser(userId);
        toast({
          title: "Usuario eliminado",
          description: `${userName} ha sido eliminado del sistema`,
        });
        loadData();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error al eliminar usuario",
          variant: "destructive"
        });
      }
    }
  };

  // Filter data by date range
  const filterByDateRange = (data: any[]) => {
    if (!startDate && !endDate) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.createdAt);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  };

  const filteredComplaints = filterByDateRange(complaints);
  const filteredRatings = filterByDateRange(ratings);

  // Combine complaints and ratings for unified view
  const combinedData: CombinedActivity[] = [
    ...filteredComplaints.map(complaint => ({
      ...complaint,
      type: 'complaint' as const,
      activityDate: new Date(complaint.createdAt)
    })),
    ...filteredRatings.map(rating => ({
      ...rating,
      type: 'rating' as const,
      activityDate: new Date(rating.createdAt)
    }))
  ];

  const filteredData = combinedData.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterBranch !== 'all' && item.branchId !== filterBranch) return false;
    if (filterStatus !== 'all' && item.type === 'complaint' && item.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => b.activityDate.getTime() - a.activityDate.getTime());

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getQuickStats = () => {
    const totalComplaints = filteredComplaints.length;
    const totalRatings = filteredRatings.length;
    const pendingComplaints = filteredComplaints.filter(c => c.status === ComplaintStatus.PENDING).length;
    const resolvedComplaints = filteredComplaints.filter(c => c.status === ComplaintStatus.RESOLVED).length;
    const averageRating = filteredRatings.length > 0 
      ? filteredRatings.reduce((acc, rating) => {
          const avgRating = (
            rating.instructorRating +
            rating.cleanlinessRating +
            rating.audioRating +
            rating.attentionQualityRating +
            rating.amenitiesRating +
            rating.punctualityRating
          ) / 6;
          return acc + avgRating;
        }, 0) / filteredRatings.length
      : 0;
    const totalBranches = branches.length;
    const totalInstructors = instructors.length;

    return { 
      totalComplaints, 
      totalRatings, 
      pendingComplaints, 
      resolvedComplaints, 
      averageRating, 
      totalBranches,
      totalInstructors
    };
  };

  const quickStats = getQuickStats();

  // Data for pie charts
  const statusData = [
    { name: 'Pendiente', value: filteredComplaints.filter(c => c.status === ComplaintStatus.PENDING).length, color: '#f59e0b' },
    { name: 'En proceso', value: filteredComplaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length, color: '#3b82f6' },
    { name: 'Resuelta', value: filteredComplaints.filter(c => c.status === ComplaintStatus.RESOLVED).length, color: '#10b981' },
    { name: 'Rechazada', value: filteredComplaints.filter(c => c.status === ComplaintStatus.REJECTED).length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const priorityData = [
    { name: 'Alta', value: filteredComplaints.filter(c => c.priority === ComplaintPriority.HIGH).length, color: '#ef4444' },
    { name: 'Media', value: filteredComplaints.filter(c => c.priority === ComplaintPriority.MEDIUM).length, color: '#f59e0b' },
    { name: 'Baja', value: filteredComplaints.filter(c => c.priority === ComplaintPriority.LOW).length, color: '#10b981' },
  ].filter(item => item.value > 0);

  // Loading state
  if (isInitialLoading) {
    console.log('🔄 Initial loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-siclo-light via-white to-blue-50/30 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando panel de administración..." />
      </div>
    );
  }

  // Error state - si no hay usuario después del loading
  if (!user) {
    console.log('❌ No hay usuario después del loading');
    return (
      <div className="min-h-screen bg-gradient-to-br from-siclo-light via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-siclo-dark mb-4">Error de Autenticación</h2>
          <p className="text-siclo-dark/70 mb-6">No se pudo cargar la información del usuario</p>
          <Button onClick={() => navigate('/login')} className="siclo-button">
            Volver al Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-siclo-light pt-16 via-white to-blue-50/30">
      {/* Header */}
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm shadow-lg border border-siclo-light/50 h-14">
            <TabsTrigger value="complaints" className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium">
              <MessageSquareText className="h-4 w-4 mr-2" />
              Quejas
            </TabsTrigger>
            <TabsTrigger value="ratings" className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium">
              <Star className="h-4 w-4 mr-2" />
              Calificaciones
            </TabsTrigger>
            <TabsTrigger value="managers" className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium">
              <Users className="h-4 w-4 mr-2" />
              Managers
            </TabsTrigger>
            <TabsTrigger value="instructors" className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium">
              <GraduationCap className="h-4 w-4 mr-2" />
              Instructores
            </TabsTrigger>
            <TabsTrigger value="stores" className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium">
              <Building2 className="h-4 w-4 mr-2" />
              Locales
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium">
              <PieChart className="h-4 w-4 mr-2" />
              Analíticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="complaints" className="space-y-6">
            {/* Filtros de quejas: minimalista, ancho completo, con título */}
            <div className="w-full">
  {/* Contenedor principal ultra minimalista */}
  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
    {/* Título más grande */}
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
    </div>

    <div className="flex flex-wrap gap-2 items-center w-full">
      
      {/* Filtro de Estado */}
      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 min-w-[180px] flex-1 border border-gray-100">
        <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-md mr-2">
          <Filter className="h-3 w-3 text-green-600" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-0.5 block">Estado</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-6 border-0 bg-transparent text-gray-800 text-sm focus:ring-0 focus:outline-none shadow-none px-0">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value={ComplaintStatus.PENDING}>Pendiente</SelectItem>
              <SelectItem value={ComplaintStatus.IN_PROGRESS}>En proceso</SelectItem>
              <SelectItem value={ComplaintStatus.RESOLVED}>Resuelta</SelectItem>
              <SelectItem value={ComplaintStatus.REJECTED}>Rechazada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtro de Sucursal */}
      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 min-w-[180px] flex-1 border border-gray-100">
        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-md mr-2">
          <Store className="h-3 w-3 text-blue-600" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-0.5 block">Sucursal</label>
          <Select value={filterBranch} onValueChange={setFilterBranch}>
            <SelectTrigger className="h-6 border-0 bg-transparent text-gray-800 text-sm focus:ring-0 focus:outline-none shadow-none px-0">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtro de Fecha */}
      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 min-w-[220px] flex-1 border border-gray-100">
        <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-md mr-2">
          <Calendar className="h-3 w-3 text-gray-600" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-0.5 block">Fechas</label>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            className="!gap-1 [&_button]:h-6 [&_button]:text-xs [&_button]:rounded-md [&_button]:bg-white [&_button]:border [&_button]:border-gray-200 [&_button]:hover:bg-gray-50 [&_button]:transition-colors [&_button]:duration-200 px-0"
          />
        </div>
      </div>

    </div>
  </div>
</div>
            {/* Cards de resumen de quejas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Quejas */}
              <Card className="siclo-card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700">Total Quejas</p>
                      <p className="text-3xl font-bold text-red-900">{filteredComplaints.length}</p>
                    </div>
                    <MessageSquareText className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              {/* Pendientes */}
              <Card className="siclo-card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700">Pendientes</p>
                      <p className="text-3xl font-bold text-amber-900">{filteredComplaints.filter(c => c.status === ComplaintStatus.PENDING).length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
              {/* Resueltas */}
              <Card className="siclo-card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">Resueltas</p>
                      <p className="text-3xl font-bold text-emerald-900">{filteredComplaints.filter(c => c.status === ComplaintStatus.RESOLVED).length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
              {/* Rechazadas */}
              <Card className="siclo-card bg-gradient-to-br from-red-100 to-red-200 border-red-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700">Rechazadas</p>
                      <p className="text-3xl font-bold text-red-900">{filteredComplaints.filter(c => c.status === ComplaintStatus.REJECTED).length}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
                    </div>
            {/* Tabla de quejas sin scrollarea, solo quejas */}
            <Card className="siclo-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-siclo-dark">
                    Quejas ({filteredComplaints.length})
                  </CardTitle>
                  <Badge variant="outline" className="border-siclo-green text-siclo-green">
                    Página {currentPage} de {totalPages || 1}
                  </Badge>
                  </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredComplaints
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item) => (
                      <Card key={item.id} className="border border-siclo-light hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => { setSelectedDetail({ ...item, type: 'complaint', activityDate: new Date(item.createdAt) }); setDetailDialogOpen(true); }}
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-2">
                              <Badge className="bg-red-100 text-red-800 border-red-200 border">Queja</Badge>
                              <Badge className={`${getStatusColor(item.status)} border`}>
                                {getStatusText(item.status)}
                              </Badge>
                            </div>
                            <div className="text-xs text-siclo-dark/60 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(item.createdAt).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-siclo-green" />
                              <span className="font-medium text-siclo-dark">{item.fullName}</span>
                            </div>
                            <div className="flex items-center">
                              <Store className="h-4 w-4 mr-2 text-siclo-blue" />
                              <span className="text-siclo-dark/70">{getBranchName(item.branchId)}</span>
                            </div>
                            <div className="text-siclo-dark/70">{item.observationType}</div>
                          </div>
                          <p className="text-sm text-siclo-dark/70 mt-2 line-clamp-2">{item.detail}</p>
                        </CardContent>
                      </Card>
                    ))}
                  
                  {filteredComplaints.length === 0 && (
                    <div className="text-center text-siclo-dark/60 py-12">
                      <MessageSquareText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No hay quejas que coincidan con los filtros</p>
                    </div>
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
                        
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else {
                            const start = Math.max(1, currentPage - 2);
                            page = start + i;
                          }
                          
                          if (page <= totalPages) {
                            return (
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
                            );
                          }
                          return null;
                        })}
                        
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
                </CardContent>
              </Card>
          </TabsContent>
          <TabsContent value="ratings" className="space-y-6">
            {/* Filtros de calificaciones: minimalista, ancho completo, con título */}
            <div className="w-full">
  {/* Contenedor principal ultra minimalista */}
  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
    {/* Título más grande */}
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
    </div>

    <div className="flex flex-wrap gap-2 items-center w-full">
      
      {/* Filtro de Instructor */}
      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 min-w-[180px] flex-1 border border-gray-100">
        <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-md mr-2">
          <User className="h-3 w-3 text-green-600" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-0.5 block">Instructor</label>
          <Select value={filterBranch} onValueChange={setFilterBranch}>
            <SelectTrigger className="h-6 border-0 bg-transparent text-gray-800 text-sm focus:ring-0 focus:outline-none shadow-none px-0">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {instructors.map((instructor) => (
                <SelectItem key={instructor.id} value={instructor.id}>{instructor.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtro de Sucursal */}
      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 min-w-[180px] flex-1 border border-gray-100">
        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-md mr-2">
          <Store className="h-3 w-3 text-blue-600" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-0.5 block">Sucursal</label>
          <Select value={filterBranch} onValueChange={setFilterBranch}>
            <SelectTrigger className="h-6 border-0 bg-transparent text-gray-800 text-sm focus:ring-0 focus:outline-none shadow-none px-0">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtro de Disciplina */}
      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 min-w-[180px] flex-1 border border-gray-100">
        <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-md mr-2">
          <BarChart3 className="h-3 w-3 text-gray-600" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-0.5 block">Disciplina</label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-6 border-0 bg-transparent text-gray-800 text-sm focus:ring-0 focus:outline-none shadow-none px-0">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="driving">Conducción</SelectItem>
              <SelectItem value="theory">Teoría</SelectItem>
              <SelectItem value="practical">Práctica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtro de Fecha */}
      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 min-w-[220px] flex-1 border border-gray-100">
        <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-md mr-2">
          <Calendar className="h-3 w-3 text-gray-600" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-0.5 block">Fechas</label>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            className="!gap-1 [&_button]:h-6 [&_button]:text-xs [&_button]:rounded-md [&_button]:bg-white [&_button]:border [&_button]:border-gray-200 [&_button]:hover:bg-gray-50 [&_button]:transition-colors [&_button]:duration-200 px-0"
          />
        </div>
      </div>

    </div>
  </div>
</div>
            {/* Cards de resumen de calificaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Calificaciones */}
              <Card className="siclo-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Total Calificaciones</p>
                      <p className="text-3xl font-bold text-blue-900">{filteredRatings.length}</p>
                    </div>
                    <Star className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              {/* Promedio */}
              <Card className="siclo-card bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cyan-700">Promedio</p>
                      <p className="text-3xl font-bold text-cyan-900">{filteredRatings.length > 0 ? (filteredRatings.reduce((acc, r) => acc + ((r.instructorRating + r.cleanlinessRating + r.audioRating + r.attentionQualityRating + r.amenitiesRating + r.punctualityRating) / 6), 0) / filteredRatings.length).toFixed(1) : '0.0'}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>
              {/* NPS promedio */}
              <Card className="siclo-card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700">NPS Promedio</p>
                      <p className="text-3xl font-bold text-amber-900">{filteredRatings.length > 0 ? (filteredRatings.reduce((acc, r) => acc + r.npsScore, 0) / filteredRatings.length).toFixed(1) : '0.0'}</p>
                    </div>
                    <PieChart className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
              {/* Calificaciones última semana */}
              <Card className="siclo-card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-700">Última semana</p>
                      <p className="text-3xl font-bold text-indigo-900">{filteredRatings.filter(r => new Date(r.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Tabla de calificaciones sin scrollarea, solo calificaciones */}
            <Card className="siclo-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-siclo-dark">
                    Calificaciones ({filteredRatings.length})
                  </CardTitle>
                  <Badge variant="outline" className="border-siclo-green text-siclo-green">
                    Página {currentPage} de {totalPages || 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRatings
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item) => (
                      <Card key={item.id} className="border border-siclo-light hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => { setSelectedDetail({ ...item, type: 'rating', activityDate: new Date(item.createdAt) }); setDetailDialogOpen(true); }}
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-2">
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">Calificación</Badge>
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                ⭐ {typeof item.npsScore === 'number' ? item.npsScore.toFixed(1) : item.npsScore}
                              </Badge>
                            </div>
                            <div className="text-xs text-siclo-dark/60 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(item.createdAt).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-siclo-green" />
                              <span className="font-medium text-siclo-dark">{item.instructorName}</span>
                            </div>
                            <div className="flex items-center">
                              <Store className="h-4 w-4 mr-2 text-siclo-blue" />
                              <span className="text-siclo-dark/70">{getBranchName(item.branchId)}</span>
                            </div>
                            <div className="text-siclo-dark/70">Instructor: {item.instructorName}</div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-siclo-dark/70">
                            <span>NPS: {typeof item.npsScore === 'number' ? item.npsScore.toFixed(1) : item.npsScore}</span>
                            <span>Instructor: {item.instructorRating}</span>
                            <span>Limpieza: {item.cleanlinessRating}</span>
                            <span>Audio: {item.audioRating}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  
                  {filteredRatings.length === 0 && (
                    <div className="text-center text-siclo-dark/60 py-12">
                      <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No hay calificaciones que coincidan con los filtros</p>
                    </div>
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
                        
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else {
                            const start = Math.max(1, currentPage - 2);
                            page = start + i;
                          }
                          
                          if (page <= totalPages) {
                            return (
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
                            );
                          }
                          return null;
                        })}
                        
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="managers" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button className="bg-siclo-green text-white" onClick={() => setAddManagerModalOpen(true)}>
                <Users className="h-4 w-4 mr-2" />Agregar manager
              </Button>
            </div>
              <Card className="siclo-card">
                <CardHeader className="bg-gradient-to-r from-siclo-green/10 to-siclo-blue/10">
                  <CardTitle className="text-siclo-dark flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Managers del Sistema ({managers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2 text-siclo-dark">Cargando usuarios...</span>
                    </div>
                  ) : managers.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {managers.map((user) => (
                        <Card key={user.id} className="border border-siclo-light hover:shadow-lg transition-all duration-300">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={user.image} alt={user.name} />
                                  <AvatarFallback className="bg-siclo-green text-white">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <p className="font-medium text-siclo-dark">{user.name}</p>
                                    <div className="flex items-center space-x-1">
                                      {getRoleIcon(user.role)}
                                      <Badge variant="outline" className="text-xs border-siclo-green text-siclo-green">
                                        {getRoleText(user.role)}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-siclo-dark/60">
                                    <div className="flex items-center">
                                      <Mail className="h-3 w-3 mr-1" />
                                      {user.email}
                                    </div>
                                    {user.phone && (
                                      <div className="flex items-center">
                                        <Phone className="h-3 w-3 mr-1" />
                                        {user.phone}
                                      </div>
                                    )}
                                  </div>
                                  {user.branches && user.branches.length > 0 && (
                                    <div className="flex items-center mt-1">
                                      <Store className="h-3 w-3 mr-1 text-siclo-blue" />
                                      <span className="text-xs text-siclo-dark/60">
                                        {user.branches.map(b => b.name).join(', ')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right space-y-2">
                                <p className="text-xs text-siclo-dark/40">
                                  Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                </p>
                                <p className={`text-xs ${user.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {user.isActive ? 'Activo' : 'Inactivo'}
                                </p>
                                <div className="flex gap-2 justify-end">
                                  <Button size="icon" variant="outline" onClick={() => { setSelectedUser(user); setEditUserModalOpen(true); }} title="Editar">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="destructive" onClick={() => handleDeleteUser(user.id, user.name || user.email)} title="Eliminar">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-siclo-dark/60 py-12">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No hay managers registrados</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            {/* Modal de edición de usuario */}
            <EditUserModal
              user={selectedUser}
              isOpen={editUserModalOpen}
              onClose={() => { setEditUserModalOpen(false); setSelectedUser(null); }}
              onSave={handleUpdateUser}
            />
            {/* Modal de creación de manager */}
            <Dialog open={addManagerModalOpen} onOpenChange={setAddManagerModalOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-siclo-dark">
                    <Users className="h-5 w-5 mr-2" />Agregar Manager
                  </DialogTitle>
                </DialogHeader>
                <AddManagerForm onManagerAdded={() => { setAddManagerModalOpen(false); loadData(); }} />
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="instructors" className="space-y-6">
            <InstructorManagement />
          </TabsContent>

          <TabsContent value="stores" className="space-y-6">
            <StoreManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Date Range Filter for Analytics */}
            <Card className="siclo-card border-2 border-siclo-light/30">
              <CardHeader>
                <CardTitle className="flex items-center text-siclo-dark">
                  <Calendar className="h-5 w-5 mr-2" />
                  Filtrar Analíticas por Rango de Fechas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
              </CardContent>
            </Card>
            
            <DashboardStats complaints={filteredComplaints} ratings={filteredRatings} />
            
            <EmailMetadataDebug />
          </TabsContent>
        </Tabs>
      </div>
      {/* Dialog de detalle reutilizado */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle {selectedDetail?.type === 'complaint' ? 'de Queja' : 'de Calificación'}</DialogTitle>
          </DialogHeader>
          {selectedDetail && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Badge>{selectedDetail.type === 'complaint' ? 'Queja' : 'Calificación'}</Badge>
                {selectedDetail.type === 'complaint' && (
                  <Badge className={getStatusColor(selectedDetail.status)}>{getStatusText(selectedDetail.status)}</Badge>
                )}
                {selectedDetail.type === 'rating' && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    ⭐ {typeof selectedDetail.npsScore === 'number' ? selectedDetail.npsScore.toFixed(1) : selectedDetail.npsScore}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-siclo-dark/60 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {selectedDetail.activityDate.toLocaleDateString('es-ES')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">{selectedDetail.type === 'complaint' ? 'Nombre' : 'Instructor'}: </span>
                  {selectedDetail.type === 'complaint' ? selectedDetail.fullName : selectedDetail.instructorName}
                </div>
                <div>
                  <span className="font-medium">Sucursal: </span>{getBranchName(selectedDetail.branchId)}
                </div>
                {selectedDetail.type === 'complaint' && (
                  <div>
                    <span className="font-medium">Tipo: </span>{selectedDetail.observationType}
                  </div>
                )}
              </div>
              {selectedDetail.type === 'complaint' && (
                <div>
                  <span className="font-medium">Detalle:</span>
                  <div className="bg-gray-50 p-2 rounded mt-1 text-siclo-dark/80 text-sm">
                    {selectedDetail.detail}
                  </div>
                </div>
              )}
              {selectedDetail.type === 'rating' && (
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div><span className="font-medium">NPS:</span> {typeof selectedDetail.npsScore === 'number' ? selectedDetail.npsScore.toFixed(1) : selectedDetail.npsScore}</div>
                  <div><span className="font-medium">Instructor:</span> {selectedDetail.instructorRating}</div>
                  <div><span className="font-medium">Limpieza:</span> {selectedDetail.cleanlinessRating}</div>
                  <div><span className="font-medium">Audio:</span> {selectedDetail.audioRating}</div>
                  <div><span className="font-medium">Atención:</span> {selectedDetail.attentionQualityRating}</div>
                  <div><span className="font-medium">Comodidades:</span> {selectedDetail.amenitiesRating}</div>
                  <div><span className="font-medium">Puntualidad:</span> {selectedDetail.punctualityRating}</div>
                  {selectedDetail.comments && (
                    <div className="col-span-2"><span className="font-medium">Comentarios:</span> {selectedDetail.comments}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
