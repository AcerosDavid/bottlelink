import { db } from './database';
import { Check, LinkStatus } from '../types';

export class CheckModel {
  static findByLinkId(linkId: number, limit?: number): Check[] {
    let query = `
      SELECT id, link_id, status, file_version_id, error_message, 
             response_time, redirect_url, checked_at
      FROM checks
      WHERE link_id = ?
      ORDER BY checked_at DESC
    `;
    
    if (limit !== undefined) {
      query += ` LIMIT ${limit}`;
    }
    
    const stmt = db.prepare(query);
    const rows = stmt.all(linkId) as any[];
    return rows.map(row => ({
      ...row,
      checked_at: new Date(row.checked_at)
    }));
  }

  static findById(id: number): Check | null {
    const stmt = db.prepare(`
      SELECT id, link_id, status, file_version_id, error_message, 
             response_time, redirect_url, checked_at
      FROM checks
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;
    
    return {
      ...row,
      checked_at: new Date(row.checked_at)
    };
  }

  static create(data: Omit<Check, 'id' | 'checked_at'>): Check {
    const stmt = db.prepare(`
      INSERT INTO checks (link_id, status, file_version_id, error_message, 
                         response_time, redirect_url)
      VALUES (@link_id, @status, @file_version_id, @error_message, 
              @response_time, @redirect_url)
    `);
    
    const result = stmt.run({
      link_id: data.link_id,
      status: data.status,
      file_version_id: data.file_version_id || null,
      error_message: data.error_message || null,
      response_time: data.response_time || null,
      redirect_url: data.redirect_url || null
    });
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  static findRecent(limit: number = 50): Check[] {
    const stmt = db.prepare(`
      SELECT id, link_id, status, file_version_id, error_message, 
             response_time, redirect_url, checked_at
      FROM checks
      ORDER BY checked_at DESC
      LIMIT ?
    `);
    
    const rows = stmt.all(limit) as any[];
    return rows.map(row => ({
      ...row,
      checked_at: new Date(row.checked_at)
    }));
  }

  static findByStatus(status: LinkStatus, limit: number = 50): Check[] {
    const stmt = db.prepare(`
      SELECT id, link_id, status, file_version_id, error_message, 
             response_time, redirect_url, checked_at
      FROM checks
      WHERE status = ?
      ORDER BY checked_at DESC
      LIMIT ?
    `);
    
    const rows = stmt.all(status, limit) as any[];
    return rows.map(row => ({
      ...row,
      checked_at: new Date(row.checked_at)
    }));
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM checks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static deleteByLinkId(linkId: number): boolean {
    const stmt = db.prepare('DELETE FROM checks WHERE link_id = ?');
    const result = stmt.run(linkId);
    return result.changes > 0;
  }

  static count(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM checks');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  static countByLinkId(linkId: number): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM checks WHERE link_id = ?');
    const result = stmt.get(linkId) as { count: number };
    return result.count;
  }
}
