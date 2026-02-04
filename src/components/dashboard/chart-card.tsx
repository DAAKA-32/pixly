'use client';

import { useState, useEffect } from 'react';
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
import { BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

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

function ChartSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-2.5">
        <div className="h-6 w-6 animate-pulse rounded-md bg-neutral-100" />
        <div className="h-2.5 w-20 animate-pulse rounded bg-neutral-100" />
      </div>
    </div>
  );
}

function ChartEmpty({ message = 'Aucune donnée disponible' }: { message?: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <BarChart3 className="mx-auto h-6 w-6 text-neutral-200" />
        <p className="mt-2 text-[13px] text-neutral-400">{message}</p>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-neutral-100 bg-white px-4 py-3 shadow-medium">
      <p className="mb-1.5 text-[11px] font-medium text-neutral-400">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[13px] font-semibold tabular-nums text-neutral-900">
            {entry.name === 'revenue'
              ? formatCurrency(entry.value)
              : formatNumber(entry.value)}
          </span>
          <span className="text-[11px] text-neutral-400">
            {entry.name === 'revenue' ? 'Revenus' : 'Conversions'}
          </span>
        </div>
      ))}
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
  title = 'Revenus',
  isLoading = false,
}: RevenueChartProps) {
  const [mounted, setMounted] = useState(false);
  const hasData = data.length > 0 && data.some(d => d.revenue > 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  const Wrapper = mounted ? motion.div : 'div';
  const wrapperProps = mounted ? {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-6"
    >
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <h3 className="text-[13px] font-medium text-neutral-500">{title}</h3>
          {hasData && (
            <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
              {formatCurrency(totalRevenue)}
            </p>
          )}
        </div>
        {hasData && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-neutral-400">Revenus</span>
            </div>
          </div>
        )}
      </div>

      <div className="h-64">
        {isLoading ? (
          <ChartSkeleton />
        ) : !hasData ? (
          <ChartEmpty message="Aucun revenu sur cette période" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="0"
                stroke="#f5f5f5"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#a3a3a3' }}
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#a3a3a3' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return `${value}`;
                }}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e5e5', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.primary}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="revenue"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: COLORS.primary }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Wrapper>
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
  title = 'Canaux',
  isLoading = false,
}: ChannelBreakdownProps) {
  const [mounted, setMounted] = useState(false);
  const hasData = data.length > 0 && data.some(d => d.value > 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const Wrapper = mounted ? motion.div : 'div';
  const wrapperProps = mounted ? {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-6"
    >
      <h3 className="mb-5 text-[13px] font-medium text-neutral-500">{title}</h3>

      {isLoading ? (
        <div className="h-64">
          <ChartSkeleton />
        </div>
      ) : !hasData ? (
        <div className="h-64">
          <ChartEmpty message="Aucune donnée par canal" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Donut */}
          <div className="mx-auto h-36 w-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  dataKey="value"
                  paddingAngle={2}
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

          {/* Channel list */}
          <div className="space-y-2.5">
            {data.slice(0, 5).map((item) => {
              const color = item.color || CHANNEL_COLORS[item.channel] || COLORS.neutral;
              return (
                <div key={item.channel} className="group flex items-center gap-3">
                  <div
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="flex-1 truncate text-[13px] text-neutral-600">
                    {item.label || item.channel}
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums text-neutral-900">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="w-10 text-right text-[11px] tabular-nums text-neutral-400">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
            {data.length > 5 && (
              <p className="pt-1 text-center text-[11px] text-neutral-400">
                +{data.length - 5} autres
              </p>
            )}
          </div>
        </div>
      )}
    </Wrapper>
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
  const [mounted, setMounted] = useState(false);
  const hasData = data.length > 0 && data.some(d => d.conversions > 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const Wrapper = mounted ? motion.div : 'div';
  const wrapperProps = mounted ? {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-6"
    >
      <h3 className="mb-5 text-[13px] font-medium text-neutral-500">{title}</h3>

      <div className="h-56">
        {isLoading ? (
          <ChartSkeleton />
        ) : !hasData ? (
          <ChartEmpty message="Aucune conversion sur cette période" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" stroke="#f5f5f5" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#a3a3a3' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#a3a3a3' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #f0f0f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px -2px rgba(0,0,0,0.08)',
                  padding: '10px 14px',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [formatNumber(value), 'Conversions']}
              />
              <Bar
                dataKey="conversions"
                fill={COLORS.secondary}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Wrapper>
  );
}
