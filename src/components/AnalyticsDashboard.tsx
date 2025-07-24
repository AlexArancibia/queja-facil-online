
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Building2,
  Calendar
} from 'lucide-react';
import { type Complaint, MOCK_STORES, OBSERVATION_TYPES } from '@/types/complaint';

const AnalyticsDashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    const allComplaints: Complaint[] = JSON.parse(localStorage.getItem('complaints') || '[]');
    const allStores = JSON.parse(localStorage.getItem('stores') || '[]');
    setComplaints(allComplaints);
    setStores(allStores);
  }, []);

  const getAdvancedStats = () => {
    const total = complaints.length;
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const thisMonthComplaints = complaints.filter(c => {
      const date = new Date(c.createdAt);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    
    const lastMonthComplaints = complaints.filter(c => {
      const date = new Date(c.createdAt);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const monthGrowth = lastMonthComplaints.length === 0 ? 100 : 
      ((thisMonthComplaints.length - lastMonthComplaints.length) / lastMonthComplaints.length) * 100;

    // Resolution time calculation
    const resolvedComplaints = complaints.filter(c => c.status === 'Resuelta');
    const avgResolutionTime = resolvedComplaints.length > 0 
      ? resolvedComplaints.reduce((acc, c) => {
          const created = new Date(c.createdAt).getTime();
          const updated = new Date(c.updatedAt).getTime();
          return acc + (updated - created);
        }, 0) / resolvedComplaints.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Status distribution
    const pending = complaints.filter(c => c.status === 'Pendiente').length;
    const inProgress = complaints.filter(c => c.status === 'En proceso').length;
    const resolved = complaints.filter(c => c.status === 'Resuelta').length;
    const rejected = complaints.filter(c => c.status === 'Rechazada').length;

    // Priority distribution
    const highPriority = complaints.filter(c => c.priority === 'Alta').length;
    const mediumPriority = complaints.filter(c => c.priority === 'Media').length;
    const lowPriority = complaints.filter(c => c.priority === 'Baja').length;

    // Store performance
    const storeStats = MOCK_STORES.map(store => {
      const storeComplaints = complaints.filter(c => c.store === store.id);
      const storeResolved = storeComplaints.filter(c => c.status === 'Resuelta').length;
      const resolutionRate = storeComplaints.length > 0 ? (storeResolved / storeComplaints.length) * 100 : 0;
      
      return {
        id: store.id,
        name: store.name,
        total: storeComplaints.length,
        resolved: storeResolved,
        resolutionRate,
        avgDays: storeComplaints.length > 0 ? 
          storeComplaints.reduce((acc, c) => {
            const days = Math.floor((new Date().getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
            return acc + days;
          }, 0) / storeComplaints.length : 0
      };
    }).sort((a, b) => b.total - a.total);

    // Type analysis
    const typeStats = OBSERVATION_TYPES.map(type => ({
      name: type,
      count: complaints.filter(c => c.observationType === type).length,
      resolved: complaints.filter(c => c.observationType === type && c.status === 'Resuelta').length
    })).sort((a, b) => b.count - a.count);

    return {
      total,
      thisMonth: thisMonthComplaints.length,
      lastMonth: lastMonthComplaints.length,
      monthGrowth,
      avgResolutionTime,
      pending,
      inProgress,
      resolved,
      rejected,
      highPriority,
      mediumPriority,
      lowPriority,
      storeStats,
      typeStats,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0
    };
  };

  const stats = getAdvancedStats();

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = "siclo-blue" }: any) => (
    <Card className="siclo-card hover:shadow-xl transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-siclo-dark/70">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className={`text-3xl font-bold text-${color}`}>{value}</p>
              {trend && (
                <div className={`flex items-center text-sm ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : 
                   trend === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : null}
                  {trendValue}
                </div>
              )}
            </div>
            {subtitle && <p className="text-xs text-siclo-dark/60">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br from-${color} to-${color === 'siclo-blue' ? 'siclo-green' : 'siclo-blue'} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sugerencias"
          value={stats.total}
          subtitle="Desde el inicio"
          icon={BarChart3}
        />
        
        <StatCard
          title="Este Mes"
          value={stats.thisMonth}
          subtitle={`vs ${stats.lastMonth} mes anterior`}
          icon={Calendar}
          trend={stats.monthGrowth > 0 ? 'up' : stats.monthGrowth < 0 ? 'down' : 'neutral'}
          trendValue={`${Math.abs(stats.monthGrowth).toFixed(1)}%`}
          color="siclo-green"
        />
        
        <StatCard
          title="Tasa Resolución"
          value={`${stats.resolutionRate.toFixed(1)}%`}
          subtitle={`${stats.resolved} de ${stats.total} resueltas`}
          icon={Target}
          color="emerald-600"
        />
        
        <StatCard
          title="Tiempo Promedio"
          value={`${stats.avgResolutionTime.toFixed(1)}`}
          subtitle="días para resolver"
          icon={Clock}
          color="amber-600"
        />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="siclo-card">
          <CardHeader className="bg-gradient-to-r from-siclo-green/10 to-siclo-blue/10">
            <CardTitle className="text-siclo-dark flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Estado de Sugerencias
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-amber-600 mr-3" />
                  <span className="font-medium text-amber-800">Pendientes</span>
                </div>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-lg font-bold px-3 py-1">
                  {stats.pending}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-800">En Proceso</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-lg font-bold px-3 py-1">
                  {stats.inProgress}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
                  <span className="font-medium text-emerald-800">Resueltas</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-lg font-bold px-3 py-1">
                  {stats.resolved}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-3" />
                  <span className="font-medium text-red-800">Rechazadas</span>
                </div>
                <Badge className="bg-red-100 text-red-800 border-red-200 text-lg font-bold px-3 py-1">
                  {stats.rejected}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="siclo-card">
          <CardHeader className="bg-gradient-to-r from-siclo-blue/10 to-siclo-green/10">
            <CardTitle className="text-siclo-dark flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Distribución por Prioridad
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="font-medium text-red-800">Alta Prioridad</span>
                <Badge className="bg-red-100 text-red-800 border-red-200 text-lg font-bold px-3 py-1">
                  {stats.highPriority}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="font-medium text-amber-800">Media Prioridad</span>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-lg font-bold px-3 py-1">
                  {stats.mediumPriority}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="font-medium text-emerald-800">Baja Prioridad</span>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-lg font-bold px-3 py-1">
                  {stats.lowPriority}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store Performance */}
      <Card className="siclo-card">
        <CardHeader className="bg-gradient-to-r from-siclo-green/10 to-siclo-blue/10">
          <CardTitle className="text-siclo-dark flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Rendimiento por Local
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.storeStats.map((store) => (
              <div key={store.id} className="border border-siclo-light rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-siclo-dark">{store.name}</h4>
                  <Badge 
                    className={
                      store.resolutionRate >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      store.resolutionRate >= 60 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }
                  >
                    {store.resolutionRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-siclo-dark/70">Total quejas:</span>
                    <span className="font-medium text-siclo-dark">{store.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-siclo-dark/70">Resueltas:</span>
                    <span className="font-medium text-emerald-600">{store.resolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-siclo-dark/70">Promedio días:</span>
                    <span className="font-medium text-siclo-blue">{store.avgDays.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Type Analysis */}
      <Card className="siclo-card">
        <CardHeader className="bg-gradient-to-r from-siclo-blue/10 to-siclo-green/10">
          <CardTitle className="text-siclo-dark">Análisis por Tipo de Sugerencia</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.typeStats.map((type, index) => (
              <div key={index} className="border border-siclo-light rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-siclo-dark">{type.name}</h4>
                  <Badge className="bg-siclo-light text-siclo-dark">
                    {type.count}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-siclo-dark/70">Resueltas:</span>
                  <span className="font-medium text-emerald-600">
                    {type.resolved} ({type.count > 0 ? ((type.resolved / type.count) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
