import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'auto',
  endpoint: import.meta.env.VITE_CLOUDFLARE_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: import.meta.env.VITE_CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.VITE_CLOUDFLARE_SECRET_KEY!,
  },
});

export async function uploadImage(fileName: string, fileType: string) {
  console.log('Iniciando la función uploadImage...');
  console.log('fileName recibido:', fileName);
  console.log('fileType recibido:', fileType);

  try {
    // Genera el nombre del archivo con el prefijo quejas-siclo
    const fullFileName = `quejas-siclo/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    console.log('Nombre completo del archivo generado:', fullFileName);

    // Crea el comando PutObjectCommand
    const command = new PutObjectCommand({
      Bucket: import.meta.env.VITE_CLOUDFLARE_BUCKET_NAME,
      Key: fullFileName,
      ContentType: fileType,
    });

    console.log('Generando presigned URL...');
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // Expira en 1 hora
    console.log('Presigned URL generada:', presignedUrl);

    return {
      success: true,
      presignedUrl,
      fileUrl: `${import.meta.env.VITE_IMAGE_DOMAIN}/${fullFileName}`,
    };
  } catch (error) {
    console.error('Error durante la generación de la presigned URL:', error);
    return { success: false, error: 'Error generating presigned URL' };
  }
}