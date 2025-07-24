
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquareText, Star, Calendar, Building2 } from 'lucide-react';
import { type Complaint, type Rating, type Branch, ComplaintStatus } from '@/types/api';

interface RecentActivityProps {
  complaints: Complaint[];
  ratings: Rating[];
  branches?: Branch[];
}

const RecentActivity = ({ complaints, ratings, branches = [] }: RecentActivityProps) => {
  // Combine and sort activities by date
  const activities = [
    ...complaints.map(complaint => ({
      ...complaint,
      type: 'complaint' as const,
      date: new Date(complaint.createdAt)
    })),
    ...ratings.map(rating => ({
      ...rating,
      type: 'rating' as const,
      date: new Date(rating.createdAt)
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : branchId;
  };

  const getStatusText = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING: return 'Pendiente';
      case ComplaintStatus.IN_PROGRESS: return 'En proceso';
      case ComplaintStatus.RESOLVED: return 'Resuelta';
      case ComplaintStatus.REJECTED: return 'Rechazada';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-siclo-dark">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay actividad reciente
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/20">
                <div className="flex-shrink-0">
                  {activity.type === 'complaint' ? (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <MessageSquareText className="h-4 w-4 text-red-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-amber-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-siclo-dark truncate">
                      {activity.type === 'complaint' ? (
                        `Sugerencia de ${activity.fullName}`
                      ) : (
                        `Calificación para ${activity.instructorName}`
                      )}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant={activity.type === 'complaint' ? 'destructive' : 'default'}>
                        {activity.type === 'complaint' ? 'Sugerencia' : 'Calificación'}
                      </Badge>
                      {activity.type === 'complaint' && (
                        <Badge variant="outline" className="text-xs">
                          {getStatusText(activity.status)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Building2 className="h-3 w-3 mr-1" />
                    <span className="mr-3">{getBranchName(activity.branchId)}</span>
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{activity.date.toLocaleDateString()}</span>
                  </div>
                  
                  {activity.type === 'complaint' && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {activity.observationType}: {activity.detail}
                    </p>
                  )}
                  
                  {activity.type === 'rating' && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Star className="h-3 w-3 mr-1" />
                      <span>NPS: {activity.npsScore} • Promedio: {(
                        (Number(activity.instructorRating) +
                         Number(activity.cleanlinessRating) +
                         Number(activity.audioRating) +
                         Number(activity.attentionQualityRating) +
                         Number(activity.amenitiesRating) +
                         Number(activity.punctualityRating)) / 6
                      ).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
