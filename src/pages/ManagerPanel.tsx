
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { type Complaint } from '@/types/complaint';
import { MOCK_STORES } from '@/types/complaint';
import { 
  MessageSquareText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Upload,
  FileImage,
  X
} from 'lucide-react';

const ManagerPanel = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolution, setResolution] = useState('');
  const [managerComments, setManagerComments] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [evidencePreviews, setEvidencePreviews] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, statusFilter, searchTerm, dateFrom, dateTo]);

  const loadComplaints = () => {
    const existingComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    setComplaints(existingComplaints);
  };

  const filterComplaints = () => {
    let filtered = complaints;

    if (statusFilter) {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(complaint => 
        complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(complaint => 
        new Date(complaint.createdAt) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(complaint => 
        new Date(complaint.createdAt) <= new Date(dateTo)
      );
    }

    setFilteredComplaints(filtered);
  };

  const handleEvidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setEvidenceFiles(prev => [...prev, ...newFiles]);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setEvidencePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeEvidence = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
    setEvidencePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const updateComplaintStatus = (complaint: Complaint, newStatus: string) => {
    const updatedComplaints = complaints.map(c =>
      c.id === complaint.id 
        ? { ...c, status: newStatus, updatedAt: new Date(), resolution, managerComments }
        : c
    );
    
    setComplaints(updatedComplaints);
    localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
    
    setSelectedComplaint(null);
    setResolution('');
    setManagerComments('');
    setEvidenceFiles([]);
    setEvidencePreviews([]);
    
    toast({
      title: `Queja marcada como ${newStatus.toLowerCase()}`,
      description: `La queja ${complaint.id} ha sido actualizada`,
    });
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

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pendiente').length,
    inProgress: complaints.filter(c => c.status === 'En proceso').length,
    resolved: complaints.filter(c => c.status === 'Resuelta').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-siclo-light via-white to-blue-50/20">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-siclo-light/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 siclo-gradient rounded-xl flex items-center justify-center shadow-sm">
                <MessageSquareText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-siclo-dark">Panel Manager</h1>
                <p className="text-xs text-siclo-dark/60 font-medium">Sistema de Gestión de Quejas</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="siclo-card border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageSquareText className="h-8 w-8 text-siclo-blue" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-siclo-dark">{stats.total}</p>
                  <p className="text-sm text-siclo-dark/60">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="siclo-card border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-amber-500" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-siclo-dark">{stats.pending}</p>
                  <p className="text-sm text-siclo-dark/60">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="siclo-card border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-siclo-dark">{stats.inProgress}</p>
                  <p className="text-sm text-siclo-dark/60">En Proceso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="siclo-card border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-siclo-dark">{stats.resolved}</p>
                  <p className="text-sm text-siclo-dark/60">Resueltas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros más delgados */}
        <Card className="siclo-card border-0 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex gap-3">
                <Input
                  placeholder="Buscar por ID, nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 h-9 border-siclo-light/50 focus:border-siclo-green text-sm"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 h-9 border-siclo-light/50 focus:border-siclo-green">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En proceso">En proceso</SelectItem>
                    <SelectItem value="Resuelta">Resuelta</SelectItem>
                    <SelectItem value="Rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40 h-9 border-siclo-light/50 focus:border-siclo-green text-sm"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40 h-9 border-siclo-light/50 focus:border-siclo-green text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Quejas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-siclo-dark mb-4">Quejas ({filteredComplaints.length})</h2>
            {filteredComplaints.map((complaint) => (
              <Card 
                key={complaint.id} 
                className={`siclo-card cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedComplaint?.id === complaint.id ? 'ring-2 ring-siclo-green' : ''
                }`}
                onClick={() => setSelectedComplaint(complaint)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-siclo-dark">{complaint.id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={`${getStatusColor(complaint.status)} text-xs`}>
                        {complaint.status}
                      </Badge>
                      <Badge className={`${getPriorityColor(complaint.priority)} text-xs`}>
                        {complaint.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-siclo-dark/70">Cliente:</span> {complaint.fullName}</p>
                    <p><span className="font-medium text-siclo-dark/70">Local:</span> {getStoreName(complaint.store)}</p>
                    <p><span className="font-medium text-siclo-dark/70">Tipo:</span> {complaint.observationType}</p>
                    <p className="text-siclo-dark/80 line-clamp-2">{complaint.detail}</p>
                    <div className="flex items-center text-siclo-dark/60 text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(complaint.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Panel de Detalles */}
          <div className="space-y-4">
            {selectedComplaint ? (
              <Card className="siclo-card border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-siclo-green/5 to-siclo-blue/5">
                  <CardTitle className="text-siclo-dark">Gestionar Queja</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="bg-siclo-light/30 p-4 rounded-lg">
                    <h3 className="font-semibold text-siclo-dark mb-2">Detalle de la Queja</h3>
                    <p className="text-siclo-dark/80 text-sm leading-relaxed">{selectedComplaint.detail}</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-siclo-dark">Comentarios del Manager</label>
                    <Textarea
                      value={managerComments}
                      onChange={(e) => setManagerComments(e.target.value)}
                      placeholder="Agregar comentarios internos..."
                      className="border-siclo-light/50 focus:border-siclo-green"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-siclo-dark">Resolución</label>
                    <Textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Describir la resolución de la queja..."
                      className="border-siclo-light/50 focus:border-siclo-green"
                    />
                  </div>

                  {/* Upload de evidencia */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-siclo-dark">Evidencia (Opcional)</label>
                    <div className="border-2 border-dashed border-siclo-light/60 rounded-lg p-4 text-center hover:border-siclo-green/50 transition-colors">
                      <label className="cursor-pointer block">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-siclo-green" />
                        <p className="text-siclo-dark text-sm font-medium mb-1">
                          Subir evidencia de resolución
                        </p>
                        <p className="text-xs text-siclo-dark/60">PNG, JPG, JPEG (MAX. 5MB)</p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleEvidenceChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    {evidencePreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {evidencePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={preview} 
                              alt={`Evidencia ${index + 1}`}
                              className="w-full h-20 object-cover rounded border border-siclo-light/50"
                            />
                            <button
                              type="button"
                              onClick={() => removeEvidence(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => updateComplaintStatus(selectedComplaint, 'En proceso')}
                      variant="outline"
                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      En Proceso
                    </Button>
                    <Button
                      onClick={() => updateComplaintStatus(selectedComplaint, 'Resuelta')}
                      className="flex-1 siclo-button"
                      disabled={!resolution.trim()}
                    >
                      Resolver
                    </Button>
                    <Button
                      onClick={() => updateComplaintStatus(selectedComplaint, 'Rechazada')}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="siclo-card border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <MessageSquareText className="h-12 w-12 text-siclo-green/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-siclo-dark mb-2">
                    Selecciona una queja
                  </h3>
                  <p className="text-siclo-dark/60 text-sm">
                    Haz clic en una queja de la lista para ver los detalles y gestionarla.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerPanel;
