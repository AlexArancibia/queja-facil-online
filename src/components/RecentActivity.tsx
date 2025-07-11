
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquareText, Star, Calendar, Building2 } from 'lucide-react';
import { MOCK_STORES } from '@/types/complaint';

interface RecentActivityProps {
  complaints: any[];
  ratings: any[];
}

const RecentActivity = ({ complaints, ratings }: RecentActivityProps) => {
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

  const getStoreName = (storeId: string) => {
    const store = MOCK_STORES.find(s => s.id === storeId);
    return store ? store.name : storeId;
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
                        `Nueva queja: ${activity.subject}`
                      ) : (
                        `Calificación para ${activity.instructorName}`
                      )}
                    </p>
                    <Badge variant={activity.type === 'complaint' ? 'destructive' : 'default'}>
                      {activity.type === 'complaint' ? 'Queja' : 'Calificación'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Building2 className="h-3 w-3 mr-1" />
                    <span className="mr-3">{getStoreName(activity.storeId)}</span>
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{activity.date.toLocaleDateString()}</span>
                  </div>
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
