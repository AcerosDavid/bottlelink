import { db, parseJson, stringifyJson } from './database';
import { FileMetadata } from '../types';

export class FileMetadataModel {
  static findByLinkId(linkId: number): FileMetadata | null {
    const stmt = db.prepare(`
      SELECT id, link_id, name, extension, mime_type, size, hash, etag, 
             last_modified, duration, resolution, fps, video_codec, 
             audio_codec, bitrate, format, streams, languages, metadata,
             created_at, updated_at
      FROM files
      WHERE link_id = ?
    `);
    
    const row = stmt.get(linkId) as any;
    if (!row) return null;
    
    return {
      ...row,
      last_modified: row.last_modified ? new Date(row.last_modified) : undefined,
      languages: row.languages ? JSON.parse(row.languages) : undefined,
      metadata: parseJson(row.metadata),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  static findById(id: number): FileMetadata | null {
    const stmt = db.prepare(`
      SELECT id, link_id, name, extension, mime_type, size, hash, etag, 
             last_modified, duration, resolution, fps, video_codec, 
             audio_codec, bitrate, format, streams, languages, metadata,
             created_at, updated_at
      FROM files
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;
    
    return {
      ...row,
      last_modified: row.last_modified ? new Date(row.last_modified) : undefined,
      languages: row.languages ? JSON.parse(row.languages) : undefined,
      metadata: parseJson(row.metadata),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  static create(data: Omit<FileMetadata, 'id' | 'created_at' | 'updated_at'>): FileMetadata {
    const stmt = db.prepare(`
      INSERT INTO files (link_id, name, extension, mime_type, size, hash, etag,
                        last_modified, duration, resolution, fps, video_codec,
                        audio_codec, bitrate, format, streams, languages, metadata)
      VALUES (@link_id, @name, @extension, @mime_type, @size, @hash, @etag,
              @last_modified, @duration, @resolution, @fps, @video_codec,
              @audio_codec, @bitrate, @format, @streams, @languages, @metadata)
    `);
    
    const result = stmt.run({
      link_id: data.link_id,
      name: data.name || null,
      extension: data.extension || null,
      mime_type: data.mime_type || null,
      size: data.size || null,
      hash: data.hash || null,
      etag: data.etag || null,
      last_modified: data.last_modified?.toISOString() || null,
      duration: data.duration || null,
      resolution: data.resolution || null,
      fps: data.fps || null,
      video_codec: data.video_codec || null,
      audio_codec: data.audio_codec || null,
      bitrate: data.bitrate || null,
      format: data.format || null,
      streams: data.streams || null,
      languages: data.languages ? JSON.stringify(data.languages) : null,
      metadata: stringifyJson(data.metadata)
    });
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  static update(id: number, data: Partial<Omit<FileMetadata, 'id' | 'created_at' | 'updated_at'>>): FileMetadata | null {
    const updates: string[] = [];
    const params: any = { id };
    
    if (data.name !== undefined) {
      updates.push('name = @name');
      params.name = data.name;
    }
    if (data.extension !== undefined) {
      updates.push('extension = @extension');
      params.extension = data.extension;
    }
    if (data.mime_type !== undefined) {
      updates.push('mime_type = @mime_type');
      params.mime_type = data.mime_type;
    }
    if (data.size !== undefined) {
      updates.push('size = @size');
      params.size = data.size;
    }
    if (data.hash !== undefined) {
      updates.push('hash = @hash');
      params.hash = data.hash;
    }
    if (data.etag !== undefined) {
      updates.push('etag = @etag');
      params.etag = data.etag;
    }
    if (data.last_modified !== undefined) {
      updates.push('last_modified = @last_modified');
      params.last_modified = data.last_modified?.toISOString() || null;
    }
    if (data.duration !== undefined) {
      updates.push('duration = @duration');
      params.duration = data.duration;
    }
    if (data.resolution !== undefined) {
      updates.push('resolution = @resolution');
      params.resolution = data.resolution;
    }
    if (data.fps !== undefined) {
      updates.push('fps = @fps');
      params.fps = data.fps;
    }
    if (data.video_codec !== undefined) {
      updates.push('video_codec = @video_codec');
      params.video_codec = data.video_codec;
    }
    if (data.audio_codec !== undefined) {
      updates.push('audio_codec = @audio_codec');
      params.audio_codec = data.audio_codec;
    }
    if (data.bitrate !== undefined) {
      updates.push('bitrate = @bitrate');
      params.bitrate = data.bitrate;
    }
    if (data.format !== undefined) {
      updates.push('format = @format');
      params.format = data.format;
    }
    if (data.streams !== undefined) {
      updates.push('streams = @streams');
      params.streams = data.streams;
    }
    if (data.languages !== undefined) {
      updates.push('languages = @languages');
      params.languages = data.languages ? JSON.stringify(data.languages) : null;
    }
    if (data.metadata !== undefined) {
      updates.push('metadata = @metadata');
      params.metadata = stringifyJson(data.metadata);
    }
    
    if (updates.length === 0) return this.findById(id);
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    const stmt = db.prepare(`
      UPDATE files
      SET ${updates.join(', ')}
      WHERE id = @id
    `);
    
    stmt.run(params);
    return this.findById(id);
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM files WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
