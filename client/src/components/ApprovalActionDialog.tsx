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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Building,
  Users,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Booking {
  _id: string;
  clientName: string;
  auditoriumId: string;
  startDateTime: string;
  endDateTime: string;
  purpose: string;
  amount: number;
  attendingPeopleCount: number;
  contactDetails: {
    organizationName: string;
    telephone: string;
    mobile: string;
    email?: string;
    address: string;
    designation: string;
  };
}

interface ApprovalActionDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  actionType: 'approve' | 'cancel' | null;
}

const auditoriumNames: Record<string, string> = {
  '1': 'auditoriums.1',
  '2': 'auditoriums.2',
  '3': 'auditoriums.3',
};

const ApprovalActionDialog = ({
  booking,
  open,
  onOpenChange,
  onSuccess,
  actionType,
}: ApprovalActionDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const resetForm = () => {
    setCancelReason('');
  };

  const handleSubmit = async () => {
    if (!booking || !actionType) return;

    if (actionType === 'cancel' && cancelReason.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: t('approval.toasts.validationError'),
        description: t('approval.toasts.validationDesc'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (actionType === 'approve') {
        await api.patch(`/schedules/${booking._id}/approve`);
        toast({
          title: t('approval.toasts.approveSuccessTitle'),
          description: t('approval.toasts.approveSuccessDesc'),
        });
      } else {
        await api.patch(`/schedules/${booking._id}/cancel-approval`, {
          reason: cancelReason,
        });
        toast({
          title: t('approval.toasts.cancelSuccessTitle'),
          description: t('approval.toasts.cancelSuccessDesc'),
        });
      }

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('approval.toasts.errorTitle'),
        description: error.response?.data?.message || t('approval.toasts.errorDesc'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;

  const isApprove = actionType === 'approve';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {isApprove ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-status-approved" />
                {t('approval.approveTitle')}
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-destructive" />
                {t('approval.cancelTitle')}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isApprove
              ? t('approval.approveDesc')
              : t('approval.cancelDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h3 className="font-semibold text-base">{t('approval.details.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t('approval.details.id')}</p>
                <p className="font-medium font-mono">{booking._id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('approval.details.client')}</p>
                <p className="font-medium">{booking.clientName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('approval.details.org')}</p>
                <p className="font-medium">{booking.contactDetails.organizationName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('approval.details.auditorium')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t(auditoriumNames[booking.auditoriumId])}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('approval.details.dateTime')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {format(new Date(booking.startDateTime), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('approval.details.attendees')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {booking.attendingPeopleCount}
                </p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-muted-foreground text-sm mb-1">{t('approval.details.purpose')}</p>
              <p className="text-base">{booking.purpose}</p>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('approval.details.amount')}:</span>
                <span className="text-xl font-bold text-primary">
                  Rs. {booking.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action-specific content */}
          {!isApprove && (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-destructive mb-2">
                      {t('approval.cancel.noticeTitle')}
                    </h4>
                    <p className="text-sm text-foreground">
                      {t('approval.cancel.noticeDesc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancelReason" className="text-base font-medium">
                  {t('approval.cancel.reasonLabel')}
                </Label>
                <Textarea
                  id="cancelReason"
                  placeholder={t('approval.cancel.reasonPlaceholder')}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="min-h-[120px] text-base"
                  disabled={isSubmitting}
                />
                {cancelReason.trim().length > 0 && cancelReason.trim().length < 10 && (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {t('approval.cancel.reasonError')}
                  </p>
                )}
              </div>
            </div>
          )}

          {isApprove && (
            <div className="p-4 bg-status-approved/10 border border-status-approved/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-status-approved mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-status-approved mb-2">
                    {t('approval.approve.noticeTitle')}
                  </h4>
                  <p className="text-sm text-foreground">
                    {t('approval.approve.noticeDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}
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
            {t('approval.buttons.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!isApprove && cancelReason.trim().length < 10)}
            className={`text-base gap-2 ${
              !isApprove ? 'bg-destructive hover:bg-destructive/90' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('approval.buttons.processing')}
              </>
            ) : isApprove ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t('approval.buttons.confirmApprove')}
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                {t('approval.buttons.confirmCancel')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalActionDialog;