
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MessageSquareText className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Quejas</h1>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="flex items-center"
              >
                <Users className="h-4 w-4 mr-2" />
                Managers
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="flex items-center"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Tienes una queja o sugerencia?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Registra tu queja de forma rápida y segura. También puedes consultar el estado de tu queja anterior.
          </p>
        </div>

        <Tabs defaultValue="nueva-queja" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="nueva-queja" className="flex items-center">
              <MessageSquareText className="h-4 w-4 mr-2" />
              Nueva Queja
            </TabsTrigger>
            <TabsTrigger value="buscar-queja" className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Buscar Queja
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nueva-queja">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nueva Queja</CardTitle>
                <CardDescription>
                  Completa el formulario con todos los detalles de tu queja. Recibirás un ID único para hacer seguimiento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComplaintForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buscar-queja">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Estado de Queja</CardTitle>
                <CardDescription>
                  Ingresa el ID de tu queja o tu correo electrónico para consultar el estado.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
