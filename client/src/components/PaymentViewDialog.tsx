import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Building,
  Calendar,
  Clock,
  Users,
  FileText,
  DollarSign,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ✅ UPDATED Interface to include Extra Charges fields
interface Invoice {
  _id: string;
  invoiceNumber: string;
  scheduleId: {
    _id: string;
    clientName: string;
    auditoriumId: string;
    startDateTime: string;
    endDateTime: string;
    purpose: string;
    attendingPeopleCount: number;
    contactDetails?: {
      organizationName: string;
      telephone: string;
      mobile: string;
      email?: string;
      address: string;
    };
  };
  amount: number;
  // New fields for Extra Charges
  finalAmount?: number;
  totalExtraCharges?: number;
  extraCharges?: Array<{
    description: string;
    amount: number;
    notes?: string;
    addedAt: string;
    addedBy: {
      name: string;
      email: string;
    };
  }>;
  status: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentDetails?: {
    method: string;
    referenceNumber?: string;
    bankName?: string;
    chequeNumber?: string;
    transactionDate: string;
    notes?: string;
  };
  createdBy?: {
    name: string;
    email: string;
  };
  confirmedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface PaymentViewDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const auditoriumNames: Record<string, string> = {
  '1': 'auditoriums.1',
  '2': 'auditoriums.2',
  '3': 'auditoriums.3',
};

const PaymentViewDialog = ({ invoice, open, onOpenChange }: PaymentViewDialogProps) => {
  const { t } = useTranslation();

  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentMethodLabel = (method: string) => {
    return t(`paymentView.methods.${method}`) || method;
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'PPP p');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  // ✅ Check for extra charges
  const hasExtraCharges = invoice.extraCharges && invoice.extraCharges.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileText className="w-6 h-6" />
            {t('paymentView.title')}
          </DialogTitle>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-sm text-muted-foreground">
              {invoice.invoiceNumber}
            </span>
            <Badge className={`${getStatusClass(invoice.status)}`}>
              {t(`status.${invoice.status}`)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* ✅ UPDATED: Payment Summary Section */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{t('paymentView.summary.title')}</h3>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                  <DollarSign className="w-6 h-6" />
                  Rs. {(invoice.finalAmount || invoice.amount).toLocaleString()}
                </div>
                {hasExtraCharges && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('paymentView.summary.includesExtra')}
                  </p>
                )}
              </div>
            </div>
           
