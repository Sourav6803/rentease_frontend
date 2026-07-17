

// contexts/VendorAnalyticsContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { message } from 'antd';
import { Period, VendorOverview, SalesReport, ProductPerformance, CustomerInsights, ApiResponse} from '@/types/vendorAnalytics';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'


interface VendorAnalyticsContextType {
  loading: boolean;
  period: Period;
  setPeriod: (period: Period) => void;
  overview: VendorOverview | null;
  salesReport: SalesReport | null;
  productPerformance: ProductPerformance | null;
  customerInsights: CustomerInsights | null;
  error: string | null;
  fetchOverview: () => Promise<VendorOverview | undefined>;
  fetchSalesReport: () => Promise<SalesReport | undefined>;
  fetchProductPerformance: () => Promise<ProductPerformance | undefined>;
  fetchCustomerInsights: () => Promise<CustomerInsights | undefined>;
  fetchAllData: () => Promise<void>;
  clearError: () => void;
}

interface VendorAnalyticsProviderProps {
  children: ReactNode;
  vendorId: string;
}

const VendorAnalyticsContext = createContext<VendorAnalyticsContextType | undefined>(undefined);

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export const useVendorAnalytics = (): VendorAnalyticsContextType => {
  const context = useContext(VendorAnalyticsContext);
  if (!context) {
    throw new Error('useVendorAnalytics must be used within VendorAnalyticsProvider');
  }
  return context;
};

export const VendorAnalyticsProvider: React.FC<VendorAnalyticsProviderProps> = ({ 
  children, 
  vendorId 
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [period, setPeriod] = useState<Period>('30d');
  const [overview, setOverview] = useState<VendorOverview | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance | null>(null);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  useEffect(() => {
      if (sessionStatus === 'unauthenticated') {
        router.push('/vendor/login')
      }
      // if (sessionStatus === 'authenticated') {
      //   fetchVendorStatus()
      // }
    }, [sessionStatus])

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleApiError = useCallback((err: unknown) => {
    const axiosError = err as AxiosError<ApiResponse>;
    const errorMessage = axiosError.response?.data?.message || 'An error occurred. Please try again.';
    setError(errorMessage);
    message.error(errorMessage);
    console.error('API Error:', err);
  }, []);

  const fetchOverview = useCallback(async (): Promise<VendorOverview | undefined> => {
    try {
      const response = await axios.get<ApiResponse<VendorOverview>>(`${BASE_URL}/api/v1/vendor/analytics/overview`, {
        params: { vendorId, period },
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      });
      const data = response.data.data;
      setOverview(data);
      return data;
    } catch (err) {
      handleApiError(err);
      return undefined;
    }
  }, [vendorId, period, handleApiError]);

  const fetchSalesReport = useCallback(async (): Promise<SalesReport | undefined> => {
    try {
      const response = await axios.get<ApiResponse<SalesReport>>(`${BASE_URL}/api/v1/vendor/analytics/sales`, {
        params: { vendorId, period },
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      });
      const data = response.data.data;
      setSalesReport(data);
      return data;
    } catch (err) {
      handleApiError(err);
      return undefined;
    }
  }, [vendorId, period, handleApiError]);

  const fetchProductPerformance = useCallback(async (): Promise<ProductPerformance | undefined> => {
    try {
      const response = await axios.get<ApiResponse<ProductPerformance>>(`${BASE_URL}/api/v1/vendor/analytics/products`, {
        params: { vendorId, period, limit: 10 },
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      });
      const data = response.data.data;
      setProductPerformance(data);
      return data;
    } catch (err) {
      handleApiError(err);
      return undefined;
    }
  }, [vendorId, period, handleApiError]);

  const fetchCustomerInsights = useCallback(async (): Promise<CustomerInsights | undefined> => {
    try {
      const response = await axios.get<ApiResponse<CustomerInsights>>(`${BASE_URL}/api/v1/vendor/analytics/customers`, {
        params: { vendorId, period },
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      });
      const data = response.data.data;
      setCustomerInsights(data);
      return data;
    } catch (err) {
      handleApiError(err);
      return undefined;
    }
  }, [vendorId, period, handleApiError]);

  const fetchAllData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchOverview(),
        fetchSalesReport(),
        fetchProductPerformance(),
        fetchCustomerInsights()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchOverview, fetchSalesReport, fetchProductPerformance, fetchCustomerInsights]);

  const value: VendorAnalyticsContextType = {
    loading,
    period,
    setPeriod,
    overview,
    salesReport,
    productPerformance,
    customerInsights,
    error,
    fetchOverview,
    fetchSalesReport,
    fetchProductPerformance,
    fetchCustomerInsights,
    fetchAllData,
    clearError
  };

  return (
    <VendorAnalyticsContext.Provider value={value}>
      {children}
    </VendorAnalyticsContext.Provider>
  );
};