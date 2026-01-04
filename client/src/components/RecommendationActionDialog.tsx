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
  additionalServices?: any;
}

interface RecommendationActionDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  actionType: 'recommend' | 'cancel' | null;
}

const auditoriumNames: Record<string, string> = {
  '1': 'auditoriums.1',
  '2': 'auditoriums.2',
  '3': 'auditoriums.3',
};

const RecommendationActionDialog = ({
  booking,
  open,
  onOpenChange,
  onSuccess,
  actionType,
}: RecommendationActionDialogProps) => {
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
        title: t('recommendation.toasts.validationError'),
        description: t('recommendation.toasts.validationDesc'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (actionType === 'recommend') {
        await api.patch(`/schedules/${booking._id}/recommend`);
        toast({
          title: t('recommendation.toasts.recommendSuccessTitle'),
          description: t('recommendation.toasts.recommendSuccessDesc'),
        });
      } else {
        await api.patch(`/schedules/${booking._id}/cancel-recommendation`, {
          reason: cancelReason,
        });
        toast({
          title: t('recommendation.toasts.cancelSuccessTitle'),
          description: t('recommendation.toasts.cancelSuccessDesc'),
        });
      }

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('recommendation.toasts.errorTitle'),
        description: error.response?.data?.message || t('recommendation.toasts.errorDesc'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;

  const isRecommend = actionType === 'recommend';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {isRecommend ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-status-approved" />
                {t('recommendation.recommendTitle')}
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-destructive" />
                {t('recommendation.cancelTitle')}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isRecommend
              ? t('recommendation.recommendDesc')
              : t('recommendation.cancelDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h3 className="font-semibold text-base">{t('recommendation.details.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t('recommendation.details.id')}</p>
                <p className="font-medium font-mono">{booking._id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('recommendation.details.client')}</p>
                <p className="font-medium">{booking.clientName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('recommendation.details.org')}</p>
                <p className="font-medium">{booking.contactDetails.organizationName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('recommendation.details.auditorium')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t(auditoriumNames[booking.auditoriumId])}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('recommendation.details.dateTime')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {format(new Date(booking.startDateTime), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('recommendation.details.attendees')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {booking.attendingPeopleCount}
                </p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-muted-foreground text-sm mb-1">{t('recommendation.details.purpose')}</p>
              <p className="text-base">{booking.purpose}</p>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('recommendation.details.amount')}:</span>
                <span className="text-xl font-bold text-primary">
                  Rs. {booking.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action-specific content */}
          {!isRecommend && (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-destructive mb-2">
                      {t('recommendation.cancel.noticeTitle')}
                    </h4>
                    <p className="text-sm text-foreground">
                      {t('recommendation.cancel.noticeDesc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancelReason" className="text-base font-medium">
                  {t('recommendation.cancel.reasonLabel')}
                </Label>
                <Textarea
                  id="cancelReason"
                  placeholder={t('recommendation.cancel.reasonPlaceholder')}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="min-h-[120px] text-base"
                  disabled={isSubmitting}
                />
                {cancelReason.trim().length > 0 && cancelReason.trim().length < 10 && (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {t('recommendation.cancel.reasonError')}
                  </p>
                )}
              </div>
            </div>
          )}

          {isRecommend && (
            <div className="p-4 bg-status-approved/10 border border-status-approved/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-status-approved mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-status-approved mb-2">
                    {t('recommendation.recommend.noticeTitle')}
                  </h4>
                  <p className="text-sm text-foreground">
                    {t('recommendation.recommend.noticeDesc')}
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
            {t('recommendation.buttons.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!isRecommend && cancelReason.trim().length < 10)}
            className={`text-base gap-2 ${
              !isRecommend ? 'bg-destructive hover:bg-destructive/90' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('recommendation.buttons.processing')}
              </>
            ) : isRecommend ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t('recommendation.buttons.confirmRecommend')}
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                {t('recommendation.buttons.confirmCancel')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationActionDialog;