import { db } from './database';
import { Notification } from '../types';

export class NotificationModel {
  static findByLinkId(linkId: number): Notification[] {
    const stmt = db.prepare(`
      SELECT id, link_id, type, channel, recipient, sent, sent_at, error_message, created_at
      FROM notifications
      WHERE link_id = ?
      ORDER BY created_at DESC
    `);
    
    const rows = stmt.all(linkId) as any[];
    return rows.map(row => ({
      ...row,
      sent: Boolean(row.sent),
      sent_at: row.sent_at ? new Date(row.sent_at) : undefined,
      created_at: new Date(row.created_at)
    }));
  }

  static findById(id: number): Notification | null {
    const stmt = db.prepare(`
      SELECT id, link_id, type, channel, recipient, sent, sent_at, error_message, created_at
      FROM notifications
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;
    
    return {
      ...row,
      sent: Boolean(row.sent),
      sent_at: row.sent_at ? new Date(row.sent_at) : undefined,
      created_at: new Date(row.created_at)
    };
  }

  static create(data: Omit<Notification, 'id' | 'created_at'>): Notification {
    const stmt = db.prepare(`
      INSERT INTO notifications (link_id, type, channel, recipient, sent, sent_at, error_message)
      VALUES (@link_id, @type, @channel, @recipient, @sent, @sent_at, @error_message)
    `);
    
    const result = stmt.run({
      link_id: data.link_id,
      type: data.type,
      channel: data.channel,
      recipient: data.recipient,
      sent: data.sent ? 1 : 0,
      sent_at: data.sent_at?.toISOString() || null,
      error_message: data.error_message || null
    });
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  static findUnsent(): Notification[] {
    const stmt = db.prepare(`
      SELECT id, link_id, type, channel, recipient, sent, sent_at, error_message, created_at
      FROM notifications
      WHERE sent = 0
      ORDER BY created_at ASC
    `);
    
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      ...row,
      sent: Boolean(row.sent),
      sent_at: row.sent_at ? new Date(row.sent_at) : undefined,
      created_at: new Date(row.created_at)
    }));
  }

  static markAsSent(id: number): Notification | null {
    const stmt = db.prepare(`
      UPDATE notifications
      SET sent = 1, sent_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(id);
    return this.findById(id);
  }

  static markAsFailed(id: number, errorMessage: string): Notification | null {
    const stmt = db.prepare(`
      UPDATE notifications
      SET error_message = @error_message
      WHERE id = ?
    `);
    
    stmt.run({ error_message: errorMessage, id });
    return this.findById(id);
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM notifications WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static deleteByLinkId(linkId: number): boolean {
    const stmt = db.prepare('DELETE FROM notifications WHERE link_id = ?');
    const result = stmt.run(linkId);
    return result.changes > 0;
  }

  static count(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM notifications');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  static countUnsent(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE sent = 0');
    const result = stmt.get() as { count: number };
    return result.count;
  }
}
