

const CONFIG = {
  friend: 'Abhir',     
  me: 'Ananya',        
};

const F = CONFIG.friend;
const ME = CONFIG.me;


const SCENES = {
  intro: [
    { who: 'narrator', text: `Somebody left a little path out here, just for you, ${F}.` },
    { who: 'narrator', text: `Walk with W A S D (or the arrow keys). When a chat box pops up, press SPACE to keep going.` },
    { who: 'boy', text: `A quiet path, soft grass, no deadlines. Okay... let's walk for a bit.` },
    { who: 'ananya', text: `Hey ${F}! Wait up! Did you really think I'd let you walk this path alone?` },
    { who: 'boy', text: `Ananya?! You're here? But... you live in a different city!` },
    { who: 'ananya', text: `CODING MAGICC  Distance has no power in this game because I decide what to do LOL I'm walking right beside you, all the way.` },
  ],

  pond: [
    { who: 'boy', text: `A lotus pond! My favourite flower, just sitting there looking calm.` },
    { who: 'lotus', text: `We grow out of muddy water, you know and we still open up clean and bright.` },
    { who: 'lotus', text: `The mud does not define you because It's only where you're growing from, the mud is your beginning. Take your time, ${F}.` },
    { who: 'ananya', text: `See? Even the flower says there's no rush and I'm not going anywhere either.` },
  ],

  trig: [
    { who: 'boy', text: `Wait... is that a maths teacher? In the middle of a forest? My school stress just woke up.` },
    { who: 'trig', text: `Relax, I'm Miss Sine and I'm off duty! no tests or homework and ofcourse no crashouts... hehe.` },
    { who: 'ananya', text: `Careful, ${F}. She tells puns. Nobody has ever survived them.` },
    { who: 'trig', text: `Why was the obtuse angle always upset? Because it was never right! ...Get it? Right?... No?.... I'll show myself out.` },
    { who: 'trig', text: `Okay, serious now. Life is a sine wave, ${F}. Today you're in the slope but no wave in history ever stayed down.` },
    { who: 'trig', text: `Remember SOH-CAH-TOA? Some Odd Hours Can Always Turn Out Alright LOL I made that up just now II consider this my best work.` },
    { who: 'trig', text: `I won't ask you to solve for X today solve for "how am I doing?" instead Rest first, then try again.` },
    { who: 'ananya', text: `Fun fact (you already know... but firbhi) in tan, there's an "adjacent side" that's always right next to you. That's me. Miss Sine approved this HEHE.` },
    { who: 'trig', text: `Approved! You two make a perfect pair as bestfriends!. No problem is too tricky with the right company  Now now Off you go, shoo shoo!` },
  ],

  peacock: [
    { who: 'boy', text: `Whoa... a peacock!` },
    { who: 'peacock', text: `Kyaaa! Do you know why I dance when the clouds roll in?` },
    { who: 'peacock', text: `Because I don't wait for a perfect sky. I open every colour I have anyway. You have so many colours too.` },
    { who: 'ananya', text: `Show them every single one, ${F}. I've seen them all and they're my favourites!!.` },
  ],

  ila: [
    { who: 'boy', text: `Is that... Ilaiyaraaja? Humming a raga in the middle of the path?` },
    { who: 'ila', text: `Vaa, vaa, kanna. Come, sit with the music for a moment.` },
    { who: 'ila', text: `Every raga has a sad note because the song needs it. Without it, the happy notes would not mean as much.` },
    { who: 'ila', text: `Today is a sad note, that's all The song has not been completed yet Keep walking, the next lyric is already coming` },
    { who: 'ananya', text: `Badme Sunna, theeke? Who knows someone from bollywood might hear it and steal it again LOL.` },
  ],

  raj: [
    { who: 'boy', text: `And now... sunglasses and style. It's Rajinikanth!` },
    { who: 'raj', text: `Kanna, listen. Every hero has a bad interval. The film is not over.` },
    { who: 'raj', text: `And no hero carries the whole movie alone. There is always someone in the seat next to him.` },
    { who: 'raj', text: `Yours is waiting at the end of this road. Go. Walk with style!` },
    { who: 'ananya', text: `Pssst. That "someone in the seat next to him"? That's me like Obviously, Now walk with style!` },
  ],

  house: [
    { who: 'ananya', text: `We made it! Go on, ${F}. The letter is from me.` },
    { who: 'boy', text: `A little house at the end of the road... and the mailbox is glowing.` },
    { who: 'narrator', text: `Something is waiting inside. Click the mailbox to open it.` },
  ],
};

const LETTER = {
  title: `Dear ${F},`,
  paras: [
    `I heard school has been heavy lately, and that a few things happened that knocked the air out of you. I'm not going to say anything like "it's nothing" or "just cheer up", because it may be difficult, and you don't have to cheer up for anyone. You're allowed to be sad and to be tired. You're allowed to not be okay for a while.`,
    `But please hear this, loud enough to travel all the way from my city to yours that marks, results and rough weeks do not define you and I don't know yet what has happened in school and how hard it must be for you but I will say that you can talk to me about whatever and whenever even when it's 4am because I have my notifications on for you so I will wake up fatafat and message you back. You are the person who loves everything deeply and sees the good in everything, even in days and people that haven't earned it and no fights or anything can change that. It is the rarest thing about you.`,
    `Remember the lotus? It grows out of muddy water and still opens up clean and beautiful because the mud isn't a sign that something is wrong with you, it's just where you're growing from and right now you're in the mud part. The bloom part is coming, and I'll be there for it, being annoyingly loud about how proud I am of you and that I knew you would succeed even while facing hardships.`,
    `And the peacock, it doesn't wait for a perfect sky, It spreads every colour it has right as the clouds gather in the bright sky, Abhir you have so many colours, ${F}. Don't let one bad season talk you into folding them away.`,
    `So here's my suggestion ( i hate making suggestions because I don't know what the other is facing and it would just make me look like an obnoxious person)- do something you enjoy even listening to music or watching movies with your mom or alone if you feel like it and Eat something warm  Dance in your room, you're the best dancer I know, even the walls will clap. Then watch a ridiculous romcom. I'll watch it with you over a call if you want, ofcourse while studying because im so shit in academics right now i need my comeback HELPP.`,
    `And send me a voice note. Sing, hum, rant, cry, do whatever you want and you feel like doing, not only the happy ones. You've sent me so many ragas and rants, let me be the one who listens to you again.`,
    `You don't have to carry this alone kyuki me hu na LOL  and that's what I'm here for, and I'm not going anywhere even if you don't want to talk to me. distance can't do a damn thing about that.`,
  ],
  sign: `Forever your bestfriend,<br>${ME} ♥`,
  ps: `P.S. The pixel boy walks slowly for a reason because there's no rush HEHE Take your time Abhir.`,
};