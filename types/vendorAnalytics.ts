// types/vendorAnalytics.types.ts
export type Period = '7d' | '30d' | '90d' | '1y';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface RevenueKPI {
  current: number;
  previous: number;
  growth: number;
}

export interface KPIData {
  revenue: RevenueKPI;
  rentals: RevenueKPI;
  activeProducts: number;
  averageRating: number;
  totalCustomers: number;
}

export interface DailyRevenue {
  _id: string;
  amount: number;
  count: number;
}

export interface RevenueByType {
  _id: string;
  amount: number;
  count: number;
}

export interface RevenueOverview {
  total: number;
  daily: DailyRevenue[];
  byType: RevenueByType[];
  byMethod: RevenueByType[];
}

export interface RentalStatus {
  _id: string;
  count: number;
}

export interface RentalOverview {
  total: number;
  uniqueCustomers: number;
  byStatus: RentalStatus[];
  byMonth: MonthlyRental[];
}

export interface MonthlyRental {
  _id: string;
  count: number;
}

export interface ProductOverview {
  total: number;
  active: number;
  outOfStock: number;
  lowStock: number;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface RatingOverview {
  average: number;
  total: number;
  distribution: RatingDistribution;
}

export interface RecentActivity {
  id: string;
  type: string;
  action: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
  time: Date;
}

export interface VendorOverview {
  period: Period;
  kpi: KPIData;
  revenueByDay: DailyRevenue[];
  rentalsByStatus: RentalStatus[];
  recentActivity: RecentActivity[];
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  uniqueCustomers: number;
}

export interface MonthlyTrend {
  _id: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  category: string;
  monthlyRent: number;
  totalRentals: number;
  totalRevenue: number;
  uniqueCustomers: number;
  image?: string;
  views?: number;
  conversionRate?: number;
}

export interface SalesReport {
  period: Period;
  summary: SalesSummary;
  dailyRevenue: DailyRevenue[];
  monthlyTrends: MonthlyTrend[];
  topProducts: TopProduct[];
  revenueByType: RevenueByType[];
  revenueByMethod: RevenueByType[];
}

export interface CategoryBreakdown {
  _id: string;
  totalRentals: number;
  totalRevenue: number;
}

export interface InventoryStatus {
  totalInventory: number;
  availableInventory: number;
  rentedInventory: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  utilizationRate: number;
  
}

export interface ProductPerformance {
  period: Period;
  topProducts: TopProduct[];
  categoryBreakdown: CategoryBreakdown[];
  inventoryStatus: InventoryStatus;
  totalProducts: number;
  activeProducts: number;
}

export interface CustomerSegment {
  vip: Customer[];
  frequent: Customer[];
  regular: Customer[];
  new: Customer[];
}

export interface Customer {
  customerId: string;
  name: string;
  email: string;
  phone?: string;
  totalSpent: number;
  totalRentals: number;
  lastRental: Date;
  firstRental: Date;
  uniqueProducts: number;
}

export interface CustomerInsightsSummary {
  totalCustomers: number;
  repeatCustomers: number;
  repeatRate: number;
  avgLTV: number;
  vipCount: number;
  frequentCount: number;
}

export interface CustomerInsights {
  period: Period;
  summary: CustomerInsightsSummary;
  segments: CustomerSegment;
  topCustomers: Customer[];
  customerList: Customer[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}