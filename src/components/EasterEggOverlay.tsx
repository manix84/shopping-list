import { mdiClose, mdiStarFourPoints } from '@mdi/js';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../lib/i18n';

type EasterEggOverlayProps = {
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
  g5: 783.99,
} as const;
const melody = [
  { beat: 0, duration: 1.8, frequency: noteFrequencies.c4, string: 2 },
  { beat: 0.5, duration: 1.55, frequency: noteFrequencies.e4, string: 4 },
  { beat: 1, duration: 1.6, frequency: noteFrequencies.g4, string: 6 },
  { beat: 1.5, duration: 1.65, frequency: noteFrequencies.c5, string: 9 },
  { beat: 2.25, duration: 1.4, frequency: noteFrequencies.b4, string: 8 },
  { beat: 2.75, duration: 1.45, frequency: noteFrequencies.g4, string: 6 },
  { beat: 3.25, duration: 1.6, frequency: noteFrequencies.e4, string: 4 },
  { beat: 4, duration: 1.9, frequency: noteFrequencies.f4, string: 5 },
  { beat: 4.5, duration: 1.45, frequency: noteFrequencies.a4, string: 7 },
  { beat: 5, duration: 1.55, frequency: noteFrequencies.c5, string: 9 },
  { beat: 5.5, duration: 1.55, frequency: noteFrequencies.e5, string: 11 },
  { beat: 6.25, duration: 1.35, frequency: noteFrequencies.d5, string: 10 },
  { beat: 6.75, duration: 1.45, frequency: noteFrequencies.c5, string: 9 },
  { beat: 7.25, duration: 1.5, frequency: noteFrequencies.a4, string: 7 },
  { beat: 8, duration: 1.85, frequency: noteFrequencies.g4, string: 6 },
  { beat: 8.5, duration: 1.45, frequency: noteFrequencies.b4, string: 8 },
  { beat: 9, duration: 1.55, frequency: noteFrequencies.d5, string: 10 },
  { beat: 9.5, duration: 1.7, frequency: noteFrequencies.g5, string: 11 },
  { beat: 10.25, duration: 1.35, frequency: noteFrequencies.e5, string: 11 },
  { beat: 10.75, duration: 1.45, frequency: noteFrequencies.d5, string: 10 },
  { beat: 11.25, duration: 1.55, frequency: noteFrequencies.b4, string: 8 },
  { beat: 12, duration: 2.4, frequency: noteFrequencies.c5, string: 9 },
];

const createAudioContext = (): AudioContext | undefined => {
  const AudioContextConstructor = window.AudioContext;
  return AudioContextConstructor ? new AudioContextConstructor() : undefined;
};

const playHarpNote = (audioContext: AudioContext, frequency: number, startTime: number, duration: number) => {
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
  oscillator.stop(startTime + duration + 0.05);
  overtone.stop(startTime + duration + 0.05);
};

const harpStringX = (index: number) => HARP_X_START + index * HARP_X_GAP;

const harpStringPath = (x: number, offset = 0) => (
  `M ${x} ${HARP_TOP_Y} Q ${x + offset} ${HARP_VIEWBOX_HEIGHT / 2} ${x} ${HARP_BOTTOM_Y}`
);

const harpStringWidth = (index: number) => Math.max(0.55, 1.25 - index * 0.045);

export function EasterEggOverlay({ isVisible, onDismiss }: EasterEggOverlayProps) {
  const { messages } = useI18n();
  const [activePluck, setActivePluck] = useState<{ offset: number; string: number }>();
  const audioContextRef = useRef<AudioContext>();
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!isVisible) { return undefined; }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onDismiss]);

  useEffect(() => {
    if (!isVisible) { return undefined; }

    const audioContext = createAudioContext();
    audioContextRef.current = audioContext;
    setActivePluck(undefined);

    if (audioContext) {
      void audioContext.resume();
      const startTime = audioContext.currentTime + 0.05;
      melody.forEach((note) => {
        playHarpNote(audioContext, note.frequency, startTime + (note.beat * BEAT_MS) / 1_000, note.duration);
      });
    }

    const wobbleFrames = [
      { delay: 0, offset: 0 },
      { delay: 42, offset: 8 },
      { delay: 96, offset: -6 },
      { delay: 158, offset: 4 },
      { delay: 236, offset: -2 },
      { delay: 330, offset: 1 },
      { delay: 450, offset: 0 },
    ];
    timersRef.current = melody.flatMap((note) => (
      wobbleFrames.map((frame) => (
        window.setTimeout(
          () => setActivePluck({ offset: frame.offset, string: note.string }),
          note.beat * BEAT_MS + frame.delay,
        )
      )).concat(
        window.setTimeout(() => setActivePluck(undefined), note.beat * BEAT_MS + 560),
      )
    ));

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
      setActivePluck(undefined);
      void audioContextRef.current?.close();
      audioContextRef.current = undefined;
    };
  }, [isVisible]);

  if (!isVisible) { return null; }

  return (
    <div className={'easter-egg-overlay'} role={'presentation'} onClick={onDismiss}>
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
        >
          <svg aria-hidden={'true'} className={'button-icon-svg'} viewBox={'0 0 24 24'}>
            <path d={mdiClose} fill={'currentColor'} />
          </svg>
        </button>

        <div className={'easter-egg-visual'} aria-hidden={'true'}>
          <div className={'easter-egg-scanline'} />
          <svg className={'easter-egg-star'} viewBox={'0 0 24 24'}>
            <path d={mdiStarFourPoints} fill={'currentColor'} />
          </svg>
          <svg
            className={'easter-egg-harp'}
            viewBox={`0 0 ${HARP_VIEWBOX_WIDTH} ${HARP_VIEWBOX_HEIGHT}`}
            preserveAspectRatio={'none'}
          >
            {Array.from({ length: HARP_STRING_COUNT }, (_, index) => (
              <path
                key={index}
                className={`easter-egg-string ${activePluck?.string === index ? 'easter-egg-string-active' : ''}`}
                d={harpStringPath(
                  harpStringX(index),
                  activePluck?.string === index ? activePluck.offset : 0,
                )}
                strokeWidth={harpStringWidth(index)}
              />
            ))}
          </svg>
        </div>

        <div className={'easter-egg-copy'}>
          <p className={'section-group'}>{messages.easterEgg.title}</p>
          <h2 id={'easter-egg-title'} className={'title title-md'}>{messages.easterEgg.body}</h2>
        </div>
      </section>
    </div>
  );
}
