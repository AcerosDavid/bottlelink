import { db, parseJson, stringifyJson } from './database';
import { Link, LinkStatus } from '../types';

export class LinkModel {
  static findAll(limit?: number, offset?: number): Link[] {
    let query = `
      SELECT id, url, provider_id, status, check_frequency, 
             last_checked, first_available, last_available, 
             created_at, updated_at
      FROM links
      ORDER BY created_at DESC
    `;
    
    if (limit !== undefined) {
      query += ` LIMIT ${limit}`;
      if (offset !== undefined) {
        query += ` OFFSET ${offset}`;
      }
    }
    
    const stmt = db.prepare(query);
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      ...row,
      last_checked: row.last_checked ? new Date(row.last_checked) : undefined,
      first_available: row.first_available ? new Date(row.first_available) : undefined,
      last_available: row.last_available ? new Date(row.last_available) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }));
  }

  static findById(id: number): Link | null {
    const stmt = db.prepare(`
      SELECT id, url, provider_id, status, check_frequency, 
             last_checked, first_available, last_available, 
             created_at, updated_at
      FROM links
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;
    
    return {
      ...row,
      last_checked: row.last_checked ? new Date(row.last_checked) : undefined,
      first_available: row.first_available ? new Date(row.first_available) : undefined,
      last_available: row.last_available ? new Date(row.last_available) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  static findByUrl(url: string): Link | null {
    const stmt = db.prepare(`
      SELECT id, url, provider_id, status, check_frequency, 
             last_checked, first_available, last_available, 
             created_at, updated_at
      FROM links
      WHERE url = ?
    `);
    
    const row = stmt.get(url) as any;
    if (!row) return null;
    
    return {
      ...row,
      last_checked: row.last_checked ? new Date(row.last_checked) : undefined,
      first_available: row.first_available ? new Date(row.first_available) : undefined,
      last_available: row.last_available ? new Date(row.last_available) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  static findByStatus(status: LinkStatus): Link[] {
    const stmt = db.prepare(`
      SELECT id, url, provider_id, status, check_frequency, 
             last_checked, first_available, last_available, 
             created_at, updated_at
      FROM links
      WHERE status = ?
      ORDER BY created_at DESC
    `);
    
    const rows = stmt.all(status) as any[];
    return rows.map(row => ({
      ...row,
      last_checked: row.last_checked ? new Date(row.last_checked) : undefined,
      first_available: row.first_available ? new Date(row.first_available) : undefined,
      last_available: row.last_available ? new Date(row.last_available) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }));
  }

  static findByProvider(providerId: number): Link[] {
    const stmt = db.prepare(`
      SELECT id, url, provider_id, status, check_frequency, 
             last_checked, first_available, last_available, 
             created_at, updated_at
      FROM links
      WHERE provider_id = ?
      ORDER BY created_at DESC
    `);
    
    const rows = stmt.all(providerId) as any[];
    return rows.map(row => ({
      ...row,
      last_checked: row.last_checked ? new Date(row.last_checked) : undefined,
      first_available: row.first_available ? new Date(row.first_available) : undefined,
      last_available: row.last_available ? new Date(row.last_available) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }));
  }

  static create(data: Omit<Link, 'id' | 'created_at' | 'updated_at'>): Link {
    const stmt = db.prepare(`
      INSERT INTO links (url, provider_id, status, check_frequency, 
                         last_checked, first_available, last_available)
      VALUES (@url, @provider_id, @status, @check_frequency, 
              @last_checked, @first_available, @last_available)
    `);
    
    const result = stmt.run({
      url: data.url,
      provider_id: data.provider_id,
      status: data.status,
      check_frequency: data.check_frequency,
      last_checked: data.last_checked?.toISOString() || null,
      first_available: data.first_available?.toISOString() || null,
      last_available: data.last_available?.toISOString() || null
    });
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  static update(id: number, data: Partial<Omit<Link, 'id' | 'created_at' | 'updated_at'>>): Link | null {
    const updates: string[] = [];
    const params: any = { id };
    
    if (data.url !== undefined) {
      updates.push('url = @url');
      params.url = data.url;
    }
    if (data.provider_id !== undefined) {
      updates.push('provider_id = @provider_id');
      params.provider_id = data.provider_id;
    }
    if (data.status !== undefined) {
      updates.push('status = @status');
      params.status = data.status;
    }
    if (data.check_frequency !== undefined) {
      updates.push('check_frequency = @check_frequency');
      params.check_frequency = data.check_frequency;
    }
    if (data.last_checked !== undefined) {
      updates.push('last_checked = @last_checked');
      params.last_checked = data.last_checked?.toISOString() || null;
    }
    if (data.first_available !== undefined) {
      updates.push('first_available = @first_available');
      params.first_available = data.first_available?.toISOString() || null;
    }
    if (data.last_available !== undefined) {
      updates.push('last_available = @last_available');
      params.last_available = data.last_available?.toISOString() || null;
    }
    
    if (updates.length === 0) return this.findById(id);
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    const stmt = db.prepare(`
      UPDATE links
      SET ${updates.join(', ')}
      WHERE id = @id
    `);
    
    stmt.run(params);
    return this.findById(id);
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM links WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static count(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM links');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  static countByStatus(status: LinkStatus): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM links WHERE status = ?');
    const result = stmt.get(status) as { count: number };
    return result.count;
  }
}
