import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  FileText,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  DollarSign,
  Undo2,
  MoreVertical, // ✅ Added
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
} from '@/components/ui/dropdown-menu'; // ✅ Added
import { useToast } from '@/hooks/use-toast';
import { paymentService, type Invoice } from '@/services/paymentService';
import PaymentViewDialog from '@/components/PaymentViewDialog';
import RefundInvoiceDialog from '@/components/RefundInvoiceDialog';
import AddExtraChargeDialog from '@/components/AddExtraChargeDialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';

const auditoriumNames: Record<string, string> = {
  '1': 'auditoriums.1',
  '2': 'auditoriums.2',
  '3': 'auditoriums.3',
};

const STATUS_CONFIG: Record<
  string,
  { color: string; bgColor: string; textColor: string; icon: any }
> = {
  pending: {
    color: 'border-amber-300 dark:border-amber-700',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-800 dark:text-amber-300',
    icon: Clock,
  },
  paid: {
    color: 'border-green-300 dark:border-green-700',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-800 dark:text-green-300',
    icon: CheckCircle2,
  },
  overdue: {
    color: 'border-red-300 dark:border-red-700',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-800 dark:text-red-300',
    icon: AlertCircle,
  },
  cancelled: {
    color: 'border-gray-300 dark:border-gray-700',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    textColor: 'text-gray-800 dark:text-gray-300',
    icon: XCircle,
  },
  refunded: {
    color: 'border-purple-300 dark:border-purple-700',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-800 dark:text-purple-300',
    icon: Undo2,
  },
};

