import { db, parseJson, stringifyJson } from './database';
import { Event } from '../types';

export class EventModel {
  static findByLinkId(linkId: number, limit?: number): Event[] {
    let query = `
      SELECT id, link_id, event_type, description, metadata, created_at
      FROM events
      WHERE link_id = ?
      ORDER BY created_at DESC
    `;
    
    if (limit !== undefined) {
      query += ` LIMIT ${limit}`;
    }
    
    const stmt = db.prepare(query);
    const rows = stmt.all(linkId) as any[];
    return rows.map(row => ({
      ...row,
      metadata: parseJson(row.metadata),
      created_at: new Date(row.created_at)
    }));
  }

  static findById(id: number): Event | null {
    const stmt = db.prepare(`
      SELECT id, link_id, event_type, description, metadata, created_at
      FROM events
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;
    
    return {
      ...row,
      metadata: parseJson(row.metadata),
      created_at: new Date(row.created_at)
    };
  }

  static create(data: Omit<Event, 'id' | 'created_at'>): Event {
    const stmt = db.prepare(`
      INSERT INTO events (link_id, event_type, description, metadata)
      VALUES (@link_id, @event_type, @description, @metadata)
    `);
    
    const result = stmt.run({
      link_id: data.link_id,
      event_type: data.event_type,
      description: data.description || null,
      metadata: stringifyJson(data.metadata)
    });
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  static findRecent(limit: number = 50): Event[] {
    const stmt = db.prepare(`
      SELECT id, link_id, event_type, description, metadata, created_at
      FROM events
      ORDER BY created_at DESC
      LIMIT ?
    `);
    
    const rows = stmt.all(limit) as any[];
    return rows.map(row => ({
      ...row,
      metadata: parseJson(row.metadata),
      created_at: new Date(row.created_at)
    }));
  }

  static findByType(eventType: string, limit: number = 50): Event[] {
    const stmt = db.prepare(`
      SELECT id, link_id, event_type, description, metadata, created_at
      FROM events
      WHERE event_type = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
    
    const rows = stmt.all(eventType, limit) as any[];
    return rows.map(row => ({
      ...row,
      metadata: parseJson(row.metadata),
      created_at: new Date(row.created_at)
    }));
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM events WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static deleteByLinkId(linkId: number): boolean {
    const stmt = db.prepare('DELETE FROM events WHERE link_id = ?');
    const result = stmt.run(linkId);
    return result.changes > 0;
  }

  static count(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM events');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  static countByLinkId(linkId: number): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM events WHERE link_id = ?');
    const result = stmt.get(linkId) as { count: number };
    return result.count;
  }
}
