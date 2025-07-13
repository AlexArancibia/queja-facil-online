
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FileText, Calendar, AlertCircle } from 'lucide-react';
import { type Complaint } from '@/types/complaint';
import { MOCK_STORES } from '@/types/complaint';
import { useComplaintsStore } from '@/stores/complaintsStore';

const ComplaintSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Complaint[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { searchComplaints, loading } = useComplaintsStore();

  const handleSearch = async () => {
    setHasSearched(true);
    
    try {
      const [email, complaintId] = searchTerm.includes('@') 
        ? [searchTerm, '']
        : ['', searchTerm];
      
      const results = await searchComplaints(email || searchTerm, complaintId);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'En proceso':
        return 'bg-blue-100 text-blue-800';
      case 'Resuelta':
        return 'bg-green-100 text-green-800';
      case 'Rechazada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStoreName = (storeId: string) => {
    const store = MOCK_STORES.find(s => s.id === storeId);
    return store ? store.name : storeId;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="text-siclo-dark font-medium">ID de Queja o Correo Electrónico</Label>
          <Input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ej: SICLO-123... o tu@email.com"
            className="mt-1 border-siclo-light focus:border-siclo-green"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex items-end">
          <Button 
            onClick={handleSearch} 
            disabled={!searchTerm.trim() || loading}
            className="w-full sm:w-auto siclo-button"
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
      </div>

      {loading && hasSearched && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="siclo-card">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasSearched && !loading && (
        <div className="space-y-4">
          {searchResults.length === 0 ? (
            <Card className="siclo-card bg-gray-50/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron quejas
                  </h3>
                  <p className="text-gray-600">
                    No hay quejas registradas con el criterio proporcionado.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  {searchResults.length === 1 ? 'Queja encontrada' : `${searchResults.length} quejas encontradas`}
                </h3>
              </div>
              
              {searchResults.map((complaint) => (
                <Card key={complaint.id} className="w-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">ID: {complaint.id}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status}
                          </Badge>
                          <Badge className={getPriorityColor(complaint.priority)}>
                            Prioridad {complaint.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(complaint.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Nombre:</p>
                        <p className="text-gray-900">{complaint.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Local:</p>
                        <p className="text-gray-900">{getStoreName(complaint.store)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Tipo:</p>
                        <p className="text-gray-900">{complaint.observationType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Correo:</p>
                        <p className="text-gray-900">{complaint.email}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Detalle:</p>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{complaint.detail}</p>
                    </div>

                    {complaint.resolution && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <p className="text-sm font-medium text-green-800 mb-2">Resolución:</p>
                        <p className="text-green-700">{complaint.resolution}</p>
                      </div>
                    )}

                    {complaint.managerComments && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                        <p className="text-sm font-medium text-blue-800 mb-2">Comentarios del Manager:</p>
                        <p className="text-blue-700">{complaint.managerComments}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplaintSearch;
