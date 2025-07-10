
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Complaint, MOCK_STORES } from '@/types/complaint';
import { 
  ShieldCheck, 
  LogOut, 
  BarChart3, 
  Users, 
  Store,
  MessageSquareText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadComplaints();
  }, [user, navigate]);

  const loadComplaints = () => {
    const allComplaints: Complaint[] = JSON.parse(localStorage.getItem('complaints') || '[]');
    setComplaints(allComplaints);
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

  const getOverallStats = () => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pendiente').length;
    const inProgress = complaints.filter(c => c.status === 'En proceso').length;
    const resolved = complaints.filter(c => c.status === 'Resuelta').length;
    const rejected = complaints.filter(c => c.status === 'Rechazada').length;

    return { total, pending, inProgress, resolved, rejected };
  };

  const getStoreStats = () => {
    return MOCK_STORES.map(store => {
      const storeComplaints = complaints.filter(c => c.store === store.id);
      return {
        ...store,
        total: storeComplaints.length,
        pending: storeComplaints.filter(c => c.status === 'Pendiente').length,
        resolved: storeComplaints.filter(c => c.status === 'Resuelta').length,
        resolutionRate: storeComplaints.length > 0 
          ? ((storeComplaints.filter(c => c.status === 'Resuelta').length / storeComplaints.length) * 100).toFixed(1)
          : '0'
      };
    });
  };

  const getTypeStats = () => {
    const types = [...new Set(complaints.map(c => c.observationType))];
    return types.map(type => ({
      type,
      count: complaints.filter(c => c.observationType === type).length,
      percentage: ((complaints.filter(c => c.observationType === type).length / complaints.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
  };

  const getPriorityStats = () => {
    return [
      { priority: 'Alta', count: complaints.filter(c => c.priority === 'Alta').length },
      { priority: 'Media', count: complaints.filter(c => c.priority === 'Media').length },
      { priority: 'Baja', count: complaints.filter(c => c.priority === 'Baja').length }
    ];
  };

  const overallStats = getOverallStats();
  const storeStats = getStoreStats();
  const typeStats = getTypeStats();
  const priorityStats = getPriorityStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel Administrador</h1>
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
        <Tabs defaultValue="estadisticas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            <TabsTrigger value="quejas">Todas las Quejas</TabsTrigger>
            <TabsTrigger value="locales">Gestión Locales</TabsTrigger>
            <TabsTrigger value="managers">Gestión Managers</TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="estadisticas" className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <MessageSquareText className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Quejas</p>
                      <p className="text-2xl font-semibold text-gray-900">{overallStats.total}</p>
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
                      <p className="text-2xl font-semibold text-gray-900">{overallStats.pending}</p>
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
                      <p className="text-2xl font-semibold text-gray-900">{overallStats.inProgress}</p>
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
                      <p className="text-2xl font-semibold text-gray-900">{overallStats.resolved}</p>
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
                      <p className="text-2xl font-semibold text-gray-900">{overallStats.rejected}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Store Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Store className="h-5 w-5 mr-2" />
                    Rendimiento por Local
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {storeStats.map((store) => (
                      <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-gray-600">{store.address}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{store.total}</p>
                          <p className="text-sm text-green-600">{store.resolutionRate}% resueltas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Complaint Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Tipos de Quejas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {typeStats.map((stat) => (
                      <div key={stat.type} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stat.type}</span>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">{stat.count}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${stat.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">{stat.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Distribución por Prioridad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {priorityStats.map((stat) => (
                    <div key={stat.priority} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold">{stat.count}</p>
                      <Badge className={getPriorityColor(stat.priority)}>
                        {stat.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Complaints Tab */}
          <TabsContent value="quejas">
            <Card>
              <CardHeader>
                <CardTitle>Todas las Quejas ({complaints.length})</CardTitle>
                <CardDescription>Vista completa de todas las quejas del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {complaints.map((complaint) => (
                    <div key={complaint.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">{complaint.id}</p>
                          <p className="text-sm text-gray-600">{complaint.fullName} • {complaint.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status}
                          </Badge>
                          <Badge className={getPriorityColor(complaint.priority)}>
                            {complaint.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Local:</strong> {getStoreName(complaint.store)}</p>
                          <p><strong>Tipo:</strong> {complaint.observationType}</p>
                        </div>
                        <div>
                          <p><strong>Fecha:</strong> {new Date(complaint.createdAt).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                        {complaint.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stores Management Tab */}
          <TabsContent value="locales">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  Gestión de Locales
                </CardTitle>
                <CardDescription>Administrar locales del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_STORES.map((store) => {
                    const storeComplaints = complaints.filter(c => c.store === store.id);
                    return (
                      <Card key={store.id}>
                        <CardContent className="pt-4">
                          <h3 className="font-semibold text-lg">{store.name}</h3>
                          <p className="text-gray-600 text-sm mb-3">{store.address}</p>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">Total quejas: {storeComplaints.length}</p>
                              <p className="text-sm text-gray-600">
                                Resueltas: {storeComplaints.filter(c => c.status === 'Resuelta').length}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Managers Tab */}
          <TabsContent value="managers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Gestión de Managers
                </CardTitle>
                <CardDescription>Administrar managers del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">Ana García</h3>
                          <p className="text-sm text-gray-600">manager@tienda.com</p>
                          <p className="text-sm text-gray-600">Locales: Tienda Centro, Tienda Norte</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="outline" size="sm">Desactivar</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Agregar Nuevo Manager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
