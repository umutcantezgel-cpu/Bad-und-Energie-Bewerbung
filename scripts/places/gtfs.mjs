/**
 * GTFS lesen ohne neue Abhängigkeit (für scripts/places/oepnv.mjs): ZIP-Einträge über node:zlib entpacken,
 * CSV zeilenweise lesen, Fahrplantage aus calendar.txt und calendar_dates.txt bestimmen.
 *
 * Die ZIP-Datei ist heruntergeladen und damit fremde Eingabe: Sie wird nur gelesen und geparst, nie ausgeführt
 * oder entpackt auf die Platte geschrieben. stop_times.txt ist entpackt über 2 GB groß und läuft als Strom durch.
 */

import fs from 'node:fs';
import readline from 'node:readline';
import zlib from 'node:zlib';

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
/** Kommentar am Ende darf bis 64 KB lang sein; so weit wird nach dem Endsatz gesucht. */
const EOCD_SEARCH = 22 + 0xffff;
const ZIP64_MARK = 0xffffffff;

/**
 * Inhaltsverzeichnis einer ZIP-Datei: Name → Lage und Größe. Nur „stored“ (0) und „deflate“ (8);
 * ZIP64 (über 4 GB je Eintrag) bricht mit einer klaren Meldung ab, statt falsch zu lesen.
 */
export function readZipDirectory(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const { size } = fs.fstatSync(fd);
    const tailLength = Math.min(size, EOCD_SEARCH);
    const tail = Buffer.alloc(tailLength);
    fs.readSync(fd, tail, 0, tailLength, size - tailLength);
    let eocd = -1;
    for (let i = tailLength - 22; i >= 0; i--) {
      if (tail.readUInt32LE(i) === EOCD_SIGNATURE) {
        eocd = i;
        break;
      }
    }
    if (eocd < 0) throw new Error(`${file}: kein ZIP-Endsatz gefunden`);
    const count = tail.readUInt16LE(eocd + 10);
    const dirSize = tail.readUInt32LE(eocd + 12);
    const dirOffset = tail.readUInt32LE(eocd + 16);
    if (dirSize === ZIP64_MARK || dirOffset === ZIP64_MARK) throw new Error(`${file}: ZIP64 wird nicht unterstützt`);

    const dir = Buffer.alloc(dirSize);
    fs.readSync(fd, dir, 0, dirSize, dirOffset);
    const entries = new Map();
    let pos = 0;
    for (let n = 0; n < count; n++) {
      if (dir.readUInt32LE(pos) !== CENTRAL_SIGNATURE) throw new Error(`${file}: Verzeichnis beschädigt (Eintrag ${n})`);
      const method = dir.readUInt16LE(pos + 10);
      const compressedSize = dir.readUInt32LE(pos + 20);
      const uncompressedSize = dir.readUInt32LE(pos + 24);
      const nameLength = dir.readUInt16LE(pos + 28);
      const extraLength = dir.readUInt16LE(pos + 30);
      const commentLength = dir.readUInt16LE(pos + 32);
      const localOffset = dir.readUInt32LE(pos + 42);
      const name = dir.toString('utf8', pos + 46, pos + 46 + nameLength);
      if ([compressedSize, uncompressedSize, localOffset].includes(ZIP64_MARK)) {
        throw new Error(`${file}: Eintrag ${name} braucht ZIP64, wird nicht unterstützt`);
      }
      entries.set(name, { name, method, compressedSize, uncompressedSize, localOffset });
      pos += 46 + nameLength + extraLength + commentLength;
    }
    return entries;
  } finally {
    fs.closeSync(fd);
  }
}

/** Lesestrom eines Eintrags (entpackt). */
export function openZipEntry(file, entry) {
  if (entry.method !== 0 && entry.method !== 8) throw new Error(`${entry.name}: Kompression ${entry.method} nicht unterstützt`);
  const fd = fs.openSync(file, 'r');
  const header = Buffer.alloc(30);
  fs.readSync(fd, header, 0, 30, entry.localOffset);
  fs.closeSync(fd);
  if (header.readUInt32LE(0) !== LOCAL_SIGNATURE) throw new Error(`${entry.name}: lokaler Kopf fehlt`);
  const start = entry.localOffset + 30 + header.readUInt16LE(26) + header.readUInt16LE(28);
  const raw = fs.createReadStream(file, { start, end: start + entry.compressedSize - 1, highWaterMark: 1 << 20 });
  if (entry.method === 0) return raw;
  const inflate = zlib.createInflateRaw({ chunkSize: 1 << 20 });
  raw.on('error', (err) => inflate.destroy(err));
  return raw.pipe(inflate);
}

