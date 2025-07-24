import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileImage, Eye, Download, X } from 'lucide-react';
import { type Attachment } from '@/types/api';

interface AttachmentsViewerProps {
  attachments?: Attachment[];
  resolutionAttachments?: Attachment[];
  title?: string;
  className?: string;
}

const AttachmentsViewer: React.FC<AttachmentsViewerProps> = ({
  attachments = [],
  resolutionAttachments = [],
  title = "Archivos Adjuntos",
  className = ""
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const allAttachments = [
    ...attachments.map(att => ({ ...att, type: 'complaint' as const })),
    ...resolutionAttachments.map(att => ({ ...att, type: 'resolution' as const }))
  ];

  if (allAttachments.length === 0) {
    return null;
  }

  const isImageFile = (filename: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const openImage = (url: string) => {
    setSelectedImage(url);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className={`space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden ${className}`}>
      <div className="flex items-center gap-2">
        <FileImage className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 shrink-0" />
        <h4 className="text-sm sm:text-base font-semibold text-slate-800">{title}</h4>
        <Badge variant="secondary" className="text-xs shrink-0 bg-slate-100 text-slate-700 border-slate-200">
          {allAttachments.length}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {allAttachments.map((attachment, index) => (
          <Card key={index} className="relative group overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              {isImageFile(attachment.filename) ? (
                <div className="relative">
                  <img
                    src={attachment.url}
                    alt={attachment.filename}
                    className="w-full h-24 sm:h-32 object-cover cursor-pointer"
                    onClick={() => openImage(attachment.url)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openImage(attachment.url)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-white/90 hover:bg-white border-slate-200 text-slate-700 hover:text-slate-900"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadFile(attachment.url, attachment.filename)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-white/90 hover:bg-white border-slate-200 text-slate-700 hover:text-slate-900"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Badge para indicar el tipo */}
                  <div className="absolute top-1 left-1">
                    <Badge 
                      variant={attachment.type === 'complaint' ? 'default' : 'secondary'}
                      className={`text-xs px-1 py-0 font-medium ${
                        attachment.type === 'complaint' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {attachment.type === 'complaint' ? 'Sugerencia' : 'Resolución'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="h-24 sm:h-32 bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-2 sm:p-4">
                  <FileImage className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400 mb-1 sm:mb-2" />
                  <p className="text-xs text-slate-600 text-center mb-1 sm:mb-2 font-medium">
                    Archivo no visualizable
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadFile(attachment.url, attachment.filename)}
                    className="h-5 sm:h-6 text-xs px-2 border-slate-300 text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                  >
                    <Download className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                    Descargar
                  </Button>
                </div>
              )}
              
              <div className="p-2 bg-white max-w-full overflow-hidden border-t border-slate-100">
                <p className="text-xs text-slate-600 truncate font-medium" title={attachment.filename}>
                  {attachment.filename}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal para ver imagen completa */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] p-0 border-slate-200">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 z-10 bg-black/60 text-white hover:bg-black/80 border-0"
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Vista completa"
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttachmentsViewer; 