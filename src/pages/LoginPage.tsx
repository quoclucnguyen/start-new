import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '@/store/auth.store';
import { getInitDataRaw, isInTelegramWebView } from '@/lib/tma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SpinLoading } from 'antd-mobile';
import { Apple, LogIn } from 'lucide-react';
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error, tmaLogin, emailLogin, clearError } = useAuthStore();
  const [emailError, setEmailError] = useState<string | null>(null);
  const autoLoginAttemptedRef = useRef(false);

  const from = (location.state as { from?: Location })?.from?.pathname || '/';
  const isTelegram = isInTelegramWebView();

  // Auto-login if inside Telegram
  useEffect(() => {
    const initDataRaw = getInitDataRaw();
    if (!initDataRaw || user || loading || autoLoginAttemptedRef.current) return;

    autoLoginAttemptedRef.current = true;
    tmaLogin(initDataRaw).catch(() => {
      // Auto-login failed, user will see the form
    });
  }, [user, loading, tmaLogin]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleTelegramLogin = async () => {
    clearError();
    setEmailError(null);
    const initDataRaw = getInitDataRaw();
    if (initDataRaw) {
      await tmaLogin(initDataRaw);
    }
  };

  const handleEmailLogin = async (email: string, password: string) => {
    clearError();
    setEmailError(null);
    await emailLogin(email, password);
  };

  // Clear both error types when user interacts
  const handleClearError = () => {
    clearError();
    setEmailError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Apple className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Food Inventory</CardTitle>
          <CardDescription>
            Quản lý thực phẩm và theo dõi hạn sử dụng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <SpinLoading color="primary" />
              <p className="text-sm text-muted-foreground">
                {isTelegram ? 'Đang đăng nhập với Telegram...' : 'Đang xác thực...'}
              </p>
            </div>
          ) : (
            <>
              {/* Show Telegram login button only if in Telegram */}
              {isTelegram && (
                <Button
                  onClick={handleTelegramLogin}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Đăng nhập với Telegram
                </Button>
              )}

              {/* Divider if showing both options */}
              {isTelegram && (
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">hoặc</span>
                  </div>
                </div>
              )}

              {/* Email/password form - always shown */}
              <EmailPasswordForm
                onSubmit={handleEmailLogin}
                loading={loading}
                error={emailError || error?.message || null}
                clearError={handleClearError}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
