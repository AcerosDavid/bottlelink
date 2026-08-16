import { BaseProvider } from './BaseProvider';
import { CheckResult, FileMetadata, LinkStatus } from '../types';

export class MegaProvider extends BaseProvider {
  validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('mega.nz') || urlObj.hostname.includes('mega.co.nz');
    } catch {
      return false;
    }
  }

  async checkLink(url: string): Promise<CheckResult> {
    const startTime = Date.now();
    
    try {
      // MEGA requires authentication for most operations
      // For now, we'll do a basic check
      const response = await this.fetchWithGet(url);
      const responseTime = Date.now() - startTime;
      
      // MEGA links are usually embedded, so we check if the page loads
      if (response.ok) {
        const text = await response.text();
        
        // Check for common error indicators
        if (text.includes('File not found') || text.includes('Invalid key') || text.includes('Deleted')) {
          return {
            status: LinkStatus.DEAD,
            errorMessage: 'File not found or deleted',
            responseTime
          };
        }
        
        if (text.includes('Temporarily unavailable') || text.includes('overloaded')) {
          return {
            status: LinkStatus.ERROR,
            errorMessage: 'Service temporarily unavailable',
            responseTime
          };
        }

        // Try to extract basic file info from the page
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
      
      // Basic metadata extraction from MEGA page
      const fileMetadata: Partial<FileMetadata> = {
        name: this.extractFileName(url),
        extension: this.extractFileExtension(url)
      };

      // Try to extract file size from page content
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
