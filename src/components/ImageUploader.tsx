import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useImageUpload } from '@/hooks/use-image-upload';
import { Upload, X, FileImage, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface ImageUploaderProps {
  onImagesChange?: (imageUrls: string[]) => void;
  maxImages?: number;
  maxFileSize?: number; // en MB
  allowedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesChange,
  maxImages = 5,
  maxFileSize = 3,
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  className,
  disabled = false
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const { uploadSingleImage, isUploading } = useImageUpload({
    maxFileSize,
    allowedTypes,
    onProgress: (progress, imageId) => {
      setUploadedImages(prev =>
        prev.map(img =>
          img.id === imageId
            ? { ...img, progress }
            : img
        )
      );
    },
    onSuccess: (fileUrl, file, imageId) => {
      setUploadedImages(prev => {
        const updated = prev.map(img =>
          img.id === imageId
            ? { ...img, url: fileUrl, status: 'completed' as const, progress: 100 }
            : img
        );
        
        // Notificar cambios al componente padre
        const completedUrls = updated
          .filter(img => img.status === 'completed')
          .map(img => img.url);
        onImagesChange?.(completedUrls);
        
        return updated;
      });
    },
    onError: (error, imageId) => {
      setUploadedImages(prev =>
        prev.map(img =>
          img.id === imageId
            ? { ...img, status: 'error' as const, error, progress: 0 }
            : img
        )
      );
    }
  });

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    if (disabled) return;
    
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - uploadedImages.length;
    const filesToUpload = fileArray.slice(0, remainingSlots);

    // Crear entradas temporales para las imágenes
    const newImages: UploadedImage[] = filesToUpload.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file), // URL temporal para preview
      status: 'uploading',
      progress: 0
    }));

    setUploadedImages(prev => [...prev, ...newImages]);

    // Subir cada imagen individualmente
    for (const image of newImages) {
      try {
        await uploadSingleImage(image.file, image.id);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  }, [uploadSingleImage, maxImages, uploadedImages.length, disabled]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      
      // Limpiar URL temporal si existe
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove?.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      
      // Notificar cambios al componente padre
      const completedUrls = updated
        .filter(img => img.status === 'completed')
        .map(img => img.url);
      onImagesChange?.(completedUrls);
      
      return updated;
    });
  };

  const retryUpload = async (imageId: string) => {
    const image = uploadedImages.find(img => img.id === imageId);
    if (image && image.status === 'error') {
      setUploadedImages(prev =>
        prev.map(img =>
          img.id === imageId
            ? { ...img, status: 'uploading', progress: 0, error: undefined }
            : img
        )
      );
      
      try {
        await uploadSingleImage(image.file, imageId);
      } catch (error) {
        console.error('Error retrying upload:', error);
      }
    }
  };

  const canAddMore = uploadedImages.length < maxImages && !disabled;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Zona de subida */}
      {canAddMore && (
        <Card
          className={cn(
            "border-2 border-dashed transition-all duration-200 cursor-pointer",
            isDragOver
              ? "border-siclo-green bg-siclo-green/5"
              : "border-siclo-light hover:border-siclo-green hover:bg-siclo-green/5",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-6">
            <label className={cn("block text-center", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
              <Upload className={cn(
                "w-8 h-8 mx-auto mb-3 transition-colors",
                isDragOver ? "text-siclo-green" : "text-siclo-dark/50"
              )} />
              <p className="text-siclo-dark font-medium mb-1">
                {isDragOver ? "Suelta las imágenes aquí" : "Haz clic o arrastra imágenes"}
              </p>
              <p className="text-sm text-siclo-dark/60">
                {allowedTypes.join(', ').replace(/image\//g, '').toUpperCase()} (MAX. {maxFileSize}MB cada una)
              </p>
              <p className="text-xs text-siclo-dark/40 mt-1">
                {uploadedImages.length}/{maxImages} imágenes
              </p>
              <input
                type="file"
                multiple
                accept={allowedTypes.join(',')}
                onChange={handleFileInput}
                className="hidden"
                disabled={disabled}
              />
            </label>
          </CardContent>
        </Card>
      )}

      {/* Grid de imágenes subidas */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((image) => (
            <Card key={image.id} className="relative overflow-hidden group">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.file.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay con estado */}
                  <div className={cn(
                    "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity",
                    image.status === 'completed' ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                  )}>
                    {image.status === 'uploading' && (
                      <div className="text-center text-white">
                        <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                        <div className="text-xs">
                          {image.progress}%
                        </div>
                      </div>
                    )}
                    
                    {image.status === 'completed' && (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    )}
                    
                    {image.status === 'error' && (
                      <div className="text-center text-white">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-400" />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => retryUpload(image.id)}
                          className="text-xs"
                        >
                          Reintentar
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Botón eliminar */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(image.id)}
                    className={cn(
                      "absolute top-1 right-1 w-6 h-6 p-0 rounded-full transition-opacity",
                      "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <X className="w-3 h-3" />
                  </Button>

                  {/* Barra de progreso */}
                  {image.status === 'uploading' && (
                    <div className="absolute bottom-0 left-0 right-0">
                      <Progress value={image.progress} className="h-1" />
                    </div>
                  )}
                </div>

                {/* Info del archivo */}
                <div className="p-2 bg-white">
                  <div className="flex items-center gap-1">
                    <FileImage className="w-3 h-3 text-siclo-dark/50" />
                    <span className="text-xs text-siclo-dark/70 truncate">
                      {image.file.name}
                    </span>
                  </div>
                  {image.error && (
                    <p className="text-xs text-red-600 mt-1 truncate">
                      {image.error}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mensaje cuando se alcanza el límite */}
      {uploadedImages.length >= maxImages && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800 text-center">
              Has alcanzado el límite máximo de {maxImages} imágenes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUploader; 