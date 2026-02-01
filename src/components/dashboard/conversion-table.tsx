'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import type { Conversion } from '@/types';

// ===========================================
// PIXLY - Conversion Table Component
// Optimized with memoization for performance
// ===========================================

interface ConversionTableProps {
  conversions: Conversion[];
  isLoading?: boolean;
}

const CHANNEL_ICONS: Record<string, string> = {
  meta: '📘',
  google: '🔍',
  tiktok: '🎵',
  linkedin: '💼',
  direct: '🎯',
  organic: '🌱',
  email: '📧',
  referral: '🔗',
};

export function ConversionTable({ conversions, isLoading }: ConversionTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-4 border-b border-neutral-100 py-4"
              >
                <div className="h-10 w-10 rounded-full bg-neutral-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-neutral-200" />
                  <div className="h-3 w-24 rounded bg-neutral-100" />
                </div>
                <div className="h-6 w-20 rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (conversions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="empty-state py-12">
            <div className="empty-state-icon">
              <CheckCircle className="h-full w-full" />
            </div>
            <h3 className="empty-state-title">No conversions yet</h3>
            <p className="empty-state-description">
              Conversions will appear here once your tracking is set up
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Conversions</CardTitle>
        <span className="text-sm text-neutral-500">
          {conversions.length} total
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-neutral-100">
          {conversions.map((conversion, index) => (
            <motion.div
              key={conversion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-neutral-50"
            >
              {/* Channel Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-lg">
                {CHANNEL_ICONS[conversion.attribution?.touchpoints[0]?.channel || 'direct'] || '🎯'}
              </div>

              {/* Conversion Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize text-neutral-900">
                    {conversion.type}
                  </span>
                  <Badge
                    variant={
                      conversion.attribution?.touchpoints[0]?.channel === 'meta'
                        ? 'info'
                        : conversion.attribution?.touchpoints[0]?.channel === 'google'
                        ? 'primary'
                        : 'default'
                    }
                  >
                    {conversion.attribution?.touchpoints[0]?.channel || 'Direct'}
                  </Badge>
                </div>
                <p className="truncate text-sm text-neutral-500">
                  {conversion.attribution?.touchpoints[0]?.campaign || 'No campaign'}
                </p>
              </div>

              {/* Value */}
              <div className="text-right">
                <p className="font-semibold text-neutral-900">
                  {formatCurrency(conversion.value, conversion.currency)}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatRelativeTime(conversion.timestamp)}
                </p>
              </div>

              {/* Sync Status */}
              <div className="flex items-center gap-2">
                <SyncIndicator
                  platform="Meta"
                  synced={conversion.synced?.meta?.synced || false}
                />
                <SyncIndicator
                  platform="Google"
                  synced={conversion.synced?.google?.synced || false}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Memoized sync indicator for better performance
const SyncIndicator = memo(function SyncIndicator({
  platform,
  synced,
}: {
  platform: string;
  synced: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
      title={`${platform}: ${synced ? 'Synced' : 'Pending'}`}
    >
      {synced ? (
        <CheckCircle className="h-3 w-3 text-success" />
      ) : (
        <Clock className="h-3 w-3 text-neutral-400" />
      )}
    </div>
  );
});
