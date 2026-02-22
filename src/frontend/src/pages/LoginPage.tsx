import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Factory, LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animated-bg">
      <div className="glass-card metallic-border rounded-2xl p-8 w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10 backdrop-blur-sm">
              <img src="/assets/generated/shipping-container-logo.dim_120x120.png" alt="Logo" className="h-16 w-16" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Container Production Tracker</h1>
          <p className="text-muted-foreground">
            Industrial production tracking system for shipping container manufacturing
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Please log in to access the production tracking system. You'll need to authenticate using Internet Identity.
            </p>
          </div>
          
          <Button 
            onClick={handleLogin} 
            disabled={isLoggingIn} 
            className="w-full btn-glow ripple" 
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Login with Internet Identity
              </>
            )}
          </Button>
          
          <div className="text-xs text-center text-muted-foreground">
            <p>Secure authentication powered by Internet Computer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
