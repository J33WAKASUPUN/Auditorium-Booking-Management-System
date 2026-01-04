import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Loader2, User, Shield, Calendar } from 'lucide-react';

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getRoleLabel = (role: string) => {
    // Dynamically translate roles based on key
    return t(`profilePage.roles.${role}`) || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colorMap: Record<string, string> = {
      admin: 'bg-red-500/10 text-red-500 border-red-500/20',
      recommendation: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      approval: 'bg-green-500/10 text-green-500 border-green-500/20',
    };
    return colorMap[role] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!currentPassword) {
      setErrors({ currentPassword: t('profilePage.errors.currentPasswordRequired') });
      return;
    }

    if (!newPassword) {
      setErrors({ newPassword: t('profilePage.errors.newPasswordRequired') });
      return;
    }

    if (newPassword.length < 6) {
      setErrors({ newPassword: t('profilePage.errors.passwordMinLength') });
      return;
    }

    if (!confirmPassword) {
      setErrors({ confirmPassword: t('profilePage.errors.confirmPasswordRequired') });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: t('profilePage.errors.passwordMismatch') });
      return;
    }

    setIsLoading(true);

    try {
      await authApi.changePassword(currentPassword, newPassword);

      toast({
        title: t('common.success') || t('success.saved'), // Fallback if common.success not set
        description: t('profilePage.success.passwordChanged'),
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '';

      if (errorMessage.includes('Current password')) {
        toast({
          variant: 'destructive',
          title: t('errors.generic'),
          description: t('profilePage.errors.currentPasswordIncorrect'),
        });
      } else if (errorMessage.includes('same as current')) {
        toast({
          variant: 'destructive',
          title: t('errors.generic'),
          description: t('profilePage.errors.newPasswordSameAsCurrent'),
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('errors.generic'),
          description: errorMessage || t('errors.generic'),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('profilePage.title')}</h1>
        <p className="text-lg text-muted-foreground mt-1">
          {t('profilePage.accountDetails')}
        </p>
      </div>

      {/* User Information Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">{t('profilePage.userInformation')}</CardTitle>
          <CardDescription>Your personal information and role details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <h2 className="text-3xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-lg text-muted-foreground">{user?.email}</p>
              <Badge
                className={`${getRoleBadgeColor(user?.role || '')} text-sm font-medium px-3 py-1`}
              >
                <Shield className="w-4 h-4 mr-1" />
                {user?.role ? getRoleLabel(user.role) : 'Loading...'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>User ID</span>
              </div>
              <p className="text-base font-mono text-foreground">{user?.id || 'N/A'}</p>
            </div> */}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>{t('profilePage.role')}</span>
              </div>
              <p className="text-base font-medium text-foreground">
                {user?.role ? getRoleLabel(user.role) : 'N/A'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{t('profilePage.lastLogin')}</span>
              </div>
              <p className="text-base text-foreground">
                {formatDate(user?.lastLogin)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profilePage.changePassword')}</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-base font-medium">
                {t('profilePage.currentPassword')}
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-12 text-base pr-12"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-10 w-10"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isLoading}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-base font-medium">
                {t('profilePage.newPassword')}
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 text-base pr-12"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-10 w-10"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isLoading}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base font-medium">
                {t('profilePage.confirmPassword')}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 text-base pr-12"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-10 w-10"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isLoading} className="min-w-32">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('common.save')
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;