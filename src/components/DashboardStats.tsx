import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareText, Star, TrendingUp, Users } from 'lucide-react';
import type { Branch, Complaint, ComplaintStatus, Rating } from '@/types/api';

interface DashboardStatsProps {
  complaints: Complaint[];
  ratings: Rating[];
  branch?: Branch | null;
}

const DashboardStats = ({ complaints, ratings, branch }: DashboardStatsProps) => {
  // Estadísticas de quejas
  const totalComplaints = complaints.length;
  const complaintsByStatus = complaints.reduce((acc, complaint) => {
    acc[complaint.status] = (acc[complaint.status] || 0) + 1;
    return acc;
  }, {} as Record<ComplaintStatus, number>);

  // Estadísticas de calificaciones
  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0 
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
      }, 0) / totalRatings
    : 0;

  // NPS (Net Promoter Score)
  const npsData = ratings.reduce((acc, rating) => {
    if (rating.npsScore >= 9) acc.promoters++;
    else if (rating.npsScore <= 6) acc.detractors++;
    else acc.passives++;
    return acc;
  }, { promoters: 0, passives: 0, detractors: 0 });

  const npsScore = totalRatings > 0 
    ? Math.round(((npsData.promoters - npsData.detractors) / totalRatings) * 100)
    : 0;

  // Actividad reciente (últimos 7 días)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentComplaints = complaints.filter(complaint => 
    new Date(complaint.createdAt) > oneWeekAgo
  ).length;

  const recentRatings = ratings.filter(rating => 
    new Date(rating.createdAt) > oneWeekAgo
  ).length;

  const recentActivity = recentComplaints + recentRatings;

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
          <div className="text-2xl font-bold">{totalComplaints}</div>
          <p className="text-xs text-muted-foreground">
            {branch ? `En ${branch.name}` : 'Reportes recibidos'}
          </p>
          {complaintsByStatus.PENDING && (
            <p className="text-xs text-amber-500 mt-1">
              {complaintsByStatus.PENDING} pendientes
            </p>
          )}
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
          <div className="text-2xl font-bold">{totalRatings}</div>
          <p className="text-xs text-muted-foreground">
            {branch ? `En ${branch.name}` : 'Evaluaciones completadas'}
          </p>
          {totalRatings > 0 && (
            <p className="text-xs text-blue-500 mt-1">
              NPS: {npsScore}
            </p>
          )}
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
          <div className="text-2xl font-bold">
            {averageRating > 0 ? averageRating.toFixed(1) : '--'}
            {averageRating > 0 && (
              <span className="text-sm text-muted-foreground ml-1">/ 5</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Calificación promedio
          </p>
          {totalRatings > 0 && (
            <p className="text-xs text-green-500 mt-1">
              {(averageRating / 5 * 100).toFixed(0)}% satisfacción
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Actividad Reciente
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentActivity}</div>
          <p className="text-xs text-muted-foreground">
            Últimos 7 días
          </p>
          {recentActivity > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {recentComplaints} quejas • {recentRatings} calificaciones
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;