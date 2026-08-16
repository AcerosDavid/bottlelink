import { db, parseJson, stringifyJson } from './database';
import { Provider, ProviderType } from '../types';

export class ProviderModel {
  static findAll(): Provider[] {
    const stmt = db.prepare(`
      SELECT id, name, type, enabled, config, created_at, updated_at
      FROM providers
      ORDER BY name
    `);
    
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      ...row,
      enabled: Boolean(row.enabled),
      config: parseJson(row.config),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }));
  }

  static findById(id: number): Provider | null {
    const stmt = db.prepare(`
      SELECT id, name, type, enabled, config, created_at, updated_at
      FROM providers
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;
    
    return {
      ...row,
      enabled: Boolean(row.enabled),
      config: parseJson(row.config),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  static findByName(name: string): Provider | null {
    const stmt = db.prepare(`
      SELECT id, name, type, enabled, config, created_at, updated_at
      FROM providers
      WHERE name = ?
    `);
    
    const row = stmt.get(name) as any;
    if (!row) return null;
    
    return {
      ...row,
      enabled: Boolean(row.enabled),
      config: parseJson(row.config),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  static findByType(type: ProviderType): Provider | null {
    const stmt = db.prepare(`
      SELECT id, name, type, enabled, config, created_at, updated_at
      FROM providers
      WHERE type = ?
    `);
    
    const row = stmt.get(type) as any;
    if (!row) return null;
    
    return {
      ...row,
      enabled: Boolean(row.enabled),
      config: parseJson(row.config),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  static create(data: Omit<Provider, 'id' | 'created_at' | 'updated_at'>): Provider {
    const stmt = db.prepare(`
      INSERT INTO providers (name, type, enabled, config)
      VALUES (@name, @type, @enabled, @config)
    `);
    
    const result = stmt.run({
      name: data.name,
      type: data.type,
      enabled: data.enabled ? 1 : 0,
      config: stringifyJson(data.config)
    });
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  static update(id: number, data: Partial<Omit<Provider, 'id' | 'created_at' | 'updated_at'>>): Provider | null {
    const updates: string[] = [];
    const params: any = { id };
    
    if (data.name !== undefined) {
      updates.push('name = @name');
      params.name = data.name;
    }
    if (data.type !== undefined) {
      updates.push('type = @type');
      params.type = data.type;
    }
    if (data.enabled !== undefined) {
      updates.push('enabled = @enabled');
      params.enabled = data.enabled ? 1 : 0;
    }
    if (data.config !== undefined) {
      updates.push('config = @config');
      params.config = stringifyJson(data.config);
    }
    
    if (updates.length === 0) return this.findById(id);
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    const stmt = db.prepare(`
      UPDATE providers
      SET ${updates.join(', ')}
      WHERE id = @id
    `);
    
    stmt.run(params);
    return this.findById(id);
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM providers WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
