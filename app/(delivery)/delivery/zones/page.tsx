'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MapPin,
  Navigation2,
  Package,
  RefreshCw,
  Save,
  Plus,
  X,
  Truck,
  Target,
  Star,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Hash,
  Globe,
  ChevronRight,
} from 'lucide-react'
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext'
import {
  deliveryPartnerApi,
  type PartnerDelivery,
  type ZoneType,
} from '@/lib/api/delivery'
import { getZoneMeta, ZONE_CATALOG } from '@/lib/delivery-zones'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

function isValidPincode(value: string) {
  return /^[1-9][0-9]{5}$/.test(value.trim())
}

export default function ZonesPage() {
  const toast = useToast()
  const {
    profile,
    stats,
    todayDeliveries,
    isLoading,
    isUsingFallback,
    refresh,
    updateProfile,
  } = useDeliveryPartner()

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedZone, setSelectedZone] = useState<ZoneType>('central')
  const [pincodes, setPincodes] = useState<string[]>([])
  const [newPincode, setNewPincode] = useState('')
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [deliveries, setDeliveries] = useState<PartnerDelivery[]>([])

  useEffect(() => {
    if (profile) {
      setSelectedZone(profile.zone || 'central')
      setPincodes(profile.serviceablePincodes || [])
    }
  }, [profile])

  useEffect(() => {
    if (todayDeliveries?.length) {
      setDeliveries(todayDeliveries)
    }
  }, [todayDeliveries])

  const fetchData = useCallback(async () => {
    setRefreshing(true)
    try {
      await refresh()
      const res = await deliveryPartnerApi.getToday()
      if (res.success && res.data?.deliveries) {
        setDeliveries(res.data.deliveries)
      }
    } catch {
      toast.error('Failed to refresh zone data')
    } finally {
      setRefreshing(false)
    }
  }, [refresh, toast])

  const currentZone = getZoneMeta(profile?.zone || selectedZone)
  const hasChanges =
    selectedZone !== profile?.zone ||
    JSON.stringify([...pincodes].sort()) !== JSON.stringify([...(profile?.serviceablePincodes || [])].sort())

  const deliveriesByPincode = useMemo(() => {
    const map = new Map<string, PartnerDelivery[]>()
    for (const d of deliveries) {
      const pin = d.address?.pincode || 'Unknown'
      if (!map.has(pin)) map.set(pin, [])
      map.get(pin)!.push(d)
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [deliveries])

  const coveredPincodeSet = useMemo(() => new Set(pincodes), [pincodes])

  const inCoverageCount = useMemo(
    () =>
      deliveries.filter((d) => {
        const pin = d.address?.pincode
        return profile?.zone === 'all' || !pin || coveredPincodeSet.has(pin)
      }).length,
    [deliveries, coveredPincodeSet, profile?.zone],
  )

  const addPincode = () => {
    const pin = newPincode.trim()
    if (!isValidPincode(pin)) {
      toast.error('Enter a valid 6-digit pincode')
      return
    }
    if (pincodes.includes(pin)) {
      toast.error('Pincode already added')
      return
    }
    setPincodes((prev) => [...prev, pin])
    setNewPincode('')
  }

  const removePincode = (pin: string) => {
    setPincodes((prev) => prev.filter((p) => p !== pin))
  }

  const saveZoneSettings = async () => {
    setSaving(true)
    try {
      await updateProfile({
        zone: selectedZone,
        serviceablePincodes: pincodes,
      })
      toast.success('Zone settings saved')
      await fetchData()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Could not save zone settings'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0e0500] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-orange-200/60 font-medium">Loading zones…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0e0500]">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {isUsingFallback && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/40 px-4 py-3 flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Demo data — connect to backend for live zone info
          </div>
        )}

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-3xl border p-6 md:p-8 text-white shadow-xl overflow-hidden relative',
            `bg-gradient-to-br ${currentZone.gradient}`,
          )}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 opacity-90" />
                <span className="text-sm font-bold uppercase tracking-wider opacity-90">Active Territory</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black">{currentZone.label} Zone</h1>
              <p className="text-white/85 mt-2 max-w-lg text-sm leading-relaxed">{currentZone.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {currentZone.cities.map((city) => (
                  <Badge key={city} className="bg-white/20 text-white border-white/30 hover:bg-white/25">
                    {city}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 min-w-[200px]">
              <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-4">
                <p className="text-xs uppercase tracking-wider opacity-80">Pincodes covered</p>
                <p className="text-3xl font-black">{pincodes.length}</p>
              </div>
              <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-4">
                <p className="text-xs uppercase tracking-wider opacity-80">Today in coverage</p>
                <p className="text-3xl font-black">{inCoverageCount}/{deliveries.length}</p>
              </div>
              <Button
                variant="secondary"
                onClick={fetchData}
                disabled={refreshing}
                className="bg-white/90 text-gray-900 hover:bg-white font-bold"
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Package, label: 'Today', value: stats?.todayDeliveries ?? deliveries.length, color: 'orange' },
            { icon: Target, label: 'On-time', value: `${stats?.onTimeRate ?? profile?.performance.onTimeRate ?? 0}%`, color: 'emerald' },
            { icon: Star, label: 'Rating', value: `${stats?.rating ?? profile?.rating ?? 0} ★`, color: 'amber' },
            { icon: TrendingUp, label: 'Week earnings', value: `₹${(stats?.thisWeekEarnings ?? 0).toLocaleString('en-IN')}`, color: 'blue' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-orange-100/60 dark:border-orange-900/30 bg-white dark:bg-[#1a0900] p-4"
            >
              <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center mb-2', {
                orange: 'bg-orange-100 dark:bg-orange-950/40 text-orange-600',
                emerald: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600',
                amber: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600',
                blue: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600',
              }[color])}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums">{value}</p>
              <p className="text-xs text-gray-500 dark:text-orange-300/50">{label}</p>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full grid grid-cols-3 h-11 rounded-2xl bg-orange-50 dark:bg-[#1a0900] border border-orange-100/60 dark:border-orange-900/30 p-1">
            {[
              { value: 'overview', label: 'Overview' },
              { value: 'coverage', label: 'Coverage' },
              { value: 'activity', label: 'Activity' },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-xl font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4 outline-none">
            <div className="rounded-2xl border border-orange-100/60 dark:border-orange-900/30 bg-white dark:bg-[#1a0900] p-5">
              <h2 className="text-lg font-black text-gray-900 dark:text-white mb-1">Select your zone</h2>
              <p className="text-sm text-gray-500 dark:text-orange-300/50 mb-4">
                Assignments are matched using your serviceable pincodes. Zone helps operations route bulk orders.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ZONE_CATALOG.map((zone) => {
                  const active = selectedZone === zone.id
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => setSelectedZone(zone.id)}
                      className={cn(
                        'text-left rounded-2xl border p-4 transition-all hover:shadow-md',
                        active
                          ? cn('ring-2 ring-orange-500 shadow-lg', zone.bg, zone.border)
                          : 'border-gray-200 dark:border-orange-900/30 bg-gray-50/50 dark:bg-[#0e0500]/50 hover:border-orange-300',
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn('font-black text-lg', active ? zone.color : 'text-gray-900 dark:text-white')}>
                          {zone.label}
                        </span>
                        {active && <CheckCircle2 className="h-5 w-5 text-orange-500" />}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-orange-300/50 line-clamp-2">{zone.description}</p>
                      <p className="text-[10px] text-gray-400 mt-2 truncate">{zone.cities.join(' · ')}</p>
                    </button>
                  )
                })}
              </div>
              {hasChanges && (
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={saveZoneSettings}
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 font-black"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save zone
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-blue-100/60 dark:border-blue-900/30 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/10 p-5">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white">How zone matching works</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-orange-200/60">
                    <li>• Orders are assigned when the delivery pincode is in your serviceable list</li>
                    <li>• <strong>All Zones</strong> partners can receive city-wide assignments</li>
                    <li>• Peak hours (5–8 PM) may pay bonus rates in high-demand pincodes</li>
                    <li>• Keep pincodes updated to avoid missed assignments near your route</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Coverage */}
          <TabsContent value="coverage" className="space-y-4 outline-none">
            <div className="rounded-2xl border border-orange-100/60 dark:border-orange-900/30 bg-white dark:bg-[#1a0900] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Serviceable pincodes</h2>
              </div>

              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter 6-digit pincode"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && addPincode()}
                  className="rounded-xl border-orange-200/60 dark:border-orange-800/30 bg-orange-50/30 dark:bg-orange-950/10"
                />
                <Button onClick={addPincode} className="rounded-xl bg-orange-500 hover:bg-orange-600 shrink-0">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {pincodes.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-orange-200 dark:border-orange-900/40 rounded-2xl">
                  <MapPin className="h-10 w-10 text-orange-300 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-orange-300/50 font-medium">No pincodes added yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add pincodes you can deliver to</p>
                </div>
              ) : (
                <ScrollArea className="max-h-48">
                  <div className="flex flex-wrap gap-2">
                    {pincodes.map((pin) => {
                      const count = deliveriesByPincode.find(([p]) => p === pin)?.[1]?.length ?? 0
                      return (
                        <Badge
                          key={pin}
                          variant="outline"
                          className="pl-3 pr-1 py-1.5 rounded-xl border-orange-200 dark:border-orange-800/40 text-sm font-bold gap-2"
                        >
                          {pin}
                          {count > 0 && (
                            <span className="text-[10px] bg-orange-100 dark:bg-orange-950/40 text-orange-600 px-1.5 py-0.5 rounded-md">
                              {count} today
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removePincode(pin)}
                            className="ml-1 p-0.5 rounded-md hover:bg-red-100 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-500"
                            aria-label={`Remove ${pin}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}

              <div className="mt-5 flex flex-wrap gap-2 justify-between items-center border-t border-orange-100 dark:border-orange-900/20 pt-4">
                <p className="text-xs text-gray-500 dark:text-orange-300/50">
                  {selectedZone === 'all'
                    ? 'All Zones — pincodes optional but help with routing'
                    : `${pincodes.length} pincode${pincodes.length !== 1 ? 's' : ''} in ${currentZone.label} coverage`}
                </p>
                <Button
                  onClick={saveZoneSettings}
                  disabled={saving || !hasChanges}
                  className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 font-black"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save coverage
                </Button>
              </div>
            </div>

            {/* Pincode activity breakdown */}
            {deliveriesByPincode.length > 0 && (
              <div className="rounded-2xl border border-orange-100/60 dark:border-orange-900/30 bg-white dark:bg-[#1a0900] p-5">
                <h3 className="font-black text-gray-900 dark:text-white mb-3">Today by pincode</h3>
                <div className="space-y-2">
                  {deliveriesByPincode.map(([pin, items]) => {
                    const inCoverage = profile?.zone === 'all' || coveredPincodeSet.has(pin)
                    const pct = deliveries.length ? Math.round((items.length / deliveries.length) * 100) : 0
                    return (
                      <div key={pin} className="flex items-center gap-3">
                        <span className="text-sm font-bold w-16 tabular-nums">{pin}</span>
                        <div className="flex-1 h-2 rounded-full bg-orange-100 dark:bg-orange-950/40 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', inCoverage ? 'bg-orange-500' : 'bg-red-400')}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-12 text-right">{items.length}</span>
                        {!inCoverage && (
                          <Badge variant="outline" className="text-[9px] border-red-300 text-red-500">Outside</Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Activity */}
          <TabsContent value="activity" className="space-y-4 outline-none">
            <div className="rounded-2xl border border-orange-100/60 dark:border-orange-900/30 bg-white dark:bg-[#1a0900] overflow-hidden">
              <div className="px-5 py-4 border-b border-orange-100 dark:border-orange-900/20 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-gray-900 dark:text-white">Today&apos;s zone activity</h2>
                  <p className="text-xs text-gray-500 dark:text-orange-300/50">{deliveries.length} deliveries scheduled</p>
                </div>
                <Link href="/delivery/navigate">
                  <Button size="sm" variant="outline" className="rounded-xl border-orange-200">
                    <Navigation2 className="h-4 w-4 mr-1" />
                    Navigate
                  </Button>
                </Link>
              </div>

              {deliveries.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Package className="h-12 w-12 text-orange-200 dark:text-orange-900 mx-auto mb-3" />
                  <p className="font-medium text-gray-500 dark:text-orange-300/50">No deliveries in your zone today</p>
                  <Link href="/delivery/orders" className="text-orange-600 text-sm font-bold mt-2 inline-flex items-center gap-1">
                    View all orders <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <ScrollArea className="max-h-[420px]">
                  <div className="divide-y divide-orange-50 dark:divide-orange-900/20">
                    {deliveries.map((d) => {
                      const inCoverage =
                        profile?.zone === 'all' || coveredPincodeSet.has(d.address?.pincode || '')
                      return (
                        <div key={d._id} className="px-5 py-4 hover:bg-orange-50/50 dark:hover:bg-orange-950/10 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-gray-900 dark:text-white truncate">
                                  {d.address.contactName}
                                </p>
                                <Badge className="text-[9px] capitalize">{d.status.replace(/_/g, ' ')}</Badge>
                                {!inCoverage && (
                                  <Badge variant="outline" className="text-[9px] border-amber-400 text-amber-600">
                                    Outside coverage
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-orange-300/50 mt-0.5 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {d.address.addressLine1}, {d.address.city} — {d.address.pincode}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono mt-1">{d.deliveryNumber}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-black text-emerald-600">₹{d.earnings ?? 85}</p>
                              <p className="text-[10px] text-gray-400">{d.schedule?.scheduledSlot}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
