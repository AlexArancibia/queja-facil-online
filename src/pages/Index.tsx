
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ComplaintForm from '@/components/ComplaintForm';
import ComplaintSearch from '@/components/ComplaintSearch';
import { ArrowLeft, LogIn, MessageSquareText, Search } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'search'>('create');

  return (
    <div className="min-h-screen bg-gradient-to-br from-siclo-light via-white to-blue-50/30">
      {/* Header similar to ratings page */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-siclo-light/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-siclo-dark hover:bg-siclo-light/50 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                <MessageSquareText className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold text-siclo-dark">Siclo</h1>
                <p className="text-xs text-siclo-dark/60 font-medium">Sistema de Quejas</p>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-lg font-bold text-siclo-dark">Quejas</h1>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="border-siclo-green/30 text-siclo-green hover:bg-siclo-green hover:text-white transition-all duration-300 shadow-sm text-sm px-3 py-2"
            >
              <LogIn className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
              <span className="sm:hidden">Login</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-siclo-dark mb-3 sm:mb-4">
            Reporta tu experiencia
          </h2>
          <p className="text-base sm:text-lg text-siclo-dark/70 max-w-2xl mx-auto leading-relaxed px-4">
            Tu opinión es importante. Reporta cualquier incidencia y ayúdanos a mejorar nuestro servicio.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-1 sm:p-2 rounded-xl shadow-lg border border-siclo-light/50 w-full max-w-md">
            <div className="flex space-x-1 sm:space-x-2">
              <Button
                variant={activeTab === 'create' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('create')}
                className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                    : 'text-siclo-dark hover:bg-siclo-light/50'
                }`}
              >
                <MessageSquareText className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Crear Queja</span>
                <span className="sm:hidden">Crear</span>
              </Button>
              <Button
                variant={activeTab === 'search' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('search')}
                className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                  activeTab === 'search'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                    : 'text-siclo-dark hover:bg-siclo-light/50'
                }`}
              >
                <Search className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Buscar Queja</span>
                <span className="sm:hidden">Buscar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'create' ? (
          <Card className="siclo-card border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-500/5 to-orange-500/5 border-b border-siclo-light/50">
              <CardTitle className="text-siclo-dark text-xl">Formulario de Quejas</CardTitle>
              <CardDescription className="text-siclo-dark/60">
                Describe detalladamente tu experiencia. Tu retroalimentación es importante para nosotros.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <ComplaintForm />
            </CardContent>
          </Card>
        ) : (
          <Card className="siclo-card border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-siclo-light/20 border-b border-siclo-light/50">
              <CardTitle className="text-siclo-dark text-xl">Buscar Estado de Queja</CardTitle>
              <CardDescription className="text-siclo-dark/60">
                Consulta el estado actual de tu queja ingresando tu email y el ID de la queja.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <ComplaintSearch />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;
