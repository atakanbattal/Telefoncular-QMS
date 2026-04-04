import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { LogIn } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { APP_BRAND, PUBLIC_BRAND_LOGO } from '@/lib/appBranding';

/** Kullanıcı adı @ içermiyorsa eklenecek alan adı (tam e-posta yazılabilir). */
const loginEmailDomain = import.meta.env.VITE_LOGIN_EMAIL_DOMAIN || 'telefoncular.com.tr';
/** Giriş ekranı alt bilgisi — ortam değişkeninden bağımsız (Kademe kalıntısı olmasın). */
const LOGIN_FOOTER_COPY = 'Telefoncular QMS — Kalite Yönetim Sistemi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';
  const isSignedOut = new URLSearchParams(location.search).get('signedout') === '1';

  useEffect(() => {
    if (session) {
      if (isSignedOut && window.history.replaceState) {
        window.history.replaceState({}, '', '/login');
      }
      setLoading(false);
      navigate(from, { replace: true });
    } else if (isSignedOut && window.history.replaceState) {
      window.history.replaceState({}, '', '/login');
    }
  }, [session, navigate, from, isSignedOut]);

    const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
        setLoading(false);
        toast({
            variant: "destructive",
            title: "Hata",
            description: "E-posta ve şifre alanları zorunludur.",
            duration: 5000,
        });
        return;
    }
    
    const trimmed = email.trim();
    const emailToLogin = (trimmed.includes('@') ? trimmed : `${trimmed}@${loginEmailDomain}`).toLowerCase();

    try {
      const { data, error } = await signIn(emailToLogin, password);
      
      if (error) {
        setLoading(false);
        let errorMessage = "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
        let errorTitle = "Giriş Başarısız";
        
        if (error.message) {
          if (error.message.includes("Invalid login credentials") || error.message.includes("invalid_credentials")) {
            errorTitle = "Geçersiz Bilgiler";
            errorMessage = "Kullanıcı adı veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.";
          } else if (error.message.includes("Email not confirmed")) {
            errorTitle = "E-posta Onayı Gerekli";
            errorMessage = "E-posta adresiniz henüz onaylanmamış. Lütfen e-postanızı kontrol edin.";
          } else if (error.message.includes("Too many requests")) {
            errorTitle = "Çok Fazla Deneme";
            errorMessage = "Çok fazla giriş denemesi yapıldı. Lütfen birkaç dakika bekleyip tekrar deneyin.";
          } else if (error.message.includes("fetch") || error.message.includes("network")) {
            errorTitle = "Bağlantı Hatası";
            errorMessage = "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
          } else {
            errorMessage = error.message;
          }
        }
        
        console.error('Login failed:', error);
        toast({
          variant: "destructive",
          title: errorTitle,
          description: errorMessage,
          duration: 6000,
        });
        return;
      }
      
      if (data?.session) {
        toast({
          title: "Giriş Başarılı!",
          description: `${APP_BRAND}'e hoş geldiniz.`,
          duration: 3000,
        });
        setLoading(false);
      } else {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Giriş Başarısız",
          description: "Oturum oluşturulamadı. Lütfen tekrar deneyin.",
          duration: 5000,
        });
      }
    } catch (err) {
      setLoading(false);
      console.error('Login error:', err);
      
      let errorMessage = "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
      if (err.message) {
        if (err.message.includes("fetch") || err.message.includes("network") || err.message.includes("Failed to fetch")) {
          errorMessage = "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
        } else {
          errorMessage = err.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Bağlantı Hatası",
        description: errorMessage,
        duration: 6000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Helmet>
        <title>Giriş | {APP_BRAND}</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border/60 rounded-2xl shadow-xl p-8 sm:p-10 space-y-7">
          <div className="text-center space-y-4">
            <div className="mx-auto flex justify-center px-1">
              <img
                src={PUBLIC_BRAND_LOGO}
                alt="Telefoncular"
                className="w-full max-w-[min(100%,280px)] h-auto object-contain"
                width={280}
                height={48}
                decoding="async"
              />
            </div>
            <div>
              <h1 className="sr-only">{APP_BRAND}</h1>
              <p className="text-muted-foreground text-sm">Giriş yapmak için bilgilerinizi girin</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Kullanıcı Adı / E-posta</Label>
              <Input
                id="email"
                data-testid="login-email"
                type="text"
                placeholder={`ornek@${loginEmailDomain}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                data-testid="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" data-testid="login-submit" className="w-full h-11 text-sm font-bold shadow-sm" disabled={loading}>
              {loading ? 'Giriş Yapılıyor...' : <> <LogIn className="w-4 h-4 mr-2" /> Giriş Yap</>}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6 font-medium">
          © {new Date().getFullYear()} {LOGIN_FOOTER_COPY}
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
