/**
 * Seed script — populates the database with example data for development/demo.
 * Run with: npm run seed
 *
 * Safe to run multiple times: uses INSERT OR IGNORE so it won't duplicate data.
 */

import { db, initializeDatabase } from './models/database';

initializeDatabase();

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function minutesAgo(n: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - n);
  return d.toISOString();
}

// ─── Providers (already seeded by initializeDatabase, fetch their IDs) ──────

const getProviderId = db.prepare('SELECT id FROM providers WHERE name = ?');

const providers: Record<string, number> = {
  MEGA:         (getProviderId.get('MEGA')         as any)?.id,
  MediaFire:    (getProviderId.get('MediaFire')    as any)?.id,
  'Google Drive':(getProviderId.get('Google Drive') as any)?.id,
  Dropbox:      (getProviderId.get('Dropbox')      as any)?.id,
  OneDrive:     (getProviderId.get('OneDrive')     as any)?.id,
  Pixeldrain:   (getProviderId.get('Pixeldrain')   as any)?.id,
  HTTP:         (getProviderId.get('HTTP')         as any)?.id,
};

// ─── Example links ───────────────────────────────────────────────────────────

const exampleLinks = [
  {
    url: 'https://mega.nz/file/abc123XY#examplekeyfortestingpurposes',
    provider: 'MEGA',
    status: 'ACTIVE',
    check_frequency: 60,
    last_checked: hoursAgo(1),
    first_available: daysAgo(30),
    last_available: hoursAgo(1),
  },
  {
    url: 'https://www.mediafire.com/file/xyz789/example-video.mp4/file',
    provider: 'MediaFire',
    status: 'ACTIVE',
    check_frequency: 120,
    last_checked: hoursAgo(2),
    first_available: daysAgo(15),
    last_available: hoursAgo(2),
  },
  {
    url: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/view',
    provider: 'Google Drive',
    status: 'RESTRICTED',
    check_frequency: 60,
    last_checked: hoursAgo(3),
    first_available: daysAgo(20),
    last_available: daysAgo(5),
  },
  {
    url: 'https://www.dropbox.com/s/examplehash/old-archive.zip?dl=0',
    provider: 'Dropbox',
    status: 'DEAD',
    check_frequency: 180,
    last_checked: hoursAgo(4),
    first_available: daysAgo(60),
    last_available: daysAgo(10),
  },
  {
    url: 'https://1drv.ms/u/s!exampleOneDriveShareLink',
    provider: 'OneDrive',
    status: 'ACTIVE',
    check_frequency: 60,
    last_checked: minutesAgo(30),
    first_available: daysAgo(7),
    last_available: minutesAgo(30),
  },
  {
    url: 'https://pixeldrain.com/u/examplePixeldrainId',
    provider: 'Pixeldrain',
    status: 'CHANGED',
    check_frequency: 240,
    last_checked: hoursAgo(5),
    first_available: daysAgo(45),
    last_available: hoursAgo(5),
  },
  {
    url: 'https://archive.org/download/example-file/example.mp4',
    provider: 'HTTP',
    status: 'ACTIVE',
    check_frequency: 360,
    last_checked: hoursAgo(6),
    first_available: daysAgo(90),
    last_available: hoursAgo(6),
  },
  {
    url: 'https://mega.nz/file/dead0000#thislinkhasbeenremovedbytheowner',
    provider: 'MEGA',
    status: 'DEAD',
    check_frequency: 60,
    last_checked: hoursAgo(1),
    first_available: daysAgo(50),
    last_available: daysAgo(3),
  },
  {
    url: 'https://www.mediafire.com/file/errlink/corrupted-upload.rar/file',
    provider: 'MediaFire',
    status: 'ERROR',
    check_frequency: 120,
    last_checked: hoursAgo(2),
    first_available: daysAgo(10),
    last_available: daysAgo(1),
  },
  {
    url: 'https://drive.google.com/file/d/0B4y35FiV1wh7QjBEZXhERlhZZHM/view',
    provider: 'Google Drive',
    status: 'ACTIVE',
    check_frequency: 60,
    last_checked: minutesAgo(45),
    first_available: daysAgo(120),
    last_available: minutesAgo(45),
  },
];

