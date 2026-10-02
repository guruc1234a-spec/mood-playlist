import axios from 'axios';

// Get Gemini API Key from env or localStorage
export function getGeminiApiKey() {
  return localStorage.getItem('gemini_api_key') || process.env.REACT_APP_GEMINI_API_KEY || '';
}

export function setGeminiApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem('gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('gemini_api_key');
  }
}

/**
 * Ask Google Gemini to analyze mood and generate fresh, non-repetitive song recommendations.
 */
export async function getAiRecommendations({
  prompt,
  userTaste,
  count = 10,
  source = 'recommended',
  discoveryLevel = 'balanced',
  excludedArtists = [],
  sessionHistory = [],
}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  // Get current local time context
  const now = new Date();
  const hours = now.getHours();
  let timeOfDay = 'Night';
  if (hours >= 5 && hours < 12) timeOfDay = 'Morning';
  else if (hours >= 12 && hours < 17) timeOfDay = 'Afternoon';
  else if (hours >= 17 && hours < 21) timeOfDay = 'Evening';
  else if (hours >= 21 || hours < 5) timeOfDay = 'Late Night';

  // Randomly shuffle library artists to ensure variety on each request
  const shuffledFrequent = [...(userTaste?.frequentArtists || [])].sort(() => Math.random() - 0.5);
  const shuffledOnRepeat = [...(userTaste?.onRepeatTracks || [])].sort(() => Math.random() - 0.5);
  const shuffledAllTime = [...(userTaste?.allTimeArtists || userTaste?.topArtists || [])].sort(() => Math.random() - 0.5);

  const onRepeat = shuffledOnRepeat.slice(0, 15).map(t => `"${t.name}" by ${t.artists?.map(a => a.name).join(', ')}`).join('\n  - ');
  const frequentArtists = shuffledFrequent.slice(0, 15).map(a => a.name).join(', ');
  const allTimeArtists = shuffledAllTime.slice(0, 15).map(a => a.name).join(', ');
  const recentTracks = (userTaste?.recentlyPlayedTracks || []).slice(0, 10).map(t => `"${t.name}" by ${t.artists?.map(a => a.name).join(', ')}`).join('\n  - ');
  const topGenres = (userTaste?.genres || []).slice(0, 12).join(', ');
  const allLibraryArtists = (userTaste?.artists || []).slice(0, 25).map(a => a.name).join(', ');

  const systemInstruction = `You are an elite, highly creative music curator and DJ known for discovering fresh, deep, non-repetitive tracks.
Your task is to recommend exactly ${count} real, high-quality songs matching the user's mood and taste.
Output MUST be raw valid JSON ONLY, matching this schema:
{
  "vibeTitle": "Short aesthetic title for this vibe (3-5 words)",
  "vibeDescription": "1-2 sentence description of the vibe",
  "accentColor": "A CSS hex color code that visually matches this mood (e.g. #ff4b2b for hype, #9b59b6 for late night, #4a90e2 for sad/rainy)",
  "energy": 0.0 to 1.0,
  "valence": 0.0 to 1.0,
  "songs": [
    {
      "title": "Exact Official Song Title",
      "artist": "Primary Artist Name",
      "reason": "Short 1-sentence reason why this matches the vibe & user's taste"
    }
  ]
}`;

  let discoveryInstruction = '';
  if (discoveryLevel === 'comfort') {
    discoveryInstruction = 'DISCOVERY MODE: COMFORT ZONE. Prioritize favorite rotation artists, but explore diverse tracks from their catalog (not just their #1 most famous single).';
  } else if (discoveryLevel === 'discovery') {
    discoveryInstruction = 'DISCOVERY MODE: DEEP DISCOVERY. Recommend lesser-known hidden gems, side-projects, B-sides, and fresh indie/underground artists sharing the user\'s sonic DNA.';
  } else {
    discoveryInstruction = 'DISCOVERY MODE: BALANCED MIX. Provide a dynamic blend of album cuts from favorite artists and exciting new artist discoveries.';
  }

  let contextPrompt = `User's requested mood: "${prompt}"
Context: Time of day is ${timeOfDay} (${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).
${discoveryInstruction}\n`;

  if (excludedArtists.length > 0) {
    contextPrompt += `EXCLUDED ARTISTS (DO NOT RECOMMEND): ${excludedArtists.join(', ')}\n`;
  }

  if (sessionHistory.length > 0) {
    contextPrompt += `ALREADY PLAYED/SEEN RECENTLY (DO NOT REPEAT THESE SONGS):
${sessionHistory.slice(-25).map(s => `- "${s}"`).join('\n')}\n`;
  }

  if (source === 'recommended') {
    contextPrompt += `User's Spotify Music Profile:
🔥 CURRENT ON-REPEAT ROTATION (Actively looping):
  - ${onRepeat || 'Various active tracks'}

⭐ FREQUENTLY PLAYED ARTISTS:
  - ${frequentArtists || allLibraryArtists || 'Various artists'}

👑 ALL-TIME TOP ARTISTS:
  - ${allTimeArtists || 'Various'}

🎧 RECENT SESSIONS:
  - ${recentTracks || 'Various tracks'}

🏷️ GENRES IN ROTATION:
  - ${topGenres || 'Various genres'}

RULES FOR FRESH & ACCURATE RECOMMENDATIONS:
1. STRICT VIBE ACCURACY:
   - If the mood is "Party Banger" or party/club/dance/hype: Recommend ONLY high-energy House music, Party Rap/Hip-Hop (e.g. Fetty Wap, Travis Scott, Drake, 21 Savage), EDM/Club bangers (e.g. Fisher, David Guetta, Calvin Harris), and Indian/Bollywood/Punjabi item songs & party hits (e.g. Badshah, Honey Singh, Diljit Dosanjh, Karan Aujla). STRICTLY ZERO sad, melancholic, slow, or acoustic songs!
   - If the mood is "ADHD Study" or brown noise/nature/ambient: Recommend ONLY authentic Brown Noise tracks, green noise, ambient nature soundscapes (river streams, mountain wind, forest rain), binaural beats, and peaceful quiet ambient music. STRICTLY ZERO pop, rap, or vocal tracks!
2. NEVER be repetitive or predictable. Avoid only picking the single most overplayed Billboard hit by an artist.
3. DO NOT recommend meme songs, random TikTok remixes, or low-quality noise unless explicitly asked.
4. Recommend only real, officially released songs/soundscapes on Spotify.`;
  } else {
    contextPrompt += `RULES FOR FRESH & ACCURATE RECOMMENDATIONS:
1. STRICT VIBE ACCURACY:
   - If the mood is "Party Banger" or party/club/dance: Recommend ONLY House music, Party Rap (e.g. Fetty Wap, Travis Scott), EDM bangers, and Indian/Bollywood/Punjabi item songs & party hits. ZERO sad or slow songs!
   - If the mood is "ADHD Study" or brown noise/ambient: Recommend ONLY authentic Brown Noise, green noise, ambient nature soundscapes (river, wind, rain, forest), and peaceful quiet drones. ZERO pop or rap songs!
2. Recommend top-tier, diverse songs across real genres matching the vibe with great variation.
3. DO NOT recommend meme songs, random TikTok remixes, or low-quality noise.`;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: `${systemInstruction}\n\n${contextPrompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.88, // Increased temperature for much higher variety & fresh non-repetitive tracks
      topP: 0.95,
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await axios.post(endpoint, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) throw new Error('No response from Gemini API');

    const parsed = JSON.parse(candidate);
    return parsed;
  } catch (error) {
    console.error('Gemini API Error:', error?.response?.data || error.message);
    if (error?.response?.status === 400 || error?.response?.status === 403) {
      throw new Error('Invalid Gemini API Key or quota exceeded. Please check your key.');
    }
    throw error;
  }
}
