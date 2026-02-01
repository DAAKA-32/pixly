'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

// ===========================================
// PIXLY - Chart Components
// Premium data visualization
// ===========================================

const COLORS = {
  primary: '#10b981',
  primaryLight: '#6ee7b7',
  secondary: '#3b82f6',
  tertiary: '#f59e0b',
  quaternary: '#ef4444',
  neutral: '#737373',
};

const CHANNEL_COLORS: Record<string, string> = {
  meta: '#1877F2',
  google: '#EA4335',
  tiktok: '#000000',
  linkedin: '#0A66C2',
  bing: '#00809D',
  direct: '#6B7280',
  organic: '#22c55e',
  email: '#8b5cf6',
  referral: '#f59e0b',
  other: '#94a3b8',
};

// Skeleton loader for charts
function ChartSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-neutral-200" />
        <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  );
}

// Empty state for charts
function ChartEmpty({ message = 'Aucune donnée disponible' }: { message?: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <BarChart3 className="mx-auto h-8 w-8 text-neutral-300" />
        <p className="mt-2 text-sm text-neutral-400">{message}</p>
      </div>
    </div>
  );
}

interface RevenueChartProps {
  data: { date: string; revenue: number; spend?: number; conversions?: number }[];
  title?: string;
  isLoading?: boolean;
}

export function RevenueChart({
  data,
  title = 'Revenus par jour',
  isLoading = false,
}: RevenueChartProps) {
  const hasData = data.length > 0 && data.some(d => d.revenue > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <TrendingUp className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">{title}</h3>
            <p className="text-sm text-neutral-500">Évolution du chiffre d'affaires</p>
          </div>
        </div>

        {hasData && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary-500" />
              <span className="text-xs text-neutral-500">Revenus</span>
            </div>
            {data[0]?.conversions !== undefined && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs text-neutral-500">Conversions</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-72">
        {isLoading ? (
          <ChartSkeleton />
        ) : !hasData ? (
          <ChartEmpty message="Aucun revenu sur cette période" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value, 'EUR')}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  padding: '12px 16px',
                }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? formatCurrency(value) : value,
                  name === 'revenue' ? 'Revenus' : 'Conversions'
                ]}
                labelStyle={{ color: '#6b7280', marginBottom: '8px' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.primary}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

interface ChannelBreakdownProps {
  data: {
    channel: string;
    label?: string;
    value: number;
    percentage: number;
    color?: string;
    conversions?: number;
  }[];
  title?: string;
  isLoading?: boolean;
}

export function ChannelBreakdown({
  data,
  title = 'Répartition par canal',
  isLoading = false,
}: ChannelBreakdownProps) {
  const hasData = data.length > 0 && data.some(d => d.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
          <PieChartIcon className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900">{title}</h3>
          <p className="text-sm text-neutral-500">Distribution des revenus</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64">
          <ChartSkeleton />
        </div>
      ) : !hasData ? (
        <div className="h-64">
          <ChartEmpty message="Aucune donnée par canal" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Donut Chart */}
          <div className="mx-auto h-40 w-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  dataKey="value"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.channel}
                      fill={entry.color || CHANNEL_COLORS[entry.channel] || COLORS.neutral}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {data.slice(0, 5).map((item) => (
              <div key={item.channel} className="flex items-center gap-3">
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{
                    backgroundColor: item.color || CHANNEL_COLORS[item.channel] || COLORS.neutral,
                  }}
                />
                <span className="flex-1 truncate text-sm font-medium text-neutral-700">
                  {item.label || item.channel}
                </span>
                <span className="text-sm font-semibold text-neutral-900">
                  {formatCurrency(item.value)}
                </span>
                <span className="w-12 text-right text-xs text-neutral-500">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
            {data.length > 5 && (
              <p className="text-center text-xs text-neutral-400">
                +{data.length - 5} autres canaux
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface ConversionsChartProps {
  data: { date: string; conversions: number; value?: number }[];
  title?: string;
  isLoading?: boolean;
}

export function ConversionsChart({
  data,
  title = 'Conversions par jour',
  isLoading = false,
}: ConversionsChartProps) {
  const hasData = data.length > 0 && data.some(d => d.conversions > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <BarChart3 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900">{title}</h3>
          <p className="text-sm text-neutral-500">Nombre de conversions</p>
        </div>
      </div>

      <div className="h-64">
        {isLoading ? (
          <ChartSkeleton />
        ) : !hasData ? (
          <ChartEmpty message="Aucune conversion sur cette période" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  padding: '12px 16px',
                }}
                formatter={(value: number) => [formatNumber(value), 'Conversions']}
              />
              <Bar
                dataKey="conversions"
                fill={COLORS.secondary}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
