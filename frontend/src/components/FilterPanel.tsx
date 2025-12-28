import { Film, Tv, Clock, Globe, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Filters } from '@/types/movie';

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onReset: () => void;
}

const FilterPanel = ({ filters, onFilterChange, onReset }: FilterPanelProps) => {
  const typeOptions = [
    { value: 'all', label: 'Hamısı', icon: null },
    { value: 'movie', label: 'Filmlər', icon: Film },
    { value: 'series', label: 'Seriallar', icon: Tv },
  ];

  const durationOptions = [
    { value: 'any', label: 'İstənilən' },
    { value: '30-60', label: '30-60 dəq' },
    { value: '60-120', label: '1-2 saat' },
  ];

  const languageOptions = [
    { value: 'any', label: 'Hamısı' },
    { value: 'EN', label: '🇬🇧 İngilis' },
    { value: 'TR', label: '🇹🇷 Türk' },
    { value: 'KR', label: '🇰🇷 Koreya' },
  ];

  return (
    <div className="glass rounded-2xl p-6 space-y-6 animate-fade-in">
      {/* Type Filter */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Film className="w-4 h-4" />
          Növ
        </label>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.type === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ ...filters, type: option.value as Filters['type'] })}
              className={cn(
                'transition-all duration-300',
                filters.type === option.value && 'shadow-glow'
              )}
            >
              {option.icon && <option.icon className="w-4 h-4 mr-1.5" />}
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Duration Filter */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="w-4 h-4" />
          Müddət
        </label>
        <div className="flex flex-wrap gap-2">
          {durationOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.duration === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ ...filters, duration: option.value as Filters['duration'] })}
              className={cn(
                'transition-all duration-300',
                filters.duration === option.value && 'shadow-glow'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Language Filter */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Globe className="w-4 h-4" />
          Dil
        </label>
        <div className="flex flex-wrap gap-2">
          {languageOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.language === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ ...filters, language: option.value as Filters['language'] })}
              className={cn(
                'transition-all duration-300',
                filters.language === option.value && 'shadow-glow'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="ghost"
        onClick={onReset}
        className="w-full text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Sıfırla
      </Button>
    </div>
  );
};

export default FilterPanel;
