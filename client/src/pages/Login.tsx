import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Building2, Eye, EyeOff, Loader2, Calendar, BarChart3, ShieldCheck, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email('emailInvalid').min(1, 'emailRequired'),
  password: z.string().min(1, 'passwordRequired'),
});

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as 'email' | 'password';
        // Updated path to new namespace for validation errors
        fieldErrors[field] = t(`loginPage.validation.${issue.message}`);
      });
      setErrors(fieldErrors);
      return;
    }

    const response = await login(email, password);

    if (response.success) {
      toast({
        title: t('success.saved'), // Assuming success.saved exists in common
        description: t('loginPage.welcome'), // Using welcome message for success toast
      });
      navigate('/');
    } else {
      toast({
        variant: 'destructive',
        title: t('errors.generic'),
        description: t(`loginPage.errors.${response.error}`) || response.error,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      {/* --- LEFT SIDE: Login Form --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-8 sm:px-12 lg:px-24 bg-background py-12">
        
        {/* Top Spacer to center the form vertically */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          
          {/* Logo & Header */}
          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-slate-900 rounded-lg text-white">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                {t('loginPage.appName')}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {t('loginPage.welcome')}
            </h1>
            <p className="text-muted-foreground">
              {t('loginPage.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t('loginPage.form.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@auditorium.gov.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-muted/30 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                disabled={isLoading}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('loginPage.form.passwordLabel')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-muted/30 pr-10 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Separator />

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium shadow-lg shadow-slate-900/20 bg-slate-900 hover:bg-slate-800 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('loginPage.form.signingIn')}
                </>
              ) : (
                t('loginPage.form.signIn')
              )}
            </Button>
          </form>

          {/* Optional Demo Text */}
          <div className="pt-6">
             <div className="text-xs text-muted-foreground/60 text-center">
               {/* Demo credentials text removed in original, keeping it removed */}
             </div>
          </div>
        </div>

        {/* --- Footer Section --- */}
      <div className="max-w-md mx-auto w-full text-center space-y-4 pt-8">
        <div className="text-sm text-muted-foreground">
          <a 
            href="/privacy-policy" 
            className="hover:text-slate-900 underline underline-offset-4"
          >
            {t('loginPage.footer.privacy')}
          </a>
        </div>
        <div className="text-xs text-muted-foreground/80 space-y-1">
          <p>{t('loginPage.footer.poweredBy')} <span className="font-semibold text-slate-900">Innovior System Solutions</span></p>
          <p>{t('loginPage.footer.contact')} <a href="mailto:dev@innovior.lk" className="hover:text-slate-900">dev@innovior.lk</a></p>
        </div>
      </div>
      </div>

      {/* --- RIGHT SIDE: Typography-Focused Design --- */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-950 via-[#050a15] to-black relative overflow-hidden p-16 lg:p-20">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-center w-full h-full text-white">
          
          <div className="flex flex-col space-y-20">
            
            {/* Hero Typography */}
            <div className="space-y-6">
              <h2 className="text-6xl font-bold leading-tight tracking-tight text-white">
                {t('loginPage.hero.titleLine1')}
                <br />
                {t('loginPage.hero.titleLine2')}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {t('loginPage.hero.titleHighlight')}
                </span>
              </h2>
              
              <div className="max-w-xl">
                <p className="text-xl text-slate-300 font-light leading-relaxed">
                  {t('loginPage.hero.desc')}
                </p>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-10 w-full">
              
              {/* Feature 1 */}
              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{t('loginPage.hero.features.scheduling')}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mt-1">
                    {t('loginPage.hero.features.schedulingDesc')}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{t('loginPage.hero.features.analytics')}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mt-1">
                    {t('loginPage.hero.features.analyticsDesc')}
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{t('loginPage.hero.features.workflow')}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mt-1">
                    {t('loginPage.hero.features.workflowDesc')}
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{t('loginPage.hero.features.collab')}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mt-1">
                    {t('loginPage.hero.features.collabDesc')}
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

export default Login;