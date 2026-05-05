import { mdiClose, mdiStarFourPoints } from '@mdi/js';
import type { CSSProperties, PointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../lib/i18n';

type SecretAisleEasterEggProps = {
  isVisible: boolean;
  onDismiss: () => void;
};

const HARP_STRING_COUNT = 12;
const BEAT_MS = 430;
const HARP_VIEWBOX_WIDTH = 240;
const HARP_VIEWBOX_HEIGHT = 180;
const HARP_TOP_Y = 12;
const HARP_BOTTOM_Y = 168;
const HARP_X_START = 18;
const HARP_X_GAP = 18.5;
const BACKDROP_DISMISS_DELAY_MS = 2_000;
const HARP_NOTE_RELEASE_SECONDS = 0.05;
const MELODY_START_DELAY_SECONDS = 0.05;
const noteFrequencies = {
  c4: 261.63,
  d4: 293.66,
  e4: 329.63,
  f4: 349.23,
  g4: 392,
  a4: 440,
  b4: 493.88,
  c5: 523.25,
  d5: 587.33,
  e5: 659.25,
  f5: 698.46,
  g5: 783.99,
} as const;
const stringFrequencies = [
  noteFrequencies.c4,
  noteFrequencies.d4,
  noteFrequencies.e4,
  noteFrequencies.f4,
  noteFrequencies.g4,
  noteFrequencies.a4,
  noteFrequencies.b4,
  noteFrequencies.c5,
  noteFrequencies.d5,
  noteFrequencies.e5,
  noteFrequencies.f5,
  noteFrequencies.g5,
];
const stringNoteNames = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'];
const stringKeyboardKeys = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', '\\'];
const stringKeyboardCodes = [
  'KeyA',
  'KeyS',
  'KeyD',
  'KeyF',
  'KeyG',
  'KeyH',
  'KeyJ',
  'KeyK',
  'KeyL',
  'Semicolon',
  'Quote',
  'Backslash',
];

const formatHarpStringLabel = (template: string, note: string, key: string) =>
  template.replace(/\{note\}/g, note).replace(/\{key\}/g, key);

const stringNoteColors = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
];

type MelodyNote = {
  beat: number;
  duration: number;
  frequency: number;
  string: number;
};

type Melody = MelodyNote[];
type PlayingHarpNote = {
  oscillator: OscillatorNode;
  overtone: OscillatorNode;
};

const melodyNote = (beat: number, string: number, duration = 1.45): MelodyNote => ({
  beat,
  duration,
  frequency: stringFrequencies[string] ?? stringFrequencies[0],
  string,
});

const tuneFromStrings = (strings: number[]): Melody => (
  strings.map((string, index) => melodyNote(index * 0.5, string, index === strings.length - 1 ? 2.2 : 1.45))
);

