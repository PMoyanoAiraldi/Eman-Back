import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { v2 as cloudinary, UploadApiOptions} from 'cloudinary';
import * as crypto from 'crypto';

interface CloudinaryResource {
    etag: string;
    secure_url: string;
    public_id: string;
}

interface CloudinaryResourcesResponse {
    resources: CloudinaryResource[];
}

interface CloudinaryDestroyResult {
    result: 'ok' | 'not found';
}

@Injectable()
export class CloudinaryService {
    constructor(){
        dotenv.config({
            path: '.env'
        });
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }

    async uploadFile(buffer: Buffer, folder: string, originalName?: string): Promise<string>{
        const cleanFileName = originalName
        ? originalName.replace(/[^a-zA-Z0-9_-]/g, '').split('.')[0] // Limpia el nombre
        : `file_${Date.now()}`; // Genera un nombre predeterminado si no se proporciona uno

        const uniqueId = crypto.randomBytes(4).toString('hex'); // ID único para evitar conflictos

        // Intentar buscar archivos duplicados por hash
        const hash = crypto.createHash('sha1').update(buffer).digest('hex');
        
        // Busca en Cloudinary si ya existe un archivo con el mismo hash
        const existingFiles = (await cloudinary.api.resources({
        type: 'upload',
        prefix: folder /// Filtrar por la carpeta específica
    })) as CloudinaryResourcesResponse;

    const existingFile = existingFiles.resources.find((file: CloudinaryResource) => file.etag === hash);

    if (existingFile) {
        console.log('Archivo duplicado detectado, no se subirá nuevamente.');
        return existingFile.secure_url; // Retorna la URL existente
    }

        const options: UploadApiOptions = {
            folder, // Usamos la carpeta específica pasada como argumento
            public_id: `${cleanFileName}_${uniqueId}`,//  ID único del archivo
            resource_type: 'auto' // Automáticamente detecta el tipo
        }

        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                options,
                (error, result) => {
                    if (error) {
                        reject(new Error(error.message));
                    } else if (!result) {
                        reject(new Error('No se obtuvo resultado de Cloudinary'));
                    } else {
                        console.log('Archivo subido con éxito:', result.secure_url);
                        resolve(result.secure_url); // Retornar la URL segura
                    }
                },
                
            );
            stream.write(buffer);
            stream.end();
        })
    }


    private extractPublicId(imageUrl: string): string { 
        const urlWithoutQuery = imageUrl.split('?')[0]; // Remover parámetros de consulta si existen
        const pathSegments = urlWithoutQuery.split('/'); 
        const folderAndFile = pathSegments.slice(-2); // Extraer los últimos dos segmentos (carpeta y archivo)
        const publicId = folderAndFile.join('/').split('.')[0]; // Construir el ID completo sin la extensión
        return publicId;
    }
    // Método para eliminar un archivo de Cloudinary
    async deleteFile(imageUrl: string): Promise<void> {
        const publicId = this.extractPublicId(imageUrl);
        try {
            const result = (await cloudinary.uploader.destroy(publicId)as CloudinaryDestroyResult);
            if (result.result === 'ok') {
                console.log(`Archivo con public_id ${publicId} eliminado exitosamente.`);
            } else {
                throw new Error(`Error al eliminar el archivo con public_id ${publicId}`);
            }
        } catch (error) {
            console.error('Error al eliminar el archivo de Cloudinary:', error);
            throw new Error('Error al eliminar el archivo de Cloudinary');
        }
    }


}