/**
 * Eine CSV-Zeile nach RFC 4180 (Anführungszeichen, verdoppelte Anführungszeichen, Kommas im Feld).
 * Zeilenumbrüche in Feldern kommen in GTFS nicht vor und werden nicht unterstützt.
 */
export function parseCsvLine(line) {
  if (!line.includes('"')) return line.split(',');
  const fields = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      fields.push(field);
      field = '';
    } else field += ch;
  }
  fields.push(field);
  return fields;
}

/**
 * Liest eine GTFS-Datei aus der ZIP zeilenweise. `onRow(row)` bekommt ein Objekt Spaltenname → Wert.
 * `makePrefilter(header)` (optional) liefert zur Kopfzeile eine Funktion `(line) => boolean`, die Zeilen vor dem
 * Zerlegen verwirft (z. B. nach der ersten Spalte), oder null – das spart bei stop_times.txt den größten Teil der Arbeit.
 */
export function readGtfsTable(file, entries, name, onRow, makePrefilter) {
  const entry = entries.get(name);
  if (!entry) throw new Error(`GTFS-Datei ${name} fehlt in ${file}`);
  return new Promise((resolve, reject) => {
    const input = openZipEntry(file, entry);
    input.on('error', reject);
    const lines = readline.createInterface({ input, crlfDelay: Infinity });
    let header = null;
    let prefilter = null;
    let count = 0;
    lines.on('line', (raw) => {
      if (header === null) {
        header = parseCsvLine(raw.replace(/^\uFEFF/, '')).map((h) => h.trim());
        prefilter = makePrefilter ? makePrefilter(header) : null;
        return;
      }
      if (raw === '' || (prefilter && !prefilter(raw))) return;
      const fields = parseCsvLine(raw);
      const row = {};
      for (let i = 0; i < header.length; i++) row[header[i]] = fields[i] ?? '';
      count++;
      onRow(row);
    });
    lines.on('close', () => resolve(count));
    lines.on('error', reject);
  });
}

/** „HH:MM:SS“ (auch über 24 h, GTFS) → Sekunden seit Mitternacht des Betriebstags. */
export function parseGtfsTime(value) {
  const match = /^\s*(\d{1,3}):(\d{2}):(\d{2})\s*$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

/** Sekunden → „HH:MM“ (Minuten abgeschnitten, Fahrpläne zeigen volle Minuten). */
export function formatClock(seconds) {
  const minutes = Math.floor(seconds / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const WEEKDAY_COLUMNS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** „2026-10-20“ → „20261020“ (Datumsformat in GTFS). */
export const gtfsDate = (iso) => iso.replaceAll('-', '');

/** ISO-Datum um `days` Tage verschoben (UTC, ohne Zeitzonenfallen). */
export function shiftIsoDate(iso, days) {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Verkehrstage, die an einem Datum gelten: calendar.txt (Wochentag im Gültigkeitszeitraum) plus Ausnahmen aus
 * calendar_dates.txt (1 = zusätzlich, 2 = entfällt).
 */
export function activeServiceIds(calendarRows, calendarDateRows, isoDate) {
  const day = gtfsDate(isoDate);
  const weekday = WEEKDAY_COLUMNS[new Date(`${isoDate}T12:00:00Z`).getUTCDay()];
  const active = new Set();
  for (const row of calendarRows) {
    if (row[weekday] === '1' && row.start_date <= day && day <= row.end_date) active.add(row.service_id);
  }
  for (const row of calendarDateRows) {
    if (row.date !== day) continue;
    if (row.exception_type === '1') active.add(row.service_id);
    else if (row.exception_type === '2') active.delete(row.service_id);
  }
  return active;
}

/** Gültigkeitszeitraum des Fahrplans: frühester Beginn und spätestes Ende über calendar und calendar_dates. */
export function feedPeriod(calendarRows, calendarDateRows) {
  let start = null;
  let end = null;
  const take = (from, to) => {
    if (!start || from < start) start = from;
    if (!end || to > end) end = to;
  };
  for (const row of calendarRows) take(row.start_date, row.end_date);
  for (const row of calendarDateRows) if (row.exception_type === '1') take(row.date, row.date);
  const iso = (d) => (d ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : null);
  return { start: iso(start), end: iso(end) };
}
