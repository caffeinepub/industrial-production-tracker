import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Factory className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Container Production Tracker</CardTitle>
          <CardDescription>
            Industrial production tracking system for shipping container manufacturing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Please log in to access the production tracking system. You'll need to authenticate using Internet Identity.
            </p>
          </div>
          <Button onClick={handleLogin} disabled={isLoggingIn} className="w-full gap-2" size="lg">
            {isLoggingIn ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Login with Internet Identity
              </>
            )}
          </Button>
          <div className="text-xs text-center text-muted-foreground">
            <p>Secure authentication powered by Internet Computer</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
