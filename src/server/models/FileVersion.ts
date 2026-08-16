import { db, parseJson, stringifyJson } from './database';
import { FileVersion } from '../types';

export class FileVersionModel {
  static findByFileId(fileId: number): FileVersion[] {
    const stmt = db.prepare(`
      SELECT id, file_id, version, name, extension, mime_type, size, hash, etag,
             last_modified, duration, resolution, fps, video_codec, audio_codec,
             bitrate, format, streams, languages, metadata, created_at
      FROM file_versions
      WHERE file_id = ?
      ORDER BY version DESC
    `);
    
    const rows = stmt.all(fileId) as any[];
    return rows.map(row => ({
      ...row,
      last_modified: row.last_modified ? new Date(row.last_modified) : undefined,
      languages: row.languages ? JSON.parse(row.languages) : undefined,
      metadata: parseJson(row.metadata),
      created_at: new Date(row.created_at)
    }));
  }

  static findById(id: number): FileVersion | null {
    const stmt = db.prepare(`
      SELECT id, file_id, version, name, extension, mime_type, size, hash, etag,
             last_modified, duration, resolution, fps, video_codec, audio_codec,
             bitrate, format, streams, languages, metadata, created_at
      FROM file_versions
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;
    
    return {
      ...row,
      last_modified: row.last_modified ? new Date(row.last_modified) : undefined,
      languages: row.languages ? JSON.parse(row.languages) : undefined,
      metadata: parseJson(row.metadata),
      created_at: new Date(row.created_at)
    };
  }

  static create(data: Omit<FileVersion, 'id' | 'created_at'>): FileVersion {
    // Get the next version number
    const versionStmt = db.prepare(`
      SELECT COALESCE(MAX(version), 0) + 1 as next_version
      FROM file_versions
      WHERE file_id = ?
    `);
    const versionResult = versionStmt.get(data.file_id) as { next_version: number };
    const nextVersion = versionResult.next_version;
    
    const stmt = db.prepare(`
      INSERT INTO file_versions (file_id, version, name, extension, mime_type, size, hash, etag,
                                 last_modified, duration, resolution, fps, video_codec, audio_codec,
                                 bitrate, format, streams, languages, metadata)
      VALUES (@file_id, @version, @name, @extension, @mime_type, @size, @hash, @etag,
              @last_modified, @duration, @resolution, @fps, @video_codec, @audio_codec,
              @bitrate, @format, @streams, @languages, @metadata)
    `);
    
    const result = stmt.run({
      file_id: data.file_id,
      version: nextVersion,
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

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM file_versions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static deleteByFileId(fileId: number): boolean {
    const stmt = db.prepare('DELETE FROM file_versions WHERE file_id = ?');
    const result = stmt.run(fileId);
    return result.changes > 0;
  }
}
