import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useComplaintsStore } from '@/stores/complaintsStore';
import { useRatingsStore } from '@/stores/ratingsStore';
import { useBranchesStore } from '@/stores/branchesStore';
import { useInstructorsStore } from '@/stores/instructorsStore';
import DateRangeFilterAdvanced from './DateRangeFilterAdvanced';
import { 
  BarChart3, 
  MessageSquareText, 
  Star, 
  TrendingUp, 
  Users,
  Store,
  GraduationCap,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Target,
  Award,
  Calendar,
  PieChart,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Building2
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const AnalyticsPanel = () => {
  const { toast } = useToast();
  
  // Stores
  const { getComplaintStats } = useComplaintsStore();
  const { getRatingStats } = useRatingsStore();
  const { branches, fetchBranches, getBranchRatings } = useBranchesStore();
  const { instructors, fetchInstructors, getInstructorRatings } = useInstructorsStore();

  // State
  const [loading, setLoading] = useState(false);
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterInstructor, setFilterInstructor] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [activeView, setActiveView] = useState('ratings'); // 'ratings' or 'complaints'
  
  // Stats data
  const [complaintStats, setComplaintStats] = useState<any>(null);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [branchRatings, setBranchRatings] = useState<any[]>([]);
  const [instructorRatings, setInstructorRatings] = useState<any[]>([]);

  useEffect(() => {
    fetchBranches();
    fetchInstructors();
  }, [fetchBranches, fetchInstructors]);

  useEffect(() => {
    loadStats();
  }, [filterBranch, filterInstructor, startDate, endDate]);

  const formatDateForAPI = (date: Date | undefined): string | undefined => {
    if (!date) return undefined;
    return date.toISOString().split('T')[0];
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const branchId = filterBranch !== 'all' ? filterBranch : undefined;
      const instructorId = filterInstructor !== 'all' ? filterInstructor : undefined;
      const startDateStr = formatDateForAPI(startDate);
      const endDateStr = formatDateForAPI(endDate);

      // Load periodic stats
      const [complaintsData, ratingsData] = await Promise.all([
        getComplaintStats(branchId, startDateStr, endDateStr),
        getRatingStats(branchId, instructorId, startDateStr, endDateStr)
      ]);

      setComplaintStats(complaintsData);
      setRatingStats(ratingsData);

      // Load general stats if no date filters
      if (!startDate && !endDate) {
        const branchPromises = branches.map(async (branch) => {
          try {
            const ratings = await getBranchRatings(branch.id);
            const avgRating = ratings.length > 0 
              ? ratings.reduce((acc: number, r: any) => acc + (parseFloat(r.npsScore) || 0), 0) / ratings.length 
              : 0;
            
            return {
              ...branch,
              ratingsCount: ratings.length,
              avgRating
            };
          } catch (error) {
            return { ...branch, ratingsCount: 0, avgRating: 0 };
          }
        });

        const instructorPromises = instructors.map(async (instructor) => {
          try {
            const ratings = await getInstructorRatings(instructor.id);
            const avgRating = ratings.length > 0 
              ? ratings.reduce((acc: number, r: any) => acc + (parseFloat(r.instructorRating) || 0), 0) / ratings.length 
              : 0;
            
            return {
              ...instructor,
              ratingsCount: ratings.length,
              avgRating
            };
          } catch (error) {
            return { ...instructor, ratingsCount: 0, avgRating: 0 };
          }
        });

        const [branchData, instructorData] = await Promise.all([
          Promise.all(branchPromises),
          Promise.all(instructorPromises)
        ]);

        setBranchRatings(branchData);
        setInstructorRatings(instructorData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Data for charts
  const statusData = complaintStats ? [
    { name: 'Pendientes', value: complaintStats.byStatus?.pending || 0, color: '#f59e0b' },
    { name: 'En Proceso', value: complaintStats.byStatus?.inProcess || 0, color: '#3b82f6' },
    { name: 'Resueltas', value: complaintStats.byStatus?.resolved || 0, color: '#10b981' },
    { name: 'Rechazadas', value: complaintStats.byStatus?.rejected || 0, color: '#ef4444' },
  ].filter(item => item.value > 0) : [];

  const priorityData = complaintStats ? [
    { name: 'Alta', value: complaintStats.byPriority?.high || 0, color: '#ef4444' },
    { name: 'Media', value: complaintStats.byPriority?.medium || 0, color: '#f59e0b' },
    { name: 'Baja', value: complaintStats.byPriority?.low || 0, color: '#10b981' },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="space-y-6">
      {/* Header con título a la izquierda y botones a la derecha */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-siclo-dark flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Analíticas del Sistema
          </h2>
          <p className="text-sm text-siclo-dark/70 mt-1">
            Estadísticas detalladas y reportes de rendimiento
          </p>
        </div>
        <div className="bg-siclo-light-blue p-1 rounded-lg flex self-center sm:self-auto">
          <Button
            onClick={() => setActiveView('ratings')}
            variant={activeView === 'ratings' ? 'siclo-blue' : 'ghost'}
            className="w-full sm:w-auto"
          >
            <Star className="h-4 w-4 mr-2" />
            Calificaciones
          </Button>
          <Button
            onClick={() => setActiveView('complaints')}
            variant={activeView === 'complaints' ? 'siclo-orange' : 'ghost'}
            className="w-full sm:w-auto"
          >
            <MessageSquareText className="h-4 w-4 mr-2" />
            Sugerencias
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="siclo-card border-0 bg-white/60 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <h3 className="text-lg font-medium text-siclo-dark/80 mr-2 flex-shrink-0">Filtros:</h3>
            
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

            {/* Rango de Fechas */}
            <DateRangeFilterAdvanced
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />

            {/* Reset filters button */}
            {(filterBranch !== 'all' || filterInstructor !== 'all' || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterBranch('all');
                  setFilterInstructor('all');
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
                className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 h-auto"
              >
                ✕ Limpiar
              </Button>
            )}

            {/* Indicador de período */}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Cargando estadísticas..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Complaints View */}
          {activeView === 'complaints' && (
            <div className="space-y-6 animate-fade-in">
              {/* Estadísticas principales de Sugerencias */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="siclo-card hover:shadow-lg transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-siclo-dark/70">Total de Sugerencias</CardTitle>
                    <MessageSquareText className="h-4 w-4 text-siclo-green" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-siclo-dark">{complaintStats?.total || 0}</div>
                    <p className="text-xs text-siclo-dark/60 mt-1">Sugerencias registradas</p>
                    {complaintStats?.resolutionRate !== undefined && (
                      <div className="flex items-center mt-2">
                        <Badge variant="outline" className={`text-xs ${complaintStats.resolutionRate >= 80 ? 'border-emerald-300 text-emerald-700' : complaintStats.resolutionRate >= 60 ? 'border-amber-300 text-amber-700' : 'border-red-300 text-red-700'}`}>
                          {complaintStats.resolutionRate.toFixed(1)}% resueltas
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos de Sugerencias */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="siclo-card">
                  <CardHeader><CardTitle className="flex items-center text-siclo-dark"><PieChart className="h-5 w-5 mr-2" />Estados de Sugerencias</CardTitle></CardHeader>
                  <CardContent>
                    {statusData.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                              {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, 'Sugerencias']} />
                            <Legend iconType="circle" />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center text-siclo-dark/60 py-8"><PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No hay datos de estado para mostrar</p></div>
                    )}
                  </CardContent>
                </Card>
                <Card className="siclo-card">
                  <CardHeader><CardTitle className="flex items-center text-siclo-dark"><AlertTriangle className="h-5 w-5 mr-2" />Prioridad de Sugerencias</CardTitle></CardHeader>
                  <CardContent>
                    {priorityData.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={priorityData} layout="vertical" margin={{ left: 10, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
                            <Tooltip cursor={{ fill: 'rgba(240, 240, 240, 0.5)' }} formatter={(value) => [value, 'Sugerencias']} />
                            <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                              {priorityData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center text-siclo-dark/60 py-8"><AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No hay datos de prioridad para mostrar</p></div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Ratings View */}
          {activeView === 'ratings' && (
            <div className="space-y-6 animate-fade-in">
              {/* Main Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="siclo-card hover:shadow-lg transition-all duration-200 lg:col-span-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-siclo-dark/70">Total Calificaciones</CardTitle>
                    <Star className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-siclo-dark">{ratingStats?.totalRatings || 0}</div>
                    <p className="text-xs text-siclo-dark/60 mt-1">Evaluaciones completadas</p>
                  </CardContent>
                </Card>
                <Card className="siclo-card hover:shadow-lg transition-all duration-200 lg:col-span-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-siclo-dark/70">Promedio General</CardTitle>
                    <TrendingUp className="h-4 w-4 text-siclo-blue" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-siclo-dark">
                      {ratingStats?.averages?.overall ? ratingStats.averages.overall.toFixed(1) : '--'}
                      {ratingStats?.averages?.overall && <span className="text-sm text-siclo-dark/60 ml-1">/ 10</span>}
                    </div>
                    <p className="text-xs text-siclo-dark/60 mt-1">Satisfacción general</p>
                  </CardContent>
                </Card>
                <Card className="siclo-card hover:shadow-lg transition-all duration-200 lg:col-span-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-siclo-dark/70">NPS</CardTitle>
                    <Target className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-siclo-dark">{ratingStats?.averages?.nps ? ratingStats.averages.nps.toFixed(1) : '--'}</div>
                    <p className="text-xs text-siclo-dark/60 mt-1">Net Promoter Score</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Ratings Breakdown */}
              {ratingStats?.averages && (
                <Card className="siclo-card">
                  <CardHeader><CardTitle className="flex items-center text-siclo-dark"><BarChart3 className="h-5 w-5 mr-2" />Desglose de Calificaciones</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg"><div className="text-2xl font-bold text-blue-600">{ratingStats.averages.instructor?.toFixed(1) || '--'}</div><div className="text-sm text-blue-700 font-medium">Instructor</div></div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg"><div className="text-2xl font-bold text-green-600">{ratingStats.averages.cleanliness?.toFixed(1) || '--'}</div><div className="text-sm text-green-700 font-medium">Limpieza</div></div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg"><div className="text-2xl font-bold text-purple-600">{ratingStats.averages.audio?.toFixed(1) || '--'}</div><div className="text-sm text-purple-700 font-medium">Audio</div></div>
                      <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg"><div className="text-2xl font-bold text-yellow-600">{ratingStats.averages.attentionQuality?.toFixed(1) || '--'}</div><div className="text-sm text-yellow-700 font-medium">Atención</div></div>
                      <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg"><div className="text-2xl font-bold text-indigo-600">{ratingStats.averages.amenities?.toFixed(1) || '--'}</div><div className="text-sm text-indigo-700 font-medium">Comodidades</div></div>
                      <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg"><div className="text-2xl font-bold text-cyan-600">{ratingStats.averages.punctuality?.toFixed(1) || '--'}</div><div className="text-sm text-cyan-700 font-medium">Puntualidad</div></div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rankings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="siclo-card">
                  <CardHeader><CardTitle className="flex items-center text-siclo-dark"><Store className="h-5 w-5 mr-2" />Ranking de Sucursales (NPS)</CardTitle></CardHeader>
                  <CardContent>
                    {branchRatings.length > 0 ? (
                      <div className="space-y-3">
                        {branchRatings.sort((a, b) => b.avgRating - a.avgRating).map((branch, index) => (
                          <div key={branch.id} className="flex items-center justify-between p-2 rounded-lg bg-siclo-light-blue/50">
                            <div className="flex items-center">
                              <span className={`w-6 text-center font-bold mr-3 text-sm ${index < 3 ? 'text-siclo-orange' : 'text-siclo-dark/60'}`}>{index + 1}</span>
                              <div>
                                <div className="font-semibold text-siclo-dark">{branch.name}</div>
                                <div className="text-xs text-siclo-dark/60">{branch.ratingsCount} calificaciones</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-siclo-dark">{branch.avgRating > 0 ? branch.avgRating.toFixed(1) : '--'}</div>
                              <div className="text-xs text-siclo-dark/60">Promedio</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-siclo-dark/60 py-8"><Store className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No hay datos de sucursales para mostrar</p></div>
                    )}
                  </CardContent>
                </Card>
                <Card className="siclo-card">
                  <CardHeader><CardTitle className="flex items-center text-siclo-dark"><GraduationCap className="h-5 w-5 mr-2" />Ranking de Instructores</CardTitle></CardHeader>
                  <CardContent>
                    {instructorRatings.length > 0 ? (
                      <div className="space-y-3">
                        {instructorRatings.sort((a, b) => b.avgRating - a.avgRating).map((instructor, index) => (
                          <div key={instructor.id} className="flex items-center justify-between p-2 rounded-lg bg-siclo-light-blue/50">
                            <div className="flex items-center">
                              <span className={`w-6 text-center font-bold mr-3 text-sm ${index < 3 ? 'text-siclo-orange' : 'text-siclo-dark/60'}`}>{index + 1}</span>
                              <div>
                                <div className="font-semibold text-siclo-dark">{instructor.name}</div>
                                <div className="text-xs text-siclo-dark/60">{instructor.ratingsCount} calificaciones</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-siclo-dark">{instructor.avgRating > 0 ? instructor.avgRating.toFixed(1) : '--'}</div>
                              <div className="text-xs text-siclo-dark/60">Promedio</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-siclo-dark/60 py-8"><GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No hay datos de instructores para mostrar</p></div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;