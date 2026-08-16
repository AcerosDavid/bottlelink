import { LinkModel, CheckModel, EventModel, ProviderModel } from '../models';
import { LinkStatus, LinkStatistics, ProviderStatistics } from '../types';

export class StatisticsService {
  /**
   * Get overall link statistics
   */
  static getOverallStatistics(): LinkStatistics {
    const totalLinks = LinkModel.count();
    const activeLinks = LinkModel.countByStatus(LinkStatus.ACTIVE);
    const deadLinks = LinkModel.countByStatus(LinkStatus.DEAD);
    const changedLinks = LinkModel.countByStatus(LinkStatus.CHANGED);
    const errorLinks = LinkModel.countByStatus(LinkStatus.ERROR);
    const restrictedLinks = LinkModel.countByStatus(LinkStatus.RESTRICTED);

    const availabilityPercentage = totalLinks > 0 
      ? (activeLinks / totalLinks) * 100 
      : 0;

    // Get recent checks to calculate availability time
    const recentChecks = CheckModel.findRecent(1000);
    const { totalAvailableTime, totalDowntime, lastDown, lastChange, lastCheck } = 
      this.calculateAvailabilityMetrics(recentChecks);

    // Get recent events for change statistics
    const recentEvents = EventModel.findRecent(1000);
    const totalChanges = recentEvents.filter(e => 
      e.event_type === 'FILE_CHANGED' || e.event_type === 'LINK_CHANGED'
    ).length;

    return {
      totalLinks,
      activeLinks,
      deadLinks,
      changedLinks,
      errorLinks,
      restrictedLinks,
      availabilityPercentage,
      totalAvailableTime,
      totalDowntime,
      totalChanges,
      lastDown,
      lastChange,
      lastCheck
    };
  }

  /**
   * Get statistics by provider
   */
  static getProviderStatistics(): ProviderStatistics[] {
    const providers = ProviderModel.findAll();
    const statistics: ProviderStatistics[] = [];

    for (const provider of providers) {
      const links = LinkModel.findByProvider(provider.id);
      const totalLinks = links.length;
      const activeLinks = links.filter(l => l.status === LinkStatus.ACTIVE).length;
      const deadLinks = links.filter(l => l.status === LinkStatus.DEAD).length;

      const availabilityPercentage = totalLinks > 0 
        ? (activeLinks / totalLinks) * 100 
        : 0;

      statistics.push({
        providerId: provider.id,
        providerName: provider.name,
        totalLinks,
        activeLinks,
        deadLinks,
        availabilityPercentage
      });
    }

    return statistics;
  }

  /**
   * Get statistics for a specific link
   */
  static getLinkStatistics(linkId: number) {
    const link = LinkModel.findById(linkId);
    if (!link) {
      throw new Error(`Link not found: ${linkId}`);
    }

    const checks = CheckModel.findByLinkId(linkId);
    const events = EventModel.findByLinkId(linkId);

    const totalChecks = checks.length;
    const activeChecks = checks.filter(c => c.status === LinkStatus.ACTIVE).length;
    const deadChecks = checks.filter(c => c.status === LinkStatus.DEAD).length;
    const errorChecks = checks.filter(c => c.status === LinkStatus.ERROR).length;

    const availabilityPercentage = totalChecks > 0 
      ? (activeChecks / totalChecks) * 100 
      : 0;

    const totalChanges = events.filter(e => 
      e.event_type === 'FILE_CHANGED' || e.event_type === 'LINK_CHANGED'
    ).length;

    const lastDown = checks.find(c => c.status === LinkStatus.DEAD)?.checked_at;
    const lastChange = events.find(e => 
      e.event_type === 'FILE_CHANGED' || e.event_type === 'LINK_CHANGED'
    )?.created_at;
    const lastCheck = checks[0]?.checked_at;

    // Calculate uptime/downtime
    const { totalAvailableTime, totalDowntime } = this.calculateAvailabilityMetrics(checks);

    return {
      linkId: link.id,
      url: link.url,
      status: link.status,
      totalChecks,
      activeChecks,
      deadChecks,
      errorChecks,
      availabilityPercentage,
      totalAvailableTime,
      totalDowntime,
      totalChanges,
      lastDown,
      lastChange,
      lastCheck,
      firstAvailable: link.first_available,
      lastAvailable: link.last_available
    };
  }

