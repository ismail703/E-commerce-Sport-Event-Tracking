'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-store';
import { useTracking } from '@/hooks/use-tracking';
import type { DashboardMetrics, TimeRange } from '@/lib/types';
import {
  Users,
  Eye,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  Download,
  MousePointer,
  LogIn,
  ChevronLeft,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
} from 'recharts';

// SWR fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Metric Card Component
function MetricCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { trackPageView, trackClick } = useTracking();
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // Fetch analytics data
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: DashboardMetrics;
    eventCount: number;
  }>(`/api/admin/analytics?range=${timeRange}`, fetcher, {
    refreshInterval: 60000, // Refresh every minute
  });

  // Track page view
  useEffect(() => {
    trackPageView('/admin', document.referrer);
  }, [trackPageView]);

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    } else if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  const handleRefresh = () => {
    trackClick('refresh_analytics', '/admin');
    mutate();
  };

  const handleExport = () => {
    trackClick('export_csv', '/admin');
    window.open(`/api/admin/export?range=${timeRange}`, '_blank');
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    trackClick(`time_range_${range}`, '/admin');
    setTimeRange(range);
  };

  // Loading state
  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const metrics = data?.data;

  // Format funnel data for chart
  const funnelData = metrics
    ? [
        { name: 'Product Views', value: metrics.conversionFunnel.views, fill: 'hsl(var(--chart-1))' },
        { name: 'Add to Cart', value: metrics.conversionFunnel.addToCart, fill: 'hsl(var(--chart-2))' },
        { name: 'Checkout Start', value: metrics.conversionFunnel.checkoutStart, fill: 'hsl(var(--chart-3))' },
        { name: 'Purchase', value: metrics.conversionFunnel.purchaseComplete, fill: 'hsl(var(--chart-4))' },
      ]
    : [];

  // Format dwell time display
  const formatDwellTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Store
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back, {user?.name}. Here&apos;s your store performance.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Range Selector */}
            <div className="flex rounded-lg border border-border bg-card p-1">
              {(['24h', '7d', '30d'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            Failed to load analytics data. Please try again.
          </div>
        )}

        {/* Metrics Grid */}
        {metrics && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Sessions"
                value={metrics.totalSessions}
                icon={Users}
                description={`In the last ${timeRange}`}
              />
              <MetricCard
                title="Unique Visitors"
                value={metrics.uniqueVisitors}
                icon={Eye}
                description="Logged-in users"
              />
              <MetricCard
                title="Cart Additions"
                value={metrics.conversionFunnel.addToCart}
                icon={ShoppingCart}
              />
              <MetricCard
                title="Completed Purchases"
                value={metrics.conversionFunnel.purchaseComplete}
                icon={TrendingUp}
              />
            </div>

            {/* Charts Row */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Page Views Chart */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Top Pages
                </h3>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.pageViews}
                      layout="vertical"
                      margin={{ left: 80, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis
                        type="category"
                        dataKey="page"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Conversion Funnel
                </h3>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Funnel dataKey="value" data={funnelData} isAnimationActive>
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList
                          position="right"
                          fill="hsl(var(--foreground))"
                          stroke="none"
                          dataKey="name"
                        />
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Data Tables Row */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Product Engagement */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Eye className="h-5 w-5 text-primary" />
                  Product Engagement
                </h3>
                {metrics.productEngagement.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No product views tracked yet.
                  </p>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-3 text-left font-medium text-muted-foreground">
                            Product
                          </th>
                          <th className="pb-3 text-right font-medium text-muted-foreground">
                            Views
                          </th>
                          <th className="pb-3 text-right font-medium text-muted-foreground">
                            Avg. Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {metrics.productEngagement.map((item) => (
                          <tr key={item.productId}>
                            <td className="py-3 font-medium">{item.productName}</td>
                            <td className="py-3 text-right">{item.views}</td>
                            <td className="py-3 text-right text-muted-foreground">
                              {formatDwellTime(item.avgDwellTime)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Click Heatmap */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <MousePointer className="h-5 w-5 text-primary" />
                  Interaction Heatmap
                </h3>
                {metrics.clickHeatmap.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No click data tracked yet.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {metrics.clickHeatmap.map((item) => {
                      const maxCount = metrics.clickHeatmap[0]?.count || 1;
                      const intensity = Math.min(1, item.count / maxCount);
                      return (
                        <div
                          key={item.target}
                          className="rounded-md border border-border px-3 py-2"
                          style={{
                            backgroundColor: `rgba(var(--chart-1), ${0.1 + intensity * 0.4})`,
                          }}
                        >
                          <p className="text-xs font-medium">{item.target}</p>
                          <p className="text-lg font-bold">{item.count}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Auth Activity */}
            <div className="mt-8">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <LogIn className="h-5 w-5 text-primary" />
                  Authentication Activity
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-md border border-border bg-secondary/50 p-4">
                    <p className="text-sm text-muted-foreground">Successful Logins</p>
                    <p className="mt-1 text-2xl font-bold">{metrics.authActivity.logins}</p>
                  </div>
                  <div className="rounded-md border border-border bg-secondary/50 p-4">
                    <p className="text-sm text-muted-foreground">Logouts</p>
                    <p className="mt-1 text-2xl font-bold">{metrics.authActivity.logouts}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-8 text-center text-xs text-muted-foreground">
              <p>
                Data is aggregated server-side from local log files. Total events in range:{' '}
                <span className="font-medium">{data?.eventCount || 0}</span>
              </p>
              <p className="mt-1">
                Logs are stored in <code className="rounded bg-secondary px-1">./logs/</code>{' '}
                directory as daily JSON files.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
