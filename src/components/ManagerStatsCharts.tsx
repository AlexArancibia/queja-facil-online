
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

interface ManagerStatsChartsProps {
  complaints: any[];
  ratings: any[];
  dateRange?: { from: Date; to: Date };
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#6b7280'];

const ManagerStatsCharts = ({ complaints, ratings, dateRange }: ManagerStatsChartsProps) => {
  // Filter data by date range if provided
  const filteredComplaints = dateRange 
    ? complaints.filter(c => {
        const date = new Date(c.createdAt);
        return date >= dateRange.from && date <= dateRange.to;
      })
    : complaints;

  const filteredRatings = dateRange 
    ? ratings.filter(r => {
        const date = new Date(r.createdAt);
        return date >= dateRange.from && date <= dateRange.to;
      })
    : ratings;

  // Status distribution for pie chart
  const statusData = [
    { name: 'Pendiente', value: filteredComplaints.filter(c => c.status === 'Pendiente').length, color: '#f59e0b' },
    { name: 'En proceso', value: filteredComplaints.filter(c => c.status === 'En proceso').length, color: '#3b82f6' },
    { name: 'Resuelta', value: filteredComplaints.filter(c => c.status === 'Resuelta').length, color: '#10b981' },
    { name: 'Rechazada', value: filteredComplaints.filter(c => c.status === 'Rechazada').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Priority distribution
  const priorityData = [
    { name: 'Alta', value: filteredComplaints.filter(c => c.priority === 'Alta').length, color: '#ef4444' },
    { name: 'Media', value: filteredComplaints.filter(c => c.priority === 'Media').length, color: '#f59e0b' },
    { name: 'Baja', value: filteredComplaints.filter(c => c.priority === 'Baja').length, color: '#10b981' },
  ].filter(item => item.value > 0);

  // Monthly trend data
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
    
    const monthComplaints = filteredComplaints.filter(c => {
      const cDate = new Date(c.createdAt);
      return cDate.getMonth() === date.getMonth() && cDate.getFullYear() === date.getFullYear();
    }).length;

    const monthRatings = filteredRatings.filter(r => {
      const rDate = new Date(r.createdAt);
      return rDate.getMonth() === date.getMonth() && rDate.getFullYear() === date.getFullYear();
    }).length;

    monthlyData.push({
      month: monthName,
      quejas: monthComplaints,
      calificaciones: monthRatings
    });
  }

  // Rating averages by category
  const ratingAverages = filteredRatings.length > 0 ? {
    instructor: filteredRatings.reduce((acc, r) => acc + r.instructorRating, 0) / filteredRatings.length,
    limpieza: filteredRatings.reduce((acc, r) => acc + r.cleanlinessRating, 0) / filteredRatings.length,
    audio: filteredRatings.reduce((acc, r) => acc + r.audioRating, 0) / filteredRatings.length,
    atencion: filteredRatings.reduce((acc, r) => acc + r.attentionQualityRating, 0) / filteredRatings.length,
    comodidades: filteredRatings.reduce((acc, r) => acc + r.amenitiesRating, 0) / filteredRatings.length,
    puntualidad: filteredRatings.reduce((acc, r) => acc + r.punctualityRating, 0) / filteredRatings.length,
  } : null;

  const categoryData = ratingAverages ? [
    { category: 'Instructor', rating: ratingAverages.instructor },
    { category: 'Limpieza', rating: ratingAverages.limpieza },
    { category: 'Audio', rating: ratingAverages.audio },
    { category: 'Atención', rating: ratingAverages.atencion },
    { category: 'Comodidades', rating: ratingAverages.comodidades },
    { category: 'Puntualidad', rating: ratingAverages.puntualidad },
  ] : [];

  const averageNPS = filteredRatings.length > 0 
    ? filteredRatings.reduce((acc, r) => acc + r.npsScore, 0) / filteredRatings.length 
    : 0;

  const resolutionRate = filteredComplaints.length > 0 
    ? (filteredComplaints.filter(c => c.status === 'Resuelta').length / filteredComplaints.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="siclo-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-siclo-dark/70">Total Sugerencias</p>
                <p className="text-2xl font-bold text-siclo-dark">{filteredComplaints.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="siclo-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-siclo-dark/70">Tasa Resolución</p>
                <p className="text-2xl font-bold text-emerald-600">{resolutionRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="siclo-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-siclo-dark/70">Calificaciones</p>
                <p className="text-2xl font-bold text-siclo-dark">{filteredRatings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="siclo-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-siclo-dark/70">NPS Promedio</p>
                <p className="text-2xl font-bold text-amber-600">{averageNPS.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="siclo-card">
          <CardHeader>
            <CardTitle className="text-siclo-dark">Estado de Sugerencias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="siclo-card">
          <CardHeader>
            <CardTitle className="text-siclo-dark">Distribución por Prioridad</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="siclo-card">
          <CardHeader>
            <CardTitle className="text-siclo-dark">Tendencia Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="quejas" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="calificaciones" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="siclo-card">
          <CardHeader>
            <CardTitle className="text-siclo-dark">Promedio por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="rating" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerStatsCharts;
