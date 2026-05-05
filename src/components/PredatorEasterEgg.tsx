import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';

type PredatorEasterEggProps = {
  onComplete: () => void;
};

type Predator = {
  className: string;
  render: () => ReactNode;
};

const RUN_DURATION_MS = 4_800;

const predators: Predator[] = [
  {
    className: 'predator-tiger',
    render: () => (
      <>
        <path className={'predator-body'} d={'M18 70 C28 42 72 36 98 54 C118 68 124 94 106 108 C78 130 28 116 18 70 Z'} />
        <path className={'predator-head'} d={'M78 42 C96 20 132 28 140 58 C146 80 126 98 100 92 C80 88 66 62 78 42 Z'} />
        <path className={'predator-belly'} d={'M40 82 C54 66 86 68 98 88 C86 108 54 108 40 82 Z'} />
        <path className={'predator-ear'} d={'M88 42 L90 18 L106 36 M120 40 L136 22 L136 48'} />
        <path className={'predator-snout'} d={'M118 62 C132 58 144 62 146 72 C136 82 120 80 112 70 Z'} />
        <path className={'predator-mark'} d={'M42 47 L32 78 M58 42 L48 86 M76 44 L66 92 M96 52 L86 88'} />
        <path className={'predator-leg predator-leg-front'} d={'M84 104 L96 136'} />
        <path className={'predator-leg predator-leg-back'} d={'M42 104 L30 136'} />
        <path className={'predator-tail'} d={'M21 66 C-4 54 -6 28 15 22'} />
        <circle className={'predator-eye'} cx={'116'} cy={'56'} r={'3'} />
        <circle className={'predator-nose'} cx={'140'} cy={'70'} r={'3'} />
        <path className={'predator-mouth'} d={'M123 70 C130 72 135 70 140 66'} />
        <path className={'predator-claw'} d={'M96 136 L106 140 M30 136 L20 140'} />
      </>
    ),
  },
  {
    className: 'predator-rex',
    render: () => (
      <>
        <path className={'predator-body'} d={'M20 82 C42 44 94 38 116 70 C128 88 118 110 84 116 C48 122 12 108 20 82 Z'} />
        <path className={'predator-head'} d={'M92 34 C118 12 154 28 158 56 C160 74 142 84 114 76 C94 70 82 50 92 34 Z'} />
        <path className={'predator-belly'} d={'M52 84 C70 68 102 74 108 92 C92 108 64 108 52 84 Z'} />
        <path className={'predator-mark'} d={'M48 62 L56 48 M68 56 L76 42 M88 58 L98 46'} />
        <path className={'predator-arm'} d={'M94 80 L118 92'} />
        <path className={'predator-leg predator-leg-front'} d={'M82 110 L96 138'} />
        <path className={'predator-leg predator-leg-back'} d={'M48 110 L34 138'} />
        <path className={'predator-tail'} d={'M24 78 C-10 62 -10 34 16 24'} />
        <circle className={'predator-eye'} cx={'132'} cy={'50'} r={'3'} />
        <circle className={'predator-nose'} cx={'154'} cy={'58'} r={'3'} />
        <path className={'predator-mouth'} d={'M134 66 L158 66'} />
        <path className={'predator-tooth'} d={'M143 66 L147 74 L151 66'} />
        <path className={'predator-claw'} d={'M96 138 L108 142 M34 138 L24 142'} />
      </>
    ),
  },
  {
    className: 'predator-shark',
    render: () => (
      <>
        <path className={'predator-body'} d={'M12 82 C48 42 110 38 154 72 C112 112 54 126 12 82 Z'} />
        <path className={'predator-belly'} d={'M46 94 C76 84 120 82 146 74 C118 104 72 116 46 94 Z'} />
        <path className={'predator-fin'} d={'M78 56 L96 18 L106 62'} />
        <path className={'predator-tail'} d={'M17 82 L-10 56 L-8 108 Z'} />
        <path className={'predator-gill'} d={'M112 72 L104 84 M120 74 L112 88'} />
        <path className={'predator-leg predator-leg-front'} d={'M88 110 L104 136'} />
        <path className={'predator-leg predator-leg-back'} d={'M54 112 L40 136'} />
        <circle className={'predator-eye'} cx={'130'} cy={'68'} r={'3'} />
        <circle className={'predator-nose'} cx={'150'} cy={'76'} r={'2.5'} />
        <path className={'predator-mouth'} d={'M124 86 C136 92 146 90 154 82'} />
        <path className={'predator-tooth'} d={'M134 89 L138 98 L142 89'} />
      </>
    ),
  },
  {
    className: 'predator-croc',
    render: () => (
      <>
        <path className={'predator-body'} d={'M18 86 C48 54 118 58 154 78 C124 106 52 118 18 86 Z'} />
        <path className={'predator-head'} d={'M110 52 C138 42 166 54 170 72 C146 82 124 82 104 72 Z'} />
        <path className={'predator-belly'} d={'M48 92 C78 80 122 82 148 78 C118 100 74 108 48 92 Z'} />
        <path className={'predator-mark'} d={'M40 76 L52 62 M60 76 L72 62 M80 76 L92 62 M100 76 L112 62'} />
        <path className={'predator-snout'} d={'M132 60 C152 56 168 62 174 72 C158 78 140 76 128 70 Z'} />
        <path className={'predator-tail'} d={'M22 84 C-12 74 -14 44 12 34'} />
        <path className={'predator-leg predator-leg-front'} d={'M96 106 L116 132'} />
        <path className={'predator-leg predator-leg-back'} d={'M50 108 L32 132'} />
        <circle className={'predator-eye'} cx={'146'} cy={'62'} r={'3'} />
        <circle className={'predator-nose'} cx={'166'} cy={'70'} r={'2.5'} />
        <path className={'predator-mouth'} d={'M128 74 L166 74'} />
        <path className={'predator-tooth'} d={'M138 74 L142 82 L146 74 M154 74 L158 82 L162 74'} />
        <path className={'predator-claw'} d={'M116 132 L128 136 M32 132 L20 136'} />
      </>
    ),
  },
  {
    className: 'predator-raptor',
    render: () => (
      <>
        <path className={'predator-body'} d={'M24 82 C46 42 92 44 112 78 C126 102 96 122 58 112 C30 104 14 96 24 82 Z'} />
        <path className={'predator-head'} d={'M88 40 C108 20 144 28 150 54 C136 66 112 68 92 56 Z'} />
        <path className={'predator-belly'} d={'M52 84 C68 70 94 74 106 92 C90 108 64 106 52 84 Z'} />
        <path className={'predator-mark'} d={'M50 62 L58 48 M70 58 L78 44 M92 62 L102 50'} />
        <path className={'predator-arm'} d={'M86 78 L112 82'} />
        <path className={'predator-leg predator-leg-front'} d={'M78 108 L96 138'} />
        <path className={'predator-leg predator-leg-back'} d={'M46 108 L32 138'} />
        <path className={'predator-tail'} d={'M28 78 C-4 64 -2 34 20 22'} />
        <circle className={'predator-eye'} cx={'128'} cy={'48'} r={'3'} />
        <circle className={'predator-nose'} cx={'148'} cy={'54'} r={'2.5'} />
        <path className={'predator-mouth'} d={'M124 60 L148 58'} />
        <path className={'predator-claw'} d={'M96 138 L108 142 M32 138 L22 142'} />
      </>
    ),
  },
  {
    className: 'predator-wolf',
    render: () => (
      <>
        <path className={'predator-body'} d={'M20 76 C34 46 82 40 112 58 C132 72 126 104 96 114 C58 126 22 108 20 76 Z'} />
        <path className={'predator-head'} d={'M88 44 C104 24 134 28 150 48 L130 64 C112 76 88 66 88 44 Z'} />
        <path className={'predator-belly'} d={'M44 84 C62 66 96 70 108 92 C92 110 58 108 44 84 Z'} />
        <path className={'predator-ear'} d={'M102 34 L108 12 L118 36 M130 34 L142 18 L142 44'} />
        <path className={'predator-snout'} d={'M122 52 L152 48 L132 66 Z'} />
        <path className={'predator-leg predator-leg-front'} d={'M88 108 L104 136'} />
        <path className={'predator-leg predator-leg-back'} d={'M44 108 L30 136'} />
        <path className={'predator-tail'} d={'M24 70 C-2 42 8 20 30 30'} />
        <circle className={'predator-eye'} cx={'124'} cy={'48'} r={'3'} />
        <circle className={'predator-nose'} cx={'148'} cy={'48'} r={'3'} />
        <path className={'predator-mouth'} d={'M130 58 C138 62 144 60 150 54'} />
        <path className={'predator-claw'} d={'M104 136 L114 140 M30 136 L20 140'} />
      </>
    ),
  },
  {
    className: 'predator-bear',
    render: () => (
      <>
        <path className={'predator-body'} d={'M16 82 C22 46 70 30 110 48 C146 64 146 104 110 120 C68 138 10 118 16 82 Z'} />
        <path className={'predator-head'} d={'M92 42 C110 20 146 30 152 58 C156 82 132 96 108 86 C88 78 78 58 92 42 Z'} />
        <path className={'predator-belly'} d={'M48 88 C64 66 104 68 122 94 C104 118 64 116 48 88 Z'} />
        <path className={'predator-ear'} d={'M102 38 C98 22 112 18 120 32 M136 42 C140 26 154 28 154 44'} />
        <path className={'predator-snout'} d={'M118 62 C134 58 150 66 150 76 C140 88 122 84 112 72 Z'} />
        <path className={'predator-leg predator-leg-front'} d={'M92 114 L110 138'} />
        <path className={'predator-leg predator-leg-back'} d={'M44 116 L28 138'} />
        <path className={'predator-tail'} d={'M18 82 C4 74 6 58 22 56'} />
        <circle className={'predator-eye'} cx={'126'} cy={'56'} r={'3'} />
        <circle className={'predator-nose'} cx={'146'} cy={'72'} r={'3'} />
        <path className={'predator-mouth'} d={'M120 72 C130 78 140 76 150 68'} />
        <path className={'predator-claw'} d={'M110 138 L120 142 M28 138 L18 142'} />
      </>
    ),
  },
];

const createGrowlContext = (): AudioContext | undefined => {
  const AudioContextConstructor = window.AudioContext;
  return AudioContextConstructor ? new AudioContextConstructor() : undefined;
};

const createDistortionCurve = (amount: number) => {
  const samples = 256;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  for (let index = 0; index < samples; index += 1) {
    const x = (index * 2) / samples - 1;
    curve[index] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
};

const playGrowl = () => {
  const audioContext = createGrowlContext();
  if (!audioContext) { return undefined; }

  void audioContext.resume();
  const now = audioContext.currentTime;
  const duration = 1.65;
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
  const samples = noiseBuffer.getChannelData(0);
  let previousSample = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const white = Math.random() * 2 - 1;
    previousSample = previousSample * 0.68 + white * 0.32;
    samples[index] = previousSample * (1 - index / samples.length);
  }

  const noise = audioContext.createBufferSource();
  const chest = audioContext.createOscillator();
  const throat = audioContext.createOscillator();
  const snarl = audioContext.createOscillator();
  const noiseFilter = audioContext.createBiquadFilter();
  const throatFilter = audioContext.createBiquadFilter();
  const distortion = audioContext.createWaveShaper();
  const breathGain = audioContext.createGain();
  const voiceGain = audioContext.createGain();
  const chestGain = audioContext.createGain();
  const snarlGain = audioContext.createGain();
  const masterGain = audioContext.createGain();
  const compressor = audioContext.createDynamicsCompressor();

  noise.buffer = noiseBuffer;
  chest.type = 'sawtooth';
  throat.type = 'sawtooth';
  snarl.type = 'square';
  chest.frequency.setValueAtTime(78, now);
  chest.frequency.exponentialRampToValueAtTime(46, now + 0.5);
  chest.frequency.exponentialRampToValueAtTime(64, now + 1.38);
  throat.frequency.setValueAtTime(132, now);
  throat.frequency.exponentialRampToValueAtTime(74, now + 0.42);
  throat.frequency.exponentialRampToValueAtTime(112, now + 0.95);
  throat.frequency.exponentialRampToValueAtTime(58, now + 1.48);
  snarl.frequency.setValueAtTime(38, now);
  snarl.frequency.exponentialRampToValueAtTime(32, now + 1.25);
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(1_200, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(430, now + 0.95);
  noiseFilter.Q.setValueAtTime(0.85, now);
  throatFilter.type = 'lowpass';
  throatFilter.frequency.setValueAtTime(860, now);
  throatFilter.frequency.exponentialRampToValueAtTime(320, now + 1.28);
  distortion.curve = createDistortionCurve(260);
  distortion.oversample = '4x';
  compressor.threshold.setValueAtTime(-22, now);
  compressor.knee.setValueAtTime(18, now);
  compressor.ratio.setValueAtTime(5, now);
  compressor.attack.setValueAtTime(0.01, now);
  compressor.release.setValueAtTime(0.16, now);

  masterGain.gain.setValueAtTime(0.0001, now);
  masterGain.gain.exponentialRampToValueAtTime(0.82, now + 0.035);
  masterGain.gain.exponentialRampToValueAtTime(0.24, now + 0.44);
  masterGain.gain.exponentialRampToValueAtTime(0.62, now + 0.66);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  voiceGain.gain.setValueAtTime(0.0001, now);
  voiceGain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
  voiceGain.gain.exponentialRampToValueAtTime(0.06, now + 0.48);
  voiceGain.gain.exponentialRampToValueAtTime(0.14, now + 0.72);
  voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  breathGain.gain.setValueAtTime(0.0001, now);
  breathGain.gain.exponentialRampToValueAtTime(0.11, now + 0.03);
  breathGain.gain.exponentialRampToValueAtTime(0.035, now + 0.52);
  breathGain.gain.exponentialRampToValueAtTime(0.085, now + 0.72);
  breathGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  chestGain.gain.setValueAtTime(0.0001, now);
  chestGain.gain.exponentialRampToValueAtTime(0.13, now + 0.04);
  chestGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  snarlGain.gain.setValueAtTime(0.0001, now);
  snarlGain.gain.exponentialRampToValueAtTime(0.028, now + 0.08);
  snarlGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
  snarlGain.gain.exponentialRampToValueAtTime(0.025, now + 0.78);
  snarlGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noise.connect(noiseFilter);
  noiseFilter.connect(breathGain);
  throat.connect(throatFilter);
  throatFilter.connect(distortion);
  distortion.connect(voiceGain);
  chest.connect(chestGain);
  snarl.connect(snarlGain);
  breathGain.connect(masterGain);
  voiceGain.connect(masterGain);
  chestGain.connect(masterGain);
  snarlGain.connect(masterGain);
  masterGain.connect(compressor);
  compressor.connect(audioContext.destination);

  noise.start(now);
  chest.start(now);
  throat.start(now + 0.02);
  snarl.start(now + 0.04);
  noise.stop(now + duration);
  chest.stop(now + duration);
  throat.stop(now + duration);
  snarl.stop(now + duration);

  const closeTimer = window.setTimeout(() => {
    void audioContext.close();
  }, 2_000);

  return () => {
    window.clearTimeout(closeTimer);
    void audioContext.close();
  };
};

export function PredatorEasterEgg({ onComplete }: PredatorEasterEggProps) {
  const predator = useMemo(() => predators[Math.floor(Math.random() * predators.length)] ?? predators[0], []);

  useEffect(() => {
    const stopGrowl = playGrowl();
    const completeTimer = window.setTimeout(onComplete, RUN_DURATION_MS);

    return () => {
      window.clearTimeout(completeTimer);
      stopGrowl?.();
    };
  }, [onComplete]);

  return (
    <div className={'predator-easter-egg'} aria-hidden={'true'}>
      <div className={'predator-shadow'} />
      <svg
        className={`predator-puppet ${predator.className}`}
        viewBox={'-18 0 196 150'}
      >
        <line className={'predator-stick'} x1={'76'} y1={'12'} x2={'76'} y2={'142'} />
        {predator.render()}
      </svg>
    </div>
  );
}
