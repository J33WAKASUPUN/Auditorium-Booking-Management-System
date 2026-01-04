import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { shareLinkService } from '@/services/shareLinkService';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ShareLinkAccess = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/share/${token}`);
      return;
    }

    if (!token) {
      setError(t('shareLink.errors.invalidToken'));
      setIsLoading(false);
      return;
    }

    accessLink();
  }, [isAuthenticated, token]);

  const accessLink = async () => {
    if (!token) return;

    try {
      const response = await shareLinkService.accessShareLink(token);
      
      toast({
        title: t('shareLink.toasts.accessSuccess'),
        description: t('shareLink.toasts.accessSuccessDesc'),
      });

      // Redirect to schedule page
      navigate(response.redirectUrl);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('shareLink.errors.accessFailed');
      setError(errorMessage);
      
      toast({
        variant: 'destructive',
        title: t('errors.generic'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <h2 className="text-xl font-semibold mb-2">{t('shareLink.accessing')}</h2>
          <p className="text-muted-foreground">{t('shareLink.accessingDesc')}</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t('shareLink.errors.title')}</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/schedule')}>
            {t('shareLink.backToSchedule')}
          </Button>
        </Card>
      </div>
    );
  }

  return null;
};

export default ShareLinkAccess;