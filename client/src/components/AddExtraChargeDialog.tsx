import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useToast } from '@/hooks/use-toast';
import { paymentService, type Invoice } from '@/services/paymentService';
import { Loader2, DollarSign, AlertTriangle, Building } from 'lucide-react';

interface AddExtraChargeDialogProps {
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

const AddExtraChargeDialog = ({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}: AddExtraChargeDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      notes: '',
    });
  };

  const handleSubmit = async () => {
    if (!invoice) return;

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        variant: 'destructive',
        title: t('extraCharge.toasts.validation'),
        description: t('extraCharge.toasts.validationDesc'),
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        variant: 'destructive',
        title: t('extraCharge.toasts.validation'),
        description: t('extraCharge.toasts.descRequired'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await paymentService.addExtraCharge(invoice._id, {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        notes: formData.notes.trim() || undefined,
      });

      toast({
        title: t('extraCharge.toasts.successTitle'),
        description: t('extraCharge.toasts.successDesc', {
          amount: parseFloat(formData.amount).toLocaleString(),
        }),
      });

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('extraCharge.toasts.errorTitle'),
        description: error.response?.data?.message || t('extraCharge.toasts.errorDesc'),
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
            {t('extraCharge.title')}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t('extraCharge.desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h3 className="font-semibold text-base">{t('extraCharge.invoiceDetails.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t('extraCharge.invoiceDetails.invoiceNo')}</p>
                <p className="font-medium">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('extraCharge.invoiceDetails.client')}</p>
                <p className="font-medium">{invoice.scheduleId.clientName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('extraCharge.invoiceDetails.auditorium')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t(auditoriumNames[invoice.scheduleId.auditoriumId])}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('extraCharge.invoiceDetails.originalAmount')}</p>
                <p className="font-medium">Rs. {invoice.amount.toLocaleString()}</p>
              </div>
            </div>
            {invoice.totalExtraCharges && invoice.totalExtraCharges > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('extraCharge.invoiceDetails.previousCharges')}:</span>
                  <span className="font-medium">Rs. {invoice.totalExtraCharges.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground">{t('extraCharge.invoiceDetails.currentTotal')}:</span>
                  <span className="text-lg font-bold text-primary">
                    Rs. {(invoice.finalAmount || invoice.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-semibold mb-1">{t('extraCharge.warning.title')}</p>
                <p>{t('extraCharge.warning.desc')}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">{t('extraCharge.form.amount')} *</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  Rs.
                </span>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="5,000.00"
                  className="h-12 text-base pl-14"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">{t('extraCharge.form.description')} *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('extraCharge.form.descPlaceholder')}
                className="h-12 text-base"
              />
              <p className="text-xs text-muted-foreground">
                {t('extraCharge.form.descHelper')}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-base">{t('extraCharge.form.notes')}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('extraCharge.form.notesPlaceholder')}
                className="min-h-[80px] text-base"
              />
            </div>

            {/* Preview New Total */}
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('extraCharge.form.newTotal')}:</span>
                  <span className="text-2xl font-bold text-primary">
                    Rs. {((invoice.finalAmount || invoice.amount) + parseFloat(formData.amount)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
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
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.amount || !formData.description.trim()}
            className="text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('extraCharge.form.adding')}
              </>
            ) : (
              t('extraCharge.form.addCharge')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExtraChargeDialog;