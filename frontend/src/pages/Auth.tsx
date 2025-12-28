import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Film, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      toast({
        title: 'Xəta',
        description: 'Bütün sahələri doldurun',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Giriş xətası',
        description: error,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Xoş gəldiniz!',
        description: 'Uğurla daxil oldunuz'
      });
      navigate('/');
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: 'Xəta',
        description: 'Bütün sahələri doldurun',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Xəta',
        description: 'Şifrələr uyğun gəlmir',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Xəta',
        description: 'Şifrə ən azı 6 simvol olmalıdır',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, name);

    if (error) {
      toast({
        title: 'Qeydiyyat xətası',
        description: error,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Qeydiyyat uğurlu!',
        description: 'Hesabınız yaradıldı'
      });
      navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri qayıt
        </Button>

        <Card className="glass border-border/30">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-mood-happy flex items-center justify-center shadow-glow">
              <Film className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Bu Gün Nə Baxım?</CardTitle>
              <CardDescription className="mt-2">
                Film tövsiyələri üçün hesabınıza daxil olun
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Giriş</TabsTrigger>
                <TabsTrigger value="signup">Qeydiyyat</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Şifrə</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Gözləyin...' : 'Daxil ol'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Ad</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        placeholder="Adınız"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Şifrə</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Şifrəni təsdiqlə</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Gözləyin...' : 'Qeydiyyatdan keç'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
