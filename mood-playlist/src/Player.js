import React, { useState } from 'react';
import axios from 'axios';

function parseMood(text) {
  const t = text.toLowerCase();
  const match = (keywords) => keywords.some(k => t.includes(k));

  let energy = 0.5;
  if (match(['hype','hyped','pumped','fire','lit','turnt','banger','rage','intense','aggressive','powerful','unstoppable','beast','amped','fired up','adrenaline','wild','crazy','insane'])) energy = 0.95;
  else if (match(['workout','gym','run','running','sprint','cardio','lifting','grind','hustle','motivat','push','sweat'])) energy = 0.9;
  else if (match(['party','dance','dancing','club','rave','bounce','groove','vibe','night out','turn up'])) energy = 0.85;
  else if (match(['happy','joy','joyful','excited','elated','ecstatic','euphoric','cheerful','upbeat','bright','sunny','good mood','great mood','amazing','fantastic','wonderful'])) energy = 0.75;
  else if (match(['content','okay','fine','good','chill','relaxed','calm','easy','breezy','laid back','mellow','smooth','cozy','comfortable','soft'])) energy = 0.45;
  else if (match(['tired','sleepy','drowsy','exhausted','drained','burnt out','slow','lazy','groggy','waking up','half asleep','rest','nap'])) energy = 0.25;
  else if (match(['sad','depressed','heartbreak','broken','empty','numb','hollow','devastated','lost','hopeless','grief','grieving','mourning','crying','tears','alone','lonely'])) energy = 0.2;
  else if (match(['anxious','anxiety','nervous','stress','stressed','overwhelmed','panic','worried','uneasy','restless','overthinking','spiraling'])) energy = 0.6;
  else if (match(['nostalgic','nostalgia','memories','remember','old times','throwback','childhood','miss','missing','used to','back when'])) energy = 0.4;
  else if (match(['focus','study','studying','work','working','concentrate','productive','deep work','flow state','reading','coding','writing'])) energy = 0.4;
  else if (match(['night','late night','midnight','3am','2am','insomnia','cant sleep','dark','darkness','alone at night','drive','driving'])) energy = 0.35;
  else if (match(['morning','sunrise','wake up','fresh start','new day','coffee','breakfast'])) energy = 0.55;
  else if (match(['rain','rainy','storm','cloudy','grey','gray','gloomy','overcast','thunder','fog','foggy'])) energy = 0.3;
  else if (match(['summer','beach','sun','sunshine','warm','hot','tropical','vacation','holiday','road trip'])) energy = 0.7;
  else if (match(['winter','cold','snow','snowy','frozen','ice','cozy inside','fireplace','blanket'])) energy = 0.35;
  else if (match(['angry','anger','mad','furious','pissed','frustrated','resentment','rage','bitter','hate'])) energy = 0.88;
  else if (match(['romantic','love','crush','falling in love','in love','date','valentine','intimate','tender','affection','adore'])) energy = 0.5;
  else if (match(['heartbroken','breakup','broke up','ex','moving on','over you','letting go','goodbye','end of us'])) energy = 0.3;
  else if (match(['spiritual','meditat','zen','peaceful','serene','tranquil','mindful','breathe','gratitude','thankful','blessed'])) energy = 0.25;
  else if (match(['adventure','explore','travel','journey','wanderlust','new place','far away','escape','free','freedom'])) energy = 0.7;
  else if (match(['bored','boring','nothing to do','empty','meh','whatever','indifferent','unmotivated'])) energy = 0.35;
  else if (match(['confident','bold','strong','powerful','fearless','unstoppable','determined','ambitious','winning','success'])) energy = 0.8;
  else if (match(['vulnerable','fragile','sensitive','tender','soft','open','raw','honest','real'])) energy = 0.3;

  let valence = 0.5;
  if (match(['happy','joy','joyful','elated','ecstatic','euphoric','cheerful','amazing','fantastic','wonderful','great mood','on top of the world','best day','love life','grateful','blessed','thankful'])) valence = 0.9;
  else if (match(['hype','hyped','pumped','excited','party','dance','turn up','lit','fire','banger','upbeat','positive','good vibes','good mood'])) valence = 0.8;
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
  else if (match(['morning','sunrise','fresh start','new day','coffee'])) valence = 0.6;
  else if (match(['spiritual','meditat','zen','mindful','gratitude','tranquil'])) valence = 0.6;
  else if (match(['adventure','travel','explore','freedom','escape','wanderlust'])) valence = 0.7;
  else if (match(['vulnerable','raw','honest','open','real','sensitive'])) valence = 0.35;

  let danceability = 0.5;
  if (match(['dance','dancing','club','rave','party','bounce','groove','twerk','move','floor'])) danceability = 0.92;
  else if (match(['hype','hyped','banger','lit','turn up','fire','wild','crazy'])) danceability = 0.85;
  else if (match(['happy','upbeat','fun','good vibes','cheerful','excited'])) danceability = 0.75;
  else if (match(['workout','gym','run','cardio','sprint','hustle','grind'])) danceability = 0.7;
  else if (match(['chill','laid back','mellow','smooth','vibe','groove','easy'])) danceability = 0.55;
  else if (match(['romantic','love','slow','tender','intimate','sway'])) danceability = 0.5;
  else if (match(['sad','lonely','heartbreak','cry','tears','broken','depressed','empty'])) danceability = 0.25;
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
  else if (match(['party','dance','club','rave','bounce','banger','lit','fire','turn up'])) tempo = 128;
  else if (match(['happy','upbeat','cheerful','excited','elated','fun','good mood'])) tempo = 120;
  else if (match(['confident','bold','strong','hustle','grind','motivat','ambitious'])) tempo = 115;
  else if (match(['chill','laid back','easy','smooth','mellow','comfortable','content'])) tempo = 95;
  else if (match(['nostalgic','bittersweet','memories','throwback','remember'])) tempo = 88;
  else if (match(['sad','lonely','heartbreak','broken','empty','melancholy','blue'])) tempo = 75;
  else if (match(['depressed','grief','mourning','hopeless','devastated','hollow','numb'])) tempo = 65;
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

  let genres = ['indie'];
  let seed_artists = ['Frank Ocean', 'Daniel Caesar'];

  if (match(['workout','gym','run','cardio','sprint','lifting','sweat','beast','grind'])) {
    genres = ['work-out','hip-hop']; seed_artists = ['Drake','Kendrick Lamar'];
  } else if (match(['hype','pumped','banger','rage','aggressive','intense','fire','lit'])) {
    genres = ['hip-hop','pop']; seed_artists = ['Travis Scott','Kanye West'];
  } else if (match(['party','dance','club','rave','bounce','turn up'])) {
    genres = ['pop','dance']; seed_artists = ['Doja Cat','The Weeknd'];
  } else if (match(['sad','lonely','heartbreak','broken','empty','depressed','grief','hollow','numb','devastated'])) {
    genres = ['sad','indie']; seed_artists = ['Joji','Billie Eilish'];
  } else if (match(['chill','late night','night','midnight','3am','driving','dark','mellow'])) {
    genres = ['chill','r-n-b']; seed_artists = ['Frank Ocean','Joji'];
  } else if (match(['nostalgic','memories','throwback','old times','remember','miss','bittersweet'])) {
    genres = ['indie','soul']; seed_artists = ['Daniel Caesar','Rex Orange County'];
  } else if (match(['focus','study','work','concentrate','reading','coding','flow'])) {
    genres = ['study','chill']; seed_artists = ['Lofi Girl','Nujabes'];
  } else if (match(['sleep','sleepy','rest','nap','calm','peaceful','meditat','zen','serene','tranquil'])) {
    genres = ['sleep','acoustic']; seed_artists = ['Brian Eno','Nils Frahm'];
  } else if (match(['happy','joy','upbeat','cheerful','excited','fun','good mood','positive'])) {
    genres = ['pop','indie']; seed_artists = ['Harry Styles','Rex Orange County'];
  } else if (match(['romantic','love','in love','crush','tender','intimate','date'])) {
    genres = ['r-n-b','soul']; seed_artists = ['Daniel Caesar','H.E.R.'];
  } else if (match(['heartbroken','breakup','broke up','ex','moving on','letting go'])) {
    genres = ['sad','r-n-b']; seed_artists = ['SZA','Frank Ocean'];
  } else if (match(['angry','mad','furious','pissed','frustrated','rage','bitter'])) {
    genres = ['alt-rock','hip-hop']; seed_artists = ['Linkin Park','Kendrick Lamar'];
  } else if (match(['summer','beach','tropical','vacation','holiday','sun','warm'])) {
    genres = ['pop','indie']; seed_artists = ['Harry Styles','Tame Impala'];
  } else if (match(['rain','rainy','storm','gloomy','grey','fog','cold','winter'])) {
    genres = ['indie','acoustic']; seed_artists = ['Bon Iver','Phoebe Bridgers'];
  } else if (match(['morning','sunrise','wake up','fresh start','coffee'])) {
    genres = ['indie','acoustic']; seed_artists = ['John Mayer','Jack Johnson'];
  } else if (match(['spiritual','mindful','gratitude','blessed','zen','breathe'])) {
    genres = ['acoustic','soul']; seed_artists = ['Sufjan Stevens','Nick Drake'];
  } else if (match(['adventure','travel','explore','journey','freedom','wanderlust','road trip'])) {
    genres = ['indie','pop']; seed_artists = ['Tame Impala','Arctic Monkeys'];
  } else if (match(['confident','bold','winning','success','powerful','fearless','ambitious'])) {
    genres = ['hip-hop','pop']; seed_artists = ['Beyoncé','Jay-Z'];
  } else if (match(['anxious','stress','overwhelmed','worried','panic','overthinking'])) {
    genres = ['chill','indie']; seed_artists = ['Bon Iver','Novo Amor'];
  } else if (match(['vulnerable','raw','sensitive','open','honest','real'])) {
    genres = ['indie','acoustic']; seed_artists = ['Phoebe Bridgers','Elliott Smith'];
  }

  return { valence, energy, danceability, tempo, genres, seed_artists };
}

