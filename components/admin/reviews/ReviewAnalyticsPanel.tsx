// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { format, subDays } from 'date-fns';
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Cell,
//   Line,
//   LineChart,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip as RechartsTooltip,
//   XAxis,
//   YAxis,
// } from 'recharts';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Label } from '@/components/ui/label';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { StarRating } from './StarRating';
// import { KpiTilesSkeleton } from './AdminReviewsSkeleton';
// import { AdminReviewsEmptyState } from './AdminReviewsEmptyState';
// import { adminReviewsApi } from '@/lib/api/adminReviews';
// import { ZERO_OVERVIEW } from '@/types/reviews.types';
// import { useCountUp } from './useCountUp';

// // Chart series colors. Chosen to echo the status-badge palette used elsewhere in
// // this console (emerald/amber/rose/orange/slate); SVG fills need literal color
// // values rather than Tailwind's token classes, so these are the one deliberate
// // exception to the "no hex" rule in this file.
// const RATING_COLOR = '#f59e0b'; // amber-500
// const SENTIMENT_COLORS: Record<string, string> = {
//   positive: '#10b981', // emerald-500
//   neutral: '#64748b', // slate-500
//   negative: '#f43f5e', // rose-500
//   unscored: '#cbd5e1', // slate-300
// };
// const LINE_COLOR = '#6366f1'; // indigo-500

// function toISODate(d: Date) {
//   return format(d, 'yyyy-MM-dd');
// }

// function KpiTile({ label, value, decimals = 0, suffix = '' }: { label: string; value: number; decimals?: number; suffix?: string }) {
//   const animated = useCountUp(value, 700);
//   return (
//     <Card className="rounded-2xl border-border/60">
//       <CardHeader className="pb-1">
//         <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <span className="text-2xl font-semibold tabular-nums text-foreground">
//           {animated.toFixed(decimals)}
//           {suffix}
//         </span>
//       </CardContent>
//     </Card>
//   );
// }

// export function ReviewAnalyticsPanel() {
//   const [startDate, setStartDate] = useState(() => toISODate(subDays(new Date(), 30)));
//   const [endDate, setEndDate] = useState(() => toISODate(new Date()));
//   const [rangeError, setRangeError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!startDate || !endDate) {
//       setRangeError('Both start and end dates are required.');
//     } else if (startDate > endDate) {
//       setRangeError('Start date must be before end date.');
//     } else {
//       setRangeError(null);
//     }
//   }, [startDate, endDate]);

//   const rangeValid = !rangeError;

//   const { data, isLoading, isError, refetch } = useQuery({
//     queryKey: ['admin-reviews-analytics', startDate, endDate],
//     queryFn: () => adminReviewsApi.getAnalytics({ startDate, endDate }),
//     enabled: rangeValid,
//   });

//   const overview = data?.overview?.[0] ?? ZERO_OVERVIEW;

//   const sentimentData = useMemo(() => {
//     if (!data?.bySentiment) return [];
//     return data.bySentiment.map((s) => ({
//       key: s._id ?? 'unscored',
//       name: s._id ?? 'Unscored',
//       count: s.count,
//     }));
//   }, [data?.bySentiment]);

//   const dailyData = useMemo(() => {
//     if (!data?.daily) return [];
//     return data.daily
//       .map((d) => ({
//         date: new Date(d._id.year, d._id.month - 1, d._id.day),
//         count: d.count,
//         averageRating: d.averageRating,
//       }))
//       .sort((a, b) => a.date.getTime() - b.date.getTime())
//       .map((d) => ({ ...d, label: format(d.date, 'MMM d') }));
//   }, [data?.daily]);

//   const hasAnyData = (data?.byRating.length ?? 0) > 0 || (data?.bySentiment.length ?? 0) > 0 || (data?.daily.length ?? 0) > 0;

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-wrap items-end gap-3">
//         <div className="space-y-1">
//           <Label htmlFor="analytics-start">From</Label>
//           <input
//             id="analytics-start"
//             type="date"
//             value={startDate}
//             max={endDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//           />
//         </div>
//         <div className="space-y-1">
//           <Label htmlFor="analytics-end">To</Label>
//           <input
//             id="analytics-end"
//             type="date"
//             value={endDate}
//             min={startDate}
//             max={toISODate(new Date())}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//           />
//         </div>
//         {rangeError && <p className="text-xs text-rose-500">{rangeError}</p>}
//       </div>

