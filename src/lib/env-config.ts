import { MaturadorConfig } from '@/types';

export function getDefaultConfig(): MaturadorConfig {
  return {
    baseUrl: process.env.WUZAPI_BASE_URL || '',
    token: process.env.WUZAPI_ADMIN_TOKEN || '',
    minIntervalSeconds: parseInt(process.env.MIN_INTERVAL_SECONDS || '5'),
    maxIntervalSeconds: parseInt(process.env.MAX_INTERVAL_SECONDS || '30'),
    isRunning: false
  };
}

export function getMediaPath(): string {
  return process.env.BASE64_MEDIA_PATH || './base64_media';
}

export function getLogDir(): string {
  return process.env.LOG_DIR || './logs';
}