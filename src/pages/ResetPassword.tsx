import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import logoImage from '@/assets/glycoforge-logo.png';
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check for recovery type in URL hash (Supabase sends #access_token=...&type=recovery)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery' || session) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
      }
    };

    // Listen for auth state changes (recovery link opens session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidToken(true);
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate passwords
    const result = passwordSchema.safeParse({ password, confirmPassword });
    
    if (!result.success) {
      const newErrors: {[key: string]: string} = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        if (error.message.includes('same as the old password')) {
          setErrors({ general: 'New password must be different from your current password.' });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setIsSuccess(true);
        toast.success('Password updated successfully!');
        
        // Redirect to auth after 3 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <img src={logoImage} alt="GlucoForge" className="h-12 w-auto logo-animated-drop" />
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
              <CardTitle>Invalid or Expired Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired. Please request a new one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => navigate('/auth')}
              >
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <img src={logoImage} alt="GlucoForge" className="h-12 w-auto logo-animated-drop" />
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <CardTitle>Password Updated!</CardTitle>
              <CardDescription>
                Your password has been successfully reset. You'll be redirected to sign in shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => navigate('/auth')}
              >
                Sign In Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <img src={logoImage} alt="GlucoForge" className="h-12 w-auto logo-animated-drop" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Create New Password</CardTitle>
            <CardDescription>
              Choose a strong password with at least 8 characters, including uppercase, lowercase, and numbers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.general && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="link" onClick={() => navigate('/auth')}>
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
