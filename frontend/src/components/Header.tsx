import { useState } from 'react';
import { Heart, Menu, Clock, Film, Users, LogIn, LogOut, User, Shield, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  favoritesCount: number;
  watchLaterCount: number;
  onFavoritesClick: () => void;
  onWatchLaterClick: () => void;
  onLogoClick: () => void;
}

const Header = ({ favoritesCount, watchLaterCount, onFavoritesClick, onWatchLaterClick, onLogoClick }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  // Safety fallback for context issues during development/hot reload
  let auth: any;
  try {
    auth = useAuth();
  } catch (e) {
    auth = { user: null, signOut: () => {}, isAdmin: false };
  }
  const { user, signOut, isAdmin } = auth;

  const getInitials = (name: string | undefined) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-mood-happy flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-110">
            <Film className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">
            FilmMood
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/community')}
            className="relative group"
          >
            <Users className="w-5 h-5 mr-2 transition-colors group-hover:text-primary" />
            <span>Cəmiyyət</span>
          </Button>

          {/* Admin Link - Only visible to admin users */}
          {isAdmin && (
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="relative group bg-primary/10 hover:bg-primary/20"
            >
              <Shield className="w-5 h-5 mr-2 text-primary" />
              <span className="text-primary font-medium">Admin</span>
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={onWatchLaterClick}
            className="relative group"
          >
            <Clock className="w-5 h-5 mr-2 transition-colors group-hover:text-mood-thoughtful" />
            <span>Sonra Bax</span>
            {watchLaterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-mood-thoughtful text-xs font-bold flex items-center justify-center animate-scale-in">
                {watchLaterCount}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={onFavoritesClick}
            className="relative group"
          >
            <Heart className="w-5 h-5 mr-2 transition-colors group-hover:text-mood-romantic" />
            <span>Favoritlər</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-mood-romantic text-xs font-bold flex items-center justify-center animate-scale-in">
                {favoritesCount}
              </span>
            )}
          </Button>

          {/* Auth Section */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2">
                  <User className="w-4 h-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive">
                  <LogOut className="w-4 h-4" />
                  <span>Çıxış</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              onClick={() => navigate('/auth')}
              className="gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Giriş</span>
            </Button>
          )}
        </nav>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="glass border-l border-border/30">
            <div className="flex flex-col gap-6 mt-8">
              <button
                onClick={() => {
                  navigate('/community');
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors"
              >
                <Users className="w-6 h-6" />
                <span>Cəmiyyət</span>
              </button>

              {/* Mobile Admin Link */}
              {isAdmin && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 text-lg font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <Shield className="w-6 h-6" />
                  <span>Admin Panel</span>
                </button>
              )}

              <button
                onClick={() => {
                  onWatchLaterClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 text-lg font-medium hover:text-mood-thoughtful transition-colors"
              >
                <Clock className="w-6 h-6" />
                <span>Sonra Bax</span>
                {watchLaterCount > 0 && (
                  <span className="ml-auto w-6 h-6 rounded-full bg-mood-thoughtful text-xs font-bold flex items-center justify-center">
                    {watchLaterCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  onFavoritesClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 text-lg font-medium hover:text-mood-romantic transition-colors"
              >
                <Heart className="w-6 h-6" />
                <span>Favoritlər</span>
                {favoritesCount > 0 && (
                  <span className="ml-auto w-6 h-6 rounded-full bg-mood-romantic text-xs font-bold flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* Mobile Auth Section */}
              <div className="border-t border-border/30 pt-6 mt-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 text-lg font-medium text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <LogOut className="w-6 h-6" />
                      <span>Çıxış</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/auth');
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <LogIn className="w-6 h-6" />
                    <span>Giriş / Qeydiyyat</span>
                  </button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
