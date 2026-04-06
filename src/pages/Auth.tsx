import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import logoImage from '@/assets/glucoforge-logo.svg';
import { signInSchema, signUpSchema } from '@/lib/validation';
import { z } from 'zod';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { lovable } from '@/integrations/lovable/index';

const emailSchema = z.string().email('Please enter a valid email address');

const Auth = () => {
  usePageMeta('Sign In', 'Sign in or create your GlucoForge account.');
  const { user, loading, initialized, signIn, signUp } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  
  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign Up form state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Password visibility
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrors({});
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setErrors({ general: result.error instanceof Error ? result.error.message : 'Google sign-in failed' });
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) {
        return; // Browser will redirect to Google
      }
      // Session set — auth listener will handle navigation
    } catch {
      setErrors({ general: 'Google sign-in failed. Please try again.' });
      setGoogleLoading(false);
    }
  };

  // If not initialized yet, show loading
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary opacity-30"/>
              <path d="M30 50 L45 35 L70 60" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary"/>
            </svg>
          </div>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Loading GlucoForge...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Zod validation
    const result = signInSchema.safeParse({
      email: signInEmail,
      password: signInPassword,
    });
    
    if (!result.success) {
      const newErrors: {[key: string]: string} = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0];
        if (field === 'email') newErrors.signInEmail = err.message;
        if (field === 'password') newErrors.signInPassword = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(signInEmail, signInPassword);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' });
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please check your email and click the confirmation link before signing in.' });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        toast.success('Welcome back to GlucoForge!');
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Zod validation with strong password requirements
    const result = signUpSchema.safeParse({
      email: signUpEmail,
      password: signUpPassword,
      confirmPassword: confirmPassword,
      displayName: displayName || undefined,
    });
    
    if (!result.success) {
      const newErrors: {[key: string]: string} = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0];
        if (field === 'email') newErrors.signUpEmail = err.message;
        if (field === 'password') newErrors.signUpPassword = err.message;
        if (field === 'confirmPassword') newErrors.confirmPassword = err.message;
        if (field === 'displayName') newErrors.displayName = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(signUpEmail, signUpPassword, displayName);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setErrors({ general: 'An account with this email already exists. Please sign in instead.' });
        } else if (error.message.includes('Password should be at least 6 characters')) {
          setErrors({ signUpPassword: 'Password must be at least 6 characters long' });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        toast.success('Account created successfully! Please check your email to confirm your account.');
        setActiveTab('signin');
        // Clear form
        setSignUpEmail('');
        setSignUpPassword('');
        setConfirmPassword('');
        setDisplayName('');
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate email
    const result = emailSchema.safeParse(forgotPasswordEmail);
    if (!result.success) {
      setErrors({ forgotEmail: result.error.errors[0].message });
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setErrors({ general: error.message });
      } else {
        setForgotPasswordSent(true);
        toast.success('Password reset email sent!');
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <img src={logoImage} alt="GlucoForge" className="h-12 w-auto logo-animated-drop" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Reset Password</h1>
            <p className="text-muted-foreground">We'll send you a link to reset your password</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>
                {forgotPasswordSent ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    Check Your Email
                  </div>
                ) : (
                  'Forgot Password'
                )}
              </CardTitle>
              <CardDescription>
                {forgotPasswordSent
                  ? `We've sent a password reset link to ${forgotPasswordEmail}. Check your inbox and spam folder.`
                  : 'Enter your email address and we\'ll send you a reset link.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {forgotPasswordSent ? (
                <div className="space-y-4">
                  <Alert className="border-success/30 bg-success/5">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success">
                      Email sent! Click the link in your email to reset your password.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordSent(false);
                      setForgotPasswordEmail('');
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {errors.general && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.general}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className={`pl-10 ${errors.forgotEmail ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.forgotEmail && (
                      <p className="text-sm text-destructive">{errors.forgotEmail}</p>
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
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>

                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setErrors({});
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </form>
              )}
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
          <h1 className="text-3xl font-heading font-bold text-foreground">GlucoForge</h1>
          <p className="text-muted-foreground">Your T1D Intelligence Platform</p>
        </div>

        <Card className="shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {/* General Error Alert */}
            {errors.general && (
              <div className="p-6 pb-0">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              </div>
            )}

            <TabsContent value="signin">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to access your personalized diabetes intelligence hub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className={`pl-10 ${errors.signInEmail ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                    {errors.signInEmail && (
                      <p className="text-sm text-destructive">{errors.signInEmail}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs text-primary"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type={showSignInPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className={`pl-10 pr-10 ${errors.signInPassword ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.signInPassword && (
                      <p className="text-sm text-destructive">{errors.signInPassword}</p>
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
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || googleLoading}
                  >
                    {googleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    Sign in with Google
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader>
                <CardTitle>Join GlucoForge</CardTitle>
                <CardDescription>
                  Create your account to access community insights, device analytics, and cure tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className={`pl-10 ${errors.signUpEmail ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.signUpEmail && (
                      <p className="text-sm text-destructive">{errors.signUpEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name (Optional)</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="display-name"
                        type="text"
                        placeholder="How should we call you?"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showSignUpPassword ? 'text' : 'password'}
                        placeholder="Create a secure password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className={`pl-10 pr-10 ${errors.signUpPassword ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.signUpPassword && (
                      <p className="text-sm text-destructive">{errors.signUpPassword}</p>
                    )}
                    <PasswordStrengthIndicator password={signUpPassword} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
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
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;