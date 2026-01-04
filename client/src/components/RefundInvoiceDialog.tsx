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
import { paymentService, type Invoice } from '@/services/paymentService';
import { CalendarIcon, Loader2, AlertTriangle, DollarSign, Building, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefundInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const auditoriumNames: Record<string, string> = {
  '1': 'auditoriums.1',
  '2': 'auditoriums.2',
  '3': 'auditoriums.3',
};

const RefundInvoiceDialog = ({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}: RefundInvoiceDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: invoice?.amount || 0,
    method: '',
    referenceNumber: '',
    bankName: '',
    transactionDate: undefined as Date | undefined,
    reason: '',
    notes: '',
  });

  const refundMethods = [
    { value: 'bank_transfer', labelKey: 'refund.form.method.bank_transfer' },
    { value: 'cash', labelKey: 'refund.form.method.cash' },
    { value: 'cheque', labelKey: 'refund.form.method.cheque' },
    { value: 'other', labelKey: 'refund.form.method.other' },
  ];

  const resetForm = () => {
    setFormData({
      amount: invoice?.amount || 0,
      method: '',
      referenceNumber: '',
      bankName: '',
      transactionDate: undefined,
      reason: '',
      notes: '',
    });
  };

  const handleSubmit = async () => {
    if (!invoice) return;

    if (!formData.method || !formData.transactionDate || !formData.reason) {
      toast({
        variant: 'destructive',
        title: t('refund.toasts.validation'),
        description: t('refund.toasts.validationDesc'),
      });
      return;
    }

    if (formData.amount <= 0 || formData.amount > invoice.amount) {
      toast({
        variant: 'destructive',
        title: t('refund.toasts.invalidAmount'),
        description: t('refund.toasts.invalidAmountDesc'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await paymentService.processRefund(invoice._id, {
        amount: formData.amount,
        method: formData.method,
        referenceNumber: formData.referenceNumber || undefined,
        bankName: formData.bankName || undefined,
        transactionDate: formData.transactionDate!.toISOString(),
        reason: formData.reason,
        notes: formData.notes || undefined,
      });

      toast({
        title: t('refund.toasts.successTitle'),
        description: t('refund.toasts.successDesc', { 
          amount: formData.amount.toLocaleString() 
        }),
      });

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('refund.toasts.errorTitle'),
        description: error.response?.data?.message || t('refund.toasts.errorDesc'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-600" />
            {t('refund.title')}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t('refund.desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h3 className="font-semibold text-base">{t('refund.invoiceDetails.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t('refund.invoiceDetails.invoiceNo')}</p>
                <p className="font-medium">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('refund.invoiceDetails.client')}</p>
                <p className="font-medium">{invoice.scheduleId.clientName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('refund.invoiceDetails.auditorium')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t(auditoriumNames[invoice.scheduleId.auditoriumId])}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('refund.invoiceDetails.eventDate')}</p>
                <p className="font-medium">
                  {format(new Date(invoice.scheduleId.startDateTime), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('refund.invoiceDetails.totalAmount')}:</span>
                <span className="text-2xl font-bold text-primary">
                  Rs. {invoice.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                  {t('refund.warning.title')}
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {t('refund.warning.desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Refund Form */}
          <div className="space-y-4">
            {/* Refund Amount */}
            <div className="space-y-2">
              <Label className="text-base">{t('refund.form.amount.label')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  Rs.
                </span>
                <Input
                  type="number"
                  placeholder={t('refund.form.amount.placeholder')}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="h-12 text-base pl-12"
                  max={invoice.amount}
                  min={0}
                  step={100}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t('refund.form.amount.max')}: Rs. {invoice.amount.toLocaleString()}
              </p>
            </div>

            {/* Refund Method */}
            <div className="space-y-2">
              <Label className="text-base">{t('refund.form.method.label')}</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => setFormData({ ...formData, method: value })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder={t('refund.form.method.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {refundMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value} className="py-3 text-base">
                      {t(method.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reference Number */}
            {formData.method && (
              <div className="space-y-2">
                <Label className="text-base">{t('refund.form.referenceNumber.label')}</Label>
                <Input
                  placeholder={t('refund.form.referenceNumber.placeholder')}
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="h-12 text-base"
                />
              </div>
            )}

            {/* Bank Name (if bank transfer) */}
            {formData.method === 'bank_transfer' && (
              <div className="space-y-2">
                <Label className="text-base">{t('refund.form.bankName.label')}</Label>
                <Input
                  placeholder={t('refund.form.bankName.placeholder')}
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="h-12 text-base"
                />
              </div>
            )}

            {/* Transaction Date */}
            <div className="space-y-2">
              <Label className="text-base">{t('refund.form.transactionDate.label')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-12 justify-start text-left font-normal text-base',
                      !formData.transactionDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.transactionDate ? (
                      format(formData.transactionDate, 'PPP')
                    ) : (
                      <span>{t('refund.form.transactionDate.placeholder')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.transactionDate}
                    onSelect={(date) => setFormData({ ...formData, transactionDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Refund Reason */}
            <div className="space-y-2">
              <Label className="text-base">{t('refund.form.reason.label')}</Label>
              <Textarea
                placeholder={t('refund.form.reason.placeholder')}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="min-h-[100px] text-base"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label className="text-base">{t('refund.form.notes.label')}</Label>
              <Textarea
                placeholder={t('refund.form.notes.placeholder')}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            {t('refund.buttons.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.method || !formData.transactionDate || !formData.reason}
            className="text-base gap-2 bg-amber-600 hover:bg-amber-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('refund.buttons.processing')}
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                {t('refund.buttons.confirm')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundInvoiceDialog;