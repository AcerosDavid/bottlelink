import { NotificationModel, EventModel, LinkModel } from '../models';
import { LinkStatus } from '../types';

export interface NotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  events: NotificationEventType[];
}

export interface NotificationChannel {
  type: 'email' | 'webhook' | 'console';
  config: Record<string, any>;
}

export interface NotificationEventType {
  event_type: string;
  enabled: boolean;
}

export class NotificationService {
  /**
   * Create a notification for a link
   */
  static async createNotification(
    linkId: number,
    type: string,
    channel: string,
    recipient: string,
    data?: any
  ) {
    return NotificationModel.create({
      link_id: linkId,
      type,
      channel,
      recipient,
      sent: false,
      metadata: data
    });
  }

  /**
   * Send a notification based on channel type
   */
  static async sendNotification(notificationId: number) {
    const notification = NotificationModel.findById(notificationId);
    if (!notification) {
      throw new Error(`Notification not found: ${notificationId}`);
    }

    try {
      switch (notification.channel) {
        case 'email':
          await this.sendEmailNotification(notification);
          break;
        case 'webhook':
          await this.sendWebhookNotification(notification);
          break;
        case 'console':
          this.sendConsoleNotification(notification);
          break;
        default:
          throw new Error(`Unsupported notification channel: ${notification.channel}`);
      }

      // Mark as sent
      NotificationModel.markAsSent(notificationId);
    } catch (error) {
      // Mark as failed
      NotificationModel.markAsFailed(
        notificationId,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Send email notification (placeholder - requires email service integration)
   */
  private static async sendEmailNotification(notification: any) {
    // This is a placeholder implementation
    // In production, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - Nodemailer with SMTP
    
    console.log(`[EMAIL] To: ${notification.recipient}`);
    console.log(`[EMAIL] Type: ${notification.type}`);
    console.log(`[EMAIL] Link ID: ${notification.link_id}`);
    
    // Placeholder for actual email sending
    // await emailService.send({
    //   to: notification.recipient,
    //   subject: `BotellaLink Alert: ${notification.type}`,
    //   body: notification.data?.message || 'Notification from BotellaLink'
    // });
  }

  /**
   * Send webhook notification
   */
  private static async sendWebhookNotification(notification: any) {
    const webhookUrl = notification.recipient;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: notification.type,
        link_id: notification.link_id,
        timestamp: new Date().toISOString(),
        data: notification.metadata
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }
  }

  /**
   * Send console notification (for development/testing)
   */
  private static sendConsoleNotification(notification: any) {
    console.log(`[NOTIFICATION] Type: ${notification.type}`);
    console.log(`[NOTIFICATION] Link ID: ${notification.link_id}`);
    console.log(`[NOTIFICATION] Channel: ${notification.channel}`);
    console.log(`[NOTIFICATION] Data:`, notification.metadata);
  }

  /**
   * Process events and create notifications based on configuration
   */
  static async processEvent(eventId: number, config: NotificationConfig) {
    const event = EventModel.findById(eventId);
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }

    // Check if this event type should trigger notifications
    const eventTypeConfig = config.events.find(e => e.event_type === event.event_type);
    if (!eventTypeConfig || !eventTypeConfig.enabled) {
      return;
    }

    // Create notifications for each enabled channel
    for (const channel of config.channels) {
      if (channel.type === 'email' && channel.config.email) {
        await this.createNotification(
          event.link_id,
          event.event_type,
          'email',
          channel.config.email,
          {
            event_type: event.event_type,
            description: event.description,
            metadata: event.metadata
          }
        );
      } else if (channel.type === 'webhook' && channel.config.url) {
        await this.createNotification(
          event.link_id,
          event.event_type,
          'webhook',
          channel.config.url,
          {
            event_type: event.event_type,
            description: event.description,
            metadata: event.metadata
          }
        );
      } else if (channel.type === 'console') {
        await this.createNotification(
          event.link_id,
          event.event_type,
          'console',
          'console',
          {
            event_type: event.event_type,
            description: event.description,
            metadata: event.metadata
          }
        );
      }
    }
  }

  /**
   * Get unsent notifications
   */
  static getUnsentNotifications() {
    return NotificationModel.findUnsent();
  }

  /**
   * Process all unsent notifications
   */
  static async processUnsentNotifications() {
    const unsentNotifications = this.getUnsentNotifications();
    
    for (const notification of unsentNotifications) {
      try {
        await this.sendNotification(notification.id);
      } catch (error) {
        console.error(`Failed to send notification ${notification.id}:`, error);
      }
    }
  }

  /**
   * Create notification for link status change
   */
  static async createStatusChangeNotification(
    linkId: number,
    oldStatus: LinkStatus,
    newStatus: LinkStatus,
    config: NotificationConfig
  ) {
    const eventType = this.getEventTypeForStatusChange(oldStatus, newStatus);
    
    // Check if this event type should trigger notifications
    const eventTypeConfig = config.events.find(e => e.event_type === eventType);
    if (!eventTypeConfig || !eventTypeConfig.enabled) {
      return;
    }

    const link = LinkModel.findById(linkId);
    if (!link) return;

    for (const channel of config.channels) {
      if (channel.type === 'email' && channel.config.email) {
        await this.createNotification(
          linkId,
          eventType,
          'email',
          channel.config.email,
          {
            url: link.url,
            old_status: oldStatus,
            new_status: newStatus,
            message: `Link status changed from ${oldStatus} to ${newStatus}`
          }
        );
      } else if (channel.type === 'webhook' && channel.config.url) {
        await this.createNotification(
          linkId,
          eventType,
          'webhook',
          channel.config.url,
          {
            url: link.url,
            old_status: oldStatus,
            new_status: newStatus,
            message: `Link status changed from ${oldStatus} to ${newStatus}`
          }
        );
      }
    }
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
   * Get notification history for a link
   */
  static getLinkNotifications(linkId: number) {
    return NotificationModel.findByLinkId(linkId);
  }

  /**
   * Get notification statistics
   */
  static getNotificationStatistics() {
    const total = NotificationModel.count();
    const unsent = NotificationModel.countUnsent();
    
    return {
      total,
      sent: total - unsent,
      unsent,
      successRate: total > 0 ? ((total - unsent) / total) * 100 : 0
    };
  }
}
