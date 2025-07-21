import { useState, useEffect } from 'react';
import { useComplaintsStore } from '@/stores/complaintsStore';
import { type ComplaintStats } from '@/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquareText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

interface ComplaintStatsCardsProps {
  branchId?: string;
  startDate?: string;
  endDate?: string;
}

export const ComplaintStatsCards = ({ branchId, startDate, endDate }: ComplaintStatsCardsProps) => {
  const { getComplaintStats, loading } = useComplaintsStore();
  const [stats, setStats] = useState<ComplaintStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log('📊 LOADING COMPLAINT STATS:', { branchId, startDate, endDate });
        const statsData = await getComplaintStats(branchId, startDate, endDate);
        console.log('✅ COMPLAINT STATS LOADED:', statsData);
        setStats(statsData);
      } catch (error) {
        console.error('❌ Error loading complaint stats:', error);
      }
    };

    loadStats();
  }, [branchId, startDate, endDate, getComplaintStats]);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="siclo-card animate-pulse">
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 md:h-4 bg-gray-200 rounded w-16 md:w-20"></div>
                  <div className="h-6 md:h-8 bg-gray-200 rounded w-8 md:w-12"></div>
                </div>
                <div className="h-6 w-6 md:h-8 md:w-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {/* Total Quejas */}
      <Card className="siclo-card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-red-700">Total Quejas</p>
              <p className="text-xl md:text-3xl font-bold text-red-900">{stats.total}</p>
            </div>
            <MessageSquareText className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      {/* Pendientes */}
      <Card className="siclo-card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-amber-700">Pendientes</p>
              <p className="text-xl md:text-3xl font-bold text-amber-900">{stats.byStatus.pending}</p>
            </div>
            <Clock className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
          </div>
        </CardContent>
      </Card>

      {/* Resueltas */}
      <Card className="siclo-card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-emerald-700">Resueltas</p>
              <p className="text-xl md:text-3xl font-bold text-emerald-900">{stats.byStatus.resolved}</p>
            </div>
            <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
          </div>
        </CardContent>
      </Card>

      {/* Tasa de Resolución */}
      <Card className="siclo-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-blue-700">Tasa de Resolución</p>
              <div className="flex items-center gap-1 md:gap-2">
                <p className="text-lg md:text-3xl font-bold text-blue-900">{Math.round(stats.resolutionRate * 100)}%</p>
                <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 hidden md:inline-flex">
                  {stats.byStatus.resolved}/{stats.total}
                </Badge>
              </div>
            </div>
            <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Stats adicionales por prioridad - Como badges informativos */}
      <div className="col-span-full flex flex-wrap gap-3 mt-2">
        <Badge variant="outline" className="flex items-center gap-2 text-red-700 border-red-300 bg-red-50">
          <AlertTriangle className="h-3 w-3" />
          Alta: {stats.byPriority.high}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-2 text-amber-700 border-amber-300 bg-amber-50">
          <AlertTriangle className="h-3 w-3" />
          Media: {stats.byPriority.medium}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-2 text-green-700 border-green-300 bg-green-50">
          <AlertTriangle className="h-3 w-3" />
          Baja: {stats.byPriority.low}
        </Badge>
        {stats.byStatus.inProcess > 0 && (
          <Badge variant="outline" className="flex items-center gap-2 text-blue-700 border-blue-300 bg-blue-50">
            <Clock className="h-3 w-3" />
            En Proceso: {stats.byStatus.inProcess}
          </Badge>
        )}
        {stats.byStatus.rejected > 0 && (
          <Badge variant="outline" className="flex items-center gap-2 text-red-700 border-red-300 bg-red-50">
            <XCircle className="h-3 w-3" />
            Rechazadas: {stats.byStatus.rejected}
          </Badge>
        )}
      </div>
    </div>
  );
}; 