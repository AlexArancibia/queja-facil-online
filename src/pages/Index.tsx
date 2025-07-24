
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ComplaintForm from '@/components/ComplaintForm';
import ComplaintSearch from '@/components/ComplaintSearch';
import { ArrowLeft, LogIn, MessageSquareText, Search, Building2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'create' | 'search'>('create');
  const hasAutoSwitched = useRef(false);

  // Effect to automatically switch to search tab if there's an ID in URL (only on initial load)
  useEffect(() => {
    const urlComplaintId = searchParams.get('id');
    if (urlComplaintId && !hasAutoSwitched.current) {
      setActiveTab('search');
      hasAutoSwitched.current = true;
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-siclo-light  ">
      {/* Header similar to ratings page */}
 

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8 sm:mb-8 ">
          <h2 className="text-4xl font-bold text-siclo-dark mb-4 mt-16 sm:mt-24">
            Reporta tu sugerencia
          </h2>
          <p className="text-base sm:text-lg text-siclo-dark/70 max-w-2xl mx-auto leading-relaxed mt-4 sm:mt-8">
            Tu opinión es importante. Ayúdanos a mejorar nuestro servicio.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-siclo-light/50">
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'create' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('create')}
                className={`px-6 py-3 rounded-lg transition-all duration-300 focus-visible:ring-siclo-orange/50 ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-siclo-orange via-siclo-purple to-siclo-deep-blue text-white shadow-md'
                    : 'text-siclo-dark hover:bg-siclo-light/50'
                }`}
              >
                <MessageSquareText className="h-4 w-4 mr-2" />
                Crear Sugerencia
              </Button>
              <Button
                variant={activeTab === 'search' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('search')}
                className={`px-6 py-3 rounded-lg transition-all duration-300 focus-visible:ring-siclo-orange/50 ${
                  activeTab === 'search'
                    ? 'bg-gradient-to-r from-siclo-orange via-siclo-purple to-siclo-deep-blue text-white shadow-md'
                    : 'text-siclo-dark hover:bg-siclo-light/50'
                }`}
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar Sugerencia
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'create' ? (
 
              <ComplaintForm />
 
        ) : (
          <Card className="siclo-card border-0 shadow-lg">
 
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
