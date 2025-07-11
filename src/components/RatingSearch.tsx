
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Calendar, Clock, User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Rating } from '@/types/instructor';
import { MOCK_STORES } from '@/types/complaint';

const RatingSearch = () => {
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<Rating[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<{
    searchQuery: string;
  }>();

  const onSubmit = async (data: { searchQuery: string }) => {
    setIsSearching(true);
    
    try {
      const savedRatings = JSON.parse(localStorage.getItem('ratings') || '[]');
      
      const results = savedRatings.filter((rating: Rating) =>
        rating.id.toLowerCase().includes(data.searchQuery.toLowerCase()) ||
        rating.instructorName.toLowerCase().includes(data.searchQuery.toLowerCase())
      );

      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "Sin resultados",
          description: "No se encontraron calificaciones con ese criterio de búsqueda.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al buscar las calificaciones.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getStoreName = (storeId: string) => {
    const store = MOCK_STORES.find(s => s.id === storeId);
    return store ? store.name : storeId;
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 7) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getAverageScore = (rating: Rating) => {
    const scores = [
      rating.instructorRating,
      rating.cleanlinessRating,
      rating.audioRating,
      rating.attentionQualityRating,
      rating.amenitiesRating,
      rating.punctualityRating
    ];
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-siclo-dark font-medium flex items-center">
            <Search className="h-4 w-4 mr-2 text-siclo-green" />
            ID de Calificación o Nombre del Instructor
          </Label>
          <div className="flex gap-3">
            <Input
              placeholder="Ej: rating-abc123 o María González"
              {...register('searchQuery', { 
                required: 'Ingresa un criterio de búsqueda' 
              })}
              className="border-siclo-light/50 focus:border-siclo-green"
            />
            <Button
              type="submit"
              disabled={isSearching}
              className="bg-siclo-blue hover:bg-siclo-blue/90 text-white px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
          {errors.searchQuery && (
            <p className="text-red-500 text-sm">{errors.searchQuery.message}</p>
          )}
        </div>
      </form>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-siclo-dark">
            Resultados encontrados ({searchResults.length})
          </h3>
          
          {searchResults.map((rating) => (
            <Card key={rating.id} className="siclo-card border border-siclo-light/50 hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-siclo-dark text-lg flex items-center">
                      <Star className="h-5 w-5 mr-2 text-amber-500" />
                      {rating.instructorName}
                    </CardTitle>
                    <div className="flex items-center text-sm text-siclo-dark/70 mt-1">
                      <Building2 className="h-4 w-4 mr-1" />
                      {getStoreName(rating.storeId)} • {rating.discipline.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getScoreColor(rating.npsScore)} border mb-2`}>
                      NPS: {rating.npsScore}/10
                    </Badge>
                    <div className="text-xs text-siclo-dark/60">
                      ID: {rating.id.slice(-8)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-sm text-siclo-dark/70">
                    <Calendar className="h-4 w-4 mr-2 text-siclo-green" />
                    {rating.date}
                  </div>
                  <div className="flex items-center text-sm text-siclo-dark/70">
                    <Clock className="h-4 w-4 mr-2 text-siclo-blue" />
                    {rating.schedule}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-siclo-dark">Calificaciones detalladas:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span>Instructor:</span>
                      <Badge variant="outline" className={getScoreColor(rating.instructorRating)}>
                        {rating.instructorRating}/10
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Limpieza:</span>
                      <Badge variant="outline" className={getScoreColor(rating.cleanlinessRating)}>
                        {rating.cleanlinessRating}/10
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Audio:</span>
                      <Badge variant="outline" className={getScoreColor(rating.audioRating)}>
                        {rating.audioRating}/10
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Atención:</span>
                      <Badge variant="outline" className={getScoreColor(rating.attentionQualityRating)}>
                        {rating.attentionQualityRating}/10
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Amenities:</span>
                      <Badge variant="outline" className={getScoreColor(rating.amenitiesRating)}>
                        {rating.amenitiesRating}/10
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Puntualidad:</span>
                      <Badge variant="outline" className={getScoreColor(rating.punctualityRating)}>
                        {rating.punctualityRating}/10
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-siclo-light/50">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-siclo-dark">Promedio general:</span>
                      <Badge className={`${getScoreColor(getAverageScore(rating))} border text-base px-3 py-1`}>
                        {getAverageScore(rating)}/10
                      </Badge>
                    </div>
                  </div>

                  {rating.comments && (
                    <div className="pt-3 border-t border-siclo-light/50">
                      <h5 className="font-medium text-siclo-dark mb-2">Comentarios:</h5>
                      <p className="text-sm text-siclo-dark/70 bg-siclo-light/30 p-3 rounded-lg">
                        {rating.comments}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RatingSearch;
