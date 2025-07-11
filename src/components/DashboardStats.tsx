
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareText, Star, TrendingUp, Users } from 'lucide-react';

interface DashboardStatsProps {
  complaints: any[];
  ratings: any[];
}

const DashboardStats = ({ complaints, ratings }: DashboardStatsProps) => {
  const totalComplaints = complaints.length;
  const totalRatings = ratings.length;
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

  const recentActivity = totalComplaints + totalRatings;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Quejas
          </CardTitle>
          <MessageSquareText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-siclo-dark">{totalComplaints}</div>
          <p className="text-xs text-muted-foreground">
            Reportes recibidos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Calificaciones
          </CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-siclo-dark">{totalRatings}</div>
          <p className="text-xs text-muted-foreground">
            Evaluaciones completadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Promedio General
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-siclo-dark">
            {averageRating > 0 ? averageRating.toFixed(1) : '--'}
          </div>
          <p className="text-xs text-muted-foreground">
            Calificación promedio
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Actividad Total
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-siclo-dark">{recentActivity}</div>
          <p className="text-xs text-muted-foreground">
            Interacciones registradas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
