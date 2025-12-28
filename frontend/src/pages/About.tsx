import { Film, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useFavorites } from '@/hooks/useFavorites';
import { useWatchLater } from '@/hooks/useWatchLater';

const About = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { watchLater } = useWatchLater();

  const aboutContent = `Bilirik ki, bəzən nəyə baxacağınıza qərar vermək çox çətin ola bilər: saysız-hesabsız janrlar, sonsuz seçimlər və davamlı sual

"Bu gün nəyə baxım?"

Burada biz köməyə gəlirik. Bugün Nəyə Baxım? Biz sizə ruh halınıza uyğun film və ya seriallar tövsiyə edirik. Xoşbəxt, kədərli, həyəcanlı, rahat, düşüncəli və ya romantik hiss edirsinizsə, sizin duyğularınıza uyğun tövsiyələrimiz var.

Missiyamız

Missiyamız sadədir: qararsızlığı kəşfə çevirmək. Hər istifadəçinin mood-u ilə uyğun film və seriallar tapmasını təmin etmək, gülmək, ağlamaq, düşünmək və ya rahatlamaq üçün ən uyğun təcrübəni yaratmaq.

Necə İşləyir

Mood seçimi: Bu gün necə hiss etdiyinizi seçin.

Fərdi tövsiyələr: AI əsaslı sistemimiz mood və keçmiş baxış tarixçənizə əsaslanaraq film/serial tövsiyələri verir.

Yeni favoritləri kəşf edin: Trailer-lərə baxın, qısa təsvirləri oxuyun və sevdiklərinizi favoritlərə əlavə edin.

Niyə Varıq

FilmSec -- Biz inanırıq ki, nəyə baxacağınıza qərar vermək əyləncəli, asan və sizə uyğun olmalıdır. Məqsədimiz hər film gecəsini və ya binge-watching sessiyasını yaddaqalan və zövqlü etməkdir.

Bizə Qoşulun

Mood-unuzu seçin, kəşf edin və bu gün növbəti favorit filminizi tapın!

"Çünki sizin mood-unuz ən uyğun filmi haqq edir." 🎥❤️`;

  // Split content into paragraphs
  const paragraphs = aboutContent.split('\n\n').filter(p => p.trim());

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        favoritesCount={favorites.length}
        watchLaterCount={watchLater.length}
        onFavoritesClick={() => navigate('/')}
        onWatchLaterClick={() => navigate('/')}
        onLogoClick={() => navigate('/')}
      />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-mood-happy flex items-center justify-center">
                  <Film className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">Haqqımızda</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                FilmSEC - Ruh halınıza uyğun film və serial tövsiyələri
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
              {paragraphs.map((paragraph, index) => {
                // Check if paragraph is a heading (no period, short, might be a title)
                const isHeading = paragraph.split('\n').length === 1 && 
                                  paragraph.length < 100 && 
                                  !paragraph.includes('.') &&
                                  !paragraph.startsWith('"');

                if (isHeading) {
                  return (
                    <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-foreground">
                      {paragraph}
                    </h2>
                  );
                }

                // Regular paragraphs
                return paragraph.split('\n').map((line, lineIndex) => {
                  if (line.trim().startsWith('"') && line.trim().endsWith('"')) {
                    // Quote style
                    return (
                      <blockquote key={`${index}-${lineIndex}`} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                        {line.trim().replace(/^"|"$/g, '')}
                      </blockquote>
                    );
                  }
                  return (
                    <p key={`${index}-${lineIndex}`} className="text-foreground/80 leading-relaxed">
                      {line.trim()}
                    </p>
                  );
                });
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;

