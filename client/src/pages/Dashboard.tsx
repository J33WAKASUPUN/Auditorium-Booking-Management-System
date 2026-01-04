import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Plus,
  CheckCircle,
  FileText,
  Users,
  Building,
  ArrowRight,
  Activity,
  XCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { bookingService, type Booking } from '@/services/bookingService';
import { paymentService, type Invoice } from '@/services/paymentService';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// Using translation keys for auditorium names (Mapped in Common JSON)
const auditoriumNames: Record<string, string> = {
  '1': 'auditoriums.1',
  '2': 'auditoriums.2',
  '3': 'auditoriums.3',
};

const AUDITORIUM_COLORS: Record<string, string> = {
  '1': '#4472C4',
  '2': '#ED7D31',
  '3': '#A5A5A5',
};

// Using translation keys for Status (Mapped in Common JSON)
const STATUS_CONFIG: Record<
  string,
  { color: string; bgColor: string; textColor: string; icon: any }
> = {
  draft: {
    color: 'border-gray-300 dark:border-gray-700',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    textColor: 'text-gray-800 dark:text-gray-300',
    icon: FileText,
  },
  pending_approval: {
    color: 'border-blue-300 dark:border-blue-700',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-800 dark:text-blue-300',
    icon: Clock,
  },
  recommended: {
    color: 'border-cyan-300 dark:border-cyan-700',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    textColor: 'text-cyan-800 dark:text-cyan-300',
    icon: TrendingUp,
  },
  approved: {
    color: 'border-green-300 dark:border-green-700',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-800 dark:text-green-300',
    icon: CheckCircle2,
  },
  payment_pending: {
    color: 'border-amber-300 dark:border-amber-700',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-800 dark:text-amber-300',
    icon: DollarSign,
  },
  payment_confirmed: {
    color: 'border-emerald-300 dark:border-emerald-700',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-800 dark:text-emerald-300',
    icon: CheckCircle,
  },
  completed: {
    color: 'border-green-300 dark:border-green-700',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-800 dark:text-green-300',
    icon: CheckCircle2,
  },
  cancelled: {
    color: 'border-red-300 dark:border-red-700',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-800 dark:text-red-300',
    icon: XCircle,
  },
};

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [bookingsResponse, invoicesResponse] = await Promise.all([
        bookingService.getBookings({ page: 1, limit: 100 }),
        paymentService.getInvoices(undefined, 1, 100),
      ]);

      setBookings(bookingsResponse.data || []);
      setInvoices(invoicesResponse.data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load dashboard data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATED: Helper - Cancellation Info (Same as Reports)
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

  // ✅ UPDATED: Filter Active Bookings (Exclude ALL cancellations)
  const activeBookings = bookings.filter((b) => {
    const info = getCancellationInfo(b);
    return !info.isCancelled;
  });

  // ✅ UPDATED: Calculate Statistics (Same logic as Reports)
  const totalBookings = activeBookings.length; // ✅ Only active bookings

  const approvedBookings = bookings.filter((b) => {
    const info = getCancellationInfo(b);
    return b.status === 'approved' && !info.isCancelled;
  }).length;

  const completedBookings = bookings.filter((b) => {
    const info = getCancellationInfo(b);
    return (b.status === 'completed' || b.status === 'payment_confirmed') && !info.isCancelled;
  }).length;
  
  // ✅ Calculate Total Cancellations (Admin + Recommendation + Approval)
  const adminCancelledCount = bookings.filter(b => getCancellationInfo(b).isAdminCancelled).length;
  const recCancelledCount = bookings.filter(b => getCancellationInfo(b).isRecommendationCancelled).length;
  const appCancelledCount = bookings.filter(b => getCancellationInfo(b).isApprovalCancelled).length;
  const totalCancelled = adminCancelledCount + recCancelledCount + appCancelledCount;

  // ✅ UPDATED: Pending Actions (Exclude cancelled workflows)
  const pendingActions = bookings.filter((b) => {
    const cancelInfo = getCancellationInfo(b);
    if (cancelInfo.isCancelled) return false;

    if (user?.role === 'admin') return b.status === 'payment_pending';
    if (user?.role === 'recommendation') return b.status === 'pending_approval';
    if (user?.role === 'approval') return b.status === 'recommended';
    return false;
  }).length;

  // Upcoming Events (Only approved, not cancelled)
  const upcomingEvents = bookings.filter((b) => {
    const info = getCancellationInfo(b);
    if (info.isCancelled) return false;
    
    // Check for payment_confirmed or completed (not 'approved')
    if (b.status !== 'payment_confirmed' && b.status !== 'completed') return false;
    
    const eventDate = new Date(b.startDateTime);
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return eventDate >= now && eventDate <= futureDate;
  }).length;

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingRevenue = bookings
    .filter((b) => {
      const info = getCancellationInfo(b);
      return b.status === 'payment_pending' && !info.isCancelled;
    })
    .reduce((sum, b) => sum + b.amount, 0);

  // ✅ UPDATED: Booking Status Distribution (Same as Reports)
  const statusDistribution = [
    { 
      name: t('status.payment_confirmed'), 
      value: bookings.filter((b) => {
        const info = getCancellationInfo(b);
        return (b.status === 'payment_confirmed' || b.status === 'completed') && !info.isCancelled;
      }).length, 
      color: '#10B981' 
    },
    { 
      name: t('status.approved'), 
      value: approvedBookings, 
      color: '#059669' 
    },
    {
      name: t('status.recommended'),
      value: bookings.filter((b) => {
        const info = getCancellationInfo(b);
        return b.status === 'recommended' && !info.isCancelled;
      }).length,
      color: '#06B6D4',
    },
    {
      name: t('status.payment_pending'),
      value: bookings.filter((b) => {
        const info = getCancellationInfo(b);
        return (b.status === 'payment_pending' || b.status === 'pending_approval') && !info.isCancelled;
      }).length,
      color: '#F59E0B',
    },
    {
      name: t('status.draft'),
      value: bookings.filter((b) => {
        const info = getCancellationInfo(b);
        return b.status === 'draft' && !info.isCancelled;
      }).length,
      color: '#9CA3AF',
    },
    // ✅ Aggregated Cancelled Slice
    { 
      name: t('status.cancelled'), 
      value: totalCancelled, 
      color: '#EF4444' 
    },
  ].filter((item) => item.value > 0);

  // ✅ UPDATED: Auditorium Utilization (Only active bookings)
  const auditoriumStats = Object.keys(auditoriumNames).map((audId) => {
    const audBookings = activeBookings.filter((b) => b.auditoriumId === audId);
    return {
      name: t(auditoriumNames[audId]),
      bookings: audBookings.length,
      color: AUDITORIUM_COLORS[audId],
    };
  });

  // ✅ UPDATED: Monthly Trend (Exclude cancelled bookings)
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const monthBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.createdAt);
      const info = getCancellationInfo(b);
      
      return bookingDate >= monthStart && 
             bookingDate <= monthEnd && 
             !info.isCancelled;
    });

    const monthRevenue = invoices
      .filter((inv) => {
        if (inv.status !== 'paid' || !inv.paidDate) return false;
        const paidDate = new Date(inv.paidDate);
        return paidDate >= monthStart && paidDate <= monthEnd;
      })
      .reduce((sum, inv) => sum + inv.amount, 0);

    return {
      month: format(monthStart, 'MMM'),
      bookings: monthBookings.length,
      revenue: monthRevenue / 1000,
    };
  });

  // --- Recent Activity (Last 5 Bookings) ---
  const recentBookings = [...bookings]
    .filter((b) => b.status !== 'draft')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusStyle = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-12 w-40" />
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-9 w-32 mb-3" />
              <Skeleton className="h-4 w-40" />
            </Card>
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="flex flex-col lg:flex-row items-center gap-6">
              <Skeleton className="h-[200px] w-[200px] rounded-full" />
              <div className="space-y-3 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8 ml-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auditorium Utilization Skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-9 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity Table Skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 border-b pb-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-2 items-center">
                  <Skeleton className="h-4 w-20" />
                  <div className="space-y-2 w-40">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-8 w-20 ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('dashboard.title')}
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t('dashboard.welcome', { name: user?.name })}
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button
            size="lg"
            className="h-12 px-6 text-base font-medium gap-2"
            onClick={() => navigate('/new-booking')}
          >
            <Plus className="w-5 h-5" />
            {t('dashboard.newBooking')}
          </Button>
        )}
      </div>

      {/* ✅ UPDATED: Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings - Only Active */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/bookings')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CalendarDays className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-muted-foreground">{t('dashboard.totalBookings')}</p>
          <p className="text-3xl font-bold mt-2">{totalBookings}</p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-green-600 font-medium flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {completedBookings} {t('dashboard.completed')}
            </span>
          </div>
        </Card>

        {/* Pending Actions */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/schedule')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            {pendingActions > 0 && <AlertCircle className="w-5 h-5 text-amber-600" />}
          </div>
          <p className="text-sm text-muted-foreground">
            {user?.role === 'admin'
              ? t('dashboard.pendingPayments')
              : user?.role === 'recommendation'
              ? t('dashboard.pendingRecommendations')
              : t('dashboard.pendingApprovals')}
          </p>
          <p className="text-3xl font-bold mt-2">{pendingActions}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {pendingActions > 0 ? t('dashboard.actionRequired') : t('dashboard.allCaughtUp')}
          </p>
        </Card>

        {/* Total Revenue */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/payments')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-muted-foreground">{t('dashboard.totalRevenue')}</p>
          <p className="text-3xl font-bold mt-2">Rs. {(totalRevenue / 1000000).toFixed(2)}M</p>
          <div className="mt-3 text-sm">
            <span className="text-amber-600 font-medium">
              Rs. {(pendingRevenue / 1000).toFixed(0)}K {t('dashboard.revenuePending')}
            </span>
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/calendar')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-muted-foreground">{t('dashboard.upcomingEvents')}</p>
          <p className="text-3xl font-bold mt-2">{upcomingEvents}</p>
          <p className="mt-3 text-sm text-muted-foreground">{t('dashboard.next30Days')}</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t('dashboard.monthlyActivity')}
            </CardTitle>
            <CardDescription>{t('dashboard.monthlyActivityDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A273D1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A273D1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#A273D1"
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                  strokeWidth={2}
                  name="Bookings"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                  name="Revenue (K)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('dashboard.bookingStatus')}
            </CardTitle>
            <CardDescription>{t('dashboard.bookingStatusDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {statusDistribution.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-6 justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 min-w-[180px]">
                  {statusDistribution.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-sm flex-1 truncate">{item.name}</span>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">{t('dashboard.noData')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Auditorium Utilization */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              {t('dashboard.auditoriumUtilization')}
            </CardTitle>
            <CardDescription>{t('dashboard.utilizationDesc')}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            {t('dashboard.viewDetails')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditoriumStats.map((aud) => (
              <div key={aud.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: aud.color }} />
                    <span className="font-medium">{aud.name}</span>
                  </div>
                  <span className="text-sm font-bold">{aud.bookings} {t('dashboard.bookingsCount')}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${activeBookings.length > 0 ? (aud.bookings / activeBookings.length) * 100 : 0}%`,
                      backgroundColor: aud.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t('dashboard.recentActivity')}
            </CardTitle>
            <CardDescription>{t('dashboard.recentActivityDesc')}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>
            {t('dashboard.viewAll')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t('dashboard.noRecentActivity')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('dashboard.table.id')}</th>
                    <th>{t('dashboard.table.client')}</th>
                    <th>{t('dashboard.table.venue')}</th>
                    <th>{t('dashboard.table.date')}</th>
                    <th>{t('dashboard.table.status')}</th>
                    <th>{t('dashboard.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking, index) => {
                    const statusStyle = getStatusStyle(booking.status);
                    const StatusIcon = statusStyle.icon;
                    const cancellationInfo = getCancellationInfo(booking);

                    return (
                      <tr
                        key={booking._id}
                        className="animate-fade-in cursor-pointer hover:bg-muted/50"
                        style={{ animationDelay: `${index * 30}ms` }}
                        onClick={() => navigate('/bookings')}
                      >
                        <td className="font-mono font-medium text-primary">
                          {booking._id.slice(-8).toUpperCase()}
                        </td>
                        <td>
                          <div>
                            <p className="font-medium">{booking.clientName}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {booking.purpose}
                            </p>
                          </div>
                        </td>
                        <td className="text-muted-foreground">
                          {t(auditoriumNames[booking.auditoriumId])}
                        </td>
                        <td className="text-muted-foreground">{formatDate(booking.startDateTime)}</td>
                        <td>
                          <div className="flex flex-col gap-1 items-start">
                            {/* ✅ UPDATED: Show ONLY cancellation badge if workflow cancelled */}
                            {cancellationInfo.isCancelled ? (
                              <Badge 
                                className="gap-1 rounded-full border border-red-300 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 whitespace-nowrap shadow-none font-medium hover:bg-red-100 dark:hover:bg-red-900/30 text-[11px] h-6 px-2.5"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                {cancellationInfo.type === 'recommendation' 
                                  ? t('dashboard.recCancelled')
                                  : t('dashboard.appCancelled')}
                              </Badge>
                            ) : (
                              <Badge
                                className={cn(
                                  'font-medium gap-1.5 border rounded-full px-3 py-1',
                                  statusStyle.color,
                                  statusStyle.bgColor,
                                  statusStyle.textColor
                                )}
                              >
                                <StatusIcon className="w-3.5 h-3.5" />
                                {t(`status.${booking.status}`)}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-3 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/bookings');
                            }}
                          >
                            {t('dashboard.viewDetails')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;