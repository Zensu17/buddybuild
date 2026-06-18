import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Music, 
  Wind, 
  Sliders, 
  CloudRain, 
  Flame, 
  Coffee, 
  Trees,
  Compass,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SoundTrack {
  id: string;
  name: string;
  description: string;
  iconType: 'cozy' | 'rain' | 'cafe' | 'forest' | 'space';
  chords: number[][];
  tempo: number; // Interval in ms
  instrument: 'rhodes' | 'fm-glass' | 'ambient-pad' | 'kalimba' | 'cosmic-pad';
  themeColor: string; // Tailwind class coloring
  accentHex: string; // For canvas ripples and highlights
  defaultMix: {
    rain: number;
    fire: number;
    cafe: number;
    birds: number;
    melody: number;
  };
  hasDrums?: boolean;
}

const ACCENT_TRACKS: SoundTrack[] = [
  {
    id: 'lofi-cozy',
    name: 'Cozy Study Lofi',
    description: 'Petikan Rhodes hangat dengan vibrato retro & hangatnya kayu perapian.',
    iconType: 'cozy',
    chords: [
      [196.00, 246.94, 293.66, 349.23], // Gmaj7 (G3, B3, D4, F#4)
      [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
      [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
      [220.00, 261.63, 329.63, 392.00]  // Am7 (A3, C4, E4, G4)
    ],
    tempo: 5000,
    instrument: 'rhodes',
    themeColor: 'amber',
    accentHex: '#f59e0b',
    defaultMix: { rain: 10, fire: 75, cafe: 0, birds: 5, melody: 80 },
    hasDrums: true
  },
  {
    id: 'lofi-rain',
    name: 'Rainy Night Lofi',
    description: 'Chords minor sendu lambat dipadu derasnya air hujan malam hari.',
    iconType: 'rain',
    chords: [
      [220.00, 261.63, 329.63, 392.00], // Am7
      [146.83, 174.61, 220.00, 261.63], // Dm7
      [164.81, 196.00, 246.94, 293.66], // Em7
      [174.61, 220.00, 261.63, 329.63]  // Fmaj7
    ],
    tempo: 6000,
    instrument: 'ambient-pad',
    themeColor: 'blue',
    accentHex: '#3b82f6',
    defaultMix: { rain: 85, fire: 0, cafe: 0, birds: 0, melody: 75 },
    hasDrums: false
  },
  {
    id: 'lofi-nostalgia',
    name: 'Nostalgic Cafe Beats',
    description: 'Lekukan jazz e-piano berpadu gemerincing cangkir kopi kafe klasik.',
    iconType: 'cafe',
    chords: [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [164.81, 207.65, 246.94, 311.13], // E7
      [220.00, 261.63, 329.63, 392.00]  // Am7
    ],
    tempo: 4200,
    instrument: 'fm-glass',
    themeColor: 'orange',
    accentHex: '#ea580c',
    defaultMix: { rain: 15, fire: 0, cafe: 80, birds: 0, melody: 80 },
    hasDrums: true
  },
  {
    id: 'lofi-forest',
    name: 'Zen Forest Sanctuary',
    description: 'Indahnya plucking Kalimba murni ditemani siulan burung liar hutan alami.',
    iconType: 'forest',
    chords: [
      [196.00, 293.66, 392.00, 440.00], // Gsus2/4
      [220.00, 329.63, 440.00, 493.88], // Asus2/4
      [293.66, 392.00, 440.00, 587.33], // Dsus2/4
      [196.00, 293.66, 392.00, 440.00]  // Gsus2/4
    ],
    tempo: 7500,
    instrument: 'kalimba',
    themeColor: 'emerald',
    accentHex: '#10b981',
    defaultMix: { rain: 0, fire: 15, cafe: 0, birds: 85, melody: 65 },
    hasDrums: false
  },
  {
    id: 'binaural-cosmic',
    name: 'Cosmic Alpha Space',
    description: 'Gelombang binaural (8Hz perbedaan) melayang di angkasa luar untuk fokus terdalam.',
    iconType: 'space',
    chords: [
      [110.00, 165.00, 220.00, 330.00], // A2, E3, A3, E4 (Deep resonant fifths)
      [130.81, 196.00, 261.63, 392.00], // C3, G3, C4, G4
      [146.83, 220.00, 293.66, 440.00]  // D3, A3, D4, A4
    ],
    tempo: 8500,
    instrument: 'cosmic-pad',
    themeColor: 'purple',
    accentHex: '#af52de',
    defaultMix: { rain: 0, fire: 0, cafe: 0, birds: 0, melody: 85 },
    hasDrums: false
  },
  {
    id: 'lofi-vintage',
    name: 'Vintage Vinyl Study',
    description: 'Chords piano akustik jadul berpadu kresek kaset tape & lofi boom-bap beat mantap.',
    iconType: 'cafe',
    chords: [
      [146.83, 174.61, 220.00, 261.63], // Dm7
      [196.00, 246.94, 293.66, 349.23], // Gmaj7
      [261.63, 311.13, 392.00, 466.16], // Cm7
      [164.81, 196.00, 246.94, 293.66]  // Em7
    ],
    tempo: 4800,
    instrument: 'rhodes',
    themeColor: 'teal',
    accentHex: '#0d9488',
    defaultMix: { rain: 25, fire: 20, cafe: 15, birds: 0, melody: 78 },
    hasDrums: true
  }
];

interface QuickMixPreset {
  name: string;
  icon: string;
  description: string;
  mix: {
    melody: number;
    rain: number;
    fire: number;
    cafe: number;
    birds: number;
  };
}

const QUICK_PRESETS: QuickMixPreset[] = [
  {
    name: '🎯 Fokus Cerdas',
    icon: '🧠',
    description: 'Dominan instrumen dengan sedikit perapian kayu untuk konsentrasi belajar',
    mix: { melody: 85, rain: 0, fire: 50, cafe: 0, birds: 10 }
  },
  {
    name: '🌲 Meditasi Zen',
    icon: '🧘',
    description: 'Gemercik burung dan alunan instrumen murni bernapas dalam alam',
    mix: { melody: 55, rain: 15, fire: 0, cafe: 0, birds: 85 }
  },
  {
    name: '☕ Sore Santai',
    icon: '☕',
    description: 'Kehangatan obrolan kafe dibalur melodi yang menyejukkan',
    mix: { melody: 75, rain: 5, fire: 15, cafe: 70, birds: 0 }
  },
  {
    name: '🌧️ Fokus Hujan',
    icon: '🌧️',
    description: 'Derasnya air hujan meredam kebisingan luar untuk kenyamanan penuh',
    mix: { melody: 50, rain: 85, fire: 10, cafe: 0, birds: 0 }
  },
  {
    name: '🔇 Matikan Ambient',
    icon: '🎧',
    description: 'Hanya memainkan instrumen murni tanpa latar kebisingan alam',
    mix: { melody: 90, rain: 0, fire: 0, cafe: 0, birds: 0 }
  }
];

interface ParticleRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}


const convertToEmbedUrl = (inputUrl: string): { platform: 'youtube' | 'spotify' | 'soundcloud' | null, embedUrl: string } => {
  const trimmed = inputUrl.trim();
  
  // Is it already iframe?
  if (trimmed.startsWith('<iframe')) {
    const srcMatch = trimmed.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      const src = srcMatch[1];
      if (src.includes('youtube')) return { platform: 'youtube', embedUrl: src };
      if (src.includes('spotify')) return { platform: 'spotify', embedUrl: src };
      if (src.includes('soundcloud')) return { platform: 'soundcloud', embedUrl: src };
    }
  }

  // YouTube Shorts
  if (trimmed.includes('youtube.com/shorts/')) {
    const id = trimmed.split('youtube.com/shorts/')[1]?.split('?')[0];
    if (id) return { platform: 'youtube', embedUrl: `https://www.youtube.com/embed/${id}` };
  }

  // YouTube watch links (handles both parameters or straight watch links)
  if (trimmed.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(trimmed);
      const v = urlObj.searchParams.get('v');
      if (v) return { platform: 'youtube', embedUrl: `https://www.youtube.com/embed/${v}` };
    } catch (_) {}
  }
  if (trimmed.includes('youtu.be/')) {
    const id = trimmed.split('youtu.be/')[1]?.split('?')[0];
    if (id) return { platform: 'youtube', embedUrl: `https://www.youtube.com/embed/${id}` };
  }
  if (trimmed.includes('youtube.com/embed/')) {
    return { platform: 'youtube', embedUrl: trimmed };
  }
  if (trimmed.includes('youtube.com/live/')) {
    const id = trimmed.split('youtube.com/live/')[1]?.split('?')[0];
    if (id) return { platform: 'youtube', embedUrl: `https://www.youtube.com/embed/${id}` };
  }

  // Spotify (always convert standard open.spotify.com URLs to open.spotify.com/embed/ structure)
  if (trimmed.includes('spotify.com/')) {
    if (trimmed.includes('spotify.com/embed/')) {
      return { platform: 'spotify', embedUrl: trimmed };
    }
    const cleanUrl = trimmed.replace('open.spotify.com/', 'open.spotify.com/embed/');
    return { platform: 'spotify', embedUrl: cleanUrl };
  }

  // SoundCloud
  if (trimmed.includes('soundcloud.com/')) {
    if (trimmed.includes('w.soundcloud.com/player')) {
      return { platform: 'soundcloud', embedUrl: trimmed };
    }
    const encoded = encodeURIComponent(trimmed);
    return { platform: 'soundcloud', embedUrl: `https://w.soundcloud.com/player/?url=${encoded}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true` };
  }

  return { platform: null, embedUrl: trimmed };
};

export const ZenSoundPlayer = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [showMixer, setShowMixer] = useState(false);

  // Volatility Mixers (0-100)
  const [melodyVolume, setMelodyVolume] = useState(80);
  const [rainVolume, setRainVolume] = useState(15);
  const [fireVolume, setFireVolume] = useState(70);
  const [cafeVolume, setCafeVolume] = useState(10);
  const [birdsVolume, setBirdsVolume] = useState(10);
  const [drumVolume, setDrumVolume] = useState(45);

  // External Music Platforms States
  const [playerMode, setPlayerMode] = useState<'synth' | 'external'>('synth');
  const [currentExternalUrl, setCurrentExternalUrl] = useState<string>('https://www.youtube.com/embed/X4VbdwhkE10');
  const [externalPlatform, setExternalPlatform] = useState<'youtube' | 'spotify' | 'soundcloud'>('youtube');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [customError, setCustomError] = useState<string>('');

  // Web Audio Contexts & Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const melodyGainRef = useRef<GainNode | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const fireGainRef = useRef<GainNode | null>(null);
  const cafeGainRef = useRef<GainNode | null>(null);
  const birdsGainRef = useRef<GainNode | null>(null);

  // Sequencer States & Logic Helpers
  const chordIndexRef = useRef(0);
  const trackIndexRef = useRef(currentTrackIndex);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<ParticleRipple[]>([]);
  const cleanupTasksRef = useRef<(() => void)[]>([]);

  // Sound trackers for live changes
  const melodyVolumeRef = useRef(melodyVolume);
  const rainVolumeRef = useRef(rainVolume);
  const fireVolumeRef = useRef(fireVolume);
  const cafeVolumeRef = useRef(cafeVolume);
  const birdsVolumeRef = useRef(birdsVolume);
  const drumVolumeRef = useRef(drumVolume);

  const activeTrack = ACCENT_TRACKS[currentTrackIndex];

  // Up-to-date synchronizations (preventing closures from reading stale values)
  useEffect(() => { trackIndexRef.current = currentTrackIndex; }, [currentTrackIndex]);
  useEffect(() => { melodyVolumeRef.current = melodyVolume; }, [melodyVolume]);
  useEffect(() => { rainVolumeRef.current = rainVolume; }, [rainVolume]);
  useEffect(() => { fireVolumeRef.current = fireVolume; }, [fireVolume]);
  useEffect(() => { cafeVolumeRef.current = cafeVolume; }, [cafeVolume]);
  useEffect(() => { birdsVolumeRef.current = birdsVolume; }, [birdsVolume]);
  useEffect(() => { drumVolumeRef.current = drumVolume; }, [drumVolume]);

  // Sync real-time Web audio gain values
  useEffect(() => {
    if (masterGainRef.current) {
      const target = isMuted ? 0 : volume / 100;
      masterGainRef.current.gain.setTargetAtTime(target, audioCtxRef.current?.currentTime || 0, 0.1);
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (melodyGainRef.current) {
      melodyGainRef.current.gain.setTargetAtTime(melodyVolume / 100, audioCtxRef.current?.currentTime || 0, 0.1);
    }
  }, [melodyVolume]);

  useEffect(() => {
    if (rainGainRef.current) {
      rainGainRef.current.gain.setTargetAtTime((rainVolume / 100) * 0.35, audioCtxRef.current?.currentTime || 0, 0.1);
    }
  }, [rainVolume]);

  useEffect(() => {
    if (fireGainRef.current) {
      fireGainRef.current.gain.setTargetAtTime((fireVolume / 100) * 0.28, audioCtxRef.current?.currentTime || 0, 0.1);
    }
  }, [fireVolume]);

  useEffect(() => {
    if (cafeGainRef.current) {
      cafeGainRef.current.gain.setTargetAtTime((cafeVolume / 100) * 0.22, audioCtxRef.current?.currentTime || 0, 0.1);
    }
  }, [cafeVolume]);

  useEffect(() => {
    if (birdsGainRef.current) {
      birdsGainRef.current.gain.setTargetAtTime((birdsVolume / 100) * 0.32, audioCtxRef.current?.currentTime || 0, 0.1);
    }
  }, [birdsVolume]);

  // Buffer generator for soundscapes
  const createSoundNoiseBuffer = (ctx: AudioContext, type: 'pink' | 'white') => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // normalise scale
        b6 = white * 0.115926;
      }
    } else {
      // White noise default
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }
    return buffer;
  };

  // Periodic wood campfire sound generator
  const playCracklePopEvent = () => {
    if (!audioCtxRef.current || !fireGainRef.current || isMuted || fireVolumeRef.current < 5) return;
    if (Math.random() > 0.4) return;

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const popGain = ctx.createGain();
    const bandpass = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120 + Math.random() * 1100, now);

    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(900 + Math.random() * 1800, now);
    bandpass.Q.setValueAtTime(14, now);

    popGain.gain.setValueAtTime(0, now);
    popGain.gain.linearRampToValueAtTime(0.015 + Math.random() * 0.045, now + 0.001);
    popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012 + Math.random() * 0.04);

    osc.connect(bandpass);
    bandpass.connect(popGain);
    popGain.connect(fireGainRef.current);

    osc.start(now);
    osc.stop(now + 0.12);

    // Garbage collect nodes to free Web Audio graph resources and prevent stutter
    setTimeout(() => {
      try {
        osc.disconnect();
        bandpass.disconnect();
        popGain.disconnect();
      } catch (e) {}
    }, 200);
  };

  // Periodic cafe cups and chatters clinking event
  const playCafeClinkEvent = () => {
    if (!audioCtxRef.current || !cafeGainRef.current || isMuted || cafeVolumeRef.current < 5) return;
    if (Math.random() > 0.55) return;

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const oscPrim = ctx.createOscillator();
    const oscSec = ctx.createOscillator();
    const soundGain = ctx.createGain();

    oscPrim.type = 'sine';
    oscPrim.frequency.setValueAtTime(2900 + Math.random() * 900, now);

    oscSec.type = 'sine';
    oscSec.frequency.setValueAtTime(4300 + Math.random() * 500, now);

    soundGain.gain.setValueAtTime(0, now);
    soundGain.gain.linearRampToValueAtTime(0.008 + Math.random() * 0.014, now + 0.002);
    soundGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09 + Math.random() * 0.11);

    oscPrim.connect(soundGain);
    oscSec.connect(soundGain);
    soundGain.connect(cafeGainRef.current);

    oscPrim.start(now);
    oscSec.start(now);
    oscPrim.stop(now + 0.3);
    oscSec.stop(now + 0.3);

    // Garbage collect nodes
    setTimeout(() => {
      try {
        oscPrim.disconnect();
        oscSec.disconnect();
        soundGain.disconnect();
      } catch (e) {}
    }, 400);
  };

  // Periodic forest birds engine
  const playForestBirdChirpEvent = () => {
    if (!audioCtxRef.current || !birdsGainRef.current || isMuted || birdsVolumeRef.current < 5) return;
    if (Math.random() > 0.45) return;

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const baseFreq = 1800 + Math.random() * 800;
    const syllableCount = 2 + Math.floor(Math.random() * 3);

    let streamOffset = 0;
    for (let c = 0; c < syllableCount; c++) {
      const osc = ctx.createOscillator();
      const envelopeNode = ctx.createGain();
      const chirpTime = now + streamOffset;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq - 100, chirpTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 750, chirpTime + 0.065);

      envelopeNode.gain.setValueAtTime(0, chirpTime);
      envelopeNode.gain.linearRampToValueAtTime(0.038, chirpTime + 0.01);
      envelopeNode.gain.exponentialRampToValueAtTime(0.0001, chirpTime + 0.075);

      osc.connect(envelopeNode);
      envelopeNode.connect(birdsGainRef.current);

      osc.start(chirpTime);
      osc.stop(chirpTime + 0.1);

      // Garbage collect nodes after playback completes
      const delayMs = Math.max(0, (chirpTime - ctx.currentTime) * 1000) + 200;
      setTimeout(() => {
        try {
          osc.disconnect();
          envelopeNode.disconnect();
        } catch (e) {}
      }, delayMs);

      streamOffset += 0.10 + Math.random() * 0.05;
    }
  };

  const playLofiDrumKick = (time: number) => {
    if (!audioCtxRef.current || !masterGainRef.current || isMuted) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const kickGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

    const amp = (drumVolumeRef.current / 100) * 0.18;

    kickGain.gain.setValueAtTime(0.0, time);
    kickGain.gain.linearRampToValueAtTime(amp, time + 0.005);
    kickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);

    osc.connect(kickGain);
    kickGain.connect(masterGainRef.current);

    osc.start(time);
    osc.stop(time + 0.18);

    // Garbage collect nodes to free memory
    const delayMs = Math.max(0, (time - ctx.currentTime) * 1000) + 300;
    setTimeout(() => {
      try {
        osc.disconnect();
        kickGain.disconnect();
      } catch (e) {}
    }, delayMs);
  };

  const playLofiDrumSnare = (time: number) => {
    if (!audioCtxRef.current || !masterGainRef.current || isMuted) return;
    const ctx = audioCtxRef.current;

    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1100, time);
    noiseFilter.Q.setValueAtTime(2.0, time);

    const snareGain = ctx.createGain();
    const ampNoise = (drumVolumeRef.current / 100) * 0.045;
    snareGain.gain.setValueAtTime(0.0, time);
    snareGain.gain.linearRampToValueAtTime(ampNoise, time + 0.002);
    snareGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);

    const osc = ctx.createOscillator();
    const toneGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(175, time);

    const ampTone = (drumVolumeRef.current / 100) * 0.025;
    toneGain.gain.setValueAtTime(0.0, time);
    toneGain.gain.linearRampToValueAtTime(ampTone, time + 0.005);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(snareGain);
    snareGain.connect(masterGainRef.current);

    osc.connect(toneGain);
    toneGain.connect(masterGainRef.current);

    noise.start(time);
    noise.stop(time + 0.16);

    osc.start(time);
    osc.stop(time + 0.16);

    // Garbage collect nodes to free memory
    const delayMs = Math.max(0, (time - ctx.currentTime) * 1000) + 300;
    setTimeout(() => {
      try {
        noise.disconnect();
        noiseFilter.disconnect();
        snareGain.disconnect();
        osc.disconnect();
        toneGain.disconnect();
      } catch (e) {}
    }, delayMs);
  };

  const playLofiHihat = (time: number) => {
    if (!audioCtxRef.current || !masterGainRef.current || isMuted) return;
    const ctx = audioCtxRef.current;

    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, time);

    const hatGain = ctx.createGain();
    const amp = (drumVolumeRef.current / 100) * 0.012;
    hatGain.gain.setValueAtTime(0.0, time);
    hatGain.gain.linearRampToValueAtTime(amp, time + 0.002);
    hatGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

    noise.connect(filter);
    filter.connect(hatGain);
    hatGain.connect(masterGainRef.current);

    noise.start(time);
    noise.stop(time + 0.04);

    // Garbage collect nodes to free memory
    const delayMs = Math.max(0, (time - ctx.currentTime) * 1000) + 300;
    setTimeout(() => {
      try {
        noise.disconnect();
        filter.disconnect();
        hatGain.disconnect();
      } catch (e) {}
    }, delayMs);
  };

  // Logical sequenced chord chord-progression playing loop
  const playSequencedMelodyChord = () => {
    if (!audioCtxRef.current || !melodyGainRef.current || isMuted || melodyVolumeRef.current < 5) return;

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const currentTrack = ACCENT_TRACKS[trackIndexRef.current];

    // Play optional lofi-drum track beats (Perfect 8-step boom-bap rhythm at 96-100 BPM)
    if (currentTrack.hasDrums) {
      const stepLen = (currentTrack.tempo / 1000) / 8; // exactly 8 step divisions
      
      // Step 0: Kick & Hihat
      playLofiDrumKick(now);
      playLofiHihat(now);
      
      // Step 1: Hihat
      playLofiHihat(now + stepLen);
      
      // Step 2: Snare Rim & Hihat
      playLofiDrumSnare(now + stepLen * 2);
      playLofiHihat(now + stepLen * 2);
      
      // Step 3: Hihat
      playLofiHihat(now + stepLen * 3);
      
      // Step 4: Kick & Hihat
      playLofiDrumKick(now + stepLen * 4);
      playLofiHihat(now + stepLen * 4);
      
      // Step 5: Kick (double groove)
      playLofiDrumKick(now + stepLen * 5);
      
      // Step 6: Snare Rim & Hihat
      playLofiDrumSnare(now + stepLen * 6);
      playLofiHihat(now + stepLen * 6);
      
      // Step 7: Hihat with shuffle/swing
      playLofiHihat(now + stepLen * 7);
    }

    // Read index of chord in sequence loop instead of random list
    const activeChordIndex = chordIndexRef.current % currentTrack.chords.length;
    const chord = currentTrack.chords[activeChordIndex];
    chordIndexRef.current += 1; // Increment index for next sequence call

    chord.forEach((pitch, i) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const noteFilter = ctx.createBiquadFilter();

      const stagg = i * 0.12; // Beautiful 120ms arpeggiator offset
      const noteTime = now + stagg;

      // Instrument 1: Warm Rhodes with vintage Tremolo LFO (correctly staggered!)
      if (currentTrack.instrument === 'rhodes') {
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();

        // Warm fundamental bass octave
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(pitch / 2, noteTime);
        subGain.gain.setValueAtTime(0, noteTime);
        subGain.gain.linearRampToValueAtTime(0.04, noteTime + 0.1);
        subGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 4.0);
        subOsc.connect(subGain);
        subGain.connect(melodyGainRef.current!);
        subOsc.start(noteTime);
        subOsc.stop(noteTime + 4.2);

        // Disconnect subOsc
        const subDelay = Math.max(0, (noteTime - ctx.currentTime) * 1000) + 4500;
        setTimeout(() => {
          try {
            subOsc.disconnect();
            subGain.disconnect();
          } catch (e) {}
        }, subDelay);

        // Tremolo LFO to oscillate pitch with rich warm wobble (dynamic pitch drift!)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(4.2, noteTime); // 4.2Hz organic wobble
        lfoGain.gain.setValueAtTime(pitch * 0.0055, noteTime); // 0.55% drift depth

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(noteTime);
        lfo.stop(noteTime + 4.5);

        // Disconnect LFO
        const lfoDelay = Math.max(0, (noteTime - ctx.currentTime) * 1000) + 4800;
        setTimeout(() => {
          try {
            lfo.disconnect();
            lfoGain.disconnect();
          } catch (e) {}
        }, lfoDelay);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(pitch, noteTime);
        noteFilter.type = 'lowpass';
        noteFilter.frequency.setValueAtTime(450 + i * 50, noteTime);

      // Instrument 2: Lush Deep Pad with slow attack (correctly staggered!)
      } else if (currentTrack.instrument === 'ambient-pad') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, noteTime);

        // Layer second detuned oscillator for lush acoustic chorus
        const chorusOsc = ctx.createOscillator();
        const chorusGain = ctx.createGain();
        chorusOsc.type = 'sawtooth';
        chorusOsc.frequency.setValueAtTime(pitch + 1.8, noteTime);
        
        chorusGain.gain.setValueAtTime(0, noteTime);
        chorusGain.gain.linearRampToValueAtTime(0.015, noteTime + 1.5);
        chorusGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 5.2);

        const padFilter = ctx.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.setValueAtTime(260, noteTime);

        chorusOsc.connect(padFilter);
        padFilter.connect(chorusGain);
        chorusGain.connect(melodyGainRef.current!);

        chorusOsc.start(noteTime);
        chorusOsc.stop(noteTime + 5.5);

        // Disconnect chorus
        const chorusDelay = Math.max(0, (noteTime - ctx.currentTime) * 1000) + 5800;
        setTimeout(() => {
          try {
            chorusOsc.disconnect();
            padFilter.disconnect();
            chorusGain.disconnect();
          } catch (e) {}
        }, chorusDelay);

        noteFilter.type = 'lowpass';
        noteFilter.frequency.setValueAtTime(350, noteTime);

      // Instrument 3: Glass Cafe Electric Piano (correctly staggered!)
      } else if (currentTrack.instrument === 'fm-glass') {
        // Simple 2-operator FM synth
        const modulator = ctx.createOscillator();
        const modulatorGain = ctx.createGain();

        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(pitch * 2.5, noteTime);
        modulatorGain.gain.setValueAtTime(pitch * 0.9, noteTime); // mod index

        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, noteTime);

        modulator.connect(modulatorGain);
        modulatorGain.connect(osc.frequency);

        modulator.start(noteTime);
        modulator.stop(noteTime + 3.8);

        // Disconnect modulator
        const modDelay = Math.max(0, (noteTime - ctx.currentTime) * 1000) + 4100;
        setTimeout(() => {
          try {
            modulator.disconnect();
            modulatorGain.disconnect();
          } catch (e) {}
        }, modDelay);

        noteFilter.type = 'lowpass';
        noteFilter.frequency.setValueAtTime(800, noteTime);

      // Instrument 4: Ringing Wooden Kalimba (correctly staggered!)
      } else if (currentTrack.instrument === 'kalimba') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch * 2.0, noteTime); // Bell resonance octave range

        noteFilter.type = 'bandpass';
        noteFilter.frequency.setValueAtTime(1300, noteTime);
        noteFilter.Q.setValueAtTime(5, noteTime);

      // Instrument 5: Holographic Binaural Cosmic Space Pad
      } else if (currentTrack.instrument === 'cosmic-pad') {
        // stereophonic spatial soundscape!
        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(pitch, now);
        
        oscR.type = 'sine';
        // 8Hz difference creates Binaural Alpha Waves on speakers/headphones!
        oscR.frequency.setValueAtTime(pitch + 8, now); 

        const binauralGain = ctx.createGain();
        binauralGain.gain.setValueAtTime(0, now);
        binauralGain.gain.linearRampToValueAtTime(0.065, now + 1.5);
        binauralGain.gain.exponentialRampToValueAtTime(0.0001, now + 7.8);

        if (pannerL && pannerR) {
          pannerL.pan.setValueAtTime(-1, now);
          pannerR.pan.setValueAtTime(1, now);

          oscL.connect(pannerL);
          pannerL.connect(binauralGain);

          oscR.connect(pannerR);
          pannerR.connect(binauralGain);
        } else {
          oscL.connect(binauralGain);
          oscR.connect(binauralGain);
        }

        binauralGain.connect(melodyGainRef.current!);
        oscL.start(now);
        oscR.start(now);
        oscL.stop(now + 8.2);
        oscR.stop(now + 8.2);

        // Disconnect binaural nodes
        setTimeout(() => {
          try {
            oscL.disconnect();
            oscR.disconnect();
            if (pannerL) pannerL.disconnect();
            if (pannerR) pannerR.disconnect();
            binauralGain.disconnect();
          } catch (e) {}
        }, 8500);

        return; // skip main oscillator step
      }

      noteGain.gain.setValueAtTime(0, noteTime);

      if (currentTrack.instrument === 'kalimba') {
        // Plucky, fast chime (instant attack)
        noteGain.gain.linearRampToValueAtTime(0.095, noteTime + 0.005);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.4);
      } else if (currentTrack.instrument === 'rhodes') {
        // Warm e-piano hammer strike (instant attack)
        noteGain.gain.linearRampToValueAtTime(0.075, noteTime + 0.015);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 3.8);
      } else if (currentTrack.instrument === 'fm-glass') {
        // Tiny bell tinkle (instant attack)
        noteGain.gain.linearRampToValueAtTime(0.08, noteTime + 0.005);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.6);
      } else if (currentTrack.instrument === 'ambient-pad') {
        // Smooth bowing pad (slow attack)
        noteGain.gain.linearRampToValueAtTime(0.05, noteTime + 1.2);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 4.8);
      } else {
        // Fallback standard
        noteGain.gain.linearRampToValueAtTime(0.07, noteTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 3.5);
      }

      osc.connect(noteFilter);
      noteFilter.connect(noteGain);
      noteGain.connect(melodyGainRef.current!);

      osc.start(noteTime);
      osc.stop(noteTime + 5.0);

      // Disconnect main note player
      const noteDelay = Math.max(0, (noteTime - ctx.currentTime) * 1000) + 5200;
      setTimeout(() => {
        try {
          osc.disconnect();
          noteFilter.disconnect();
          noteGain.disconnect();
        } catch (e) {}
      }, noteDelay);
    });

    // Add high-pitched consolation bell ornament to make track beautifully diverse and non-monotonous
    if (Math.random() > 0.4) {
      const bellPitch = chord[Math.floor(Math.random() * chord.length)] * 2;
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      const bellTime = now + 1.2 + Math.random() * 1.6;

      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(bellPitch, bellTime);

      bellGain.gain.setValueAtTime(0, bellTime);
      bellGain.gain.linearRampToValueAtTime(0.045, bellTime + 0.006);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, bellTime + 2.0);

      bellOsc.connect(bellGain);
      bellGain.connect(melodyGainRef.current!);

      bellOsc.start(bellTime);
      bellOsc.stop(bellTime + 2.2);

      // Disconnect bell nodes to free memory and prevent stuttering
      const bellDelay = Math.max(0, (bellTime - ctx.currentTime) * 1000) + 2400;
      setTimeout(() => {
        try {
          bellOsc.disconnect();
          bellGain.disconnect();
        } catch (e) {}
      }, bellDelay);
    }
  };

  const stopAudioEngine = () => {
    cleanupTasksRef.current.forEach((t) => t());
    cleanupTasksRef.current = [];

    if (audioCtxRef.current) {
      try {
        if (audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close();
        }
      } catch (err) {}
      audioCtxRef.current = null;
    }

    masterGainRef.current = null;
    melodyGainRef.current = null;
    rainGainRef.current = null;
    fireGainRef.current = null;
    cafeGainRef.current = null;
    birdsGainRef.current = null;
    setIsPlaying(false);
  };

  const startAudioEngine = async () => {
    try {
      stopAudioEngine();

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // 1. Create Master Output Node
      const master = ctx.createGain();
      master.gain.setValueAtTime(isMuted ? 0 : volume / 100, ctx.currentTime);
      master.connect(ctx.destination);
      masterGainRef.current = master;

      // 2. Instrument Tracks Output Node
      const melodyG = ctx.createGain();
      melodyG.gain.setValueAtTime(melodyVolume / 100, ctx.currentTime);
      melodyG.connect(master);
      melodyGainRef.current = melodyG;

      // 3. Ambient Tracks Output Nodes
      const rainG = ctx.createGain();
      const fireG = ctx.createGain();
      const cafeG = ctx.createGain();
      const birdsG = ctx.createGain();

      rainG.gain.setValueAtTime((rainVolume / 100) * 0.35, ctx.currentTime);
      fireG.gain.setValueAtTime((fireVolume / 100) * 0.28, ctx.currentTime);
      cafeG.gain.setValueAtTime((cafeVolume / 100) * 0.22, ctx.currentTime);
      birdsG.gain.setValueAtTime((birdsVolume / 100) * 0.32, ctx.currentTime);

      rainG.connect(master);
      fireG.connect(master);
      cafeG.connect(master);
      birdsG.connect(master);

      rainGainRef.current = rainG;
      fireGainRef.current = fireG;
      cafeGainRef.current = cafeG;
      birdsGainRef.current = birdsG;

      // To save client resources, only load nodes that are actually part of the track preset style!
      const activeStyle = ACCENT_TRACKS[trackIndexRef.current];
      const activeUnsubs: (() => void)[] = [];

      // Rain buffer initialization (always running for instant reactive responsiveness, volumes are managed by gain nodes!)
      const rainBuffer = createSoundNoiseBuffer(ctx, 'pink'); 
      const rainSource = ctx.createBufferSource();
      rainSource.buffer = rainBuffer;
      rainSource.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      rainSource.connect(filter);
      filter.connect(rainG);
      rainSource.start(0);

      activeUnsubs.push(() => {
        try { rainSource.stop(); } catch (e) {}
        rainSource.disconnect();
        filter.disconnect();
      });

      // Campfire wood stream initialization (always running)
      const fireBuffer = createSoundNoiseBuffer(ctx, 'pink');
      const fireSource = ctx.createBufferSource();
      fireSource.buffer = fireBuffer;
      fireSource.loop = true;

      const fireFilter = ctx.createBiquadFilter();
      fireFilter.type = 'lowpass';
      fireFilter.frequency.setValueAtTime(260, ctx.currentTime);

      fireSource.connect(fireFilter);
      fireFilter.connect(fireG);
      fireSource.start(0);

      const crackleTimer = setInterval(playCracklePopEvent, 550);

      activeUnsubs.push(() => {
        try { fireSource.stop(); } catch (e) {}
        fireSource.disconnect();
        fireFilter.disconnect();
        clearInterval(crackleTimer);
      });

      // Ambient cafe chatter stream (always running)
      const cafeBuffer = createSoundNoiseBuffer(ctx, 'pink');
      const cafeSource = ctx.createBufferSource();
      cafeSource.buffer = cafeBuffer;
      cafeSource.loop = true;

      const cafeFilter = ctx.createBiquadFilter();
      cafeFilter.type = 'lowpass';
      cafeFilter.frequency.setValueAtTime(130, ctx.currentTime);

      cafeSource.connect(cafeFilter);
      cafeFilter.connect(cafeG);
      cafeSource.start(0);

      const clinkTimer = setInterval(playCafeClinkEvent, 900);

      activeUnsubs.push(() => {
        try { cafeSource.stop(); } catch (e) {}
        cafeSource.disconnect();
        cafeFilter.disconnect();
        clearInterval(clinkTimer);
      });

      // Kicau burung tracker (always active loop)
      const birdTimer = setInterval(playForestBirdChirpEvent, 2000);
      activeUnsubs.push(() => {
        clearInterval(birdTimer);
      });

      // Start sequential progression chords loop
      chordIndexRef.current = 0; // reset chords
      playSequencedMelodyChord();

      let schedulerTimeoutIdx: any = null;
      const schedulerLoop = () => {
        const curStyle = ACCENT_TRACKS[trackIndexRef.current];
        playSequencedMelodyChord();
        schedulerTimeoutIdx = setTimeout(schedulerLoop, curStyle.tempo);
      };
      
      schedulerTimeoutIdx = setTimeout(schedulerLoop, activeStyle.tempo);

      // Save combined clear tasks
      cleanupTasksRef.current = [
        ...activeUnsubs,
        () => clearTimeout(schedulerTimeoutIdx)
      ];

      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to boot alpha wave focus synthesizer:', err);
    }
  };

  const handleTrackChange = (index: number) => {
    setCurrentTrackIndex(index);
    const selected = ACCENT_TRACKS[index];

    // Read default preset volumes
    setMelodyVolume(selected.defaultMix.melody);
    setRainVolume(selected.defaultMix.rain);
    setFireVolume(selected.defaultMix.fire);
    setCafeVolume(selected.defaultMix.cafe);
    setBirdsVolume(selected.defaultMix.birds);
    
    if (selected.hasDrums) {
      setDrumVolume(55);
    } else {
      setDrumVolume(0);
    }

    // If currently playing, we must fully RESTART the audio engine!
    // This allows the sequencer to pick up the precise template, tempo, synthesizer voice, and filters immediately!
    if (isPlaying) {
      trackIndexRef.current = index;
      setTimeout(() => {
        startAudioEngine();
      }, 50);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudioEngine();
    } else {
      startAudioEngine();
    }
  };

  const handleApplyPreset = (preset: QuickMixPreset) => {
    setMelodyVolume(preset.mix.melody);
    setRainVolume(preset.mix.rain);
    setFireVolume(preset.mix.fire);
    setCafeVolume(preset.mix.cafe);
    setBirdsVolume(preset.mix.birds);
    
    if (activeTrack.hasDrums) {
      setDrumVolume(40);
    }

    // Dynamic wave ripples from preset touch
    const canvas = canvasRef.current;
    if (canvas) {
      ripplesRef.current.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 3,
        maxRadius: 80,
        alpha: 1.0,
        color: activeTrack.accentHex
      });
    }
  };

  const handleModeChange = (mode: 'synth' | 'external') => {
    setPlayerMode(mode);
    if (mode === 'external') {
      stopAudioEngine(); // pause procedural synth so they do not overlap
    }
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput) return;
    
    const result = convertToEmbedUrl(customUrlInput);
    if (result.platform) {
      setCurrentExternalUrl(result.embedUrl);
      setExternalPlatform(result.platform);
      setCustomError('');
    } else {
      setCustomError('Tautan tidak didukung. Harap masukkan tautan YouTube, Spotify, atau SoundCloud.');
    }
  };

  const handleCanvasTouchClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    ripplesRef.current.push({
      x: clickX,
      y: clickY,
      radius: 4,
      maxRadius: 60 + Math.random() * 40,
      alpha: 1.0,
      color: activeTrack.accentHex
    });
  };

  // Canvas visualizer rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameIdx: number;
    let waveOffset = 0;

    const render = () => {
      waveOffset += isPlaying ? 0.055 : 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw glowing background grid
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // 2. Draw 3 distinct layered focal alpha-wave lanes
      for (let l = 0; l < 3; l++) {
        ctx.beginPath();
        if (l === 0) {
          ctx.strokeStyle = activeTrack.accentHex;
          ctx.lineWidth = 3.5;
        } else if (l === 1) {
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.6)'; // Slate separator
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = `${activeTrack.accentHex}33`; // Faded accent
          ctx.lineWidth = 1;
        }

        const amp = isPlaying ? (22 - l * 6) * (volume / 100) : 4;
        const speed = 0.015 + l * 0.004;

        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x * speed + waveOffset + l * 1.6) * amp;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // 3. Render and animate custom clicks ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 2.0;
        r.alpha -= 0.035;

        if (r.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = r.alpha;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius / 1.6, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
      }

      animFrameIdx = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameIdx);
  }, [isPlaying, volume, currentTrackIndex, activeTrack]);

  // Handle cleanups
  useEffect(() => {
    return () => stopAudioEngine();
  }, []);

  const getIframeHeight = (platform: 'youtube' | 'spotify' | 'soundcloud') => {
    if (platform === 'youtube') return '260px';
    if (platform === 'spotify') return '152px';
    return '166px';
  };

  return (
    <div className="glass rounded-[2rem] p-4 sm:p-6 border-2 border-slate-100 relative overflow-hidden flex flex-col space-y-4 shadow-xl bg-white/95 transition-all">
      {/* Background themed accent blur */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20"
        style={{ backgroundColor: activeTrack.accentHex }}
      />

      <div className="flex items-center justify-between z-10 w-full">
        <div className="flex items-center gap-2">
          <div 
            className="p-1.5 rounded-lg text-white transition-all duration-500" 
            style={{ backgroundColor: activeTrack.accentHex }}
          >
            <Wind size={16} className={isPlaying ? "animate-spin" : ""} style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Zen Focus Player</h3>
            <p className="text-[9px] font-bold text-slate-400">PROCEDURAL ALPHA CONTEXTS</p>
          </div>
        </div>
        <span 
          className="text-[9px] font-extrabold px-2 py-1 rounded-full flex items-center gap-1 transition-all duration-500 border"
          style={{ 
            color: activeTrack.accentHex, 
            backgroundColor: `${activeTrack.accentHex}12`,
            borderColor: `${activeTrack.accentHex}24`
          }}
        >
          {playerMode === 'synth' ? (
            <>
              <Sparkles size={10} className="animate-pulse" /> 100% OFFLINE SYNTH
            </>
          ) : (
            <>
              <Radio size={10} className="animate-pulse" /> PLATFORM STREAMING
            </>
          )}
        </span>
      </div>

      {/* Segmented Control Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl z-10 w-full border border-slate-200/50">
        <button
          onClick={() => handleModeChange('synth')}
          className={`py-2 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            playerMode === 'synth'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-200/20'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          style={{ minHeight: '38px' }}
        >
          <Sparkles size={13} className={playerMode === 'synth' ? "text-amber-500" : ""} />
          Sintesis Offline
        </button>
        <button
          onClick={() => handleModeChange('external')}
          className={`py-2 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            playerMode === 'external'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-200/20'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          style={{ minHeight: '38px' }}
        >
          <Radio size={13} className={playerMode === 'external' ? "text-rose-500" : ""} />
          Spotify & YouTube
        </button>
      </div>

      {playerMode === 'synth' ? (
        <div className="flex flex-col space-y-4 w-full">
          {/* Main playback control center */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-3xl z-10 w-full transition-all">
        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-lg cursor-pointer transition-all active:scale-90 text-white relative group"
          aria-label={isPlaying ? "Pause Focus Player" : "Play Focus Player"}
          style={{ 
            minHeight: '44px', 
            minWidth: '44px',
            backgroundColor: activeTrack.accentHex,
            boxShadow: `0 8px 20px -3px ${activeTrack.accentHex}55`
          }}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="translate-x-0.5" />}
          <span className="absolute -inset-1 rounded-full border-2 border-white/20 animate-scale-glow pointer-events-none group-hover:scale-105 transition-all" />
        </button>

        <div className="flex-1 w-full text-center sm:text-left min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
            <span 
              className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border"
              style={{ 
                color: activeTrack.accentHex, 
                backgroundColor: `${activeTrack.accentHex}10`,
                borderColor: `${activeTrack.accentHex}20`
              }}
            >
              Mode: {activeTrack.instrument.toUpperCase()}
            </span>
            {isPlaying && (
              <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 shrink-0 animate-pulse">
                ● SYNCED ACTIVE
              </span>
            )}
          </div>
          <h4 className="text-sm font-black text-slate-800 mt-1">{activeTrack.name}</h4>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">{activeTrack.description}</p>
        </div>
      </div>

      {/* Dynamic Wave Canvas visualizer */}
      <div className="relative text-center w-full z-10">
        <div className="relative w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden cursor-crosshair group">
          <canvas 
            ref={canvasRef} 
            width={480} 
            height={56}
            onClick={handleCanvasTouchClick}
            className="w-full h-full opacity-90 absolute left-0 top-0" 
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase bg-white/70 px-2 py-1 rounded-md border border-slate-100">
                Klik PLAY Untuk Menstimulasi Alur Otak Alfa
              </span>
            </div>
          )}
          {isPlaying && (
            <div className="absolute top-1 right-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[8px] text-slate-400 font-bold bg-white/80 px-1.5 py-0.5 rounded-sm">
                Sentuh gelombang untuk riak energi ✨
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tracks Switcher Area - Perfect, responsive 2-column mobile and 3-column tablet grids */}
      <div className="space-y-1.5 z-10">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block pl-1">
          Pilih Aliran Suara (Tracks)
        </span>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {ACCENT_TRACKS.map((track, idx) => {
            const isSelected = currentTrackIndex === idx;
            return (
              <button
                key={track.id}
                onClick={() => handleTrackChange(idx)}
                className={`text-left p-3 rounded-2xl border text-xs font-semibold flex flex-col justify-between items-start transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'text-white shadow-md shadow-slate-100'
                    : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
                style={{ 
                  minHeight: '66px',
                  backgroundColor: isSelected ? track.accentHex : '',
                  borderColor: isSelected ? track.accentHex : ''
                }}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-extrabold truncate pr-2">{track.name}</span>
                    {isSelected && isPlaying ? (
                      <span className="w-2 h-2 bg-white rounded-full animate-ping shrink-0" />
                    ) : (
                      <span className="text-sm opacity-50 group-hover:scale-110 transition-transform">
                        {track.iconType === 'cozy' && '🔥'}
                        {track.iconType === 'rain' && '🌧️'}
                        {track.iconType === 'cafe' && '☕'}
                        {track.iconType === 'forest' && '🌲'}
                        {track.iconType === 'space' && '🌌'}
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] mt-0.5 font-medium leading-snug line-clamp-1 ${
                    isSelected ? 'text-white/80' : 'text-slate-400 group-hover:text-slate-500'
                  }`}>
                    {track.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Mix Volume Presets - One touch interactive buttons */}
      <div className="space-y-2 z-10 p-3 bg-slate-50/60 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pl-1">
            Mode Campuran Cepat (Presets)
          </span>
          <span className="text-[9px] text-brand-600 font-bold bg-brand-50 px-1.5 py-0.5 rounded">Tactile Balance</span>
        </div>
        
        {/* Mobile horizontal scrolling row or small wrapping grid */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="text-[10.5px] font-bold bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
              style={{ minHeight: '36px' }}
              title={preset.description}
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Master Volume Controls */}
      <div className="flex items-center gap-3 pt-1.5 pb-1.5 border-t border-slate-100 z-10">
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="text-slate-500 hover:text-brand-600 transition-colors cursor-pointer select-none shrink-0"
          style={{ minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label={isMuted ? "Unmute Volume" : "Mute Volume"}
        >
          {isMuted || volume === 0 ? <VolumeX size={18} className="text-red-500" /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => {
            setVolume(Number(e.target.value));
            setIsMuted(false);
          }}
          className="flex-1 h-2 rounded-lg cursor-pointer my-auto transition-all bg-slate-200 accent-slate-800"
          style={{ 
            height: '8px',
            accentColor: activeTrack.accentHex
          }}
        />
        <span className="text-[11px] font-black text-slate-500 font-mono w-9 text-right select-none shrink-0">
          {isMuted ? 'MUTE' : `${volume}%`}
        </span>
      </div>

      {/* Collapsible Fine-mix Slider Console */}
      <div className="border-t border-slate-100 pt-2 z-10">
        <button
          onClick={() => setShowMixer(!showMixer)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-800 transition-all py-1"
          style={{ minHeight: '44px' }}
        >
          <span className="flex items-center gap-1.5">
            <Sliders size={14} style={{ color: activeTrack.accentHex }} />
            Tweak Pencampur Volume Manual
          </span>
          <span className="text-[9px] font-extrabold bg-slate-100 transition-all hover:bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-xl">
            {showMixer ? "Sembunyikan" : "Tampilkan Sliders"}
          </span>
        </button>

        <AnimatePresence>
          {showMixer && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 overflow-hidden text-xs pb-2"
            >
              <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2">
                {/* 1. Melody slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Music size={12} className="text-indigo-500" />
                      Instrumen Melodi Utama
                    </span>
                    <span className="font-mono">{melodyVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={melodyVolume}
                    onChange={(e) => setMelodyVolume(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* 2. Rain slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <CloudRain size={12} className="text-blue-500" />
                      Rintik Hujan (Ambient Rain)
                    </span>
                    <span className="font-mono">{rainVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rainVolume}
                    onChange={(e) => setRainVolume(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg cursor-pointer accent-blue-500"
                  />
                </div>

                {/* 3. Fire slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Flame size={12} className="text-amber-600" />
                      Perapian Kayu (Wood Fire Crackles)
                    </span>
                    <span className="font-mono">{fireVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={fireVolume}
                    onChange={(e) => setFireVolume(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg cursor-pointer accent-amber-600"
                  />
                </div>

                {/* 4. Cafe slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Coffee size={12} className="text-orange-700" />
                      Gemuruh Kafe (Cafe Chatter & Clinks)
                    </span>
                    <span className="font-mono">{cafeVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cafeVolume}
                    onChange={(e) => setCafeVolume(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg cursor-pointer accent-orange-700"
                  />
                </div>

                {/* 5. Birds slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Trees size={12} className="text-emerald-500" />
                      Siulan Burung Hutan (Forest Birds)
                    </span>
                    <span className="font-mono">{birdsVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={birdsVolume}
                    onChange={(e) => setBirdsVolume(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
      ) : (
        /* Render external music platform player UI */
        <div className="flex flex-col space-y-4 w-full z-10 animate-fade-in">
          {/* Main Selected Stream Player */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
            <span className="text-[9px] uppercase font-black bg-rose-50 text-rose-600 border border-rose-100 py-0.5 px-2 rounded-md mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              Semat Aktif: {externalPlatform.toUpperCase()} PLAYER
            </span>
            
            {/* The responsive iframe wrapper */}
            <div className="w-full overflow-hidden rounded-xl border border-slate-200 shadow-xs transition-all" style={{ height: getIframeHeight(externalPlatform) }}>
              <iframe
                src={currentExternalUrl}
                className="w-full h-full border-0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share"
                loading="lazy"
                title="External Focus Station"
              />
            </div>
          </div>

          {/* Custom url submit field */}
          <form onSubmit={handleCustomUrlSubmit} className="space-y-2 bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block pl-1">
              Sematkan Tautan Musik Pilihan Anda sendiri (Custom Link / Embed)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tempel tautan video/playlist YouTube, atau playlist Spotify di sini..."
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 text-xs bg-white border border-slate-250 py-2 px-3 rounded-xl outline-none focus:border-slate-400 text-slate-700 font-medium"
              />
              <button
                type="submit"
                className="bg-slate-800 text-white rounded-xl text-xs font-black px-4 py-2 hover:bg-slate-700 cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
              >
                Putar Link
              </button>
            </div>
            {customError ? (
              <p className="text-[10px] font-medium text-red-500 pl-1">{customError}</p>
            ) : (
              <p className="text-[9px] text-slate-400 font-medium pl-1 leading-normal">
                Sistem secara cerdas mendukung konversi link YouTube standar, share link Spotify, album SoundCloud, mau pun kode html `&lt;iframe&gt;` langsung!
              </p>
            )}
          </form>

          {/* Advice card block following environmental constraints */}
          <div className="bg-amber-50/40 p-3.5 rounded-2xl border border-amber-100/50 flex gap-2">
            <span className="text-amber-500 text-sm shrink-0">💡</span>
            <p className="text-[10px] text-amber-800/80 font-medium leading-relaxed">
              <strong>Info Peramban:</strong> Layanan pemutar Spotify web membatasi pemutaran preview gratis (30 detik) bila Anda belum masuk (login) ke akun Spotify di peramban ini. Untuk pemutaran lofi tak terbatas dan gratis, kami sangat menyarankan untuk menyematkan tautan **YouTube** yang Anda sukai!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
