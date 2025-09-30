import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';

const emailSchema = z.string().email({ message: "Please enter a valid email address" });

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendPasswordResetEmail, resetPassword, verifyPasswordResetCode } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Reset flow state
  const [message, setMessage] = useState<{ 
    type: 'success' | 'error' | 'info'; 
    text: string;
    action?: { text: string; onClick: () => void } 
  } | null>(null);
  
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(true);
  const [resetEmail, setResetEmail] = useState('');
  
  // Get the OOB code from URL if present
  const oobCode = searchParams.get('oobCode');
  
  // Show toast notifications for messages
  useEffect(() => {
    if (message) {
      toast({
        title: message.type === 'error' ? 'Error' : 'Success',
        description: message.text,
        variant: message.type === 'error' ? 'destructive' : 'default',
      });
    }
  }, [message, toast]);

  // Auto-verify the code if it exists in the URL
  useEffect(() => {
    const verifyCode = async () => {
      if (oobCode && !isCodeVerified && !isVerifying) {
        await handleVerifyCode();
      }
    };
    
    verifyCode();
  }, [oobCode, isCodeVerified, isVerifying]);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    
    try {
      // Validate email format
      emailSchema.parse(email);
      
      // Check if email exists in the system
      try {
        await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${import.meta.env.VITE_FIREBASE_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestType: 'PASSWORD_RESET',
            email: email,
          }),
        });
      } catch (error) {
        console.error('Email verification error:', error);
        // Continue with the reset flow even if we can't verify the email
        // This is to prevent email enumeration attacks
      }
    
      setIsLoading(true);
      
      // Send the password reset email
      await sendPasswordResetEmail(email);
      
      // Update UI state
      setResetEmail(email);
      setMessage({
        type: 'success',
        text: `Password reset instructions have been sent to ${email}. Please check your inbox and click the link to reset your password.`,
        action: {
          text: 'Resend email',
          onClick: () => handleSendResetEmail(e)
        }
      });
      
      // Show the email sent confirmation UI
      setIsRequestingReset(false);
      
      // Log the event
      console.log('Password reset email sent to:', email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      // Handle specific Firebase Auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          // For security, we don't reveal if the email exists or not
          errorMessage = 'If an account exists with this email, you will receive a password reset link.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later or contact support.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/missing-android-pkg-name':
        case 'auth/missing-ios-bundle-id':
          errorMessage = 'Missing required configuration. Please contact support.';
          break;
        default:
          // Generic error message for other cases
          errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
      
      // Show error message to user
      setMessage({
        type: 'error',
        text: errorMessage
      });
      
      // Log the full error for debugging
      console.error('Password reset error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyCode = async () => {
    if (!oobCode) {
      setMessage({
        type: 'error',
        text: 'Invalid reset link. Please request a new one.'
      });
      return false;
    }
    
    // Prevent multiple verification attempts
    if (isVerifying) return false;
    
    setIsVerifying(true);
    setMessage({
      type: 'info',
      text: 'Verifying your reset link...'
    });
    
    try {
      const email = await verifyPasswordResetCode(oobCode);
      setEmail(email);
      setIsCodeVerified(true);
      setMessage({
        type: 'success',
        text: `Please enter a new password for ${email}.`
      });
      return true;
    } catch (error) {
      console.error('Error verifying reset code:', error);
      setMessage({
        type: 'error',
        text: 'This password reset link is invalid or has expired. Please request a new one.',
        action: {
          text: 'Request new link',
          onClick: () => {
            setIsRequestingReset(true);
            setMessage(null);
          }
        }
      });
      setIsCodeVerified(false);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    
    if (!oobCode) {
      setMessage({
        type: 'error',
        text: 'Invalid reset link. Please request a new one.'
      });
      return;
    }
    
    // Validate password format
    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ password: error.errors[0].message });
      }
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    
    // Additional password strength check
    if (password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters long' });
      return;
    }
    
    // Proceed with password reset
    setIsLoading(true);
    setMessage({
      type: 'info',
      text: 'Updating your password...'
    });
    
    try {
      await resetPassword(oobCode, password);
      
      setMessage({
        type: 'success',
        text: '✅ Password reset successfully! Redirecting to login...'
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            from: 'password-reset',
            message: 'Your password has been reset successfully. Please log in with your new password.'
          } 
        });
      }, 2000);
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      
      // Handle specific Firebase Auth errors
      switch (error.code) {
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. Please choose a stronger password.';
          break;
        case 'auth/expired-action-code':
          errorMessage = 'The password reset link has expired. Please request a new one.';
          break;
        case 'auth/invalid-action-code':
          errorMessage = 'The password reset link is invalid. Please request a new one.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
      }
      
      setMessage({
        type: 'error',
        text: errorMessage,
        action: {
          text: 'Try again',
          onClick: () => setMessage(null)
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If we have an oobCode and it's verified, show the password reset form
  if (oobCode && isCodeVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <Card className="w-full max-w-md relative overflow-hidden">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">Updating your password...</p>
              </div>
            </div>
          )}
          
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create New Password
            </CardTitle>
            <CardDescription className="text-gray-600">
              {email ? (
                <span>For <span className="font-medium text-gray-800">{email}</span></span>
              ) : (
                'Please enter your new password'
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-5 pt-4">
            {/* Password requirements */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Password Requirements:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className={`flex items-center ${password.length >= 8 ? 'text-green-600' : ''}`}>
                  <span className="mr-1.5">•</span>
                  At least 8 characters long
                </li>
                <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                  <span className="mr-1.5">•</span>
                  At least one uppercase letter
                </li>
                <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                  <span className="mr-1.5">•</span>
                  At least one lowercase letter
                </li>
                <li className={`flex items-center ${/[0-9]/.test(password) ? 'text-green-600' : ''}`}>
                  <span className="mr-1.5">•</span>
                  At least one number
                </li>
              </ul>
            </div>
            
            {/* Error/Success Messages */}
            {message && (
              <Alert 
                variant={message.type === 'success' 
                  ? 'default' 
                  : message.type === 'info' 
                    ? 'default' 
                    : 'destructive'
                }
                className="mb-2"
              >
                <AlertDescription className="flex items-center">
                  {message.type === 'error' && (
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {message.type === 'success' && (
                    <svg className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span>{message.text}</span>
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    New Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-blue-600 hover:text-blue-500"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300'}`}
                    disabled={isLoading}
                    autoComplete="new-password"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    <svg className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm New Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-xs text-blue-600 hover:text-blue-500"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pr-10 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300'}`}
                    disabled={isLoading}
                    autoComplete="new-password"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    <svg className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={isLoading || !password || !confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </div>
            </form>
            
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we have an oobCode but haven't verified it yet
  if (oobCode && !isCodeVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-black">Reset Your Password</CardTitle>
            <CardDescription className="text-gray-600">
              {isLoading ? 'Verifying your link...' : 'Verify your password reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <Alert 
                variant={message.type === 'success' 
                  ? 'default' 
                  : message.type === 'info' 
                    ? 'default' 
                    : 'destructive'
                } 
                className="mb-4"
              >
                <AlertDescription className="flex flex-col space-y-2">
                  <span>{message.text}</span>
                  {message.action && (
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-sm justify-start text-left"
                      onClick={message.action.onClick}
                    >
                      {message.action.text}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Verifying your password reset link...</p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="mt-4"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default view - request password reset email
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <Card className="w-full max-w-md relative overflow-hidden">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Sending reset link...</p>
            </div>
          </div>
        )}
        
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isRequestingReset ? 'Forgot your password?' : 'Check Your Email'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isRequestingReset 
              ? 'Enter your email and we\'ll send you a link to reset your password.'
              : `We've sent a password reset link to ${resetEmail || 'your email'}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-5 pt-4">
          {/* Error/Success Messages */}
          {message && (
            <Alert 
              variant={message.type === 'success' ? 'default' : message.type === 'info' ? 'default' : 'destructive'}
              className="mb-2"
            >
              <AlertDescription className="flex items-center">
                {message.type === 'error' && (
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {message.type === 'success' && (
                  <svg className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span>{message.text}</span>
              </AlertDescription>
              {message.action && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={message.action.onClick}
                    className="text-xs h-7"
                  >
                    {message.action.text}
                  </Button>
                </div>
              )}
            </Alert>
          )}
          
          {isRequestingReset ? (
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300'}`}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    <svg className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div className="pt-1">
                <Button 
                  type="submit" 
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
              <p className="text-sm text-gray-600 mb-6">
                We've sent a password reset link to <span className="font-medium">{email}</span>.
              </p>
              <p className="text-xs text-gray-500">
                Didn't receive the email?{' '}
                <button 
                  type="button" 
                  onClick={() => setIsRequestingReset(true)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Click to resend
                </button>
              </p>
            </div>
          )}
          
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </button>
          </div>
          
          {isRequestingReset && (
            <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="font-medium text-blue-600 hover:text-blue-500"
                  onClick={(e) => isLoading && e.preventDefault()}
                >
                  Sign up
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;
