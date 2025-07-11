
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
      {/* Enhanced Header similar to ratings page */}
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b border-siclo-light/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-siclo-dark hover:bg-siclo-light/50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="w-12 h-12 siclo-gradient rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquareText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-siclo-dark">Sistema de Quejas - Siclo</h1>
                <p className="text-sm text-siclo-dark/70">Reporta incidencias o busca el estado de tu queja</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/login')}
              className="siclo-button shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-siclo-light/50">
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'create' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('create')}
                className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'create'
                    ? 'siclo-button shadow-md'
                    : 'text-siclo-dark hover:bg-siclo-light/50'
                }`}
              >
                <MessageSquareText className="h-4 w-4 mr-2" />
                Crear Queja
              </Button>
              <Button
                variant={activeTab === 'search' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('search')}
                className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'search'
                    ? 'siclo-button shadow-md'
                    : 'text-siclo-dark hover:bg-siclo-light/50'
                }`}
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar Queja
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'create' ? (
          <Card className="siclo-card shadow-2xl border-2 border-siclo-light/30">
            <CardHeader className="bg-gradient-to-r from-siclo-green/10 to-siclo-blue/10 rounded-t-lg">
              <CardTitle className="text-2xl text-siclo-dark flex items-center">
                <MessageSquareText className="h-6 w-6 mr-3 text-siclo-green" />
                Formulario de Quejas
              </CardTitle>
              <CardDescription className="text-siclo-dark/70 text-base">
                Reporta cualquier incidencia o problema que hayas experimentado en nuestras instalaciones.
                Tu feedback es importante para nosotros.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <ComplaintForm />
            </CardContent>
          </Card>
        ) : (
          <Card className="siclo-card shadow-2xl border-2 border-siclo-light/30">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-siclo-light/20 rounded-t-lg">
              <CardTitle className="text-2xl text-siclo-dark flex items-center">
                <Search className="h-6 w-6 mr-3 text-siclo-blue" />
                Buscar Estado de Queja
              </CardTitle>
              <CardDescription className="text-siclo-dark/70 text-base">
                Consulta el estado actual de tu queja ingresando tu email y el ID de la queja.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <ComplaintSearch />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