const insertLink = db.prepare(`
  INSERT OR IGNORE INTO links
    (url, provider_id, status, check_frequency, last_checked, first_available, last_available)
  VALUES
    (@url, @provider_id, @status, @check_frequency, @last_checked, @first_available, @last_available)
`);

const seedLinks = db.transaction(() => {
  for (const link of exampleLinks) {
    insertLink.run({
      url: link.url,
      provider_id: providers[link.provider],
      status: link.status,
      check_frequency: link.check_frequency,
      last_checked: link.last_checked,
      first_available: link.first_available,
      last_available: link.last_available,
    });
  }
});

seedLinks();
console.log(`✓ Inserted ${exampleLinks.length} example links`);

// ─── File metadata for ACTIVE links ─────────────────────────────────────────

const getLinkId = db.prepare('SELECT id FROM links WHERE url = ?');

const insertFile = db.prepare(`
  INSERT OR IGNORE INTO files
    (link_id, name, extension, mime_type, size, duration, resolution, video_codec, audio_codec, bitrate, format)
  VALUES
    (@link_id, @name, @extension, @mime_type, @size, @duration, @resolution, @video_codec, @audio_codec, @bitrate, @format)
`);

const fileSeeds = [
  {
    url: exampleLinks[0].url,
    name: 'example-video-hd.mp4',
    extension: 'mp4',
    mime_type: 'video/mp4',
    size: 734003200,       // ~700 MB
    duration: 5400,        // 90 min
    resolution: '1920x1080',
    video_codec: 'H.264',
    audio_codec: 'AAC',
    bitrate: 4000,
    format: 'MP4',
  },
  {
    url: exampleLinks[1].url,
    name: 'example-video.mp4',
    extension: 'mp4',
    mime_type: 'video/mp4',
    size: 1572864000,      // ~1.5 GB
    duration: 7200,        // 2h
    resolution: '3840x2160',
    video_codec: 'H.265',
    audio_codec: 'AC3',
    bitrate: 8000,
    format: 'MP4',
  },
  {
    url: exampleLinks[4].url,
    name: 'documents-backup.zip',
    extension: 'zip',
    mime_type: 'application/zip',
    size: 52428800,        // ~50 MB
    duration: null,
    resolution: null,
    video_codec: null,
    audio_codec: null,
    bitrate: null,
    format: 'ZIP',
  },
  {
    url: exampleLinks[6].url,
    name: 'example.mp4',
    extension: 'mp4',
    mime_type: 'video/mp4',
    size: 209715200,       // ~200 MB
    duration: 3600,        // 60 min
    resolution: '1280x720',
    video_codec: 'H.264',
    audio_codec: 'MP3',
    bitrate: 2500,
    format: 'MP4',
  },
  {
    url: exampleLinks[9].url,
    name: 'presentation.pdf',
    extension: 'pdf',
    mime_type: 'application/pdf',
    size: 5242880,         // ~5 MB
    duration: null,
    resolution: null,
    video_codec: null,
    audio_codec: null,
    bitrate: null,
    format: 'PDF',
  },
];

const seedFiles = db.transaction(() => {
  for (const file of fileSeeds) {
    const link = getLinkId.get(file.url) as any;
    if (!link) continue;
    insertFile.run({ link_id: link.id, ...file });
  }
});

seedFiles();
console.log(`✓ Inserted ${fileSeeds.length} file metadata records`);

// ─── Checks history ──────────────────────────────────────────────────────────

