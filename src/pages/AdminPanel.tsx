
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
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import InstructorManagement from '@/components/InstructorManagement';
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
    if (filterStore !== 'all' && item.store !== filterStore) return false;
    if (filterStatus !== 'all' && item.type === 'complaint' && item.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => b.activityDate.getTime() - a.activityDate.getTime());

  const getQuickStats = () => {
    const totalComplaints = complaints.length;
    const totalRatings = ratings.length;
    const pendingComplaints = complaints.filter(c => c.status === 'Pendiente').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resuelta').length;
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
    const totalManagers = managers.length;

    return { totalComplaints, totalRatings, pendingComplaints, resolvedComplaints, averageRating, totalManagers };
  };

  const quickStats = getQuickStats();

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
            <DashboardStats complaints={complaints} ratings={ratings} />
            <RecentActivity complaints={complaints} ratings={ratings} />
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

            {/* Combined Activity List */}
            <Card className="siclo-card">
              <CardHeader>
                <CardTitle className="text-siclo-dark">
                  Actividad Reciente ({filteredData.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredData.map((item) => (
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
                  
                  {filteredData.length === 0 && (
                    <div className="text-center text-siclo-dark/60 py-12">
                      <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No hay actividad que coincida con los filtros</p>
                    </div>
                  )}
                </div>
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
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
