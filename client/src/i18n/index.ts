import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 1. Common Files
import enCommon from './locales/en/en.json';
import siCommon from './locales/si/si.json';

// 2. NewBooking Page Files
import enBookingForm from './locales/en/newBooking.json';
import siBookingForm from './locales/si/newBooking.json';

// 3. Bookings List Page Files
import enBookingsList from './locales/en/bookings.json';
import siBookingsList from './locales/si/bookings.json';

// 4. Schedule Page Files
import enSchedule from './locales/en/schedule.json';
import siSchedule from './locales/si/schedule.json';

// 5. Payments Page Files
import enPayments from './locales/en/payments.json';
import siPayments from './locales/si/payments.json';

// 6. Reports Page Files
import enReports from './locales/en/reports.json';
import siReports from './locales/si/reports.json';

// 7. Profile Page Files
import enProfile from './locales/en/profile.json';
import siProfile from './locales/si/profile.json';

// 8. Calendar Page Files
import enCalendar from './locales/en/calendar.json';
import siCalendar from './locales/si/calendar.json';

// 9. Approval Dialog Files
import enApproval from './locales/en/approval.json';
import siApproval from './locales/si/approval.json';

// 10. Booking Detail Dialog Files
import enBookingDetail from './locales/en/bookingDetail.json';
import siBookingDetail from './locales/si/bookingDetail.json';

// 11. Booking View Dialog Files
import enBookingView from './locales/en/bookingView.json';
import siBookingView from './locales/si/bookingView.json';

// 12. Notification Dropdown Files
import enNotifications from './locales/en/notifications.json';
import siNotifications from './locales/si/notifications.json';

// 13. Payment Confirmation Dialog Files
import enPaymentConfirm from './locales/en/paymentConfirm.json';
import siPaymentConfirm from './locales/si/paymentConfirm.json';

// 14. Payment View Dialog Files
import enPaymentView from './locales/en/paymentView.json';
import siPaymentView from './locales/si/paymentView.json';

// 15. Recommendation Action Dialog Files
import enRecommendation from './locales/en/recommendation.json';
import siRecommendation from './locales/si/recommendation.json';

// 16. Sidebar Component Files
import enSidebar from './locales/en/sidebar.json';
import siSidebar from './locales/si/sidebar.json';

// 17. Login Page Files
import enLogin from './locales/en/login.json';
import siLogin from './locales/si/login.json';

// 18. Refund Dialog Files
import enRefund from './locales/en/refund.json';
import siRefund from './locales/si/refund.json';

// 19. Extra Charge Dialog Files
import enExtraCharge from './locales/en/extraCharge.json';
import siExtraCharge from './locales/si/extraCharge.json';

// 20. Share Link Dialog Files
import enShareLink from './locales/en/shareLink.json';
import siShareLink from './locales/si/shareLink.json';

const savedLanguage = localStorage.getItem('language') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        ...enCommon,
        booking: enBookingForm,
        bookingsList: enBookingsList,
        schedule: enSchedule,
        payments: enPayments,
        reports: enReports,
        profilePage: enProfile,
        calendarPage: enCalendar,
        approval: enApproval,
        bookingDetail: enBookingDetail,
        bookingView: enBookingView,
        notifications: enNotifications,
        paymentConfirm: enPaymentConfirm,
        paymentView: enPaymentView,
        recommendation: enRecommendation,
        sidebar: enSidebar,
        loginPage: enLogin,
        refund: enRefund,
        extraCharge: enExtraCharge,
        ...enShareLink
      }
    },
    si: {
      translation: {
        ...siCommon,
        booking: siBookingForm,
        bookingsList: siBookingsList,
        schedule: siSchedule,
        payments: siPayments,
        reports: siReports,
        profilePage: siProfile,
        calendarPage: siCalendar,
        approval: siApproval,
        bookingDetail: siBookingDetail,
        bookingView: siBookingView,
        notifications: siNotifications,
        paymentConfirm: siPaymentConfirm,
        paymentView: siPaymentView,
        recommendation: siRecommendation,
        sidebar: siSidebar,
        loginPage: siLogin,
        refund: siRefund,
        extraCharge: siExtraCharge,
        ...enShareLink
      }
    },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;