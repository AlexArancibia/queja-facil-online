import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { uploadImage } from "@/actions/upload-file"

export interface UploadOptions {
  shopId?: string
  onSuccess?: (fileUrl: string, file: File, imageId?: string) => void
  onError?: (error: string, imageId?: string) => void
  onProgress?: (progress: number, imageId?: string) => void
  maxFileSize?: number // en MB
  allowedTypes?: string[]
}

export interface UploadResult {
  success: boolean
  fileUrl?: string
  error?: string
}

export function useImageUpload(options: UploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()


  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = (options.maxFileSize || 10) * 1024 * 1024 // Default 10MB
    const allowedTypes = options.allowedTypes || ["image/jpeg", "image/png", "image/webp", "image/gif"]

    if (file.size > maxSize) {
      return { valid: false, error: `El archivo es muy grande. Máximo ${options.maxFileSize || 10}MB` }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Tipo de archivo no permitido. Solo se permiten imágenes." }
    }

    return { valid: true }
  }

  const uploadSingleImage = async (file: File, imageId?: string): Promise<UploadResult> => {
    const validation = validateFile(file)
    if (!validation.valid) {
      const error = validation.error || "Archivo inválido"
      options.onError?.(error, imageId)
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      })
      return { success: false, error }
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simular progreso inicial
      setUploadProgress(10)
      options.onProgress?.(10, imageId)

      // Genera la presigned URL
      const { success, presignedUrl, fileUrl, error } = await uploadImage( file.name, file.type)

      if (!success || !presignedUrl) {
        const errorMsg = error || "Error al generar URL de subida"
        options.onError?.(errorMsg, imageId)
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMsg,
        })
        return { success: false, error: errorMsg }
      }

      setUploadProgress(50)
      options.onProgress?.(50, imageId)

      // Sube el archivo a R2
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadResponse.ok) {
        const errorMsg = `Error subiendo archivo: ${uploadResponse.statusText}`
        options.onError?.(errorMsg, imageId)
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMsg,
        })
        return { success: false, error: errorMsg }
      }

      setUploadProgress(100)
      options.onProgress?.(100, imageId)
      options.onSuccess?.(fileUrl, file, imageId)

      toast({
        title: "Éxito",
        description: "Imagen subida correctamente",
      })

      return { success: true, fileUrl }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error desconocido"
      options.onError?.(errorMsg, imageId)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      })
      return { success: false, error: errorMsg }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const uploadMultipleImages = async (files: FileList | File[]): Promise<UploadResult[]> => {
    const fileArray = Array.from(files)
    const results: UploadResult[] = []

    for (const file of fileArray) {
      const imageId = `${Date.now()}-${Math.random()}`
      const result = await uploadSingleImage(file, imageId)
      results.push(result)
    }

    return results
  }

  const triggerFileSelect = (
    options: {
      multiple?: boolean
      accept?: string
      onSelect?: (files: FileList | null) => void
    } = {},
  ) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = options.accept || "image/*"
    input.multiple = options.multiple || false

    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      options.onSelect?.(target.files)

      if (target.files) {
        if (options.multiple) {
          uploadMultipleImages(target.files)
        } else if (target.files[0]) {
          const imageId = `${Date.now()}-${Math.random()}`
          uploadSingleImage(target.files[0], imageId)
        }
      }
    }

    input.click()
  }

  return {
    uploadSingleImage,
    uploadMultipleImages,
    triggerFileSelect,
    isUploading,
    uploadProgress,
  }
}