const melodies: Melody[] = [
  tuneFromStrings([4, 5, 7, 5, 4, 2, 4, 5, 7, 8, 7, 5, 4, 2, 0, 2]),
  tuneFromStrings([0, 2, 4, 7, 6, 4, 2, 3, 5, 7, 9, 8, 7, 5, 4, 7]),
  tuneFromStrings([4, 5, 7, 9, 7, 5, 4, 2, 3, 5, 6, 8, 7, 5, 4, 2]),
  tuneFromStrings([7, 9, 11, 10, 9, 7, 5, 7, 8, 9, 11, 9, 8, 7, 5, 7]),
  tuneFromStrings([2, 4, 5, 7, 9, 7, 5, 4, 2, 3, 5, 7, 5, 4, 2, 0]),
  tuneFromStrings([5, 7, 9, 11, 9, 8, 7, 5, 4, 5, 7, 9, 7, 5, 4, 5]),
  tuneFromStrings([0, 3, 5, 7, 8, 7, 5, 3, 2, 4, 6, 8, 7, 5, 3, 2]),
  tuneFromStrings([4, 7, 9, 11, 10, 9, 7, 9, 8, 7, 5, 7, 9, 7, 5, 4]),
  tuneFromStrings([2, 5, 7, 8, 7, 5, 4, 2, 0, 2, 4, 5, 7, 5, 4, 2]),
  tuneFromStrings([7, 8, 9, 11, 9, 8, 7, 5, 7, 9, 10, 11, 10, 9, 8, 7]),
  tuneFromStrings([3, 5, 7, 10, 9, 7, 5, 3, 4, 6, 8, 9, 8, 6, 5, 4]),
  tuneFromStrings([0, 2, 3, 5, 7, 8, 7, 5, 4, 5, 7, 9, 8, 7, 5, 3]),
  tuneFromStrings([5, 8, 10, 11, 10, 8, 7, 5, 4, 5, 7, 8, 10, 8, 7, 5]),
  tuneFromStrings([2, 4, 7, 9, 11, 9, 7, 4, 5, 7, 8, 10, 8, 7, 5, 4]),
  tuneFromStrings([4, 6, 8, 9, 8, 6, 4, 2, 3, 5, 7, 8, 7, 5, 3, 4]),
  tuneFromStrings([0, 4, 7, 9, 8, 7, 5, 4, 2, 5, 7, 10, 9, 7, 4, 0]),
];

const createAudioContext = (): AudioContext | undefined => {
  const AudioContextConstructor = window.AudioContext;
  return AudioContextConstructor ? new AudioContextConstructor() : undefined;
};

const stopHarpNode = (node: OscillatorNode, stopTime: number) => {
  try {
    node.stop(stopTime);
  } catch {
    // Already stopped or never reached its scheduled start.
  }
};

const playHarpNote = (
  audioContext: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
): PlayingHarpNote => {
  const oscillator = audioContext.createOscillator();
  const overtone = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const overtoneGain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startTime);
  overtone.type = 'triangle';
  overtone.frequency.setValueAtTime(frequency * 2.01, startTime);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2_300, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.095, startTime + 0.026);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  overtoneGain.gain.setValueAtTime(0.0001, startTime);
  overtoneGain.gain.exponentialRampToValueAtTime(0.018, startTime + 0.02);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.72);

  oscillator.connect(gain);
  overtone.connect(overtoneGain);
  gain.connect(filter);
  overtoneGain.connect(filter);
  filter.connect(audioContext.destination);

  oscillator.start(startTime);
  overtone.start(startTime);
  oscillator.stop(startTime + duration + HARP_NOTE_RELEASE_SECONDS);
  overtone.stop(startTime + duration + HARP_NOTE_RELEASE_SECONDS);

  return { oscillator, overtone };
};

const harpStringX = (index: number) => HARP_X_START + index * HARP_X_GAP;

const harpStringPath = (x: number, offset = 0) => (
  `M ${x} ${HARP_TOP_Y} Q ${x + offset} ${HARP_VIEWBOX_HEIGHT / 2} ${x} ${HARP_BOTTOM_Y}`
);

const harpStringWidth = () => 3;

const noteColorStyle = (string: number | undefined): CSSProperties => (
  string === undefined
    ? {}
    : { '--easter-egg-note-color': stringNoteColors[string] ?? stringNoteColors[0] } as CSSProperties
);

const harpStringFromPointer = (event: PointerEvent<SVGSVGElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * HARP_VIEWBOX_WIDTH;
  const y = ((event.clientY - rect.top) / rect.height) * HARP_VIEWBOX_HEIGHT;
  const nearestString = Math.round((x - HARP_X_START) / HARP_X_GAP);
  const nearestStringX = harpStringX(nearestString);
  const isWithinStringRun = (
    nearestString >= 0
    && nearestString < HARP_STRING_COUNT
    && Math.abs(x - nearestStringX) <= HARP_X_GAP / 2
    && y >= HARP_TOP_Y - 18
    && y <= HARP_BOTTOM_Y + 18
  );

  return isWithinStringRun ? nearestString : undefined;
};

