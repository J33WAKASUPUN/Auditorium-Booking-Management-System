import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  DollarSign,
} from 'lucide-react';

interface Booking {
  _id: string;
  clientName: string;
  auditoriumId: string;
  startDateTime: string;
  endDateTime: string;
  purpose: string;
  amount: number;
  attendingPeopleCount: number;
  status: string;
  contactDetails: {
    organizationName: string;
    telephone: string;
    mobile: string;
    email?: string;
    address: string;
    designation: string;
    fax?: string;
  };
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
  createdBy?: {
    name: string;
    email: string;
    role: string;
  };
  bookingDate: string;
  dueDate: string;
}

interface BookingDetailDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const auditoriumNames: Record<string, string> = {
  '1': 'auditoriums.1',
  '2': 'auditoriums.2',
  '3': 'auditoriums.3',
};

const BookingDetailDialog = ({ booking, open, onOpenChange }: BookingDetailDialogProps) => {
  const { t } = useTranslation();

  if (!booking) return null;

  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: 'status-draft',
      payment_pending: 'status-pending',
      payment_confirmed: 'status-confirmed',
      recommended: 'status-confirmed',
      approved: 'status-approved',
      completed: 'status-approved',
      cancelled: 'status-cancelled',
    };
    return statusMap[status] || 'status-draft';
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'PPP p');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileText className="w-6 h-6" />
            {t('bookingDetail.title')}
          </DialogTitle>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-sm text-muted-foreground">
              #{booking._id.slice(-8).toUpperCase()}
            </span>
            <Badge className={getStatusClass(booking.status)}>
              {t(`status.${booking.status}`).toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{t('bookingDetail.paymentAmount')}</h3>
              <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                <DollarSign className="w-6 h-6" />
                Rs. {booking.amount.toLocaleString()}
              </div>
            </div>
          </div>

          <Separator />

          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('bookingDetail.eventInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('bookingDetail.clientName')}</p>
                <p className="font-medium">{booking.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('bookingDetail.organization')}</p>
                <p className="font-medium">{booking.contactDetails.organizationName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('bookingDetail.auditorium')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t(auditoriumNames[booking.auditoriumId])}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('bookingDetail.expectedAttendees')}</p>
                <p className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {booking.attendingPeopleCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('bookingDetail.startDate')}
                </p>
                <p className="font-medium">{formatDateTime(booking.startDateTime)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('bookingDetail.endDate')}
                </p>
                <p className="font-medium">{formatDateTime(booking.endDateTime)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('bookingDetail.contactInfo')}</h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t('bookingDetail.designation')}
                </p>
                <p className="font-medium">{booking.contactDetails.designation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('bookingDetail.telephone')}
                  </p>
                  <p className="font-medium">{booking.contactDetails.telephone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('bookingDetail.mobile')}
                  </p>
                  <p className="font-medium">{booking.contactDetails.mobile}</p>
                </div>
              </div>
              {booking.contactDetails.email && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('bookingDetail.email')}
                  </p>
                  <p className="font-medium">{booking.contactDetails.email}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t('bookingDetail.address')}
                </p>
                <p className="font-medium">{booking.contactDetails.address}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Event Purpose */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('bookingDetail.eventPurpose')}</h3>
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
                  {t('bookingDetail.additionalServices')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {booking.additionalServices.vipRoom && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">{t('bookingDetail.services.vip')}</span>
                    </div>
                  )}
                  {booking.additionalServices.multimedia && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">{t('bookingDetail.services.multimedia')}</span>
                    </div>
                  )}
                  {booking.additionalServices.airConditioner && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">{t('bookingDetail.services.ac')}</span>
                    </div>
                  )}
                  {booking.additionalServices.buffet && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">{t('bookingDetail.services.buffet')}</span>
                    </div>
                  )}
                  {booking.additionalServices.soundSystem && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">{t('bookingDetail.services.sound')}</span>
                    </div>
                  )}
                  {booking.additionalServices.microphoneCount > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">
                        {t('bookingDetail.services.microphones', { count: booking.additionalServices.microphoneCount })}
                      </span>
                    </div>
                  )}
                  {booking.additionalServices.wirelessMicCount > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-status-approved" />
                      <span className="text-sm">
                        {t('bookingDetail.services.wirelessMics', { count: booking.additionalServices.wirelessMicCount })}
                      </span>
                    </div>
                  )}
                </div>
                {booking.additionalServices.otherRequirements && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">{t('bookingDetail.services.other')}</p>
                    <p className="text-base">{booking.additionalServices.otherRequirements}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>{t('bookingDetail.meta.bookingDate')}:</strong> {formatDateTime(booking.bookingDate)}
            </p>
            <p>
              <strong>{t('bookingDetail.meta.dueDate')}:</strong> {formatDateTime(booking.dueDate)}
            </p>
            {booking.createdBy && (
              <p>
                <strong>{t('bookingDetail.meta.createdBy')}:</strong> {booking.createdBy.name} ({booking.createdBy.email})
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailDialog;