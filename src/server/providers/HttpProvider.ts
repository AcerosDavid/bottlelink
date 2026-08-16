import { BaseProvider } from './BaseProvider';
import { CheckResult, FileMetadata, LinkStatus } from '../types';

export class HttpProvider extends BaseProvider {
  validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async checkLink(url: string): Promise<CheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.fetchWithTimeout(url);
      const responseTime = Date.now() - startTime;
      
      const status = this.determineStatusFromResponse(response);
      
      const fileMetadata: Partial<FileMetadata> = {
        name: this.extractFileName(url),
        extension: this.extractFileExtension(url),
        mime_type: response.headers.get('content-type') || 
                   (this.extractFileExtension(url) ? this.guessMimeType(this.extractFileExtension(url)!) : undefined),
        size: response.headers.get('content-length') ? 
              parseInt(response.headers.get('content-length')!) : undefined,
        etag: response.headers.get('etag') || undefined,
        last_modified: response.headers.get('last-modified') ? 
                      new Date(response.headers.get('last-modified')!) : undefined
      };

      let redirectUrl: string | undefined;
      if (response.redirected && response.url !== url) {
        redirectUrl = response.url;
      }

      return {
        status,
        fileMetadata,
        responseTime,
        redirectUrl
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: LinkStatus.ERROR,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      };
    }
  }

  async extractMetadata(url: string): Promise<Partial<FileMetadata>> {
    try {
      const response = await this.fetchWithTimeout(url);
      
      return {
        name: this.extractFileName(url),
        extension: this.extractFileExtension(url),
        mime_type: response.headers.get('content-type') || 
                   (this.extractFileExtension(url) ? this.guessMimeType(this.extractFileExtension(url)!) : undefined),
        size: response.headers.get('content-length') ? 
              parseInt(response.headers.get('content-length')!) : undefined,
        etag: response.headers.get('etag') || undefined,
        last_modified: response.headers.get('last-modified') ? 
                      new Date(response.headers.get('last-modified')!) : undefined
      };
    } catch (error) {
      return {};
    }
  }
}
