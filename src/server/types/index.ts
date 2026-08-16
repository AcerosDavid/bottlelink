// Core types for BotellaLink

export enum LinkStatus {
  ACTIVE = 'ACTIVE',
  DEAD = 'DEAD',
  CHANGED = 'CHANGED',
  REDIRECTED = 'REDIRECTED',
  RESTRICTED = 'RESTRICTED',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN'
}

export enum ProviderType {
  MEGA = 'MEGA',
  MEDIAFIRE = 'MEDIAFIRE',
  GOOGLE_DRIVE = 'GOOGLE_DRIVE',
  DROPBOX = 'DROPBOX',
  ONEDRIVE = 'ONEDRIVE',
  PIXELDRAIN = 'PIXELDRAIN',
  HTTP = 'HTTP',
  HTTPS = 'HTTPS'
}

export interface Provider {
  id: number;
  name: string;
  type: ProviderType;
  enabled: boolean;
  config?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Link {
  id: number;
  url: string;
  provider_id: number;
  status: LinkStatus;
  check_frequency: number; // in minutes
  last_checked?: Date;
  first_available?: Date;
  last_available?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface FileMetadata {
  id: number;
  link_id: number;
  name?: string;
  extension?: string;
  mime_type?: string;
  size?: number;
  hash?: string;
  etag?: string;
  last_modified?: Date;
  // Video metadata
  duration?: number;
  resolution?: string;
  fps?: number;
  video_codec?: string;
  audio_codec?: string;
  bitrate?: number;
  format?: string;
  streams?: number;
  languages?: string[];
  // Additional metadata
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface FileVersion {
  id: number;
  file_id: number;
  version: number;
  name?: string;
  extension?: string;
  mime_type?: string;
  size?: number;
  hash?: string;
  etag?: string;
  last_modified?: Date;
  duration?: number;
  resolution?: string;
  fps?: number;
  video_codec?: string;
  audio_codec?: string;
  bitrate?: number;
  format?: string;
  streams?: number;
  languages?: string[];
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface Check {
  id: number;
  link_id: number;
  status: LinkStatus;
  file_version_id?: number;
  error_message?: string;
  response_time?: number;
  redirect_url?: string;
  checked_at: Date;
}

export interface Event {
  id: number;
  link_id: number;
  event_type: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface Notification {
  id: number;
  link_id: number;
  type: string;
  channel: string; // email, webhook, etc.
  recipient: string;
  sent: boolean;
  sent_at?: Date;
  error_message?: string;
  created_at: Date;
}

export interface CheckResult {
  status: LinkStatus;
  fileMetadata?: Partial<FileMetadata>;
  errorMessage?: string;
  responseTime?: number;
  redirectUrl?: string;
}

export interface ProviderAdapter {
  validateUrl(url: string): boolean;
  checkLink(url: string): Promise<CheckResult>;
  extractMetadata?(url: string): Promise<Partial<FileMetadata>>;
}

export interface LinkStatistics {
  totalLinks: number;
  activeLinks: number;
  deadLinks: number;
  changedLinks: number;
  errorLinks: number;
  restrictedLinks: number;
  availabilityPercentage: number;
  totalAvailableTime: number;
  totalDowntime: number;
  totalChanges: number;
  lastDown?: Date;
  lastChange?: Date;
  lastCheck?: Date;
}

export interface ProviderStatistics {
  providerId: number;
  providerName: string;
  totalLinks: number;
  activeLinks: number;
  deadLinks: number;
  availabilityPercentage: number;
}
