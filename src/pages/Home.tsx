
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquareText, Star, LogIn, Building2, Sparkles } from 'lucide-react';
import AuthDebug from '@/components/AuthDebug';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen  bg-siclo-light via-white to-blue-50/30 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6 flex flex-col justify-center items-center">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
            ¿Qué deseas hacer hoy?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
            Elige la opción que mejor se adapte a lo que necesitas. 
            <span className="font-medium text-slate-700"> Tu opinión nos ayuda a crecer</span> y mejorar cada día.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-3xl mx-auto mb-6 sm:mb-8 w-full">
          {/* Quejas Card */}
          <Card 
            className="group siclo-card border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => navigate('/complaints')}
          >
            <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-siclo-yellow to-siclo-orange rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MessageSquareText className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-lg lg:text-xl font-medium text-slate-900 mb-2 sm:mb-3">
                Quejas y Sugerencias
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-slate-600 mb-4 sm:mb-6 leading-relaxed">
              Registra tu queja o sugerencia para ayudarnos a mejorar la calidad de nuestros servicios y atención.
              </p>
              <div className="flex items-center justify-center text-siclo-orange font-medium transition-colors">
                <span className="text-sm sm:text-base">Registrar queja</span>
                <MessageSquareText className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
              </div>
            </CardContent>
          </Card>

          {/* Calificaciones Card */}
          <Card 
            className="group siclo-card border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => navigate('/ratings')}
          >
            <CardContent className="p-4 md:p-6 lg:p-8 text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-siclo-purple to-siclo-deep-blue rounded-xl md:rounded-2xl mx-auto mb-3 md:mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Star className="h-5 w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
              </div>
              <h3 className="text-base md:text-lg lg:text-xl font-medium text-slate-900 mb-2 md:mb-3">
                Calificar Instructor
              </h3>
              <p className="text-xs md:text-sm lg:text-base text-slate-600 mb-3 md:mb-6 leading-relaxed">
              Evalúa a tu instructor y comparte tu experiencia para mejorar la atención de otros usuarios.
              </p>
              <div className="flex items-center justify-center text-siclo-deep-blue font-medium">
                <span className="text-sm md:text-base">Calificar clase</span>
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 ml-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section - Compacto */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-slate-100/70 border border-slate-200 rounded-full">
            <Building2 className="h-3 w-3 md:h-4 md:w-4 text-siclo-green mr-2" />
            <span className="text-xs md:text-sm text-slate-700 font-medium">
              Sistema seguro y confidencial
            </span>
          </div>
          
          {/* Crédito de desarrollo */}
          <div className="text-center">
            <span className="text-xs text-slate-500">
              Desarrollado por{' '}
              <a 
                href="https://qintitec.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-siclo-blue hover:text-siclo-deep-blue font-medium transition-colors duration-200 underline decoration-dotted underline-offset-2"
              >
                Qintitec
              </a>
            </span>
          </div>
        </div>

        {/* Debug Section - Solo en desarrollo y en desktop */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="hidden md:block w-full max-w-2xl mt-4">
            <AuthDebug />
          </div>
        )} */}
      </main>
    </div>
  );
};

export default Home;
