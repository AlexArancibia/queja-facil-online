
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Calendar, AlertCircle, Filter } from 'lucide-react';
import { type Complaint } from '@/types/complaint';
import { MOCK_STORES } from '@/types/complaint';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ComplaintSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Complaint[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const existingComplaints: Complaint[] = JSON.parse(localStorage.getItem('complaints') || '[]');
      
      let results = existingComplaints.filter(complaint => 
        complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Apply status filter
      if (statusFilter) {
        results = results.filter(complaint => complaint.status === statusFilter);
      }

      // Apply date filters
      if (dateFrom) {
        results = results.filter(complaint => 
          new Date(complaint.createdAt) >= new Date(dateFrom)
        );
      }
      
      if (dateTo) {
        results = results.filter(complaint => 
          new Date(complaint.createdAt) <= new Date(dateTo)
        );
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'En proceso':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Resuelta':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rechazada':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Media':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Baja':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStoreName = (storeId: string) => {
    const store = MOCK_STORES.find(s => s.id === storeId);
    return store ? store.name : storeId;
  };

  return (
    <div className="space-y-4">
      {/* Filtros más delgados */}
      <div className="bg-white/80 backdrop-blur-sm border border-siclo-light/40 rounded-lg p-3 shadow-sm">
        <div className="flex flex-col space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ID de queja o correo electrónico"
                className="h-9 border-siclo-light/50 focus:border-siclo-green text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={!searchTerm.trim() || isSearching}
              className="h-9 px-4 siclo-button text-sm"
            >
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
          
          <div className="flex gap-3 text-sm">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-40 border-siclo-light/50 focus:border-siclo-green">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="En proceso">En proceso</SelectItem>
                <SelectItem value="Resuelta">Resuelta</SelectItem>
                <SelectItem value="Rechazada">Rechazada</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Desde"
              className="h-9 w-40 border-siclo-light/50 focus:border-siclo-green text-sm"
            />

            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Hasta"
              className="h-9 w-40 border-siclo-light/50 focus:border-siclo-green text-sm"
            />
          </div>
        </div>
      </div>

      {hasSearched && (
        <div className="space-y-4">
          {searchResults.length === 0 ? (
            <Card className="bg-gray-50/50 border-gray-200/50">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron quejas
                  </h3>
                  <p className="text-gray-600 text-sm">
                    No hay quejas registradas con los criterios de búsqueda proporcionados.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-siclo-green" />
                <h3 className="text-lg font-semibold text-siclo-dark">
                  {searchResults.length === 1 ? 'Queja encontrada' : `${searchResults.length} quejas encontradas`}
                </h3>
              </div>
              
              {searchResults.map((complaint) => (
                <Card key={complaint.id} className="siclo-card hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-siclo-dark">{complaint.id}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge className={`${getStatusColor(complaint.status)} text-xs font-medium`}>
                            {complaint.status}
                          </Badge>
                          <Badge className={`${getPriorityColor(complaint.priority)} text-xs font-medium`}>
                            {complaint.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-siclo-dark/60">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(complaint.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-siclo-dark/70">Nombre:</p>
                        <p className="text-siclo-dark">{complaint.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-siclo-dark/70">Local:</p>
                        <p className="text-siclo-dark">{getStoreName(complaint.store)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-siclo-dark/70">Tipo:</p>
                        <p className="text-siclo-dark">{complaint.observationType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-siclo-dark/70">Correo:</p>
                        <p className="text-siclo-dark">{complaint.email}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-siclo-dark/70 mb-2">Detalle:</p>
                      <p className="text-siclo-dark bg-siclo-light/30 p-3 rounded-md text-sm leading-relaxed">{complaint.detail}</p>
                    </div>

                    {complaint.resolution && (
                      <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-md p-4">
                        <p className="text-sm font-medium text-emerald-800 mb-2">Resolución:</p>
                        <p className="text-emerald-700 text-sm">{complaint.resolution}</p>
                      </div>
                    )}

                    {complaint.managerComments && (
                      <div className="bg-blue-50/50 border border-blue-200/50 rounded-md p-4 mt-4">
                        <p className="text-sm font-medium text-blue-800 mb-2">Comentarios del Manager:</p>
                        <p className="text-blue-700 text-sm">{complaint.managerComments}</p>
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
