import { ProviderAdapter, ProviderType } from '../types';
import { HttpProvider } from './HttpProvider';
import { MegaProvider } from './MegaProvider';
import { MediaFireProvider } from './MediaFireProvider';
import { GoogleDriveProvider } from './GoogleDriveProvider';
import { DropboxProvider } from './DropboxProvider';
import { OneDriveProvider } from './OneDriveProvider';
import { PixeldrainProvider } from './PixeldrainProvider';

export class ProviderFactory {
  private static providers: Map<ProviderType, () => ProviderAdapter> = new Map();

  static {
    // Register default providers
    this.register(ProviderType.HTTP, () => new HttpProvider());
    this.register(ProviderType.HTTPS, () => new HttpProvider());
    this.register(ProviderType.MEGA, () => new MegaProvider());
    this.register(ProviderType.MEDIAFIRE, () => new MediaFireProvider());
    this.register(ProviderType.GOOGLE_DRIVE, () => new GoogleDriveProvider());
    this.register(ProviderType.DROPBOX, () => new DropboxProvider());
    this.register(ProviderType.ONEDRIVE, () => new OneDriveProvider());
    this.register(ProviderType.PIXELDRAIN, () => new PixeldrainProvider());
  }

  static register(type: ProviderType, factory: () => ProviderAdapter): void {
    this.providers.set(type, factory);
  }

  static getProvider(type: ProviderType): ProviderAdapter | null {
    const factory = this.providers.get(type);
    if (!factory) {
      return null;
    }
    return factory();
  }

  static getProviderForUrl(url: string): ProviderAdapter | null {
    const type = this.detectProviderType(url);
    if (!type) {
      return null;
    }
    return this.getProvider(type);
  }

  static detectProviderType(url: string): ProviderType | null {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // MEGA
      if (hostname.includes('mega.nz') || hostname.includes('mega.co.nz')) {
        return ProviderType.MEGA;
      }

      // MediaFire
      if (hostname.includes('mediafire.com')) {
        return ProviderType.MEDIAFIRE;
      }

      // Google Drive
      if (hostname.includes('drive.google.com') || hostname.includes('docs.google.com')) {
        return ProviderType.GOOGLE_DRIVE;
      }

      // Dropbox
      if (hostname.includes('dropbox.com') || hostname.includes('dl.dropboxusercontent.com')) {
        return ProviderType.DROPBOX;
      }

      // OneDrive
      if (hostname.includes('onedrive.live.com') || hostname.includes('1drv.com')) {
        return ProviderType.ONEDRIVE;
      }

      // Pixeldrain
      if (hostname.includes('pixeldrain.com')) {
        return ProviderType.PIXELDRAIN;
      }

      // HTTP/HTTPS
      if (urlObj.protocol === 'http:') {
        return ProviderType.HTTP;
      } else if (urlObj.protocol === 'https:') {
        return ProviderType.HTTPS;
      }

      return null;
    } catch {
      return null;
    }
  }

  static getRegisteredTypes(): ProviderType[] {
    return Array.from(this.providers.keys());
  }

  static isRegistered(type: ProviderType): boolean {
    return this.providers.has(type);
  }
}
