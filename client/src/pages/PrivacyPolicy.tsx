import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Shield, Lock, Eye, Database, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'en' | 'si'>('en');

  return (
    // FIX: Changed min-h-screen to h-screen to lock the viewport height
    <div className="h-screen w-full flex overflow-hidden bg-background">
      
      {/* --- LEFT SIDE: Privacy Policy Content --- */}
      {/* FIX: Added h-full to ensure this column fills the screen height */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background h-full">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-8 sm:px-12 lg:px-16 py-6 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/login')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
            
            {/* Language Toggle */}
            <Tabs value={language} onValueChange={(val) => setLanguage(val as 'en' | 'si')} className="w-auto">
              <TabsList className="h-9">
                <TabsTrigger value="en" className="text-sm">English</TabsTrigger>
                <TabsTrigger value="si" className="text-sm">සිංහල</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {language === 'en' ? 'Privacy Policy' : 'රහස්‍යතා ප්‍රතිපත්තිය'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'Last updated: January 2025' 
                  : 'අවසන් යාවත්කාලීනය: ජනවාරි 2025'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {/* FIX: Removed fixed calc height and used flex-1 so it fills remaining space automatically */}
        <ScrollArea className="flex-1">
          <div className="px-8 sm:px-12 lg:px-16 py-8 space-y-8">
            
            {/* English Content */}
            {language === 'en' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                
                {/* Introduction */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Welcome to the Auditorium Booking Management System ("the System"). This Privacy Policy 
                    explains how we collect, use, disclose, and safeguard your information when you use our 
                    platform for auditorium booking and management services.
                  </p>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    By accessing or using our System, you agree to this Privacy Policy. If you do not agree 
                    with the terms of this policy, please do not access the System.
                  </p>
                </section>

                <Separator />

                {/* Information We Collect */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">2. Information We Collect</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">2.1 Personal Information</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      We collect personal information that you provide when creating an account or making a booking:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                      <li>Full name and designation</li>
                      <li>Organization/Ministry name</li>
                      <li>Email address</li>
                      <li>Phone numbers (mobile and landline)</li>
                      <li>Postal address</li>
                      <li>Government identification details (when required)</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">2.2 Booking Information</h3>
                    <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                      <li>Event details (purpose, date, time, duration)</li>
                      <li>Auditorium preferences and requirements</li>
                      <li>Expected number of attendees</li>
                      <li>Additional service requests</li>
                      <li>Payment information and transaction records</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">2.3 Technical Information</h3>
                    <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                      <li>IP address and browser type</li>
                      <li>Device information and operating system</li>
                      <li>Login timestamps and session data</li>
                      <li>System usage patterns and analytics</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* How We Use Your Information */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">3. How We Use Your Information</h2>
                  </div>
                  
                  <p className="text-base text-muted-foreground leading-relaxed">
                    We use the collected information for the following purposes:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                    <li>Processing and managing auditorium bookings</li>
                    <li>Sending booking confirmations and notifications</li>
                    <li>Processing payments and generating invoices</li>
                    <li>Facilitating the approval workflow (Admin → Recommendation → Approval)</li>
                    <li>Communicating important updates about your bookings</li>
                    <li>Generating analytics and reports for system improvement</li>
                    <li>Ensuring system security and preventing fraudulent activities</li>
                    <li>Complying with legal and regulatory requirements</li>
                  </ul>
                </section>

                <Separator />

                {/* Data Sharing */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">4. Data Sharing and Disclosure</h2>
                  </div>
                  
                  <p className="text-base text-muted-foreground leading-relaxed">
                    We do not sell, trade, or rent your personal information to third parties. We may share 
                    your information only in the following circumstances:
                  </p>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">4.1 Within the Organization</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Your booking information is shared with authorized personnel (Administrators, 
                      Recommendation Officers, and Approval Officers) as part of the booking approval process.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">4.2 Service Providers</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      We may share data with trusted third-party service providers who assist us in:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                      <li>Cloud hosting and data storage (MongoDB Atlas)</li>
                      <li>Email notification services</li>
                      <li>Payment processing (if applicable)</li>
                      <li>System maintenance and technical support</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">4.3 Legal Requirements</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      We may disclose your information if required by law, court order, or government 
                      regulations, or to protect the rights and safety of our users and the System.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Data Security */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">5. Data Security</h2>
                  </div>
                  
                  <p className="text-base text-muted-foreground leading-relaxed">
                    We implement industry-standard security measures to protect your information:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                    <li>Encrypted data transmission using HTTPS/TLS protocols</li>
                    <li>Secure password hashing using bcrypt</li>
                    <li>Role-based access control (RBAC) to limit data access</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Secure cloud infrastructure with MongoDB Atlas</li>
                    <li>Automated backups and disaster recovery procedures</li>
                    <li>Session management with JWT tokens</li>
                  </ul>

                  <p className="text-base text-muted-foreground leading-relaxed mt-4">
                    However, no method of transmission over the Internet is 100% secure. While we strive 
                    to protect your information, we cannot guarantee absolute security.
                  </p>
                </section>

                <Separator />

                {/* Data Retention */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">6. Data Retention</h2>
                  </div>
                  
                  <p className="text-base text-muted-foreground leading-relaxed">
                    We retain your personal information for as long as necessary to:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                    <li>Fulfill the purposes outlined in this Privacy Policy</li>
                    <li>Comply with legal, accounting, or reporting requirements</li>
                    <li>Resolve disputes and enforce our agreements</li>
                    <li>Maintain system records and audit trails</li>
                  </ul>

                  <p className="text-base text-muted-foreground leading-relaxed mt-4">
                    Booking records are typically retained for a minimum of 7 years for auditing and 
                    compliance purposes.
                  </p>
                </section>

                <Separator />

                {/* Your Rights */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">7. Your Rights</h2>
                  </div>
                  
                  <p className="text-base text-muted-foreground leading-relaxed">
                    You have the following rights regarding your personal information:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
                    <li><strong>Restriction:</strong> Request limitation of data processing</li>
                    <li><strong>Objection:</strong> Object to certain data processing activities</li>
                    <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                  </ul>

                  <p className="text-base text-muted-foreground leading-relaxed mt-4">
                    To exercise these rights, please contact us at{' '}
                    <a href="mailto:dev@innovior.lk" className="text-primary hover:underline font-medium">
                      dev@innovior.lk
                    </a>
                  </p>
                </section>

                <Separator />

                {/* Cookies */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">8. Cookies and Tracking</h2>
                  </div>
                  
                  <p className="text-base text-muted-foreground leading-relaxed">
                    We use essential cookies and local storage to:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                    <li>Maintain your login session</li>
                    <li>Remember your language preference</li>
                    <li>Store authentication tokens securely</li>
                    <li>Improve system performance and user experience</li>
                  </ul>

                  <p className="text-base text-muted-foreground leading-relaxed mt-4">
                    You can control cookie settings through your browser, but disabling cookies may 
                    affect the functionality of the System.
                  </p>
                </section>

                <Separator />

                {/* Changes to Policy */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">9. Changes to This Policy</h2>
                  </div>
                  
                  <p className="text-base text-muted-foreground leading-relaxed">
                    We may update this Privacy Policy from time to time to reflect changes in our practices 
                    or legal requirements. We will notify you of any material changes by:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                    <li>Posting the updated policy on this page</li>
                    <li>Updating the "Last updated" date</li>
                    <li>Sending email notifications for significant changes</li>
                  </ul>

                  <p className="text-base text-muted-foreground leading-relaxed mt-4">
                    Your continued use of the System after changes are posted constitutes acceptance 
                    of the updated policy.
                  </p>
                </section>

                <Separator />

                {/* Contact */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">10. Contact Us</h2>
                  </div>
                  
                  <p className="text-base text-muted-foreground leading-relaxed">
                    If you have any questions, concerns, or requests regarding this Privacy Policy or 
                    your personal information, please contact us:
                  </p>
                  
                  <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">Innovior Developers</p>
                        <p className="text-sm text-muted-foreground">Auditorium Booking Management System</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <a href="mailto:dev@innovior.lk" className="text-primary hover:underline">
                          dev@innovior.lk
                        </a>
                      </p>
                      <p className="text-muted-foreground">
                        Response time: Within 48 hours
                      </p>
                    </div>
                  </div>
                </section>

                {/* Footer Note */}
                <div className="pt-8 pb-12">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Note:</strong> This Privacy Policy is designed 
                      to comply with Sri Lankan data protection laws and international best practices. 
                      For government users, additional confidentiality requirements may apply as per 
                      your organizational policies.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* Sinhala Content */}
            {language === 'si' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                
                {/* Introduction */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">1. හැඳින්වීම</h2>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    ශ්‍රවණාගාර වෙන්කිරීම් කළමනාකරණ පද්ධතියට ("පද්ධතිය") සාදරයෙන් පිළිගනිමු. මෙම රහස්‍යතා 
                    ප්‍රතිපත්තිය ශ්‍රවණාගාර වෙන්කිරීම් සහ කළමනාකරණ සේවා සඳහා අපගේ වේදිකාව භාවිතා කරන විට 
                    අප ඔබේ තොරතුරු එකතු කරන්නේ, භාවිතා කරන්නේ, හෙළිදරව් කරන්නේ සහ ආරක්ෂා කරන්නේ කෙසේද 
                    යන්න පැහැදිලි කරයි.
                  </p>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    අපගේ පද්ධතියට ප්‍රවේශ වීමෙන් හෝ භාවිතා කිරීමෙන්, ඔබ මෙම රහස්‍යතා ප්‍රතිපත්තියට එකඟ වේ. 
                    මෙම ප්‍රතිපත්තියේ කොන්දේසි සමඟ ඔබ එකඟ නොවන්නේ නම්, කරුණාකර පද්ධතියට ප්‍රවේශ නොවන්න.
                  </p>
                </section>

                <Separator />

                {/* Information We Collect */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">2. අප එකතු කරන තොරතුරු</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">2.1 පුද්ගලික තොරතුරු</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      ගිණුමක් සාදන විට හෝ වෙන්කිරීමක් කරන විට ඔබ සපයන පුද්ගලික තොරතුරු අප එකතු කරමු:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                      <li>සම්පූර්ණ නම සහ තනතුර</li>
                      <li>සංවිධානය/අමාත්‍යාංශයේ නම</li>
                      <li>විද්‍යුත් තැපැල් ලිපිනය</li>
                      <li>දුරකථන අංක (ජංගම සහ ස්ථාවර)</li>
                      <li>තැපැල් ලිපිනය</li>
                      <li>රජයේ හැඳුනුම්පත් විස්තර (අවශ්‍ය විට)</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">2.2 වෙන්කිරීම් තොරතුරු</h3>
                    <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                      <li>උත්සව විස්තර (අරමුණ, දිනය, වේලාව, කාලසීමාව)</li>
                      <li>ශ්‍රවණාගාර මනාපයන් සහ අවශ්‍යතා</li>
                      <li>අපේක්ෂිත සහභාගිවන්නන් සංඛ්‍යාව</li>
                      <li>අතිරේක සේවා ඉල්ලීම්</li>
                      <li>ගෙවීම් තොරතුරු සහ ගනුදෙනු වාර්තා</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">2.3 තාක්ෂණික තොරතුරු</h3>
                    <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                      <li>IP ලිපිනය සහ බ්‍රවුසර් වර්ගය</li>
                      <li>උපාංග තොරතුරු සහ මෙහෙයුම් පද්ධතිය</li>
                      <li>පිවිසුම් කාල මුද්‍රා සහ සැසි දත්ත</li>
                      <li>පද්ධති භාවිත රටා සහ විශ්ලේෂණ</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* How We Use Your Information */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">3. අපි ඔබේ තොරතුරු භාවිතා කරන ආකාරය</h2>
                  </div>
                  
                  <p className="text-base text-muted-foreground leading-relaxed">
                    පහත අරමුණු සඳහා අප එකතු කරන ලද තොරතුරු භාවිතා කරමු:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                    <li>ශ්‍රවණාගාර වෙන්කිරීම් සැකසීම සහ කළමනාකරණය කිරීම</li>
                    <li>වෙන්කිරීම් තහවුරු කිරීම් සහ දැනුම්දීම් යැවීම</li>
                    <li>ගෙවීම් සැකසීම සහ ඉන්වොයිසි ජනනය කිරීම</li>
                    <li>අනුමත කිරීමේ වැඩ ප්‍රවාහය පහසු කිරීම</li>
                    <li>ඔබේ වෙන්කිරීම් පිළිබඳ වැදගත් යාවත්කාලීන සන්නිවේදනය කිරීම</li>
                    <li>පද්ධති වැඩිදියුණු කිරීම සඳහා විශ්ලේෂණ සහ වාර්තා ජනනය කිරීම</li>
                    <li>පද්ධති ආරක්ෂාව සහතික කිරීම සහ වංචනික ක්‍රියාකාරකම් වැළැක්වීම</li>
                    <li>නීතිමය සහ නියාමන අවශ්‍යතා වලට අනුකූල වීම</li>
                  </ul>
                </section>

                <Separator />

                {/* Data Sharing */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">4. දත්ත බෙදාගැනීම සහ හෙළිදරව් කිරීම</h2>
                  </div>
                  
                  <p className="text-base text-muted-foreground leading-relaxed">
                    අපි ඔබේ පුද්ගලික තොරතුරු තෙවන පාර්ශ්වයන්ට විකිණීම, වෙළඳාම් කිරීම හෝ කුලියට දීම සිදු නොකරමු. 
                    පහත අවස්ථා වලදී පමණක් අපි ඔබේ තොරතුරු බෙදා ගනිමු:
                  </p>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">4.1 සංවිධානය තුළ</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      වෙන්කිරීම් අනුමත කිරීමේ ක්‍රියාවලියේ කොටසක් ලෙස ඔබේ වෙන්කිරීම් තොරතුරු බලයලත් 
                      නිලධාරීන් (පරිපාලකයන්, නිර්දේශ නිලධාරීන්, සහ අනුමත නිලධාරීන්) සමඟ බෙදා ගනු ලැබේ.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">4.2 සේවා සපයන්නන්</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      පහත කටයුතු සඳහා අපට උදව් කරන විශ්වාසනීය තෙවන පාර්ශ්ව සේවා සපයන්නන් සමඟ 
                      අපි දත්ත බෙදා ගන්නට ඇත:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                      <li>වලාකුළු සත්කාරකත්වය සහ දත්ත ගබඩාව (MongoDB Atlas)</li>
                      <li>විද්‍යුත් තැපැල් දැනුම්දීම් සේවා</li>
                      <li>ගෙවීම් සැකසීම (අදාළ නම්)</li>
                      <li>පද්ධති නඩත්තුව සහ තාක්ෂණික සහාය</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">4.3 නීතිමය අවශ්‍යතා</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      නීතියෙන්, උසාවි නියෝගයකින් හෝ රජයේ රෙගුලාසි මගින් අවශ්‍ය නම්, හෝ අපගේ භාවිතා 
                      කරන්නන්ගේ සහ පද්ධතියේ අයිතිවාසිකම් සහ ආරක්ෂාව ආරක්ෂා කිරීම සඳහා අපි ඔබේ තොරතුරු 
                      හෙළිදරව් කළ හැකිය.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Data Security */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">5. දත්ත ආරක්ෂාව</h2>
                  </div>
                  
                  <p className="text-base text-muted-foreground leading-relaxed">
                    ඔබේ තොරතුරු ආරක්ෂා කිරීම සඳහා අපි කර්මාන්ත-සම්මත ආරක්ෂණ පියවර ක්‍රියාත්මක කරමු:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
                    <li>HTTPS/TLS ප්‍රොටෝකෝල භාවිතයෙන් සංකේතාත්මක දත්ත සම්ප්‍රේෂණය</li>
                    <li>bcrypt භාවිතයෙන් ආරක්ෂිත මුරපද හැෂින්</li>
                    <li>දත්ත ප්‍රවේශය සීමා කිරීම සඳහා භූමිකා-පදනම් කළ ප්‍රවේශ පාලනය (RBAC)</li>
                    <li>නිතිපතා ආරක්ෂණ විගණන සහ දුර්වලතා තක්සේරු</li>
                    <li>MongoDB Atlas සමඟ ආරක්ෂිත වලාකුළු යටිතල පහසුකම්</li>
                    <li>ස්වයංක්‍රීය උපස්ථ සහ ආපදා ප්‍රතිසාධන ක්‍රියා පටිපාටි</li>
                    <li>JWT ටෝකන සමඟ සැසි කළමනාකරණය</li>
                  </ul>

                  <p className="text-base text-muted-foreground leading-relaxed mt-4">
                    කෙසේ වෙතත්, අන්තර්ජාලය හරහා සම්ප්‍රේෂණය කිරීමේ කිසිදු ක්‍රමයක් 100% ආරක්ෂිත නොවේ. 
                    අපි ඔබේ තොරතුරු ආරක්ෂා කිරීමට උත්සාහ කරන අතර, අපට නිරපේක්ෂ ආරක්ෂාව සහතික කළ නොහැක.
                  </p>
                </section>

                <Separator />

                {/* Contact */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">6. අප හා සම්බන්ධ වන්න</h2>
                  </div>
                  
                  <p className="text-base text-muted-foreground leading-relaxed">
                    මෙම රහස්‍යතා ප්‍රතිපත්තිය හෝ ඔබේ පුද්ගලික තොරතුරු සම්බන්ධයෙන් ඔබට කිසියම් ප්‍රශ්නයක්, 
                    කනස්සල්ලක් හෝ ඉල්ලීමක් තිබේ නම්, කරුණාකර අප හා සම්බන්ධ වන්න:
                  </p>
                  
                  <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">Innovior Developers</p>
                        <p className="text-sm text-muted-foreground">ශ්‍රවණාගාර වෙන්කිරීම් කළමනාකරණ පද්ධතිය</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <a href="mailto:dev@innovior.lk" className="text-primary hover:underline">
                          dev@innovior.lk
                        </a>
                      </p>
                      <p className="text-muted-foreground">
                        ප්‍රතිචාර කාලය: පැය 48 ක් ඇතුළත
                      </p>
                    </div>
                  </div>
                </section>

                {/* Footer Note */}
                <div className="pt-8 pb-12">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">සටහන:</strong> මෙම රහස්‍යතා ප්‍රතිපත්තිය 
                      ශ්‍රී ලංකා දත්ත ආරක්ෂණ නීතිවලට සහ ජාත්‍යන්තර හොඳම භාවිතයන්ට අනුකූල වන පරිදි 
                      නිර්මාණය කර ඇත. රජයේ භාවිතා කරන්නන් සඳහා, ඔබේ සංවිධානාත්මක ප්‍රතිපත්ති අනුව 
                      අතිරේක රහස්‍යභාව අවශ්‍යතා අදාළ විය හැකිය.
                    </p>
                  </div>
                </div>

              </div>
            )}

          </div>
        </ScrollArea>
      </div>

      {/* --- RIGHT SIDE: Design Element (Same as Login) --- */}
      {/* FIX: Added h-full to lock this side */}
      <div className="hidden lg:flex w-1/2 h-full bg-gradient-to-br from-slate-950 via-[#050a15] to-black relative overflow-hidden p-16 lg:p-20">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-center w-full h-full text-white">
          
          <div className="flex flex-col space-y-20">
            
            {/* Privacy Hero Typography */}
            <div className="space-y-6">
              <h2 className="text-6xl font-bold leading-tight tracking-tight text-white">
                Your
                <br />
                Privacy
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Matters
                </span>
              </h2>
              
              <div className="max-w-xl">
                <p className="text-xl text-slate-300 font-light leading-relaxed">
                  We are committed to protecting your personal information and maintaining the 
                  highest standards of data security and privacy.
                </p>
              </div>
            </div>

            {/* Privacy Features Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-10 w-full">
              
              {/* Feature 1 */}
              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Data Protection</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mt-1">
                    Industry-standard encryption and security measures
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Secure Access</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mt-1">
                    Role-based access control and session management
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <Eye className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Transparency</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mt-1">
                    Clear information about data collection and usage
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <FileText className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Your Rights</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mt-1">
                    Access, correct, or delete your personal information
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;