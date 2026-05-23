// ===========================================
// TRACKING API ENDPOINT
// Receives tracking payloads from frontend and stores them in hourly log files as JSON arrays
// ===========================================

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { TrackingEvent } from '@/lib/types';

// Ensure logs directory exists
const LOGS_DIR = path.join(process.cwd(), 'logs');

function ensureLogsDirectory(): void {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

// Get current hour log file path in UTC (e.g., logs/2026-04-12-14.json)
function getLogFilePath(): string {
  const now = new Date();
  const datePart = now.toISOString().split('T')[0];
  const hourPart = now.getUTCHours().toString().padStart(2, '0');
  return path.join(LOGS_DIR, `${datePart}-${hourPart}.json`);
}

// Validate incoming tracking event
function isValidTrackingEvent(event: unknown): event is TrackingEvent {
  if (!event || typeof event !== 'object') return false;

  const e = event as Record<string, unknown>;

  const validEventTypes = [
    'page_view',
    'click',
    'product_view',
    'add_to_cart',
    'remove_from_cart',
    'update_cart',
    'checkout_start',
    'purchase_complete',
    'login',
    'logout',
  ];

  return (
    typeof e.timestamp === 'string' &&
    typeof e.sessionId === 'string' &&
    (e.userId === null || typeof e.userId === 'string') &&
    typeof e.eventType === 'string' &&
    validEventTypes.includes(e.eventType) &&
    typeof e.metadata === 'object'
  );
}

function readExistingLogEvents(logPath: string): TrackingEvent[] {
  if (!fs.existsSync(logPath)) {
    return [];
  }

  const content = fs.readFileSync(logPath, 'utf-8').trim();
  if (!content) {
    return [];
  }

  if (content.startsWith('[')) {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? (parsed as TrackingEvent[]) : [];
    } catch {
      return [];
    }
  }

  const events: TrackingEvent[] = [];
  for (const line of content.split(/\r?\n/)) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    try {
      const parsed = JSON.parse(trimmedLine);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        events.push(parsed as TrackingEvent);
      }
    } catch {
      continue;
    }
  }

  return events;
}

// Append event to log file using a JSON array
function appendToLog(event: TrackingEvent): void {
  ensureLogsDirectory();
  const logPath = getLogFilePath();

  try {
    const events = readExistingLogEvents(logPath);
    events.push(event);
    fs.writeFileSync(logPath, `${JSON.stringify(events, null, 2)}\n`);
  } catch (error) {
    console.error('[Tracking API] Failed to write log:', error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate the tracking event using your helper
    if (!isValidTrackingEvent(body)) {
      return NextResponse.json(
        { success: false, message: 'Invalid tracking event format' },
        { status: 400 }
      );
    }

    // 2. Append directly to current hour log file
    appendToLog(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Tracking API] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    logsDirectory: LOGS_DIR,
    currentFile: getLogFilePath(),
    timestamp: new Date().toISOString()
  });
}