async function getLikedTracks(token) {
  const res = await axios.get('https://api.spotify.com/v1/me/tracks', {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit: 50 }
  });
  return res.data.items.map(i => i.track);
}

function Player({ token }) {
  const [mood, setMood] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState('catalog');
  const [detectedMood, setDetectedMood] = useState(null);

  const handleGenerate = async () => {
    if (!mood.trim()) return;
    setLoading(true);
    setError('');
    setTracks([]);

    try {
      const features = parseMood(mood);
      setDetectedMood(features);

      let results = [];

      if (source === 'liked') {
        const liked = await getLikedTracks(token);
        const shuffled = liked.sort(() => Math.random() - 0.5);
        results = shuffled.slice(0, 10);
      } else {
        const artistResults = await Promise.all(
          features.seed_artists.slice(0, 3).map(async (name) => {
            const res = await axios.get('https://api.spotify.com/v1/search', {
              headers: { Authorization: `Bearer ${token}` },
              params: { q: `artist:${name}`, type: 'track', limit: 5 }
            });
            return res.data.tracks?.items || [];
          })
        );

        const genreResults = await Promise.all(
          features.genres.slice(0, 2).map(async (genre) => {
            const res = await axios.get('https://api.spotify.com/v1/search', {
              headers: { Authorization: `Bearer ${token}` },
              params: { q: `genre:${genre}`, type: 'track', limit: 5 }
            });
            return res.data.tracks?.items || [];
          })
        );

        const all = [...artistResults.flat(), ...genreResults.flat()];
        const seen = new Set();
        const unique = all.filter(t => {
          if (seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        });
        results = unique.sort(() => Math.random() - 0.5).slice(0, 10);
      }

      setTracks(results);
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Check your Spotify credentials and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="player">
      <h1>🎵 Mood Playlist</h1>

      <div className="source-toggle">
        <button className={source === 'catalog' ? 'active' : ''} onClick={() => setSource('catalog')}>Spotify Catalog</button>
        <button className={source === 'liked' ? 'active' : ''} onClick={() => setSource('liked')}>My Liked Songs</button>
      </div>

      <div className="mood-input">
        <textarea
          value={mood}
          onChange={e => setMood(e.target.value)}
          placeholder="Describe your mood... e.g. 'late night driving, nostalgic and a little lonely'"
          rows={3}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); }}}
        />
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Finding tracks...' : 'Generate Playlist'}
        </button>
      </div>

      {detectedMood && !loading && tracks.length > 0 && (
        <div className="mood-tags">
          <span>⚡ Energy: {Math.round(detectedMood.energy * 100)}%</span>
          <span>😊 Mood: {Math.round(detectedMood.valence * 100)}%</span>
          <span>💃 Dance: {Math.round(detectedMood.danceability * 100)}%</span>
          <span>🎵 {detectedMood.genres[0]}</span>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {tracks.length > 0 && (
        <div className="tracks">
          {tracks.map((track) => (
            <div className="track" key={track.id}>
              <img src={track.album?.images?.[2]?.url} alt={track.album?.name} />
              <div className="track-info">
                <p className="track-name">{track.name}</p>
                <p className="track-artist">{track.artists?.map(a => a.name).join(', ')}</p>
              </div>
              {track.preview_url && (
                <audio controls src={track.preview_url} />
              )}
              <a href={track.external_urls?.spotify} target="_blank" rel="noreferrer">▶</a>
            </div>
          ))}
          <div className="open-hint">Click ▶ on any track to open it in Spotify and add to a playlist</div>
        </div>
      )}
    </div>
  );
}

export default Player;