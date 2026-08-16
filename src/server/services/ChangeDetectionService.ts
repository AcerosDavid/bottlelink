import { FileMetadata, FileVersion } from '../types';
import { FileMetadataModel, FileVersionModel, EventModel } from '../models';

export interface ChangeDetectionResult {
  hasChanges: boolean;
  changeType: string;
  changedFields: string[];
  oldMetadata: Partial<FileMetadata>;
  newMetadata: Partial<FileMetadata>;
  versionId?: number;
}

export class ChangeDetectionService {
  /**
   * Detect changes between current metadata and new metadata
   */
  static detectChanges(
    currentMetadata: FileMetadata,
    newMetadata: Partial<FileMetadata>
  ): ChangeDetectionResult {
    const changedFields: string[] = [];
    const oldMetadata: Partial<FileMetadata> = {};
    const newMetadataCopy: Partial<FileMetadata> = {};

    // Fields to check for changes
    const fieldsToCheck = [
      'name',
      'extension',
      'mime_type',
      'size',
      'hash',
      'etag',
      'last_modified',
      'duration',
      'resolution',
      'fps',
      'video_codec',
      'audio_codec',
      'bitrate',
      'format',
      'streams',
      'languages'
    ];

    for (const field of fieldsToCheck) {
      const currentValue = currentMetadata[field as keyof FileMetadata];
      const newValue = newMetadata[field as keyof FileMetadata];

      if (currentValue !== newValue) {
        changedFields.push(field);
        oldMetadata[field as keyof FileMetadata] = currentValue as any;
        newMetadataCopy[field as keyof FileMetadata] = newValue as any;
      }
    }

    const hasChanges = changedFields.length > 0;
    const changeType = this.determineChangeType(changedFields);

    return {
      hasChanges,
      changeType,
      changedFields,
      oldMetadata,
      newMetadata: newMetadataCopy
    };
  }

  /**
   * Determine the type of change based on changed fields
   */
  private static determineChangeType(changedFields: string[]): string {
    if (changedFields.includes('hash') || changedFields.includes('size')) {
      return 'CONTENT_CHANGED';
    } else if (changedFields.includes('name') || changedFields.includes('extension')) {
      return 'RENAME';
    } else if (changedFields.includes('duration') || changedFields.includes('resolution') || 
               changedFields.includes('video_codec') || changedFields.includes('audio_codec')) {
      return 'MEDIA_CHANGED';
    } else if (changedFields.includes('etag') || changedFields.includes('last_modified')) {
      return 'METADATA_CHANGED';
    } else {
      return 'UNKNOWN_CHANGE';
    }
  }

  /**
   * Process detected changes and create version
   */
  static async processChanges(
    linkId: number,
    fileMetadataId: number,
    detectionResult: ChangeDetectionResult
  ): Promise<FileVersion | null> {
    if (!detectionResult.hasChanges) {
      return null;
    }

    // Create new version
    const newVersion = FileVersionModel.create({
      file_id: fileMetadataId,
      ...detectionResult.newMetadata
    });

    // Create change event
    EventModel.create({
      link_id: linkId,
      event_type: detectionResult.changeType,
      description: this.getChangeDescription(detectionResult),
      metadata: {
        old: detectionResult.oldMetadata,
        new: detectionResult.newMetadata,
        changed_fields: detectionResult.changedFields,
        version_id: newVersion.id
      }
    });

    return newVersion;
  }

  /**
   * Get human-readable change description
   */
  private static getChangeDescription(result: ChangeDetectionResult): string {
    if (result.changeType === 'CONTENT_CHANGED') {
      return 'File content changed (size or hash)';
    } else if (result.changeType === 'RENAME') {
      return 'File renamed or extension changed';
    } else if (result.changeType === 'MEDIA_CHANGED') {
      return 'Media properties changed';
    } else if (result.changeType === 'METADATA_CHANGED') {
      return 'File metadata changed';
    } else {
      return `Fields changed: ${result.changedFields.join(', ')}`;
    }
  }

  /**
   * Get file version history
   */
  static getFileVersions(fileId: number): FileVersion[] {
    return FileVersionModel.findByFileId(fileId);
  }

  /**
   * Compare two versions
   */
  static compareVersions(version1: FileVersion, version2: FileVersion): ChangeDetectionResult {
    const changedFields: string[] = [];
    const oldMetadata: Partial<FileMetadata> = {};
    const newMetadata: Partial<FileMetadata> = {};

    const fieldsToCheck = [
      'name',
      'extension',
      'mime_type',
      'size',
      'hash',
      'etag',
      'last_modified',
      'duration',
      'resolution',
      'fps',
      'video_codec',
      'audio_codec',
      'bitrate',
      'format',
      'streams',
      'languages'
    ];

    for (const field of fieldsToCheck) {
      const value1 = version1[field as keyof FileVersion];
      const value2 = version2[field as keyof FileVersion];

      if (value1 !== value2) {
        changedFields.push(field);
        oldMetadata[field as keyof FileMetadata] = value1 as any;
        newMetadata[field as keyof FileMetadata] = value2 as any;
      }
    }

    const hasChanges = changedFields.length > 0;
    const changeType = this.determineChangeType(changedFields);

    return {
      hasChanges,
      changeType,
      changedFields,
      oldMetadata,
      newMetadata
    };
  }

  /**
   * Get change statistics for a file
   */
  static getChangeStatistics(fileId: number) {
    const versions = this.getFileVersions(fileId);
    
    if (versions.length < 2) {
      return {
        totalVersions: versions.length,
        totalChanges: 0,
        changeTypes: {},
        lastChange: null
      };
    }

    const changeTypes: Record<string, number> = {};
    let lastChange = versions[0].created_at;

    for (let i = 1; i < versions.length; i++) {
      const comparison = this.compareVersions(versions[i], versions[i - 1]);
      if (comparison.hasChanges) {
        changeTypes[comparison.changeType] = (changeTypes[comparison.changeType] || 0) + 1;
        if (versions[i].created_at > lastChange) {
          lastChange = versions[i].created_at;
        }
      }
    }

    return {
      totalVersions: versions.length,
      totalChanges: Object.values(changeTypes).reduce((sum, count) => sum + count, 0),
      changeTypes,
      lastChange
    };
  }
}
