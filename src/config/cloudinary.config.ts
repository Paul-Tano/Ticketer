import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configuration du SDK Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Intercepteur pour les concerts
export const cloudinaryConcertsConfig = {
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      // @ts-ignore
      folder: 'ticketer/concerts',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: (req: any, file: any) => {
        const title = req.body.title || 'concert';
        const date = req.body.date || Date.now();
        const cleanTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return `${cleanTitle}-${date}`;
      },
    },
  }),
};

// Intercepteur pour les groupes
export const cloudinaryBandsConfig = {
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      // @ts-ignore
      folder: 'ticketer/bands',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: (req: any, file: any) => {
        const name = req.body.name || 'band';
        const cleanName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return `${cleanName}-${Date.now()}`;
      },
    },
  }),
};
