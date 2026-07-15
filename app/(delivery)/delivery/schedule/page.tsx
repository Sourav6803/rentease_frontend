// app/delivery/schedule/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import { deliveryPartnerApi, type PartnerDelivery, type TimeSlot } from '@/lib/api/delivery';
import { cn } from '@/lib/utils';
// import { useToast } from '@/hooks/useToast';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  DollarSign,
  Package,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Truck,
  CheckCircle2,
  XCircle,
  CalendarDays,
  User,
  Home,
  TrendingUp,
  Award,
  Timer,
  Edit2,
  Save,
  Moon,
  Sun,
  Navigation,
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, parseISO } from 'date-fns';

// Constants
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ShiftFormData {
  start: string;
  end: string;
  workingDays: string[];
}

interface RescheduleData {
  delivery: PartnerDelivery | null;
  step: 1 | 2 | 3;
  selectedDate: Date | undefined;
  selectedSlot: TimeSlot | null;
  slots: TimeSlot[];
  reason: string;
  loading: boolean;
}

export default function SchedulePage() {
  const router = useRouter();
  const toast  = useToast();
  const {
    profile,
    stats,
    todayDeliveries,
    refresh,
    updateProfile,
    toggleOnDuty,
    isLoading,
  } = useDeliveryPartner();

  const [activeTab, setActiveTab] = useState('today');
  const [shiftForm, setShiftForm] = useState<ShiftFormData>({
    start: '09:00',
    end: '18:00',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  });
  const [isSavingShift, setIsSavingShift] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedWeekDay, setSelectedWeekDay] = useState<Date | null>(new Date());
  const [historyData, setHistoryData] = useState<{ deliveries: any[]; pagination: any }>({
    deliveries: [],
    pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  
  // Reschedule dialog state
  const [rescheduleDialog, setRescheduleDialog] = useState<RescheduleData>({
    delivery: null,
    step: 1,
    selectedDate: undefined,
    selectedSlot: null,
    slots: [],
    reason: '',
    loading: false,
  });

  // Load shift data from profile
  useEffect(() => {
    if (profile?.availability?.shifts) {
      setShiftForm({
        start: profile.availability.shifts.start || '09:00',
        end: profile.availability.shifts.end || '18:00',
        workingDays: profile.availability.shifts.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      });
    }
  }, [profile]);

  // Load history when tab changes
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, historyPage]);

  // Load history data
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await deliveryPartnerApi.getHistory({
        page: historyPage,
        limit: 10,
      });
      if (response.success && response.data) {
        setHistoryData(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load history:', error);
      // History API might be stub, show empty state
      setHistoryData({
        deliveries: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      });
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage]);

  // Save shift changes
  const saveShiftChanges = useCallback(async () => {
    setIsSavingShift(true);
    try {
      const response = await updateProfile({
        availability: {
          shifts: {
            start: shiftForm.start,
            end: shiftForm.end,
            workingDays: shiftForm.workingDays,
          },
        },
      });
      
      if (response ) {
        toast.success('Shift Updated. Your work schedule has been saved');
        await refresh();
      }
    } catch (error: any) {
        toast.error('Update Failed. Unable to update shift schedule' + error.message);
    } finally {
      setIsSavingShift(false);
    }
  }, [shiftForm, updateProfile, refresh, toast]);

  // Toggle working day
  const toggleWorkingDay = useCallback((day: string) => {
    setShiftForm(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day],
    }));
  }, []);

  // Get deliveries for week view
  const getWeekDeliveries = useCallback((date: Date) => {
    if (!todayDeliveries) return [];
    // For v1, show today's deliveries for the selected day
    // When backend supports date range, this will be enhanced
    if (isSameDay(date, new Date())) {
      return todayDeliveries;
    }
    return [];
  }, [todayDeliveries]);

  // Get delivery count for day
  const getDeliveryCountForDay = useCallback((date: Date) => {
    const deliveries = getWeekDeliveries(date);
    return deliveries.length;
  }, [getWeekDeliveries]);

  // Group deliveries by slot
  const groupDeliveriesBySlot = useCallback((deliveries: PartnerDelivery[]) => {
    const groups: { [key: string]: PartnerDelivery[] } = {
      'Morning (9 AM - 12 PM)': [],
      'Afternoon (12 PM - 3 PM)': [],
      'Evening (3 PM - 6 PM)': [],
      'Night (6 PM - 9 PM)': [],
      'Other': [],
    };
    
    deliveries.forEach(delivery => {
      const slot = delivery.schedule?.scheduledSlot || 'Other';
      if (groups[slot]) {
        groups[slot].push(delivery);
      } else {
        groups['Other'].push(delivery);
      }
    });
    
    return Object.entries(groups).filter(([_, deliveries]) => deliveries.length > 0);
  }, []);

  // Open reschedule dialog
  const openRescheduleDialog = useCallback((delivery: PartnerDelivery) => {
    setRescheduleDialog({
      delivery,
      step: 1,
      selectedDate: undefined,
      selectedSlot: null,
      slots: [],
      reason: '',
      loading: false,
    });
  }, []);

  // Load available slots for selected date
  const loadAvailableSlots = useCallback(async (date: Date) => {
    if (!rescheduleDialog.delivery) return;
    
    setRescheduleDialog(prev => ({ ...prev, loading: true }));
    try {
      const pincode = rescheduleDialog.delivery.address.pincode;
      const response = await deliveryPartnerApi.getAvailableSlots(
        format(date, 'yyyy-MM-dd'),
        pincode
      );
      
      if (response.success && response.data?.slots) {
        setRescheduleDialog(prev => ({
          ...prev,
          slots: response.data.slots,
          loading: false,
        }));
      }
    } catch (error: any) {
      console.error('Failed to load slots:', error);
      toast({
        title: 'Error',
        description: 'Unable to load available time slots',
        variant: 'destructive',
      });
      setRescheduleDialog(prev => ({ ...prev, loading: false }));
    }
  }, [rescheduleDialog.delivery, toast]);

  // Submit reschedule request
  const submitReschedule = useCallback(async () => {
    if (!rescheduleDialog.delivery || !rescheduleDialog.selectedDate || !rescheduleDialog.selectedSlot || !rescheduleDialog.reason) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setRescheduleDialog(prev => ({ ...prev, loading: true }));
    try {
      const response = await deliveryPartnerApi.rescheduleDelivery(
        rescheduleDialog.delivery._id,
        {
          newDate: format(rescheduleDialog.selectedDate, "yyyy-MM-dd'T'00:00:00.000'Z'"),
          newSlot: rescheduleDialog.selectedSlot.label,
          reason: rescheduleDialog.reason,
        }
      );
      
      if (response.success) {
        toast({
          title: 'Rescheduled Successfully',
          description: `Delivery has been rescheduled to ${format(rescheduleDialog.selectedDate, 'MMM dd')} at ${rescheduleDialog.selectedSlot.label}`,
        });
        setRescheduleDialog(prev => ({ ...prev, delivery: null, step: 1, selectedDate: undefined, selectedSlot: null, reason: '' }));
        await refresh();
      }
    } catch (error: any) {
      toast({
        title: 'Reschedule Failed',
        description: error.message || 'Unable to reschedule delivery',
        variant: 'destructive',
      });
    } finally {
      setRescheduleDialog(prev => ({ ...prev, loading: false }));
    }
  }, [rescheduleDialog, toast, refresh]);

  // Format duration
  const formatDuration = (start: string, end: string) => {
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    const duration = endHour - startHour;
    return `${duration} hours/day`;
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      assigned: { className: 'bg-blue-100 text-blue-700', label: 'Assigned' },
      batched: { className: 'bg-purple-100 text-purple-700', label: 'Batched' },
      out_for_delivery: { className: 'bg-orange-100 text-orange-700', label: 'Out for Delivery' },
      in_transit: { className: 'bg-amber-100 text-amber-700', label: 'In Transit' },
      reached: { className: 'bg-green-100 text-green-700', label: 'Reached' },
      delivered: { className: 'bg-emerald-100 text-emerald-700', label: 'Delivered' },
      failed: { className: 'bg-red-100 text-red-700', label: 'Failed' },
      cancelled: { className: 'bg-gray-100 text-gray-700', label: 'Cancelled' },
      rescheduled: { className: 'bg-yellow-100 text-yellow-700', label: 'Rescheduled' },
    };
    return variants[status] || { className: 'bg-gray-100 text-gray-700', label: status };
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    };
    return variants[priority] || 'bg-gray-100 text-gray-700';
  };

  // Delivery Card Component
  const DeliveryCard = ({ delivery, showActions = true }: { delivery: PartnerDelivery; showActions?: boolean }) => {
    const statusBadge = getStatusBadge(delivery.status);
    const priorityClass = getPriorityBadge(delivery.priority);
    
    return (
      <Card className="p-4 hover:shadow-md transition-shadow border-orange-100/60 dark:border-orange-900/30">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {delivery.address.contactName}
              </h3>
              <Badge className={priorityClass}>
                {delivery.priority?.toUpperCase()}
              </Badge>
              <Badge className={statusBadge.className}>
                {statusBadge.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">{delivery.deliveryNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-orange-600">₹{delivery.earnings}</p>
            <p className="text-xs text-gray-500">{delivery.distance?.toFixed(1)} km</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="flex-1">
            {delivery.address.addressLine1}, {delivery.address.city} - {delivery.address.pincode}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {delivery.schedule?.scheduledSlot || 'Flexible'}
            </span>
            {delivery.schedule?.deadline && (
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                Due {format(parseISO(delivery.schedule.deadline), 'h:mm a')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {delivery.items?.length || 0} items
            </span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/delivery/navigate`)}
            >
              <Navigation className="w-4 h-4 mr-1" />
              Navigate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => window.open(`tel:${delivery.address.contactPhone}`, '_blank')}
            >
              <Phone className="w-4 h-4 mr-1" />
              Call
            </Button>
            {(delivery.status === 'assigned' || delivery.status === 'batched') && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => openRescheduleDialog(delivery)}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Reschedule
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0e0500] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0e0500]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Schedule</h1>
              <p className="text-orange-100 mt-1">Manage your work schedule and deliveries</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 text-white border-white/30">
                {profile?.zone} Zone
              </Badge>
              <Button
                variant={profile?.availability?.isOnDuty ? "default" : "secondary"}
                className={cn(
                  "gap-2",
                  profile?.availability?.isOnDuty 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-gray-600 hover:bg-gray-700"
                )}
                onClick={toggleOnDuty}
              >
                {profile?.availability?.isOnDuty ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    On Duty
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Off Duty
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <Card className="bg-white/10 border-white/20 text-white">
              <div className="p-3">
                <p className="text-orange-100 text-sm">Total Today</p>
                <p className="text-2xl font-bold">{stats?.todayDeliveries || 0}</p>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <div className="p-3">
                <p className="text-orange-100 text-sm">Completed</p>
                <p className="text-2xl font-bold">{stats?.completedToday || 0}</p>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <div className="p-3">
                <p className="text-orange-100 text-sm">Pending</p>
                <p className="text-2xl font-bold">{stats?.pendingToday || 0}</p>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <div className="p-3">
                <p className="text-orange-100 text-sm">Earnings</p>
                <p className="text-2xl font-bold">₹{stats?.todayEarnings || 0}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-[#1a0900] border border-orange-100 dark:border-orange-900/30">
            <TabsTrigger value="today" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              Today
            </TabsTrigger>
            <TabsTrigger value="week" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              Week
            </TabsTrigger>
            <TabsTrigger value="shifts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              My Shifts
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              History
            </TabsTrigger>
          </TabsList>
          
          {/* Today Tab */}
          <TabsContent value="today" className="space-y-4">
            {/* In Progress Banner */}
            {stats?.activeDeliveries && stats.activeDeliveries > 0 && (
              <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {stats.activeDeliveries} delivery{stats.activeDeliveries !== 1 ? 's' : ''} in progress
                    </span>
                  </div>
                  <Button
                    variant="link"
                    className="text-orange-600"
                    onClick={() => router.push('/delivery/navigate')}
                  >
                    View on Map →
                  </Button>
                </div>
              </Card>
            )}
            
            {/* Timeline */}
            {todayDeliveries && todayDeliveries.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-380px)]">
                <div className="space-y-6">
                  {groupDeliveriesBySlot(todayDeliveries).map(([slot, deliveries]) => (
                    <div key={slot}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{slot}</h3>
                        <Badge variant="secondary">{deliveries.length} delivery{deliveries.length !== 1 ? 's' : ''}</Badge>
                      </div>
                      <div className="space-y-3">
                        {deliveries.map(delivery => (
                          <DeliveryCard key={delivery._id} delivery={delivery} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <Card className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No deliveries today</h3>
                <p className="text-gray-500 mb-4">You have no scheduled deliveries for today</p>
                <Button onClick={() => router.push('/delivery/orders')}>
                  Browse Available Orders
                </Button>
              </Card>
            )}
          </TabsContent>
          
          {/* Week Tab */}
          <TabsContent value="week" className="space-y-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeekStart(prev => subWeeks(prev, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Week
              </Button>
              <span className="font-semibold">
                {format(currentWeekStart, 'MMM dd')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM dd, yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeekStart(prev => addWeeks(prev, 1))}
              >
                Next Week
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Week Days Grid */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {weekDays.map((day, idx) => {
                const deliveryCount = getDeliveryCountForDay(day);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedWeekDay && isSameDay(day, selectedWeekDay);
                
                return (
                  <Card
                    key={idx}
                    className={cn(
                      "p-3 text-center cursor-pointer transition-all hover:shadow-md",
                      isSelected && "ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950/20",
                      isToday && "border-orange-300"
                    )}
                    onClick={() => setSelectedWeekDay(day)}
                  >
                    <p className="text-xs text-gray-500 mb-1">{WEEKDAY_LABELS[idx]}</p>
                    <p className={cn(
                      "text-lg font-semibold",
                      isToday && "text-orange-600"
                    )}>
                      {format(day, 'dd')}
                    </p>
                    {deliveryCount > 0 && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {deliveryCount} delivery{deliveryCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </Card>
                );
              })}
            </div>
            
            {/* Deliveries for Selected Day */}
            {selectedWeekDay && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Deliveries for {format(selectedWeekDay, 'EEEE, MMMM dd')}
                </h3>
                {getWeekDeliveries(selectedWeekDay).length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {getWeekDeliveries(selectedWeekDay).map(delivery => (
                        <DeliveryCard key={delivery._id} delivery={delivery} />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <Card className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No deliveries scheduled for this day</p>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* My Shifts Tab */}
          <TabsContent value="shifts" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Shift Schedule Card */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Work Schedule</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={shiftForm.start}
                        onChange={(e) => setShiftForm(prev => ({ ...prev, start: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={shiftForm.end}
                        onChange={(e) => setShiftForm(prev => ({ ...prev, end: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Working Days</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {WEEKDAYS.map((day, idx) => (
                        <Button
                          key={day}
                          variant={shiftForm.workingDays.includes(day) ? "default" : "outline"}
                          className={cn(
                            "w-full",
                            shiftForm.workingDays.includes(day) && "bg-blue-600 hover:bg-blue-700"
                          )}
                          onClick={() => toggleWorkingDay(day)}
                        >
                          {WEEKDAY_LABELS[idx]}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Daily Hours:</span>
                      <span className="font-semibold">{formatDuration(shiftForm.start, shiftForm.end)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-600">Weekly Hours:</span>
                      <span className="font-semibold">
                        {shiftForm.workingDays.length * parseInt(shiftForm.end.split(':')[0] - parseInt(shiftForm.start.split(':')[0]))} hours/week
                      </span>
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={saveShiftChanges}
                      disabled={isSavingShift}
                    >
                      {isSavingShift ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Schedule
                    </Button>
                  </div>
                </div>
              </Card>
              
              {/* Vehicle & Zone Info */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Vehicle & Zone</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Vehicle Type</span>
                    <span className="font-medium capitalize">{profile?.vehicle?.type}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Vehicle Number</span>
                    <span className="font-medium">{profile?.vehicle?.number}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Zone</span>
                    <span className="font-medium capitalize">{profile?.zone}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">On-Time Rate</span>
                    <span className="font-medium text-green-600">{profile?.performance?.onTimeRate}%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {historyData.deliveries.length > 0 ? (
              <>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {historyData.deliveries.map(delivery => (
                      <Card key={delivery._id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{delivery.address.contactName}</h3>
                              <Badge className={getStatusBadge(delivery.status).className}>
                                {getStatusBadge(delivery.status).label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{delivery.deliveryNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-600">₹{delivery.earnings}</p>
                            <p className="text-xs text-gray-500">
                              {delivery.completedAt ? format(parseISO(delivery.completedAt), 'MMM dd, yyyy') : format(parseISO(delivery.schedule?.scheduledDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p>{delivery.address.addressLine1}, {delivery.address.city}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Pagination */}
                {historyData.pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {historyPage} of {historyData.pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryPage(p => Math.min(historyData.pagination.pages, p + 1))}
                      disabled={historyPage === historyData.pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="text-center py-12">
                <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Yet</h3>
                <p className="text-gray-500">
                  Your delivery history will appear here once you complete deliveries
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleDialog.delivery} onOpenChange={(open) => !open && setRescheduleDialog(prev => ({ ...prev, delivery: null }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {rescheduleDialog.step === 1 && "Select New Date"}
              {rescheduleDialog.step === 2 && "Choose Time Slot"}
              {rescheduleDialog.step === 3 && "Provide Reason"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {rescheduleDialog.step === 1 && (
              <>
                <CalendarComponent
                  mode="single"
                  selected={rescheduleDialog.selectedDate}
                  onSelect={(date) => {
                    setRescheduleDialog(prev => ({ ...prev, selectedDate: date }));
                    if (date) {
                      loadAvailableSlots(date);
                      setRescheduleDialog(prev => ({ ...prev, step: 2 }));
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </>
            )}
            
            {rescheduleDialog.step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Available Time Slots</Label>
                  {rescheduleDialog.loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Loading slots...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {rescheduleDialog.slots.map((slot) => (
                        <Card
                          key={slot.label}
                          className={cn(
                            "p-3 cursor-pointer transition-all hover:shadow-md",
                            rescheduleDialog.selectedSlot?.label === slot.label && "ring-2 ring-orange-500 bg-orange-50"
                          )}
                          onClick={() => {
                            if (slot.available) {
                              setRescheduleDialog(prev => ({ ...prev, selectedSlot: slot }));
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{slot.label}</p>
                              <p className="text-sm text-gray-500">
                                {slot.start} - {slot.end}
                              </p>
                            </div>
                            {slot.available ? (
                              <Badge variant="secondary">Available</Badge>
                            ) : (
                              <Badge variant="destructive">Full</Badge>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setRescheduleDialog(prev => ({ ...prev, step: 1 }))}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setRescheduleDialog(prev => ({ ...prev, step: 3 }))}
                    disabled={!rescheduleDialog.selectedSlot}
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}
            
            {rescheduleDialog.step === 3 && (
              <>
                <div>
                  <Label htmlFor="reason">Reason for Rescheduling</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a reason for rescheduling this delivery..."
                    value={rescheduleDialog.reason}
                    onChange={(e) => setRescheduleDialog(prev => ({ ...prev, reason: e.target.value }))}
                    className="mt-1"
                    rows={4}
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Selected Slot:</strong> {rescheduleDialog.selectedSlot?.label} on {rescheduleDialog.selectedDate && format(rescheduleDialog.selectedDate, 'MMMM dd, yyyy')}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setRescheduleDialog(prev => ({ ...prev, step: 2 }))}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={submitReschedule}
                    disabled={!rescheduleDialog.reason || rescheduleDialog.loading}
                  >
                    {rescheduleDialog.loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Calendar className="w-4 h-4 mr-2" />
                    )}
                    Confirm Reschedule
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// History Icon Component
function HistoryIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}