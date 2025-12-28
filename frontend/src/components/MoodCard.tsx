import { cn } from '@/lib/utils';
import { Mood, MoodInfo } from '@/types/movie';

interface MoodCardProps {
  mood: MoodInfo;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

const moodStyles: Record<Mood, { gradient: string; glow: string }> = {
  happy: { gradient: 'bg-mood-happy', glow: 'glow-happy' },
  sad: { gradient: 'bg-mood-sad', glow: 'glow-sad' },
  excited: { gradient: 'bg-mood-excited', glow: 'glow-excited' },
  relax: { gradient: 'bg-mood-relax', glow: 'glow-relax' },
  thoughtful: { gradient: 'bg-mood-thoughtful', glow: 'glow-thoughtful' },
  romantic: { gradient: 'bg-mood-romantic', glow: 'glow-romantic' },
};

const MoodCard = ({ mood, isSelected, onClick, index }: MoodCardProps) => {
  const styles = moodStyles[mood.id];

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative group p-6 rounded-2xl transition-all duration-500 ease-out transform',
        'flex flex-col items-center justify-center gap-3 min-h-[160px]',
        'hover:scale-105 hover:-translate-y-2 active:scale-95',
        'opacity-0 animate-slide-up',
        styles.gradient,
        isSelected && styles.glow,
        isSelected && 'ring-4 ring-foreground/20'
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      {/* Emoji */}
      <span className={cn(
        'text-5xl transition-transform duration-300',
        'group-hover:scale-125 group-hover:animate-float'
      )}>
        {mood.emoji}
      </span>

      {/* Name */}
      <h3 className="text-xl font-bold text-primary-foreground">
        {mood.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-primary-foreground/80 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {mood.description}
      </p>

      {/* Decorative circle */}
      <div className={cn(
        'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500',
        'bg-gradient-to-br from-foreground/10 to-transparent',
        'group-hover:opacity-100'
      )} />
    </button>
  );
};

export default MoodCard;
