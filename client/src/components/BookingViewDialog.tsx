import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge'; // Added Badge import
import {
  Building,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface Booking {
  _id: string;
  auditoriumId: string;
  clientName: string;
  contactDetails: {
    organizationName: string;
    telephone: string;
    mobile: string;
    fax?: string;
    email?: string;
    address: string;
    designation: string;
  };
  startDateTime: string;
  endDateTime: string;
  attendingPeopleCount: number;
  purpose: string;
  status: string;
  createdAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  additionalServices?: {
    vipRoom: boolean;
    multimedia: boolean;
    airConditioner: boolean;
    buffet: boolean;
    soundSystem: boolean;
    microphoneCount: number;
    wirelessMicCount: number;
    otherRequirements?: string;
  };
}

interface BookingViewDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const auditoriumNames: Record<string, string> = {
  '1': 'auditoriums.1',
  '2': 'auditoriums.2',
  '3': 'auditoriums.3',
};

const BookingViewDialog = ({ booking, open, onOpenChange }: BookingViewDialogProps) => {
  const { t } = useTranslation();

  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      payment_pending: 'bg-amber-100 text-amber-800 border-amber-200',
      payment_confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      recommended: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('bookingView.title')}</DialogTitle>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-sm text-muted-foreground">
              {t('bookingView.id')}: {booking._id.slice(-8).toUpperCase()}
            </span>
            <Badge className={getStatusClass(booking.status)}>
              {t(`status.${booking.status}`)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cancellation Notice - Show at top if cancelled */}
          {booking.status === 'cancelled' && booking.cancellationReason && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-destructive mb-2">
                    {t('bookingView.cancel.title')}
                  </h4>
                  <p className="text-sm text-foreground mb-2">
                    <strong>{t('bookingView.cancel.reason')}:</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.cancellationReason}
                  </p>
                  {booking.cancelledAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('bookingView.cancel.date')} {formatDateTime(booking.cancelledAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Venue & Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building className="w-5 h-5" />
              {t('bookingView.venue.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('bookingView.venue.auditorium')}</p>
                <p className="font-medium">{t(auditoriumNames[booking.auditoriumId])}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('bookingView.venue.attendees')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {booking.attendingPeopleCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('bookingView.venue.start')}
                </p>
                <p className="font-medium">{formatDateTime(booking.startDateTime)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('bookingView.venue.end')}
                </p>
                <p className="font-medium">{formatDateTime(booking.endDateTime)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Person */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('bookingView.contact.title')}
            </h3>
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('bookingView.contact.person')}</p>
                <p className="font-medium">{booking.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('bookingView.contact.org')}</p>
                <p className="font-medium">{booking.contactDetails.organizationName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t('bookingView.contact.designation')}
                </p>
                <p className="font-medium">{booking.contactDetails.designation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('bookingView.contact.phone')}
                  </p>
                  <p className="font-medium">{booking.contactDetails.telephone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('bookingView.contact.mobile')}
                  </p>
                  <p className="font-medium">{booking.contactDetails.mobile}</p>
                </div>
              </div>
              {booking.contactDetails.email && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('bookingView.contact.email')}
                  </p>
                  <p className="font-medium">{booking.contactDetails.email}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t('bookingView.contact.address')}
                </p>
                <p className="font-medium">{booking.contactDetails.address}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Event Purpose */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('bookingView.purpose.title')}
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-base">{booking.purpose}</p>
            </div>
          </div>

          {/* Additional Services */}
          {booking.additionalServices && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {t('bookingView.services.title')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {booking.additionalServices.vipRoom && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">{t('bookingView.services.vip')}</span>
                    </div>
                  )}
                  {booking.additionalServices.multimedia && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">{t('bookingView.services.multimedia')}</span>
                    </div>
                  )}
                  {booking.additionalServices.airConditioner && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">{t('bookingView.services.ac')}</span>
                    </div>
                  )}
                  {booking.additionalServices.buffet && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">{t('bookingView.services.buffet')}</span>
                    </div>
                  )}
                  {booking.additionalServices.soundSystem && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">{t('bookingView.services.sound')}</span>
                    </div>
                  )}
                  {booking.additionalServices.microphoneCount > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">
                        {t('bookingView.services.microphones', { count: booking.additionalServices.microphoneCount })}
                      </span>
                    </div>
                  )}
                  {booking.additionalServices.wirelessMicCount > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">
                        {t('bookingView.services.wirelessMics', { count: booking.additionalServices.wirelessMicCount })}
                      </span>
                    </div>
                  )}
                </div>
                {booking.additionalServices.otherRequirements && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">{t('bookingView.services.other')}</p>
                    <p className="text-base">{booking.additionalServices.otherRequirements}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Created Date */}
          <div className="text-sm text-muted-foreground text-center pt-4 border-t">
            {t('bookingView.footer.created')} {formatDateTime(booking.createdAt)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingViewDialog;