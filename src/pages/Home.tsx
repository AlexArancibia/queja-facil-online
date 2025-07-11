
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquareText, Star, Users, ShieldCheck, Building2, Sparkles } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-siclo-light via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-siclo-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 siclo-gradient rounded-xl flex items-center justify-center shadow-sm">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-siclo-dark">Siclo</h1>
                <p className="text-xs text-siclo-dark/60 font-medium">Sistema Integral de Gestión</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="border-siclo-green/30 text-siclo-green hover:bg-siclo-green hover:text-white transition-all duration-300 shadow-sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Managers
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="border-siclo-blue/30 text-siclo-blue hover:bg-siclo-blue hover:text-white transition-all duration-300 shadow-sm"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-siclo-dark mb-4">
            ¿Qué deseas hacer hoy?
          </h2>
          <p className="text-lg text-siclo-dark/70 max-w-2xl mx-auto leading-relaxed">
            Elige la opción que mejor se adapte a lo que necesitas. Tu opinión nos ayuda a crecer y mejorar cada día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Quejas Card */}
          <Card 
            className="group siclo-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => navigate('/complaints')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-siclo-green to-siclo-blue rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MessageSquareText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-siclo-dark mb-3">
                Quejas y Sugerencias
              </h3>
              <p className="text-siclo-dark/70 mb-6 leading-relaxed">
                Registra tu queja o sugerencia para ayudarnos a mejorar nuestros servicios y atención.
              </p>
              <div className="flex items-center justify-center text-siclo-green font-medium group-hover:text-siclo-blue transition-colors">
                <span>Registrar queja</span>
                <MessageSquareText className="h-4 w-4 ml-2" />
              </div>
            </CardContent>
          </Card>

          {/* Calificaciones Card */}
          <Card 
            className="group siclo-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => navigate('/ratings')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-siclo-dark mb-3">
                Calificar Instructor
              </h3>
              <p className="text-siclo-dark/70 mb-6 leading-relaxed">
                Evalúa a tu instructor y comparte tu experiencia para ayudar a otros usuarios.
              </p>
              <div className="flex items-center justify-center text-amber-600 font-medium group-hover:text-orange-600 transition-colors">
                <span>Calificar clase</span>
                <Sparkles className="h-4 w-4 ml-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-siclo-light/50 rounded-full">
            <Building2 className="h-4 w-4 text-siclo-green mr-2" />
            <span className="text-sm text-siclo-dark/70 font-medium">
              Sistema seguro y confidencial
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
