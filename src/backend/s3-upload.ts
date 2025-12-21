import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const awsRegion = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
const awsBucket = import.meta.env.VITE_AWS_PUBLIC_S3_BUCKET;
const cloudflareDomain = import.meta.env.VITE_CLOUDFLARE_DOMAIN || 'static.stackorq.xyz';

const s3 = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = async (file: File, shopId: string): Promise<string> => {
  try {
    // Clean the file name
    const cleanedFileName = file.name
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '')
      .toLowerCase();
    
    const key = `${shopId}/menu-items/${Date.now()}-${cleanedFileName}`;
    
    // Convert File to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const params = {
      Bucket: awsBucket,
      Key: key,
      Body: uint8Array,
      ContentType: file.type,
    };

    await s3.send(new PutObjectCommand(params));
    
    return `https://${cloudflareDomain}/${key}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};