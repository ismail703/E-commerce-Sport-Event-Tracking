// ===========================================
// ADMIN ANALYTICS API
// Server-side aggregation of tracking logs for dashboard
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { TrackingEvent, DashboardMetrics, TimeRange } from '@/lib/types';
import { products } from '@/lib/data';

const LOGS_DIR = path.join(process.cwd(), 'logs');

// Cache for repeated requests (basic memoization)
let metricsCache: { data: DashboardMetrics; timestamp: number; range: TimeRange } | null = null;
const CACHE_TTL = 30000; // 30 seconds

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

// Read and parse all events from log files
function readAllEvents(range: TimeRange): TrackingEvent[] {
  const files = getLogFilesInRange(range);
  const allEvents: TrackingEvent[] = [];

  // Calculate cutoff time
  const now = new Date();
  let hoursBack = 24;

  switch (range) {
    case '24h':
      hoursBack = 24;
      break;
    case '7d':
      hoursBack = 24 * 7;
      break;
    case '30d':
      hoursBack = 24 * 30;
      break;
  }

  const cutoff = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const events = parseLogFileContent(content);

      // Filter events by timestamp
      const filtered = events.filter((e) => new Date(e.timestamp) >= cutoff);
      allEvents.push(...filtered);
    } catch {
      // Skip corrupted files
      continue;
    }
  }

  return allEvents;
}

// Compute dashboard metrics from events
function computeMetrics(events: TrackingEvent[]): DashboardMetrics {
  // Unique sessions and visitors
  const sessions = new Set(events.map((e) => e.sessionId));
  const visitors = new Set(
    events.filter((e) => e.userId).map((e) => e.userId)
  );

  // Page view distribution
  const pageViews = events.filter((e) => e.eventType === 'page_view');
  const pageViewCounts: Record<string, number> = {};
  for (const pv of pageViews) {
    const page = pv.metadata.page || 'unknown';
    pageViewCounts[page] = (pageViewCounts[page] || 0) + 1;
  }
  const topPages = Object.entries(pageViewCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([page, count]) => ({ page, count }));

  // Product engagement
  const productViews = events.filter((e) => e.eventType === 'product_view');
  const productStats: Record<string, { views: number; totalDwell: number }> = {};
  for (const pv of productViews) {
    const productId = pv.metadata.productId;
    if (!productId) continue;

    if (!productStats[productId]) {
      productStats[productId] = { views: 0, totalDwell: 0 };
    }
    productStats[productId].views++;
    productStats[productId].totalDwell += pv.metadata.dwellTimeMs || 0;
  }

  const productEngagement = Object.entries(productStats)
    .map(([productId, stats]) => {
      const product = products.find((p) => p.id === productId);
      return {
        productId,
        productName: product?.name || productId,
        views: stats.views,
        avgDwellTime: stats.views > 0 ? Math.round(stats.totalDwell / stats.views) : 0,
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Conversion funnel
  const addToCartEvents = events.filter((e) => e.eventType === 'add_to_cart');
  const checkoutStartEvents = events.filter((e) => e.eventType === 'checkout_start');
  const purchaseEvents = events.filter((e) => e.eventType === 'purchase_complete');
  const purchaseOrders = new Set(
    purchaseEvents
      .map((event) => event.metadata.orderId)
      .filter((orderId): orderId is string => !!orderId)
  );

  const conversionFunnel = {
    views: productViews.length,
    addToCart: addToCartEvents.length,
    checkoutStart: checkoutStartEvents.length,
    purchaseComplete: purchaseOrders.size || purchaseEvents.length,
  };

  // Click heatmap
  const clickEvents = events.filter((e) => e.eventType === 'click');
  const clickCounts: Record<string, number> = {};
  for (const click of clickEvents) {
    const target = click.metadata.target || 'unknown';
    clickCounts[target] = (clickCounts[target] || 0) + 1;
  }
  const clickHeatmap = Object.entries(clickCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([target, count]) => ({ target, count }));

  // Auth activity
  const logins = events.filter((e) => e.eventType === 'login').length;
  const logouts = events.filter((e) => e.eventType === 'logout').length;

  return {
    totalSessions: sessions.size,
    uniqueVisitors: visitors.size,
    pageViews: topPages,
    productEngagement,
    conversionFunnel,
    clickHeatmap,
    authActivity: { logins, logouts },
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = (searchParams.get('range') || '24h') as TimeRange;

    // Check cache
    if (
      metricsCache &&
      metricsCache.range === range &&
      Date.now() - metricsCache.timestamp < CACHE_TTL
    ) {
      return NextResponse.json({
        success: true,
        data: metricsCache.data,
        cached: true,
      });
    }

    // Read and process events
    const events = readAllEvents(range);
    const metrics = computeMetrics(events);

    // Update cache
    metricsCache = {
      data: metrics,
      timestamp: Date.now(),
      range,
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      eventCount: events.length,
      cached: false,
    });
  } catch (error) {
    console.error('[Analytics API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute analytics' },
      { status: 500 }
    );
  }
}
