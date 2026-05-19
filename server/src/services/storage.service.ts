import * as Minio from 'minio';
import { getConfig } from '../config';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

let _client: Minio.Client;

function getClient(): Minio.Client {
  if (!_client) {
    const config = getConfig();
    _client = new Minio.Client({
      endPoint: config.MINIO_ENDPOINT,
      port: parseInt(config.MINIO_PORT),
      useSSL: config.MINIO_USE_SSL === 'true',
      accessKey: config.MINIO_ACCESS_KEY,
      secretKey: config.MINIO_SECRET_KEY,
    });
  }
  return _client;
}

async function ensureBucket(): Promise<void> {
  const config = getConfig();
  const client = getClient();
  const exists = await client.bucketExists(config.MINIO_BUCKET);
  if (!exists) {
    await client.makeBucket(config.MINIO_BUCKET, 'us-east-1');
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${config.MINIO_BUCKET}/*`],
        },
      ],
    });
    await client.setBucketPolicy(config.MINIO_BUCKET, policy);
  }
}

export async function uploadImage(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> {
  await ensureBucket();
  const config = getConfig();
  const ext = path.extname(originalName) || '.jpg';
  const objectName = `images/${uuidv4()}${ext}`;

  await getClient().putObject(config.MINIO_BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': mimeType,
  });

  const useSSL = config.MINIO_USE_SSL === 'true';
  const protocol = useSSL ? 'https' : 'http';
  const port = config.MINIO_PORT === '80' || config.MINIO_PORT === '443' ? '' : `:${config.MINIO_PORT}`;
  return `${protocol}://${config.MINIO_ENDPOINT}${port}/${config.MINIO_BUCKET}/${objectName}`;
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const config = getConfig();
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // pathname = /bucket/images/uuid.jpg → skip first empty + bucket name
    const objectName = pathParts.slice(2).join('/');
    if (objectName) {
      await getClient().removeObject(config.MINIO_BUCKET, objectName);
    }
  } catch {
    // Silently ignore if object doesn't exist
  }
}