const insertCheck = db.prepare(`
  INSERT INTO checks (link_id, status, response_time, error_message, checked_at)
  VALUES (@link_id, @status, @response_time, @error_message, @checked_at)
`);

function generateChecks(linkUrl: string, currentStatus: string) {
  const link = getLinkId.get(linkUrl) as any;
  if (!link) return;

  const checkHistory = [
    { hoursBack: 1,  status: currentStatus,  rt: 320,  err: null },
    { hoursBack: 2,  status: currentStatus,  rt: 289,  err: null },
    { hoursBack: 3,  status: currentStatus,  rt: 410,  err: null },
    { hoursBack: 6,  status: 'ACTIVE',       rt: 350,  err: null },
    { hoursBack: 12, status: 'ACTIVE',       rt: 295,  err: null },
    { hoursBack: 24, status: 'ACTIVE',       rt: 380,  err: null },
    { hoursBack: 48, status: 'ACTIVE',       rt: 260,  err: null },
  ];

  const seedChecksForLink = db.transaction(() => {
    for (const c of checkHistory) {
      insertCheck.run({
        link_id: link.id,
        status: c.status,
        response_time: c.rt,
        error_message: c.err,
        checked_at: hoursAgo(c.hoursBack),
      });
    }
  });
  seedChecksForLink();
}

// Generate checks for a few representative links
[0, 1, 3, 4, 5, 8].forEach(i => generateChecks(exampleLinks[i].url, exampleLinks[i].status));
console.log('✓ Inserted check history');

// ─── Events ──────────────────────────────────────────────────────────────────

const insertEvent = db.prepare(`
  INSERT INTO events (link_id, event_type, description, created_at)
  VALUES (@link_id, @event_type, @description, @created_at)
`);

const eventSeeds: Array<{ url: string; type: string; desc: string; when: string }> = [
  {
    url: exampleLinks[3].url,
    type: 'LINK_DIED',
    desc: 'El enlace dejó de estar disponible. Código HTTP: 404.',
    when: daysAgo(10),
  },
  {
    url: exampleLinks[3].url,
    type: 'LINK_CHECKED',
    desc: 'Verificación automática — enlace sigue caído.',
    when: hoursAgo(4),
  },
  {
    url: exampleLinks[5].url,
    type: 'FILE_CHANGED',
    desc: 'Se detectó un cambio en el archivo: tamaño modificado de 1.2 GB a 1.4 GB.',
    when: hoursAgo(5),
  },
  {
    url: exampleLinks[5].url,
    type: 'LINK_CHECKED',
    desc: 'Verificación automática completada.',
    when: hoursAgo(5),
  },
  {
    url: exampleLinks[2].url,
    type: 'LINK_RESTRICTED',
    desc: 'El acceso al archivo fue restringido. Se requiere autenticación.',
    when: daysAgo(5),
  },
  {
    url: exampleLinks[0].url,
    type: 'LINK_CHECKED',
    desc: 'Verificación automática completada. Enlace activo.',
    when: hoursAgo(1),
  },
  {
    url: exampleLinks[8].url,
    type: 'LINK_ERROR',
    desc: 'Error de conexión al verificar el enlace: timeout después de 30s.',
    when: hoursAgo(2),
  },
  {
    url: exampleLinks[4].url,
    type: 'LINK_CHECKED',
    desc: 'Verificación automática completada. Enlace activo.',
    when: minutesAgo(30),
  },
];

const seedEvents = db.transaction(() => {
  for (const e of eventSeeds) {
    const link = getLinkId.get(e.url) as any;
    if (!link) continue;
    insertEvent.run({
      link_id: link.id,
      event_type: e.type,
      description: e.desc,
      created_at: e.when,
    });
  }
});

seedEvents();
console.log(`✓ Inserted ${eventSeeds.length} events`);

// ─── Done ─────────────────────────────────────────────────────────────────────

console.log('\n✅ Seed completado. La base de datos tiene datos de ejemplo listos.\n');
