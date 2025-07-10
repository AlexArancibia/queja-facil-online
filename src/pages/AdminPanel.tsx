
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import StoreManagement from '@/components/StoreManagement';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import AddManagerForm from '@/components/AddManagerForm';
import { 
  Users, 
  Store, 
  BarChart3, 
  UserPlus,
  MessageSquareText,
  Search,
  Shield
} from 'lucide-react';

const AdminPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [managers, setManagers] = useState([]);
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);

  const loadManagers = () => {
    const existingManagers = JSON.parse(localStorage.getItem('managers') || '[]');
    setManagers(existingManagers);
  };

  const filteredManagers = managers.filter((manager: any) =>
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-siclo-light via-white to-blue-50/20">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-siclo-light/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 siclo-gradient rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-siclo-dark">Panel Administrador</h1>
                <p className="text-xs text-siclo-dark/60 font-medium">Sistema de Gestión Siclo</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm shadow-sm border border-siclo-light/40 h-12">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center text-sm font-medium data-[state=active]:bg-siclo-green data-[state=active]:text-white transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="managers" 
              className="flex items-center text-sm font-medium data-[state=active]:bg-siclo-blue data-[state=active]:text-white transition-all duration-300"
            >
              <Users className="h-4 w-4 mr-2" />
              Managers
            </TabsTrigger>
            <TabsTrigger 
              value="stores" 
              className="flex items-center text-sm font-medium data-[state=active]:bg-siclo-green data-[state=active]:text-white transition-all duration-300"
            >
              <Store className="h-4 w-4 mr-2" />
              Locales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              <AnalyticsDashboard />
            </div>
          </TabsContent>

          <TabsContent value="managers">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-siclo-dark">Gestión de Managers</h2>
                  <p className="text-siclo-dark/60">Administra los managers del sistema</p>
                </div>
                
                <Dialog open={isAddManagerOpen} onOpenChange={setIsAddManagerOpen}>
                  <DialogTrigger asChild>
                    <Button className="siclo-button shadow-sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Agregar Manager
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-siclo-dark">Agregar Nuevo Manager</DialogTitle>
                    </DialogHeader>
                    <AddManagerForm onManagerAdded={() => {
                      setIsAddManagerOpen(false);
                      loadManagers();
                    }} />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filtro de búsqueda más delgado */}
              <Card className="siclo-card border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-siclo-dark/40" />
                    <Input
                      placeholder="Buscar managers por nombre o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 border-siclo-light/50 focus:border-siclo-green"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Managers */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredManagers.map((manager: any) => (
                  <Card key={manager.id} className="siclo-card border-0 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-siclo-green to-siclo-blue rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-siclo-dark">{manager.name}</CardTitle>
                          <p className="text-sm text-siclo-dark/60">{manager.email}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="text-sm text-siclo-dark/70">
                          <span className="font-medium">Locales asignados:</span> {manager.stores?.length || 0}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {manager.stores?.slice(0, 2).map((storeId: string) => (
                            <span key={storeId} className="bg-siclo-light/60 text-siclo-dark text-xs px-2 py-1 rounded">
                              {storeId}
                            </span>
                          ))}
                          {manager.stores?.length > 2 && (
                            <span className="bg-siclo-green/10 text-siclo-green text-xs px-2 py-1 rounded">
                              +{manager.stores.length - 2} más
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredManagers.length === 0 && (
                <Card className="siclo-card border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-siclo-green/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-siclo-dark mb-2">
                      {searchTerm ? 'No se encontraron managers' : 'No hay managers registrados'}
                    </h3>
                    <p className="text-siclo-dark/60 text-sm mb-6">
                      {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando el primer manager al sistema'}
                    </p>
                    {!searchTerm && (
                      <Dialog open={isAddManagerOpen} onOpenChange={setIsAddManagerOpen}>
                        <DialogTrigger asChild>
                          <Button className="siclo-button">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Agregar Primer Manager
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-siclo-dark">Agregar Nuevo Manager</DialogTitle>
                          </DialogHeader>
                          <AddManagerForm onManagerAdded={() => {
                            setIsAddManagerOpen(false);
                            loadManagers();
                          }} />
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stores">
            <StoreManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
