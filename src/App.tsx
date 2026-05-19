import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book as BookIcon, 
  Search, 
  QrCode, 
  Trophy, 
  User, 
  ArrowLeft, 
  Bookmark, 
  Library, 
  LogOut, 
  Moon, 
  Sun,
  ChevronRight,
  Info,
  Camera,
  Bell,
  CheckCircle2,
  Share2,
  Edit,
  Camera as CameraIcon,
  Check,
  X,
  Plus,
  Image as ImageIcon,
  Flame,
  Star as StarIcon,
  ChevronLeft,
  Settings,
  PhotoCamera,
  ArrowLeft as ArrowBackIosNew
} from 'lucide-react';
import { auth, loginWithGoogle, logout, loginAnonymously } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  getBooks, 
  getUserProfile, 
  createUserProfile, 
  updateUserProfile,
  seedBooks,
  getNotifications,
  addNotification,
  markNotificationAsRead
} from './lib/firestore';

// --- Types ---
interface LibraryNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'success' | 'alert';
}
interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  summaryKannada: string;
  imageUrl: string;
  category: string;
  genre: string;
  publishedDate: string;
  isIssued: boolean;
  isReserved: boolean;
}

// --- Sample Data ---
const SAMPLE_BOOKS: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "Jay Gatsby, a mysterious millionaire, obsesses over Daisy Buchanan. A portrait of the Roaring Twenties, social upheaval, and the cautionary American Dream.",
    summaryKannada: "ಜೇ ಗ್ಯಾಟ್ಸ್ಬಿ ಎಂಬ ಶ್ರೀಮಂತ ವ್ಯಕ್ತಿಯ ಪ್ರೀತಿ ಮತ್ತು ಅವನ ಜೀವನದ ಸವಾಲುಗಳ ಬಗ್ಗೆ ಈ ಕಥೆ ತಿಳಿಸುತ್ತದೆ. ಇದು 1920ರ ದಶಕದ ಅಮೆರಿಕನ್ ಸಮಾಜದ ಚಿತ್ರಣ ನೀಡುತ್ತದೆ.",
    imageUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg",
    category: "Classic",
    genre: "Modernist Fiction",
    publishedDate: "April 10, 1925",
    isIssued: false,
    isReserved: false,
  },
  {
    id: "2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "Scout Finch navigates life in Alabama during the Great Depression. Her father, Atticus, defends a black man against a false charge in this tale of racial injustice.",
    summaryKannada: "ಈ ಕಥೆಯು ಸೌತ್ ಫಿಂಚ್ ಎಂಬ ಬಾಲಕಿಯ ದೃಷ್ಟಿಕೋನದಿಂದ ವರ್ಣಭೇದ ನೀತಿ ಮತ್ತು ನ್ಯಾಯದ ಬಗ್ಗೆ ತಿಳಿಸುತ್ತದೆ. ಅವಳ ತಂದೆ ಅಟಿಕಸ್ ಒಬ್ಬ ದಕ್ಷ ನ್ಯಾಯವಾದಿಯಾಗಿ ಹೋರಾಡುತ್ತಾರೆ.",
    imageUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg",
    category: "Fiction",
    genre: "Southern Gothic",
    publishedDate: "July 11, 1960",
    isIssued: false,
    isReserved: false,
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    description: "In a future world of perpetual war and government surveillance, Winston Smith dreams of rebellion against Big Brother and the Thought Police.",
    summaryKannada: "ಈ ಕಾದಂಬರಿಯು ಭವಿಷ್ಯದ ಜಗತ್ತಿನಲ್ಲಿ ಬಲಿಷ್ಠ ಸರ್ಕಾರವು ಜನರ ಮೇಲೆ ಹೇಗೆ ಕಣ್ಗಾವಲು ಇಡುತ್ತದೆ ಎಂದು ವಿವರಿಸುತ್ತದೆ. ಇದು ಸ್ವಾತಂತ್ರ್ಯದ ಮಹತ್ವವನ್ನು ಸಾರುತ್ತದೆ.",
    imageUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1532714506i/40961427.jpg",
    category: "Dystopian",
    genre: "Political Fiction",
    publishedDate: "June 8, 1949",
    isIssued: false,
    isReserved: false,
  },
  {
    id: "4",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description: "Bilbo Baggins, a home-loving hobbit, is swept into a grand quest for dragon-guarded treasure, discovering courage and wisdom along the way.",
    summaryKannada: "ಬಿಲ್ಬೋ ಬ್ಯಾಗಿನ್ಸ್ ಎಂಬ ಹವ್ಯಾಸಿ ಹೂಬಿಟ್ ತನ್ನ ಮನೆಯಿಂದ ಹೊರಬಂದು ಡ್ರ್ಯಾಗನ್ ಬಳಿಯಿರುವ ಖಜಾನೆಗಾಗಿ ಪಯಣಿಸುವ ಸಾಹಸಮಯ ಕಥೆ ಇದಾಗಿದೆ.",
    imageUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
    category: "Fantasy",
    genre: "High Fantasy",
    publishedDate: "September 21, 1937",
    isIssued: false,
    isReserved: false,
  },
  {
    id: "5",
    title: "Dune",
    author: "Frank Herbert",
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange.",
    summaryKannada: "ಮರುಭೂಮಿ ಗ್ರಹವಾದ ಅರಾಕಿಸ್‌ನಲ್ಲಿ ಪೌಲ್ ಅಟ್ರೈಡ್ಸ್ ಎಂಬ ಹುಡುಗನು ತನ್ನ ಕುಟುಂಬ ಮತ್ತು ಬೆಲೆಬಾಳುವ 'ಸ್ಪೈಸ್'ಗಾಗಿ ಹೋರಾಡುವ ಕಲ್ಪನಾ ಕಥೆ ಇದು.",
    imageUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg",
    category: "Sci-Fi",
    genre: "Space Opera",
    publishedDate: "August 1, 1965",
    isIssued: false,
    isReserved: false,
  },
  {
    id: "6",
    title: "The Alchemist",
    author: "Paulo Coelho",
    description: "A Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure, discovers its worth is far more central than he ever imagined.",
    summaryKannada: "ಸ್ಯಾಂಟಿಯಾಗೊ ಎಂಬ ಯುವಕನು ತನ್ನ ಕನಸನ್ನು ನನಸು ಮಾಡಿಕೊಳ್ಳಲು ಪ್ರಯಾಣಿಸುತ್ತಾನೆ ಮತ್ತು ಜಗತ್ತಿನ ರಹಸ್ಯಗಳನ್ನು ತಿಳಿದುಕೊಳ್ಳುತ್ತಾನೆ.",
    imageUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/1128434.jpg",
    category: "Fiction",
    genre: "Fantasy",
    publishedDate: "1988",
    isIssued: false,
    isReserved: false,
  },
  {
    id: "7",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "The story of Elizabeth Bennet and her sisters as they navigate the issues of manners, upbringing, morality, education, and marriage in the society of the landed gentry of the British Regency.",
    summaryKannada: "ಎಲಿಜಬೆತ್ ಬೆನೆಟ್ ಮತ್ತು ಅವಳ ಕುಟುಂಬದ ಕಥೆಯಾಗಿದ್ದು, ಇದು ಪ್ರೀತಿ, ಸಾಮಾಜಿಕ ಮರ್ಯಾದೆ ಮತ್ತು ವ್ಯಕ್ತಿತ್ವದ ಬಗ್ಗೆ ತಿಳಿಸುತ್ತದೆ.",
    imageUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
    category: "Classic",
    genre: "Romance",
    publishedDate: "January 28, 1813",
    isIssued: false,
    isReserved: false,
  },
  {
    id: "8",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    description: "Alicia Berenson’s life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows overlooking a park in one of London’s most desirable areas.",
    summaryKannada: "ಅಲಿಸಿಯಾ ಎಂಬ ಚಿತ್ರಗಾರ್ತಿಯು ತನ್ನ ಪತಿಯನ್ನು ಕೊಲೆ ಮಾಡಿದ ನಂತರ ಮೌನಕ್ಕೆ ಶರಣಾಗುತ್ತಾಳೆ. ಇದು ಅತ್ಯಂತ ಕುತೂಹಲಕಾರಿ ಸೈಕಾಲಜಿಕಲ್ ಥ್ರಿಲ್ಲರ್ ಆಗಿದೆ.",
    imageUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1668782119i/40063199.jpg",
    category: "Thriller",
    genre: "Psychological Thriller",
    publishedDate: "February 5, 2019",
    isIssued: false,
    isReserved: false,
  }
];

// --- Screens ---

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="h-full bg-violet-600 flex flex-col items-center justify-center text-white text-center p-6">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="bg-white/20 p-6 rounded-3xl mb-6 backdrop-blur-sm">
          <Library size={64} />
        </div>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Namma-Pustaka</h1>
        <p className="text-violet-100 opacity-80 text-sm">Your Smart Library Assistant</p>
        <div className="mt-8">
           <motion.div 
             animate={{ rotate: 360 }} 
             transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
             className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full mx-auto"
           />
        </div>
      </motion.div>
    </div>
  );
};

const LoginScreen = ({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginAnonymously();
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col p-8 justify-center overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 mb-6 mx-auto">
          <Library size={32} />
        </div>
        <h2 className="text-3xl font-black text-zinc-900 mb-2 text-center tracking-tight">Welcome Back</h2>
        <p className="text-gray-400 mb-10 text-sm text-center">Your personalized library awaits</p>
        
        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-100 text-zinc-900 font-bold py-4 rounded-[1.5rem] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Library size={18} />
              </motion.div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
          
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-gray-300">Default Access</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <button 
            onClick={handleGuestLogin}
            className="w-full bg-violet-600 text-white font-black py-4 rounded-[1.5rem] shadow-xl shadow-violet-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Guest Preview <ChevronRight size={18} />
          </button>
          
          {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest mt-2">{error}</p>}
        </div>
        
        <p className="mt-10 text-center text-gray-500 text-xs font-medium">
          New to the library? <span onClick={onSignup} className="text-violet-600 font-black cursor-pointer hover:underline">Get Started</span>
        </p>
      </motion.div>
    </div>
  );
};

const SignupScreen = ({ onSignup, onLogin }: { onSignup: () => void; onLogin: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSignup();
    }, 1500);
  };

  return (
    <div className="h-full bg-white flex flex-col p-8 justify-center overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight text-center">Create Account</h2>
        <p className="text-gray-400 mb-10 text-sm text-center">Start your digital reading journey</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aysha Sabah" 
              className="w-full p-4 border border-gray-100 rounded-[1.5rem] bg-gray-50 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm font-medium" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aysha@pustaka.com" 
              className="w-full p-4 border border-gray-100 rounded-[1.5rem] bg-gray-50 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm font-medium" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full p-4 border border-gray-100 rounded-[1.5rem] bg-gray-50 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm font-medium" 
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 text-white font-black py-4 rounded-[1.5rem] shadow-xl shadow-violet-200 active:scale-95 transition-all"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
        
        <p className="mt-10 text-center text-gray-500 text-xs font-medium">
          Already have an account? <span onClick={onLogin} className="text-violet-600 font-black cursor-pointer hover:underline">Log In</span>
        </p>
      </motion.div>
    </div>
  );
};

