import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { CalendarIcon, Loader2, CheckCircle2, Building, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Booking {
  _id: string;
  clientName: string;
  auditoriumId: string;
  startDateTime: string;
  endDateTime: string;
  purpose: string;
  amount: number;
  attendingPeopleCount: number;
}

interface PaymentConfirmationDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const auditoriumNames: Record<string, string> = {
  '1': 'auditoriums.1',
  '2': 'auditoriums.2',
  '3': 'auditoriums.3',
};

const PaymentConfirmationDialog = ({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: PaymentConfirmationDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    method: '',
    referenceNumber: '',
    bankName: '',
    chequeNumber: '',
    transactionDate: undefined as Date | undefined,
    notes: '',
  });

  const paymentMethods = [
    { value: 'bank_transfer', labelKey: 'paymentConfirm.form.method.bank_transfer' },
    { value: 'cash', labelKey: 'paymentConfirm.form.method.cash' },
    { value: 'cheque', labelKey: 'paymentConfirm.form.method.cheque' },
    { value: 'other', labelKey: 'paymentConfirm.form.method.other' },
  ];

  const resetForm = () => {
    setFormData({
      method: '',
      referenceNumber: '',
      bankName: '',
      chequeNumber: '',
      transactionDate: undefined,
      notes: '',
    });
  };

  const handleSubmit = async () => {
    if (!booking) return;

    if (!formData.method || !formData.transactionDate) {
      toast({
        variant: 'destructive',
        title: t('paymentConfirm.toasts.validation'),
        description: t('paymentConfirm.toasts.validationDesc'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(`/invoices`, {
        scheduleId: booking._id,
        amount: booking.amount,
        dueDate: new Date(booking.startDateTime).toISOString(),
      });

      // Then confirm payment
      const invoiceResponse = await api.get(`/invoices/schedule/${booking._id}`);
      const invoiceId = invoiceResponse.data._id;

      await api.patch(`/invoices/${invoiceId}/confirm-payment`, {
        method: formData.method,
        referenceNumber: formData.referenceNumber || undefined,
        bankName: formData.bankName || undefined,
        chequeNumber: formData.chequeNumber || undefined,
        transactionDate: formData.transactionDate!.toISOString(),
        notes: formData.notes || undefined,
      });

      toast({
        title: t('paymentConfirm.toasts.successTitle'),
        description: t('paymentConfirm.toasts.successDesc', { amount: booking.amount.toLocaleString() }),
      });

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('paymentConfirm.toasts.errorTitle'),
        description: error.response?.data?.message || t('paymentConfirm.toasts.errorDesc'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-status-approved" />
            {t('paymentConfirm.title')}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t('paymentConfirm.desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h3 className="font-semibold text-base">{t('paymentConfirm.bookingDetails.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t('paymentConfirm.bookingDetails.client')}</p>
                <p className="font-medium">{booking.clientName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('paymentConfirm.bookingDetails.auditorium')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t(auditoriumNames[booking.auditoriumId])}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('paymentConfirm.bookingDetails.dateTime')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {format(new Date(booking.startDateTime), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('paymentConfirm.bookingDetails.attendees')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {booking.attendingPeopleCount}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('paymentConfirm.bookingDetails.totalAmount')}:</span>
                <span className="text-2xl font-bold text-primary">
                  Rs. {booking.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-base">{t('paymentConfirm.form.method.label')}</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => setFormData({ ...formData, method: value })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder={t('paymentConfirm.form.method.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value} className="py-3 text-base">
                      {t(method.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reference Number */}
            <div className="space-y-2">
              <Label className="text-base">{t('paymentConfirm.form.reference.label')}</Label>
              <Input
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder={t('paymentConfirm.form.reference.placeholder')}
                className="h-12 text-base"
              />
            </div>

            {/* Bank Name (shown for bank_transfer) */}
            {formData.method === 'bank_transfer' && (
              <div className="space-y-2">
                <Label className="text-base">{t('paymentConfirm.form.bankName.label')}</Label>
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder={t('paymentConfirm.form.bankName.placeholder')}
                  className="h-12 text-base"
                />
              </div>
            )}

            {/* Cheque Number (shown for cheque) */}
            {formData.method === 'cheque' && (
              <div className="space-y-2">
                <Label className="text-base">{t('paymentConfirm.form.chequeNumber.label')}</Label>
                <Input
                  value={formData.chequeNumber}
                  onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                  placeholder={t('paymentConfirm.form.chequeNumber.placeholder')}
                  className="h-12 text-base"
                />
              </div>
            )}

            {/* Transaction Date */}
            <div className="space-y-2">
              <Label className="text-base">{t('paymentConfirm.form.date.label')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-12 justify-start text-left font-normal text-base',
                      !formData.transactionDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5" />
                    {formData.transactionDate
                      ? format(formData.transactionDate, 'PPP')
                      : t('paymentConfirm.form.date.placeholder')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.transactionDate}
                    onSelect={(date) => setFormData({ ...formData, transactionDate: date })}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-base">{t('paymentConfirm.form.notes.label')}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('paymentConfirm.form.notes.placeholder')}
                className="min-h-[80px] text-base"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={isSubmitting}
            className="text-base"
          >
            {t('paymentConfirm.buttons.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.method || !formData.transactionDate}
            className="text-base gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('paymentConfirm.buttons.confirming')}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t('paymentConfirm.buttons.confirm')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentConfirmationDialog;