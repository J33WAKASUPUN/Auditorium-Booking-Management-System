import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Building, Bell, Shield, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const handleSave = () => {
    toast({ title: t('success.saved'), description: 'Your settings have been updated.' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('nav.settings')}</h1>
        <p className="text-lg text-muted-foreground mt-1">Manage system configuration</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="h-12 p-1">
          <TabsTrigger value="general" className="h-10 px-6 text-base gap-2">
            <Building className="w-4 h-4" />General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="h-10 px-6 text-base gap-2">
            <Bell className="w-4 h-4" />Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="h-10 px-6 text-base gap-2">
            <Shield className="w-4 h-4" />Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <h3 className="text-lg font-semibold">Organization Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base">Organization Name</Label>
                <Input defaultValue="University Auditorium" className="h-12 text-base" />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Contact Email</Label>
                <Input defaultValue="bookings@university.edu" className="h-12 text-base" />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Phone Number</Label>
                <Input defaultValue="+94 11 234 5678" className="h-12 text-base" />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Operating Hours</Label>
                <Input defaultValue="8:00 AM - 10:00 PM" className="h-12 text-base" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <h3 className="text-lg font-semibold">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive booking updates via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive urgent alerts via SMS</p>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label className="text-base">Current Password</Label>
                <Input type="password" className="h-12 text-base" />
              </div>
              <div className="space-y-2">
                <Label className="text-base">New Password</Label>
                <Input type="password" className="h-12 text-base" />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Confirm New Password</Label>
                <Input type="password" className="h-12 text-base" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} className="gap-2">
          <Save className="w-5 h-5" />{t('common.save')}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