            {/* Amount Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('paymentView.summary.originalAmount')}:</span>
                <span className="font-medium">Rs. {invoice.amount.toLocaleString()}</span>
              </div>
              {hasExtraCharges && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('paymentView.summary.extraCharges')}:</span>
                    <span className="font-medium text-amber-600">
                      + Rs. {invoice.totalExtraCharges!.toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-semibold">{t('paymentView.summary.total')}:</span>
                    <span className="text-lg font-bold text-primary">
                      Rs. {invoice.finalAmount!.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 pt-4 border-t">
              <div>
                <p className="text-muted-foreground">{t('paymentView.summary.issueDate')}</p>
                <p className="font-medium">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('paymentView.summary.dueDate')}</p>
                <p className="font-medium">{formatDate(invoice.dueDate)}</p>
              </div>
              {invoice.paidDate && (
                <div>
                  <p className="text-muted-foreground">{t('paymentView.summary.paidDate')}</p>
                  <p className="font-medium">{formatDate(invoice.paidDate)}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">{t('paymentView.summary.status')}</p>
                <p className="font-medium capitalize">{t(`status.${invoice.status}`)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Booking Details (Unchanged) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t('paymentView.booking.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('paymentView.booking.id')}</p>
                <p className="font-medium font-mono">
                  {invoice.scheduleId._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('paymentView.booking.client')}</p>
                <p className="font-medium">{invoice.scheduleId.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('paymentView.booking.auditorium')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t(auditoriumNames[invoice.scheduleId.auditoriumId])}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('paymentView.booking.eventDate')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDate(invoice.scheduleId.startDateTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('paymentView.booking.attendees')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {invoice.scheduleId.attendingPeopleCount}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">{t('paymentView.booking.purpose')}</p>
                <p className="font-medium">{invoice.scheduleId.purpose}</p>
              </div>
            </div>

            {/* Contact Details (Unchanged) */}
            {invoice.scheduleId.contactDetails && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h4 className="font-semibold text-sm">{t('paymentView.contact.title')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('paymentView.contact.org')}</p>
                    <p className="font-medium">
                      {invoice.scheduleId.contactDetails.organizationName}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {t('paymentView.contact.phone')}
                    </p>
                    <p className="font-medium">
                      {invoice.scheduleId.contactDetails.telephone}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {t('paymentView.contact.mobile')}
                    </p>
                    <p className="font-medium">
                      {invoice.scheduleId.contactDetails.mobile}
                    </p>
                  </div>
                  {invoice.scheduleId.contactDetails.email && (
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {t('paymentView.contact.email')}
                      </p>
                      <p className="font-medium">
                        {invoice.scheduleId.contactDetails.email}
                      </p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {t('paymentView.contact.address')}
                    </p>
                    <p className="font-medium">
                      {invoice.scheduleId.contactDetails.address}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ NEW: Extra Charges Details Section */}
          {hasExtraCharges && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {t('paymentView.extraCharges.title')}
                </h3>
                <div className="space-y-3">
                  {invoice.extraCharges!.map((charge, index) => (
                    <div
                      key={index}
                      className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-base">{charge.description}</p>
                          {charge.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{charge.notes}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              {t('paymentView.extraCharges.addedBy')}: {charge.addedBy.name}
                            </span>
                            <span>•</span>
                            <span>
                              {format(new Date(charge.addedAt), 'PPP p')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                            + Rs. {charge.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-semibold">{t('paymentView.extraCharges.totalExtra')}:</span>
                    <span className="text-xl font-bold text-amber-600">
                      Rs. {invoice.totalExtraCharges!.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Payment Details (Unchanged) */}
          {invoice.paymentDetails && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t('paymentView.payment.title')}
                </h3>
                <div className="p-4 bg-status-approved/5 border border-status-approved/20 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('paymentView.payment.method')}</p>
                      <p className="font-medium">
                        {getPaymentMethodLabel(invoice.paymentDetails.method)}
                      </p>
                    </div>
                    {invoice.paymentDetails.referenceNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t('paymentView.payment.reference')}</p>
                        <p className="font-medium font-mono">
                          {invoice.paymentDetails.referenceNumber}
                        </p>
                      </div>
                    )}
                    {invoice.paymentDetails.bankName && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t('paymentView.payment.bank')}</p>
                        <p className="font-medium">{invoice.paymentDetails.bankName}</p>
                      </div>
                    )}
                    {invoice.paymentDetails.chequeNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t('paymentView.payment.cheque')}</p>
                        <p className="font-medium font-mono">
                          {invoice.paymentDetails.chequeNumber}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">{t('paymentView.payment.date')}</p>
                      <p className="font-medium">
                        {formatDate(invoice.paymentDetails.transactionDate)}
                      </p>
                    </div>
                  </div>
                  {invoice.paymentDetails.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('paymentView.payment.notes')}</p>
                      <p className="text-sm">{invoice.paymentDetails.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Audit Information (Unchanged) */}
          <Separator />
          <div className="space-y-3 text-sm text-muted-foreground">
            <h4 className="font-semibold text-foreground">{t('paymentView.audit.title')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {invoice.createdBy && (
                <div>
                  <p className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {t('paymentView.audit.created')}
                  </p>
                  <p className="font-medium text-foreground">
                    {invoice.createdBy.name}
                  </p>
                  <p className="text-xs">{invoice.createdBy.email}</p>
                </div>
              )}
              {invoice.confirmedBy && (
                <div>
                  <p className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {t('paymentView.audit.confirmed')}
                  </p>
                  <p className="font-medium text-foreground">
                    {invoice.confirmedBy.name}
                  </p>
                  <p className="text-xs">{invoice.confirmedBy.email}</p>
                </div>
              )}
            </div>
            <div>
              <p>{t('paymentView.audit.createdOn')} {formatDateTime(invoice.createdAt)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentViewDialog;