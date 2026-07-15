// src/app/vendor/settings/components/BusinessHoursTab.tsx
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Clock,
  Sun,
  Moon,
  SunMoon,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  ChevronDown,
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const days = [
  { id: 'monday', label: 'Monday', short: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'thursday', label: 'Thursday', short: 'Thu' },
  { id: 'friday', label: 'Friday', short: 'Fri' },
  { id: 'saturday', label: 'Saturday', short: 'Sat' },
  { id: 'sunday', label: 'Sunday', short: 'Sun' },
]

const timeSlots = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
})

interface BusinessHour {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
  breaks: Array<{ start: string; end: string }>
}

interface BusinessHoursTabProps {
  profile: any
  onUpdate: () => void
}

export function BusinessHoursTab({ profile, onUpdate }: BusinessHoursTabProps) {
  const { data: session } = useSession()
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(
    profile?.settings?.businessHours || days.map(day => ({
      day: day.id,
      isOpen: true,
      openTime: '09:00',
      closeTime: '18:00',
      breaks: []
    }))
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateBusinessHour = (dayId: string, updates: Partial<BusinessHour>) => {
    setBusinessHours(prev =>
      prev.map(hour =>
        hour.day === dayId ? { ...hour, ...updates } : hour
      )
    )
  }

  const addBreak = (dayId: string) => {
    setBusinessHours(prev =>
      prev.map(hour =>
        hour.day === dayId
          ? { ...hour, breaks: [...hour.breaks, { start: '13:00', end: '14:00' }] }
          : hour
      )
    )
  }

  const removeBreak = (dayId: string, breakIndex: number) => {
    setBusinessHours(prev =>
      prev.map(hour =>
        hour.day === dayId
          ? { ...hour, breaks: hour.breaks.filter((_, i) => i !== breakIndex) }
          : hour
      )
    )
  }

  const updateBreak = (dayId: string, breakIndex: number, updates: { start?: string; end?: string }) => {
    setBusinessHours(prev =>
      prev.map(hour =>
        hour.day === dayId
          ? {
              ...hour,
              breaks: hour.breaks.map((b, i) =>
                i === breakIndex ? { ...b, ...updates } : b
              )
            }
          : hour
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put(
        `${BASE_URL}/api/v1/vendor/business-hours`,
        { businessHours },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`
          }
        }
      )

      if (response.data.success) {
        toast.success('Business hours updated successfully')
        onUpdate()
      }
    } catch (error: any) {
      console.error('Error updating business hours:', error)
      toast.error(error.response?.data?.message || 'Failed to update business hours')
    } finally {
      setIsSaving(false)
    }
  }

  const getDayStatus = (hour: BusinessHour) => {
    if (!hour.isOpen) return 'Closed'
    return `${hour.openTime} - ${hour.closeTime}`
  }

  const getActiveHoursCount = () => {
    return businessHours.filter(h => h.isOpen).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Business Hours</h2>
          <p className="text-sm text-muted-foreground">
            Set your operational hours for customer visibility
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Hours
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{getActiveHoursCount()}</p>
              <p className="text-xs text-muted-foreground">Open Days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{7 - getActiveHoursCount()}</p>
              <p className="text-xs text-muted-foreground">Closed Days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <SunMoon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-xs text-muted-foreground">Customer Support</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Hours List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Schedule</CardTitle>
          <CardDescription>
            Configure your operating hours for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {businessHours.map((hour, idx) => (
              <motion.div
                key={hour.day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border rounded-lg p-4 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-28">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize">{hour.day}</span>
                      <Badge variant={hour.isOpen ? "default" : "secondary"} className="text-xs">
                        {hour.isOpen ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={hour.isOpen}
                        onCheckedChange={(checked) => updateBusinessHour(hour.day, { isOpen: checked })}
                      />
                      {hour.isOpen && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Select
                            value={hour.openTime}
                            onValueChange={(val) => updateBusinessHour(hour.day, { openTime: val })}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground">to</span>
                          <Select
                            value={hour.closeTime}
                            onValueChange={(val) => updateBusinessHour(hour.day, { closeTime: val })}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Breaks Section */}
                    {hour.isOpen && hour.breaks.length > 0 && (
                      <div className="mt-3 ml-6">
                        <p className="text-xs text-muted-foreground mb-2">Break Hours</p>
                        <div className="space-y-2">
                          {hour.breaks.map((breakItem, breakIdx) => (
                            <div key={breakIdx} className="flex items-center gap-2">
                              <Select
                                value={breakItem.start}
                                onValueChange={(val) => updateBreak(hour.day, breakIdx, { start: val })}
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeSlots.map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <span className="text-muted-foreground">to</span>
                              <Select
                                value={breakItem.end}
                                onValueChange={(val) => updateBreak(hour.day, breakIdx, { end: val })}
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeSlots.map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeBreak(hour.day, breakIdx)}
                                className="h-8 w-8 text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {hour.isOpen && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addBreak(hour.day)}
                        className="mt-2 ml-6 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Break
                      </Button>
                    )}
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    {getDayStatus(hour)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Holiday Notice */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800">Holiday Schedule</p>
              <p className="text-sm text-amber-700 mt-1">
                For special holiday hours or temporary closures, please contact support to update your schedule.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}