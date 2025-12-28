import { useState } from 'react';
import { Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mood } from '@/types/movie';
import { moods } from '@/data/moods';

import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface CreateDiscussionProps {
  onCreateDiscussion: (mood: Mood, title: string, description: string) => Promise<{ error?: string }>;
}

const CreateDiscussion = ({ onCreateDiscussion }: CreateDiscussionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mood, setMood] = useState<Mood | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Giriş tələb olunur',
        description: 'Müzakirə yaratmaq üçün giriş edin',
        variant: 'destructive',
      });
      return;
    }

    if (mood && title.trim() && description.trim()) {
      const result = await onCreateDiscussion(mood, title.trim(), description.trim());
      if (!result.error) {
        setMood('');
        setTitle('');
        setDescription('');
        setIsOpen(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Yeni müzakirə
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni müzakirə başlat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mood seçin</label>
            <Select value={mood} onValueChange={(value) => setMood(value as Mood)}>
              <SelectTrigger>
                <SelectValue placeholder="Mood seçin" />
              </SelectTrigger>
              <SelectContent>
                {moods.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.emoji} {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Başlıq</label>
            <Input
              placeholder="Müzakirə başlığı"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Açıqlama</label>
            <Textarea
              placeholder="Müzakirə haqqında qısa məlumat..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={!mood || !title.trim() || !description.trim() || !user}
          >
            <Send className="w-4 h-4" />
            Müzakirə başlat
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDiscussion;
