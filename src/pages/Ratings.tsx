
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RatingForm from '@/components/RatingForm';
import { Star, ArrowLeft, LogIn, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Ratings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-siclo-light  ">
      {/* Header */}
 

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8 sm:mb-8 ">
          <h2 className="text-4xl font-bold text-siclo-dark mb-4 mt-16 sm:mt-24">
            Califica tu experiencia
          </h2>
          <p className="text-base sm:text-lg text-siclo-dark/70 max-w-2xl mx-auto leading-relaxed mt-4 sm:mt-8">
            Tu opinión es valiosa. <span className="font-medium text-slate-700">Califica a tu instructor</span> y ayúdanos a brindar el mejor servicio.
          </p>
        </div>

        <Card className="siclo-card border-slate-200 shadow-sm w-full max-w-full overflow-hidden">
          <CardContent className="pt-6 px-4 sm:px-6">
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">Evalúa tu Clase</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Califica todos los aspectos de tu experiencia. Tu retroalimentación nos ayuda a mejorar continuamente.
              </p>
            </div>
            
            <RatingForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Ratings;
