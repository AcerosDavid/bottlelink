import { BaseProvider } from './BaseProvider';
import { CheckResult, FileMetadata, LinkStatus } from '../types';

export class DropboxProvider extends BaseProvider {
  validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('dropbox.com') || urlObj.hostname.includes('dl.dropboxusercontent.com');
    } catch {
      return false;
    }
  }

  async checkLink(url: string): Promise<CheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.fetchWithGet(url);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const text = await response.text();
        
        // Check for error indicators
        if (text.includes('File not found') || text.includes('No longer available') || text.includes('link is invalid')) {
          return {
            status: LinkStatus.DEAD,
            errorMessage: 'File not found or link invalid',
            responseTime
          };
        }
        
        if (text.includes('Sign in') || text.includes('requires authentication')) {
          return {
            status: LinkStatus.RESTRICTED,
            errorMessage: 'File requires authentication',
            responseTime
          };
        }

        const fileMetadata: Partial<FileMetadata> = {
          name: this.extractFileName(url),
          extension: this.extractFileExtension(url)
        };

        return {
          status: LinkStatus.ACTIVE,
          fileMetadata,
          responseTime
        };
      } else {
        return {
          status: this.determineStatusFromResponse(response),
          errorMessage: `HTTP ${response.status}`,
          responseTime
        };
      }
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
      const response = await this.fetchWithGet(url);
      if (!response.ok) {
        return {};
      }

      const text = await response.text();
      
      const fileMetadata: Partial<FileMetadata> = {
        name: this.extractFileName(url),
        extension: this.extractFileExtension(url)
      };

      // Try to extract file size from Dropbox page
      const sizeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:bytes|KB|MB|GB)/i);
      if (sizeMatch) {
        const size = parseFloat(sizeMatch[1]);
        const unit = sizeMatch[2].toUpperCase();
        
        let bytes: number;
        switch (unit) {
          case 'KB':
            bytes = size * 1024;
            break;
          case 'MB':
            bytes = size * 1024 * 1024;
            break;
          case 'GB':
            bytes = size * 1024 * 1024 * 1024;
            break;
          default:
            bytes = size;
        }
        
        fileMetadata.size = Math.round(bytes);
      }

      return fileMetadata;
    } catch (error) {
      return {};
    }
  }
}
