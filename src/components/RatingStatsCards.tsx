import { useState, useEffect } from 'react';
import { useRatingsStore } from '@/stores/ratingsStore';
import { type RatingStats } from '@/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  TrendingUp, 
  Volume2, 
  Sparkles, 
  Coffee,
  Clock,
  User,
  BarChart3
} from 'lucide-react';

interface RatingStatsCardsProps {
  branchId?: string;
  instructorId?: string;
  startDate?: string;
  endDate?: string;
}

export const RatingStatsCards = ({ branchId, instructorId, startDate, endDate }: RatingStatsCardsProps) => {
  const { getRatingStats, loading } = useRatingsStore();
  const [stats, setStats] = useState<RatingStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log('⭐ LOADING RATING STATS:', { branchId, instructorId, startDate, endDate });
        const statsData = await getRatingStats(branchId, instructorId, startDate, endDate);
        console.log('✅ RATING STATS LOADED:', statsData);
        setStats(statsData);
      } catch (error) {
        console.error('❌ Error loading rating stats:', error);
      }
    };

    loadStats();
  }, [branchId, instructorId, startDate, endDate, getRatingStats]);

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

  const formatRating = (rating: number) => rating.toFixed(1);

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {/* Total Calificaciones */}
      <Card className="siclo-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-blue-700">Total Calificaciones</p>
              <p className="text-xl md:text-3xl font-bold text-blue-900">{stats.totalRatings}</p>
            </div>
            <Star className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Promedio General */}
      <Card className="siclo-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-purple-700">Promedio General</p>
              <div className="flex items-center gap-1 md:gap-2">
                <p className="text-lg md:text-3xl font-bold text-purple-900">{formatRating(stats.averages.overall)}</p>
                <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 hidden md:inline-flex">
                  /10
                </Badge>
              </div>
            </div>
            <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      {/* NPS Score */}
      <Card className="siclo-card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-amber-700">NPS Score</p>
              <div className="flex items-center gap-1 md:gap-2">
                <p className="text-lg md:text-3xl font-bold text-amber-900">{formatRating(stats.averages.nps)}</p>
                <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 hidden md:inline-flex">
                  /10
                </Badge>
              </div>
            </div>
            <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
          </div>
        </CardContent>
      </Card>

      {/* Instructor Rating */}
      <Card className="siclo-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-green-700">Calificación Instructor</p>
              <div className="flex items-center gap-1 md:gap-2">
                <p className="text-lg md:text-3xl font-bold text-green-900">{formatRating(stats.averages.instructor)}</p>
                <Badge variant="outline" className="text-xs border-green-300 text-green-700 hidden md:inline-flex">
                  /10
                </Badge>
              </div>
            </div>
            <User className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Badges informativos por categoría */}
      <div className="col-span-full flex flex-wrap gap-3 mt-2">
        <Badge variant="outline" className="flex items-center gap-2 text-cyan-700 border-cyan-300 bg-cyan-50">
          <Sparkles className="h-3 w-3" />
          Limpieza: {formatRating(stats.averages.cleanliness)}/10
        </Badge>
        <Badge variant="outline" className="flex items-center gap-2 text-indigo-700 border-indigo-300 bg-indigo-50">
          <Volume2 className="h-3 w-3" />
          Audio: {formatRating(stats.averages.audio)}/10
        </Badge>
        <Badge variant="outline" className="flex items-center gap-2 text-rose-700 border-rose-300 bg-rose-50">
          <Coffee className="h-3 w-3" />
          Atención: {formatRating(stats.averages.attentionQuality)}/10
        </Badge>
        <Badge variant="outline" className="flex items-center gap-2 text-teal-700 border-teal-300 bg-teal-50">
          <Sparkles className="h-3 w-3" />
          Comodidades: {formatRating(stats.averages.amenities)}/10
        </Badge>
        <Badge variant="outline" className="flex items-center gap-2 text-orange-700 border-orange-300 bg-orange-50">
          <Clock className="h-3 w-3" />
          Puntualidad: {formatRating(stats.averages.punctuality)}/10
        </Badge>
      </div>
    </div>
  );
}; 