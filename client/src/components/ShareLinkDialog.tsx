import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { shareLinkService, type ShareLinkResponse } from '@/services/shareLinkService';
import { Copy, Check, Share2, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ShareLinkDialogProps {
  scheduleId: string;
  linkType: 'recommendation' | 'approval';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShareLinkDialog = ({
  scheduleId,
  linkType,
  open,
  onOpenChange,
}: ShareLinkDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState<ShareLinkResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const link = await shareLinkService.generateShareLink(scheduleId, linkType);
      setShareLink(link);
      
      toast({
        title: t('shareLink.toasts.generated'),
        description: t('shareLink.toasts.generatedDesc'),
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('errors.generic'),
        description: error.response?.data?.message || t('shareLink.toasts.generateError'),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink.shareUrl);
      setCopied(true);
      
      toast({
        title: t('shareLink.toasts.copied'),
        description: t('shareLink.toasts.copiedDesc'),
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('errors.generic'),
        description: t('shareLink.toasts.copyError'),
      });
    }
  };

  const handleClose = () => {
    setShareLink(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 className="w-5 h-5" />
            {linkType === 'recommendation' 
              ? t('shareLink.title.recommendation')
              : t('shareLink.title.approval')}
          </DialogTitle>
          <DialogDescription>
            {linkType === 'recommendation'
              ? t('shareLink.description.recommendation')
              : t('shareLink.description.approval')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareLink ? (
            <div className="text-center py-8">
              <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-6">
                {t('shareLink.generatePrompt')}
              </p>
              <Button
                onClick={handleGenerateLink}
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('shareLink.generating')}
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    {t('shareLink.generate')}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="share-url">{t('shareLink.url')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={shareLink.shareUrl}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      {t('shareLink.expiresAt')}
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      {format(new Date(shareLink.expiresAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>{t('shareLink.note')}:</strong>{' '}
                  {linkType === 'recommendation'
                    ? t('shareLink.noteRecommendation')
                    : t('shareLink.noteApproval')}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareLinkDialog;