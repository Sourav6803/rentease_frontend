// components/vendor/orders/OrderFilters.tsx
'use client'

import { Search, Calendar, X, Filter } from 'lucide-react'
import { useState } from 'react'

interface OrderFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  dateRange: { start: string; end: string }
  onDateRangeChange: (range: { start: string; end: string }) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export function OrderFilters({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
  hasActiveFilters,
}: OrderFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order ID, product, or customer..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0] bg-[#fafafa]"
          />
        </div>
        
        {/* Date Range */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-[#fafafa] hover:bg-slate-50 transition-colors"
          >
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">
              {dateRange.start && dateRange.end 
                ? `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
                : 'Select Date Range'}
            </span>
          </button>
          
          {showDatePicker && (
            <div className="absolute right-0 top-full mt-2 z-10 bg-white rounded-lg border border-slate-200 shadow-lg p-4 min-w-[300px]">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="w-full px-3 py-2 bg-[#2874f0] text-white rounded-lg text-sm font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center gap-1 bg-[#ebf3fb] text-[#2874f0] text-[11px] font-semibold px-2.5 py-1 rounded-full">
              "{searchTerm}" <button onClick={() => onSearchChange('')}><X className="h-3 w-3" /></button>
            </span>
          )}
          {(dateRange.start || dateRange.end) && (
            <span className="inline-flex items-center gap-1 bg-[#ebf3fb] text-[#2874f0] text-[11px] font-semibold px-2.5 py-1 rounded-full">
              {dateRange.start && dateRange.end 
                ? `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
                : dateRange.start ? `From ${new Date(dateRange.start).toLocaleDateString()}` : `Until ${new Date(dateRange.end).toLocaleDateString()}`
              }
              <button onClick={() => onDateRangeChange({ start: '', end: '' })}><X className="h-3 w-3" /></button>
            </span>
          )}
          <button onClick={onClearFilters} className="text-[11px] text-red-500 hover:underline ml-1">
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}