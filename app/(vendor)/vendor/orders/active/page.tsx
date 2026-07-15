// app/vendor/orders/active/page.tsx - Active Rentals
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Package, Clock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { OrderCard } from '@/components/vendor/orders/OrderCard'
import { OrderFilters } from '@/components/vendor/orders/OrderFilters'
import { Rental } from '../types'
// import { useToast } from '@/hooks/useToast'
// import { useToast } from '@/hooks/useToast'
import { toast } from 'sonner'


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

export default function ActiveRentalsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
//   const { toast } = useToast()
  
  const [rentals, setRentals] = useState<Rental[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  
  const fetchRentals = useCallback(async () => {
    if (status !== 'authenticated') return
    
    try {
      const headers = await getAuthHeaders()
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', '12')
      params.set('status', 'active')
      if (searchTerm) params.set('search', searchTerm)
      if (dateRange.start) params.set('startDate', dateRange.start)
      if (dateRange.end) params.set('endDate', dateRange.end)
      
      const res = await fetch(`${BASE_URL}/api/v1/rentals/vendor/me?${params.toString()}`, { headers })
      const data = await res.json()
      
      if (data.success) {
        setRentals(data.data.rentals || [])
        setTotalPages(data.data.pagination?.pages || 1)
        setTotalOrders(data.data.pagination?.total || 0)
      } else {
        toast.error(data.message || 'Failed to load active rentals')
      }
    } catch (error) {
      toast.error('Failed to load active rentals')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm, dateRange, status, toast])
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchRentals()
    } else if (status === 'unauthenticated') {
      router.push('/vendor/login')
    }
  }, [fetchRentals, status, router])
  
  const handleAction = async (rental: Rental, action: string) => {
    try {
      const headers = await getAuthHeaders()
      let endpoint = ''
      
      switch(action) {
        case 'extend':
          // Handle extension - show modal for months
          toast.info('Extension feature - select months')
          return
        case 'initiate_return':
          endpoint = `/api/v1/rentals/${rental._id}/return/initiate`
          break
        default:
          toast.error(`Action "${action}" not implemented yet`)
          return
      }
      
      const res = await fetch(`${BASE_URL}${endpoint}`, { method: 'POST', headers })
      const data = await res.json()
      
      if (data.success) {
        toast.success(`Action completed successfully`)
        fetchRentals()
      } else {
        toast.error(data.message || 'Action failed')
      }
    } catch (error) {
      toast.error('Failed to perform action')
    }
  }
  
  const hasActiveFilters = searchTerm !== '' || dateRange.start !== '' || dateRange.end !== ''
  
  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-lg">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Active Rentals</h1>
            <p className="text-sm text-slate-500 mt-0.5">{totalOrders} currently active</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Active Rentals Summary</p>
              <p className="text-sm text-green-700">These rentals are currently ongoing. Monitor returns and process extensions.</p>
            </div>
          </div>
        </div>
        
        <OrderFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onClearFilters={() => { setSearchTerm(''); setDateRange({ start: '', end: '' }) }}
          hasActiveFilters={hasActiveFilters}
        />
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : rentals.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <Package className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">No Active Rentals</h3>
            <p className="text-sm text-slate-500 mt-1">Active rentals will appear here once confirmed and delivered.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rentals.map(rental => (
              <OrderCard
                key={rental._id}
                rental={rental}
                onViewDetails={() => {}}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}