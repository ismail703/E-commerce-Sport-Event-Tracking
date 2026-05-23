// ===========================================
// EXPORT API - Download logs as CSV
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { TrackingEvent, TimeRange } from '@/lib/types';

const LOGS_DIR = path.join(process.cwd(), 'logs');

// Get all log files within time range
function getLogFilesInRange(range: TimeRange): string[] {
  if (!fs.existsSync(LOGS_DIR)) {
    return [];
  }

  const now = new Date();
  let daysBack = 1;

  switch (range) {
    case '24h':
      daysBack = 1;
      break;
    case '7d':
      daysBack = 7;
      break;
    case '30d':
      daysBack = 30;
      break;
  }

  const files: string[] = [];
  const allLogFiles = fs.readdirSync(LOGS_DIR).filter((file) => file.endsWith('.json'));

  for (let i = 0; i <= daysBack; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dateFileRegex = new RegExp(`^${dateStr}(?:-\\d{2})?\\.json$`);

    for (const fileName of allLogFiles) {
      if (dateFileRegex.test(fileName)) {
        files.push(path.join(LOGS_DIR, fileName));
      }
    }
  }

  return files;
}

function parseLogFileContent(content: string): TrackingEvent[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  // Backward compatibility with historical JSON array log files.
  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? (parsed as TrackingEvent[]) : [];
  }

  // Current format is JSONL; this parser also tolerates pretty-printed multiline objects.
  const objectChunks: string[] = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let start = -1;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (ch === '{') {
      if (depth === 0) {
        start = i;
      }
      depth++;
    } else if (ch === '}') {
      if (depth > 0) {
        depth--;
        if (depth === 0 && start !== -1) {
          objectChunks.push(trimmed.slice(start, i + 1));
          start = -1;
        }
      }
    }
  }

  const events: TrackingEvent[] = [];
  for (const chunk of objectChunks) {
    try {
      const parsed = JSON.parse(chunk);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        events.push(parsed as TrackingEvent);
      }
    } catch {
      // Skip malformed object and continue.
      continue;
    }
  }

  return events;
}

// Read all events
function readAllEvents(range: TimeRange): TrackingEvent[] {
  const files = getLogFilesInRange(range);
  const allEvents: TrackingEvent[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const events = parseLogFileContent(content);
      allEvents.push(...events);
    } catch {
      continue;
    }
  }

  return allEvents.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Convert events to CSV
function eventsToCSV(events: TrackingEvent[]): string {
  const headers = [
    'timestamp',
    'sessionId',
    'userId',
    'eventType',
    'page',
    'target',
    'productId',
    'quantity',
    'dwellTimeMs',
    'cartTotal',
    'orderId',
  ];

  const rows = events.map((e) => [
    e.timestamp,
    e.sessionId,
    e.userId || '',
    e.eventType,
    e.metadata.page || '',
    e.metadata.target || '',
    e.metadata.productId || '',
    e.metadata.quantity?.toString() || '',
    e.metadata.dwellTimeMs?.toString() || '',
    e.metadata.cartTotal?.toString() || '',
    e.metadata.orderId || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = (searchParams.get('range') || '24h') as TimeRange;

    const events = readAllEvents(range);
    const csv = eventsToCSV(events);

    // Return as downloadable CSV
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="velocity-analytics-${range}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('[Export API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
