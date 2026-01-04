import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, subDays, parseISO } from 'date-fns';
import {
  CalendarDays,
  DollarSign,
  Clock,
  TrendingUp,
  Activity,
  Building,
  XCircle,
  CheckCircle,
  FileSpreadsheet,
  Receipt,
  AlertTriangle,
  PieChart as PieChartIcon,
  Trophy,
  Undo2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import analyticsService, { type AnalyticsDashboard } from '@/services/analyticsService';
import { bookingService, type Booking } from '@/services/bookingService';
import { paymentService, type Invoice } from '@/services/paymentService';

// --- Constants & Helpers ---

const AUDITORIUM_COLORS: Record<string, string> = {
  '1': '#4472C4',
  '2': '#ED7D31',
  '3': '#A5A5A5',
};

const TOP_HALL_GRADIENTS = [
  { id: '1', from: '#4472C4', to: '#2d5aa0', labelKey: 'topHall' },
  { id: '2', from: '#ED7D31', to: '#c86419', labelKey: 'second' },
  { id: '3', from: '#A5A5A5', to: '#7a7a7a', labelKey: 'third' },
];

const DATE_RANGES = [
  { label: '7d', value: '7d', days: 7 },
  { label: '30d', value: '30d', days: 30 },
  { label: '90d', value: '90d', days: 90 },
];

const CustomDonutLegend = ({ data, totalValue }: { data: any[]; totalValue?: number }) => (
  <div className="space-y-3 min-w-[180px]">
    {data.map((item, index) => (
      <div key={index} className="space-y-1">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm font-medium">{item.name}</span>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground pl-5">
          <span className="font-semibold text-foreground">{item.value}</span>
          {totalValue && (
            <span>
              ({Math.round((item.value / totalValue) * 100)}%)
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
);

const Reports = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'schedules' | 'invoices' | null>(null);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | null>(null);

  // Date range state
  const [selectedRange, setSelectedRange] = useState('30d');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Helper for auditorium names using translations
  const getAuditoriumName = (id: string) => {
    const key = `auditoriums.${id}`;
    const name = t(key);
    return name !== key ? name : `Auditorium ${id}`;
  };

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const handleRangeChange = (rangeValue: string, days: number) => {
    setSelectedRange(rangeValue);
    const end = new Date();
    const start = subDays(end, days);
    setStartDate(start);
    setEndDate(end);
  };

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const formattedStart = format(startDate, 'yyyy-MM-dd');
      const formattedEnd = format(endDate, 'yyyy-MM-dd');
      
      // Fetch all data
      const [analyticsData, bookingsResponse, invoicesResponse] = await Promise.all([
        analyticsService.getDashboard(formattedStart, formattedEnd),
        bookingService.getBookings({ page: 1, limit: 1000 }),
        paymentService.getInvoices(undefined, 1, 1000),
      ]);

      setAnalytics(analyticsData);
      setBookings(bookingsResponse.data || []);
      setInvoices(invoicesResponse.data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('errors.generic'),
        description: t('reports.toasts.loadError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

// ✅ RENAME: 'format' parameter to 'exportFormat' to avoid shadowing date-fns format()
const handleExport = async (type: 'schedules' | 'invoices', exportFormat: 'excel' | 'pdf') => {
  setIsExporting(true);
  setExportType(type);
  setExportFormat(exportFormat); // ✅ Now uses the renamed parameter

  try {
    const formattedStart = format(startDate, 'yyyy-MM-dd'); // ✅ Now date-fns format() works
    const formattedEnd = format(endDate, 'yyyy-MM-dd');

    console.log('🔵 Export started:', { type, exportFormat, formattedStart, formattedEnd });

    let blob: Blob;

    if (type === 'schedules') {
      blob = exportFormat === 'pdf' // ✅ Use renamed parameter
        ? await analyticsService.exportSchedulesPDF(formattedStart, formattedEnd)
        : await analyticsService.exportSchedules(formattedStart, formattedEnd);
    } else {
      blob = exportFormat === 'pdf' // ✅ Use renamed parameter
        ? await analyticsService.exportInvoicesPDF(formattedStart, formattedEnd)
        : await analyticsService.exportInvoices(formattedStart, formattedEnd);
    }

    console.log('🟢 Blob received:', { 
      size: blob.size, 
      type: blob.type 
    });

    // Check if blob is valid
    if (!blob || blob.size === 0) {
      throw new Error('Empty or invalid file received from server');
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const extension = exportFormat === 'pdf' ? 'pdf' : 'xlsx'; // ✅ Use renamed parameter
    link.download = `${type}-report-${formattedStart}-to-${formattedEnd}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('✅ Download triggered successfully');

    toast({
      title: t('reports.toasts.exportSuccess'),
      description: t('reports.toasts.exportDesc', { 
        type, 
        format: exportFormat.toUpperCase()
      }),
    });
  } catch (error: any) {
    console.error('❌ Export error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    });

    toast({
      variant: 'destructive',
      title: t('reports.toasts.exportFailed'),
      description: error.response?.data?.message || error.message || t('reports.toasts.exportError'),
    });
  } finally {
    setIsExporting(false);
    setExportType(null);
    setExportFormat(null);
  }
};

  const ReportsSkeleton = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-12 w-12 rounded-lg mb-4" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-5 w-24 my-auto" />
                </div>
                <Skeleton className="h-6 w-8" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isLoading || !analytics) {
    return <ReportsSkeleton />;
  }

  // --- Data Preparation & Calculation Logic ---

  // 1. Helper to check cancellation status
  const getCancellationInfo = (booking: Booking) => {
    const isAdminCancelled = booking.status === 'cancelled';
    
    const isRecommendationCancelled = 
      booking.status === 'pending_approval' && 
      booking.recommendationStatus?.status === 'cancelled';
    
    const isApprovalCancelled = 
      booking.status === 'recommended' && 
      booking.approvalStatus?.status === 'cancelled';

    return {
      isCancelled: isAdminCancelled || isRecommendationCancelled || isApprovalCancelled,
      type: isAdminCancelled ? 'admin' : isRecommendationCancelled ? 'recommendation' : isApprovalCancelled ? 'approval' : null,
      isAdminCancelled,
      isRecommendationCancelled,
      isApprovalCancelled,
    };
  };

  // 2. Filter Active Bookings (Exclude ALL cancellations)
  const activeBookings = bookings.filter((b) => {
    const info = getCancellationInfo(b);
    return !info.isCancelled;
  });

  // 3. Calculate Specific Cancellation Counts
  const adminCancelledCount = bookings.filter(b => {
    const info = getCancellationInfo(b);
    return info.isAdminCancelled;
  }).length;

  const recCancelledCount = bookings.filter(b => {
    const info = getCancellationInfo(b);
    return info.isRecommendationCancelled;
  }).length;

  const appCancelledCount = bookings.filter(b => {
    const info = getCancellationInfo(b);
    return info.isApprovalCancelled;
  }).length;

  const totalCancelled = adminCancelledCount + recCancelledCount + appCancelledCount;

  // 4. Total Bookings (Exclude ALL cancelled)
  const totalBookingsCount = activeBookings.length;

  // 5. Pending Actions (Correct flow)
  const pendingRecommendations = bookings.filter(b => {
    const info = getCancellationInfo(b);
    return b.status === 'pending_approval' && !info.isCancelled;
  }).length;

  const pendingApprovals = bookings.filter(b => {
    const info = getCancellationInfo(b);
    return b.status === 'recommended' && !info.isCancelled;
  }).length;

  // ✅ RENAMED to pendingPaymentsCount
  const pendingPaymentsCount = bookings.filter(b => {
    const info = getCancellationInfo(b);
    return b.status === 'payment_pending' && !info.isCancelled;
  }).length;

  // ✅ UPDATED to use pendingPaymentsCount
  const totalPendingActions = pendingRecommendations + pendingApprovals + pendingPaymentsCount;

  // 6. Status Distribution for Pie Chart (Show workflow states correctly)
  const scheduleStatusData = [
    { 
      name: t('reports.status.paymentConfirmed'), 
      value: bookings.filter(b => {
        const info = getCancellationInfo(b);
        return (b.status === 'payment_confirmed' || b.status === 'completed') && !info.isCancelled;
      }).length, 
      color: '#10B981' 
    },
    { 
      name: t('reports.status.approved'), 
      value: bookings.filter(b => {
        const info = getCancellationInfo(b);
        return b.status === 'approved' && !info.isCancelled;
      }).length, 
      color: '#059669' 
    },
    { 
      name: t('reports.status.recommended'), 
      value: bookings.filter(b => {
        const info = getCancellationInfo(b);
        return b.status === 'recommended' && !info.isCancelled;
      }).length, 
      color: '#06B6D4' 
    },
    { 
      name: t('reports.status.paymentPending'), 
      value: bookings.filter(b => {
        const info = getCancellationInfo(b);
        return (b.status === 'payment_pending' || b.status === 'pending_approval') && !info.isCancelled;
      }).length, 
      color: '#F59E0B' 
    },
    { 
      name: t('reports.status.draft'), 
      value: bookings.filter(b => {
        const info = getCancellationInfo(b);
        return b.status === 'draft' && !info.isCancelled;
      }).length, 
      color: '#9CA3AF' 
    },
    { 
      name: t('reports.status.cancelled'), 
      value: totalCancelled, 
      color: '#EF4444' 
    },
  ]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // 7. Invoice Status Data
  const invoiceStatusData = [
    { name: t('reports.status.paid'), value: analytics.invoices.paid, color: '#10B981' },
    { name: t('reports.status.pending'), value: analytics.invoices.pending, color: '#F59E0B' },
    { name: t('reports.status.overdue'), value: analytics.invoices.overdue, color: '#EF4444' },
    { name: t('reports.status.refunded'), value: analytics.invoices.refunded || 0, color: '#8B5CF6' },
  ]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // 8. Utilization Data (Active bookings only)
  const utilizationData = Object.keys(AUDITORIUM_COLORS).map((audId) => {
    const hallBookings = activeBookings.filter(b => b.auditoriumId === audId).length;
    const totalActive = activeBookings.length;
    const rate = totalActive > 0 ? Math.round((hallBookings / totalActive) * 100) : 0;

    return {
      name: getAuditoriumName(audId),
      value: hallBookings,
      bookings: hallBookings,
      utilization: rate,
      percent: rate,
      color: AUDITORIUM_COLORS[audId],
      id: audId,
    };
  }).sort((a, b) => b.bookings - a.bookings);

  // 9. Chart Data (Trends)
  const chartData = (analytics.trends || []).map((trend) => {
    const isDaily = trend.month.length > 7; 
    const dateObj = isDaily ? parseISO(trend.month) : parseISO(`${trend.month}-01`);

    // Calculate active bookings for this period (exclude cancelled)
    const monthStart = isDaily 
      ? new Date(trend.month)
      : new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
    
    const monthEnd = isDaily
      ? new Date(new Date(trend.month).setHours(23, 59, 59, 999))
      : new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0, 23, 59, 59, 999);

    // Filter bookings for this time period, excluding cancelled
    const periodBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.createdAt);
      const cancellationInfo = getCancellationInfo(b);
      
      // Include if booking is in this period AND not cancelled
      return bookingDate >= monthStart && 
             bookingDate <= monthEnd && 
             !cancellationInfo.isCancelled &&
             b.status !== 'cancelled';
    });

    return {
      label: format(dateObj, isDaily ? 'MMM d' : 'MMM yyyy'),
      fullDate: trend.month,
      schedules: periodBookings.length,
      revenue: trend.revenue / 1000, 
    };
  });

  const totalInvoicesCount = analytics.invoices.total;

  // Calculate Extra Charges Total
  const totalExtraCharges = invoices
    .filter((inv) => inv.status === 'paid' && inv.totalExtraCharges)
    .reduce((sum, inv) => sum + (inv.totalExtraCharges || 0), 0);

  // Calculate Total Revenue including extras
  const totalRevenue = analytics.invoices.totalRevenue + totalExtraCharges;

  // Calculate Pending Payments (from active bookings)
  const pendingPaymentsAmount = bookings
    .filter((b) => {
      const info = getCancellationInfo(b);
      return b.status === 'payment_pending' && !info.isCancelled;
    })
    .reduce((sum, b) => sum + b.amount, 0);

  // Helper to format numbers like 90k, 1.5M
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('reports.title')}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t('reports.overview')} {selectedRange === '7d' ? '7' : selectedRange === '30d' ? '30' : '90'} {t('reports.days')}
          </p>
        </div>

        {/* Date Range & Export Buttons with Dropdown */}
        <div className="flex flex-wrap gap-3">
          {DATE_RANGES.map((range) => (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleRangeChange(range.value, range.days)}
              className="h-10"
            >
              {t(`reports.range.${range.label}`)}
            </Button>
          ))}
          
          {/* Bookings Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2"
                disabled={isExporting}
              >
                {isExporting && exportType === 'schedules' ? (
                  <>
                    <span className="animate-spin text-xs">⏳</span>
                    {t('reports.buttons.exporting')}
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    {t('reports.buttons.bookings')}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleExport('schedules', 'excel')}
                disabled={isExporting}
                className="cursor-pointer py-3"
              >
                <FileSpreadsheet className="w-4 h-4 mr-3" />
                {t('reports.export.toExcel')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('schedules', 'pdf')}
                disabled={isExporting}
                className="cursor-pointer py-3"
              >
                <FileText className="w-4 h-4 mr-3" />
                {t('reports.export.toPDF')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Invoices Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="h-10 gap-2"
                disabled={isExporting}
              >
                {isExporting && exportType === 'invoices' ? (
                  <>
                    <span className="animate-spin text-xs">⏳</span>
                    {t('reports.buttons.exporting')}
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4" />
                    {t('reports.buttons.invoices')}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleExport('invoices', 'excel')}
                disabled={isExporting}
                className="cursor-pointer py-3"
              >
                <FileSpreadsheet className="w-4 h-4 mr-3" />
                {t('reports.export.toExcel')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('invoices', 'pdf')}
                disabled={isExporting}
                className="cursor-pointer py-3"
              >
                <FileText className="w-4 h-4 mr-3" />
                {t('reports.export.toPDF')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* 1. Total Bookings (Exclude cancelled) */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{t('reports.summary.totalBookings')}</h3>
          <p className="text-3xl font-bold mt-2">{totalBookingsCount}</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-green-600 font-medium flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {bookings.filter(b => {
                const info = getCancellationInfo(b);
                return (b.status === 'payment_confirmed' || b.status === 'completed') && !info.isCancelled;
              }).length} {t('reports.summary.completed')}
            </span>
          </div>
        </Card>

        {/* 2. Total Revenue */}
<Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{t('reports.summary.totalRevenue')}</h3>
          <p className="text-3xl font-bold mt-2">
            Rs. {formatAmount(totalRevenue)}
          </p>
          
          <div className="mt-3 space-y-1.5">
            {/* Base Revenue */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t('reports.summary.baseRevenue')}:</span>
              <span className="font-medium">Rs. {formatAmount(analytics.invoices.totalRevenue)}</span>
            </div>
            
            {/* Extra Charges */}
            {totalExtraCharges > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-600 dark:text-amber-400">{t('reports.summary.extraCharges')}:</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  + Rs. {formatAmount(totalExtraCharges)}
                </span>
              </div>
            )}
            
            {/* Pending Payments */}
            {pendingPaymentsAmount > 0 && (
              <div className="flex items-center justify-between text-xs pt-1.5 border-t">
                <span className="text-amber-600">{t('reports.summary.pendingPayments')}:</span>
                <span className="font-medium text-amber-600">
                  Rs. {formatAmount(pendingPaymentsAmount)}
                </span>
              </div>
            )}
            
            {/* Paid Count */}
            <div className="text-xs text-green-600 font-medium pt-1">
              <CheckCircle className="w-3 h-3 inline mr-1" />
              {analytics.invoices.paid} {t('reports.summary.invoicesPaid')}
            </div>
          </div>
        </Card>

        {/* 3. Pending Actions (Correct workflow) */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{t('reports.summary.pendingActions')}</h3>
          <p className="text-3xl font-bold mt-2">{totalPendingActions}</p>
          <div className="mt-2 text-sm space-y-1">
            <p className="text-muted-foreground">
              {pendingRecommendations} {t('reports.summary.recommendations')}
            </p>
            <p className="text-muted-foreground">
              {pendingApprovals} {t('reports.summary.approvals')}
            </p>
            {/* ✅ UPDATED to pendingPaymentsCount */}
            <p className="text-muted-foreground">
              {pendingPaymentsCount} {t('reports.summary.payments')}
            </p>
          </div>
        </Card>

        {/* 4. Upcoming Events */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{t('reports.summary.upcomingEvents')}</h3>
          <p className="text-3xl font-bold mt-2">{analytics.upcomingEvents}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('reports.summary.next30Days')}
          </p>
        </Card>

        {/* 5. Workflow Cancellations (All 3 roles) */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <XCircle className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{t('reports.summary.workflowCancellations')}</h3>
          <p className="text-3xl font-bold mt-2">{totalCancelled}</p>
          <div className="mt-2 text-sm space-y-1">
            <p className="text-muted-foreground">
              {adminCancelledCount} {t('reports.summary.adminCancelled')}
            </p>
            <p className="text-muted-foreground">
              {recCancelledCount} {t('reports.summary.recommendationCancelled')}
            </p>
            <p className="text-muted-foreground">
              {appCancelledCount} {t('reports.summary.approvalCancelled')}
            </p>
          </div>
        </Card>
      </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          {/* Changed className: 'flex' or 'justify-center' -> 'grid w-full grid-cols-4' */}
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="text-base font-semibold">{t('reports.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="bookings" className="text-base font-semibold">{t('reports.tabs.bookings')}</TabsTrigger>
            <TabsTrigger value="revenue" className="text-base font-semibold">{t('reports.tabs.revenue')}</TabsTrigger>
            <TabsTrigger value="utilization" className="text-base font-semibold">{t('reports.tabs.utilization')}</TabsTrigger>
          </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {t('reports.charts.activity')}
              </CardTitle>
              <CardDescription>{t('reports.charts.trends')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A273D1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#A273D1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="label" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="schedules"
                    stroke="#A273D1"
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                    strokeWidth={2}
                    name={t('reports.charts.bookings')}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                    name={t('reports.charts.revenueK')}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Auditorium Distribution & Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Auditorium Distribution (Active bookings only) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {t('reports.charts.auditoriumDist')}
                </CardTitle>
                <CardDescription>{t('reports.charts.bookingsByVenue')}</CardDescription>
              </CardHeader>
              <CardContent>
                {utilizationData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={utilizationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="bookings"
                        >
                          {utilizationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <CustomDonutLegend data={utilizationData} totalValue={totalBookingsCount} />
                  </div>
                ) : (
                  <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                    <p>{t('reports.charts.noAuditoriumData')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Breakdown (List style remains for Overview) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {t('reports.charts.statusBreakdown')}
                </CardTitle>
                <CardDescription>{t('reports.charts.currentStatuses')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Row 1: Pending & Confirmed */}
                  <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm text-amber-800 dark:text-amber-300 mb-1">{t('reports.status.paymentPending')}</p>
                         <p className="text-3xl font-bold text-amber-800 dark:text-amber-300">
                           {bookings.filter(b => {
                             const info = getCancellationInfo(b);
                             return (b.status === 'payment_pending' || b.status === 'pending_approval') && !info.isCancelled;
                           }).length}
                         </p>
                       </div>
                       <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>

                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm text-green-800 dark:text-green-300 mb-1">{t('reports.status.paymentConfirmed')}</p>
                         <p className="text-3xl font-bold text-green-800 dark:text-green-300">
                           {bookings.filter(b => {
                             const info = getCancellationInfo(b);
                             return (b.status === 'payment_confirmed' || b.status === 'completed') && !info.isCancelled;
                           }).length}
                         </p>
                       </div>
                       <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>

                  {/* Row 2: Approved & Recommended */}
                   <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm text-emerald-800 dark:text-emerald-300 mb-1">{t('reports.status.approved')}</p>
                         <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-300">
                           {bookings.filter(b => {
                             const info = getCancellationInfo(b);
                             return b.status === 'approved' && !info.isCancelled;
                           }).length}
                         </p>
                       </div>
                       <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg border border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm text-cyan-800 dark:text-cyan-300 mb-1">{t('reports.status.recommended')}</p>
                         <p className="text-3xl font-bold text-cyan-800 dark:text-cyan-300">
                           {bookings.filter(b => {
                             const info = getCancellationInfo(b);
                             return b.status === 'recommended' && !info.isCancelled;
                           }).length}
                         </p>
                       </div>
                       <TrendingUp className="w-6 h-6 text-cyan-600" />
                    </div>
                  </div>

                  {/* Row 3: Cancelled (Full Width) */}
                  <div className="md:col-span-2 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm text-red-800 dark:text-red-300 mb-1">{t('reports.status.cancelled')}</p>
                         <p className="text-3xl font-bold text-red-800 dark:text-red-300">
                           {totalCancelled}
                         </p>
                       </div>
                       <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Auditoriums (Active bookings only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-foreground" />
                {t('reports.charts.topPerformers')}
              </CardTitle>
              <CardDescription>{t('reports.charts.mostBooked')}</CardDescription>
            </CardHeader>
            <CardContent>
              {utilizationData.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {utilizationData.slice(0, 3).map((hall, index) => {
                    const gradient = TOP_HALL_GRADIENTS[index];
                    return (
                      <div
                        key={hall.id}
                        className="relative overflow-hidden rounded-xl p-6 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                        style={{
                          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                        }}
                      >
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 bg-white" />
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="h-4 w-4 text-white opacity-80" />
                          <span className="text-xs font-medium opacity-90">{t(`reports.labels.${gradient.labelKey}`)}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3">{hall.name}</h3>
                        <div className="text-4xl font-bold mb-1">{hall.bookings}</div>
                        <div className="text-sm opacity-90 mb-4">{t('reports.labels.bookings')}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">{t('reports.charts.noData')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  {t('reports.charts.bookingStatusDist')}
                </CardTitle>
                <CardDescription>{t('reports.charts.distByStatus')}</CardDescription>
              </CardHeader>
              <CardContent>
                {scheduleStatusData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={scheduleStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {scheduleStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <CustomDonutLegend data={scheduleStatusData} totalValue={bookings.length} />
                  </div>
                ) : (
                  <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                    <p>{t('reports.charts.noBookingData')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ✅ UPDATED: Booking Statistics (Grid with colored boxes) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {t('reports.charts.bookingStats')}
                </CardTitle>
                <CardDescription>{t('reports.charts.detailedCount')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Row 1: Pending & Confirmed */}
                  <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm text-amber-800 dark:text-amber-300 mb-1">{t('reports.status.paymentPending')}</p>
                         <p className="text-3xl font-bold text-amber-800 dark:text-amber-300">
                           {bookings.filter(b => {
                             const info = getCancellationInfo(b);
                             return (b.status === 'payment_pending' || b.status === 'pending_approval') && !info.isCancelled;
                           }).length}
                         </p>
                       </div>
                       <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>

                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm text-green-800 dark:text-green-300 mb-1">{t('reports.status.paymentConfirmed')}</p>
                         <p className="text-3xl font-bold text-green-800 dark:text-green-300">
                           {bookings.filter(b => {
                             const info = getCancellationInfo(b);
                             return (b.status === 'payment_confirmed' || b.status === 'completed') && !info.isCancelled;
                           }).length}
                         </p>
                       </div>
                       <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>

                  {/* Row 2: Approved & Recommended */}
                   <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm text-emerald-800 dark:text-emerald-300 mb-1">{t('reports.status.approved')}</p>
                         <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-300">
                           {bookings.filter(b => {
                             const info = getCancellationInfo(b);
                             return b.status === 'approved' && !info.isCancelled;
                           }).length}
                         </p>
                       </div>
                       <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg border border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm text-cyan-800 dark:text-cyan-300 mb-1">{t('reports.status.recommended')}</p>
                         <p className="text-3xl font-bold text-cyan-800 dark:text-cyan-300">
                           {bookings.filter(b => {
                             const info = getCancellationInfo(b);
                             return b.status === 'recommended' && !info.isCancelled;
                           }).length}
                         </p>
                       </div>
                       <TrendingUp className="w-6 h-6 text-cyan-600" />
                    </div>
                  </div>

                  {/* Row 3: Cancelled (Full Width) */}
                  <div className="md:col-span-2 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm text-red-800 dark:text-red-300 mb-1">{t('reports.status.cancelled')}</p>
                         <p className="text-3xl font-bold text-red-800 dark:text-red-300">
                           {totalCancelled}
                         </p>
                       </div>
                       <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoice Status Distribution */}
{/* Invoice Status Distribution */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  {t('reports.charts.invoiceStatusDist')}
                </CardTitle>
                <CardDescription>{t('reports.charts.paymentStatusOverview')}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                {/* ✅ UPDATED: 
                   1. Mixed 'pendingPaymentsCount' into the data so it matches the Pending Card.
                   2. Filter > 0 to hide empty segments.
                */}
                {(() => {
                  const chartData = [
                    { name: t('reports.status.paid'), value: analytics.invoices.paid, color: '#10B981' },
                    { name: t('reports.status.pending'), value: pendingPaymentsCount, color: '#F59E0B' }, // Uses Booking Pending Count
                    { name: t('reports.status.overdue'), value: analytics.invoices.overdue, color: '#EF4444' },
                    { name: t('reports.status.refunded'), value: analytics.invoices.refunded || 0, color: '#8B5CF6' },
                  ]
                    .filter((item) => item.value > 0)
                    .sort((a, b) => b.value - a.value);

                  const totalCount = chartData.reduce((acc, curr) => acc + curr.value, 0);

                  return totalCount > 0 ? (
                    <div className="flex flex-col items-center justify-center gap-6">
                      {/* ✅ BIGGER CHART */}
                      <div className="w-full h-[350px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={90} // Increased thickness
                              outerRadius={130} // Bigger size
                              paddingAngle={4}
                              dataKey="value"
                              stroke="none"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                              }}
                              itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* ✅ CENTERED LEGEND */}
                      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                        {chartData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full ring-2 ring-transparent"
                              style={{ backgroundColor: item.color }}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium leading-none">{item.name}</span>
                              <span className="text-xs text-muted-foreground mt-1">
                                {item.value} ({Math.round((item.value / totalCount) * 100)}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <PieChartIcon className="w-10 h-10 opacity-20" />
                        <p>{t('reports.charts.noInvoiceData')}</p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {t('reports.charts.revenueBreakdown')}
                </CardTitle>
                <CardDescription>{t('reports.charts.financialSummary')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Row 1: Total Revenue (Base + Extra) & Paid Count */}
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm text-green-800 dark:text-green-300 mb-1">
                          {t('reports.labels.totalRevenue')}
                        </p>
                        <p className="text-3xl font-bold text-green-800 dark:text-green-300">
                          Rs. {formatAmount(totalRevenue)}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    
                    {/* Breakdown */}
                    <div className="space-y-1 pt-3 border-t border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-700 dark:text-green-400">{t('reports.labels.baseRevenue')}:</span>
                        <span className="font-medium text-green-800 dark:text-green-300">
                          Rs. {formatAmount(analytics.invoices.totalRevenue)}
                        </span>
                      </div>
                      {totalExtraCharges > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-amber-700 dark:text-amber-400">{t('reports.labels.extraCharges')}:</span>
                          <span className="font-medium text-amber-800 dark:text-amber-300">
                            + Rs. {formatAmount(totalExtraCharges)}
                          </span>
                        </div>
                      )}
                      <div className="pt-1">
                        <span className="text-xs text-green-600 dark:text-green-500">
                          {analytics.invoices.paid} {t('reports.labels.invoicesPaid')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Refunded Amount */}
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-800 dark:text-purple-300 mb-1">
                          {t('reports.labels.refunded')}
                        </p>
                        <p className="text-xl font-bold text-purple-800 dark:text-purple-300">
                          Rs. {formatAmount(analytics.invoices.refundedAmount || 0)}
                        </p>
                      </div>
                      <Undo2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-right mt-2">
                      <p className="text-xs text-purple-600 dark:text-purple-500">
                        {analytics.invoices.refunded || 0} {t('reports.labels.invoices')}
                      </p>
                    </div>
                  </div>

                  {/* Row 2: Pending & Overdue */}
                  <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-800 dark:text-amber-300 mb-1">
                          {t('reports.labels.pending')}
                        </p>
                        {/* ✅ Uses the fixed variable name and formatter */}
                        <p className="text-xl font-bold text-amber-800 dark:text-amber-300">
                          Rs. {formatAmount(pendingPaymentsAmount)}
                        </p>
                      </div>
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="text-right mt-2">
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        {bookings.filter(b => {
                          const info = getCancellationInfo(b);
                          return b.status === 'payment_pending' && !info.isCancelled;
                        }).length} {t('reports.labels.bookings')}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-800 dark:text-red-300 mb-1">
                          {t('reports.labels.overdue')}
                        </p>
                        <p className="text-xl font-bold text-red-800 dark:text-red-300">
                          Rs. {formatAmount(analytics.invoices.overdueAmount || 0)}
                        </p>
                      </div>
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="text-right mt-2">
                      <p className="text-xs text-red-600 dark:text-red-500">
                        {analytics.invoices.overdue || 0} {t('reports.labels.invoices')}
                      </p>
                    </div>
                  </div>

                  {/* Net Revenue (Full Width) */}
                  <div className="md:col-span-2 p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-emerald-800 dark:text-emerald-300 mb-1">
                          {t('reports.labels.netRevenue')}
                        </p>
                        <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-300">
                          Rs. {formatAmount(totalRevenue - (analytics.invoices.refundedAmount || 0))}
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2">
                          {t('reports.labels.netRevenueFormula')}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-emerald-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Utilization Tab */}
        <TabsContent value="utilization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auditorium Utilization Details (Active bookings only) */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {t('reports.charts.utilizationDetails')}
                </CardTitle>
                <CardDescription>{t('reports.charts.occupancyRates')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {utilizationData.map((auditorium) => (
                    <div key={auditorium.id} className="p-5 bg-muted/50 rounded-xl border hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: auditorium.color }}
                          />
                          <span className="font-semibold text-lg">{auditorium.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-end justify-between mb-2">
                        <div>
                           <p className="text-3xl font-bold">{auditorium.bookings}</p>
                           <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mt-1">{t('reports.labels.totalBookings')}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-bold text-primary">{auditorium.utilization}%</p>
                           <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mt-1">{t('reports.labels.utilization')}</p>
                        </div>
                      </div>

                      <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${auditorium.utilization}%`,
                            backgroundColor: auditorium.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;