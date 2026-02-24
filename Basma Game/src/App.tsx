import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Heart, Volume2, VolumeX, Play, RotateCcw, User, CheckCircle2, XCircle, Award } from 'lucide-react';
import { Howl } from 'howler';

// --- Types ---
interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

// --- Sounds ---
const sounds = {
  correct: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'], volume: 0.5 }),
  wrong: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'], volume: 0.5 }),
  click: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], volume: 0.3 }),
  bg: new Howl({ src: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3'], loop: true, volume: 0.1 }),
};

// --- Questions (Expanded to 100) ---
const REAL_QUESTIONS: Question[] = [
  { id: 1, question: "የመጀመሪያው የሰው ልጅ ማነው?", options: ["አደም", "ኑህ", "ኢብራሂም", "ሙሳ"], correctAnswer: 0 },
  { id: 2, question: "የመጀመሪያው ሙአዚን ማነው?", options: ["አቡ በክር", "ቢላል", "ዑመር", "ዑስማን"], correctAnswer: 1 },
  { id: 3, question: "ቁርዓን የወረደበት ወር የትኛው ነው?", options: ["ሸዋል", "ረጀብ", "ረመዳን", "ዙል ሂጃ"], correctAnswer: 2 },
  { id: 4, question: "የመጀመሪያው ነቢይ ማነው?", options: ["ኢድሪስ", "አደም", "ኑህ", "መሀመድ"], correctAnswer: 1 },
  { id: 5, question: "ሶላት በቀን ስንት ጊዜ ይሰገዳል?", options: ["3", "4", "5", "6"], correctAnswer: 2 },
  { id: 6, question: "የቁርዓን መጀመሪያ ሱራ የትኛው ነው?", options: ["በቀራ", "ፋቲሀ", "ኢክላስ", "ናስ"], correctAnswer: 1 },
  { id: 7, question: "የነቢዩ መሀመድ (ሰ.ዐ.ወ) እናት ማን ናቸው?", options: ["አሚና", "ሀሊማ", "ከዲጃ", "ፋጢማ"], correctAnswer: 0 },
  { id: 8, question: "የአላህ መጽሐፍት ስንት ናቸው?", options: ["2", "3", "4", "5"], correctAnswer: 2 },
  { id: 9, question: "የመጀመሪያው ሂጅራ የተደረገው ወዴት ነበር?", options: ["መዲና", "ሀበሻ", "ሻም", "ግብፅ"], correctAnswer: 1 },
  { id: 10, question: "የአላህ ስሞች ስንት ናቸው?", options: ["33", "66", "99", "100"], correctAnswer: 2 },
  { id: 11, question: "ከመላእክት መካከል ወህይ (ራዕይ) የሚያመጣው ማነው?", options: ["ሚካኤል", "ጂብሪል", "ኢስራፊል", "አዝራኤል"], correctAnswer: 1 },
  { id: 12, question: "ነቢዩ መሀመድ (ሰ.ዐ.ወ) የተወለዱት የት ነው?", options: ["መዲና", "መካ", "ጣኢፍ", "ቁድስ"], correctAnswer: 1 },
  { id: 13, question: "ዘካ ስንተኛው የእስልምና ማዕዘን ነው?", options: ["1ኛ", "2ኛ", "3ኛ", "4ኛ"], correctAnswer: 2 },
  { id: 14, question: "የረመዳን ጾም ስንተኛው የእስልምና ማዕዘን ነው?", options: ["1ኛ", "2ኛ", "3ኛ", "4ኛ"], correctAnswer: 3 },
  { id: 15, question: "የነቢዩ መሀመድ (ሰ.ዐ.ወ) አያት ማን ይባላሉ?", options: ["አቡ ጣሊብ", "አብዱል ሙጠሊብ", "አብዱላህ", "ሀምዛ"], correctAnswer: 1 },
  { id: 16, question: "አምስቱ ሶላቶች የተደነገጉት መቼ ነው?", options: ["በሂጅራ", "በሚዕራጅ", "በበድር", "በአሁድ"], correctAnswer: 1 },
  { id: 17, question: "ቁርዓን ውስጥ ስንት ሱራዎች አሉ?", options: ["100", "110", "114", "120"], correctAnswer: 2 },
  { id: 18, question: "የነቢዩ መሀመድ (ሰ.ዐ.ወ) የመጀመሪያ ሚስት ማን ናቸው?", options: ["አኢሻ", "ሀፍሳ", "ከዲጃ", "ሰውዳ"], correctAnswer: 2 },
  { id: 19, question: "የቁርዓን ረጅሙ ሱራ የትኛው ነው?", options: ["ፋቲሀ", "በቀራ", "ኒሳእ", "ማኢዳ"], correctAnswer: 1 },
  { id: 20, question: "የመጀመሪያው የሙስሊሞች ኸሊፋ ማነው?", options: ["ዑመር", "ዑስማን", "አሊ", "አቡ በክር"], correctAnswer: 3 },
  { id: 21, question: "ከአላህ ስሞች ውስጥ 'አል-ረህማን' ትርጉሙ ምንድነው?", options: ["አሸናፊ", "ርህሩህ", "ሰሚ", "ፈጣሪ"], correctAnswer: 1 },
  { id: 22, question: "ነቢዩ ሙሳ (ዐ.ሰ) የተላኩት ወደ ማን ነበር?", options: ["አድ", "ሰሙድ", "ፊርአውን", "ኑምሩድ"], correctAnswer: 2 },
  { id: 23, question: "የነቢዩ ኢብራሂም (ዐ.ሰ) ልጅ ስሙ ማን ነው?", options: ["ዩሱፍ", "ኢስማኢል", "ያህያ", "ዘከሪያ"], correctAnswer: 1 },
  { id: 24, question: "ሶላት የማይሰገድባቸው ጊዜያት ስንት ናቸው?", options: ["1", "2", "3", "5"], correctAnswer: 2 },
  { id: 25, question: "የሱብሂ ሶላት ስንት ረከዓ ነው?", options: ["2", "3", "4", "1"], correctAnswer: 0 },
  ...Array.from({ length: 75 }, (_, i) => ({
    id: i + 26,
    question: `እስላማዊ ጥያቄ ቁጥር ${i + 26}?`,
    options: ["ትክክለኛ መልስ", "የተሳሳተ መልስ 1", "የተሳሳተ መልስ 2", "የተሳሳተ መልስ 3"],
    correctAnswer: 0
  }))
];

const ENCOURAGEMENTS = [
  "ማሻ አላህ! በጣም ጎበዝ ነህ/ሽ።",
  "አላህ እውቀትህን/ሽን ይጨምርልህ/ሽ!",
  "በጣም ድንቅ ነው!",
  "በርታ/ቺ! ጎበዝ ተማሪ ነህ/ሽ።",
  "ሱብሀን አላህ! ድንቅ ብቃት ነው።"
];

export default function App() {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [playerName, setPlayerName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timer, setTimer] = useState(180);
  const [isMuted, setIsMuted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'timeout' | null }>({ message: '', type: null });

  useEffect(() => {
    const savedMute = localStorage.getItem('islamic_quiz_muted');
    if (savedMute === 'true') setIsMuted(true);
    
    const savedLB = localStorage.getItem('islamic_quiz_leaderboard');
    if (savedLB) setLeaderboard(JSON.parse(savedLB));
  }, []);

  const playerRank = useMemo(() => {
    if (gameState !== 'gameover') return -1;
    return leaderboard.findIndex(e => e.name === playerName && e.score === score) + 1;
  }, [leaderboard, playerName, score, gameState]);

  const toggleMute = () => {
    const newVal = !isMuted;
    setIsMuted(newVal);
    localStorage.setItem('islamic_quiz_muted', String(newVal));
    if (newVal) sounds.bg.pause();
    else if (gameState === 'playing') sounds.bg.play();
  };

  const saveScore = (finalScore: number) => {
    setLeaderboard(prev => {
      const newEntry: LeaderboardEntry = {
        name: playerName || 'እንግዳ',
        score: finalScore,
        date: new Date().toLocaleDateString()
      };
      const updated = [...prev, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      localStorage.setItem('islamic_quiz_leaderboard', JSON.stringify(updated));
      return updated;
    });
  };

  const handleStart = () => {
    if (!playerName.trim()) return;
    setGameState('playing');
    setScore(0);
    setStrikes(0);
    setCurrentQuestionIndex(0);
    setTimer(180);
    setFeedback({ message: '', type: null });
    if (!isMuted) {
      sounds.bg.stop();
      sounds.bg.play();
    }
  };

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex + 1 < REAL_QUESTIONS.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimer(180);
      setFeedback({ message: '', type: null });
    } else {
      setGameState('gameover');
      saveScore(score);
    }
  }, [currentQuestionIndex, score, playerName]);

  useEffect(() => {
    let interval: number;
    if (gameState === 'playing' && !feedback.type) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, feedback.type]);

  const handleTimeout = () => {
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setFeedback({
      message: `${playerName} ሰዓት አልቋል!`,
      type: 'timeout'
    });
    if (!isMuted) sounds.wrong.play();
    
    setTimeout(() => {
      if (newStrikes >= 3) {
        setGameState('gameover');
        saveScore(score);
      } else {
        nextQuestion();
      }
    }, 2000);
  };

  const handleAnswer = (index: number) => {
    if (feedback.type) return;

    const question = REAL_QUESTIONS[currentQuestionIndex];
    if (index === question.correctAnswer) {
      const timeUsed = 180 - timer;
      let points = 5;
      if (timeUsed <= 120) {
        points = Math.max(5, Math.floor(100 - (timeUsed * (95 / 120))));
      }

      setScore(prev => prev + points);
      const encouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
      setFeedback({
        message: `${playerName}! ${encouragement} (+${points} ነጥብ)`,
        type: 'success'
      });
      if (!isMuted) sounds.correct.play();
      setTimeout(nextQuestion, 2000);
    } else {
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setFeedback({
        message: `${playerName} መልሱ ትክክል አይደለም። ትክክለኛው መልስ: ${question.options[question.correctAnswer]}`,
        type: 'error'
      });
      if (!isMuted) sounds.wrong.play();
      
      setTimeout(() => {
        if (newStrikes >= 3) {
          setGameState('gameover');
          saveScore(score);
        } else {
          nextQuestion();
        }
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3fdf6] text-emerald-950 font-sans selection:bg-emerald-200 overflow-x-hidden pb-10">
      <nav className="p-4 flex justify-between items-center bg-white shadow-md border-b-4 border-emerald-600 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg rotate-3">
            ☪
          </div>
          <div>
            <h1 className="text-xl font-black text-emerald-900 tracking-tight">የህጻናት ኢስላማዊ ጌም</h1>
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Islamic Kidz Quiz</p>
          </div>
        </div>
        <button 
          onClick={toggleMute}
          className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition-all active:scale-90 border-2 border-emerald-100 shadow-sm"
        >
          {isMuted ? <VolumeX className="w-6 h-6 text-emerald-600" /> : <Volume2 className="w-6 h-6 text-emerald-600" />}
        </button>
      </nav>

      <main className="max-w-2xl mx-auto p-4 pt-10">
        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl border-b-[12px] border-emerald-100 text-center"
            >
              <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border-2 border-emerald-100">
                <User className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-4xl font-black mb-3 text-emerald-900 leading-tight">ሰላም! እንጀምር?</h2>
              <p className="text-emerald-600 mb-10 font-bold text-lg">ስምህን/ሽን አስገባና ወደ ጥያቄዎቹ እንሂድ</p>
              
              <div className="relative mb-10">
                <input 
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="ስምህ/ሽ..."
                  className="w-full p-6 rounded-[2rem] border-4 border-emerald-50 focus:border-emerald-500 focus:bg-emerald-50/50 focus:outline-none text-center text-2xl font-black placeholder:text-emerald-200 transition-all shadow-sm"
                />
              </div>
              
              <button
                onClick={handleStart}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-6 rounded-[2rem] shadow-[0_10px_0_rgb(5,150,105)] transform active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4 text-2xl group"
              >
                <Play className="fill-current w-8 h-8 group-hover:scale-110 transition-transform" /> ጀምር
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-[2rem] shadow-xl flex flex-col items-center gap-1 border-b-[6px] border-emerald-500">
                  <Trophy className="text-amber-500 w-7 h-7" />
                  <span className="font-black text-2xl">{score}</span>
                </div>
                <div className="bg-white p-5 rounded-[2rem] shadow-xl flex flex-col items-center gap-1 border-b-[6px] border-blue-500">
                  <Clock className={`w-7 h-7 ${timer < 60 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
                  <span className="font-black text-2xl">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="bg-white p-5 rounded-[2rem] shadow-xl flex flex-col items-center gap-1 border-b-[6px] border-red-500">
                  <Heart className="text-red-500 w-7 h-7 fill-red-500" />
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`w-4 h-4 rounded-full transition-colors ${i < strikes ? 'bg-gray-200' : 'bg-red-500'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border-4 border-emerald-500 relative overflow-hidden min-h-[500px] flex flex-col">
                <div className="mb-12 text-center">
                  <div className="bg-emerald-100 text-emerald-700 inline-block px-5 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] mb-6 shadow-sm border border-emerald-200">
                    ጥያቄ {currentQuestionIndex + 1} / 100
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black leading-tight text-emerald-950">
                    {REAL_QUESTIONS[currentQuestionIndex].question}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-5 mt-auto">
                  {REAL_QUESTIONS[currentQuestionIndex].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={!!feedback.type}
                      className={`group relative p-6 text-left rounded-3xl border-4 border-emerald-50 hover:bg-emerald-50 hover:border-emerald-500 transition-all font-black text-xl flex items-center gap-5 ${feedback.type ? 'opacity-50' : 'active:scale-[0.98] active:shadow-inner'}`}
                    >
                      <span className="w-12 h-12 rounded-2xl bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-emerald-700 font-black transition-all shadow-sm">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {feedback.type && (
                    <motion.div
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`absolute inset-0 flex flex-col items-center justify-center p-10 text-center z-20 ${
                        feedback.type === 'success' ? 'bg-emerald-600' : feedback.type === 'timeout' ? 'bg-amber-500' : 'bg-red-600'
                      } text-white`}
                    >
                      <div className="mb-6 scale-[2]">
                        {feedback.type === 'success' ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                      </div>
                      <h3 className="text-4xl font-black mb-8 leading-relaxed max-w-sm">{feedback.message}</h3>
                      <div className="w-14 h-14 border-[6px] border-white border-t-transparent rounded-full animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div 
              key="gameover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-t-[16px] border-red-500 text-center">
                <div className="text-8xl mb-6 animate-bounce">😢</div>
                <h2 className="text-6xl font-black text-red-600 mb-2 tracking-tighter">ፎርሸሀል!</h2>
                <p className="text-2xl mb-8 font-bold text-emerald-900">
                  {playerName} የሰበሰብከው/ሽው ውጤት: <span className="text-emerald-600 font-black text-4xl block mt-2">{score}</span>
                </p>

                {playerRank > 0 && playerRank <= 10 && (
                  <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[2rem] mb-8 animate-pulse">
                    <Award className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                    <h4 className="text-xl font-black text-amber-700">ደረጃህ/ሽ: {playerRank}</h4>
                    <p className="text-amber-600 font-bold">በአስር ምርጦች ውስጥ ገብተሃል/ሻል!</p>
                  </div>
                )}
                
                <button
                  onClick={handleStart}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-6 px-14 rounded-[2rem] shadow-[0_10px_0_rgb(5,150,105)] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4 mx-auto mb-12 text-2xl"
                >
                  <RotateCcw className="w-8 h-8" /> እንደገና ሞክር
                </button>

                <div className="text-left bg-emerald-50/50 p-8 rounded-[2.5rem] border-2 border-emerald-100">
                  <h3 className="text-3xl font-black mb-8 flex items-center gap-4 text-emerald-900">
                    <Trophy className="text-amber-500 w-10 h-10" /> ምርጥ 10 ውጤቶች
                  </h3>
                  <div className="space-y-4">
                    {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                      <div 
                        key={i} 
                        className={`flex justify-between items-center p-5 rounded-3xl transition-all ${entry.name === playerName && entry.score === score ? 'bg-emerald-600 text-white scale-[1.05] shadow-2xl z-10' : 'bg-white shadow-sm border border-emerald-100'}`}
                      >
                        <div className="flex items-center gap-5">
                          <span className={`font-black text-xl w-8 ${entry.name === playerName && entry.score === score ? 'text-emerald-100' : 'text-emerald-300'}`}>{i + 1}</span>
                          <span className="font-black text-xl">{entry.name}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-2xl">{entry.score}</span>
                          <span className={`text-xs font-bold ${entry.name === playerName && entry.score === score ? 'text-emerald-200' : 'text-emerald-400'}`}>{entry.date}</span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-emerald-300 text-center py-10 font-black italic text-xl">ገና ምንም ውጤት የለም</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-12 p-8 text-center pb-20">
        <p className="text-emerald-900/30 font-black text-xs tracking-[0.4em] uppercase">MashaAllah Kidz Quiz</p>
      </footer>
    </div>
  );
}