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
import AnalyticsPanel from '@/components/AnalyticsPanel';
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
  Trash2,
  Eye,
  MoreHorizontal,
  UserPlus
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import EditUserModal from '@/components/EditUserModal';
import AttachmentsViewer from '@/components/AttachmentsViewer';
import DateRangeFilterAdvanced from '@/components/DateRangeFilterAdvanced';
import { ComplaintStatsCards } from '@/components/ComplaintStatsCards';
import { RatingStatsCards } from '@/components/RatingStatsCards';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    getComplaintStats,
    deleteComplaint,
    pagination: complaintsPagination
  } = useComplaintsStore();
  
  const { 
    ratings, 
    loading: ratingsLoading, 
    fetchRatings, 
    getRatingStats,
    deleteRating,
    pagination: ratingsPagination
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
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterInstructor, setFilterInstructor] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

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
  
  // Estado para acciones de tabla
  const [deletingItem, setDeletingItem] = useState<string | null>(null);

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterPriority, filterBranch, filterInstructor, filterType, startDate, endDate]);

  // Fetch data when filters change (always start at page 1)
  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchFilteredComplaints(1);
    } else if (activeTab === 'ratings') {
      fetchFilteredRatings(1);
    }
  }, [filterStatus, filterPriority, filterBranch, filterInstructor, startDate, endDate, activeTab]);

  const loadData = async () => {
    console.log('🚀 Iniciando carga de datos para admin...');
    setIsInitialLoading(true);
    try {
      // Load basic data and initial complaints/ratings without filters
      await Promise.all([
        fetchBranches(), // Get all branches
        fetchInstructors(), // Get all instructors
        getAllUsers(), // Get all users
        fetchComplaints({
          page: 1,
          limit: itemsPerPage,
        }), // Get initial complaints
        fetchRatings({
          page: 1,
          limit: itemsPerPage,
        }), // Get initial ratings
      ]);
      console.log('✅ Datos básicos cargados exitosamente');
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



  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handle tab changes with URL navigation
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    navigate(`/admin?tab=${newTab}`);
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
      case UserRole.SUPERVISOR:
        return <Shield className="h-4 w-4" />;
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
      case UserRole.SUPERVISOR:
        return 'Supervisor';
      default:
        return 'Usuario';
    }
  };

  // Filtrar managers y supervisors para la sección de gestión de usuarios
  const managementUsers = users.filter(user => 
    user.role === UserRole.MANAGER || user.role === UserRole.SUPERVISOR
  );

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

  // Funciones para acciones de tabla
  const handleViewDetail = (item: any, type: 'complaint' | 'rating') => {
    setSelectedDetail({ 
      ...item, 
      type, 
      activityDate: new Date(item.createdAt) 
    });
    setDetailDialogOpen(true);
  };

  const handleDeleteComplaint = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta queja? Esta acción no se puede deshacer.')) {
      try {
        setDeletingItem(id);
        await deleteComplaint(id);
        toast({
          title: "Queja eliminada",
          description: "La queja ha sido eliminada exitosamente",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error al eliminar la queja",
          variant: "destructive"
        });
      } finally {
        setDeletingItem(null);
      }
    }
  };

  const handleDeleteRating = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta calificación? Esta acción no se puede deshacer.')) {
      try {
        setDeletingItem(id);
        await deleteRating(id);
        toast({
          title: "Calificación eliminada",
          description: "La calificación ha sido eliminada exitosamente",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error al eliminar la calificación",
          variant: "destructive"
        });
      } finally {
        setDeletingItem(null);
      }
    }
  };

    // Helper function to format dates for API
  const formatDateForAPI = (date: Date | undefined): string | undefined => {
    if (!date) return undefined;
    return date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
  };

  // Fetch data with current filters for specific page
  const fetchFilteredComplaints = async (page: number = 1) => {
    console.log('🚀 FETCHING COMPLAINTS - Page:', page, 'Filters:', {
      status: filterStatus !== 'all' ? filterStatus : undefined,
      priority: filterPriority !== 'all' ? filterPriority : undefined,
      branchId: filterBranch !== 'all' ? filterBranch : undefined,
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });
    try {
      await fetchComplaints({
        page: page,
        limit: itemsPerPage,
        status: filterStatus !== 'all' ? (filterStatus as ComplaintStatus) : undefined,
        priority: filterPriority !== 'all' ? (filterPriority as ComplaintPriority) : undefined,
        branchId: filterBranch !== 'all' ? filterBranch : undefined,
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
      });
      console.log('✅ COMPLAINTS FETCHED - New data:', complaints.length, 'items');
    } catch (error) {
      console.error('❌ Error fetching filtered complaints:', error);
    }
  };

  const fetchFilteredRatings = async (page: number = 1) => {
    console.log('🌟 FETCHING RATINGS - Page:', page, 'Filters:', {
      branchId: filterBranch !== 'all' ? filterBranch : undefined,
      instructorId: filterInstructor !== 'all' ? filterInstructor : undefined,
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate),
    });
    try {
      await fetchRatings({
        page: page,
        limit: itemsPerPage,
        branchId: filterBranch !== 'all' ? filterBranch : undefined,
        instructorId: filterInstructor !== 'all' ? filterInstructor : undefined,
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
      });
      console.log('✅ RATINGS FETCHED - New data:', ratings.length, 'items');
    } catch (error) {
      console.error('❌ Error fetching filtered ratings:', error);
    }
  };

  // Pagination handlers - fetch specific page on demand
  const handleComplaintsPageChange = (newPage: number) => {
    console.log('📄 COMPLAINTS PAGE CLICKED:', newPage);
    fetchFilteredComplaints(newPage);
  };

  const handleRatingsPageChange = (newPage: number) => {
    console.log('⭐ RATINGS PAGE CLICKED:', newPage);
    fetchFilteredRatings(newPage);
  };

  // Combine complaints and ratings for unified view (legacy - now mostly using backend pagination)
  const combinedData: CombinedActivity[] = [
    ...complaints.map(complaint => ({
      ...complaint,
      type: 'complaint' as const,
      activityDate: new Date(complaint.createdAt)
    })),
    ...ratings.map(rating => ({
      ...rating,
      type: 'rating' as const,
      activityDate: new Date(rating.createdAt)
    }))
  ];

  const filteredData = combinedData.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterBranch !== 'all' && item.branchId !== filterBranch) return false;
    if (filterInstructor !== 'all' && item.type === 'rating' && item.instructorId !== filterInstructor) return false;
    if (filterStatus !== 'all' && item.type === 'complaint' && item.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => b.activityDate.getTime() - a.activityDate.getTime());

  // Direct pagination values from stores
  const complaintsCurrentPage = complaintsPagination.page;
  const complaintsTotalPages = complaintsPagination.totalPages || 1;
  const ratingsCurrentPage = ratingsPagination.page;
  const ratingsTotalPages = ratingsPagination.totalPages || 1;

  // Debug: Log variables to console
  console.log('🔍 DEBUG PAGINATION:', {
    complaints: complaints,
    complaintsLength: complaints.length,
    complaintsCurrentPage,
    complaintsTotalPages,
    complaintsPagination,
    ratings: ratings,
    ratingsLength: ratings.length,
    ratingsCurrentPage,
    ratingsTotalPages,
    ratingsPagination,
    activeTab
  });

  // Legacy pagination for combined view (if needed)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getQuickStats = () => {
    const totalComplaints = complaintsPagination.total || complaints.length;
    const totalRatings = ratingsPagination.total || ratings.length;
    const pendingComplaints = complaints.filter(c => c.status === ComplaintStatus.PENDING).length;
    const resolvedComplaints = complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length;
    const averageRating = ratings.length > 0 
      ? ratings.reduce((acc, rating) => {
          const avgRating = (
            rating.instructorRating +
            rating.cleanlinessRating +
            rating.audioRating +
            rating.attentionQualityRating +
            rating.amenitiesRating +
            rating.punctualityRating
          ) / 6;
          return acc + avgRating;
        }, 0) / ratings.length
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

  // Removed quickStats - now using server-side stats from components

  // Data for pie charts
  const statusData = [
    { name: 'Pendiente', value: complaints.filter(c => c.status === ComplaintStatus.PENDING).length, color: '#f59e0b' },
    { name: 'En proceso', value: complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length, color: '#3b82f6' },
    { name: 'Resuelta', value: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length, color: '#10b981' },
    { name: 'Rechazada', value: complaints.filter(c => c.status === ComplaintStatus.REJECTED).length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const priorityData = [
    { name: 'Alta', value: complaints.filter(c => c.priority === ComplaintPriority.HIGH).length, color: '#ef4444' },
    { name: 'Media', value: complaints.filter(c => c.priority === ComplaintPriority.MEDIUM).length, color: '#f59e0b' },
    { name: 'Baja', value: complaints.filter(c => c.priority === ComplaintPriority.LOW).length, color: '#10b981' },
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
    <div className="min-h-screen pt-16 bg-siclo-light">
      {/* Header */}
 
      <div className="container  mx-auto px-4 sm:px-6 lg:px-16 pt-0 pb-8 md:py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6 ">
          <TabsList className="  w-full grid-cols-6 bg-white/80 backdrop-blur-sm shadow-lg border border-siclo-light/50 h-14 hidden md:grid">
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
              Personal
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
            {/* Filtros de quejas: elegante, moderno y minimalista */}
            <Card className="siclo-card border-0 bg-white/60 backdrop-blur-sm shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  <h3 className="text-lg font-medium text-siclo-dark/80 mr-2 flex-shrink-0">Filtros:</h3>
                  
                  {/* Estado */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 shadow-none text-sm min-w-[100px]">
                        <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value={ComplaintStatus.PENDING}>Pendiente</SelectItem>
              <SelectItem value={ComplaintStatus.IN_PROGRESS}>En proceso</SelectItem>
              <SelectItem value={ComplaintStatus.RESOLVED}>Resuelta</SelectItem>
              <SelectItem value={ComplaintStatus.REJECTED}>Rechazada</SelectItem>
            </SelectContent>
          </Select>
      </div>

                  {/* Prioridad */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 shadow-none text-sm min-w-[100px]">
                        <SelectValue placeholder="Prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las prioridades</SelectItem>
                        <SelectItem value={ComplaintPriority.HIGH}>Alta</SelectItem>
                        <SelectItem value={ComplaintPriority.MEDIUM}>Media</SelectItem>
                        <SelectItem value={ComplaintPriority.LOW}>Baja</SelectItem>
                      </SelectContent>
                    </Select>
        </div>

                  {/* Sucursal */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          <Select value={filterBranch} onValueChange={setFilterBranch}>
                      <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 shadow-none text-sm min-w-[120px]">
                        <SelectValue placeholder="Sucursal" />
            </SelectTrigger>
            <SelectContent>
                        <SelectItem value="all">Todas las sucursales</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
      </div>

                  {/* Rango de Fechas Avanzado */}
                  <DateRangeFilterAdvanced
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                  />

                                    {/* Reset filters button */}
                  {(filterStatus !== 'all' || filterPriority !== 'all' || filterBranch !== 'all' || startDate || endDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterPriority('all');
                        setFilterBranch('all');
                        setStartDate(undefined);
                        setEndDate(undefined);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 h-auto"
                    >
                      ✕ Limpiar
                    </Button>
                  )}

                  {/* Indicador de resultados */}
                  <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-siclo-green/10 text-siclo-green text-xs font-medium flex-shrink-0">
                    <Activity className="w-3 h-3" />
                    <span className="hidden sm:inline">{complaintsPagination.total || complaints.length} resultados</span>
                    <span className="sm:hidden">{complaintsPagination.total || complaints.length}</span>
                  </div>
  </div>
              </CardContent>
            </Card>
            {/* Stats de quejas desde el servidor */}
            <ComplaintStatsCards 
              branchId={filterBranch !== 'all' ? filterBranch : undefined}
              startDate={formatDateForAPI(startDate)}
              endDate={formatDateForAPI(endDate)}
            />
            {/* Tabla de quejas sin scrollarea, solo quejas */}
            <Card className="siclo-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-siclo-dark">
                    Quejas ({complaintsPagination.total || complaints.length})
                  </CardTitle>
                  <Badge variant="outline" className="border-siclo-green text-siclo-green">
                    Página {complaintsCurrentPage} de {complaintsTotalPages}
                  </Badge>
                  </div>
              </CardHeader>
              <CardContent className="p-4">
                {complaints.length === 0 ? (
                  <div className="text-center text-siclo-dark/60 py-12">
                    <MessageSquareText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No hay quejas que coincidan con los filtros</p>
                  </div>
                ) : (
                  <>
                    {/* Grid de cards para móvil y tablet */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 mb-6">
                      {complaints
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((item) => (
                          <Card key={item.id} className="border border-siclo-light hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={() => handleViewDetail(item, 'complaint')}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={`${getStatusColor(item.status)} text-xs`}>
                                    {getStatusText(item.status)}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      item.priority === ComplaintPriority.HIGH ? 'border-red-300 text-red-700' :
                                      item.priority === ComplaintPriority.MEDIUM ? 'border-amber-300 text-amber-700' :
                                      'border-green-300 text-green-700'
                                    }`}
                                  >
                                    {getPriorityText(item.priority)}
                                  </Badge>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[160px]">
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetail(item, 'complaint'); }}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Ver detalle
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteComplaint(item.id); }}
                                      className="text-red-600"
                                      disabled={deletingItem === item.id}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {deletingItem === item.id ? 'Eliminando...' : 'Eliminar'}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-siclo-green flex-shrink-0" />
                                  <span className="font-medium truncate">{item.fullName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Store className="h-4 w-4 text-siclo-blue flex-shrink-0" />
                                  <span className="text-siclo-dark/70 truncate">{getBranchName(item.branchId)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                  <span className="text-siclo-dark/70 truncate">{item.observationType}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-gray-500 text-xs">
                                    {new Date(item.createdAt).toLocaleDateString('es-ES', { 
                                      day: '2-digit', 
                                      month: '2-digit',
                                      year: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-siclo-dark/60 line-clamp-2" title={item.detail}>
                                  {item.detail}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>

                    {/* Tabla para desktop */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[100px] text-xs font-medium">Fecha</TableHead>
                            <TableHead className="text-xs font-medium">Usuario</TableHead>
                            <TableHead className="text-xs font-medium">Sucursal</TableHead>
                            <TableHead className="text-xs font-medium">Tipo</TableHead>
                            <TableHead className="text-xs font-medium">Estado</TableHead>
                            <TableHead className="text-xs font-medium">Prioridad</TableHead>
                            <TableHead className="text-xs font-medium">Detalle</TableHead>
                            <TableHead className="w-[80px] text-xs font-medium">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {complaints
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((item) => (
                              <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell className="text-xs text-gray-600">
                                  {new Date(item.createdAt).toLocaleDateString('es-ES', { 
                                    day: '2-digit', 
                                    month: '2-digit',
                                    year: '2-digit'
                                  })}
                                </TableCell>
                                <TableCell className="font-medium text-sm max-w-[150px]">
                                  <div className="truncate" title={item.fullName}>
                                    {item.fullName}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs text-gray-600">
                                  <div className="truncate max-w-[120px]" title={getBranchName(item.branchId)}>
                                    {getBranchName(item.branchId)}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs text-gray-600">
                                  <div className="truncate max-w-[100px]" title={item.observationType}>
                                    {item.observationType}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={`${getStatusColor(item.status)} text-xs`}>
                                    {getStatusText(item.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      item.priority === ComplaintPriority.HIGH ? 'border-red-300 text-red-700' :
                                      item.priority === ComplaintPriority.MEDIUM ? 'border-amber-300 text-amber-700' :
                                      'border-green-300 text-green-700'
                                    }`}
                                  >
                                    {getPriorityText(item.priority)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                  <div className="text-xs text-gray-600 truncate" title={item.detail}>
                                    {item.detail}
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
                                      <DropdownMenuItem onClick={() => handleViewDetail(item, 'complaint')}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Ver detalle
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteComplaint(item.id)}
                                        className="text-red-600"
                                        disabled={deletingItem === item.id}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {deletingItem === item.id ? 'Eliminando...' : 'Eliminar'}
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
                )}

                {/* Paginación para quejas */}
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (complaintsCurrentPage > 1) handleComplaintsPageChange(complaintsCurrentPage - 1);
                          }}
                          className={complaintsCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(complaintsTotalPages, 5) }, (_, i) => {
                        let page;
                        if (complaintsTotalPages <= 5) {
                          page = i + 1;
                        } else {
                          const start = Math.max(1, complaintsCurrentPage - 2);
                          page = start + i;
                        }
                        
                        if (page <= complaintsTotalPages) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleComplaintsPageChange(page);
                                }}
                                isActive={complaintsCurrentPage === page}
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
                            if (complaintsCurrentPage < complaintsTotalPages) handleComplaintsPageChange(complaintsCurrentPage + 1);
                          }}
                          className={complaintsCurrentPage >= complaintsTotalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ratings" className="space-y-6">
            {/* Filtros de calificaciones: elegante, moderno y minimalista */}
            <Card className="siclo-card border-0 bg-white/60 backdrop-blur-sm shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  <h3 className="text-lg font-medium text-siclo-dark/80 mr-2 flex-shrink-0">Filtros:</h3>
                  
                  {/* Instructor */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <Select value={filterInstructor} onValueChange={setFilterInstructor}>
                      <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 shadow-none text-sm min-w-[120px]">
                        <SelectValue placeholder="Instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los instructores</SelectItem>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>{instructor.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sucursal */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <Select value={filterBranch} onValueChange={setFilterBranch}>
                      <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 shadow-none text-sm min-w-[120px]">
                        <SelectValue placeholder="Sucursal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las sucursales</SelectItem>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Disciplina */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 shadow-none text-sm min-w-[100px]">
                        <SelectValue placeholder="Disciplina" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las disciplinas</SelectItem>
                        <SelectItem value="driving">Conducción</SelectItem>
                        <SelectItem value="theory">Teoría</SelectItem>
                        <SelectItem value="practical">Práctica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rango de Fechas Avanzado */}
                  <DateRangeFilterAdvanced
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                  />

                  {/* Reset filters button */}
                  {(filterInstructor !== 'all' || filterBranch !== 'all' || filterType !== 'all' || startDate || endDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterInstructor('all');
                        setFilterBranch('all');
                        setFilterType('all');
                        setStartDate(undefined);
                        setEndDate(undefined);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 h-auto"
                    >
                      ✕ Limpiar
                    </Button>
                  )}

                  {/* Indicador de resultados */}
                  <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-siclo-green/10 text-siclo-green text-xs font-medium flex-shrink-0">
                    <Star className="w-3 h-3" />
                    <span className="hidden sm:inline">{ratingsPagination.total || ratings.length} resultados</span>
                    <span className="sm:hidden">{ratingsPagination.total || ratings.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Stats de calificaciones desde el servidor */}
            <RatingStatsCards 
              branchId={filterBranch !== 'all' ? filterBranch : undefined}
              instructorId={filterInstructor !== 'all' ? filterInstructor : undefined}
              startDate={formatDateForAPI(startDate)}
              endDate={formatDateForAPI(endDate)}
            />
            
            {/* Tabla de calificaciones sin scrollarea, solo calificaciones */}
            <Card className="siclo-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-siclo-dark">
                    Calificaciones ({ratingsPagination.total || ratings.length})
                  </CardTitle>
                  <Badge variant="outline" className="border-siclo-green text-siclo-green">
                    Página {ratingsCurrentPage} de {ratingsTotalPages}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {ratings.length === 0 ? (
                  <div className="text-center text-siclo-dark/60 py-12">
                    <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No hay calificaciones que coincidan con los filtros</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="w-[100px] text-xs font-medium">Fecha</TableHead>
                          <TableHead className="text-xs font-medium">Instructor</TableHead>
                          <TableHead className="text-xs font-medium hidden sm:table-cell">Sucursal</TableHead>
                          <TableHead className="text-xs font-medium hidden md:table-cell">NPS</TableHead>
                          <TableHead className="text-xs font-medium hidden lg:table-cell">Instructor Rating</TableHead>
                          <TableHead className="text-xs font-medium hidden xl:table-cell">Limpieza</TableHead>
                          <TableHead className="text-xs font-medium hidden xl:table-cell">Audio</TableHead>
                          <TableHead className="w-[80px] text-xs font-medium">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ratings
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                              <TableCell className="text-xs text-gray-600">
                                {new Date(item.createdAt).toLocaleDateString('es-ES', { 
                                  day: '2-digit', 
                                  month: '2-digit',
                                  year: '2-digit'
                                })}
                              </TableCell>
                              <TableCell className="font-medium text-sm max-w-[150px]">
                                <div className="truncate" title={item.instructorName}>
                                  {item.instructorName}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-gray-600 hidden sm:table-cell">
                                <div className="truncate max-w-[120px]" title={getBranchName(item.branchId)}>
                                  {getBranchName(item.branchId)}
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge className="bg-amber-100 text-amber-800 text-xs">
                                  ⭐ {typeof item.npsScore === 'number' ? item.npsScore.toFixed(1) : item.npsScore}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-gray-600 hidden lg:table-cell">
                                {item.instructorRating}/5
                              </TableCell>
                              <TableCell className="text-xs text-gray-600 hidden xl:table-cell">
                                {item.cleanlinessRating}/5
                              </TableCell>
                              <TableCell className="text-xs text-gray-600 hidden xl:table-cell">
                                {item.audioRating}/5
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[160px]">
                                    <DropdownMenuItem onClick={() => handleViewDetail(item, 'rating')}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Ver detalle
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteRating(item.id)}
                                      className="text-red-600"
                                      disabled={deletingItem === item.id}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {deletingItem === item.id ? 'Eliminando...' : 'Eliminar'}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}


              </CardContent>
            </Card>
          </TabsContent>
           

          <TabsContent value="managers" className="space-y-6">
            {/* Header optimizado para móvil y desktop */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-siclo-light/30">
              <div>
                <h2 className="text-xl font-bold text-siclo-dark flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Gestión de Personal
                </h2>
                <p className="text-sm text-siclo-dark/70 mt-1">
                  Gestiona managers y supervisors del sistema ({managementUsers.length} usuarios)
                </p>
              </div>
              <Button 
                className="bg-siclo-green text-white hover:bg-siclo-green/90 w-full sm:w-auto" 
                onClick={() => setAddManagerModalOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar Usuario
              </Button>
            </div>

            <Card className="siclo-card overflow-hidden">
              <CardContent className="p-0">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2 text-siclo-dark">Cargando usuarios...</span>
                  </div>
                ) : managementUsers.length > 0 ? (
                  <>
                    {/* Vista móvil - Cards */}
                    <div className="lg:hidden">
                      <div className="space-y-3 p-4">
                        {managementUsers.map((user) => (
                          <Card key={user.id} className="border border-siclo-light/50 hover:shadow-md transition-all duration-200">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* Header del usuario */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <Avatar className="h-10 w-10 border-2 border-siclo-green/20">
                                      <AvatarImage src={user.image} alt={user.name} />
                                      <AvatarFallback className="bg-siclo-green text-white font-medium">
                                        {getInitials(user.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <p className="font-semibold text-siclo-dark truncate">{user.name}</p>
                                        <div className="flex items-center space-x-1">
                                          {getRoleIcon(user.role)}
                                        </div>
                                      </div>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${
                                          user.role === UserRole.MANAGER ? 'border-siclo-green text-siclo-green' :
                                          user.role === UserRole.SUPERVISOR ? 'border-purple-400 text-purple-700' :
                                          'border-gray-400 text-gray-700'
                                        }`}
                                      >
                                        {getRoleText(user.role)}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8" 
                                      onClick={() => { setSelectedUser(user); setEditUserModalOpen(true); }} 
                                      title="Editar"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
                                      onClick={() => handleDeleteUser(user.id, user.name || user.email)} 
                                      title="Eliminar"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Información de contacto */}
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center text-siclo-dark/70">
                                    <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                  </div>
                                  {user.phone && (
                                    <div className="flex items-center text-siclo-dark/70">
                                      <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                                      <span>{user.phone}</span>
                                    </div>
                                  )}
                                  {user.branches && user.branches.length > 0 && (
                                    <div className="flex items-center text-siclo-dark/70">
                                      <Store className="h-3 w-3 mr-2 flex-shrink-0 text-siclo-blue" />
                                      <span className="truncate text-xs">
                                        {user.branches.map(b => b.name).join(', ')}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Footer */}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                  <div className="text-xs text-siclo-dark/40">
                                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                  </div>
                                  <div className={`text-xs font-medium ${
                                    user.isActive ? 'text-emerald-600' : 'text-red-600'
                                  }`}>
                                    {user.isActive ? '● Activo' : '● Inactivo'}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Vista desktop - Tabla */}
                    <div className="hidden lg:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50">
                            <TableHead className="font-semibold text-siclo-dark">Usuario</TableHead>
                            <TableHead className="font-semibold text-siclo-dark">Rol</TableHead>
                            <TableHead className="font-semibold text-siclo-dark">Contacto</TableHead>
                            <TableHead className="font-semibold text-siclo-dark">Sucursales</TableHead>
                            <TableHead className="font-semibold text-siclo-dark">Estado</TableHead>
                            <TableHead className="font-semibold text-siclo-dark">Creado</TableHead>
                            <TableHead className="w-[100px] font-semibold text-siclo-dark">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {managementUsers.map((user) => (
                            <TableRow key={user.id} className="hover:bg-gray-50/50">
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8 border border-siclo-green/20">
                                    <AvatarImage src={user.image} alt={user.name} />
                                    <AvatarFallback className="bg-siclo-green text-white text-xs">
                                      {getInitials(user.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-siclo-dark">{user.name}</p>
                                    <p className="text-sm text-siclo-dark/60">{user.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {getRoleIcon(user.role)}
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      user.role === UserRole.MANAGER ? 'border-siclo-green text-siclo-green' :
                                      user.role === UserRole.SUPERVISOR ? 'border-purple-400 text-purple-700' :
                                      'border-gray-400 text-gray-700'
                                    }`}
                                  >
                                    {getRoleText(user.role)}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                {user.phone && (
                                  <div className="flex items-center text-sm text-siclo-dark/70">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {user.phone}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {user.branches && user.branches.length > 0 ? (
                                  <div className="flex items-center text-sm text-siclo-dark/70">
                                    <Store className="h-3 w-3 mr-1 text-siclo-blue" />
                                    <span className="truncate max-w-[150px]">
                                      {user.branches.map(b => b.name).join(', ')}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">Sin sucursal</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    user.isActive 
                                      ? 'border-emerald-300 text-emerald-700 bg-emerald-50' 
                                      : 'border-red-300 text-red-700 bg-red-50'
                                  }`}
                                >
                                  {user.isActive ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-siclo-dark/60">
                                  {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8" 
                                    onClick={() => { setSelectedUser(user); setEditUserModalOpen(true); }} 
                                    title="Editar"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
                                    onClick={() => handleDeleteUser(user.id, user.name || user.email)} 
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-siclo-dark/60 py-16">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium mb-2">No hay usuarios registrados</h3>
                    <p className="text-sm text-siclo-dark/50 mb-6">
                      Comienza agregando managers y supervisors al sistema
                    </p>
                    <Button 
                      className="bg-siclo-green text-white hover:bg-siclo-green/90" 
                      onClick={() => setAddManagerModalOpen(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Agregar Primer Usuario
                    </Button>
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
            {/* Modal de creación de usuario */}
            <Dialog open={addManagerModalOpen} onOpenChange={setAddManagerModalOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                  <DialogTitle className="flex items-center text-siclo-dark text-xl">
                    <UserPlus className="h-6 w-6 mr-3 text-siclo-green" />
                    Agregar Usuario al Sistema
                  </DialogTitle>
                  <p className="text-sm text-siclo-dark/70 mt-2">
                    Crea un nuevo manager o supervisor para gestionar el sistema
                  </p>
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
            <AnalyticsPanel />
          </TabsContent>
        </Tabs>
      </div>
      {/* Dialog de detalle mejorado */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDetail?.type === 'complaint' ? 'Detalle de Queja' : 'Detalle de Calificación'}
              {selectedDetail?.type === 'complaint' && (
                <Badge className={`${getStatusColor(selectedDetail.status)} text-xs`}>
                  {getStatusText(selectedDetail.status)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedDetail && (
            <div className="space-y-6">
              {/* Header con badges y fecha */}
              <div className="flex flex-wrap items-center gap-3 pb-4 border-b">
                <Badge variant="outline" className="text-sm">
                  {selectedDetail.type === 'complaint' ? 'Queja' : 'Calificación'}
                </Badge>
                {selectedDetail.type === 'rating' && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    ⭐ {typeof selectedDetail.npsScore === 'number' ? selectedDetail.npsScore.toFixed(1) : selectedDetail.npsScore}
                  </Badge>
                )}
                <div className="text-sm text-gray-500 flex items-center ml-auto">
                  <Calendar className="h-4 w-4 mr-1" />
                  {selectedDetail.activityDate.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {selectedDetail.type === 'complaint' ? (
                /* Contenido de Queja */
                <div className="space-y-6">
                  {/* Información principal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h4 className="font-semibold text-siclo-dark mb-3">Información del Usuario</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-siclo-green" />
                          <span className="font-medium">{selectedDetail.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-siclo-blue" />
                          <span>{selectedDetail.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-siclo-blue" />
                          <span>{getBranchName(selectedDetail.branchId)}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-semibold text-siclo-dark mb-3">Información de la Queja</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Tipo:</span>
                          <span className="ml-2">{selectedDetail.observationType}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Prioridad:</span>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 text-xs ${
                              selectedDetail.priority === ComplaintPriority.HIGH ? 'border-red-300 text-red-700' :
                              selectedDetail.priority === ComplaintPriority.MEDIUM ? 'border-amber-300 text-amber-700' :
                              'border-green-300 text-green-700'
                            }`}
                          >
                            {getPriorityText(selectedDetail.priority)}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Estado:</span>
                          <Badge className={`${getStatusColor(selectedDetail.status)} ml-2 text-xs`}>
                            {getStatusText(selectedDetail.status)}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Detalle de la queja */}
                  <Card className="p-4">
                    <h4 className="font-semibold text-siclo-dark mb-3">Detalle de la Queja</h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 leading-relaxed">
                      {selectedDetail.detail}
                    </div>
                  </Card>

                  {/* Resolución si existe */}
                  {selectedDetail.resolution && (
                    <Card className="p-4 border-green-200 bg-green-50">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Resolución
                      </h4>
                      <div className="bg-white p-4 rounded-lg text-sm text-gray-700 leading-relaxed border border-green-200">
                        {selectedDetail.resolution}
                      </div>
                    </Card>
                  )}

                  {/* Comentarios del manager si existen */}
                  {selectedDetail.managerComments && (
                    <Card className="p-4 border-blue-200 bg-blue-50">
                      <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <MessageSquareText className="h-4 w-4" />
                        Comentarios del Manager
                      </h4>
                      <div className="bg-white p-4 rounded-lg text-sm text-gray-700 leading-relaxed border border-blue-200">
                        {selectedDetail.managerComments}
                      </div>
                    </Card>
                  )}

                  {/* Attachments */}
                  {(selectedDetail.attachments?.length > 0 || selectedDetail.resolutionAttachments?.length > 0) && (
                    <Card className="p-4">
                      <AttachmentsViewer
                        attachments={selectedDetail.attachments || []}
                        resolutionAttachments={selectedDetail.resolutionAttachments || []}
                        title="Archivos Adjuntos"
                      />
                    </Card>
                  )}
                </div>
              ) : (
                /* Contenido de Calificación */
                <div className="space-y-6">
                  {/* Información del instructor */}
                  <Card className="p-4">
                    <h4 className="font-semibold text-siclo-dark mb-3">Información de la Calificación</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Instructor:</span>
                        <span className="ml-2">{selectedDetail.instructorName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Sucursal:</span>
                        <span className="ml-2">{getBranchName(selectedDetail.branchId)}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Calificaciones */}
                  <Card className="p-4">
                    <h4 className="font-semibold text-siclo-dark mb-3">Calificaciones</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-lg text-amber-600">{selectedDetail.npsScore}</div>
                        <div className="text-gray-600 text-xs">NPS Score</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-lg text-blue-600">{selectedDetail.instructorRating}/5</div>
                        <div className="text-gray-600 text-xs">Instructor</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-lg text-green-600">{selectedDetail.cleanlinessRating}/5</div>
                        <div className="text-gray-600 text-xs">Limpieza</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-lg text-purple-600">{selectedDetail.audioRating}/5</div>
                        <div className="text-gray-600 text-xs">Audio</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-lg text-red-600">{selectedDetail.attentionQualityRating}/5</div>
                        <div className="text-gray-600 text-xs">Atención</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-lg text-indigo-600">{selectedDetail.amenitiesRating}/5</div>
                        <div className="text-gray-600 text-xs">Comodidades</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-lg text-cyan-600">{selectedDetail.punctualityRating}/5</div>
                        <div className="text-gray-600 text-xs">Puntualidad</div>
                      </div>
                    </div>
                  </Card>

                  {/* Comentarios si existen */}
                  {selectedDetail.comments && (
                    <Card className="p-4">
                      <h4 className="font-semibold text-siclo-dark mb-3">Comentarios</h4>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 leading-relaxed">
                        {selectedDetail.comments}
                      </div>
                    </Card>
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
