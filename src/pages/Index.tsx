
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ComplaintForm from '@/components/ComplaintForm';
import ComplaintSearch from '@/components/ComplaintSearch';
import { MessageSquareText, Search, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-siclo-light via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-siclo-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="w-10 h-10 siclo-gradient rounded-xl flex items-center justify-center shadow-sm">
                <MessageSquareText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-siclo-dark">Siclo</h1>
                <p className="text-xs text-siclo-dark/60 font-medium">Sistema de Quejas y Sugerencias</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-siclo-dark mb-4">
            ¿Tienes algo que decirnos?
          </h2>
          <p className="text-lg text-siclo-dark/70 max-w-2xl mx-auto leading-relaxed">
            Tu opinión nos ayuda a mejorar. Registra tu queja o sugerencia de forma rápida y segura, 
            o consulta el estado de una queja anterior.
          </p>
        </div>

        <Tabs defaultValue="nueva-queja" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-8 bg-white/80 backdrop-blur-sm shadow-sm border border-siclo-light/50 h-auto sm:h-14">
            <TabsTrigger 
              value="nueva-queja" 
              className="flex items-center text-base font-medium data-[state=active]:bg-siclo-green data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 h-14 sm:h-auto"
            >
              <MessageSquareText className="h-5 w-5 mr-2" />
              Nueva Queja
            </TabsTrigger>
            <TabsTrigger 
              value="buscar-queja" 
              className="flex items-center text-base font-medium data-[state=active]:bg-siclo-blue data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 h-14 sm:h-auto"
            >
              <Search className="h-5 w-5 mr-2" />
              Consultar Estado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nueva-queja">
            <Card className="siclo-card border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-siclo-green/5 to-siclo-blue/5 border-b border-siclo-light/50">
                <CardTitle className="text-siclo-dark text-xl">Nueva Queja o Sugerencia</CardTitle>
                <CardDescription className="text-siclo-dark/60">
                  Completa el formulario con todos los detalles. Recibirás un ID único para hacer seguimiento.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <ComplaintForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buscar-queja">
            <Card className="siclo-card border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-siclo-blue/5 to-siclo-green/5 border-b border-siclo-light/50">
                <CardTitle className="text-siclo-dark text-xl">Consultar Estado de Queja</CardTitle>
                <CardDescription className="text-siclo-dark/60">
                  Ingresa el ID de tu queja o tu correo electrónico para consultar el estado actual.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <ComplaintSearch />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
