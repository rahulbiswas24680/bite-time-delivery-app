import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'your-aws-region',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = async (file: File, shopId: string): Promise<string> => {
  console.log('Uploading to S3...', file);
  const key = `${shopId}/menu-items/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  
  const params = {
    Bucket: import.meta.env.VITE_AWS_PUBLIC_S3_BUCKET!,
    Key: key,
    Body: file,
    ContentType: file.type,
  };

  await s3.send(new PutObjectCommand(params));
  return `https://${import.meta.env.VITE_AWS_PUBLIC_S3_BUCKET}.s3.amazonaws.com/${key}`;
};