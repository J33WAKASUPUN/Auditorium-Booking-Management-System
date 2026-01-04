import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Users,
  Building,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { bookingService, type Booking } from '@/services/bookingService';
import api from '@/lib/api';

// Modified to use translation keys for names
const auditoriums = [
  { id: '1', nameKey: 'auditoriums.1', capacity: 1000 },
  { id: '2', nameKey: 'auditoriums.2', capacity: 300 },
  { id: '3', nameKey: 'auditoriums.3', capacity: 200 },
];

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

const NewBooking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); 
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state matching backend schema
  const [formData, setFormData] = useState({
    // Step 1: Venue & Time
    auditoriumId: '',
    startDate: location.state?.selectedDate ? new Date(location.state.selectedDate) : undefined as Date | undefined,
    startTime: '',
    endDate: undefined as Date | undefined,
    endTime: '',
    bookingDate: new Date(),
    dueDate: undefined as Date | undefined,

    // Step 2: Contact Person & Organization
    clientName: '',
    contactDetails: {
      organizationName: '',
      telephone: '',
      mobile: '',
      fax: '',
      address: '',
      email: '',
      designation: '',
    },

    // Step 3: Event Details - ✅ REMOVED amount from here
    attendingPeopleCount: '',
    purpose: '',

    // Step 4: Additional Services + Payment - ✅ MOVED amount here
    amount: '',
    additionalServices: {
      vipRoom: false,
      multimedia: false,
      airConditioner: false,
      buffet: false,
      soundSystem: false,
      microphoneCount: 0,
      wirelessMicCount: 0,
      otherRequirements: '',
    },

    isDraft: false,
  });

  // Moved steps inside component to use translations
  const steps = [
    { number: 1, title: t('booking.step1'), icon: Building },
    { number: 2, title: t('booking.step2'), icon: Users },
    { number: 3, title: t('booking.step3'), icon: FileText },
    { number: 4, title: t('booking.step4'), icon: Check },
  ];

  // ✅ Load existing booking data if editing
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadBookingData(id);
    } else if (location.state?.booking) {
      setIsEditMode(true);
      populateFormWithBooking(location.state.booking);
    }
  }, [id, location.state]);

  const loadBookingData = async (bookingId: string) => {
    setIsLoading(true);
    try {
      const booking = await bookingService.getBookingById(bookingId);
      
      // Check if booking can be edited
      if (!['draft', 'pending_approval'].includes(booking.status)) {
        toast({
          variant: 'destructive',
          title: t('booking.messages.cannotEdit'),
          description: t('booking.messages.cannotEditDesc'),
        });
        navigate('/bookings');
        return;
      }

      populateFormWithBooking(booking);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('booking.messages.errorTitle'),
        description: t('booking.messages.loadError'),
      });
      navigate('/bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const populateFormWithBooking = (booking: Booking) => {
    const startDate = new Date(booking.startDateTime);
    const endDate = new Date(booking.endDateTime);

    setFormData({
      auditoriumId: booking.auditoriumId,
      startDate: startDate,
      startTime: format(startDate, 'HH:mm'),
      endDate: endDate,
      endTime: format(endDate, 'HH:mm'),
      bookingDate: new Date(booking.bookingDate),
      dueDate: new Date(booking.dueDate),
      clientName: booking.clientName,
      contactDetails: {
        organizationName: booking.contactDetails.organizationName,
        telephone: booking.contactDetails.telephone,
        mobile: booking.contactDetails.mobile,
        fax: booking.contactDetails.fax || '',
        address: booking.contactDetails.address,
        email: booking.contactDetails.email || '',
        designation: booking.contactDetails.designation,
      },
      attendingPeopleCount: String(booking.attendingPeopleCount),
      purpose: booking.purpose,
      amount: String(booking.amount),
      additionalServices: {
        vipRoom: booking.additionalServices?.vipRoom || false,
        multimedia: booking.additionalServices?.multimedia || false,
        airConditioner: booking.additionalServices?.airConditioner || false,
        buffet: booking.additionalServices?.buffet || false,
        soundSystem: booking.additionalServices?.soundSystem || false,
        microphoneCount: booking.additionalServices?.microphoneCount || 0,
        wirelessMicCount: booking.additionalServices?.wirelessMicCount || 0,
        otherRequirements: booking.additionalServices?.otherRequirements || '',
      },
      isDraft: booking.isDraft,
    });
  };

  const updateFormData = (field: string, value: any) => {
    if (field.startsWith('contactDetails.')) {
      const contactField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        contactDetails: {
          ...prev.contactDetails,
          [contactField]: value,
        },
      }));
    } else if (field.startsWith('additionalServices.')) {
      const serviceField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        additionalServices: {
          ...prev.additionalServices,
          [serviceField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const selectedAuditorium = auditoriums.find((a) => a.id === formData.auditoriumId);

  // ✅ UPDATED: Step validation
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.auditoriumId &&
          formData.startDate &&
          formData.startTime &&
          formData.endDate &&
          formData.endTime &&
          formData.dueDate
        );
      case 2:
        return (
          formData.clientName &&
          formData.contactDetails.organizationName &&
          formData.contactDetails.telephone &&
          formData.contactDetails.mobile &&
          formData.contactDetails.address &&
          formData.contactDetails.designation
        );
      case 3:
        return formData.attendingPeopleCount && formData.purpose; // ✅ Removed amount check
      case 4:
        return formData.amount; // ✅ Now checks amount here
      default:
        return false;
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    setIsSubmitting(true);

    try {
      // Format dates to ISO strings
      const startDateTime = new Date(formData.startDate!);
      const [startHours, startMinutes] = formData.startTime.split(':');
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);

      const endDateTime = new Date(formData.endDate!);
      const [endHours, endMinutes] = formData.endTime.split(':');
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0);

      // Prepare contact details
      const contactDetails: any = {
        organizationName: formData.contactDetails.organizationName,
        telephone: formData.contactDetails.telephone,
        mobile: formData.contactDetails.mobile,
        address: formData.contactDetails.address,
        designation: formData.contactDetails.designation,
      };

      if (formData.contactDetails.fax && formData.contactDetails.fax.trim() !== '') {
        contactDetails.fax = formData.contactDetails.fax;
      }

      if (formData.contactDetails.email && formData.contactDetails.email.trim() !== '') {
        contactDetails.email = formData.contactDetails.email;
      }

      const payload = {
        auditoriumId: formData.auditoriumId,
        clientName: formData.clientName,
        contactDetails,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        bookingDate: formData.bookingDate.toISOString(),
        dueDate: formData.dueDate!.toISOString(),
        attendingPeopleCount: parseInt(formData.attendingPeopleCount),
        purpose: formData.purpose,
        amount: parseFloat(formData.amount),
        additionalServices: formData.additionalServices,
        isDraft,
      };

      // ✅ Use PATCH for edit, POST for create
      if (isEditMode && id) {
        await api.patch(`/schedules/${id}`, payload);
        toast({
          title: t('booking.messages.updateTitle'),
          description: t('booking.messages.updateSuccess'),
        });
      } else {
        await api.post('/schedules', payload);
        toast({
          title: isDraft ? t('booking.messages.successTitle') : t('booking.messages.successTitle'),
          description: isDraft
            ? t('booking.messages.draftSuccess')
            : t('booking.messages.createSuccess'),
        });
      }

      navigate('/bookings');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('booking.messages.errorTitle'),
        description: error.response?.data?.message || (isEditMode ? 'Failed to update' : 'Failed to create'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-4 text-lg">{t('booking.messages.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isEditMode ? t('booking.editTitle') : t('booking.newTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          {isEditMode 
            ? t('booking.editDesc')
            : t('booking.newDesc')
          }
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-center gap-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold border-2 transition-colors',
                    currentStep > step.number
                      ? 'bg-status-approved text-status-approved-foreground border-status-approved'
                      : currentStep === step.number
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border'
                  )}
                >
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-sm font-medium text-center whitespace-nowrap',
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-16 h-0.5 mx-4',
                    currentStep > step.number ? 'bg-status-approved' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-xl border border-border p-6 md:p-8">
        {/* Step 1: Venue & Time */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold">{t('booking.step1')}</h2>

            <div className="space-y-4">
              {/* Auditorium Selection */}
              <div className="space-y-2">
                <Label className="text-base">{t('booking.venue.auditorium')} *</Label>
                <Select
                  value={formData.auditoriumId}
                  onValueChange={(v) => updateFormData('auditoriumId', v)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder={t('booking.venue.selectAuditorium')} />
                  </SelectTrigger>
                  <SelectContent>
                    {auditoriums.map((aud) => (
                      <SelectItem key={aud.id} value={aud.id} className="py-3">
                        <div className="flex items-center justify-between w-full">
                          <span>{t(aud.nameKey)}</span>
                          <span className="text-muted-foreground text-sm ml-4">
                            {aud.capacity} {t('booking.venue.capacity')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base">{t('booking.venue.startDate')} *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full h-12 justify-start text-left font-normal text-base',
                          !formData.startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {formData.startDate ? format(formData.startDate, 'PPP') : t('booking.venue.selectDate')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => updateFormData('startDate', date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">{t('booking.venue.startTime')} *</Label>
                  <Select
                    value={formData.startTime}
                    onValueChange={(v) => updateFormData('startTime', v)}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder={t('booking.venue.selectTime')} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time} className="py-3 text-base">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* End Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base">{t('booking.venue.endDate')} *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full h-12 justify-start text-left font-normal text-base',
                          !formData.endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {formData.endDate ? format(formData.endDate, 'PPP') : t('booking.venue.selectDate')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => updateFormData('endDate', date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">{t('booking.venue.endTime')} *</Label>
                  <Select
                    value={formData.endTime}
                    onValueChange={(v) => updateFormData('endTime', v)}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder={t('booking.venue.selectTime')} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots
                        .filter((time) => !formData.startTime || time > formData.startTime)
                        .map((time) => (
                          <SelectItem key={time} value={time} className="py-3 text-base">
                            {time}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label className="text-base">{t('booking.venue.dueDate')} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full h-12 justify-start text-left font-normal text-base',
                        !formData.dueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      {formData.dueDate ? format(formData.dueDate, 'PPP') : t('booking.venue.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => updateFormData('dueDate', date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Venue Info Card */}
              {selectedAuditorium && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t(selectedAuditorium.nameKey)}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('booking.venue.venueInfo', { capacity: selectedAuditorium.capacity })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Contact Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold">{t('booking.contact.title')}</h2>

            <div className="space-y-4">
              {/* Contact Person Name */}
              <div className="space-y-2">
                <Label className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('booking.contact.name')} *
                </Label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => updateFormData('clientName', e.target.value)}
                  placeholder={t('booking.contact.namePlaceholder')}
                  className="h-12 text-base"
                />
              </div>

              {/* Organization Name */}
              <div className="space-y-2">
                <Label className="text-base flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t('booking.contact.org')} *
                </Label>
                <Input
                  value={formData.contactDetails.organizationName}
                  onChange={(e) => updateFormData('contactDetails.organizationName', e.target.value)}
                  placeholder={t('booking.contact.orgPlaceholder')}
                  className="h-12 text-base"
                />
              </div>

              {/* Designation */}
              <div className="space-y-2">
                <Label className="text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t('booking.contact.designation')} *
                </Label>
                <Input
                  value={formData.contactDetails.designation}
                  onChange={(e) => updateFormData('contactDetails.designation', e.target.value)}
                  placeholder={t('booking.contact.designationPlaceholder')}
                  className="h-12 text-base"
                />
              </div>

              {/* Phone Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('booking.contact.phone')} *
                  </Label>
                  <Input
                    value={formData.contactDetails.telephone}
                    onChange={(e) => updateFormData('contactDetails.telephone', e.target.value)}
                    placeholder="+94112345678"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('booking.contact.mobile')} *
                  </Label>
                  <Input
                    value={formData.contactDetails.mobile}
                    onChange={(e) => updateFormData('contactDetails.mobile', e.target.value)}
                    placeholder="+94712345678"
                    className="h-12 text-base"
                  />
                </div>
              </div>

              {/* Fax & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base">{t('booking.contact.fax')}</Label>
                  <Input
                    value={formData.contactDetails.fax}
                    onChange={(e) => updateFormData('contactDetails.fax', e.target.value)}
                    placeholder="+94112345679"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('booking.contact.email')}
                  </Label>
                  <Input
                    type="email"
                    value={formData.contactDetails.email}
                    onChange={(e) => updateFormData('contactDetails.email', e.target.value)}
                    placeholder="contact@tourism.gov.lk"
                    className="h-12 text-base"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t('booking.contact.address')} *
                </Label>
                <Textarea
                  value={formData.contactDetails.address}
                  onChange={(e) => updateFormData('contactDetails.address', e.target.value)}
                  placeholder={t('booking.contact.addressPlaceholder')}
                  className="min-h-[80px] text-base"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Event Details - ✅ REMOVED Payment Amount */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold">{t('booking.event.title')}</h2>

            <div className="space-y-4">
              {/* Attending People Count */}
              <div className="space-y-2">
                <Label className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('booking.event.attendees')} *
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.attendingPeopleCount}
                  onChange={(e) => updateFormData('attendingPeopleCount', e.target.value)}
                  placeholder="200"
                  className="h-12 text-base"
                />
                {selectedAuditorium && Number(formData.attendingPeopleCount) > selectedAuditorium.capacity && (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {t('booking.event.capacityError', { capacity: selectedAuditorium.capacity })}
                  </p>
                )}
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label className="text-base">{t('booking.event.purpose')} *</Label>
                <Textarea
                  value={formData.purpose}
                  onChange={(e) => updateFormData('purpose', e.target.value)}
                  placeholder={t('booking.event.purposePlaceholder')}
                  className="min-h-[120px] text-base"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Additional Services + Payment - ✅ ADDED Payment Amount Here */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold">{t('booking.services.title')}</h2>

            <div className="space-y-6">
              {/* ✅ NEW: Payment Amount Section (Moved to Top) */}
              <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">
                    {t('booking.payment.title')}
                  </h3>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    {t('booking.payment.amount')} *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">
                      Rs.
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      value={formData.amount}
                      onChange={(e) => updateFormData('amount', e.target.value)}
                      placeholder="50,000.00"
                      className="h-14 text-lg pl-16 font-semibold"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {t('booking.payment.helper')}
                  </p>
                </div>
              </div>

              {/* Additional Services Checkboxes */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-muted-foreground">
                  {t('booking.services.additionalTitle')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="vipRoom"
                      checked={formData.additionalServices.vipRoom}
                      onCheckedChange={(checked) =>
                        updateFormData('additionalServices.vipRoom', checked)
                      }
                    />
                    <Label htmlFor="vipRoom" className="text-base font-normal cursor-pointer">
                      {t('booking.services.vip')}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="multimedia"
                      checked={formData.additionalServices.multimedia}
                      onCheckedChange={(checked) =>
                        updateFormData('additionalServices.multimedia', checked)
                      }
                    />
                    <Label htmlFor="multimedia" className="text-base font-normal cursor-pointer">
                      {t('booking.services.multimedia')}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="airConditioner"
                      checked={formData.additionalServices.airConditioner}
                      onCheckedChange={(checked) =>
                        updateFormData('additionalServices.airConditioner', checked)
                      }
                    />
                    <Label htmlFor="airConditioner" className="text-base font-normal cursor-pointer">
                      {t('booking.services.ac')}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="buffet"
                      checked={formData.additionalServices.buffet}
                      onCheckedChange={(checked) =>
                        updateFormData('additionalServices.buffet', checked)
                      }
                    />
                    <Label htmlFor="buffet" className="text-base font-normal cursor-pointer">
                      {t('booking.services.buffet')}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="soundSystem"
                      checked={formData.additionalServices.soundSystem}
                      onCheckedChange={(checked) =>
                        updateFormData('additionalServices.soundSystem', checked)
                      }
                    />
                    <Label htmlFor="soundSystem" className="text-base font-normal cursor-pointer">
                      {t('booking.services.sound')}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Microphone Counts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base">{t('booking.services.wiredMic')}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.additionalServices.microphoneCount}
                    onChange={(e) =>
                      updateFormData('additionalServices.microphoneCount', parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">{t('booking.services.wirelessMic')}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="6"
                    value={formData.additionalServices.wirelessMicCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      updateFormData('additionalServices.wirelessMicCount', Math.min(value, 6));
                    }}
                    placeholder="0"
                    className="h-12 text-base"
                  />
                </div>
              </div>

              {/* Other Requirements */}
              <div className="space-y-2">
                <Label className="text-base">{t('booking.services.other')}</Label>
                <Textarea
                  value={formData.additionalServices.otherRequirements}
                  onChange={(e) =>
                    updateFormData('additionalServices.otherRequirements', e.target.value)
                  }
                  placeholder={t('booking.services.otherPlaceholder')}
                  className="min-h-[100px] text-base"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              currentStep === 1 ? navigate('/bookings') : setCurrentStep(currentStep - 1)
            }
            className="gap-2"
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-5 h-5" />
            {t('common.back')}
          </Button>

          <div className="flex gap-3">
            {currentStep === 4 && !isEditMode && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="gap-2"
              >
                {t('booking.actions.saveDraft')}
              </Button>
            )}

            {currentStep < 4 ? (
              <Button
                size="lg"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="gap-2"
              >
                {t('common.next')}
                <ChevronRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting || !canProceed()}
                className="gap-2"
              >
                <Check className="w-5 h-5" />
                {isSubmitting 
                  ? (isEditMode ? t('booking.actions.updating') : t('booking.actions.submitting')) 
                  : (isEditMode ? t('booking.actions.update') : t('booking.actions.submit'))
                }
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBooking;