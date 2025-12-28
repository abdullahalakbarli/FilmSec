import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getMovies } from '../database/database';
import { supabase } from '../config/supabase';

const router = Router();

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  recommendations?: Array<{
    id: string;
    title: string;
    posterUrl: string;
    rating: number;
    year: number;
    mood: string;
  }>;
}

// Detect language from message
function detectLanguage(userMessage: string): 'az' | 'en' {
  const lowerMessage = userMessage.toLowerCase().trim();
  // Azerbaijani characters and common words
  const azPatterns = ['ə', 'ş', 'ğ', 'ç', 'ö', 'ü', 'ı', 'mən', 'sən', 'biz', 'siz', 'onlar', 'nə', 'hansı', 'necə', 'harada', 'nə vaxt', 'niyə', 'kim', 'nədir', 'hə', 'yox', 'bəli', 'xoşbəxt', 'kədərli', 'romantik', 'həyəcanlı', 'düşüncəli', 'rahat', 'salam'];
  return azPatterns.some(pattern => lowerMessage.includes(pattern)) ? 'az' : 'en';
}

// First, check for explicit mood statements (highest priority)
function detectExplicitMood(userMessage: string): string | null {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Explicit mood patterns - these take priority
  const explicitMoodPatterns: Record<string, string[]> = {
    romantic: ['feel romantic', 'feeling romantic', 'feel so romantic', 'i am romantic', 'im romantic', 'romantic mood', 'want romantic', 'need romantic'],
    excited: ['feel excited', 'feeling excited', 'feel so excited', 'i am excited', 'im excited', 'excited mood', 'want excited', 'need excited', 'feel thrilling'],
    happy: ['feel happy', 'feeling happy', 'feel so happy', 'i am happy', 'im happy', 'happy mood', 'want happy', 'need happy', 'feel joyful', 'feel cheerful'],
    sad: ['feel sad', 'feeling sad', 'feel so sad', 'i am sad', 'im sad', 'sad mood', 'want sad', 'need sad', 'feel down', 'feel blue', 'feel depressed'],
    thoughtful: ['feel thoughtful', 'feeling thoughtful', 'feel so thoughtful', 'feel philosophic', 'feeling philosophic', 'philosophic mood', 'philosophical mood', 'philosophic today', 'feeling philosophic today', 'want thoughtful', 'need thoughtful', 'feel deep', 'feel intellectual'],
    relax: ['feel relaxed', 'feeling relaxed', 'feel so relaxed', 'feel calm', 'feeling calm', 'calm mood', 'want relaxed', 'need relaxed', 'feel peaceful', 'feel chill']
  };

  for (const [mood, patterns] of Object.entries(explicitMoodPatterns)) {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      return mood;
    }
  }

  return null;
}

// Contextual situation detection - maps life situations to moods
function detectSituation(userMessage: string, language: 'az' | 'en' = 'en'): { mood: string | null; empatheticResponse: string } {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // All situations combined - ORDER MATTERS! More specific patterns first
  const allSituations = [
    // BREAKUP/SEPARATION situations - MUST BE CHECKED FIRST (before romantic patterns)
    { patterns: ['broke up', 'breakup', 'divorce', 'separated', 'split', 'ended relationship', 'ayrıldım', 'ayrıldıq', 'ayrılmışam', 'ayrılmışıq', 'boşandım', 'boşandıq', 'sevgilimdən ayrıldım', 'sevgilimdən ayrılmışam', 'sevgilimlə ayrıldım', 'sevgilimlə ayrılmışam', 'münasibət bitdi', 'münasibət bitmişdir', 'əlaqə kəsildi', 'əlaqə kəsildi'],
      mood: 'sad',
      responses: {
        en: [
          "I'm so sorry to hear about your breakup. Breakups are really tough. Sometimes watching emotional films can help us process our feelings and feel understood. Here are some movies that might resonate with you during this difficult time: 💙",
          "I understand how painful breakups can be. Movies can be a great companion during tough times. These emotional films might help you feel less alone:",
          "Breakups are never easy. These thoughtful, emotional films might help you process what you're going through:"
        ],
        az: [
          "Ayrılığınız haqqında eşitdiyimə görə çox təəssüf edirəm. Ayrılıqlar həqiqətən çətindir. Bəzən emosional filmlərə baxmaq hisslərimizi işləməyə və özümüzü anlaşılmış hiss etməyə kömək edə bilər. Bu çətin vaxtda sizinlə rezonans yarada biləcək filmlər: 💙",
          "Ayrılıqların nə qədər ağrılı ola biləcəyini başa düşürəm. Filmlər çətin vaxtlarda əla yoldaş ola bilər. Bu emosional filmlər özünüzü daha az tək hiss etməyinizə kömək edə bilər:",
          "Ayrılıqlar heç vaxt asan olmur. Bu düşüncəli, emosional filmlər keçirdiyiniz şeyləri işləməyinizə kömək edə bilər:"
        ]
      }
    },
    // Happy/Romantic situations (relationships, achievements) - Only positive relationship patterns
    { patterns: ['new girlfriend', 'new boyfriend', 'new relationship', 'got a girlfriend', 'got a boyfriend', 'made a new girlfriend', 'made a new boyfriend', 'started dating', 'met someone', 'found love', 'in love', 'falling in love', 'yeni sevgili', 'yeni sevgili tapdım', 'yeni sevgili tapmışam', 'yeni qız', 'yeni oğlan', 'yeni münasibət', 'sevgili tapdım', 'aşiq oldum', 'aşiqəm', 'sevgilim var'],
      mood: 'romantic', // New relationships are romantic
      responses: {
        en: [
          "That's wonderful! New relationships are exciting! Here are some romantic movies perfect for this special time! 💕",
          "How lovely! These romantic films will match your happy mood! ❤️",
          "Congratulations! These beautiful love stories are perfect for celebrating! 🎉"
        ],
        az: [
          "Nə gözəl! Yeni münasibətlər həyəcan vericidir! Bu xüsusi vaxt üçün mükəmməl romantik filmlər! 💕",
          "Nə sevimli! Bu romantik filmlər sizin xoş əhval-ruhiyyənizə uyğun olacaq! ❤️",
          "Təbriklər! Bu gözəl sevgi hekayələri qeyd etmək üçün mükəmməldir! 🎉"
        ]
      }
    },
    { patterns: ['celebrate', 'celebration', 'birthday', 'anniversary', 'promotion', 'success', 'achieved', 'won', 'amazing day', 'great day', 'wonderful day', 'qeyd et', 'bayram', 'ad günü', 'uğur', 'qazandım', 'mükəmməl gün', 'gözəl gün'],
      mood: 'happy',
      responses: {
        en: [
          "Congratulations! Let's keep the good vibes going with some fun, uplifting movies! 🎉",
          "That's wonderful! Here are some feel-good movies to match your mood:",
          "Awesome! These cheerful films will keep your spirits high:"
        ],
        az: [
          "Təbriklər! Yaxşı enerji ilə əyləncəli, ruhlandırıcı filmlərlə davam edək! 🎉",
          "Nə gözəl! Əhval-ruhiyyənizə uyğun yaxşı hiss etdirmə filmləri:",
          "Əla! Bu şən filmlər ruhunuzu yüksək saxlayacaq:"
        ]
      }
    },
    // Other Sad/Emotional situations (loss, death, grief)
    { patterns: ['lost', 'death', 'died', 'passed away', 'funeral', 'grief', 'mourning', 'depressed', 'depression', 'lonely', 'loneliness', 'rejected', 'heartbroken', 'heart break', 'upset', 'crying', 'tears', 'miss', 'missing', 'itirdim', 'ölüm', 'vəfat', 'kədərli', 'hüznlü', 'ağlayıram', 'ağlamaq', 'miss edirəm', 'kədərlənirəm', 'hüznlüyəm'],
      mood: 'sad',
      responses: {
        en: [
          "I'm sorry to hear that. Sometimes a good emotional film can help us process our feelings. Let me find some movies that might resonate with you. 💙",
          "That sounds really tough. Movies can be a great way to feel understood. Here are some films that might help:",
          "I understand this is a difficult time. These emotional films might help you feel less alone:"
        ],
        az: [
          "Eşitdiyimə görə çox təəssüf edirəm. Bəzən yaxşı emosional film hisslərimizi işləməyə kömək edə bilər. Sizinlə rezonans yarada biləcək filmləri tapım. 💙",
          "Bu çox çətin səslənir. Filmlər özümüzü anlaşılmış hiss etmək üçün əla bir yol ola bilər. Kömək edə biləcək filmlər:",
          "Başa düşürəm ki, bu çətin bir vaxtdır. Bu emosional filmlər özünüzü daha az tək hiss etməyinizə kömək edə bilər:"
        ]
      }
    },
    { patterns: ['stressed', 'stress', 'anxious', 'anxiety', 'worried', 'worries', 'tired', 'exhausted', 'overwhelmed', 'pressure', 'work stress', 'busy', 'need break', 'stressli', 'narahat', 'yorğun', 'yorulmuşam', 'təzyiq', 'istirahət lazımdır'],
      mood: 'relax',
      responses: {
        en: [
          "It sounds like you need to unwind. Let me suggest some calming, relaxing movies to help you de-stress. 🌿",
          "Everyone needs a break sometimes. Here are some peaceful films to help you relax:",
          "Take a moment to breathe. These gentle movies might help you unwind:"
        ],
        az: [
          "Görünür ki, istirahətə ehtiyacınız var. Stressi azaltmağa kömək edəcək sakit, rahatlaşdırıcı filmlər tövsiyə edim. 🌿",
          "Hamı bəzən istirahətə ehtiyac duyur. Rahatlamağınıza kömək edəcək sakit filmlər:",
          "Bir an nəfəs alın. Bu yumşaq filmlər istirahət etməyinizə kömək edə bilər:"
        ]
      }
    },
    { patterns: ['bored', 'nothing to do', 'nothing to watch', 'dont know what to watch', 'cant decide', 'indecisive', 'confused', 'darıxıram', 'darıxdım', 'nə edim bilmirəm', 'nə baxım bilmirəm', 'qərar verə bilmirəm'],
      mood: null,
      responses: {
        en: [
          "Let me help you discover something new! Here are some great movies to get you started:",
          "I've got some exciting recommendations for you! Check these out:",
          "Perfect timing! I have some amazing films you might enjoy:"
        ],
        az: [
          "Yeni bir şey kəşf etməyinizə kömək edim! Başlamaq üçün əla filmlər:",
          "Sizin üçün həyəcanlı tövsiyələrim var! Bunlara baxın:",
          "Mükəmməl vaxt! Zövq ala biləcəyiniz gözəl filmlərim var:"
        ]
      }
    },
    { patterns: ['adventure', 'thrilling', 'exciting', 'action', 'thriller', 'suspense', 'edge of seat', 'heart racing', 'pumped', 'energetic', 'macəra', 'həyəcanlı', 'aksiya', 'triller'],
      mood: 'excited',
      responses: {
        en: [
          "Perfect! I've got some high-energy, action-packed movies that will keep you on the edge of your seat! 🔥",
          "You want excitement? These thrilling films are exactly what you need! 💥",
          "Get ready for an adrenaline rush! Here are some intense movies:"
        ],
        az: [
          "Mükəmməl! Sizi gərginlikdə saxlayacaq yüksək enerjili, aksiya dolu filmlərim var! 🔥",
          "Həyəcan istəyirsiniz? Bu həyəcanlı filmlər tam lazım olduğunuz şeydir! 💥",
          "Adrenalin dalğasına hazır olun! Budur intensiv filmlər:"
        ]
      }
    },
    { patterns: ['romantic', 'date night', 'date', 'valentine', 'love', 'couple', 'relationship', 'together', 'sweet', 'cute', 'romantik', 'sevgi', 'eşq', 'münasibət'],
      mood: 'romantic',
      responses: {
        en: [
          "How romantic! Here are some beautiful love stories perfect for the occasion! 💕",
          "Love is in the air! These romantic films will make your evening special:",
          "Perfect choice! These heartwarming love stories are ideal:"
        ],
        az: [
          "Nə qədər romantik! Bu münasibət üçün mükəmməl gözəl sevgi hekayələri! 💕",
          "Sevgi havada! Bu romantik filmlər axşamınızı xüsusi edəcək:",
          "Mükəmməl seçim! Bu ürəyə təsir edən sevgi hekayələri idealdır:"
        ]
      }
    },
    { patterns: ['think', 'philosophical', 'deep', 'meaningful', 'thought-provoking', 'complex', 'mind', 'intellectual', 'challenging', 'düşünmək', 'fəlsəfi', 'dərin', 'mənalı', 'mürəkkəb', 'intellektual'],
      mood: 'thoughtful',
      responses: {
        en: [
          "Great! I have some thought-provoking films that will make you think deeply. 🧠",
          "Perfect for a contemplative evening. These deep, meaningful films are for you:",
          "These complex, philosophical movies will engage your mind:"
        ],
        az: [
          "Əla! Dərin düşünməyə sövq edəcək düşündürücü filmlərim var. 🧠",
          "Düşüncəli bir axşam üçün mükəmməl. Bu dərin, mənalı filmlər sizin üçün:",
          "Bu mürəkkəb, fəlsəfi filmlər ağlınızı məşğul edəcək:"
        ]
      }
    }
  ];

  // Check for situations first (more specific)
  // Use priority matching - longer/more specific patterns first
  for (const situation of allSituations) {
    // Sort patterns by length (longer = more specific = higher priority)
    const sortedPatterns = [...situation.patterns].sort((a, b) => b.length - a.length);
    
    for (const pattern of sortedPatterns) {
      // Check if pattern exists in message
      if (lowerMessage.includes(pattern)) {
        // For breakup patterns, ensure it's not a false positive
        // e.g., "sevgilimdən ayrılmışam" should match breakup, not romantic
        if (situation.mood === 'sad' && pattern.includes('ayrıl')) {
          // This is a breakup pattern - it takes priority
          let response: string;
          if (typeof situation.responses === 'object' && !Array.isArray(situation.responses)) {
            const langResponses = situation.responses[language] || situation.responses['en'];
            response = langResponses[Math.floor(Math.random() * langResponses.length)];
          } else {
            response = (situation.responses as string[])[Math.floor(Math.random() * (situation.responses as string[]).length)];
          }
          return { mood: situation.mood, empatheticResponse: response };
        }
        
        // For other patterns, check if it's not a false positive
        // e.g., if message contains "ayrıl" (breakup), don't match romantic patterns
        if (situation.mood === 'romantic' && (lowerMessage.includes('ayrıl') || lowerMessage.includes('ayrıldım') || lowerMessage.includes('ayrılmışam'))) {
          // Skip romantic if breakup detected
          continue;
        }
        
        // Normal match
        let response: string;
        if (typeof situation.responses === 'object' && !Array.isArray(situation.responses)) {
          const langResponses = situation.responses[language] || situation.responses['en'];
          response = langResponses[Math.floor(Math.random() * langResponses.length)];
        } else {
          response = (situation.responses as string[])[Math.floor(Math.random() * (situation.responses as string[]).length)];
        }
        return { mood: situation.mood, empatheticResponse: response };
      }
    }
  }

  // Fallback to mood keywords if no situation detected
  // Order matters - check sad first to avoid false positives
  const moodKeywords: Record<string, string[]> = {
    sad: ['kədərli', 'ağlamaq', 'dram', 'emosional', 'hüznlü', 'cry', 'emotional', 'drama', 'touching', 'melancholy', 'blue', 'kədər', 'hüzn'],
    happy: ['xoşbəxt', 'şad', 'gülmək', 'komediya', 'əyləncəli', 'pozitiv', 'sevinc', 'fun', 'comedy', 'laugh', 'cheerful', 'joyful'],
    excited: ['həyəcanlı', 'aksiya', 'triller', 'sürətli', 'macəra', 'action', 'thriller', 'adventure', 'intense', 'thrilling', 'pumped'],
    relax: ['rahat', 'sakit', 'istirahət', 'yüngül', 'relax', 'calm', 'peaceful', 'chill', 'easy', 'gentle', 'soothing'],
    thoughtful: ['düşüncəli', 'fəlsəfi', 'dərin', 'beyin', 'mürəkkəb', 'deep', 'philosophical', 'philosophic', 'mind', 'complex', 'intellectual'],
    romantic: ['romantik', 'sevgi', 'eşq', 'münasibət', 'love', 'relationship', 'couple', 'sweet', 'tender']
  };

  let detectedMood: string | null = null;
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedMood = mood;
      break;
    }
  }

  return { mood: detectedMood, empatheticResponse: "" };
}

// Simple AI response generator (can be replaced with OpenAI API)
function generateAIResponse(
  userMessage: string,
  movies: any[],
  userFavorites: string[],
  userWatchLater: string[],
  moods: any[]
): AIResponse {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Detect language
  const language = detectLanguage(userMessage);

  // Greeting detection (exact matches only)
  if (lowerMessage.match(/^(salam|hello|hi|hey|merhaba|salamlar)$/)) {
    return {
      content: language === 'az' 
        ? "Salam! Bu gün nə izləmək istəyirsiniz? Əhval-ruhiyyənizə görə mükəmməl film tapmağınıza kömək edə bilərəm! 🎬"
        : "Hello! What do you want to watch today? I can help you find the perfect movie based on your mood! 🎬"
    };
  }

  // "How are you" type questions
  if (lowerMessage.match(/(necəsən|how are you|nə var|nə var nə yox|how's it going|what's up)/)) {
    return {
      content: language === 'az'
        ? "Salam! Bu gün necəsəniz? (Film tövsiyələri üçün) Mükəmməl film tapmağınıza kömək etmək üçün buradayam! 😊"
        : "Hi! How are you today? (For movie recommendations) I'm here to help you find the perfect film! 😊"
    };
  }

  // Priority 1: Check for explicit mood statements first (e.g., "I feel romantic", "I feel excited")
  const explicitMood = detectExplicitMood(userMessage);
  
  // Priority 2: Detect situation and mood
  const { mood: situationMood, empatheticResponse } = detectSituation(userMessage, language);
  
  // Use explicit mood if found, otherwise use situation mood
  const detectedMood = explicitMood || situationMood;

  // If we detected a mood (either explicit or from situation), provide recommendations
  if (detectedMood) {
    let filteredMovies = movies.filter(m => m.mood === detectedMood);
    
    // Prioritize unwatched movies
    filteredMovies = filteredMovies.sort((a, b) => {
      const aInList = userFavorites.includes(a.id) || userWatchLater.includes(a.id);
      const bInList = userFavorites.includes(b.id) || userWatchLater.includes(b.id);
      if (aInList && !bInList) return 1;
      if (!aInList && bInList) return -1;
      return b.rating - a.rating;
    });

    const recommendations = filteredMovies.slice(0, 3).map(m => ({
      id: m.id,
      title: m.title,
      posterUrl: m.poster_url,
      rating: parseFloat(m.rating),
      year: m.year,
      mood: m.mood
    }));

    // Use empathetic response if available, otherwise use mood-specific response
    let responseText = empatheticResponse;
    
    if (!responseText) {
      // Context-aware responses based on mood
      const moodResponses: Record<string, { en: string[]; az: string[] }> = {
        sad: {
          en: [
            "I understand you're going through a tough time. These emotional films might help you process your feelings:",
            "Sometimes movies can help us feel understood. Here are some films that might resonate with you:",
            "These thoughtful, emotional films might be what you need right now:"
          ],
          az: [
            "Başa düşürəm ki, çətin bir vaxtdan keçirsiniz. Bu emosional filmlər hisslərinizi işləməyə kömək edə bilər:",
            "Bəzən filmlər özümüzü anlaşılmış hiss etməyə kömək edir. Sizinlə rezonans yarada biləcək filmlər:",
            "Bu düşüncəli, emosional filmlər indi lazım olduğunuz şey ola bilər:"
          ]
        },
        happy: {
          en: [
            "Great! Let's keep those good vibes going! Here are some uplifting movies:",
            "Perfect mood for some feel-good films! Check these out:",
            "These cheerful movies will keep your spirits high:"
          ],
          az: [
            "Əla! Yaxşı enerjini davam etdirək! Budur ruhlandırıcı filmlər:",
            "Yaxşı hiss etdirmə filmləri üçün mükəmməl əhval-ruhiyyə! Bunlara baxın:",
            "Bu şən filmlər ruhunuzu yüksək saxlayacaq:"
          ]
        },
        excited: {
          en: [
            "You want excitement? These action-packed films are perfect!",
            "Get ready for an adrenaline rush! Here are some thrilling movies:",
            "These intense, high-energy films will keep you on the edge of your seat:"
          ],
          az: [
            "Həyəcan istəyirsiniz? Bu aksiya dolu filmlər mükəmməldir!",
            "Adrenalin dalğasına hazır olun! Budur həyəcanlı filmlər:",
            "Bu intensiv, yüksək enerjili filmlər sizi gərginlikdə saxlayacaq:"
          ]
        },
        relax: {
          en: [
            "Time to unwind! These calming films will help you relax:",
            "Perfect for a peaceful evening. Here are some gentle movies:",
            "These soothing films are ideal for unwinding:"
          ],
          az: [
            "İstirahət vaxtı! Bu sakit filmlər rahatlamağınıza kömək edəcək:",
            "Sakit bir axşam üçün mükəmməl. Budur yumşaq filmlər:",
            "Bu sakitləşdirici filmlər istirahət üçün idealdır:"
          ]
        },
        thoughtful: {
          en: [
            "Perfect for a contemplative evening. These deep, meaningful films:",
            "These thought-provoking movies will engage your mind:",
            "Great choice! Here are some complex, philosophical films:"
          ],
          az: [
            "Düşüncəli bir axşam üçün mükəmməl. Bu dərin, mənalı filmlər:",
            "Bu düşündürücü filmlər ağlınızı məşğul edəcək:",
            "Əla seçim! Budur mürəkkəb, fəlsəfi filmlər:"
          ]
        },
        romantic: {
          en: [
            "How romantic! These beautiful love stories are perfect:",
            "Love is in the air! Here are some heartwarming films:",
            "These romantic movies will make your evening special:"
          ],
          az: [
            "Nə qədər romantik! Bu gözəl sevgi hekayələri mükəmməldir:",
            "Sevgi havada! Budur ürəyə təsir edən filmlər:",
            "Bu romantik filmlər axşamınızı xüsusi edəcək:"
          ]
        }
      };

      const responseOptions = moodResponses[detectedMood]?.[language] || moodResponses[detectedMood]?.['en'] || [`Perfect! I have some ${detectedMood} movies for you!`];
      responseText = responseOptions[Math.floor(Math.random() * responseOptions.length)];
    }

    return {
      content: responseText,
      recommendations
    };
  }

  // Movie recommendation requests
  if (lowerMessage.match(/(nə baxım|ne baxim|nə izləyim|film tövsiyə|recommend|suggest|watch|movie|film|what should i|what can i|nəyə baxım|nəyə izləyim)/)) {
    let filteredMovies = movies;

    // Filter by mood if detected
    if (detectedMood) {
      filteredMovies = movies.filter(m => m.mood === detectedMood);
    }

    // Prioritize unwatched movies
    filteredMovies = filteredMovies.sort((a, b) => {
      const aInList = userFavorites.includes(a.id) || userWatchLater.includes(a.id);
      const bInList = userFavorites.includes(b.id) || userWatchLater.includes(b.id);
      if (aInList && !bInList) return 1;
      if (!aInList && bInList) return -1;
      return b.rating - a.rating;
    });

    const recommendations = filteredMovies.slice(0, 3).map(m => ({
      id: m.id,
      title: m.title,
      posterUrl: m.poster_url,
      rating: parseFloat(m.rating),
      year: m.year,
      mood: m.mood
    }));

    let responseText = "";
    if (detectedMood) {
      const moodInfo = moods.find(m => m.id === detectedMood);
      responseText = language === 'az'
        ? `Əla! Sizin üçün ${moodInfo?.name || detectedMood} filmləri tapdım! Budur tövsiyələrim:`
        : `Great! I found some ${moodInfo?.name || detectedMood} movies for you! Here are my recommendations:`;
    } else {
      responseText = language === 'az'
        ? "Budur sizin üçün əla film tövsiyələri! Əhval-ruhiyyənizi desəniz, daha dəqiq tövsiyələr verə bilərəm. 🎬"
        : "Here are some great movie recommendations for you! If you tell me your mood, I can give you more specific suggestions. 🎬";
    }

    return {
      content: responseText,
      recommendations
    };
  }


  // Default response - try to be helpful
  return {
    content: language === 'az'
      ? "Mən sizə mükəmməl film tapmağa kömək edə bilərəm! Necə hiss etdiyinizi və ya nə keçirdiyinizi deyin, mən də əhval-ruhiyyənizə uyğun filmlər tövsiyə edəcəm. Məsələn: 'Kədərli hiss edirəm' və ya 'Həyəcanlı bir şey istəyirəm'. 🎬"
      : "I can help you find the perfect movie! Tell me how you're feeling or what you're going through, and I'll recommend films that match your mood. For example: 'I'm feeling sad' or 'I want something exciting'. 🎬"
  };
}

// POST /api/ai/chat - Chat with AI assistant
router.post('/chat', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
    }

    // Fetch movies from Supabase
    const movies = await getMovies();

    // Fetch moods from Supabase
    const { data: moodsData, error: moodsError } = await supabase
      .from('moods')
      .select('*');

    if (moodsError) {
      console.error('Error fetching moods:', moodsError);
      return res.status(500).json({ error: 'Failed to fetch moods' });
    }

    const moods = moodsData || [];

    // Fetch user favorites and watch later
    const { data: favoritesData } = await supabase
      .from('favorites')
      .select('movie_id')
      .eq('user_id', userId);

    const { data: watchLaterData } = await supabase
      .from('watch_later')
      .select('movie_id')
      .eq('user_id', userId);

    const userFavorites = (favoritesData || []).map(f => f.movie_id);
    const userWatchLater = (watchLaterData || []).map(w => w.movie_id);

    // Generate AI response
    const response = generateAIResponse(
      message,
      movies,
      userFavorites,
      userWatchLater,
      moods
    );

    res.json(response);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

