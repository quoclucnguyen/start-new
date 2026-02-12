import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';

interface EmailPasswordFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  clearError?: () => void;
}

export function EmailPasswordForm({
  onSubmit,
  loading = false,
  error,
  clearError,
}: Readonly<EmailPasswordFormProps>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setValidationError(null);
    clearError?.();

    // Basic validation
    if (!email.trim()) {
      setValidationError('Vui lòng nhập email');
      return;
    }
    if (!password) {
      setValidationError('Vui lòng nhập mật khẩu');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = error || validationError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {displayError}
        </div>
      )}

      <Input
        type="email"
        placeholder="Email"
        icon={<Mail className="h-5 w-5" />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading || isSubmitting}
        autoComplete="email"
        required
      />

      <Input
        type={showPassword ? 'text' : 'password'}
        placeholder="Mật khẩu"
        icon={<Lock className="h-5 w-5" />}
        endIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:text-foreground disabled:opacity-50 transition-colors"
            disabled={loading || isSubmitting}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        }
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading || isSubmitting}
        autoComplete="current-password"
        required
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={loading || isSubmitting}
      >
        {loading || isSubmitting ? (
          <>Đang đăng nhập...</>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Đăng nhập
          </>
        )}
      </Button>
    </form>
  );
}
