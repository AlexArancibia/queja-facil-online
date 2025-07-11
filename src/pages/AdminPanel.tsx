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
import AddManagerForm from '@/components/AddManagerForm';
import StoreManagement from '@/components/StoreManagement';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import InstructorManagement from '@/components/InstructorManagement';
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
  GraduationCap
} from 'lucide-react';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStore, setFilterStore] = useState('all');

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

  const filteredComplaints = complaints.filter(complaint => {
    if (filterStatus !== 'all' && complaint.status !== filterStatus) return false;
    if (filterStore !== 'all' && complaint.store !== filterStore) return false;
    return true;
  });

  const getQuickStats = () => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pendiente').length;
    const resolved = complaints.filter(c => c.status === 'Resuelta').length;
    const totalManagers = managers.length;

    return { total, pending, resolved, totalManagers };
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
            <TabsTrigger value="complaints" className="data-[state=active]:bg-siclo-green data-[state=active]:text-white font-medium">
              <MessageSquareText className="h-4 w-4 mr-2" />
              Quejas
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
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="siclo-card hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-siclo-dark/70">Total Quejas</p>
                      <p className="text-3xl font-bold text-siclo-dark">{quickStats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-siclo-blue to-siclo-green rounded-xl flex items-center justify-center shadow-lg">
                      <MessageSquareText className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="siclo-card hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-siclo-dark/70">Managers</p>
                      <p className="text-3xl font-bold text-siclo-dark">{quickStats.totalManagers}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="siclo-card hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-siclo-dark/70">Resueltas</p>
                      <p className="text-3xl font-bold text-emerald-600">{quickStats.resolved}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="siclo-card hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-siclo-dark/70">Pendientes</p>
                      <p className="text-3xl font-bold text-amber-600">{quickStats.pending}</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Summary */}
            <Card className="siclo-card">
              <CardHeader className="bg-gradient-to-r from-siclo-green/10 to-siclo-blue/10">
                <CardTitle className="text-siclo-dark flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Resumen de Actividad
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-siclo-light/30 rounded-xl">
                    <p className="text-2xl font-bold text-siclo-blue">{MOCK_STORES.length}</p>
                    <p className="text-sm text-siclo-dark/70">Locales Activos</p>
                  </div>
                  <div className="text-center p-4 bg-siclo-light/30 rounded-xl">
                    <p className="text-2xl font-bold text-siclo-green">{quickStats.totalManagers}</p>
                    <p className="text-sm text-siclo-dark/70">Managers Registrados</p>
                  </div>
                  <div className="text-center p-4 bg-siclo-light/30 rounded-xl">
                    <p className="text-2xl font-bold text-amber-600">
                      {quickStats.total > 0 ? ((quickStats.resolved / quickStats.total) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-sm text-siclo-dark/70">Tasa de Resolución</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complaints" className="space-y-6">
            {/* Filters */}
            <Card className="siclo-card">
              <CardHeader>
                <CardTitle className="flex items-center text-siclo-dark">
                  <Filter className="h-5 w-5 mr-2" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div>
                    <Label className="text-siclo-dark font-medium">Estado</Label>
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
                  <div>
                    <Label className="text-siclo-dark font-medium">Local</Label>
                    <Select value={filterStore} onValueChange={setFilterStore}>
                      <SelectTrigger className="w-48">
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

            {/* Complaints List */}
            <Card className="siclo-card">
              <CardHeader>
                <CardTitle className="text-siclo-dark">
                  Quejas ({filteredComplaints.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredComplaints.map((complaint) => (
                    <Card key={complaint.id} className="border border-siclo-light hover:shadow-lg transition-all duration-300">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-2">
                            <Badge className={`${getStatusColor(complaint.status)} border`}>
                              {complaint.status}
                            </Badge>
                            <Badge className={`${getPriorityColor(complaint.priority)} border`}>
                              {complaint.priority}
                            </Badge>
                          </div>
                          <div className="text-xs text-siclo-dark/60 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(complaint.createdAt).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-siclo-green" />
                            <span className="font-medium text-siclo-dark">{complaint.fullName}</span>
                          </div>
                          <div className="flex items-center">
                            <Store className="h-4 w-4 mr-2 text-siclo-blue" />
                            <span className="text-siclo-dark/70">{getStoreName(complaint.store)}</span>
                          </div>
                          <div className="text-siclo-dark/70">
                            {complaint.observationType}
                          </div>
                        </div>
                        
                        <p className="text-sm text-siclo-dark/70 mt-2 line-clamp-2">
                          {complaint.detail}
                        </p>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="managers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Manager Form */}
              <AddManagerForm onManagerAdded={loadData} />

              {/* Existing Managers */}
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
