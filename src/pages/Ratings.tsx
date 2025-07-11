
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RatingForm from '@/components/RatingForm';
import RatingSearch from '@/components/RatingSearch';
import { Star, Search, Users, ShieldCheck, Building2, ArrowLeft } from 'lucide-react';
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-siclo-dark mb-4">
            Califica tu experiencia
          </h2>
          <p className="text-lg text-siclo-dark/70 max-w-2xl mx-auto leading-relaxed">
            Tu opinión es valiosa. Califica a tu instructor y ayúdanos a brindar el mejor servicio.
          </p>
        </div>

        <Tabs defaultValue="nueva-calificacion" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/80 backdrop-blur-sm shadow-sm border border-siclo-light/50 h-14">
            <TabsTrigger 
              value="nueva-calificacion" 
              className="flex items-center text-base font-medium data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300"
            >
              <Star className="h-5 w-5 mr-2" />
              Calificar Instructor
            </TabsTrigger>
            <TabsTrigger 
              value="buscar-calificacion" 
              className="flex items-center text-base font-medium data-[state=active]:bg-siclo-blue data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300"
            >
              <Search className="h-5 w-5 mr-2" />
              Consultar Calificación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nueva-calificacion">
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
          </TabsContent>

          <TabsContent value="buscar-calificacion">
            <Card className="siclo-card border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-siclo-blue/5 to-siclo-green/5 border-b border-siclo-light/50">
                <CardTitle className="text-siclo-dark text-xl">Consultar Calificación</CardTitle>
                <CardDescription className="text-siclo-dark/60">
                  Busca tus calificaciones anteriores ingresando tu información.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <RatingSearch />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Ratings;
