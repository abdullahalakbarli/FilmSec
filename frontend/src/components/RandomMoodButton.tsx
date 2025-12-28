import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RandomMoodButtonProps {
  onClick: () => void;
}

const RandomMoodButton = ({ onClick }: RandomMoodButtonProps) => {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        'relative overflow-hidden group',
        'bg-gradient-to-r from-mood-happy via-mood-romantic to-mood-thoughtful',
        'hover:shadow-glow-lg transition-all duration-500',
        'animate-glow'
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-mood-romantic via-mood-thoughtful to-mood-happy opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Shuffle className="w-5 h-5 mr-2 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
      <span className="relative z-10 font-semibold">Təsadüfi Mood</span>
    </Button>
  );
};

export default RandomMoodButton;