const Payments = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [auditoriumFilter, setAuditoriumFilter] = useState('all');

  // Dialog States
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isExtraChargeDialogOpen, setIsExtraChargeDialogOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchQuery, statusFilter, auditoriumFilter, invoices]);

  const fetchInvoices = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await paymentService.getInvoices(undefined, 1, 100);
      setInvoices(response.data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('errors.generic'),
        description: t('payments.toasts.fetchError'),
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(query) ||
          invoice.scheduleId?.clientName.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    if (auditoriumFilter !== 'all') {
      filtered = filtered.filter((invoice) => invoice.scheduleId?.auditoriumId === auditoriumFilter);
    }

    setFilteredInvoices(filtered);
  };

  const getStatusStyle = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const isRefundEligible = (invoice: Invoice): boolean => {
    if (user?.role !== 'admin') return false;
    if (invoice.status !== 'paid') return false;
    if (invoice.isRefunded) return false;
    const bookingStatus = invoice.scheduleId?.status;
    if (bookingStatus !== 'cancelled') return false;
    return true;
  };

  const handleRefundSuccess = () => {
    fetchInvoices(true);
  };

  // ✅ UPDATED: Check if extra charge can be added (hide if already has extra charges)
  const canAddExtraCharge = (invoice: Invoice): boolean => {
    // Must be admin
    if (user?.role !== 'admin') return false;
    
    // Invoice must be paid
    if (invoice.status !== 'paid') return false;
    
    // ✅ Check: Hide button if extra charges already exist
    if (invoice.extraCharges && invoice.extraCharges.length > 0) return false;
    
    // Booking must be completed or payment confirmed
    const bookingStatus = invoice.scheduleId?.status;
    return bookingStatus === 'completed' || bookingStatus === 'payment_confirmed';
  };

  // ✅ NEW: Check if invoice has extra charges
  const hasExtraCharges = (invoice: Invoice): boolean => {
    return !!(invoice.extraCharges && invoice.extraCharges.length > 0);
  };

  const handleExtraChargeSuccess = () => {
    fetchInvoices(true);
  };

  const PaymentsSkeleton = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-12 w-32" />
      </div>
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-full md:w-[220px]" />
          <Skeleton className="h-12 w-full md:w-[220px]" />
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <PaymentsSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('payments.title')}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t('payments.subtitle')}
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="h-12 px-6 text-base font-medium gap-2"
          onClick={() => fetchInvoices(true)}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t('payments.refresh')}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t('payments.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[220px] h-12 text-base">
              <Filter className="w-5 h-5 mr-2 text-muted-foreground" />
              <SelectValue placeholder={t('payments.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-base py-3">
                {t('payments.allStatuses')}
              </SelectItem>
              {Object.keys(STATUS_CONFIG).map((status) => (
                <SelectItem key={status} value={status} className="text-base py-3">
                  {t(`status.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Auditorium Filter */}
          <Select value={auditoriumFilter} onValueChange={setAuditoriumFilter}>
            <SelectTrigger className="w-full md:w-[220px] h-12 text-base">
              <Building className="w-5 h-5 mr-2 text-muted-foreground" />
              <SelectValue placeholder={t('payments.filterByHall')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-base py-3">
                {t('payments.allHalls')}
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

      {/* Payments Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('payments.table.invoiceNo')}</th>
                <th>{t('payments.table.client')}</th>
                <th>{t('payments.table.auditorium')}</th>
                <th>{t('payments.table.eventDate')}</th>
                <th>{t('payments.table.amount')}</th>
                <th>{t('payments.table.status')}</th>
                <th>{t('payments.table.paymentDate')}</th>
                <th>{t('payments.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">{t('payments.noInvoices')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice, index) => {
                  const statusStyle = getStatusStyle(invoice.status);
                  const StatusIcon = statusStyle.icon;
                  const canRefund = isRefundEligible(invoice);
                  const canAddExtra = canAddExtraCharge(invoice);
                  const hasExtra = hasExtraCharges(invoice);

                  return (
                    <tr
                      key={invoice._id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="font-mono font-medium text-primary">
                        {invoice.invoiceNumber}
                      </td>
                      <td>
                        <div>
                          <p className="font-medium">{invoice.scheduleId?.clientName}</p>
                        </div>
                      </td>
                      <td className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          {t(auditoriumNames[invoice.scheduleId?.auditoriumId])}
                        </div>
                      </td>
                      <td className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(invoice.scheduleId?.startDateTime)}
                        </div>
                      </td>

                      {/* ✅ UPDATED: Amount Column - Show Original Amount Only */}
                      <td className="align-middle">
                        <div className="flex flex-col justify-center">
                        {/* Original Amount */}
                          <div className="flex items-center gap-1 font-semibold">
                            <span>Rs. {invoice.amount.toLocaleString()}</span>
                          </div>

                        {/* Extra Charge (Only visible if > 0) */}
                         {invoice.totalExtraCharges && invoice.totalExtraCharges > 0 && (
                         <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 mt-1 pl-5">
                            <span>+ Rs. {invoice.totalExtraCharges.toLocaleString()}</span>
                        </div>
                         )}
                        </div>
                       </td>

                      <td>
                        <Badge
                          className={cn(
                            'font-medium gap-1.5 border',
                            statusStyle.color,
                            statusStyle.bgColor,
                            statusStyle.textColor
                          )}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {t(`status.${invoice.status}`)}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground">
                        {invoice.paidDate ? formatDate(invoice.paidDate) : '-'}
                      </td>

                      {/* ✅ UPDATED: Actions Column - Use Dropdown Menu */}
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            {/* View Details */}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsViewDialogOpen(true);
                              }}
                              className="py-3 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-3" />
                              {t('payments.actions.view')}
                            </DropdownMenuItem>

                            {/* ✅ NEW: View Extra Charges - Only show if extra charges exist */}
                            {hasExtra && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setIsViewDialogOpen(true);
                                }}
                                className="py-3 cursor-pointer text-amber-600 dark:text-amber-400"
                              >
                                <DollarSign className="w-4 h-4 mr-3" />
                                {t('payments.actions.viewExtra')}
                                <Badge 
                                  variant="secondary" 
                                  className="ml-auto text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                >
                                  +{invoice.totalExtraCharges?.toLocaleString()}
                                </Badge>
                              </DropdownMenuItem>
                            )}

                            {/* Add Extra Charge - Only show if can add */}
                            {canAddExtra && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setIsExtraChargeDialogOpen(true);
                                  }}
                                  className="py-3 cursor-pointer text-amber-600 dark:text-amber-400"
                                >
                                  <DollarSign className="w-4 h-4 mr-3" />
                                  {t('payments.actions.addCharge')}
                                </DropdownMenuItem>
                              </>
                            )}

                            {/* Refund - Only show if eligible */}
                            {canRefund && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setIsRefundDialogOpen(true);
                                  }}
                                  className="py-3 cursor-pointer text-purple-600 dark:text-purple-400"
                                >
                                  <Undo2 className="w-4 h-4 mr-3" />
                                  {t('payments.actions.refund')}
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
            {t('payments.showing', { count: filteredInvoices.length, total: invoices.length })}
          </p>
        </div>
      </div>

      {/* View Dialog */}
      {selectedInvoice && (
        <PaymentViewDialog
          invoice={selectedInvoice}
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
        />
      )}

      {/* Refund Dialog */}
      {selectedInvoice && (
        <RefundInvoiceDialog
          invoice={selectedInvoice}
          open={isRefundDialogOpen}
          onOpenChange={setIsRefundDialogOpen}
          onSuccess={handleRefundSuccess}
        />
      )}

      {/* Add Extra Charge Dialog */}
      {selectedInvoice && (
        <AddExtraChargeDialog
          invoice={selectedInvoice}
          open={isExtraChargeDialogOpen}
          onOpenChange={setIsExtraChargeDialogOpen}
          onSuccess={handleExtraChargeSuccess}
        />
      )}
    </div>
  );
};

export default Payments;