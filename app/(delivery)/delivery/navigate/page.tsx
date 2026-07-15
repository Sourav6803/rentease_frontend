'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Navigation2,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  Package,
  WifiOff,
  RefreshCw,
  TrendingUp,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Truck,
  Signal,
  ChevronUp,
  ChevronDown,
  Calendar,
  CircleDot,
  Route,
  ExternalLink,
} from 'lucide-react'
import { useDeliveryTracking } from '@/lib/hooks/useDeliveryTracking'
import { deliveryPartnerApi, type NavigateData, type PartnerDelivery } from '@/lib/api/delivery'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

const MapComponent = dynamic(() => import('@/components/delivery/map/DeliveryMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#0e0500] flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-orange-200/70 text-sm font-medium">Loading map…</p>
      </div>
    </div>
  ),
})

const PRIORITY_STYLES: Record<string, string> = {
  urgent: 'bg-red-500/15 text-red-400 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

const STATUS_STYLES: Record<string, string> = {
  assigned: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  batched: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  out_for_delivery: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  in_transit: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  reached: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
}

function formatETA(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(minutes?: number) {
  if (!minutes) return '—'
  if (minutes < 60) return `${Math.round(minutes)} min`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

export default function NavigatePage() {
  const router = useRouter()
  const toast = useToast()

  const [navigateData, setNavigateData] = useState<NavigateData | null>(null)
  const [selectedStop, setSelectedStop] = useState<PartnerDelivery | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null)
  const [gpsPermission, setGpsPermission] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isSheetExpanded, setIsSheetExpanded] = useState(true)
  const [partnerCurrentLocation, setPartnerCurrentLocation] = useState<[number, number] | null>(null)
  const [isStartingDelivery, setIsStartingDelivery] = useState(false)
  const [isMarkingArrived, setIsMarkingArrived] = useState(false)

  const watchIdRef = useRef<number | null>(null)
  const locationRef = useRef<[number, number] | null>(null)
  const selectedStopRef = useRef<PartnerDelivery | null>(null)
  const onDutyRef = useRef(false)

  selectedStopRef.current = selectedStop
  locationRef.current = partnerCurrentLocation
  onDutyRef.current = navigateData?.isOnDuty ?? false

  const refreshNavigateData = useCallback(async () => {
    setRefreshing(true)
    try {
      const response = await deliveryPartnerApi.getNavigate()
      if (response.success && response.data) {
        const data = response.data
        const sortedStops = [...(data.activeStops || [])].sort(
          (a, b) => (a.optimizedSequence || 999) - (b.optimizedSequence || 999),
        )
        setNavigateData({ ...data, activeStops: sortedStops })
        setIsOffline(false)

        if (data.partnerLocation?.coordinates) {
          setPartnerCurrentLocation(data.partnerLocation.coordinates)
        }

        const currentId = selectedStopRef.current?._id
        if (currentId) {
          const updated = sortedStops.find((s) => s._id === currentId)
          if (updated) setSelectedStop(updated)
        } else if (sortedStops.length > 0) {
          setSelectedStop(sortedStops[0])
        }
      }
    } catch (error) {
      console.error('Failed to refresh navigate data:', error)
      setIsOffline(true)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }, [])

  const { isSocketReady, pushLocation } = useDeliveryTracking({
    deliveryId: selectedStop?._id,
    onPartnerLocation: (payload) => {
      if (payload.currentLocation?.coordinates) {
        setPartnerCurrentLocation(payload.currentLocation.coordinates)
      }
    },
    onDeliveryLocation: (payload) => {
      if (payload.deliveryId !== selectedStopRef.current?._id) return
      if (payload.estimatedArrival) {
        setSelectedStop((prev) =>
          prev
            ? {
                ...prev,
                tracking: { ...prev.tracking, estimatedArrival: payload.estimatedArrival },
              }
            : prev,
        )
      }
    },
    onDeliveryStatus: (payload) => {
      if (payload.deliveryId === selectedStopRef.current?._id) {
        toast.success(`Status: ${payload.status?.replace(/_/g, ' ')}`)
        refreshNavigateData()
      }
    },
  })

  const pushGpsToServer = useCallback(
    async (lat: number, lng: number, speed?: number, accuracy?: number) => {
      if (!onDutyRef.current) return
      try {
        await deliveryPartnerApi.updateLocation(lat, lng, speed, undefined, accuracy)
        if (isSocketReady) {
          await pushLocation(lat, lng, speed, undefined, accuracy)
        }
      } catch {
        // silent — will retry on next interval
      }
    },
    [isSocketReady, pushLocation],
  )

  const startGpsTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('GPS is not supported on this device')
      setGpsPermission(false)
      return
    }

    if (watchIdRef.current != null) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, accuracy } = position.coords
        setGpsAccuracy(accuracy)
        setGpsPermission(true)
        const coords: [number, number] = [longitude, latitude]
        setPartnerCurrentLocation(coords)
        locationRef.current = coords
      },
      () => {
        setGpsPermission(false)
        toast.error('GPS permission denied. Enable location for navigation.')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    )
  }, [toast])

  const stopGpsTracking = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  const goOnDuty = useCallback(async () => {
    try {
      const response = await deliveryPartnerApi.updateAvailability({ isAvailable: true, isOnDuty: true })
      if (response.success) {
        toast.success('You are now on duty')
        setLoading(true)
        await refreshNavigateData()
        startGpsTracking()
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Please try again'
      toast.error(msg)
    }
  }, [refreshNavigateData, startGpsTracking, toast])

  const optimizeRoute = useCallback(async () => {
    if (!navigateData) return
    setIsOptimizing(true)
    try {
      const ids = navigateData.activeStops.map((s) => s._id)
      const response = await deliveryPartnerApi.optimizeRoute(ids)
      if (response.success && response.data) {
        const { optimizedOrder, totalDistance, estimatedTime } = response.data
        const orderMap = new Map(optimizedOrder.map((o) => [o.deliveryId, o.sequence]))
        const updated = navigateData.activeStops
          .map((stop) => ({ ...stop, optimizedSequence: orderMap.get(stop._id) ?? stop.optimizedSequence }))
          .sort((a, b) => (a.optimizedSequence || 999) - (b.optimizedSequence || 999))

        setNavigateData({
          ...navigateData,
          activeStops: updated,
          optimizedOrder,
          totalDistance,
          totalETA: estimatedTime,
        })
        toast.success(`Route optimized — ${totalDistance.toFixed(1)} km, ~${estimatedTime} min`)
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Optimization failed'
      toast.error(msg)
    } finally {
      setIsOptimizing(false)
    }
  }, [navigateData, toast])

  const startDelivery = useCallback(async () => {
    const stop = selectedStopRef.current
    const loc = locationRef.current
    if (!stop || !loc) {
      toast.error('Enable GPS and select a stop')
      return
    }
    setIsStartingDelivery(true)
    try {
      const response = await deliveryPartnerApi.startDelivery(stop._id, {
        lat: loc[1],
        lng: loc[0],
      })
      if (response.success) {
        toast.success(`Started ${stop.deliveryNumber}`)
        await refreshNavigateData()
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Could not start delivery'
      toast.error(msg)
    } finally {
      setIsStartingDelivery(false)
    }
  }, [refreshNavigateData, toast])

  const markArrived = useCallback(async () => {
    const stop = selectedStopRef.current
    const loc = locationRef.current
    if (!stop || !loc) {
      toast.error('Enable GPS and select a stop')
      return
    }
    setIsMarkingArrived(true)
    try {
      const response = await deliveryPartnerApi.updateProgress(stop._id, 'reached_location', {
        lat: loc[1],
        lng: loc[0],
      })
      if (response.success) {
        toast.success(`Arrived at ${stop.address.contactName}`)
        await refreshNavigateData()
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Could not record arrival'
      toast.error(msg)
    } finally {
      setIsMarkingArrived(false)
    }
  }, [refreshNavigateData, toast])

  const openGoogleMaps = useCallback((stop: PartnerDelivery) => {
    const coords = stop.address.coordinates?.coordinates
    if (coords) {
      window.open(`https://maps.google.com/?q=${coords[1]},${coords[0]}`, '_blank')
      return
    }
    const q = encodeURIComponent(`${stop.address.addressLine1}, ${stop.address.city}`)
    window.open(`https://maps.google.com/?q=${q}`, '_blank')
  }, [])

  // Initial load
  useEffect(() => {
    refreshNavigateData()
  }, [refreshNavigateData])

  // GPS watch when on duty
  useEffect(() => {
    if (navigateData?.isOnDuty) {
      startGpsTracking()
    } else {
      stopGpsTracking()
    }
    return stopGpsTracking
  }, [navigateData?.isOnDuty, startGpsTracking, stopGpsTracking])

  // Push location every 30s
  useEffect(() => {
    const id = setInterval(() => {
      const loc = locationRef.current
      if (loc && onDutyRef.current) {
        pushGpsToServer(loc[1], loc[0], undefined, gpsAccuracy ?? undefined)
      }
    }, 30000)
    return () => clearInterval(id)
  }, [pushGpsToServer, gpsAccuracy])

  // Refresh every 60s
  useEffect(() => {
    const id = setInterval(() => {
      if (onDutyRef.current && document.visibilityState === 'visible') {
        refreshNavigateData()
      }
    }, 60000)
    return () => clearInterval(id)
  }, [refreshNavigateData])

  // Offline detection
  useEffect(() => {
    const onOffline = () => setIsOffline(true)
    const onOnline = () => setIsOffline(false)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#0e0500] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="h-16 w-16 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Loading navigation</p>
          <p className="text-orange-300/60 text-sm mt-1">Fetching your route…</p>
        </motion.div>
      </div>
    )
  }

  if (!navigateData?.isOnDuty) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-[#0e0500] via-[#1a0900] to-[#0e0500] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-3xl border border-orange-900/40 bg-[#1a0900]/90 backdrop-blur-xl p-8 text-center shadow-2xl shadow-orange-950/50"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">You&apos;re Off Duty</h1>
          <p className="text-orange-200/60 mb-8 text-sm leading-relaxed">
            Go on duty to unlock live navigation, GPS tracking, and route optimization for your active deliveries.
          </p>
          <Button
            onClick={goOnDuty}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-black text-white shadow-lg shadow-orange-500/25"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Go On Duty
          </Button>
        </motion.div>
      </div>
    )
  }

  const currentStopIndex = selectedStop
    ? (navigateData.activeStops.findIndex((s) => s._id === selectedStop._id) + 1 || 1)
    : 0

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0e0500] text-white">
      {/* Status bar */}
      <div className="shrink-0 border-b border-orange-900/30 bg-[#1a0900]/95 backdrop-blur-md sticky top-0 z-20">
        <div className="px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1.5 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              On Duty
            </Badge>
            <Badge variant="outline" className="border-orange-800/50 text-orange-300/80 gap-1 font-medium">
              <CircleDot className="w-3 h-3" />
              ±{gpsAccuracy ? Math.round(gpsAccuracy) : '—'}m
            </Badge>
            <Badge variant="outline" className="border-orange-800/50 text-orange-300 font-bold">
              {navigateData.count} stops
            </Badge>
            {navigateData.zone && (
              <Badge variant="outline" className="border-orange-800/50 text-orange-400/70 capitalize hidden sm:flex">
                {navigateData.zone} zone
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-orange-300/60">
              <Signal className={cn('w-3.5 h-3.5', isSocketReady ? 'text-emerald-400' : 'text-orange-700')} />
              {isSocketReady ? 'Live' : 'Connecting'}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshNavigateData}
              disabled={refreshing}
              className="h-8 w-8 text-orange-300 hover:text-white hover:bg-orange-900/30"
            >
              <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isOffline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-500/10 border-t border-amber-500/20 px-4 py-1.5 flex items-center gap-2 text-xs text-amber-300"
            >
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              Offline — showing last known data
            </motion.div>
          )}
          {!gpsPermission && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-orange-500/10 border-t border-orange-500/20 px-4 py-1.5 flex items-center gap-2 text-xs text-orange-300"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              GPS permission required for accurate navigation
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map + sheet */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className={cn('relative transition-all duration-300', isSheetExpanded ? 'h-[58vh]' : 'h-[72vh]')}>
          <MapComponent
            partnerLocation={partnerCurrentLocation || navigateData.partnerLocation?.coordinates || null}
            stops={navigateData.activeStops}
            selectedStop={selectedStop}
            onStopSelect={setSelectedStop}
          />

          {/* Floating controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Button
              size="icon"
              onClick={optimizeRoute}
              disabled={isOptimizing || navigateData.activeStops.length < 2}
              className="h-10 w-10 rounded-xl bg-[#1a0900]/90 border border-orange-800/40 text-orange-300 hover:bg-orange-900/50 shadow-xl backdrop-blur-sm"
              title="Optimize route"
            >
              {isOptimizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            </Button>
          </div>

          {/* Route summary pill */}
          {navigateData.totalDistance > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-2xl bg-[#1a0900]/90 border border-orange-800/40 backdrop-blur-md px-3 py-2 shadow-xl">
              <Route className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-white">{navigateData.totalDistance.toFixed(1)} km</span>
              <span className="text-orange-700">·</span>
              <span className="text-xs text-orange-300">{formatDuration(navigateData.totalETA)}</span>
            </div>
          )}
        </div>

        {/* Bottom sheet */}
        <div
          className={cn(
            'flex flex-col bg-[#1a0900] border-t border-orange-900/40 rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.5)] transition-all duration-300',
            isSheetExpanded ? 'h-[42vh]' : 'h-[28vh]',
          )}
        >
          <button
            type="button"
            className="flex justify-center pt-2 pb-1 w-full hover:bg-orange-950/20 transition-colors"
            onClick={() => setIsSheetExpanded((v) => !v)}
            aria-label={isSheetExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isSheetExpanded ? (
              <ChevronDown className="w-5 h-5 text-orange-700" />
            ) : (
              <ChevronUp className="w-5 h-5 text-orange-700" />
            )}
          </button>

          <div className="px-4 pb-2 border-b border-orange-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-500/70 font-bold uppercase tracking-wider">Active Route</p>
                <h2 className="text-lg font-black text-white">
                  Stop {currentStopIndex || '—'} of {navigateData.count}
                </h2>
              </div>
              {selectedStop && (
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-400">₹{selectedStop.earnings ?? 0}</p>
                  <p className="text-xs text-orange-400/60">{selectedStop.items?.length ?? 0} items</p>
                </div>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 px-3">
            <div className="space-y-2 py-2">
              {navigateData.activeStops.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="w-12 h-12 text-orange-900 mx-auto mb-3" />
                  <p className="text-orange-400/60 font-medium">No active deliveries</p>
                  <Button
                    variant="link"
                    onClick={() => router.push('/delivery/orders')}
                    className="text-orange-400 mt-2"
                  >
                    View all orders →
                  </Button>
                </div>
              ) : (
                navigateData.activeStops.map((stop, index) => {
                  const isSelected = selectedStop?._id === stop._id
                  const seq = stop.optimizedSequence || index + 1
                  return (
                    <motion.button
                      key={stop._id}
                      type="button"
                      layout
                      onClick={() => setSelectedStop(stop)}
                      className={cn(
                        'w-full text-left rounded-2xl border p-3.5 transition-all',
                        isSelected
                          ? 'border-orange-500/60 bg-orange-500/10 shadow-lg shadow-orange-950/30'
                          : 'border-orange-900/30 bg-[#0e0500]/60 hover:border-orange-700/40 hover:bg-orange-950/20',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={cn(
                              'h-8 w-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0',
                              isSelected
                                ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white'
                                : 'bg-orange-900/30 text-orange-400',
                            )}
                          >
                            {seq}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{stop.address.contactName}</p>
                            <p className="text-[10px] text-orange-500/60 font-mono">{stop.deliveryNumber}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge className={cn('text-[9px] font-black border', PRIORITY_STYLES[stop.priority] || PRIORITY_STYLES.medium)}>
                            {(stop.priority || 'medium').toUpperCase()}
                          </Badge>
                          <Badge className={cn('text-[9px] font-bold border', STATUS_STYLES[stop.status] || STATUS_STYLES.assigned)}>
                            {stop.status?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-orange-300/60 flex items-start gap-1 mb-2 line-clamp-2">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-orange-500" />
                        {stop.address.addressLine1}, {stop.address.city}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-orange-500/50">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-0.5">
                            <Navigation2 className="w-3 h-3" />
                            {stop.distance?.toFixed(1) ?? '—'} km
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {stop.estimatedDuration ?? '—'} min
                          </span>
                          {stop.schedule?.scheduledSlot && (
                            <span className="flex items-center gap-0.5 hidden sm:flex">
                              <Calendar className="w-3 h-3" />
                              {stop.schedule.scheduledSlot}
                            </span>
                          )}
                        </div>
                        {stop.tracking?.estimatedArrival && (
                          <span className="text-orange-400 font-bold">ETA {formatETA(stop.tracking.estimatedArrival)}</span>
                        )}
                      </div>
                    </motion.button>
                  )
                })
              )}
            </div>
          </ScrollArea>

          {/* Action bar */}
          {selectedStop && (
            <div className="shrink-0 p-3 border-t border-orange-900/30 bg-[#0e0500]/80 backdrop-blur-sm">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-xl border-orange-800/50 bg-transparent text-orange-200 hover:bg-orange-900/30 hover:text-white"
                  onClick={() => openGoogleMaps(selectedStop)}
                >
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  Maps
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-xl border-orange-800/50 bg-transparent text-orange-200 hover:bg-orange-900/30 hover:text-white"
                  onClick={() => window.open(`tel:${selectedStop.address.contactPhone}`, '_self')}
                >
                  <Phone className="w-4 h-4 mr-1.5" />
                  Call
                </Button>

                {(selectedStop.status === 'assigned' || selectedStop.status === 'batched') && (
                  <Button
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-black text-white shadow-lg shadow-orange-500/20"
                    onClick={startDelivery}
                    disabled={isStartingDelivery}
                  >
                    {isStartingDelivery ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4 mr-1.5" />
                        Start
                      </>
                    )}
                  </Button>
                )}

                {(selectedStop.status === 'out_for_delivery' || selectedStop.status === 'in_transit') && (
                  <Button
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 font-black text-white shadow-lg shadow-emerald-500/20"
                    onClick={markArrived}
                    disabled={isMarkingArrived}
                  >
                    {isMarkingArrived ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Arrived
                      </>
                    )}
                  </Button>
                )}

                {selectedStop.status === 'reached' && (
                  <Button
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-black text-white"
                    onClick={() => router.push('/delivery/orders')}
                  >
                    <Package className="w-4 h-4 mr-1.5" />
                    Complete
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
