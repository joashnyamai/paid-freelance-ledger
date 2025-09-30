import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, isEmailVerified } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const verifyEmailCode = async () => {
      if (!oobCode) {
        setMessage({
          type: 'error',
          text: 'Invalid verification link. Please request a new one.'
        });
        setIsLoading(false);
        return;
      }

      try {
        const success = await verifyEmail(oobCode);
        if (success) {
          setMessage({
            type: 'success',
            text: 'Your email has been verified successfully! You can now log in.'
          });
          
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate('/login?verified=true');
          }, 3000);
        } else {
          setMessage({
            type: 'error',
            text: 'Failed to verify email. The link may be invalid or expired.'
          });
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setMessage({
          type: 'error',
          text: 'An error occurred while verifying your email. Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmailCode();
  }, [oobCode, verifyEmail, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-black">
            {isLoading ? 'Verifying Email...' : 'Email Verification'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isLoading 
              ? 'Please wait while we verify your email address...'
              : message?.type === 'success' 
                ? 'Verification successful!'
                : 'Verification status'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {message && (
            <Alert 
              variant={message.type === 'success' ? 'default' : 'destructive'} 
              className="mb-6"
            >
              <AlertDescription>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
          
          {!isLoading && message?.type === 'error' && (
            <div className="flex flex-col space-y-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Try Again
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          )}
          
          {isLoading && (
            <div className="w-full flex justify-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
