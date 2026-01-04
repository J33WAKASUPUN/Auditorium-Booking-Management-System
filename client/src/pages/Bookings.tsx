import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  XCircle,
  MoreHorizontal,
  Calendar,
  Users,
  Building,
  RefreshCw,
  Trash2,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { bookingService, type Booking } from '@/services/bookingService';
import BookingViewDialog from '@/components/BookingViewDialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Using keys for translation instead of hardcoded names
const auditoriumNames: Record<string, string> = {
  '1': 'auditoriums.1',
  '2': 'auditoriums.2',
  '3': 'auditoriums.3',
};

// Consistent Status Configuration
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

const Bookings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [auditoriumFilter, setAuditoriumFilter] = useState('all'); // ✅ NEW: Hall filter
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Cancel dialog state
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Permanent delete dialog state
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, statusFilter, auditoriumFilter, bookings]); // ✅ UPDATED: Added auditoriumFilter

  const fetchBookings = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await bookingService.getBookings({
        page: 1,
        limit: 100,
      });

      setBookings(response.data || []);
    } catch (error: any) {
      console.error('❌ Failed to fetch bookings:', error);
      toast({
        variant: 'destructive',
        title: t('errors.generic'),
        description: error.response?.data?.message || t('bookingsList.toasts.fetchError'),
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.clientName.toLowerCase().includes(query) ||
          booking.contactDetails.organizationName.toLowerCase().includes(query) ||
          booking._id.toLowerCase().includes(query) ||
          booking.purpose.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // ✅ NEW: Auditorium filter
    if (auditoriumFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.auditoriumId === auditoriumFilter);
    }

    setFilteredBookings(filtered);
  };

  const getStatusStyle = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatTime = (startDate: string, endDate: string) => {
    return `${format(new Date(startDate), 'HH:mm')} - ${format(new Date(endDate), 'HH:mm')}`;
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    navigate(`/bookings/${booking._id}/edit`, { state: { booking } });
  };

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelReason('');
    setIsCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;

    if (!cancelReason.trim() || cancelReason.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: t('bookingsList.toasts.validationError'),
        description: t('bookingsList.toasts.validationDesc'),
      });
      return;
    }

    setIsCancelling(true);

    try {
      await bookingService.deleteBooking(bookingToCancel, cancelReason);
      toast({
        title: t('bookingsList.toasts.cancelSuccess'),
        description: t('bookingsList.toasts.cancelSuccessDesc'),
      });
      setIsCancelDialogOpen(false);
      setBookingToCancel(null);
      setCancelReason('');
      fetchBookings(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('errors.generic'),
        description: error.response?.data?.message || t('bookingsList.toasts.cancelError'),
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePermanentDeleteClick = (bookingId: string) => {
    setBookingToDelete(bookingId);
    setIsPermanentDeleteDialogOpen(true);
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!bookingToDelete) return;

    setIsDeleting(true);

    try {
      await bookingService.permanentDeleteBooking(bookingToDelete);
      toast({
        title: t('bookingsList.toasts.deleteSuccess'),
        description: t('bookingsList.toasts.deleteSuccessDesc'),
      });
      setIsPermanentDeleteDialogOpen(false);
      setBookingToDelete(null);
      fetchBookings(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('errors.generic'),
        description: error.response?.data?.message || t('bookingsList.toasts.deleteError'),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = (booking: Booking) => {
    if (user?.role !== 'admin') return false;
    
    // Cannot edit if workflow was cancelled
    const cancellationInfo = getCancellationInfo(booking);
    if (cancellationInfo.isCancelled) return false;
    
    return ['draft', 'pending_approval'].includes(booking.status);
  };;

  const canCancel = (booking: Booking) => {
    const cancellationInfo = getCancellationInfo(booking);
    if (cancellationInfo.isCancelled) return false;
    
    if (user?.role === 'admin') {
      return booking.status !== 'cancelled' && booking.status !== 'completed';
    }
    if (booking.status === 'draft') return true;
    return false;
  };

  const canPermanentlyDelete = (booking: Booking) => {
    if (user?.role !== 'admin') return false;

    const cancellationInfo = getCancellationInfo(booking);
    
    // Can delete if:
    // 1. Admin cancelled (status === 'cancelled')
    // 2. Recommendation officer cancelled workflow
    // 3. Approval officer cancelled workflow
    return booking.status === 'cancelled' || cancellationInfo.isCancelled;
  };

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

  // Skeleton UI Component
  const BookingsSkeleton = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 w-28" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-full md:w-[220px]" />
          <Skeleton className="h-12 w-full md:w-[220px]" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12 ml-auto" />
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 flex gap-4 items-center">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-2 w-40">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <div className="space-y-2 w-32">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-8 w-8 ml-auto rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <BookingsSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('bookingsList.title')}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t('bookingsList.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-6 text-base font-medium gap-2"
            onClick={() => fetchBookings(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('bookingsList.refresh')}
          </Button>
          {user?.role === 'admin' && (
            <Button
              size="lg"
              className="h-12 px-6 text-base font-medium gap-2"
              onClick={() => navigate('/new-booking')}
            >
              <Plus className="w-5 h-5" />
              {t('bookingsList.newBooking')}
            </Button>
          )}
        </div>
      </div>

      {/* ✅ UPDATED: Filters with Hall Filter */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={`${t('common.search')}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[220px] h-12 text-base">
              <Filter className="w-5 h-5 mr-2 text-muted-foreground" />
              <SelectValue placeholder={t('bookingsList.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-base py-3">
                {t('bookingsList.allStatuses')}
              </SelectItem>
              {Object.keys(STATUS_CONFIG).map((status) => (
                <SelectItem key={status} value={status} className="text-base py-3">
                  {t(`status.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ✅ NEW: Hall/Auditorium Filter */}
          <Select value={auditoriumFilter} onValueChange={setAuditoriumFilter}>
            <SelectTrigger className="w-full md:w-[220px] h-12 text-base">
              <Building className="w-5 h-5 mr-2 text-muted-foreground" />
              <SelectValue placeholder={t('bookingsList.filterByHall')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-base py-3">
                {t('bookingsList.allHalls')}
              </SelectItem>
              {Object.keys(auditoriumNames).map((audId) => (
                <SelectItem key={audId} value={audId} className="text-base py-3">
                  {t(auditoriumNames[audId])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('bookingsList.table.bookingNo')}</th>
                <th>{t('bookingsList.table.client')}</th>
                <th>{t('bookingsList.table.org')}</th>
                <th>{t('bookingsList.table.venue')}</th>
                <th>{t('bookingsList.table.dateTime')}</th>
                <th>{t('bookingsList.table.status')}</th>
                <th>{t('bookingsList.table.attendees')}</th>
                <th>{t('bookingsList.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">{t('bookingsList.noBookings')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => {
                  const statusStyle = getStatusStyle(booking.status);
                  const StatusIcon = statusStyle.icon;
                  const cancellationInfo = getCancellationInfo(booking);

                  return (
                    <tr
                      key={booking._id}
                      className="animate-fade-in hover:bg-muted/50 cursor-default"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {/* Booking No */}
                      <td className="font-mono font-medium text-primary">
                        {booking._id.slice(-8).toUpperCase()}
                      </td>

                      {/* Client */}
                      <td>
                        <div>
                          <p className="font-medium">{booking.clientName}</p>
                        </div>
                      </td>

                      {/* Organization */}
                      <td className="text-muted-foreground">
                        {booking.contactDetails.organizationName}
                      </td>

                      {/* Venue */}
                      <td>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          {t(auditoriumNames[booking.auditoriumId])}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td>
                        <div>
                          <p className="font-medium">{formatDate(booking.startDateTime)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(booking.startDateTime, booking.endDateTime)}
                          </p>
                        </div>
                      </td>

                      {/* ✅ UPDATED: Status - Show ONLY cancellation badge if workflow cancelled */}
                      <td>
                        <div className="flex flex-col gap-1.5 items-start">
                          {cancellationInfo.isCancelled ? (
                            // ✅ Show ONLY workflow cancellation badge
                            <Badge 
                              className="gap-1 text-[11px] h-6 px-2.5 rounded-full border border-red-300 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 whitespace-nowrap w-fit shadow-none font-medium"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              {cancellationInfo.type === 'recommendation' 
                                ? t('bookingsList.status.recommendationCancelled')
                                : t('bookingsList.status.approvalCancelled')}
                            </Badge>
                          ) : (
                            // ✅ Show normal status badge
                            <Badge
                              className={cn(
                                'font-medium gap-1.5 border h-7 px-3 rounded-full whitespace-nowrap',
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

                      {/* Attendees */}
                      <td>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {booking.attendingPeopleCount}
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {/* View */}
                            <DropdownMenuItem
                              onClick={() => handleViewBooking(booking)}
                              className="py-3 text-base cursor-pointer"
                            >
                              <Eye className="w-5 h-5 mr-3" />
                              {t('bookingsList.actions.view')}
                            </DropdownMenuItem>

                            {/* Edit - Only show if allowed */}
                            {canEdit(booking) && (
                              <DropdownMenuItem
                                onClick={() => handleEditBooking(booking)}
                                className="py-3 text-base cursor-pointer"
                              >
                                <Edit className="w-5 h-5 mr-3" />
                                {t('bookingsList.actions.edit')}
                              </DropdownMenuItem>
                            )}

                            {/* Cancel - Only show if allowed */}
                            {canCancel(booking) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleCancelClick(booking._id)}
                                  className="py-3 text-base cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <XCircle className="w-5 h-5 mr-3" />
                                  {t('bookingsList.actions.cancel')}
                                </DropdownMenuItem>
                              </>
                            )}

                            {/* Permanent Delete - Show if workflow cancelled OR admin cancelled */}
                            {canPermanentlyDelete(booking) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handlePermanentDeleteClick(booking._id)}
                                  className="py-3 text-base cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-5 h-5 mr-3" />
                                  {t('bookingsList.actions.delete')}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {t('bookingsList.showing', { count: filteredBookings.length, total: bookings.length })}
          </p>
        </div>
      </div>

      {/* View Dialog */}
      {selectedBooking && (
        <BookingViewDialog
          booking={selectedBooking}
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
        />
      )}

      {/* Cancel Booking Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold flex items-center gap-2">
              <XCircle className="w-6 h-6 text-destructive" />
              {t('bookingsList.dialog.cancelTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {t('bookingsList.dialog.cancelDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason" className="text-base font-medium">
                {t('bookingsList.dialog.reasonLabel')}
              </Label>
              <Textarea
                id="cancelReason"
                placeholder={t('bookingsList.dialog.reasonPlaceholder')}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="min-h-[100px] text-base"
                disabled={isCancelling}
              />
              {cancelReason.trim().length > 0 && cancelReason.trim().length < 10 && (
                <p className="text-sm text-destructive">
                  {t('bookingsList.dialog.reasonError')}
                </p>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsCancelDialogOpen(false);
                setBookingToCancel(null);
                setCancelReason('');
              }}
              disabled={isCancelling}
              className="text-base"
            >
              {t('bookingsList.dialog.keepBooking')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isCancelling || cancelReason.trim().length < 10}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base"
            >
              {isCancelling ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t('bookingsList.dialog.cancelling')}
                </>
              ) : (
                t('bookingsList.dialog.confirmCancel')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={isPermanentDeleteDialogOpen} onOpenChange={setIsPermanentDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-destructive" />
              {t('bookingsList.dialog.deleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              <strong className="text-destructive">Warning:</strong> {t('bookingsList.dialog.deleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-foreground">
              {t('bookingsList.dialog.deleteWarning')}
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsPermanentDeleteDialogOpen(false);
                setBookingToDelete(null);
              }}
              disabled={isDeleting}
              className="text-base"
            >
              {t('bookingsList.dialog.keepRecord')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t('bookingsList.dialog.deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('bookingsList.dialog.confirmDelete')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Bookings;