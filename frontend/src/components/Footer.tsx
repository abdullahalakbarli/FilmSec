import { Film, Github, Mail, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border/30 bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-mood-happy flex items-center justify-center">
              <Film className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">FilmSEC</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/about" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Info className="w-4 h-4" />
              Haqqımızda
            </Link>
            <a href="mailto:abdullahalakbarli077@gmail.com" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Mail className="w-4 h-4" />
              Əlaqə
            </a>
            <a href="https://github.com/abdullahalakbarli" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>

          {/* Attribution */}
          <p className="text-xs text-muted-foreground">
            Data: <span className="text-foreground">TMDB</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
