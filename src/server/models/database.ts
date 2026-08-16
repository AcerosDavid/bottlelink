import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), process.env.DB_PATH || 'data/bottlelink.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initializeDatabase() {
  // Providers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      config TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Links table
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL UNIQUE,
      provider_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'UNKNOWN',
      check_frequency INTEGER DEFAULT 60,
      last_checked DATETIME,
      first_available DATETIME,
      last_available DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (provider_id) REFERENCES providers(id)
    )
  `);

  // Files table
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id INTEGER NOT NULL UNIQUE,
      name TEXT,
      extension TEXT,
      mime_type TEXT,
      size INTEGER,
      hash TEXT,
      etag TEXT,
      last_modified DATETIME,
      duration REAL,
      resolution TEXT,
      fps REAL,
      video_codec TEXT,
      audio_codec TEXT,
      bitrate INTEGER,
      format TEXT,
      streams INTEGER,
      languages TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (link_id) REFERENCES links(id)
    )
  `);

  // File versions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS file_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id INTEGER NOT NULL,
      version INTEGER NOT NULL,
      name TEXT,
      extension TEXT,
      mime_type TEXT,
      size INTEGER,
      hash TEXT,
      etag TEXT,
      last_modified DATETIME,
      duration REAL,
      resolution TEXT,
      fps REAL,
      video_codec TEXT,
      audio_codec TEXT,
      bitrate INTEGER,
      format TEXT,
      streams INTEGER,
      languages TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (file_id) REFERENCES files(id)
    )
  `);

  // Checks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      file_version_id INTEGER,
      error_message TEXT,
      response_time INTEGER,
      redirect_url TEXT,
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (link_id) REFERENCES links(id),
      FOREIGN KEY (file_version_id) REFERENCES file_versions(id)
    )
  `);

  // Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      description TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (link_id) REFERENCES links(id)
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      channel TEXT NOT NULL,
      recipient TEXT NOT NULL,
      sent INTEGER DEFAULT 0,
      sent_at DATETIME,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (link_id) REFERENCES links(id)
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_links_provider ON links(provider_id);
    CREATE INDEX IF NOT EXISTS idx_links_status ON links(status);
    CREATE INDEX IF NOT EXISTS idx_checks_link ON checks(link_id);
    CREATE INDEX IF NOT EXISTS idx_checks_status ON checks(status);
    CREATE INDEX IF NOT EXISTS idx_checks_checked_at ON checks(checked_at);
    CREATE INDEX IF NOT EXISTS idx_events_link ON events(link_id);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
    CREATE INDEX IF NOT EXISTS idx_file_versions_file ON file_versions(file_id);
  `);

  // Insert default providers
  const defaultProviders = [
    { name: 'MEGA', type: 'MEGA', enabled: true },
    { name: 'MediaFire', type: 'MEDIAFIRE', enabled: true },
    { name: 'Google Drive', type: 'GOOGLE_DRIVE', enabled: true },
    { name: 'Dropbox', type: 'DROPBOX', enabled: true },
    { name: 'OneDrive', type: 'ONEDRIVE', enabled: true },
    { name: 'Pixeldrain', type: 'PIXELDRAIN', enabled: true },
    { name: 'HTTP', type: 'HTTP', enabled: true },
    { name: 'HTTPS', type: 'HTTPS', enabled: true }
  ];

  const insertProvider = db.prepare(`
    INSERT OR IGNORE INTO providers (name, type, enabled, config)
    VALUES (@name, @type, @enabled, NULL)
  `);

  const insertMany = db.transaction((providers) => {
    for (const provider of providers) {
      insertProvider.run({
        ...provider,
        enabled: provider.enabled ? 1 : 0
      });
    }
  });

  insertMany(defaultProviders);

  console.log('Database initialized successfully');
}

// Helper function to parse JSON columns
export function parseJson<T>(jsonString: string | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
}

// Helper function to stringify JSON columns
export function stringifyJson(obj: any): string | null {
  if (obj === null || obj === undefined) return null;
  try {
    return JSON.stringify(obj);
  } catch {
    return null;
  }
}