//       {!rangeValid ? (
//         <AdminReviewsEmptyState kind="analytics-empty" />
//       ) : isLoading ? (
//         <KpiTilesSkeleton count={8} />
//       ) : isError ? (
//         <AdminReviewsEmptyState kind="error" onRetry={() => refetch()} />
//       ) : !hasAnyData ? (
//         <AdminReviewsEmptyState kind="analytics-empty" />
//       ) : (
//         <>
//           <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
//             <KpiTile label="Total reviews" value={overview.totalReviews} />
//             <KpiTile label="Approved" value={overview.approvedReviews} />
//             <KpiTile label="Pending" value={overview.pendingReviews} />
//             <KpiTile label="Rejected" value={overview.rejectedReviews} />
//             <KpiTile label="Flagged" value={overview.flaggedReviews} />
//             <KpiTile label="Avg rating" value={overview.averageRating} decimals={2} />
//             <KpiTile label="Helpful votes" value={overview.totalHelpful} />
//             <KpiTile label="Reports" value={overview.totalReports} />
//           </div>

//           <div className="grid gap-4 lg:grid-cols-2">
//             <Card className="rounded-2xl border-border/60">
//               <CardHeader>
//                 <CardTitle className="text-sm font-semibold">Rating distribution</CardTitle>
//               </CardHeader>
//               <CardContent className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={data?.byRating ?? []}>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
//                     <XAxis dataKey="_id" tickFormatter={(v) => `${v}★`} tick={{ fontSize: 12 }} />
//                     <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
//                     <RechartsTooltip formatter={(value: number) => [value, 'Reviews']} labelFormatter={(v) => `${v} star${v === 1 ? '' : 's'}`} />
//                     <Bar dataKey="count" fill={RATING_COLOR} radius={[6, 6, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>

//             <Card className="rounded-2xl border-border/60">
//               <CardHeader>
//                 <CardTitle className="text-sm font-semibold">Sentiment</CardTitle>
//               </CardHeader>
//               <CardContent className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie data={sentimentData} dataKey="count" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
//                       {sentimentData.map((entry) => (
//                         <Cell key={entry.key} fill={SENTIMENT_COLORS[entry.key] ?? SENTIMENT_COLORS.unscored} />
//                       ))}
//                     </Pie>
//                     <RechartsTooltip formatter={(value: number, name: string) => [value, name]} />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>

//             <Card className="rounded-2xl border-border/60 lg:col-span-2">
//               <CardHeader>
//                 <CardTitle className="text-sm font-semibold">Reviews over time</CardTitle>
//               </CardHeader>
//               <CardContent className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={dailyData}>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
//                     <XAxis dataKey="label" tick={{ fontSize: 12 }} />
//                     <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
//                     <RechartsTooltip
//                       formatter={(value: number, name) => [value, name === 'count' ? 'Reviews' : name]}
//                     />
//                     <Line type="monotone" dataKey="count" stroke={LINE_COLOR} strokeWidth={2} dot={false} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//           </div>

//           <Card className="rounded-2xl border-border/60">
//             <CardHeader>
//               <CardTitle className="text-sm font-semibold">Top products by review volume</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Product</TableHead>
//                     <TableHead className="text-right">Reviews</TableHead>
//                     <TableHead className="text-right">Avg rating</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {(data?.topProducts ?? []).map((p) => (
//                     <TableRow key={p._id}>
//                       <TableCell className="font-medium">{p.productName}</TableCell>
//                       <TableCell className="text-right tabular-nums">{p.count}</TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex items-center justify-end gap-2">
//                           <StarRating value={p.averageRating} size="sm" />
//                           <span className="tabular-nums text-muted-foreground">{p.averageRating.toFixed(2)}</span>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </>
//       )}
//     </div>
//   );
// }

// export default ReviewAnalyticsPanel;



'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StarRating } from './StarRating';
import { KpiTilesSkeleton } from './AdminReviewsSkeleton';
import { AdminReviewsEmptyState } from './AdminReviewsEmptyState';
import { adminReviewsApi } from '@/lib/api/adminReviews';
import { ZERO_OVERVIEW } from '@/types/reviews.types';
import { useCountUp } from './useCountUp';

// Chart series colors. Chosen to echo the status-badge palette used elsewhere in
// this console (emerald/amber/rose/orange/slate); SVG fills need literal color
// values rather than Tailwind's token classes, so these are the one deliberate
// exception to the "no hex" rule in this file.
const RATING_COLOR = '#f59e0b'; // amber-500
const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10b981', // emerald-500
  neutral: '#64748b', // slate-500
  negative: '#f43f5e', // rose-500
  unscored: '#cbd5e1', // slate-300
};
const LINE_COLOR = '#6366f1'; // indigo-500

function toISODate(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

function KpiTile({ label, value, decimals = 0, suffix = '' }: { label: string; value: number; decimals?: number; suffix?: string }) {
  const animated = useCountUp(value, 700);
  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-2xl font-semibold tabular-nums text-foreground">
          {animated.toFixed(decimals)}
          {suffix}
        </span>
      </CardContent>
    </Card>
  );
}

