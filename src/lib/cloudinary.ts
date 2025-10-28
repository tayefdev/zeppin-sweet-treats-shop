const CLOUD_NAME = 'dgxuw3zqp';
const UPLOAD_PRESET = 'bakery_uploads';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: 'image' | 'video';
  width?: number;
  height?: number;
}

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  folder?: string;
}

export const uploadToCloudinary = async (
  file: File,
  options?: UploadOptions
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  if (options?.folder) {
    formData.append('folder', options.folder);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && options?.onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        options.onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          public_id: response.public_id,
          secure_url: response.secure_url,
          format: response.format,
          resource_type: response.resource_type,
          width: response.width,
          height: response.height,
        });
      } else {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);
    xhr.send(formData);
  });
};

export const getOptimizedImageUrl = (
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  }
): string => {
  const transformations: string[] = [];
  
  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.quality) transformations.push(`q_${options.quality}`);
  if (options?.format) transformations.push(`f_${options.format}`);
  
  transformations.push('c_limit');
  
  const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : '';
  
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}${publicId}`;
};

export const extractPublicId = (url: string): string | null => {
  const match = url.match(/\/v\d+\/(.+)\.\w+$/);
  return match ? match[1] : null;
};
