import { ProviderFactory } from '../providers';
import { LinkModel, CheckModel, FileMetadataModel, FileVersionModel, EventModel } from '../models';
import { LinkStatus, CheckResult, FileMetadata, Link } from '../types';
import { jobQueue } from '../jobs';

export class LinkCheckService {
  /**
   * Check a link immediately (synchronous)
   */
  static async checkLinkNow(linkId: number): Promise<CheckResult> {
    const link = LinkModel.findById(linkId);
    if (!link) {
      throw new Error(`Link not found: ${linkId}`);
    }

    const provider = ProviderFactory.getProviderForUrl(link.url);
    if (!provider) {
      throw new Error(`No provider found for URL: ${link.url}`);
    }

    const checkResult = await provider.checkLink(link.url);
    await this.processCheckResult(link, checkResult);

    return checkResult;
  }

  /**
   * Schedule a link check for later execution (simplified, no Redis)
   */
  static async scheduleLinkCheck(linkId: number, delayMinutes?: number): Promise<void> {
    const link = LinkModel.findById(linkId);
    if (!link) {
      throw new Error(`Link not found: ${linkId}`);
    }

    // Use the simplified job queue (no Redis)
    jobQueue.scheduleLinkCheck(linkId, delayMinutes);
  }

  /**
   * Process check result and update database
   */
  private static async processCheckResult(link: Link, checkResult: CheckResult): Promise<void> {
    const statusChanged = link.status !== checkResult.status;

    // Update link
    const updateData: any = {
      status: checkResult.status,
      last_checked: new Date()
    };

    // Update availability timestamps
    if (checkResult.status === LinkStatus.ACTIVE) {
      if (!link.first_available) {
        updateData.first_available = new Date();
      }
      updateData.last_available = new Date();
    }

    LinkModel.update(link.id, updateData);

    // Create check record
    const check = CheckModel.create({
      link_id: link.id,
      status: checkResult.status,
      error_message: checkResult.errorMessage,
      response_time: checkResult.responseTime,
      redirect_url: checkResult.redirectUrl
    });

    // Handle file metadata
    if (checkResult.fileMetadata) {
      await this.handleFileMetadata(link.id, checkResult.fileMetadata, check.id);
    }

    // Create events for status changes
    if (statusChanged) {
      await this.createStatusChangeEvent(link.id, link.status, checkResult.status, check.id);
    }
  }

  /**
   * Handle file metadata update
   */
  private static async handleFileMetadata(linkId: number, newMetadata: Partial<FileMetadata>, checkId: number): Promise<void> {
    let fileMetadata = FileMetadataModel.findByLinkId(linkId);

    if (fileMetadata) {
      // Update existing metadata
      FileMetadataModel.update(fileMetadata.id, newMetadata);

      // Check for significant changes
      if (this.hasSignificantChanges(fileMetadata, newMetadata)) {
        const newVersion = FileVersionModel.create({
          file_id: fileMetadata.id,
          ...newMetadata
        });

        // Update check with version
        CheckModel.update(checkId, { file_version_id: newVersion.id });

        // Create change event
        EventModel.create({
          link_id: linkId,
          event_type: 'FILE_CHANGED',
          description: 'File metadata changed significantly',
          metadata: {
            old: fileMetadata,
            new: newMetadata,
            version_id: newVersion.id
          }
        });
      }
    } else {
      // Create new metadata
      fileMetadata = FileMetadataModel.create({
        link_id: linkId,
        ...newMetadata
      });

      // Create initial version
      const firstVersion = FileVersionModel.create({
        file_id: fileMetadata.id,
        ...newMetadata
      });

      // Update check with version
      CheckModel.update(checkId, { file_version_id: firstVersion.id });
    }
  }

  /**
   * Detect significant changes in file metadata
   */
  private static hasSignificantChanges(old: any, new_: any): boolean {
    const significantFields = ['size', 'hash', 'etag', 'duration', 'resolution', 'fps', 'video_codec', 'audio_codec'];

    for (const field of significantFields) {
      if (old[field] !== new_[field]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Create event for status change
   */
  private static async createStatusChangeEvent(linkId: number, oldStatus: LinkStatus, newStatus: LinkStatus, checkId: number): Promise<void> {
    const eventType = this.getEventTypeForStatusChange(oldStatus, newStatus);

    EventModel.create({
      link_id: linkId,
      event_type: eventType,
      description: `Status changed from ${oldStatus} to ${newStatus}`,
      metadata: {
        old_status: oldStatus,
        new_status: newStatus,
        check_id: checkId
      }
    });
  }

  /**
   * Get event type for status change
   */
  private static getEventTypeForStatusChange(oldStatus: LinkStatus, newStatus: LinkStatus): string {
    if (newStatus === LinkStatus.DEAD) {
      return 'LINK_DOWN';
    } else if (newStatus === LinkStatus.ACTIVE && oldStatus === LinkStatus.DEAD) {
      return 'LINK_UP';
    } else if (newStatus === LinkStatus.CHANGED) {
      return 'LINK_CHANGED';
    } else if (newStatus === LinkStatus.RESTRICTED) {
      return 'LINK_RESTRICTED';
    } else {
      return 'STATUS_CHANGE';
    }
  }

  /**
   * Get link check history
   */
  static getLinkHistory(linkId: number, limit?: number) {
    return CheckModel.findByLinkId(linkId, limit);
  }

  /**
   * Get link events
   */
  static getLinkEvents(linkId: number, limit?: number) {
    return EventModel.findByLinkId(linkId, limit);
  }
}
