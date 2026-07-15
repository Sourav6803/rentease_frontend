'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import type { DateRange as DayPickerRange } from 'react-day-picker'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface DateRangeValue {
  startDate: string
  endDate: string
}

interface DateRangePickerProps {
  value: DateRangeValue
  onChange: (range: DateRangeValue) => void
  className?: string
}

function toIso(d?: Date): string {
  return d ? format(d, 'yyyy-MM-dd') : ''
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const selected: DayPickerRange | undefined =
    value.startDate && value.endDate
      ? { from: new Date(value.startDate), to: new Date(value.endDate) }
      : value.startDate
        ? { from: new Date(value.startDate), to: undefined }
        : undefined

  const label =
    value.startDate && value.endDate
      ? `${format(new Date(value.startDate), 'dd MMM yyyy')} – ${format(new Date(value.endDate), 'dd MMM yyyy')}`
      : 'Pick a date range'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-9 justify-start gap-2 border-slate-200 text-left text-xs font-medium text-slate-700',
            className,
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-slate-500" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={selected}
          onSelect={(range) => {
            onChange({
              startDate: toIso(range?.from),
              endDate: toIso(range?.to),
            })
            if (range?.from && range?.to) setOpen(false)
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}

export default DateRangePicker
