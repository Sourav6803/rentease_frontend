'use client'

import { Search, Grid3x3, List, RefreshCw, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

interface InventoryFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  conditionFilter: string
  onConditionFilterChange: (value: string) => void
  locationFilter: string
  onLocationFilterChange: (value: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onRefresh: () => void
  isRefreshing: boolean
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'rented', label: 'Rented' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'retired', label: 'Retired' },
]

const conditionOptions = [
  { value: 'all', label: 'All Conditions' },
  { value: 'new', label: 'New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'damaged', label: 'Damaged' },
]

const locationOptions = [
  { value: 'all', label: 'All Locations' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Kolkata', label: 'Kolkata' },
]

export function InventoryFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  conditionFilter,
  onConditionFilterChange,
  locationFilter,
  onLocationFilterChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  isRefreshing,
}: InventoryFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const activeFiltersCount = [
    statusFilter !== 'all',
    conditionFilter !== 'all',
    locationFilter !== 'all'
  ].filter(Boolean).length

  const clearAllFilters = () => {
    onStatusFilterChange('all')
    onConditionFilterChange('all')
    onLocationFilterChange('all')
  }

  return (
    <Card className="mb-6 border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name, SKU, or serial number..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1 text-[10px]">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              <div className="flex rounded-lg border border-input overflow-hidden">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`p-2 px-3 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`p-2 px-3 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <Button variant="outline" onClick={onRefresh} disabled={isRefreshing} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          {showAdvancedFilters && (
            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <div className="flex-1 min-w-[150px]">
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <Select value={conditionFilter} onValueChange={onConditionFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <Select value={locationFilter} onValueChange={onLocationFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" onClick={clearAllFilters} className="gap-1 text-red-500">
                  <X className="h-4 w-4" />
                  Clear all
                </Button>
              )}
            </div>
          )}
          
          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusOptions.find(o => o.value === statusFilter)?.label}
                  <button onClick={() => onStatusFilterChange('all')} className="ml-1 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {conditionFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Condition: {conditionOptions.find(o => o.value === conditionFilter)?.label}
                  <button onClick={() => onConditionFilterChange('all')} className="ml-1 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {locationFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Location: {locationOptions.find(o => o.value === locationFilter)?.label}
                  <button onClick={() => onLocationFilterChange('all')} className="ml-1 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}