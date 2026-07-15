'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
} from 'recharts'
import { BarChart3, PieChart as PieIcon } from 'lucide-react'
import { ChartCard } from '../ChartCard'
import type { InterestAnalytics } from './interests.types'

const PALETTE = ['#6366f1', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899']

function ChartTooltip({
  active,
  payload,
  label,
  unit = '',
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string; payload?: Record<string, unknown> }>
  label?: string
  unit?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      {label != null && <p className="mb-1 font-semibold text-slate-700">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5 text-slate-600">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold text-slate-800">{p.value}{unit}</span>
        </p>
      ))}
    </div>
  )
}

interface InterestAnalyticsProps {
  analytics: InterestAnalytics
  loading?: boolean
  className?: string
}

export function InterestAnalytics({ analytics, loading = false, className }: InterestAnalyticsProps) {
  const { topProducts, topCategories, dailyTrend, scoreDistribution, marketingConversion, rentalConversion } =
    analytics

  const hasData =
    topProducts.length || topCategories.length || dailyTrend.some((d) => d.count > 0)

  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-900">Interest Analytics</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Top Interested Products"
          description="Most detected products by customer count"
          loading={loading}
          height={260}
        >
          {topProducts.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                />
                <RTooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" name="Customers" radius={[0, 6, 6, 0]} fill="#6366f1" barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty label="No product signals detected" />
          )}
        </ChartCard>

        <ChartCard
          title="Highest Interest Categories"
          description="Category engagement distribution"
          loading={loading}
          height={260}
        >
          {topCategories.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topCategories} margin={{ left: 0, right: 16, top: 8 }}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={48} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RTooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" name="Interests" radius={[6, 6, 0, 0]}>
                  {topCategories.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty label="No category data" />
          )}
        </ChartCard>

        <ChartCard
          title="Daily Interest Trend"
          description="Detections over the last 7 days"
          loading={loading}
          height={260}
        >
          {dailyTrend.some((d) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyTrend} margin={{ left: -16, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="interestTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RTooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Detections"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#interestTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Empty label="No trend data for the selected range" />
          )}
        </ChartCard>

        <ChartCard
          title="Interest Score Distribution"
          description="Customers by intent tier"
          loading={loading}
          height={260}
        >
          {scoreDistribution.some((b) => b.count > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {scoreDistribution.map((b) => (
                    <Cell key={b.tier} fill={b.color} />
                  ))}
                </Pie>
                <RTooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => <span className="text-slate-500">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty label="No scores to distribute" />
          )}
        </ChartCard>

        <ChartCard
          title="Marketing Conversion"
          description="Triggered vs not triggered"
          loading={loading}
          height={240}
        >
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={marketingConversion} dataKey="value" nameKey="label" innerRadius={50} outerRadius={85} paddingAngle={2}>
                <Cell fill="#10b981" />
                <Cell fill="#e2e8f0" />
              </Pie>
              <RTooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => <span className="text-slate-500">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Rental Conversion"
          description="Converted vs in-progress intent"
          loading={loading}
          height={240}
        >
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={rentalConversion} dataKey="value" nameKey="label" innerRadius={50} outerRadius={85} paddingAngle={2}>
                <Cell fill="#f97316" />
                <Cell fill="#e2e8f0" />
              </Pie>
              <RTooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => <span className="text-slate-500">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {!hasData && !loading && (
        <p className="mt-2 text-center text-xs text-slate-400">
          Analytics will populate as behavioral signals are captured.
        </p>
      )}
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <PieIcon className="mb-2 h-8 w-8 text-slate-300" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}

export default InterestAnalytics