const HomeScreen = ({ books, onBookSelect, title }: { books: Book[]; onBookSelect: (id: string) => void; title?: string }) => {
  const [search, setSearch] = useState('');
  const filtered = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full overflow-y-auto p-4 pb-24">
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-violet-700 mb-4">{title}</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books..." 
              className="w-full bg-white p-4 pl-12 rounded-2xl shadow-sm border focus:ring-2 focus:ring-violet-500 outline-none text-sm transition-all"
            />
          </div>
        </div>
      )}
      
      {!title && (
         <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter library..." 
              className="w-full bg-white/50 p-4 pl-12 rounded-2xl shadow-sm border border-gray-100 focus:ring-2 focus:ring-violet-500 outline-none text-sm transition-all"
            />
         </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(book => (
          <motion.div key={book.id} whileTap={{ scale: 0.96 }} onClick={() => onBookSelect(book.id)} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
            <img src={book.imageUrl} alt={book.title} className="w-full h-44 object-cover" />
            <div className="p-3 bg-white">
              <h3 className="font-bold text-xs truncate leading-tight mb-1">{book.title}</h3>
              <p className="text-[10px] text-gray-400 truncate mb-2">{book.author}</p>
              <div className="flex gap-1 flex-wrap">
                <span className="text-[8px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded font-bold">{book.category}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const BookDetailScreen = ({ book, isIssued, isReserved, onBack, onToggleIssue, onToggleReserve }: { 
  book: Book; isIssued: boolean; isReserved: boolean; onBack: () => void; onToggleIssue: () => void; onToggleReserve: () => void;
}) => {
  const [lang, setLang] = useState<'EN' | 'KN'>('EN');

  return (
    <div className="h-full bg-white flex flex-col absolute inset-0 z-50">
      <div className="p-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-50 sticky top-0 z-10">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button onClick={onBack} className="p-2 bg-gray-50 rounded-full active:scale-90 transition-transform flex-shrink-0"><ArrowLeft size={20}/></button>
          <span className="font-bold text-sm truncate">{book.title}</span>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
           <button 
             onClick={() => setLang('EN')} 
             className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${lang === 'EN' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-400'}`}
           >
             EN
           </button>
           <button 
             onClick={() => setLang('KN')} 
             className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${lang === 'KN' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-400'}`}
           >
             ಕನ್ನಡ
           </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="bg-gray-50 h-80 flex items-center justify-center p-8">
          <img src={book.imageUrl} alt={book.title} className="h-full shadow-2xl rounded-lg transform -rotate-1 hover:rotate-0 transition-transform duration-500" />
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-1 tracking-tight">{book.title}</h1>
          <p className="text-violet-600 font-bold mb-4">{book.author}</p>
          
          <div className="flex gap-2 mb-6">
            <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">{book.category}</span>
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">{book.genre}</span>
          </div>
  
          <p className="text-[10px] text-gray-400 mb-6 font-bold flex items-center gap-2 uppercase tracking-wider">
            <Library size={12} /> Published: {book.publishedDate}
          </p>
  
          <h3 className="text-[10px] font-black mb-3 uppercase tracking-widest text-violet-600 font-sans">
            {lang === 'EN' ? 'About this book' : 'ಕಥೆಯ ಸಾರಾಂಶ'}
          </h3>
          <p className={`text-gray-600 leading-relaxed mb-12 italic ${lang === 'KN' ? 'text-lg font-medium' : 'text-sm'}`}>
            "{lang === 'EN' ? book.description : book.summaryKannada}"
          </p>
        </div>
      </div>
  
      <div className="p-4 bg-white border-t border-gray-50 grid grid-cols-2 gap-4">
        <button onClick={onToggleReserve} className={`flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-sm active:scale-95 transition-all ${isReserved ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-violet-700 border border-violet-100'}`}>
          <Bookmark size={16} /> {isReserved ? 'Reserved' : 'Reserve'}
        </button>
        <button onClick={onToggleIssue} className={`flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-sm text-white active:scale-95 transition-all shadow-lg ${isIssued ? 'bg-red-500 shadow-red-200' : 'bg-violet-600 shadow-violet-200'}`}>
          <Library size={16} /> {isIssued ? 'Return' : 'Issue'}
        </button>
      </div>
    </div>
  );
};

// --- Main App Logic ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [screen, setScreen] = useState('splash');
  const [darkMode, setDarkMode] = useState(false);
  const [books, setBooks] = useState<Book[]>(SAMPLE_BOOKS);
  const [notifications, setNotifications] = useState<LibraryNotification[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<'profile' | 'notifications' | null>(null);
  const [tab, setTab] = useState('home');
  const [filterType, setFilterType] = useState<'all' | 'issued' | 'reserved'>('all');
  const [loading, setLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  
  const AVATARS = [
    "/Avatar/_.webp",
    "/Avatar/_ (3).jpeg",
    "/Avatar/_ (4).jpeg",
    "/Avatar/Pls this is soo cute.jpeg",
    "/Avatar/picrew time.webp",
    "/Avatar/✪.jpeg",
    "/Avatar/🎨 Pin by Bashayer on بزنس Board 2025 _ Anime Art + Free Sticker Pack Bonus.jpeg"
  ];

  const handleShare = async () => {
    if (isSharing) return;
    
    const shareData = {
      title: 'Join Namma Pustaka',
      text: 'Check out this cool digital library for Kannada literature! Connect and compete on the leaderboard.',
      url: window.location.origin,
    };

    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        // Fallback notification
        const notif = {
          title: "Link Copied!",
          message: "Invite link copied to clipboard. Share it with your friends!",
          type: 'info'
        };
        if (currentUser) {
          await addNotification(currentUser.uid, notif);
          const freshNotifs = await getNotifications(currentUser.uid);
          if (freshNotifs) setNotifications(freshNotifs as any);
        }
      }
    } catch (err: any) {
      // Ignore user cancellation errors
      if (err.name !== 'AbortError') {
        console.error('Sharing failed', err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const formatError = (err: any) => {
    try {
      const parsed = JSON.parse(err.message);
      if (parsed.error && parsed.error.includes('Missing or insufficient permissions')) {
        return "Permission Denied: You don't have access to this action.";
      }
      return parsed.error || err.message;
    } catch {
      return err.message || String(err);
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setLoading(true);
        try {
          let userProfile = await getUserProfile(user.uid);
          if (!userProfile) {
            userProfile = {
              displayName: user.displayName || 'User',
              email: user.email,
              photoUrl: user.photoURL,
              points: 0,
              issuedBookIds: [],
              reservedBookIds: []
            };
            await createUserProfile(user.uid, userProfile);
          }
          setProfile(userProfile);
          
          // Load notifications
          const notifs = await getNotifications(user.uid);
          if (notifs) setNotifications(notifs as any);

          setScreen('main');
        } catch (err) {
          setErrorMsg(formatError(err));
          console.error("Profile initialization failed:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setNotifications([]);
        if (screen !== 'splash' && screen !== 'signup') {
          setScreen('login');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Book Loading & Seeding
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const fetchedBooks = await getBooks();
        if (fetchedBooks && fetchedBooks.length > 0) {
          setBooks(fetchedBooks as any);
        } else if (currentUser) {
          // Only try to seed if we have a user and catalog is empty
          await seedBooks(SAMPLE_BOOKS);
          const reFetched = await getBooks();
          if (reFetched && reFetched.length > 0) {
            setBooks(reFetched as any);
          }
        }
      } catch (err) {
        console.error("Book loading failed:", err);
      }
    };
    loadBooks();
  }, [currentUser]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdatePhoto = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const photoUrl = reader.result as string;
        setProfile((prev: any) => ({ ...prev, photoUrl }));
        await updateUserProfile(currentUser.uid, { photoUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = () => {
    // Handled by onAuthStateChanged
  };

  const handleToggleIssue = async (id: string) => {
    if (!currentUser || !profile) return;
    try {
      const isIssued = profile.issuedBookIds.includes(id);
      const book = books.find(b => b.id === id);
      const newIssued = isIssued 
        ? profile.issuedBookIds.filter((itemId: string) => itemId !== id)
        : [...profile.issuedBookIds, id];
      
      const newPoints = isIssued ? profile.points + 50 : profile.points;
  
      const updates = { issuedBookIds: newIssued, points: newPoints };
      setProfile((prev: any) => ({ ...prev, ...updates }));
      await updateUserProfile(currentUser.uid, updates);
  
      // Add notification
      if (book) {
        const notif = {
          title: isIssued ? "Book Returned" : "Book Issued",
          message: isIssued 
            ? `You've returned "${book.title}". You earned 50 points!` 
            : `"${book.title}" is now in your digital collection.`,
          type: 'success'
        };
        await addNotification(currentUser.uid, notif);
        const freshNotifs = await getNotifications(currentUser.uid);
        if (freshNotifs) setNotifications(freshNotifs as any);
      }
    } catch (err) {
      setErrorMsg(formatError(err));
    }
  };

  const handleToggleReserve = async (id: string) => {
    if (!currentUser || !profile) return;
    try {
      const isReserved = profile.reservedBookIds.includes(id);
      const book = books.find(b => b.id === id);
      const newReserved = isReserved 
        ? profile.reservedBookIds.filter((itemId: string) => itemId !== id)
        : [...profile.reservedBookIds, id];
  
      const updates = { reservedBookIds: newReserved };
      setProfile((prev: any) => ({ ...prev, ...updates }));
      await updateUserProfile(currentUser.uid, updates);
  
      // Add notification
      if (book && !isReserved) {
        const notif = {
          title: "Reservation Placed",
          message: `You have successfully reserved "${book.title}". We'll notify you when it's ready!`,
          type: 'info'
        };
        await addNotification(currentUser.uid, notif);
        const freshNotifs = await getNotifications(currentUser.uid);
        if (freshNotifs) setNotifications(freshNotifs as any);
      }
    } catch (err) {
      setErrorMsg(formatError(err));
    }
  };

  const handleMarkRead = async (notifId: string) => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    await markNotificationAsRead(currentUser.uid, notifId);
  };

  const issuedBooks = books.filter(b => profile?.issuedBookIds?.includes(b.id));
  const reservedBooks = books.filter(b => profile?.reservedBookIds?.includes(b.id));
  const selectedBook = books.find(b => b.id === selectedBookId);

  // Recommendations Logic
  const userHistoryIds = new Set([...(profile?.reservedBookIds || []), ...(profile?.issuedBookIds || [])]);
  const userGenres = new Set(books.filter(b => userHistoryIds.has(b.id)).map(b => b.genre));
  
  const recommendedBooks = books.filter(book => {
    // Don't recommend something they already have
    if (userHistoryIds.has(book.id)) return false;
    // If they have preferences, match genre
    if (userGenres.size > 0) return userGenres.has(book.genre);
    return true;
  });

  // Final list of docs to show in "For You"
  const finalRecommendations = recommendedBooks.length > 0 
    ? recommendedBooks 
    : books.filter(b => !userHistoryIds.has(b.id));

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 pt-12 pb-12 font-sans overflow-hidden transition-colors duration-500 ease-in-out ${darkMode ? 'bg-zinc-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Phone Shell */}
      <div className={`relative w-[375px] h-[780px] rounded-[3.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border-[12px] overflow-hidden flex flex-col transition-all duration-500 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-900'}`}>
        
        <AnimatePresence>
          {errorMsg && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 20, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-0 left-4 right-4 z-[200] bg-red-500 text-white p-4 rounded-2xl shadow-xl text-xs font-bold uppercase tracking-widest flex items-center gap-3"
            >
              <Info size={16} />
              <span className="flex-1">{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-white/10 rounded-lg">
                <ChevronRight size={16} className="rotate-90" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {screen === 'splash' && (
            <motion.div key="splash" exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full">
              <SplashScreen onFinish={() => setScreen(currentUser ? 'main' : 'login')} />
            </motion.div>
          )}

          {screen === 'login' && (
            <motion.div key="login" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -200, opacity: 0 }} className="h-full">
              <LoginScreen onLogin={handleLogin} onSignup={() => setScreen('signup')} />
            </motion.div>
          )}

          {screen === 'signup' && (
            <motion.div key="signup" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -200, opacity: 0 }} className="h-full">
              <SignupScreen onSignup={() => setScreen('login')} onLogin={() => setScreen('login')} />
            </motion.div>
          )}

          {screen === 'main' && (
            <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col relative">
              
              <div className={`flex-1 overflow-y-auto scrollbar-hide ${darkMode ? 'bg-zinc-950' : 'bg-gray-50'}`}>
                {tab === 'home' && (
                  <div className="p-6 space-y-8 pb-10">
                    <div className="flex justify-between items-start mt-4">
                      <div>
                        <h2 className={`text-4xl font-black tracking-tight leading-none ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Discover</h2>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="bg-violet-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest leading-none">NAMMA PUSTAKA</span>
                           <span className="text-[8px] uppercase font-black text-gray-400 tracking-widest leading-none">Assistant</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowProfileMenu(true)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 relative ${darkMode ? 'border-zinc-800' : 'border-violet-100'} bg-violet-50 flex items-center justify-center transition-transform active:scale-90`}
                      >
                         {profile?.photoUrl ? (
                           <img src={profile.photoUrl} className="w-full h-full object-cover" />
                         ) : (
                           <User size={24} className="text-violet-600" />
                         )}
                         {notifications.some(n => !n.isRead) && (
                            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm" />
                         )}
                      </button>
                    </div>

                    {/* Stats Banner */}
                    <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-200/50 dark:shadow-none relative overflow-hidden`}>
                      <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                          <StarIcon size={24} className="text-amber-400 fill-amber-400" />
                          <span className="text-[8px] font-black bg-white/20 px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">
                             {profile?.points > 1000 ? 'Lv. 4 Reader' : profile?.points > 500 ? 'Lv. 3 Reader' : 'Lv. 1 Reader'}
                          </span>
                        </div>
                        <p className="text-5xl font-black leading-none mb-1 tracking-tighter">{profile?.points || 0}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Reading Momentum Pts</p>
                        
                        <div className="mt-6 flex flex-col gap-2">
                           <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: '65%' }} 
                                className="h-full bg-white shadow-[0_0_10px_white]" 
                              />
                           </div>
                           <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-60">
                              <span>Level Progress</span>
                              <span>65%</span>
                           </div>
                        </div>
                      </div>
                      {/* Abstract Shapes */}
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl" />
                    </div>

                    {/* Currently Reading / Issued */}
                    {issuedBooks.length > 0 && (
                      <section>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Issued Books</h3>
                          <Library size={14} className="text-violet-500" />
                        </div>
                        <div className="space-y-3">
                          {issuedBooks.map(book => (
                            <div key={book.id} onClick={() => setSelectedBookId(book.id)} className={`p-4 rounded-3xl flex gap-4 items-center shadow-sm border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                              <img src={book.imageUrl} className="w-14 h-18 object-cover rounded-xl shadow" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate">{book.title}</h4>
                                <div className={`h-1 rounded-full mt-3 overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                                  <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} className="h-full bg-violet-600 ring-4 ring-violet-600/20" />
                                </div>
                                <p className="text-[9px] mt-2 font-bold text-violet-600 uppercase tracking-tighter">45% Progress</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Recommended Collection */}
                    <section>
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">
                            {userGenres.size > 0 ? "Based on your interests" : "Recommended for You"}
                          </h3>
                          {userGenres.size > 0 && (
                            <p className="text-[8px] font-black uppercase text-violet-500 mt-1">
                              Because you like {Array.from(userGenres).slice(0, 1).join(', ')}...
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-violet-600 cursor-pointer">Explore</span>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        {finalRecommendations.map(book => (
                          <motion.div 
                            key={book.id} 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedBookId(book.id)}
                            className="min-w-[150px]"
                          >
                            <img src={book.imageUrl} className="w-full h-52 object-cover rounded-[2rem] shadow-xl" />
                            <h4 className="mt-3 font-bold text-xs truncate px-1">{book.title}</h4>
                            <p className="text-[10px] text-gray-400 font-bold px-1 uppercase tracking-tighter">{book.category}</p>
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {tab === 'search' && (
                   <div className="h-full flex flex-col p-6">
                     <div className="mb-6">
                       <h2 className="text-2xl font-black tracking-tight">Library</h2>
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Catalog Explorer</p>
                       
                       <div className="flex gap-2 mt-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                          {['all', 'issued', 'reserved'].map((type) => (
                            <button 
                              key={type}
                              onClick={() => setFilterType(type as any)}
                              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${filterType === type ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-400'}`}
                            >
                              {type}
                            </button>
                          ))}
                       </div>
                     </div>
                     <HomeScreen books={filterType === 'all' ? books : (filterType === 'issued' ? issuedBooks : reservedBooks)} onBookSelect={setSelectedBookId} />
                   </div>
                )}

                {tab === 'scan' && (
                  <div className="h-full bg-black flex flex-col items-center justify-center p-8 text-center">
                    <div className="relative w-full aspect-square max-w-[280px]">
                       <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-violet-500 rounded-tl-3xl" />
                       <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-violet-500 rounded-tr-3xl" />
                       <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-violet-500 rounded-bl-3xl" />
                       <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-violet-500 rounded-br-3xl" />
                       <QrCode size={100} className="text-violet-500/30 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                       <motion.div 
                        initial={{ top: '10%' }} 
                        animate={{ top: '90%' }} 
                        transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                        className="absolute left-4 right-4 h-0.5 bg-violet-400 shadow-[0_0_20px_#8b5cf6] z-10" 
                       />
                    </div>
                    <h2 className="text-white font-black text-xl mt-12 mb-2 tracking-tight">QR Scanner</h2>
                    <p className="text-gray-500 text-xs max-w-[200px] leading-loose">Align the book's QR code to borrow or see details instantly.</p>
                  </div>
                )}

                {tab === 'leaderboard' && (
                  <div className="h-full p-6 pt-10 overflow-y-auto">
                    <div className="flex justify-between items-center mb-1">
                      <div>
                        <h2 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Readers Rank</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Global Standings</p>
                      </div>
                      <div className="bg-amber-100 p-3 rounded-2xl">
                         <Trophy className="text-amber-600" size={24} />
                      </div>
                    </div>

                    {/* Invite Friends Card */}
                    <motion.div 
                      key="invite-card"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 mb-8 p-6 rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-200 dark:shadow-none relative overflow-hidden"
                    >
                      <div className="relative z-10">
                        <h3 className="text-lg font-black mb-1">More Friends, More Fun!</h3>
                        <p className="text-xs text-white/80 mb-6 leading-relaxed">Reading is better with friends. Invite them to join your digital library journey.</p>
                        <button 
                          onClick={handleShare}
                          className="w-full bg-white text-violet-600 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
                        >
                          <Share2 size={16} /> Invite Friends Now
                        </button>
                      </div>
                      <div className="absolute -right-6 -bottom-6 opacity-10">
                        <Share2 size={120} />
                      </div>
                    </motion.div>
                    
                    <div className="space-y-3 pb-24">
                      {[
                        { name: "Rahul Sharma", pts: 420, rank: 1, color: 'bg-amber-400' },
                        { name: "Priya Patel", pts: 385, rank: 2, color: 'bg-zinc-300' },
                        { name: "Amit Kumar", pts: 350, rank: 3, color: 'bg-orange-400' },
                        { name: "Marie Wiedman", pts: 310, rank: 4, color: 'bg-violet-100' },
                      ].map(r => (
                        <div key={r.rank} className={`p-5 rounded-3xl shadow-sm border flex items-center gap-4 transition-all hover:scale-[1.02] ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-50'}`}>
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black ring-4 ring-gray-100 ${r.color} ${r.rank <= 3 ? 'text-white' : 'text-violet-600'}`}>
                            {r.rank === 1 ? <Trophy size={16}/> : r.rank}
                          </div>
                          <div className="flex-1"><p className="text-sm font-black">{r.name}</p></div>
                          <div className="text-violet-600 font-black text-xs">{r.pts} <span className="text-[9px] uppercase opacity-50">pts</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Nav */}
              <div className={`border-t flex justify-around p-4 pb-8 transition-colors duration-500 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-50'}`}>
                {[
                  { id: 'home', icon: BookIcon, label: 'Discover' },
                  { id: 'search', icon: Search, label: 'Library' },
                  { id: 'scan', icon: QrCode, label: 'Scan' },
                  { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
                ].map(item => (
                  <button 
                    key={item.id} 
                    id={`nav-btn-${item.id}`}
                    onClick={() => {
                      setTab(item.id);
                      if (item.id === 'search') setFilterType('all');
                    }} 
                    className={`flex flex-col items-center gap-1.5 relative ${tab === item.id ? 'text-violet-600' : (darkMode ? 'text-zinc-600' : 'text-gray-300')} transition-all`}
                  >
                    <item.icon size={20} strokeWidth={tab === item.id ? 2.5 : 2} />
                    <span className="text-[7px] font-black uppercase tracking-widest">{item.label}</span>
                    {tab === item.id && <motion.div layoutId="nav-pill" className="absolute -bottom-1 w-1 h-1 bg-violet-600 rounded-full" />}
                  </button>
                ))}
              </div>

              {/* Account Menu Modal */}
              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowProfileMenu(false)}
                      className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-[80]"
                    />
                    <motion.div 
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      className={`absolute bottom-0 left-0 right-0 rounded-t-[3rem] p-8 z-[90] ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}
                    >
                      <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-8" />
                      
                      <div className="flex items-center gap-4 mb-10">
                        <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-lg">
                           {profile?.photoUrl ? <img src={profile.photoUrl} className="w-full h-full object-cover" /> : <div className="bg-violet-100 text-violet-600 w-full h-full flex items-center justify-center"><User size={32} /></div>}
                        </div>
                        <div>
                           <h3 className="text-xl font-black">{profile?.displayName}</h3>
                           <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{profile?.email || 'Guest Member'}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <ProfileMenuItem 
                          icon={User} 
                          title="Account Settings" 
                          subtitle="Manage your profile & info"
                          onClick={() => { setShowProfileMenu(false); setActiveOverlay('profile'); }}
                        />
                        <ProfileMenuItem 
                          icon={Bell} 
                          title="Notifications" 
                          subtitle={notifications.some(n => !n.isRead) ? `${notifications.filter(n => !n.isRead).length} New Alerts` : "No new alerts"}
                          subtitleColor={notifications.some(n => !n.isRead) ? "text-violet-600" : "text-gray-400"}
                          onClick={() => { setShowProfileMenu(false); setActiveOverlay('notifications'); }}
                        />
                        <ProfileMenuItem 
                          icon={LogOut} 
                          title="Sign Out" 
                          subtitle="Securely exit your account"
                          subtitleColor="text-red-400"
                          onClick={() => logout()}
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Overlay Details */}
              <AnimatePresence>
                {selectedBook && (
                  <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className={`absolute inset-0 z-[70] ${darkMode ? 'bg-zinc-950' : 'bg-white'}`}>
                    <BookDetailScreen 
                      book={selectedBook} 
                      isIssued={profile?.issuedBookIds?.includes(selectedBook.id)}
                      isReserved={profile?.reservedBookIds?.includes(selectedBook.id)}
                      onBack={() => setSelectedBookId(null)} 
                      onToggleIssue={() => handleToggleIssue(selectedBook.id)} 
                      onToggleReserve={() => handleToggleReserve(selectedBook.id)} 
                    />
                  </motion.div>
                )}

                {activeOverlay === 'profile' && (
                  <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }} className={`absolute inset-0 z-[100] flex flex-col ${darkMode ? 'bg-zinc-950 text-white' : 'bg-white'}`}>
                    <div className="flex-1 overflow-y-auto">
                      <div className={`p-8 pt-16 text-center relative overflow-hidden text-white bg-gradient-to-b from-violet-800 to-violet-600`}>
                        {/* Header Controls inside Hero */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
                          <button 
                            onClick={() => { setActiveOverlay(null); setIsEditingName(false); }} 
                            className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl active:scale-90 transition-transform"
                          >
                            <ArrowBackIosNew size={16}/>
                          </button>

                          {!isEditingName ? (
                            <button 
                              onClick={() => { setIsEditingName(true); setEditedName(profile?.displayName || ''); }} 
                              className="flex items-center gap-2 bg-white text-violet-600 px-4 py-2 rounded-2xl transition-all active:scale-95 shadow-lg"
                            >
                                <Edit size={12} className="text-violet-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => setIsEditingName(false)} className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl text-white/60"><X size={16}/></button>
                              <button 
                                onClick={async () => {
                                  if (editedName.trim() && currentUser) {
                                    await updateUserProfile(currentUser.uid, { displayName: editedName });
                                    setProfile((p: any) => ({ ...p, displayName: editedName }));
                                    setIsEditingName(false);
                                  }
                                }} 
                                className="p-2.5 bg-white text-violet-600 rounded-2xl shadow-xl"
                              >
                                <Check size={16}/>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="relative inline-block mb-6 z-10">
                          <div className="relative">
                            {profile?.photoUrl ? (
                              <img src={profile.photoUrl} className="w-32 h-32 rounded-full object-cover ring-4 ring-white/10 p-1 bg-white/5 shadow-2xl" />
                            ) : (
                              <div className="w-32 h-32 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 ring-4 ring-white/10">
                                <User size={56} />
                              </div>
                            )}
                            <button 
                              onClick={() => setShowAvatarPicker(true)}
                              className="absolute bottom-1 right-1 p-3 bg-white rounded-full shadow-xl active:scale-95 transition-transform"
                            >
                              <CameraIcon size={18} className="text-violet-600" />
                            </button>
                          </div>
                        </div>

                        <div className="z-10 relative">
                          {isEditingName ? (
                            <div className="flex flex-col items-center gap-2">
                              <input 
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center text-xl font-black outline-none focus:border-white transition-all w-64 text-white placeholder-white/30"
                                autoFocus
                                placeholder="Enter Nickname"
                              />
                              <p className="text-[10px] uppercase font-black text-white/60 tracking-widest leading-none mt-2">Personalize your identity</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <h3 className="text-4xl font-black tracking-tight mb-1 leading-tight drop-shadow-sm">{profile?.displayName || 'Reader'}</h3>
                              <p className="text-[10px] uppercase font-black text-white/50 tracking-widest">{profile?.email || 'Guest Reader'}</p>
                            </div>
                          )}
                        </div>

                        {/* Background flare */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                        <div className="absolute top-0 left-0 w-full h-full bg-black/10 pointer-events-none" />
                      </div>

                      <div className="px-6 py-10 space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                          <div className={`p-6 rounded-[2rem] border shadow-sm ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-50'}`}>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Books Read</p>
                             <div className="flex items-center gap-3">
                                <span className="text-2xl font-black">{profile?.issuedBookIds?.length || 0}</span>
                                <Flame className="text-orange-500" size={18} />
                             </div>
                          </div>
                          <div className={`p-6 rounded-[2rem] border shadow-sm ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-50'}`}>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Points</p>
                             <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-violet-600">{profile?.points || 0}</span>
                                <StarIcon className="text-amber-400 fill-amber-400" size={18} />
                             </div>
                          </div>
                        </div>

                        <div className={`rounded-[2rem] p-2 overflow-hidden shadow-sm border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                          <ProfileMenuItem 
                            icon={Library} 
                            title="Reading History" 
                            subtitle={`${profile?.issuedBookIds?.length || 0} Issued Books`}
                            onClick={() => { setActiveOverlay(null); setTab('search'); setFilterType('issued'); }}
                          />
                          <ProfileMenuItem 
                            icon={Bookmark} 
                            title="Saved Favorites" 
                            subtitle={`${profile?.reservedBookIds?.length || 0} Reserved`}
                            onClick={() => { setActiveOverlay(null); setTab('search'); setFilterType('reserved'); }}
                          />
                        </div>

                        <div className={`rounded-[2.5rem] p-6 shadow-sm border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                           <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                {darkMode ? <Moon size={20} className="text-violet-400" /> : <Sun size={20} className="text-amber-500" />}
                                <div>
                                  <p className="text-sm font-black">Appearance</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{darkMode ? 'Dark Side' : 'Light Mode'}</p>
                                </div>
                              </div>
                              <button onClick={() => setDarkMode(!darkMode)} className={`w-14 h-8 rounded-full p-1.5 transition-all duration-300 ${darkMode ? 'bg-violet-600 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-zinc-200'}`}>
                                <motion.div animate={{ x: darkMode ? 24 : 0 }} className="w-5 h-5 bg-white rounded-full shadow-lg" />
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Avatar Picker Modal Simulation */}
                    <AnimatePresence>
                      {showAvatarPicker && (
                        <>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAvatarPicker(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[110]" />
                          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className={`absolute bottom-0 left-0 right-0 p-8 rounded-t-[3rem] z-[120] ${darkMode ? 'bg-zinc-900' : 'bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)]'}`}>
                             <div className="flex justify-between items-center mb-8">
                                <h4 className="text-lg font-black tracking-tight">Update Portrait</h4>
                                <button onClick={() => setShowAvatarPicker(false)} className="p-2 bg-violet-50 dark:bg-violet-900/30 text-violet-600 rounded-full active:scale-90 transition-transform"><X size={16}/></button>
                             </div>
                             
                             <div className="space-y-6">
                               <button 
                                 onClick={handleUpdatePhoto}
                                 className={`w-full flex items-center gap-4 p-4 rounded-3xl border-2 border-dashed ${darkMode ? 'border-zinc-800' : 'border-gray-100'} hover:border-violet-600 transition-all group`}
                               >
                                 <div className="w-12 h-12 bg-violet-50 dark:bg-violet-950 rounded-2xl flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                                    <ImageIcon size={24} />
                                 </div>
                                 <div className="text-left">
                                   <p className="text-sm font-black">Upload from Gallery</p>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Select your own image</p>
                                 </div>
                               </button>

                               <div className="relative flex items-center">
                                  <div className="flex-grow border-t border-gray-100 dark:border-zinc-800"></div>
                                  <span className="flex-shrink mx-4 text-[9px] font-black uppercase text-gray-300">OR CHOOSE AVATAR</span>
                                  <div className="flex-grow border-t border-gray-100 dark:border-zinc-800"></div>
                               </div>

                               <motion.div 
                                 variants={{
                                   hidden: { opacity: 0 },
                                   show: {
                                     opacity: 1,
                                     transition: {
                                       staggerChildren: 0.05
                                     }
                                   }
                                 }}
                                 initial="hidden"
                                 animate="show"
                                 className="grid grid-cols-4 gap-4 px-2"
                               >
                                  {AVATARS.map(url => (
                                    <motion.button 
                                      key={url}
                                      variants={{
                                        hidden: { scale: 0, opacity: 0 },
                                        show: { scale: 1, opacity: 1 }
                                      }}
                                      whileTap={{ scale: 0.9 }}
                                      whileHover={{ y: -5 }}
                                      onClick={async () => {
                                        if (currentUser) {
                                          await updateUserProfile(currentUser.uid, { photoUrl: url });
                                          setProfile((p: any) => ({ ...p, photoUrl: url }));
                                          setShowAvatarPicker(false);
                                        }
                                      }}
                                      className={`aspect-square rounded-full overflow-hidden border-4 transition-all ${profile?.photoUrl === url ? 'border-violet-600 scale-110 shadow-lg shadow-violet-200' : 'border-transparent'}`}
                                    >
                                      <img src={url} className="w-full h-full object-cover bg-violet-50" />
                                    </motion.button>
                                  ))}
                                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { onFileChange(e); setShowAvatarPicker(false); }} />
                               </motion.div>
                             </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {activeOverlay === 'notifications' && (
                  <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }} className={`absolute inset-0 z-[100] overflow-y-auto ${darkMode ? 'bg-zinc-950 text-white' : 'bg-white'}`}>
                    <div className="sticky top-0 p-4 flex items-center gap-4 bg-inherit/80 backdrop-blur-md z-10 border-b border-white/5">
                       <button onClick={() => setActiveOverlay(null)} className="p-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full active:scale-90 transition-transform"><ArrowLeft size={18}/></button>
                       <span className="text-sm font-black uppercase tracking-widest">Notifications</span>
                    </div>
                    <div className="p-6">
                       {notifications.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                           <Bell size={64} className="opacity-10 mb-6" />
                           <p className="text-xs font-bold uppercase tracking-widest text-center">Your notification tray is empty</p>
                         </div>
                       ) : (
                         <div className="space-y-4">
                           {[...notifications].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(n => (
                             <motion.div key={n.id} onClick={() => handleMarkRead(n.id)} className={`p-5 rounded-[2rem] border transition-all ${n.isRead ? (darkMode ? 'bg-zinc-900/40 border-transparent opacity-60' : 'bg-gray-50/50 border-transparent') : (darkMode ? 'bg-zinc-900 border-violet-500/20' : 'bg-white border-violet-100 shadow-sm')}`}>
                                <div className="flex gap-4">
                                   <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${n.type === 'success' ? 'bg-green-100 text-green-600' : n.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-violet-100 text-violet-600'}`}>
                                      {n.type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-center mb-1">
                                         <h4 className="text-sm font-black truncate">{n.title}</h4>
                                         {!n.isRead && <span className="w-2 h-2 bg-violet-600 rounded-full" />}
                                      </div>
                                      <p className="text-xs text-gray-500 mb-2 leading-relaxed">{n.message}</p>
                                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{new Date(n.timestamp).toLocaleTimeString()}</span>
                                   </div>
                                </div>
                             </motion.div>
                           ))}
                         </div>
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Home Indicator */}
        <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1.5 rounded-full ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
        
        {/* Notch realization */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 rounded-b-[1.5rem] z-[100] ${darkMode ? 'bg-zinc-800' : 'bg-zinc-900'}`}>
          <div className="absolute top-2 right-6 w-2 h-2 rounded-full bg-zinc-800 ring-2 ring-zinc-700/50 shadow-inner" />
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ProfileMenuItem({ icon: Icon, title, subtitle, onClick, subtitleColor = "text-gray-400" }: { icon: any; title: string, subtitle?: string, onClick?: () => void, subtitleColor?: string }) {
  return (
    <div onClick={onClick} className="flex items-center gap-4 px-5 py-4 active:bg-gray-100/50 transition-all group cursor-pointer">
      <div className={`p-2.5 rounded-2xl bg-gray-100/30 ring-1 ring-gray-100 group-active:scale-90 transition-transform`}>
        <Icon size={18} className="text-gray-400 group-hover:text-violet-600 transition-colors" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-black">{title}</p>
        {subtitle && <p className={`text-[9px] font-bold uppercase tracking-tight ${subtitleColor}`}>{subtitle}</p>}
      </div>
      <ChevronRight size={16} className="text-gray-200" />
    </div>
  );
}

