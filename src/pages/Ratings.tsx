
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RatingForm from '@/components/RatingForm';
import { Star, ArrowLeft, LogIn, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Ratings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-siclo-light via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-siclo-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="mr-2 text-siclo-dark hover:bg-siclo-light/50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-siclo-dark">Siclo</h1>
                <p className="text-xs text-siclo-dark/60 font-medium">Calificación de Instructores</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="border-siclo-green/30 text-siclo-green hover:bg-siclo-green hover:text-white transition-all duration-300 shadow-sm"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-siclo-dark mb-4">
            Califica tu experiencia
          </h2>
          <p className="text-lg text-siclo-dark/70 max-w-2xl mx-auto leading-relaxed">
            Tu opinión es valiosa. Califica a tu instructor y ayúdanos a brindar el mejor servicio.
          </p>
        </div>

        <Card className="siclo-card border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-b border-siclo-light/50">
            <CardTitle className="text-siclo-dark text-xl">Calificación de Instructor</CardTitle>
            <CardDescription className="text-siclo-dark/60">
              Evalúa todos los aspectos de tu clase. Tu retroalimentación es importante para nosotros.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <RatingForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Ratings;
