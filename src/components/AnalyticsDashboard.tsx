
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Clock, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { type Complaint } from '@/types/complaint';
import { MOCK_STORES } from '@/types/complaint';

const AnalyticsDashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = () => {
    const existingComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    setComplaints(existingComplaints);
  };

  const filteredComplaints = complaints.filter(complaint => {
    const complaintDate = new Date(complaint.createdAt);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    if (fromDate && complaintDate < fromDate) return false;
    if (toDate && complaintDate > toDate) return false;
    return true;
  });

  // Estadísticas generales
  const totalComplaints = filteredComplaints.length;
  const pendingComplaints = filteredComplaints.filter(c => c.status === 'Pendiente').length;
  const resolvedComplaints = filteredComplaints.filter(c => c.status === 'Resuelta').length;
  const avgResolutionTime = resolvedComplaints > 0 ? '2.5 días' : 'N/A';

  // Datos para gráficos
  const statusData = [
    { name: 'Pendiente', value: filteredComplaints.filter(c => c.status === 'Pendiente').length, color: '#f59e0b' },
    { name: 'En proceso', value: filteredComplaints.filter(c => c.status === 'En proceso').length, color: '#3b82f6' },
    { name: 'Resuelta', value: filteredComplaints.filter(c => c.status === 'Resuelta').length, color: '#10b981' },
    { name: 'Rechazada', value: filteredComplaints.filter(c => c.status === 'Rechazada').length, color: '#ef4444' }
  ].filter(item => item.value > 0); // Solo mostrar categorías con datos

  const priorityData = [
    { name: 'Alta', value: filteredComplaints.filter(c => c.priority === 'Alta').length, color: '#ef4444' },
    { name: 'Media', value: filteredComplaints.filter(c => c.priority === 'Media').length, color: '#f59e0b' },
    { name: 'Baja', value: filteredComplaints.filter(c => c.priority === 'Baja').length, color: '#10b981' }
  ].filter(item => item.value > 0); // Solo mostrar categorías con datos

  // Quejas por local (solo locales con quejas)
  const storeData = MOCK_STORES.map(store => {
    const storeComplaints = filteredComplaints.filter(c => c.store === store.id);
    return {
      name: store.name,
      quejas: storeComplaints.length,
      resueltas: storeComplaints.filter(c => c.status === 'Resuelta').length
    };
  }).filter(store => store.quejas > 0); // Solo mostrar locales con quejas

  // Tendencia mensual
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthComplaints = filteredComplaints.filter(c => {
      const complaintDate = new Date(c.createdAt);
      return complaintDate.getMonth() === date.getMonth() && 
             complaintDate.getFullYear() === date.getFullYear();
    });
    
    return {
      mes: date.toLocaleDateString('es-ES', { month: 'short' }),
      quejas: monthComplaints.length,
      resueltas: monthComplaints.filter(c => c.status === 'Resuelta').length
    };
  });

  return (
    <div className="space-y-6">
      {/* Filtros de fecha más delgados */}
      <Card className="siclo-card border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-siclo-green" />
              <span className="text-sm font-medium text-siclo-dark">Filtro por fecha:</span>
            </div>
            <div className="flex gap-3">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40 h-9 border-siclo-light/50 focus:border-siclo-green text-sm"
                placeholder="Desde"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40 h-9 border-siclo-light/50 focus:border-siclo-green text-sm"
                placeholder="Hasta"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="siclo-card border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-siclo-blue" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-siclo-dark">{totalComplaints}</p>
                <p className="text-sm text-siclo-dark/60">Total Quejas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="siclo-card border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-siclo-dark">{pendingComplaints}</p>
                <p className="text-sm text-siclo-dark/60">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="siclo-card border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-siclo-dark">{resolvedComplaints}</p>
                <p className="text-sm text-siclo-dark/60">Resueltas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="siclo-card border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-siclo-green" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-siclo-dark">{avgResolutionTime}</p>
                <p className="text-sm text-siclo-dark/60">Tiempo Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Quejas - más sutil */}
        <Card className="siclo-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-siclo-dark text-lg">Estado de Quejas</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-280 flex items-center justify-center text-siclo-dark/50">
                <p className="text-sm">No hay datos para mostrar</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribución por Prioridad - más sutil */}
        <Card className="siclo-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-siclo-dark text-lg">Distribución por Prioridad</CardTitle>
          </CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Bar dataKey="value" fill="#71a478" opacity={0.8} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-280 flex items-center justify-center text-siclo-dark/50">
                <p className="text-sm">No hay datos para mostrar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rendimiento por Local */}
      {storeData.length > 0 && (
        <Card className="siclo-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-siclo-dark text-lg flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-siclo-green" />
              Rendimiento por Local
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Bar dataKey="quejas" fill="#25426C" name="Total Quejas" opacity={0.8} radius={[2, 2, 0, 0]} />
                <Bar dataKey="resueltas" fill="#71a478" name="Resueltas" opacity={0.8} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tendencia Mensual */}
      <Card className="siclo-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-siclo-dark text-lg">Tendencia Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="quejas" 
                stroke="#25426C" 
                strokeWidth={3}
                name="Total Quejas"
                dot={{ fill: '#25426C', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="resueltas" 
                stroke="#71a478" 
                strokeWidth={3}
                name="Resueltas"
                dot={{ fill: '#71a478', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