export function ReviewAnalyticsPanel() {
  const [startDate, setStartDate] = useState(() => toISODate(subDays(new Date(), 30)));
  const [endDate, setEndDate] = useState(() => toISODate(new Date()));
  const [rangeError, setRangeError] = useState<string | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) {
      setRangeError('Both start and end dates are required.');
    } else if (startDate > endDate) {
      setRangeError('Start date must be before end date.');
    } else {
      setRangeError(null);
    }
  }, [startDate, endDate]);

  const rangeValid = !rangeError;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-reviews-analytics', startDate, endDate],
    queryFn: () => adminReviewsApi.getAnalytics({ startDate, endDate }),
    enabled: rangeValid,
  });

  const overview = data?.overview?.[0] ?? ZERO_OVERVIEW;

  const sentimentData = useMemo(() => {
    if (!data?.bySentiment) return [];
    return data.bySentiment.map((s) => ({
      key: s._id ?? 'unscored',
      name: s._id ?? 'Unscored',
      count: s.count,
    }));
  }, [data?.bySentiment]);

  const dailyData = useMemo(() => {
    if (!data?.daily) return [];
    return data.daily
      .map((d) => ({
        date: new Date(d._id.year, d._id.month - 1, d._id.day),
        count: d.count,
        averageRating: d.averageRating,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((d) => ({ ...d, label: format(d.date, 'MMM d') }));
  }, [data?.daily]);

  const hasAnyData = (data?.byRating.length ?? 0) > 0 || (data?.bySentiment.length ?? 0) > 0 || (data?.daily.length ?? 0) > 0;

  // Helper formatters that handle undefined values
  const formatTooltipValue = (value: number | undefined | string, name: string) => {
    if (value === undefined || value === null) {
      return [0, name];
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return [numValue, name];
  };

  const formatStarLabel = (value: number | undefined) => {
    if (value === undefined || value === null) return '0★';
    return `${value}★`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="analytics-start">From</Label>
          <input
            id="analytics-start"
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="analytics-end">To</Label>
          <input
            id="analytics-end"
            type="date"
            value={endDate}
            min={startDate}
            max={toISODate(new Date())}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {rangeError && <p className="text-xs text-rose-500">{rangeError}</p>}
      </div>

      {!rangeValid ? (
        <AdminReviewsEmptyState kind="analytics-empty" />
      ) : isLoading ? (
        <KpiTilesSkeleton count={8} />
      ) : isError ? (
        <AdminReviewsEmptyState kind="error" onRetry={() => refetch()} />
      ) : !hasAnyData ? (
        <AdminReviewsEmptyState kind="analytics-empty" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiTile label="Total reviews" value={overview.totalReviews} />
            <KpiTile label="Approved" value={overview.approvedReviews} />
            <KpiTile label="Pending" value={overview.pendingReviews} />
            <KpiTile label="Rejected" value={overview.rejectedReviews} />
            <KpiTile label="Flagged" value={overview.flaggedReviews} />
            <KpiTile label="Avg rating" value={overview.averageRating} decimals={2} />
            <KpiTile label="Helpful votes" value={overview.totalHelpful} />
            <KpiTile label="Reports" value={overview.totalReports} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-2xl border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Rating distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.byRating ?? []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                    <XAxis 
                      dataKey="_id" 
                      tickFormatter={(value) => formatStarLabel(value)} 
                      tick={{ fontSize: 12 }} 
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip 
                      formatter={(value, name, item) => {
                        const numValue = typeof value === 'number' ? value : 0;
                        return [numValue, 'Reviews'];
                      }}
                      labelFormatter={(label) => {
                        const starLabel = typeof label === 'number' ? `${label} star${label === 1 ? '' : 's'}` : String(label);
                        return starLabel;
                      }}
                    />
                    <Bar dataKey="count" fill={RATING_COLOR} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Sentiment</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentimentData} dataKey="count" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                      {sentimentData.map((entry) => (
                        <Cell key={entry.key} fill={SENTIMENT_COLORS[entry.key] ?? SENTIMENT_COLORS.unscored} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value, name) => {
                        const numValue = typeof value === 'number' ? value : 0;
                        return [numValue, name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/60 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Reviews over time</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      formatter={(value, name) => {
                        const numValue = typeof value === 'number' ? value : 0;
                        const label = name === 'count' ? 'Reviews' : String(name);
                        return [numValue, label];
                      }}
                    />
                    <Line type="monotone" dataKey="count" stroke={LINE_COLOR} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Top products by review volume</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Reviews</TableHead>
                    <TableHead className="text-right">Avg rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.topProducts ?? []).map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">{p.productName}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.count}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <StarRating value={p.averageRating} size="sm" />
                          <span className="tabular-nums text-muted-foreground">{p.averageRating.toFixed(2)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default ReviewAnalyticsPanel;