export function SecretAisleEasterEgg({ isVisible, onDismiss }: SecretAisleEasterEggProps) {
  const { messages } = useI18n();
  const [activePluck, setActivePluck] = useState<{ offset: number; string: number }>();
  const [previewString, setPreviewString] = useState<number>();
  const [isMelodyPlaying, setIsMelodyPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext>();
  const timersRef = useRef<number[]>([]);
  const melodyNodesRef = useRef<PlayingHarpNote[]>([]);
  const isMelodyPlayingRef = useRef(false);
  const isPointerPluckingRef = useRef(false);
  const lastPointerStringRef = useRef<number>();
  const lastMelodyIndexRef = useRef<number>();
  const notePreviewTokenRef = useRef(0);
  const openedAtRef = useRef(0);

  useEffect(() => {
    if (!isVisible) { return undefined; }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
        return;
      }

      if (event.repeat || isMelodyPlayingRef.current) { return; }

      const string = stringKeyboardCodes.indexOf(event.code);
      if (string >= 0) {
        event.preventDefault();
        pluckString(string);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onDismiss]);

  const clearStringTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const stopMelodyNotes = (audioContext: AudioContext | undefined) => {
    const stopTime = audioContext?.state === 'closed' ? 0 : audioContext?.currentTime ?? 0;
    melodyNodesRef.current.forEach((note) => {
      stopHarpNode(note.oscillator, stopTime);
      stopHarpNode(note.overtone, stopTime);
    });
    melodyNodesRef.current = [];
  };

  const getAudioContext = () => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      return audioContextRef.current;
    }

    const audioContext = createAudioContext();
    audioContextRef.current = audioContext;
    return audioContext;
  };

  const setNotePreview = (string: number | undefined) => {
    notePreviewTokenRef.current += 1;
    setPreviewString(string);
  };

  const setUserNotePreview = (string: number | undefined) => {
    if (isMelodyPlayingRef.current) { return; }

    setNotePreview(string);
  };

  const setMelodyPlaying = (isPlaying: boolean) => {
    isMelodyPlayingRef.current = isPlaying;
    setIsMelodyPlaying(isPlaying);
  };

  const showTimedNotePreview = (string: number) => {
    const token = notePreviewTokenRef.current + 1;
    notePreviewTokenRef.current = token;
    setPreviewString(string);

    const clearPreviewTimer = window.setTimeout(() => {
      if (notePreviewTokenRef.current === token) {
        setPreviewString(undefined);
      }
    }, 760);
    timersRef.current.push(clearPreviewTimer);
  };

  const scheduleStringWobble = (string: number) => {
    showTimedNotePreview(string);

    const wobbleFrames = [
      { delay: 0, offset: 0 },
      { delay: 42, offset: 8 },
      { delay: 96, offset: -6 },
      { delay: 158, offset: 4 },
      { delay: 236, offset: -2 },
      { delay: 330, offset: 1 },
      { delay: 450, offset: 0 },
    ];
    const wobbleTimers = wobbleFrames.map((frame) => (
      window.setTimeout(() => setActivePluck({ offset: frame.offset, string }), frame.delay)
    ));
    const clearTimer = window.setTimeout(() => {
      setActivePluck((current) => (current?.string === string ? undefined : current));
    }, 560);
    timersRef.current.push(...wobbleTimers, clearTimer);
  };

  const selectRandomMelody = () => {
    if (melodies.length === 1) { return melodies[0]; }

    let melodyIndex = Math.floor(Math.random() * melodies.length);
    if (melodyIndex === lastMelodyIndexRef.current) {
      melodyIndex = (melodyIndex + 1) % melodies.length;
    }
    lastMelodyIndexRef.current = melodyIndex;
    return melodies[melodyIndex] ?? melodies[0];
  };

  const playMelody = (audioContext: AudioContext | undefined) => {
    clearStringTimers();
    stopMelodyNotes(audioContext);
    setActivePluck(undefined);
    setMelodyPlaying(true);
    const melody = selectRandomMelody();

    if (audioContext) {
      void audioContext.resume();
      const startTime = audioContext.currentTime + MELODY_START_DELAY_SECONDS;
      melody.forEach((note) => {
        melodyNodesRef.current.push(
          playHarpNote(audioContext, note.frequency, startTime + (note.beat * BEAT_MS) / 1_000, note.duration),
        );
      });
    }

    timersRef.current = melody.map((note) => (
      window.setTimeout(() => scheduleStringWobble(note.string), note.beat * BEAT_MS)
    ));
    const melodyEndMs = melody.reduce((endMs, note) => (
      Math.max(endMs, ((note.beat * BEAT_MS) + ((note.duration + HARP_NOTE_RELEASE_SECONDS) * 1_000)))
    ), 0);
    timersRef.current.push(window.setTimeout(() => {
      setMelodyPlaying(false);
    }, melodyEndMs + (MELODY_START_DELAY_SECONDS * 1_000)));
  };

  const pluckString = (string: number) => {
    if (isMelodyPlayingRef.current) { return; }

    const audioContext = getAudioContext();
    const frequency = stringFrequencies[string] ?? stringFrequencies[0];
    if (audioContext) {
      void audioContext.resume();
      playHarpNote(audioContext, frequency, audioContext.currentTime, 1.35);
    }

    scheduleStringWobble(string);
  };

  const stopPointerPlucking = () => {
    isPointerPluckingRef.current = false;
    lastPointerStringRef.current = undefined;
  };

  const startPointerPlucking = (string: number) => {
    isPointerPluckingRef.current = true;
    lastPointerStringRef.current = string;
    pluckString(string);
  };

  const continuePointerPlucking = (string: number) => {
    if (!isPointerPluckingRef.current || lastPointerStringRef.current === string) { return; }

    lastPointerStringRef.current = string;
    pluckString(string);
  };

  const handleHarpPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (isMelodyPlayingRef.current) { return; }
    if (event.pointerType === 'mouse' && event.button !== 0) { return; }

    const string = harpStringFromPointer(event);
    if (string === undefined) { return; }

    event.currentTarget.setPointerCapture(event.pointerId);
    startPointerPlucking(string);
  };

  const handleHarpPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const string = harpStringFromPointer(event);
    setUserNotePreview(string);

    if (!isPointerPluckingRef.current) { return; }
    if (event.pointerType === 'mouse' && event.buttons !== 1) {
      stopPointerPlucking();
      return;
    }

    if (string !== undefined) {
      continuePointerPlucking(string);
    }
  };

  const handleHarpPointerEnd = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    stopPointerPlucking();
  };

  const handleHarpPointerLeave = () => {
    if (!isPointerPluckingRef.current) {
      setUserNotePreview(undefined);
    }
  };

  const handleStringFocus = (string: number) => {
    setUserNotePreview(string);
  };

  const handleStringBlur = (string: number) => {
    if (previewString === string) {
      setUserNotePreview(undefined);
    }
  };

  const handleStringKeyDown = (event: ReactKeyboardEvent<SVGPathElement>, string: number) => {
    if (isMelodyPlayingRef.current) { return; }
    if (event.key !== 'Enter' && event.key !== ' ') { return; }

    event.preventDefault();
    pluckString(string);
  };

  const handleReplayMelody = () => {
    playMelody(getAudioContext());
  };

  const handleBackdropClick = () => {
    if (Date.now() - openedAtRef.current < BACKDROP_DISMISS_DELAY_MS) { return; }

    onDismiss();
  };

  useEffect(() => {
    if (!isVisible) { return undefined; }

    openedAtRef.current = Date.now();
    const audioContext = createAudioContext();
    audioContextRef.current = audioContext;
    playMelody(audioContext);

    return () => {
      clearStringTimers();
      stopMelodyNotes(audioContextRef.current);
      setActivePluck(undefined);
      setNotePreview(undefined);
      setMelodyPlaying(false);
      stopPointerPlucking();
      void audioContextRef.current?.close();
      audioContextRef.current = undefined;
    };
  }, [isVisible]);

  if (!isVisible) { return null; }

  return (
    <div className={'easter-egg-overlay'} role={'presentation'} onClick={handleBackdropClick}>
      <section
        className={'easter-egg-dialog'}
        role={'dialog'}
        aria-modal={'true'}
        aria-labelledby={'easter-egg-title'}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type={'button'}
          className={'button button-icon easter-egg-close'}
          aria-label={messages.easterEgg.dismiss}
          title={messages.easterEgg.dismiss}
          onClick={onDismiss}
          autoFocus={true}
        >
          <svg aria-hidden={'true'} className={'button-icon-svg'} viewBox={'0 0 24 24'}>
            <path d={mdiClose} fill={'currentColor'} />
          </svg>
        </button>

        <div className={'easter-egg-visual'}>
          <div className={'easter-egg-scanline'} aria-hidden={'true'} />
          <button
            type={'button'}
            className={'easter-egg-star'}
            aria-label={messages.easterEgg.replay}
            title={messages.easterEgg.replay}
            onClick={handleReplayMelody}
          >
            <svg aria-hidden={'true'} viewBox={'0 0 24 24'}>
              <path d={mdiStarFourPoints} fill={'currentColor'} />
            </svg>
          </button>
          <svg
            className={'easter-egg-harp'}
            role={'group'}
            aria-label={messages.easterEgg.harpStringsLabel}
            viewBox={`0 0 ${HARP_VIEWBOX_WIDTH} ${HARP_VIEWBOX_HEIGHT}`}
            preserveAspectRatio={'none'}
            onPointerDown={handleHarpPointerDown}
            onPointerMove={handleHarpPointerMove}
            onPointerUp={handleHarpPointerEnd}
            onPointerCancel={handleHarpPointerEnd}
            onPointerLeave={handleHarpPointerLeave}
          >
            {Array.from({ length: HARP_STRING_COUNT }, (_, index) => (
              <g key={index}>
                <path
                  className={'easter-egg-string-hit'}
                  d={harpStringPath(harpStringX(index))}
                  role={'button'}
                  tabIndex={isMelodyPlaying ? -1 : 0}
                  aria-disabled={isMelodyPlaying}
                  aria-label={formatHarpStringLabel(
                    messages.easterEgg.harpStringLabel,
                    stringNoteNames[index],
                    stringKeyboardKeys[index],
                  )}
                  onFocus={() => handleStringFocus(index)}
                  onBlur={() => handleStringBlur(index)}
                  onKeyDown={(event) => handleStringKeyDown(event, index)}
                />
                <path
                  className={`easter-egg-string ${activePluck?.string === index ? 'easter-egg-string-active' : ''}`}
                  style={activePluck?.string === index ? noteColorStyle(index) : undefined}
                  d={harpStringPath(
                    harpStringX(index),
                    activePluck?.string === index ? activePluck.offset : 0,
                  )}
                  strokeWidth={harpStringWidth()}
                />
              </g>
            ))}
          </svg>
          <div
            className={`easter-egg-note-preview ${previewString === undefined ? 'easter-egg-note-preview-hidden' : ''}`}
            style={noteColorStyle(previewString)}
          >
            <span>{previewString === undefined ? null : stringNoteNames[previewString]}</span>
          </div>
        </div>

        <div className={'easter-egg-copy'}>
          <h2 id={'easter-egg-title'} className={'section-group'}>{messages.easterEgg.title}</h2>
          <p className={'title title-md'}>{messages.easterEgg.body}</p>
        </div>
      </section>
    </div>
  );
}