  /**
   * Calculate availability metrics from checks
   */
  private static calculateAvailabilityMetrics(checks: any[]): {
    totalAvailableTime: number;
    totalDowntime: number;
    lastDown?: Date;
    lastChange?: Date;
    lastCheck?: Date;
  } {
    if (checks.length === 0) {
      return {
        totalAvailableTime: 0,
        totalDowntime: 0
      };
    }

    let totalAvailableTime = 0;
    let totalDowntime = 0;
    let lastDown: Date | undefined;
    let lastCheck = checks[0]?.checked_at;

    // Sort checks by date (oldest first)
    const sortedChecks = [...checks].sort((a, b) => 
      a.checked_at.getTime() - b.checked_at.getTime()
    );

    for (let i = 0; i < sortedChecks.length; i++) {
      const check = sortedChecks[i];
      const nextCheck = sortedChecks[i + 1];

      if (check.status === LinkStatus.ACTIVE) {
        const timeUntilNext = nextCheck 
          ? nextCheck.checked_at.getTime() - check.checked_at.getTime()
          : 0;
        totalAvailableTime += timeUntilNext;
      } else if (check.status === LinkStatus.DEAD) {
        const timeUntilNext = nextCheck 
          ? nextCheck.checked_at.getTime() - check.checked_at.getTime()
          : 0;
        totalDowntime += timeUntilNext;
        lastDown = check.checked_at;
      }
    }

    return {
      totalAvailableTime,
      totalDowntime,
      lastDown,
      lastCheck
    };
  }

  /**
   * Get recent activity summary
   */
  static getRecentActivity(limit: number = 20) {
    const recentChecks = CheckModel.findRecent(limit);
    const recentEvents = EventModel.findRecent(limit);

    return {
      recentChecks: recentChecks.map(check => ({
        id: check.id,
        linkId: check.link_id,
        status: check.status,
        checkedAt: check.checked_at,
        responseTime: check.response_time
      })),
      recentEvents: recentEvents.map(event => ({
        id: event.id,
        linkId: event.link_id,
        eventType: event.event_type,
        description: event.description,
        createdAt: event.created_at
      }))
    };
  }

  /**
   * Get status distribution
   */
  static getStatusDistribution() {
    return {
      active: LinkModel.countByStatus(LinkStatus.ACTIVE),
      dead: LinkModel.countByStatus(LinkStatus.DEAD),
      changed: LinkModel.countByStatus(LinkStatus.CHANGED),
      redirected: LinkModel.countByStatus(LinkStatus.REDIRECTED),
      restricted: LinkModel.countByStatus(LinkStatus.RESTRICTED),
      error: LinkModel.countByStatus(LinkStatus.ERROR),
      unknown: LinkModel.countByStatus(LinkStatus.UNKNOWN)
    };
  }

  /**
   * Get file type distribution
   */
  static getFileTypeDistribution() {
    const links = LinkModel.findAll();
    const distribution: Record<string, number> = {};

    for (const link of links) {
      // This would need to be implemented once we have file metadata
      // For now, we'll return empty distribution
    }

    return distribution;
  }

  /**
   * Get time-based statistics (e.g., checks per hour/day)
   */
  static getTimeBasedStats(hours: number = 24) {
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentChecks = CheckModel.findRecent(1000).filter(
      check => check.checked_at >= cutoffDate
    );

    const hourlyStats: Record<number, number> = {};

    for (const check of recentChecks) {
      const hour = Math.floor(check.checked_at.getTime() / (60 * 60 * 1000));
      hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
    }

    return {
      period: `${hours} hours`,
      totalChecks: recentChecks.length,
      hourlyDistribution: hourlyStats
    };
  }
}
