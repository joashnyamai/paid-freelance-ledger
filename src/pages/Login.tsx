import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    login, 
    loginWithGoogle, 
    isEmailVerified, 
    sendVerificationEmail, 
    user,
    sendPasswordResetEmail 
  } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string; action?: { text: string; onClick: () => void } } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  useEffect(() => {
    const verified = searchParams.get('verified');
    const resetEmail = searchParams.get('resetEmail');
    
    if (verified === 'true') {
      setMessage({
        type: 'success',
        text: 'Email verified successfully! You can now log in.'
      });
    } else if (resetEmail) {
      setResetEmail(decodeURIComponent(resetEmail));
      setShowResetForm(true);
      setMessage({
        type: 'info',
        text: 'Please enter a new password to complete the reset process.'
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !isEmailVerified) {
      setMessage({
        type: 'info',
        text: 'Please verify your email address. Check your inbox for a verification link.',
        action: {
          text: 'Resend verification email',
          onClick: async () => {
            try {
              await sendVerificationEmail();
              setMessage({
                type: 'success',
                text: 'Verification email sent! Please check your inbox.'
              });
            } catch (error) {
              setMessage({
                type: 'error',
                text: 'Failed to send verification email. Please try again.'
              });
            }
          }
        }
      });
    }
  }, [user, isEmailVerified, sendVerificationEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoginError('');
    setMessage(null);

    // Validate form data
    try {
      loginSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/');
      } else if (result.needsVerification) {
        setLoginError('Please verify your email before logging in. Check your inbox for a verification link.');
        setMessage({
          type: 'info',
          text: 'Need another verification email?',
          action: {
            text: 'Resend verification',
            onClick: async () => {
              try {
                await sendVerificationEmail();
                setMessage({
                  type: 'success',
                  text: 'Verification email sent! Please check your inbox.'
                });
              } catch (error) {
                setMessage({
                  type: 'error',
                  text: 'Failed to send verification email. Please try again.'
                });
              }
            }
          }
        });
      } else {
        setLoginError(result.error || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setMessage({
        type: 'error',
        text: 'Please enter your email address.'
      });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid email address.'
      });
      return;
    }
    
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(resetEmail);
      setResetSent(true);
      setMessage({
        type: 'success',
        text: `Password reset instructions have been sent to ${resetEmail}. Please check your email.`
      });
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to send password reset email. Please try again.'
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        navigate('/');
      } else {
        setLoginError('Failed to sign in with Google. Please try again.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setLoginError('An error occurred during Google sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderResetForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-center">Reset Password</h3>
      {!resetSent ? (
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <Label htmlFor="reset-email" className="text-black">
              Email Address
            </Label>
            <Input
              id="reset-email"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isResetting}
              className="mt-1"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isResetting}
          >
            {isResetting ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => setShowResetForm(false)}
            disabled={isResetting}
          >
            Back to Login
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-green-600">
            Password reset instructions have been sent to your email.
          </p>
          <p className="text-sm text-gray-600">
            Didn't receive an email? Check your spam folder or try again.
          </p>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setShowResetForm(false);
              setResetSent(false);
            }}
          >
            Back to Login
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-black">
            {showResetForm ? 'Reset Password' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {showResetForm 
              ? 'Enter your email to receive a password reset link'
              : 'Sign in to your account to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className="px-6">
              <Alert 
                variant={message.type === 'success' 
                  ? 'default' 
                  : message.type === 'info' 
                    ? 'default' 
                    : 'destructive'
                } 
                className={`mb-6 ${message.type === 'info' ? 'bg-blue-50 border-blue-200' : ''}`}
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
            </div>
          )}
          
          {showResetForm ? (
            renderResetForm()
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-black">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 pr-10"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {loginError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {loginError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button 
                    type="button" 
                    onClick={() => setShowResetForm(true)}
                    className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <FcGoogle className="h-5 w-5 mr-2" />
                  Sign in with Google
                </Button>
                
                <div className="text-center text-sm">
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link 
                    to="/signup" 
                    className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;