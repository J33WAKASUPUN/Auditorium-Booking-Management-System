import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertTriangle,
  Building,
  Users,
  Eye,
  Edit2,
  XCircle,
  FileText,
  DollarSign,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { bookingService, type Booking } from '@/services/bookingService';
import BookingViewDialog from '@/components/BookingViewDialog';
import WorkflowStepper from '@/components/WorkflowStepper';
import { cn } from '@/lib/utils';

// Auditorium colors for dots
const AUDITORIUM_COLORS: Record<string, string> = {
  '1': '#4472C4', // Main Auditorium - Blue
  '2': '#ED7D31', // Conference Hall A - Orange
  '3': '#A5A5A5', // Conference Hall B - Gray
};

const auditoriumNames: Record<string, string> = {
  '1': 'auditoriums.1',
  '2': 'auditoriums.2',
  '3': 'auditoriums.3',
};

// ✅ UPDATED: Status config with proper workflow status display
const statusConfig: Record<string, { color: string; icon: any }> = {
  pending_approval: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Clock,
  },
  payment_pending: {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    icon: DollarSign,
  },
  payment_confirmed: {
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    icon: CheckCircle,
  },
  recommended: {
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    icon: TrendingUp,
  },
  approved: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: CheckCircle2,
  },
  completed: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: CheckCircle2,
  },
  cancelled: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: XCircle,
  },
  draft: {
    color: 'bg-gray-100 text-gray-800 dark:bg-secondary dark:text-secondary-foreground',
    icon: FileText,
  },
};

const CalendarPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForView, setSelectedBookingForView] = useState<Booking | null>(null);
  const [auditoriumFilter, setAuditoriumFilter] = useState('all'); // ✅ NEW: Hall filter

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = monthEnd.getDate();
  const firstDayOfMonth = monthStart.getDay();

  // Translated Weekdays
  const dayNames = [
    t('calendarPage.weekdays.sun'),
    t('calendarPage.weekdays.mon'),
    t('calendarPage.weekdays.tue'),
    t('calendarPage.weekdays.wed'),
    t('calendarPage.weekdays.thu'),
    t('calendarPage.weekdays.fri'),
    t('calendarPage.weekdays.sat'),
  ];

  useEffect(() => {
    fetchBookings();
  }, [currentDate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getBookings({
        page: 1,
        limit: 500,
      });
      console.log('📅 Calendar bookings loaded:', response.data.length);
      setBookings(response.data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('errors.generic'),
        description: t('calendarPage.toasts.fetchError'),
      });
      console.error('Calendar error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Filter bookings by auditorium
  const filteredBookings = useMemo(() => {
    if (auditoriumFilter === 'all') {
      return bookings;
    }
    return bookings.filter((b) => b.auditoriumId === auditoriumFilter);
  }, [bookings, auditoriumFilter]);

  // ✅ UPDATED: Group bookings by date (using filtered bookings)
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};

    filteredBookings.forEach((booking) => {
      if (!booking.startDateTime) return;

      const bookingDate = new Date(booking.startDateTime);
      const dateKey = format(bookingDate, 'yyyy-MM-dd');

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(booking);
    });

    return grouped;
  }, [filteredBookings]);

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const getBookingsForDate = (date: number): Booking[] => {
    const dateKey = format(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), date),
      'yyyy-MM-dd'
    );
    return bookingsByDate[dateKey] || [];
  };

  const handleDateClick = (date: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), date));
  };

  const getAuditoriumsForDate = (bookings: Booking[]): string[] => {
    const auditoriums = new Set<string>();
    bookings.forEach((booking) => {
      auditoriums.add(booking.auditoriumId);
    });
    return Array.from(auditoriums);
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  // ✅ UPDATED: Helper function to get cancellation info
  const getCancellationInfo = (booking: Booking) => {
    const isRecommendationCancelled =
      booking.status === 'pending_approval' &&
      booking.recommendationStatus?.status === 'cancelled';

    const isApprovalCancelled =
      booking.status === 'recommended' &&
      booking.approvalStatus?.status === 'cancelled';

    return {
      isCancelled: isRecommendationCancelled || isApprovalCancelled,
      type: isRecommendationCancelled ? 'recommendation' : isApprovalCancelled ? 'approval' : null,
      reason: isRecommendationCancelled
        ? booking.recommendationStatus?.cancellationReason
        : booking.approvalStatus?.cancellationReason,
    };
  };

  const canEditBooking = (booking: Booking): boolean => {
    // Must be admin
    if (user?.role !== 'admin') return false;

    // Check if workflow was cancelled
    const cancellationInfo = getCancellationInfo(booking);
    if (cancellationInfo.isCancelled) return false;

    // Check if admin cancelled
    if (booking.status === 'cancelled') return false;

    // Check if payment confirmed (workflow complete)
    if (booking.status === 'payment_confirmed' || booking.status === 'completed') return false;

    // Only allow edit for draft and pending_approval
    return ['draft', 'pending_approval'].includes(booking.status);
  };

  // ✅ NEW: Get display status - prioritize cancellations and completed workflow states
  const getDisplayStatus = (booking: Booking) => {
    const cancellationInfo = getCancellationInfo(booking);
    
    // 1. If admin cancelled
    if (booking.status === 'cancelled') {
      return 'cancelled';
    }
    
    // 2. If workflow was cancelled
    if (cancellationInfo.isCancelled) {
      return 'cancelled';
    }
    
    // 3. If payment confirmed (workflow complete)
    if (booking.status === 'payment_confirmed' || booking.status === 'completed') {
      return 'payment_confirmed';
    }
    
    // 4. Otherwise show current status
    return booking.status;
  };

  // ✅ NEW: Get status style based on display status
  const getStatusStyle = (booking: Booking) => {
    const displayStatus = getDisplayStatus(booking);
    return statusConfig[displayStatus] || statusConfig.draft;
  };

  const CalendarCellSkeleton = () => (
    <Card className="min-h-[100px] p-2 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-6" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </Card>
  );

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[100px] border bg-muted/30" />
      );
    }

    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const bookingsForDay = getBookingsForDate(date);
      const auditoriums = getAuditoriumsForDate(bookingsForDay);

      const cellDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        date
      );
      cellDate.setHours(0, 0, 0, 0);

      const isToday =
        date === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      const isPast = cellDate < today;
      const hasNoBookings = bookingsForDay.length === 0;
      const isLocked = isPast && hasNoBookings;

      // ✅ UPDATED: Count bookings by display status
      let approvedCount = 0;
      let pendingCount = 0;
      let cancelledCount = 0;
      let completedCount = 0;

      bookingsForDay.forEach((b) => {
        const displayStatus = getDisplayStatus(b);
        
        if (displayStatus === 'cancelled') {
          cancelledCount++;
        } else if (displayStatus === 'payment_confirmed' || displayStatus === 'completed') {
          completedCount++;
        } else if (displayStatus === 'approved') {
          approvedCount++;
        } else if (['pending_approval', 'recommended', 'payment_pending'].includes(displayStatus)) {
          pendingCount++;
        }
      });

      days.push(
        <HoverCard key={date} openDelay={200}>
          <HoverCardTrigger asChild>
            <Card
              className={cn(
                'group min-h-[100px] p-2 transition-all',
                isToday && 'ring-2 ring-primary bg-primary/5',
                isLocked
                  ? 'cursor-not-allowed bg-muted/50 opacity-60'
                  : 'cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-primary'
              )}
              onClick={() => !isLocked && handleDateClick(date)}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isToday ? 'text-primary' : '',
                    isLocked && 'text-muted-foreground'
                  )}
                >
                  {date}
                </span>
                {bookingsForDay.length > 0 && (
                  <Badge variant="outline" className="h-5 px-1.5 text-xs">
                    {bookingsForDay.length}
                  </Badge>
                )}
              </div>

              {/* Auditorium dots */}
              {auditoriums.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {auditoriums.map((auditoriumId) => (
                    <div
                      key={auditoriumId}
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: AUDITORIUM_COLORS[auditoriumId] || '#666',
                      }}
                      title={t(auditoriumNames[auditoriumId])}
                    />
                  ))}
                </div>
              )}

              {/* ✅ UPDATED: Status indicators with workflow completion */}
              {bookingsForDay.length > 0 && (
                <div className="mt-2 space-y-1">
                  {completedCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      <span className="truncate">{completedCount} {t('calendarPage.cell.completed')}</span>
                    </div>
                  )}
                  {approvedCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="truncate">{approvedCount} {t('calendarPage.cell.approved')}</span>
                    </div>
                  )}
                  {pendingCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <Clock className="h-3 w-3" />
                      <span className="truncate">{pendingCount} {t('calendarPage.cell.pending')}</span>
                    </div>
                  )}
                  {cancelledCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <XCircle className="h-3 w-3" />
                      <span className="truncate">{cancelledCount} {t('calendarPage.cell.cancelled')}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </HoverCardTrigger>

          {/* Hover Preview */}
          {bookingsForDay.length > 0 && !isLocked && (
            <HoverCardContent side="right" align="start" className="w-80 p-0">
              <div className="border-b bg-muted/30 p-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      date
                    ),
                    'MMM dd, yyyy'
                  )}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {bookingsForDay.length}{' '}
                  {bookingsForDay.length === 1 ? t('calendarPage.sheet.booking') : t('calendarPage.sheet.bookings')}
                </p>
              </div>

              <ScrollArea className="max-h-[400px]">
                <div className="p-3 space-y-3">
                  {bookingsForDay.map((booking) => {
                    const statusStyle = getStatusStyle(booking);
                    const StatusIcon = statusStyle.icon;
                    const cancellationInfo = getCancellationInfo(booking);
                    const displayStatus = getDisplayStatus(booking);

                    return (
                <Card
                  key={booking._id}
                  className="p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    // ✅ UPDATED: Use canEditBooking helper
                    if (canEditBooking(booking)) {
                      navigate(`/bookings/${booking._id}/edit`);
                    } else {
                      setSelectedBookingForView(booking);
                    }
                  }}
                      >
                        {/* Time and Venue */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(booking.startDateTime)} -{' '}
                            {formatTime(booking.endDateTime)}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium">
                            <Building className="h-3 w-3" />
                            {t(auditoriumNames[booking.auditoriumId])}
                          </div>
                        </div>

                        {/* Purpose Preview */}
                        <p className="text-xs line-clamp-2 text-foreground/80 mb-2">
                          {booking.purpose || (
                            <span className="italic text-muted-foreground">
                              {t('calendarPage.sheet.noPurpose')}
                            </span>
                          )}
                        </p>

                        {/* Client and Attendees */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>{booking.clientName}</span>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {booking.attendingPeopleCount}
                          </div>
                        </div>

                        {/* ✅ UPDATED: Status Badge showing workflow progress or cancellation */}
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex flex-col gap-1 items-start">
                      <Badge className={cn('text-xs border-0 w-fit', statusStyle.color)}>
                        <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                        {t(`status.${displayStatus}`)}
                      </Badge>
                      {cancellationInfo.isCancelled && (
                        <Badge variant="destructive" className="gap-1 text-xs h-5 px-1.5 w-fit">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {cancellationInfo.type === 'recommendation'
                            ? t('calendarPage.sheet.recCancelled')
                            : t('calendarPage.sheet.appCancelled')}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Show Edit or View based on canEditBooking */}
                    {canEditBooking(booking) ? (
                      <span className="text-xs text-primary hover:underline mt-1">
                        {t('calendarPage.sheet.edit')} →
                      </span>
                    ) : (
                      <span className="text-xs text-primary hover:underline mt-1">
                        {t('calendarPage.sheet.view')} →
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
                </div>
              </ScrollArea>

              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDateClick(date);
                  }}
                >
                  {t('calendarPage.sheet.viewAll')}
                </Button>
              </div>
            </HoverCardContent>
          )}
        </HoverCard>
      );
    }

    return days;
  };

  const renderSkeletonCalendar = () => {
    const cells = [];
    const totalCells = 35;
    for (let i = 0; i < totalCells; i++) {
      cells.push(<CalendarCellSkeleton key={i} />);
    }
    return cells;
  };

  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return bookingsByDate[dateKey] || [];
  }, [selectedDate, bookingsByDate]);

  return (
    <div className="space-y-6">
      {/* Page Header with Filter */}
      {/* ✅ FIX 1: Stacking layout on mobile */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('calendarPage.title')}
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t('calendarPage.subtitle')}
          </p>
        </div>
        
        {/* ✅ FIX 2: Full width inputs on mobile */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={auditoriumFilter} onValueChange={setAuditoriumFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-12 text-base">
              <Building className="w-5 h-5 mr-2 text-muted-foreground" />
              <SelectValue placeholder={t('calendarPage.filterByHall')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-base py-3">
                {t('calendarPage.allHalls')}
              </SelectItem>
              {Object.keys(auditoriumNames).map((audId) => (
                <SelectItem key={audId} value={audId} className="text-base py-3">
                  {t(auditoriumNames[audId])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {user?.role === 'admin' && (
            <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/new-booking')}>
              <Plus className="mr-2 h-5 w-5" />
              {t('calendarPage.newBooking')}
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Card */}
      <Card className="p-4 sm:p-6">
        {/* Month Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold truncate">
            {t(`calendarPage.months.${currentDate.getMonth()}`)} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={today} className="hidden sm:inline-flex">
              {t('calendarPage.today')}
            </Button>
             {/* Small today button for mobile */}
             <Button variant="outline" size="sm" onClick={today} className="sm:hidden">
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-4 sm:gap-6 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-muted-foreground">
              {t('calendarPage.legend')}:
            </span>
            {Object.entries(AUDITORIUM_COLORS).map(([auditoriumId, color]) => (
              <div key={auditoriumId} className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span>{t(auditoriumNames[auditoriumId])}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ FIX 3: Horizontal Scroll Wrapper for Calendar Grid */}
        <div className="overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="min-w-[800px]"> {/* Forces grid to maintain readable size */}
            {/* Calendar Grid */}
            {loading ? (
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-semibold text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
                {renderSkeletonCalendar()}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-semibold text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
                {renderCalendarDays()}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Side Sheet for Selected Date Details */}
      <Sheet
        open={!!selectedDate}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      >
        <SheetContent className="w-full sm:w-[450px] sm:max-w-[450px] flex flex-col h-full p-0 border-l">
          
          <SheetHeader className="px-6 py-6 border-b bg-muted/5">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-2xl font-bold">
                  {selectedDate?.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })}
                </SheetTitle>
                <p className="text-muted-foreground text-sm font-medium mt-1">
                  {selectedDate?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 h-full bg-muted/5">
            <div className="flex flex-col gap-4 p-6">
              {selectedDateBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-background border flex items-center justify-center shadow-sm">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-lg">{t('calendarPage.sheet.noBookingsTitle')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('calendarPage.sheet.noBookingsDesc')}
                    </p>
                  </div>
                  {user?.role === 'admin' && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() =>
                        navigate('/new-booking', {
                          state: { selectedDate: selectedDate?.toISOString() },
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('calendarPage.sheet.createBooking')}
                    </Button>
                  )}
                </div>
              ) : (
                selectedDateBookings.map((booking) => {
                  const statusStyle = getStatusStyle(booking);
                  const StatusIcon = statusStyle.icon;
                  const cancellationInfo = getCancellationInfo(booking);
                  const displayStatus = getDisplayStatus(booking);
                  const auditoriumColor = AUDITORIUM_COLORS[booking.auditoriumId] || '#666';

                  return (
                    <Card
                      key={booking._id}
                      className="group overflow-hidden border-l-4 transition-all hover:shadow-lg cursor-pointer"
                      style={{ borderLeftColor: auditoriumColor }}
                      onClick={() => {
                        // Use canEditBooking helper
                        if (canEditBooking(booking)) {
                          navigate(`/bookings/${booking._id}/edit`);
                        } else {
                          setSelectedBookingForView(booking);
                        }
                      }}
                    >
                      <div className="p-4 space-y-4">
                        {/* Header: Time & Status */}
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold tabular-nums tracking-tight">
                                {formatTime(booking.startDateTime)}
                              </span>
                              <span className="text-muted-foreground font-medium">-</span>
                              <span className="text-xl font-bold tabular-nums tracking-tight text-muted-foreground">
                                {formatTime(booking.endDateTime)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 text-sm font-medium text-muted-foreground">
                              <Building className="h-4 w-4" style={{ color: auditoriumColor }} />
                              {t(auditoriumNames[booking.auditoriumId])}
                            </div>
                          </div>
                          
                          {/* ✅ UPDATED: Status Badges showing workflow state */}
                          <div className="flex flex-col gap-1 items-end">
                            <Badge className={cn('px-2.5 py-1 text-xs font-semibold border-0 shrink-0', statusStyle.color)}>
                              <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                              {t(`status.${displayStatus}`)}
                            </Badge>

                            {/* Cancellation Badge */}
                            {cancellationInfo.isCancelled && (
                              <Badge variant="destructive" className="gap-1 text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                {cancellationInfo.type === 'recommendation' 
                                  ? t('calendarPage.sheet.recCancelled')
                                  : t('calendarPage.sheet.appCancelled')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Cancellation Reason Box */}
                        {cancellationInfo.isCancelled && cancellationInfo.reason && (
                          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-destructive mb-1">
                                  {cancellationInfo.type === 'recommendation' 
                                    ? t('calendarPage.sheet.recCancelledFull')
                                    : t('calendarPage.sheet.appCancelledFull')}
                                </p>
                                <p className="text-sm text-foreground">
                                  {cancellationInfo.reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Details Card */}
                        <div className="grid gap-4 p-4 bg-muted/40 rounded-lg border border-border/40">
                          <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                              {t('calendarPage.sheet.client')}
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              {booking.clientName}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                              {t('calendarPage.sheet.purpose')}
                            </span>
                            <span className="text-sm text-muted-foreground leading-relaxed">
                              {booking.purpose || t('calendarPage.sheet.noPurpose')}
                            </span>
                          </div>
                        </div>

                        {/* Workflow */}
                        <div className="pt-1 px-1">
                          <WorkflowStepper
                            currentStatus={booking.status}
                            recommendationStatus={booking.recommendationStatus}
                            approvalStatus={booking.approvalStatus}
                            compact
                          />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                              {t('calendarPage.sheet.amount')}
                            </span>
                            <span className="text-lg font-bold font-mono text-foreground">
                              Rs. {booking.amount.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            {/* View Button - Always show */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 px-4 hover:bg-muted"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBookingForView(booking);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {t('calendarPage.sheet.view')}
                            </Button>

                            {/* Edit Button - Only show if canEditBooking */}
                            {canEditBooking(booking) && (
                              <Button
                                variant="default"
                                size="sm"
                                className="h-9 px-4"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/bookings/${booking._id}/edit`);
                                }}
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                {t('calendarPage.sheet.edit')}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* View Booking Dialog */}
      {selectedBookingForView && (
        <BookingViewDialog
          booking={selectedBookingForView}
          open={!!selectedBookingForView}
          onOpenChange={(open) => !open && setSelectedBookingForView(null)}
        />
      )}
    </div>
  );
};

export default CalendarPage;