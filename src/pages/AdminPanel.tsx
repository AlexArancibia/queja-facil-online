import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { type Complaint, MOCK_STORES, OBSERVATION_TYPES } from '@/types/complaint';
import { type Rating } from '@/types/instructor';
import AddManagerForm from '@/components/AddManagerForm';
import StoreManagement from '@/components/StoreManagement';
import InstructorManagement from '@/components/InstructorManagement';
import DashboardStats from '@/components/DashboardStats';
import RecentActivity from '@/components/RecentActivity';
import { DateRangeFilter } from '@/components/DateRangeFilter';
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
  Star
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Create a proper combined type for unified activity view
type ComplaintActivity = Complaint & { type: 'complaint'; activityDate: Date };
type RatingActivity = Omit<Rating, 'date'> & { type: 'rating'; activityDate: Date; store: string; fullName: string };
type CombinedActivity = ComplaintActivity | RatingActivity;

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStore, setFilterStore] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const itemsPerPage = 15;

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = () => {
    // Load complaints
    const allComplaints: Complaint[] = JSON.parse(localStorage.getItem('complaints') || '[]');
    setComplaints(allComplaints);

    // Load ratings
    const allRatings: Rating[] = JSON.parse(localStorage.getItem('ratings') || '[]');
    setRatings(allRatings);

    // Load managers
    const allManagers = JSON.parse(localStorage.getItem('managers') || '[]');
    setManagers(allManagers);
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

  const getStoreName = (storeId: string) => {
    const store = MOCK_STORES.find(s => s.id === storeId);
    return store ? store.name : storeId;
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
      activityDate: new Date(rating.createdAt),
      store: rating.storeId,
      fullName: `Calificación de ${rating.instructorName}`
    }))
  ];

  const filteredData = combinedData.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStore !== 'all' && item.store !== filterStore) return false;
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
    const pendingComplaints = filteredComplaints.filter(c => c.status === 'Pendiente').length;
    const resolvedComplaints = filteredComplaints.filter(c => c.status === 'Resuelta').length;
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
    const totalManagers = managers.length;

    return { totalComplaints, totalRatings, pendingComplaints, resolvedComplaints, averageRating, totalManagers };
  };

  const quickStats = getQuickStats();

  // Data for pie charts
  const statusData = [
    { name: 'Pendiente', value: filteredComplaints.filter(c => c.status === 'Pendiente').length, color: '#f59e0b' },
    { name: 'En proceso', value: filteredComplaints.filter(c => c.status === 'En proceso').length, color: '#3b82f6' },
    { name: 'Resuelta', value: filteredComplaints.filter(c => c.status === 'Resuelta').length, color: '#10b981' },
    { name: 'Rechazada', value: filteredComplaints.filter(c => c.status === 'Rechazada').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const priorityData = [
    { name: 'Alta', value: filteredComplaints.filter(c => c.priority === 'Alta').length, color: '#ef4444' },
    { name: 'Media', value: filteredComplaints.filter(c => c.priority === 'Media').length, color: '#f59e0b' },
    { name: 'Baja', value: filteredComplaints.filter(c => c.priority === 'Baja').length, color: '#10b981' },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-siclo-light via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b border-siclo-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 siclo-gradient rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-siclo-dark">Panel Administrador - Siclo</h1>
                <p className="text-sm text-siclo-dark/70">Bienvenido, {user?.name}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={logout} 
              className="border-siclo-green/30 text-siclo-green hover:bg-siclo-green hover:text-white transition-all duration-300 shadow-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm shadow-lg border border-siclo-light/50 h-14">
            <TabsTrigger value="overview" className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium">
              <Activity className="h-4 w-4 mr-2" />
              Actividad
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

          <TabsContent value="overview" className="space-y-6">
            {/* Date Range Filter */}
            <Card className="siclo-card border-2 border-siclo-light/30">
              <CardHeader>
                <CardTitle className="flex items-center text-siclo-dark">
                  <Calendar className="h-5 w-5 mr-2" />
                  Filtrar por Rango de Fechas
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

            {/* Enhanced Dashboard Stats with icons fix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="siclo-card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700">Total Quejas</p>
                      <p className="text-3xl font-bold text-red-900">{quickStats.totalComplaints}</p>
                    </div>
                    <MessageSquareText className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="siclo-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Total Calificaciones</p>
                      <p className="text-3xl font-bold text-blue-900">{quickStats.totalRatings}</p>
                    </div>
                    <Star className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="siclo-card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700">Quejas Pendientes</p>
                      <p className="text-3xl font-bold text-amber-900">{quickStats.pendingComplaints}</p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="siclo-card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">Quejas Resueltas</p>
                      <p className="text-3xl font-bold text-emerald-900">{quickStats.resolvedComplaints}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="siclo-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-siclo-dark">
                    <PieChart className="h-5 w-5 mr-2" />
                    Estados de Quejas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="siclo-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-siclo-dark">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Distribución por Prioridad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <RecentActivity complaints={filteredComplaints} ratings={filteredRatings} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {/* Filters */}
            <Card className="siclo-card">
              <CardHeader>
                <CardTitle className="flex items-center text-siclo-dark">
                  <Filter className="h-5 w-5 mr-2" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-siclo-dark font-medium">Tipo</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full">
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
                      <SelectTrigger className="w-full">
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
                  <div>
                    <Label className="text-siclo-dark font-medium">Local</Label>
                    <Select value={filterStore} onValueChange={setFilterStore}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los locales</SelectItem>
                        {MOCK_STORES.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Combined Activity List with Pagination */}
            <Card className="siclo-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-siclo-dark">
                    Actividad Reciente ({filteredData.length})
                  </CardTitle>
                  <Badge variant="outline" className="border-siclo-green text-siclo-green">
                    Página {currentPage} de {totalPages || 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {paginatedData.map((item) => (
                    <Card key={item.id} className="border border-siclo-light hover:shadow-lg transition-all duration-300">
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
                                ⭐ {item.npsScore.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-siclo-dark/60 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {item.activityDate.toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-siclo-green" />
                            <span className="font-medium text-siclo-dark">
                              {item.type === 'complaint' ? item.fullName : item.instructorName}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Store className="h-4 w-4 mr-2 text-siclo-blue" />
                            <span className="text-siclo-dark/70">{getStoreName(item.store)}</span>
                          </div>
                          <div className="text-siclo-dark/70">
                            {item.type === 'complaint' 
                              ? item.observationType
                              : `Instructor: ${item.instructorName}`
                            }
                          </div>
                        </div>
                        
                        {item.type === 'complaint' && (
                          <p className="text-sm text-siclo-dark/70 mt-2 line-clamp-2">
                            {item.detail}
                          </p>
                        )}
                        
                        {item.type === 'rating' && (
                          <div className="mt-2 flex items-center space-x-4 text-xs text-siclo-dark/70">
                            <span>NPS: {item.npsScore}</span>
                            <span>Instructor: {item.instructorRating}</span>
                            <span>Limpieza: {item.cleanlinessRating}</span>
                            <span>Audio: {item.audioRating}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {paginatedData.length === 0 && (
                    <div className="text-center text-siclo-dark/60 py-12">
                      <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No hay actividad que coincida con los filtros</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AddManagerForm onManagerAdded={loadData} />
              <Card className="siclo-card">
                <CardHeader className="bg-gradient-to-r from-siclo-green/10 to-siclo-blue/10">
                  <CardTitle className="text-siclo-dark flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Managers Existentes ({managers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {managers.map((manager) => (
                      <Card key={manager.id} className="border border-siclo-light hover:shadow-lg transition-all duration-300">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-siclo-dark">{manager.name}</p>
                              <p className="text-sm text-siclo-dark/70">{manager.email}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {manager.stores?.map((storeId: string) => (
                                  <Badge key={storeId} variant="outline" className="text-xs border-siclo-green/30 text-siclo-green">
                                    {getStoreName(storeId)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Badge className="bg-siclo-green/10 text-siclo-green border-siclo-green">
                              Manager
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {managers.length === 0 && (
                      <div className="text-center text-siclo-dark/60 py-12">
                        <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No hay managers registrados</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
