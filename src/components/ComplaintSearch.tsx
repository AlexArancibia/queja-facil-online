import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Calendar, AlertCircle, Share2, Copy, CheckCheck } from 'lucide-react';
import { type Complaint, ComplaintPriority, ComplaintStatus } from '@/types/api';
import { useComplaintsStore } from '@/stores/complaintsStore';
import { useBranchesStore } from '@/stores/branchesStore';
import { generateComplaintShareableUrl } from '@/lib/envConfig';
import { useToast } from '@/hooks/use-toast';
import AttachmentsViewer from '@/components/AttachmentsViewer';

const ComplaintSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Complaint[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedComplaintId, setCopiedComplaintId] = useState<string | null>(null);

  // Stores
  const { complaints, fetchComplaints } = useComplaintsStore();
  const { branches, getAllBranches } = useBranchesStore();
  const { toast } = useToast();

  // Effect to load complaint from URL parameter
  useEffect(() => {
    const urlComplaintId = searchParams.get('id');
    if (urlComplaintId && urlComplaintId !== searchTerm) {
      setSearchTerm(urlComplaintId);
      // Trigger search automatically if we have an ID from URL
      handleSearch(urlComplaintId);
    }
  }, [searchParams]);

  const handleSearch = async (termToSearch?: string) => {
    const term = termToSearch || searchTerm;
    if (!term.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Primero asegurarmos de cargar las sucursales si no están cargadas
      if (!branches.length) {
        await getAllBranches();
      }

      // Siempre hacer fetch de las quejas para obtener datos actualizados
      await fetchComplaints();
      
      // Obtener el estado actualizado del store
      const currentComplaints = useComplaintsStore.getState().complaints;

      // Search by ID or email
      const results = currentComplaints.filter(complaint => 
        complaint.id.toLowerCase().includes(term.toLowerCase()) ||
        complaint.email.toLowerCase().includes(term.toLowerCase())
      );
      
      setSearchResults(results);

      // Update URL with search term (only if it's an ID format)
      if (term && (term.startsWith('QJ-') || term.includes('@'))) {
        const newSearchParams = new URLSearchParams(searchParams);
        if (results.length > 0 && term.startsWith('QJ-')) {
          newSearchParams.set('id', term);
        } else {
          newSearchParams.delete('id');
        }
        setSearchParams(newSearchParams);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const copyShareableLink = async (complaintId: string) => {
    try {
      const shareableUrl = generateComplaintShareableUrl(complaintId);
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedComplaintId(complaintId);
      toast({
        title: "Link copiado",
        description: "El enlace para compartir la queja ha sido copiado al portapapeles",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedComplaintId(null), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case ComplaintStatus.IN_PROGRESS:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case ComplaintStatus.RESOLVED:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case ComplaintStatus.REJECTED:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: ComplaintPriority) => {
    switch (priority) {
      case ComplaintPriority.HIGH:
        return 'bg-red-50 text-red-700 border-red-200';
      case ComplaintPriority.MEDIUM:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case ComplaintPriority.LOW:
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? `${branch.name} - ${branch.address}` : branchId;
  };

  const formatStatus = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING: return 'Pendiente';
      case ComplaintStatus.IN_PROGRESS: return 'En proceso';
      case ComplaintStatus.RESOLVED: return 'Resuelta';
      case ComplaintStatus.REJECTED: return 'Rechazada';
      default: return status;
    }
  };

  const formatPriority = (priority: ComplaintPriority) => {
    switch (priority) {
      case ComplaintPriority.HIGH: return 'Alta';
      case ComplaintPriority.MEDIUM: return 'Media';
      case ComplaintPriority.LOW: return 'Baja';
      default: return priority;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Search Section - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-base md:text-lg font-semibold text-slate-800">
            Buscar Queja
          </Label>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Ingresa el ID de tu queja o tu correo electrónico para ver el estado
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-1">
            <div className="flex-1 min-w-0">
              <Input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="QJ-1234567890-ABCDE o tu@email.com"
                className="w-full text-sm focus:ring-2 focus:ring-siclo-green/20 focus:ring-inset focus:border-siclo-green border-slate-300"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={() => handleSearch()} 
              disabled={!searchTerm.trim() || isSearching}
              className="w-full sm:w-auto shrink-0 font-medium"
            >
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </div>
      </div>

      {hasSearched && (
        <div className="space-y-4">
          {searchResults.length === 0 ? (
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="pt-6">
                <div className="text-center px-4">
                  <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
                    No se encontraron quejas
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    No hay quejas registradas con el ID o correo electrónico proporcionado.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-slate-700 shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                  {searchResults.length === 1 ? 'Queja encontrada' : `${searchResults.length} quejas encontradas`}
                </h3>
              </div>
              
              {searchResults.map((complaint) => (
                <Card key={complaint.id} className="w-full max-w-full overflow-hidden border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 bg-slate-50/50">
                    {/* Mobile-First Header Layout */}
                    <div className="space-y-3">
                      {/* Title and Share Button Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg font-bold text-slate-900 break-all">
                            ID: {complaint.id}
                          </CardTitle>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyShareableLink(complaint.id)}
                          className="shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3 border-slate-300 text-slate-600 hover:text-slate-800"
                          title="Copiar enlace para compartir"
                        >
                          {copiedComplaintId === complaint.id ? (
                            <CheckCheck className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <>
                              <Share2 className="h-4 w-4" />
                              <Copy className="h-3 w-3 ml-1 hidden sm:block" />
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* Badges and Date Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`${getStatusColor(complaint.status)} border font-medium text-xs`}>
                            {formatStatus(complaint.status)}
                          </Badge>
                          <Badge className={`${getPriorityColor(complaint.priority)} border font-medium text-xs`}>
                            Prioridad {formatPriority(complaint.priority)}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-500 flex items-center font-medium">
                          <Calendar className="h-4 w-4 mr-1 shrink-0" />
                          <span className="whitespace-nowrap">
                            {new Date(complaint.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-4 space-y-5">
                    {/* Contact and Branch Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</p>
                        <p className="text-sm sm:text-base text-slate-800 font-medium break-words">{complaint.fullName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Correo</p>
                        <p className="text-sm sm:text-base text-slate-700 break-all">{complaint.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sucursal</p>
                        <p className="text-sm sm:text-base text-slate-800 font-medium break-words">{getBranchName(complaint.branchId)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</p>
                        <p className="text-sm sm:text-base text-slate-800 font-medium">{complaint.observationType}</p>
                      </div>
                    </div>
                    
                    {/* Complaint Detail */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Detalle de la Queja</p>
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg max-w-full overflow-hidden">
                        <p className="text-sm sm:text-base text-slate-700 break-words whitespace-pre-wrap leading-relaxed">
                          {complaint.detail}
                        </p>
                      </div>
                    </div>

                    {/* Resolution */}
                    {complaint.resolution && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 max-w-full overflow-hidden">
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Resolución</p>
                        <p className="text-sm sm:text-base text-emerald-800 break-words whitespace-pre-wrap leading-relaxed">
                          {complaint.resolution}
                        </p>
                      </div>
                    )}

                    {/* Manager Comments */}
                    {complaint.managerComments && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-full overflow-hidden">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Comentarios del Manager</p>
                        <p className="text-sm sm:text-base text-blue-800 break-words whitespace-pre-wrap leading-relaxed">
                          {complaint.managerComments}
                        </p>
                      </div>
                    )}

                    {/* Attachments */}
                    {(complaint.attachments?.length > 0 || complaint.resolutionAttachments?.length > 0) && (
                      <div className="pt-4 border-t border-slate-200 max-w-full overflow-hidden">
                        <AttachmentsViewer
                          attachments={complaint.attachments}
                          resolutionAttachments={complaint.resolutionAttachments}
                          title="Archivos Adjuntos"
                        />
                      </div>
                    )}

                    {/* Share Info */}
                    <div className="pt-3 border-t border-slate-100 max-w-full overflow-hidden">
                      <p className="text-xs text-slate-500 break-words leading-relaxed">
                        💡 <span className="font-medium">Enlace compartible:</span> Usa el botón de compartir para generar un enlace que permita a otros ver el estado de esta queja.
                      </p>
                    </div>
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