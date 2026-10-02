// Expanded mood parsing dictionary with audio feature targets, preset pills, and dynamic color themes

export const PRESET_MOODS = [
  { label: '⚡ Hype Gym', text: 'high energy workout gym pumped fire banger', icon: '⚡' },
  { label: '🌙 3 AM Driving', text: 'late night driving midnight nostalgic lonely ambient', icon: '🌙' },
  { label: '☕ Morning Coffee', text: 'fresh morning coffee acoustic sunny peaceful', icon: '☕' },
  { label: '🌧️ Rainy Chill', text: 'rainy gloomy cozy lo-fi slow chill', icon: '🌧️' },
  { label: '💖 Romantic Vibe', text: 'romantic love sweet r&b intimate cozy', icon: '💖' },
  { label: '🔥 Party Banger', text: 'party bangers house music club rap fetty wap indian item songs chikni chameli fevicol se bollywood Punjabi edm', icon: '🔥' },
  { label: '🧠 ADHD Study', text: 'adhd study brown noise ambient nature sounds river wind rain peaceful quiet', icon: '🧠' },
  { label: '💔 Heartbreak', text: 'sad heartbroken crying acoustic bittersweet empty', icon: '💔' },
];

export function parseMood(text) {
  const t = text.toLowerCase();
  const match = (keywords) => keywords.some(k => t.includes(k));

  let energy = 0.5;
  if (match(['hype','hyped','pumped','fire','lit','turnt','banger','rage','intense','aggressive','powerful','unstoppable','beast','amped','fired up','adrenaline','wild','crazy','insane'])) energy = 0.95;
  else if (match(['workout','gym','run','running','sprint','cardio','lifting','grind','hustle','motivat','push','sweat'])) energy = 0.9;
  else if (match(['party','dance','dancing','club','rave','bounce','groove','vibe','night out','turn up','house music'])) energy = 0.88;
  else if (match(['happy','joy','joyful','excited','elated','ecstatic','euphoric','cheerful','upbeat','bright','sunny','good mood','great mood','amazing','fantastic','wonderful'])) energy = 0.75;
  else if (match(['content','okay','fine','good','chill','relaxed','calm','easy','breezy','laid back','mellow','smooth','cozy','comfortable','soft'])) energy = 0.45;
  else if (match(['tired','sleepy','drowsy','exhausted','drained','burnt out','slow','lazy','groggy','waking up','half asleep','rest','nap'])) energy = 0.25;
  else if (match(['sad','depressed','heartbreak','broken','empty','numb','hollow','devastated','lost','hopeless','grief','grieving','mourning','crying','tears','alone','lonely'])) energy = 0.2;
  else if (match(['anxious','anxiety','nervous','stress','stressed','overwhelmed','panic','worried','uneasy','restless','overthinking','spiraling'])) energy = 0.6;
  else if (match(['nostalgic','nostalgia','memories','remember','old times','throwback','childhood','miss','missing','used to','back when'])) energy = 0.4;
  else if (match(['adhd','brown noise','green noise','pink noise','nature sounds','river','wind','nature','peaceful and quiet','soundscape','ambient noise'])) energy = 0.15;
  else if (match(['focus','study','studying','work','working','concentrate','productive','deep work','flow state','reading','coding','writing'])) energy = 0.35;
  else if (match(['night','late night','midnight','3am','2am','insomnia','cant sleep','dark','darkness','alone at night','drive','driving'])) energy = 0.35;
  else if (match(['morning','sunrise','wake up','fresh start','new day','coffee','breakfast'])) energy = 0.55;
  else if (match(['rain','rainy','storm','cloudy','grey','gray','gloomy','overcast','thunder','fog','foggy'])) energy = 0.3;
  else if (match(['summer','beach','sun','sunshine','warm','hot','tropical','vacation','holiday','road trip'])) energy = 0.7;
  else if (match(['winter','cold','snow','snowy','frozen','ice','cozy inside','fireplace','blanket'])) energy = 0.35;
  else if (match(['angry','anger','mad','furious','pissed','frustrated','resentment','rage','bitter','hate'])) energy = 0.88;
  else if (match(['romantic','love','crush','falling in love','in love','date','valentine','intimate','tender','affection','adore'])) energy = 0.5;
  else if (match(['heartbroken','breakup','broke up','ex','moving on','letting go','goodbye','end of us'])) energy = 0.3;
  else if (match(['spiritual','meditat','zen','peaceful','serene','tranquil','mindful','breathe','gratitude','thankful','blessed'])) energy = 0.25;
  else if (match(['adventure','explore','travel','journey','freedom','wanderlust','new place','far away','escape','free','freedom'])) energy = 0.7;
  else if (match(['bored','boring','nothing to do','empty','meh','whatever','indifferent','unmotivated'])) energy = 0.35;
  else if (match(['confident','bold','strong','powerful','fearless','unstoppable','determined','ambitious','winning','success'])) energy = 0.8;
  else if (match(['vulnerable','fragile','sensitive','tender','soft','open','raw','honest','real'])) energy = 0.3;

  let valence = 0.5;
  if (match(['happy','joy','joyful','elated','ecstatic','euphoric','cheerful','amazing','fantastic','wonderful','great mood','on top of the world','best day','love life','grateful','blessed','thankful'])) valence = 0.9;
  else if (match(['hype','hyped','pumped','excited','party','dance','turn up','lit','fire','banger','upbeat','positive','good vibes','good mood','house music'])) valence = 0.8;
  else if (match(['content','okay','fine','good','chill','smooth','comfortable','peaceful','calm','cozy','serene','easy'])) valence = 0.65;
  else if (match(['nostalgic','bittersweet','memories','remember','old times','miss','missing','throwback','used to'])) valence = 0.45;
  else if (match(['focus','study','work','productive','concentrate','flow state','neutral','indifferent','meh','bored'])) valence = 0.45;
  else if (match(['anxious','nervous','stress','stressed','overwhelmed','worried','uneasy','restless','overthinking','panic'])) valence = 0.35;
  else if (match(['tired','exhausted','drained','burnt out','slow','groggy','sleepy'])) valence = 0.35;
  else if (match(['sad','blue','down','unhappy','upset','melancholy','gloomy','heartbreak','lonely','alone','lost','empty','numb'])) valence = 0.2;
  else if (match(['depressed','hopeless','devastated','broken','grief','mourning','crying','tears','hollow','dark'])) valence = 0.1;
  else if (match(['angry','mad','furious','pissed','frustrated','bitter','hate','rage','resentment'])) valence = 0.15;
  else if (match(['romantic','love','in love','falling in love','crush','tender','intimate','affection','adore'])) valence = 0.75;
  else if (match(['heartbroken','breakup','broke up','ex','moving on','letting go','goodbye'])) valence = 0.2;
  else if (match(['confident','bold','strong','fearless','winning','success','ambitious','determined'])) valence = 0.75;
  else if (match(['summer','beach','sun','vacation','holiday','road trip','tropical','warm'])) valence = 0.8;
  else if (match(['rain','rainy','storm','cloudy','grey','gloomy','cold','winter','fog'])) valence = 0.3;
  else if (match(['night','late night','midnight','dark','alone at night','driving'])) valence = 0.35;
  else if (match(['morning','sunrise','wake up','fresh start','new day','coffee'])) valence = 0.6;
  else if (match(['spiritual','meditat','zen','mindful','gratitude','tranquil'])) valence = 0.6;
  else if (match(['adventure','travel','explore','freedom','escape','wanderlust'])) valence = 0.7;
  else if (match(['vulnerable','raw','honest','open','real','sensitive'])) valence = 0.35;

  let danceability = 0.5;
  if (match(['dance','dancing','club','rave','party','bounce','groove','twerk','move','floor','house music','banger','fetty wap'])) danceability = 0.92;
  else if (match(['hype','hyped','banger','lit','turn up','fire','wild','crazy'])) danceability = 0.85;
  else if (match(['happy','upbeat','fun','good vibes','cheerful','excited'])) danceability = 0.75;
  else if (match(['workout','gym','run','cardio','sprint','hustle','grind'])) danceability = 0.7;
  else if (match(['chill','laid back','mellow','smooth','vibe','groove','easy'])) danceability = 0.55;
  else if (match(['romantic','love','slow','tender','intimate','sway'])) danceability = 0.5;
  else if (match(['sad','lonely','heartbreak','cry','tears','broken','depressed','empty'])) danceability = 0.25;
  else if (match(['adhd','brown noise','nature sounds','river','wind','ambient'])) danceability = 0.1;
  else if (match(['focus','study','work','concentrate','reading','coding','writing','flow'])) danceability = 0.35;
  else if (match(['sleep','sleepy','rest','nap','tired','drained','calm','peaceful','meditat','zen'])) danceability = 0.2;
  else if (match(['angry','rage','aggressive','intense','furious','pissed'])) danceability = 0.6;
  else if (match(['night','late night','driving','midnight','dark'])) danceability = 0.45;
  else if (match(['nostalgic','memories','throwback','old times'])) danceability = 0.5;
  else if (match(['summer','beach','tropical','vacation','holiday'])) danceability = 0.78;
  else if (match(['rain','storm','gloomy','cold','winter','fog'])) danceability = 0.3;
  else if (match(['confident','bold','winning','success','powerful'])) danceability = 0.7;

  let tempo = 110;
  if (match(['hype','hyped','pumped','sprint','intense','aggressive','rage','wild','crazy','fastest','fast paced'])) tempo = 165;
  else if (match(['workout','gym','run','running','cardio','lifting','sweat','beast'])) tempo = 155;
  else if (match(['party','dance','club','rave','bounce','banger','lit','fire','turn up','house music'])) tempo = 128;
  else if (match(['happy','upbeat','cheerful','excited','elated','fun','good mood'])) tempo = 120;
  else if (match(['confident','bold','strong','hustle','grind','motivat','ambitious'])) tempo = 115;
  else if (match(['chill','laid back','easy','smooth','mellow','comfortable','content'])) tempo = 95;
  else if (match(['nostalgic','bittersweet','memories','throwback','remember'])) tempo = 88;
  else if (match(['sad','lonely','heartbreak','broken','empty','melancholy','blue'])) tempo = 75;
  else if (match(['depressed','grief','mourning','hopeless','devastated','hollow','numb'])) tempo = 65;
  else if (match(['adhd','brown noise','green noise','nature sounds','river','wind'])) tempo = 60;
  else if (match(['focus','study','work','concentrate','reading','coding','flow state'])) tempo = 90;
  else if (match(['sleep','sleepy','rest','nap','drained','exhausted','calm','peaceful'])) tempo = 60;
  else if (match(['night','late night','midnight','3am','2am','driving','dark'])) tempo = 80;
  else if (match(['morning','sunrise','wake up','fresh start','coffee'])) tempo = 100;
  else if (match(['rain','rainy','storm','gloomy','grey','fog','cold'])) tempo = 72;
  else if (match(['summer','beach','tropical','vacation','road trip','sun'])) tempo = 118;
  else if (match(['angry','mad','furious','pissed','rage','bitter'])) tempo = 145;
  else if (match(['romantic','love','tender','intimate','slow dance'])) tempo = 78;
  else if (match(['spiritual','meditat','zen','mindful','tranquil','serene'])) tempo = 60;
  else if (match(['adventure','explore','travel','journey','freedom'])) tempo = 108;
  else if (match(['anxious','stress','overwhelmed','panic','overthinking','restless'])) tempo = 125;

  let acousticness = 0.2;
  if (match(['acoustic', 'piano', 'coffee', 'unplugged', 'folk', 'guitar', 'morning'])) acousticness = 0.85;
  else if (match(['adhd', 'brown noise', 'ambient', 'nature', 'river', 'wind', 'rain', 'meditat', 'sleep'])) acousticness = 0.9;
  else if (match(['sad', 'heartbreak', 'lonely', 'crying'])) acousticness = 0.65;
  else if (match(['party', 'club', 'banger', 'house', 'edm', 'hype', 'gym'])) acousticness = 0.05;

  let instrumentalness = 0.0;
  if (match(['adhd', 'brown noise', 'green noise', 'pink noise', 'nature sounds', 'river', 'wind', 'nature', 'soundscape', 'binaural'])) instrumentalness = 0.92;
  else if (match(['ambient', 'sleep', 'drone', 'study', 'focus', 'instrumental'])) instrumentalness = 0.75;

  let genres = ['indie'];
  let seed_artists = ['Frank Ocean', 'Daniel Caesar'];

  if (match(['workout','gym','run','cardio','sprint','lifting','sweat','beast','grind'])) {
    genres = ['hip-hop','rock','electronic']; seed_artists = ['Drake','Kendrick Lamar','Travis Scott','Eminem'];
  } else if (match(['hype','pumped','banger','rage','aggressive','intense','fire','lit'])) {
    genres = ['hip-hop','pop','rock']; seed_artists = ['Travis Scott','Kanye West','Playboi Carti'];
  } else if (match(['party','dance','club','rave','bounce','turn up','banger','bangers','house','house music','item song','item songs','chikni chameli','fevicol se','munni badnaam','sheila ki jawani','fetty wap','club music','rap','edm'])) {
    genres = ['house','dance','hip-hop','edm','desi']; seed_artists = ['Fetty Wap','Sunidhi Chauhan','Pritam','Badshah','Yo Yo Honey Singh','David Guetta','Fisher','Travis Scott','Calvin Harris','Pitbull'];
  } else if (match(['sad','lonely','heartbreak','broken','empty','depressed','grief','hollow','numb','devastated'])) {
    genres = ['sad','indie','acoustic']; seed_artists = ['Joji','Billie Eilish','Conan Gray'];
  } else if (match(['chill','late night','night','midnight','3am','driving','dark','mellow'])) {
    genres = ['chill','r-n-b','ambient']; seed_artists = ['Frank Ocean','Joji','SZA'];
  } else if (match(['nostalgic','memories','throwback','old times','remember','miss','bittersweet'])) {
    genres = ['indie','soul','rock']; seed_artists = ['Daniel Caesar','Rex Orange County','Tame Impala'];
  } else if (match(['adhd','brown noise','green noise','pink noise','white noise','nature sounds','river','wind','nature','peaceful and quiet','soundscape','ambient noise'])) {
    genres = ['ambient','sleep','study']; seed_artists = ['Brown Noise','Nature Sounds','Sleepy John','Ambient Soundscapes'];
  } else if (match(['focus','study','work','concentrate','reading','coding','flow'])) {
    genres = ['study','ambient','lo-fi']; seed_artists = ['Lofi Girl','Nujabes','Tycho'];
  } else if (match(['sleep','sleepy','rest','nap','calm','peaceful','meditat','zen','serene','tranquil'])) {
    genres = ['ambient','sleep','acoustic']; seed_artists = ['Brian Eno','Nils Frahm','Ludovico Einaudi'];
  } else if (match(['happy','joy','upbeat','cheerful','excited','fun','good mood','positive'])) {
    genres = ['pop','indie']; seed_artists = ['Harry Styles','Rex Orange County','Lizzo'];
  } else if (match(['romantic','love','in love','crush','tender','intimate','date'])) {
    genres = ['r-n-b','soul']; seed_artists = ['Daniel Caesar','H.E.R.','Giveon'];
  } else if (match(['heartbroken','breakup','broke up','ex','moving on','letting go'])) {
    genres = ['sad','r-n-b']; seed_artists = ['SZA','Frank Ocean','Olivia Rodrigo'];
  } else if (match(['angry','mad','furious','pissed','frustrated','rage','bitter'])) {
    genres = ['rock','hip-hop','metal']; seed_artists = ['Linkin Park','Kendrick Lamar','Rage Against The Machine'];
  } else if (match(['summer','beach','tropical','vacation','holiday','sun','warm'])) {
    genres = ['pop','indie','reggae']; seed_artists = ['Harry Styles','Tame Impala','Calvin Harris'];
  } else if (match(['rain','rainy','storm','gloomy','grey','fog','cold','winter'])) {
    genres = ['indie','acoustic','folk']; seed_artists = ['Bon Iver','Phoebe Bridgers','Taylor Swift'];
  } else if (match(['morning','sunrise','wake up','fresh start','coffee'])) {
    genres = ['acoustic','indie']; seed_artists = ['John Mayer','Jack Johnson','Norah Jones'];
  } else if (match(['spiritual','mindful','gratitude','blessed','zen','breathe'])) {
    genres = ['acoustic','ambient']; seed_artists = ['Sufjan Stevens','Nick Drake','Kitaro'];
  } else if (match(['adventure','travel','explore','journey','freedom','wanderlust','road trip'])) {
    genres = ['indie','rock','pop']; seed_artists = ['Tame Impala','Arctic Monkeys','The Lumineers'];
  } else if (match(['confident','bold','winning','success','powerful','fearless','ambitious'])) {
    genres = ['hip-hop','pop']; seed_artists = ['Beyoncé','Jay-Z','Rihanna'];
  } else if (match(['anxious','stress','overwhelmed','worried','panic','overthinking'])) {
    genres = ['ambient','chill','indie']; seed_artists = ['Bon Iver','Novo Amor','Kiasmos'];
  } else if (match(['vulnerable','raw','sensitive','open','honest','real'])) {
    genres = ['indie','acoustic']; seed_artists = ['Phoebe Bridgers','Elliott Smith','Julien Baker'];
  }

  let themeGradient = 'linear-gradient(135deg, rgba(29, 185, 84, 0.15), rgba(18, 18, 18, 0.95))';
  let accentColor = '#1db954';

  if (energy > 0.8) {
    themeGradient = 'radial-gradient(circle at top right, rgba(255, 75, 43, 0.25), rgba(255, 65, 108, 0.15), #0a0a0c)';
    accentColor = '#ff4b2b';
  } else if (energy < 0.35 && valence < 0.4) {
    themeGradient = 'radial-gradient(circle at top right, rgba(74, 144, 226, 0.25), rgba(41, 128, 185, 0.15), #0a0a0c)';
    accentColor = '#4a90e2';
  } else if (valence > 0.7) {
    themeGradient = 'radial-gradient(circle at top right, rgba(241, 196, 15, 0.25), rgba(29, 185, 84, 0.15), #0a0a0c)';
    accentColor = '#f1c40f';
  } else if (match(['night','late night','midnight','3am','driving','dark'])) {
    themeGradient = 'radial-gradient(circle at top right, rgba(142, 68, 173, 0.25), rgba(44, 62, 80, 0.15), #0a0a0c)';
    accentColor = '#9b59b6';
  } else if (match(['romantic','love','crush'])) {
    themeGradient = 'radial-gradient(circle at top right, rgba(235, 47, 6, 0.25), rgba(255, 121, 121, 0.15), #0a0a0c)';
    accentColor = '#ff7979';
  } else {
    themeGradient = 'radial-gradient(circle at top right, rgba(29, 185, 84, 0.25), rgba(30, 215, 96, 0.1), #0a0a0c)';
    accentColor = '#1db954';
  }

  return { valence, energy, danceability, acousticness, instrumentalness, tempo, genres, seed_artists, themeGradient, accentColor };
}
