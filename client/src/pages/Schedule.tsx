import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Building,
  AlertCircle,
  Filter,
  Users,
  XCircle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  FileText,
  AlertTriangle,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { bookingService, type Booking } from '@/services/bookingService';
import WorkflowStepper from '@/components/WorkflowStepper';
import PaymentConfirmationDialog from '@/components/PaymentConfirmationDialog';
import RecommendationActionDialog from '@/components/RecommendationActionDialog';
import ApprovalActionDialog from '@/components/ApprovalActionDialog';
import ShareLinkDialog from '@/components/ShareLinkDialog';
import { cn } from '@/lib/utils';

// Translation keys for auditoriums
const auditoriumNames: Record<string, string> = {
  '1': 'schedule.auditoriums.1', 
  '2': 'schedule.auditoriums.2',
  '3': 'schedule.auditoriums.3',
};

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
    icon: CheckCircle2,
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

const Schedule = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('action-required');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog States
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [bookingForPayment, setBookingForPayment] = useState<any>(null);

  const [isRecommendationDialogOpen, setIsRecommendationDialogOpen] = useState(false);
  const [bookingForRecommendation, setBookingForRecommendation] = useState<any>(null);
  const [recommendationAction, setRecommendationAction] = useState<'recommend' | 'cancel' | null>(null);

  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [bookingForApproval, setBookingForApproval] = useState<any>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'cancel' | null>(null);

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareBookingId, setShareBookingId] = useState<string | null>(null);
  const [shareLinkType, setShareLinkType] = useState<'recommendation' | 'approval' | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingService.getBookings({
        page: 1,
        limit: 100,
      });
      setBookings(response.data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('errors.generic'),
        description: t('schedule.toasts.fetchError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to determine share capability
  const canGenerateShareLink = (booking: Booking): boolean => {
    // Admin creates/shares link for Recommendation
    if (user?.role === 'admin' && booking.status === 'pending_approval') {
      return true; 
    }
    // Recommendation officer creates/shares link for Approval
    if (user?.role === 'recommendation' && booking.status === 'recommended') {
      return true; 
    }
    return false;
  };

  const getShareLinkType = (booking: Booking): 'recommendation' | 'approval' | null => {
    if (user?.role === 'admin' && booking.status === 'pending_approval') {
      return 'recommendation';
    }
    if (user?.role === 'recommendation' && booking.status === 'recommended') {
      return 'approval';
    }
    return null;
  };

  const handleShareClick = (booking: Booking) => {
    const linkType = getShareLinkType(booking);
    if (linkType) {
      setShareBookingId(booking._id);
      setShareLinkType(linkType);
      setIsShareDialogOpen(true);
    }
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

  // ✅ FIX 1: Updated Admin Logic
  // Admins need to see 'pending_approval' items in their Action list so they can SHARE them.
  const getActionRequiredItems = () => {
    if (user?.role === 'admin') {
      return bookings.filter((b) => {
        const cancellationInfo = getCancellationInfo(b);
        if (cancellationInfo.isCancelled) return false;
        
        // Admin actions: Confirm Payment OR Share Link (Pending Approval)
        return b.status === 'payment_pending' || b.status === 'pending_approval';
      });
    } else if (user?.role === 'recommendation') {
      return bookings.filter((b) => {
        const cancellationInfo = getCancellationInfo(b);
        if (cancellationInfo.isCancelled) return false;
        return b.status === 'pending_approval';
      });
    } else if (user?.role === 'approval') {
      return bookings.filter((b) => {
        const cancellationInfo = getCancellationInfo(b);
        if (cancellationInfo.isCancelled) return false;
        return b.status === 'recommended';
      });
    }
    return [];
  };

  const getAllProgressBookings = () => {
    let filtered = bookings.filter((b) => b.status !== 'draft');
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const actionRequiredItems = getActionRequiredItems();
  const allProgressItems = getAllProgressBookings();

  const getStatusStyle = (booking: Booking) => {
    const cancellationInfo = getCancellationInfo(booking);
    if (cancellationInfo.isCancelled) return STATUS_CONFIG.cancelled;
    return STATUS_CONFIG[booking.status] || STATUS_CONFIG.draft;
  };

  const getDisplayStatus = (booking: Booking) => {
    const cancellationInfo = getCancellationInfo(booking);
    if (cancellationInfo.isCancelled) return 'cancelled';
    return booking.status;
  };

  const getNextAction = (booking: Booking) => {
    const cancellationInfo = getCancellationInfo(booking);
    if (cancellationInfo.isCancelled) return null;

    if (user?.role === 'admin' && booking.status === 'payment_pending') {
      return t('schedule.actions.confirmPayment');
    } else if (user?.role === 'recommendation' && booking.status === 'pending_approval') {
      return t('schedule.actions.addRecommendation');
    } else if (user?.role === 'approval' && booking.status === 'recommended') {
      return t('schedule.actions.approveBooking');
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatTime = (startDate: string, endDate: string) => {
    return `${format(new Date(startDate), 'HH:mm')} - ${format(new Date(endDate), 'HH:mm')}`;
  };

  // --- Handlers ---

  const handleActionClick = (booking: Booking) => {
    const cancellationInfo = getCancellationInfo(booking);
    if (cancellationInfo.isCancelled) return;

    if (user?.role === 'admin' && booking.status === 'payment_pending') {
      setBookingForPayment({
        _id: booking._id,
        clientName: booking.clientName,
        auditoriumId: booking.auditoriumId,
        startDateTime: booking.startDateTime,
        endDateTime: booking.endDateTime,
        purpose: booking.purpose,
        amount: booking.amount,
        attendingPeopleCount: booking.attendingPeopleCount,
      });
      setIsPaymentDialogOpen(true);
    }
    else if (user?.role === 'recommendation' && booking.status === 'pending_approval') {
      setBookingForRecommendation({
        _id: booking._id,
        clientName: booking.clientName,
        auditoriumId: booking.auditoriumId,
        startDateTime: booking.startDateTime,
        endDateTime: booking.endDateTime,
        purpose: booking.purpose,
        amount: booking.amount,
        attendingPeopleCount: booking.attendingPeopleCount,
        contactDetails: booking.contactDetails,
      });
      setRecommendationAction('recommend');
      setIsRecommendationDialogOpen(true);
    }
    else if (user?.role === 'approval' && booking.status === 'recommended') {
      setBookingForApproval({
        _id: booking._id,
        clientName: booking.clientName,
        auditoriumId: booking.auditoriumId,
        startDateTime: booking.startDateTime,
        endDateTime: booking.endDateTime,
        purpose: booking.purpose,
        amount: booking.amount,
        attendingPeopleCount: booking.attendingPeopleCount,
        contactDetails: booking.contactDetails,
      });
      setApprovalAction('approve');
      setIsApprovalDialogOpen(true);
    }
  };

  const handleCancelClick = (booking: Booking) => {
    const cancellationInfo = getCancellationInfo(booking);
    if (cancellationInfo.isCancelled) return;

    if (user?.role === 'recommendation' && booking.status === 'pending_approval') {
      setBookingForRecommendation({
        _id: booking._id,
        clientName: booking.clientName,
        auditoriumId: booking.auditoriumId,
        startDateTime: booking.startDateTime,
        endDateTime: booking.endDateTime,
        purpose: booking.purpose,
        amount: booking.amount,
        attendingPeopleCount: booking.attendingPeopleCount,
        contactDetails: booking.contactDetails,
      });
      setRecommendationAction('cancel');
      setIsRecommendationDialogOpen(true);
    } else if (user?.role === 'approval' && booking.status === 'recommended') {
      setBookingForApproval({
        _id: booking._id,
        clientName: booking.clientName,
        auditoriumId: booking.auditoriumId,
        startDateTime: booking.startDateTime,
        endDateTime: booking.endDateTime,
        purpose: booking.purpose,
        amount: booking.amount,
        attendingPeopleCount: booking.attendingPeopleCount,
        contactDetails: booking.contactDetails,
      });
      setApprovalAction('cancel');
      setIsApprovalDialogOpen(true);
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: t('schedule.toasts.paymentSuccess'),
      description: t('schedule.toasts.paymentSuccessDesc'),
    });
    fetchBookings();
  };

  const handleRecommendationSuccess = () => {
    fetchBookings();
  };

  const handleApprovalSuccess = () => {
    fetchBookings();
  };

  // Skeleton UI
  const ScheduleSkeleton = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="bg-muted rounded-lg p-1 w-full max-w-md h-12 flex">
        <Skeleton className="flex-1 h-full rounded-md" />
        <Skeleton className="flex-1 h-full rounded-md ml-1" />
      </div>
      <div className="space-y-4 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-3" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) return <ScheduleSkeleton />;

  const renderBookingCard = (booking: Booking, showActions: boolean = false) => {
    const nextAction = getNextAction(booking);
    const cancellationInfo = getCancellationInfo(booking);
    const displayStatus = getDisplayStatus(booking);
    const statusStyle = getStatusStyle(booking);
    const StatusIcon = statusStyle.icon;
    
    // Check if share is possible
    const canShare = canGenerateShareLink(booking);

    // precise logic for when to show the cancel button
    const canCancel = 
      (user?.role === 'recommendation' && booking.status === 'pending_approval') ||
      (user?.role === 'approval' && booking.status === 'recommended');
    
    // Show container if actions requested AND (nextAction exists OR sharing is possible)
    const shouldShowActionContainer = showActions && !cancellationInfo.isCancelled && (nextAction || canShare || canCancel);

    return (
      <div
        key={booking._id}
        className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow animate-fade-in"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-1.5 rounded-full", statusStyle.bgColor)}>
                <StatusIcon className={cn("w-5 h-5", statusStyle.textColor)} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {cancellationInfo.isCancelled ? (
                  <Badge 
                    className={cn(
                      'font-medium gap-1.5 border h-7 px-3 rounded-full',
                      STATUS_CONFIG.cancelled.color,
                      STATUS_CONFIG.cancelled.bgColor,
                      STATUS_CONFIG.cancelled.textColor
                    )}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {cancellationInfo.type === 'recommendation' 
                      ? t('schedule.status.recommendationCancelled')
                      : t('schedule.status.approvalCancelled')}
                  </Badge>
                ) : (
                  <Badge
                    className={cn(
                      'font-medium gap-1.5 border h-7 px-3 rounded-full',
                      statusStyle.color,
                      statusStyle.bgColor,
                      statusStyle.textColor
                    )}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {t(`status.${displayStatus}`)}
                  </Badge>
                )}
                
                <span className="text-xs text-muted-foreground font-mono">
                  #{booking._id.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">{booking.clientName}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{booking.purpose}</p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="w-4 h-4" />
                {t(auditoriumNames[booking.auditoriumId])}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {formatDate(booking.startDateTime)}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {formatTime(booking.startDateTime, booking.endDateTime)}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                {booking.attendingPeopleCount} {t('schedule.attendees')}
              </div>
            </div>

            {cancellationInfo.isCancelled && cancellationInfo.reason && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-destructive mb-1">
                      {cancellationInfo.type === 'recommendation' 
                        ? t('schedule.cancellation.recommendationTitle')
                        : t('schedule.cancellation.approvalTitle')}
                    </p>
                    <p className="text-sm text-foreground">
                      {cancellationInfo.reason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {shouldShowActionContainer && (
            <div className="flex items-center justify-end gap-3 flex-wrap">
              {/* Share Button */}
              {canShare && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareClick(booking);
                  }}
                  className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Share2 className="w-4 h-4" />
                  {t('schedule.actions.share')}
                </Button>
              )}

              {/* Cancel Button */}
              {canCancel && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelClick(booking);
                  }}
                  className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="w-4 h-4" />
                  {t('schedule.actions.cancel')}
                </Button>
              )}

              {/* Primary Action Button */}
              {nextAction && (
                <Button 
                  size="lg" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionClick(booking);
                  }}
                  className="gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {nextAction}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t mt-4">
          <WorkflowStepper
            currentStatus={booking.status}
            recommendationStatus={booking.recommendationStatus}
            approvalStatus={booking.approvalStatus}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('schedule.title')}</h1>
        <p className="text-lg text-muted-foreground mt-1">
          {user?.role === 'admin' && t('schedule.descriptions.admin')}
          {user?.role === 'recommendation' && t('schedule.descriptions.recommendation')}
          {user?.role === 'approval' && t('schedule.descriptions.approval')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-12 p-1">
          <TabsTrigger value="action-required" className="h-10 px-6 text-base gap-2">
            <AlertCircle className="w-4 h-4" />
            {t('schedule.tabs.actionRequired')}
            {actionRequiredItems.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1.5">
                {actionRequiredItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all-progress" className="h-10 px-6 text-base gap-2">
            <Calendar className="w-4 h-4" />
            {t('schedule.tabs.allProgress')}
            <Badge variant="secondary" className="ml-2 h-6 px-2">
              {allProgressItems.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="action-required" className="mt-6">
          <div className="space-y-4">
            {actionRequiredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('schedule.empty.caughtUpTitle')}</h3>
                <p className="text-muted-foreground max-w-md">{t('schedule.empty.caughtUpDesc')}</p>
              </div>
            ) : (
              actionRequiredItems.map((booking) => renderBookingCard(booking, true))
            )}
          </div>
        </TabsContent>

        <TabsContent value="all-progress" className="mt-6">
          <div className="mb-6 flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[240px] h-11 text-base">
                <SelectValue placeholder={t('schedule.filters.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-base py-3">
                  {t('schedule.filters.allStatuses')}
                </SelectItem>
                {Object.keys(STATUS_CONFIG)
                  .filter(status => status !== 'draft')
                  .map((status) => (
                    <SelectItem key={status} value={status} className="text-base py-3">
                      {t(`status.${status}`)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {allProgressItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <Calendar className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('schedule.noBookings.title')}</h3>
                <p className="text-muted-foreground max-w-md">{t('schedule.noBookings.description')}</p>
              </div>
            ) : (
              // ✅ FIX 3: Pass true here so "All Progress" items can also show share buttons
              allProgressItems.map((booking) => renderBookingCard(booking, true))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <PaymentConfirmationDialog
        booking={bookingForPayment}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onSuccess={handlePaymentSuccess}
      />

      <RecommendationActionDialog
        booking={bookingForRecommendation}
        open={isRecommendationDialogOpen}
        onOpenChange={setIsRecommendationDialogOpen}
        onSuccess={handleRecommendationSuccess}
        actionType={recommendationAction}
      />

      <ApprovalActionDialog
        booking={bookingForApproval}
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
        onSuccess={handleApprovalSuccess}
        actionType={approvalAction}
      />

      {shareBookingId && shareLinkType && (
        <ShareLinkDialog
          scheduleId={shareBookingId}
          linkType={shareLinkType}
          open={isShareDialogOpen}
          onOpenChange={(open) => {
            setIsShareDialogOpen(open);
            if (!open) {
              setShareBookingId(null);
              setShareLinkType(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default Schedule;