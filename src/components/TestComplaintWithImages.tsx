import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AttachmentsViewer from '@/components/AttachmentsViewer';
import { type Complaint, ComplaintPriority, ComplaintStatus } from '@/types/api';

// Ejemplo de una queja con imágenes adjuntas
const mockComplaint: Complaint = {
  id: "QJ-1234567890-ABCDE",
  fullName: "Juan Pérez",
  email: "juan.perez@email.com",
  branchId: "branch-1",
  observationType: "Instalaciones",
  detail: "Las duchas no tienen agua caliente y hay problemas con la ventilación en el área de cardio.",
  priority: ComplaintPriority.HIGH,
  status: ComplaintStatus.RESOLVED,
  resolution: "Se ha reparado el sistema de agua caliente y se ha mejorado la ventilación. El problema ha sido resuelto completamente.",
  managerComments: "Hemos tomado las medidas necesarias para resolver el problema. Agradecemos la retroalimentación.",
  attachments: [
    {
      filename: "ducha_problema.jpg",
      url: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=400&h=300&fit=crop"
    },
    {
      filename: "ventilacion_area_cardio.png",
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    }
  ],
  resolutionAttachments: [
    {
      filename: "ducha_reparada.jpg",
      url: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=300&fit=crop"
    },
    {
      filename: "nueva_ventilacion.jpg",
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    }
  ],
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-20T15:45:00Z')
};

const TestComplaintWithImages = () => {
  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ComplaintStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case ComplaintStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case ComplaintStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ComplaintPriority) => {
    switch (priority) {
      case ComplaintPriority.HIGH:
        return 'bg-red-100 text-red-800';
      case ComplaintPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case ComplaintPriority.LOW:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ejemplo: Queja con Imágenes Adjuntas</h1>
      
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">ID: {mockComplaint.id}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={getStatusColor(mockComplaint.status)}>
                  {formatStatus(mockComplaint.status)}
                </Badge>
                <Badge className={getPriorityColor(mockComplaint.priority)}>
                  Prioridad {formatPriority(mockComplaint.priority)}
                </Badge>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center">
                {new Date(mockComplaint.createdAt).toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Nombre:</p>
              <p className="text-gray-900">{mockComplaint.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Tipo:</p>
              <p className="text-gray-900">{mockComplaint.observationType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Correo:</p>
              <p className="text-gray-900">{mockComplaint.email}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Detalle:</p>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{mockComplaint.detail}</p>
          </div>

          {mockComplaint.resolution && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <p className="text-sm font-medium text-green-800 mb-2">Resolución:</p>
              <p className="text-green-700">{mockComplaint.resolution}</p>
            </div>
          )}

          {mockComplaint.managerComments && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <p className="text-sm font-medium text-blue-800 mb-2">Comentarios del Manager:</p>
              <p className="text-blue-700">{mockComplaint.managerComments}</p>
            </div>
          )}

          {/* Mostrar archivos adjuntos */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <AttachmentsViewer
              attachments={mockComplaint.attachments}
              resolutionAttachments={mockComplaint.resolutionAttachments}
              title="Archivos Adjuntos"
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Características del visor de adjuntos:</h3>
        <ul className="text-sm space-y-1">
          <li>✅ Distingue entre imágenes de la queja original y las de resolución</li>
          <li>✅ Preview de imágenes con hover effects</li>
          <li>✅ Modal para ver imágenes en tamaño completo</li>
          <li>✅ Botones para ver y descargar</li>
          <li>✅ Diseño responsivo (2/3/4 columnas según pantalla)</li>
          <li>✅ Soporte para archivos no visualizables</li>
        </ul>
      </div>
    </div>
  );
};

export default TestComplaintWithImages; 