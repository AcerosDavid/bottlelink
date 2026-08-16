import { ProviderAdapter, CheckResult, FileMetadata, LinkStatus } from '../types';

export abstract class BaseProvider implements ProviderAdapter {
  abstract validateUrl(url: string): boolean;
  abstract checkLink(url: string): Promise<CheckResult>;
  abstract extractMetadata?(url: string): Promise<Partial<FileMetadata>>;

  protected async fetchWithTimeout(url: string, timeout: number = parseInt(process.env['PROVIDER_FETCH_TIMEOUT_MS'] || '30000')): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow'
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  protected async fetchWithGet(url: string, timeout: number = parseInt(process.env['PROVIDER_FETCH_TIMEOUT_MS'] || '30000')): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow'
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  protected extractFileExtension(url: string): string | undefined {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const lastDot = pathname.lastIndexOf('.');
      if (lastDot > 0) {
        return pathname.substring(lastDot + 1).toLowerCase();
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  protected extractFileName(url: string): string | undefined {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const lastSlash = pathname.lastIndexOf('/');
      if (lastSlash >= 0) {
        return pathname.substring(lastSlash + 1);
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  protected guessMimeType(extension: string): string | undefined {
    const mimeTypes: Record<string, string> = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
      'flv': 'video/x-flv',
      'mkv': 'video/x-matroska',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'flac': 'audio/flac',
      'aac': 'audio/aac',
      'm4a': 'audio/mp4',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      'txt': 'text/plain',
      'json': 'application/json',
      'xml': 'application/xml',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };

    return mimeTypes[extension.toLowerCase()];
  }

  protected determineStatusFromResponse(response: Response): LinkStatus {
    if (response.ok) {
      return LinkStatus.ACTIVE;
    } else if (response.status === 403) {
      return LinkStatus.RESTRICTED;
    } else if (response.status === 404) {
      return LinkStatus.DEAD;
    } else if (response.status >= 300 && response.status < 400) {
      return LinkStatus.REDIRECTED;
    } else {
      return LinkStatus.ERROR;
    }
  }
}
