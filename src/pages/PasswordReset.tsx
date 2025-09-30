import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

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
  const { sendPasswordResetEmail, resetPassword, verifyPasswordResetCode } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ 
    type: 'success' | 'error' | 'info'; 
    text: string;
    action?: { text: string; onClick: () => void } 
  } | null>(null);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(true);
  const [resetEmail, setResetEmail] = useState('');
  
  const oobCode = searchParams.get('oobCode');

  // Auto-verify the code if it exists in the URL
  useEffect(() => {
    if (oobCode && !isCodeVerified) {
      handleVerifyCode();
    }
  }, [oobCode]);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ email: error.errors[0].message });
      }
      return;
    }
    
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setResetEmail(email);
      setMessage({
        type: 'success',
        text: `Password reset instructions have been sent to ${email}. Please check your inbox.`,
        action: {
          text: 'Resend email',
          onClick: () => handleSendResetEmail(e)
        }
      });
      setIsRequestingReset(false);
    } catch (error: any) {
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
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
      return;
    }
    
    setIsLoading(true);
    try {
      const email = await verifyPasswordResetCode(oobCode);
      setEmail(email);
      setIsCodeVerified(true);
      setMessage({
        type: 'info',
        text: `Please enter a new password for ${email}.`
      });
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
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    
    if (!oobCode) return;
    
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
    
    // Proceed with password reset
    setIsLoading(true);
    try {
      await resetPassword(oobCode, password);
      setMessage({
        type: 'success',
        text: 'Password reset successfully. You can now log in with your new password.'
      });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to reset password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If we have an oobCode and it's verified, show the password reset form
  if (oobCode && isCodeVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-black">Create New Password</CardTitle>
            <CardDescription className="text-gray-600">
              {email ? `For ${email}` : 'Please enter your new password'}
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
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`mt-1 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`mt-1 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-black">
            {isRequestingReset ? 'Reset Password' : 'Check Your Email'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isRequestingReset 
              ? 'Enter your email to receive a password reset link'
              : `We've sent a password reset link to ${resetEmail || 'your email'}`}
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
          
          {isRequestingReset ? (
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                If you don't see the email, check your spam folder or click below to resend.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleSendResetEmail}
                disabled={isLoading}
              >
                Resend Email
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Button 
            variant="ghost" 
            asChild 
            className="text-sm text-muted-foreground"
          >
            <Link to="/login">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PasswordReset;
