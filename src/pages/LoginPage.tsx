import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '@/store/auth.store';
import { getInitDataRaw, isInTelegramWebView } from '@/lib/tma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SpinLoading } from 'antd-mobile';
import { Apple, LogIn, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error, tmaLogin, clearError } = useAuthStore();
  const [isAutoLogin, setIsAutoLogin] = useState(false);
  const autoLoginAttemptedRef = useRef(false);

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  // Auto-login if inside Telegram
  useEffect(() => {
    const initDataRaw = getInitDataRaw();
    if (!initDataRaw || user || loading || autoLoginAttemptedRef.current) return;

    autoLoginAttemptedRef.current = true;
    setIsAutoLogin(true);
    tmaLogin(initDataRaw).catch(() => {
      setIsAutoLogin(false);
    });
  }, [user, loading, tmaLogin]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async () => {
    clearError();
    const initDataRaw = getInitDataRaw();
    if (initDataRaw) {
      await tmaLogin(initDataRaw);
    }
  };

  const isTelegram = isInTelegramWebView();

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
          {(loading || isAutoLogin) ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <SpinLoading color="primary" />
              <p className="text-sm text-muted-foreground">
                {isTelegram ? 'Đang đăng nhập với Telegram...' : 'Đang xác thực...'}
              </p>
            </div>
          ) : error ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>Đăng nhập thất bại. Vui lòng thử lại.</p>
              </div>
              <Button onClick={handleLogin} className="w-full" size="lg">
                <LogIn className="mr-2 h-4 w-4" />
                Thử lại
              </Button>
            </div>
          ) : isTelegram ? (
            <Button onClick={handleLogin} className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              Đăng nhập với Telegram
            </Button>
          ) : (
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              <p>Vui lòng mở ứng dụng trong Telegram để đăng nhập.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
