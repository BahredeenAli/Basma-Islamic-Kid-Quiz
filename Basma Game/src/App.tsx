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
  { id: 26, question: "የመጀመሪያው የቁርዓን አንቀጽ የወረደው የት ነው?", options: ["ሂራ ዋሻ", "ሰውር ዋሻ", "መካ", "መዲና"], correctAnswer: 0 },
  { id: 27, question: "ቁርዓን በስንት ዓመት ተጠናቀቀ?", options: ["10", "13", "23", "25"], correctAnswer: 2 },
  { id: 28, question: "ከእስልምና ማዕዘናት የመጀመሪያው ምንድነው?", options: ["ሶላት", "ሸሃዳ", "ዘካ", "ሐጅ"], correctAnswer: 1 },
  { id: 29, question: "የነቢዩ ሙሐመድ (ሰ.ዐ.ወ) አባት ማን ይባላሉ?", options: ["አብዱላህ", "አቡ ጣሊብ", "አብዱል ሙጠሊብ", "ሀምዛ"], correctAnswer: 0 },
  { id: 30, question: "በእስልምና ታሪክ የመጀመሪያው መስጂድ የትኛው ነው?", options: ["መስጂደል ሀራም", "መስጂደል ነበዊ", "ቁባ መስጂድ", "አቅሳ"], correctAnswer: 2 },
  { id: 31, question: "ከመላእክት መካከል ዝናብ የማዝነብ ኃላፊነት ያለው ማነው?", options: ["ጂብሪል", "ሚካኤል", "ኢስራፊል", "መሊክ"], correctAnswer: 1 },
  { id: 32, question: "የመጀመሪያው የሙስሊሞች ስደት (ሂጅራ) ወዴት ነበር?", options: ["መዲና", "ሻም", "ሀበሻ", "ግብፅ"], correctAnswer: 2 },
  { id: 33, question: "በቁርዓን ውስጥ ስሙ በብዛት የተጠቀሰው ነቢይ ማነው?", options: ["ኢብራሂም", "ሙሳ", "ኢሳ", "ኑህ"], correctAnswer: 1 },
  { id: 34, question: "የአላህ ወዳጅ (ኸሊሉላህ) የሚል ቅጽል ስም ያለው ነቢይ ማነው?", options: ["ሙሐመድ", "ኢብራሂም", "ሙሳ", "ዩሱፍ"], correctAnswer: 1 },
  { id: 35, question: "ቁርዓን ውስጥ 'የሱራዎች እናት' የምትባለው ሱራ የትኛዋ ናት?", options: ["በቀራ", "ፋቲሃ", "ያሲን", "ኢክላስ"], correctAnswer: 1 },
  { id: 36, question: "ነቢዩ ሙሐመድ (ሰ.ዐ.ወ) ስንት ልጆች ነበሯቸው?", options: ["4", "5", "6", "7"], correctAnswer: 3 },
  { id: 37, question: "የመጀመሪያዋ ሴት ሰሂድ (መስዋዕት) ማን ናት?", options: ["ኸዲጃ", "አሚና", "ሱመያ", "አኢሻ"], correctAnswer: 2 },
  { id: 38, question: "ከአራቱ ታዋቂ ኸሊፋዎች ሁለተኛው ማነው?", options: ["አቡ በክር", "ዑመር", "ዑስማን", "አሊ"], correctAnswer: 1 },
  { id: 39, question: "የዓረፋ ቀን የሚውለው በየትኛው ወር ነው?", options: ["ረመዳን", "ሸዋል", "ዙል ሂጃ", "ሙሃረም"], correctAnswer: 2 },
  { id: 40, question: "የቂያማ ቀን መለከት (ሱር) የሚነፋው መላእክት ማነው?", options: ["ጂብሪል", "ሚካኤል", "አዝራኤል", "ኢስራፊል"], correctAnswer: 3 },
  { id: 41, question: "አምስት ጊዜ ሶላት የተደነገገው በየትኛው ክስተት ነው?", options: ["ሂጅራ", "በድር", "ሚዕራጅ", "ፈትህ መካ"], correctAnswer: 2 },
  { id: 42, question: "ነቢዩ ሙሐመድ (ሰ.ዐ.ወ) ስንት ጊዜ ሐጅ አድርገዋል?", options: ["1", "2", "3", "4"], correctAnswer: 0 },
  { id: 43, question: "ከሶላቶች ሁሉ መጀመሪያ የሚሰገደው የትኛው ነው?", options: ["ዙህር", "አስር", "ሱብሂ", "መግሪብ"], correctAnswer: 2 },
  { id: 44, question: "የቁርዓን ልብ የምትባለው ሱራ የትኛዋ ናት?", options: ["ፋቲሃ", "ያሲን", "ሙልክ", "ራህማን"], correctAnswer: 1 },
  { id: 45, question: "የሰው ልጅ የተፈጠረው ከምንድነው?", options: ["ከእሳት", "ከብርሃን", "ከአፈር", "ከውሃ"], correctAnswer: 2 },
  { id: 46, question: "ጂኒዎች የተፈጠሩት ከምንድነው?", options: ["ከአፈር", "ከእሳት", "ከብርሃን", "ከነፋስ"], correctAnswer: 1 },
  { id: 47, question: "መላእክቶች የተፈጠሩት ከምንድነው?", options: ["ከእሳት", "ከአፈር", "ከብርሃን", "ከውሃ"], correctAnswer: 2 },
  { id: 48, question: "ነቢዩ ኑህ መርከብ ላይ ለስንት ቀናት ቆዩ?", options: ["40", "100", "150", "200"], correctAnswer: 2 },
  { id: 49, question: "የመጀመሪያው የእስልምና ጦርነት የትኛው ነው?", options: ["አሁድ", "በድር", "ኸንደቅ", "ታኢፍ"], correctAnswer: 1 },
  { id: 50, question: "በቁርዓን ውስጥ ያለ 'ቢስሚላህ' የሚጀምረው ሱራ የትኛው ነው?", options: ["ተውባ", "ናስ", "ካፊሩን", "ፊል"], correctAnswer: 0 },
  { id: 51, question: "ዘካ ለማውጣት ግዴታ የሚሆነው ንብረት ምን ይባላል?", options: ["ኒሳብ", "ሰደቃ", "ፊጥራ", "ጂዝያ"], correctAnswer: 0 },
  { id: 52, question: "የነቢዩ ሙሐመድ (ሰ.ዐ.ወ) ዋናው ተአምር ምንድነው?", options: ["ጨረቃን መሰንጠቅ", "ቁርዓን", "ውሃ ማፍለቅ", "ምግብ ማብዛት"], correctAnswer: 1 },
  { id: 53, question: "ሐጅ ማድረግ በዕድሜ ልክ ስንት ጊዜ ግዴታ ነው?", options: ["1", "2", "3", "በየዓመቱ"], correctAnswer: 0 },
  { id: 54, question: "የረመዳን ጾም የተደነገገው በየትኛው የሂጅራ ዓመት ነው?", options: ["1ኛ", "2ኛ", "3ኛ", "4ኛ"], correctAnswer: 1 },
  { id: 55, question: "የመጀመሪያው የሰው ልጅ ነቢይ ማነው?", options: ["ኑህ", "ኢድሪስ", "አደም", "ሸይስ"], correctAnswer: 2 },
  { id: 56, question: "ከነቢያት መካከል መናገር የጀመረው ገና በሕፃንነቱ ማነው?", options: ["ዩሱፍ", "ኢሳ", "ያህያ", "ሙሳ"], correctAnswer: 1 },
  { id: 57, question: "አላህ ለነቢዩ ዳውድ የሰጣቸው መጽሐፍ ስሙ ማን ነው?", options: ["ተውራት", "ኢንጂል", "ዘቡር", "ሱሁፍ"], correctAnswer: 2 },
  { id: 58, question: "ከእስልምና በፊት መካ ውስጥ ይገኝ የነበረው ጣዖት ትልቁ ማነው?", options: ["ላውት", "ዑዛ", "ሁበል", "መናት"], correctAnswer: 2 },
  { id: 59, question: "የነቢዩ ሙሐመድ (ሰ.ዐ.ወ) የልጅ ልጆች እነማን ናቸው?", options: ["አሊና ዑስማን", "ሀሰንና ሁሴን", "ኡመርና አቡበክር", "ዘይድና ፋሲል"], correctAnswer: 1 },
  { id: 60, question: "በመዲና ነቢዩን የተቀበሉ ሰዎች ምን ይባላሉ?", options: ["ሙሃጅር", "አንሳር", "ታቢዒ", "ሰሃባ"], correctAnswer: 1 },
  { id: 61, question: "ነቢዩ ሙሐመድ (ሰ.ዐ.ወ) ስንት ዓመት በነቢይነት ቆዩ?", options: ["10", "13", "23", "40"], correctAnswer: 2 },
  { id: 62, question: "ከአራቱ ታዋቂ ኸሊፋዎች ሦስተኛው ማነው?", options: ["ዑስማን", "አሊ", "ዑመር", "አቡ በክር"], correctAnswer: 0 },
  { id: 63, question: "ቁርዓን ውስጥ ስሙ የተጠቀሰው ብቸኛው ሰሃባ ማነው?", options: ["አቡ በክር", "ዘይድ", "አሊ", "ኡመር"], correctAnswer: 1 },
  { id: 64, question: "የአላህ ሰይፍ (ሰይፉላህ) የሚል ቅጽል ስም ያለው ሰሃባ ማነው?", options: ["ሀምዛ", "ኻሊድ ኢብኑ ወሊድ", "ዑመር", "አሊ"], correctAnswer: 1 },
  { id: 65, question: "በአሁድ ጦርነት ላይ የተሰውት የነቢዩ አጎት ማን ናቸው?", options: ["አቡ ጣሊብ", "ሀምዛ", "አባስ", "አቡ ለሃብ"], correctAnswer: 1 },
  { id: 66, question: "የቁርዓን ትልቁ አንቀጽ (አያት) የትኛው ነው?", options: ["አያተል ኩርሲ", "አያተ ዳይን", "አያተ ኑር", "አያተ ሪባ"], correctAnswer: 1 },
  { id: 67, question: "የመጀመሪያው የቁርዓን ቃል ምንድነው?", options: ["አልሀምዱሊላህ", "ኢቅራእ", "ቢስሚላህ", "ቁል"], correctAnswer: 1 },
  { id: 68, question: "ነቢዩ ሙሐመድ (ሰ.ዐ.ወ) ያረፉት በስንት ዓመታቸው ነው?", options: ["60", "63", "65", "70"], correctAnswer: 1 },
  { id: 69, question: "የጀነት በሮች ስንት ናቸው?", options: ["5", "7", "8", "10"], correctAnswer: 2 },
  { id: 70, question: "የጀሃነም በሮች ስንት ናቸው?", options: ["5", "7", "8", "10"], correctAnswer: 1 },
  { id: 71, question: "ከመላእክት መካከል የጀነት ጠባቂው ማነው?", options: ["መሊክ", "ሪድዋን", "ሙንከር", "ነኪር"], correctAnswer: 1 },
  { id: 72, question: "ከመላእክት መካከል የጀሃነም ጠባቂው ማነው?", options: ["ሪድዋን", "መሊክ", "ራቂብ", "አቲድ"], correctAnswer: 1 },
  { id: 73, question: "የውዱእ ግዴታዎች (አርካን) ስንት ናቸው?", options: ["4", "5", "6", "7"], correctAnswer: 2 },
  { id: 74, question: "የመጀመሪያው የጁሙዓ ሶላት የተሰገደው የት ነው?", options: ["መካ", "መዲና", "ጣኢፍ", "ሀበሻ"], correctAnswer: 1 },
  { id: 75, question: "ከነቢያት መካከል 'ከሊሙላህ' (አላህ ያነጋገረው) የሚባለው ማነው?", options: ["ኢብራሂም", "ሙሳ", "ኢሳ", "ሙሐመድ"], correctAnswer: 1 },
  { id: 76, question: "ነቢዩ ዩኑስ በዓሳ ሆድ ውስጥ ስንት ቀን ቆዩ?", options: ["3", "7", "40", "ያልታወቀ"], correctAnswer: 0 },
  { id: 77, question: "የነቢዩ ሙሐመድ (ሰ.ዐ.ወ) ታናሽ ልጅ ማን ናት?", options: ["ዘይነብ", "ሩቂያ", "ኡሙ ኩልሱም", "ፋጢማ"], correctAnswer: 3 },
  { id: 78, question: "ሰላምታ (አሰላሙ አለይኩም) መስጠት ምንድነው?", options: ["ግዴታ", "ሱና", "ሀራም", "መክሩህ"], correctAnswer: 1 },
  { id: 79, question: "ቁርዓን ውስጥ ስሟ የተጠቀሰ ብቸኛ ሴት ማን ናት?", options: ["ኸዲጃ", "ፋጢማ", "መርየም", "አኢሻ"], correctAnswer: 2 },
  { id: 80, question: "የነቢዩ ሙሐመድ (ሰ.ዐ.ወ) የልደት ቀን መቼ ነው?", options: ["ረቢአል አወል 12", "ረመዳን 27", "ሸዋል 1", "ሙሃረም 10"], correctAnswer: 0 },
  { id: 81, question: "የነቢዩ ሙሐመድ (ሰ.ዐ.ወ) አሳዳጊ እናት ማን ናት?", options: ["አሚና", "ሀሊማ", "ከዲጃ", "ሰውዳ"], correctAnswer: 1 },
  { id: 82, question: "በእስልምና የመጀመሪያው ጦርነት በስንት ሂጅራ ተካሄደ?", options: ["1ኛ", "2ኛ", "3ኛ", "4ኛ"], correctAnswer: 1 },
  { id: 83, question: "የጀነት መክፈቻ ምንድነው?", options: ["ሶላት", "ዘካ", "ላ ኢላሀ ኢለላህ", "ሐጅ"], correctAnswer: 2 },
  { id: 84, question: "በመካ የወረዱ ሱራዎች ምን ይባላሉ?", options: ["መኪይ", "መደኒ", "ቁድሲ", "ሙህካም"], correctAnswer: 0 },
  { id: 85, question: "በመዲና የወረዱ ሱራዎች ምን ይባላሉ?", options: ["መኪይ", "መደኒ", "ቁድሲ", "ሙተሻቢህ"], correctAnswer: 1 },
  { id: 86, question: "ከእስልምና ማዕዘናት አምስተኛው ምንድነው?", options: ["ሶላት", "ዘካ", "ጾም", "ሐጅ"], correctAnswer: 3 },
  { id: 87, question: "አላህ ለነቢዩ ሙሳ የሰጣቸው መጽሐፍ ማን ይባላል?", options: ["ተውራት", "ኢንጂል", "ዘቡር", "ቁርዓን"], correctAnswer: 0 },
  { id: 88, question: "አላህ ለነቢዩ ኢሳ የሰጣቸው መጽሐፍ ማን ይባላል?", options: ["ተውራት", "ኢንጂል", "ዘቡር", "ቁርዓን"], correctAnswer: 1 },
  { id: 89, question: "የቂያማ ምልክቶች በስንት ይከፈላሉ?", options: ["2", "3", "4", "5"], correctAnswer: 0 },
  { id: 90, question: "የመጀመሪያው የእስልምና ወር የትኛው ነው?", options: ["ረመዳን", "ሙሃረም", "ረቢአል አወል", "ሸዋል"], correctAnswer: 1 },
  { id: 91, question: "የቁርዓን ረጅሙ ሱራ ስንት አንቀጾች አሉት?", options: ["114", "200", "286", "300"], correctAnswer: 2 },
  { id: 92, question: "ከመላእክት መካከል የሰው ልጅ ነፍስ የሚወስደው ማነው?", options: ["ሚካኤል", "አዝራኤል", "ጂብሪል", "ኢስራፊል"], correctAnswer: 1 },
  { id: 93, question: "ነቢዩ ሙሐመድ (ሰ.ዐ.ወ) ስንት ጊዜ ዑምራ አድርገዋል?", options: ["1", "2", "3", "4"], correctAnswer: 3 },
  { id: 94, question: "ቁርዓን ውስጥ 'ቢስሚላህ' ሁለት ጊዜ የተጠቀሰበት ሱራ የትኛው ነው?", options: ["ናምል", "በቀራ", "ሁድ", "ዩሱፍ"], correctAnswer: 0 },
  { id: 95, question: "ነቢዩ ሙሳ የከፈሉት ባሕር ስሙ ማን ነው?", options: ["ቀይ ባሕር", "ጥቁር ባሕር", "ሜዲትራኒያን", "ህንድ ውቅያኖስ"], correctAnswer: 0 },
  { id: 96, question: "አስሃቡል ካህፍ (የዋሻው ሰዎች) ለስንት ዓመት ተኙ?", options: ["100", "200", "309", "500"], correctAnswer: 2 },
  { id: 97, question: "ነቢዩ ዩሱፍ የወረወሩበት ቦታ የት ነበር?", options: ["ጉድጓድ", "ባሕር", "በረሃ", "ተራራ"], correctAnswer: 0 },
  { id: 98, question: "የእስልምና መመሪያ መጽሐፍ ማን ይባላል?", options: ["ሀዲስ", "ተውራት", "ቁርዓን", "ኢንጂል"], correctAnswer: 2 },
  { id: 99, question: "የመጀመሪያው የእስልምና ዋና ከተማ የት ነበር?", options: ["መካ", "መዲና", "ኩፋ", "ደማስቆ"], correctAnswer: 1 },
  { id: 100, question: "የእስልምና ሰላምታ ትርጉሙ ምንድነው?", options: ["ደህና ሁን", "ሰላም ለአንተ ይሁን", "እንዴት ነህ", "መልካም ቀን"], correctAnswer: 1 }
];
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
