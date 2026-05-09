import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef } from 'react';

type PredatorEasterEggProps = {
  onComplete: () => void;
};

type Predator = {
  className: string;
  render: () => ReactNode;
};
type PredatorDirection = 'left-to-right' | 'right-to-left';

const RUN_DURATION_MS = 4_800;
const GROWL_DURATION_MS = 1_650;
const GROWL_MIN_GAP_MS = 300;
const FIRST_GROWL_EARLIEST_MS = 280;
const FIRST_GROWL_LATEST_MS = 620;
const SECOND_GROWL_EARLIEST_MS = 2_520;
const SECOND_GROWL_LATEST_MS = RUN_DURATION_MS - GROWL_DURATION_MS - 280;
const appBasePath = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const PREDATOR_ROAR_URL = `${appBasePath}audio/roar.mp3`;
const PREDATOR_ROAR_VOLUME = 0.9;

const predators: Predator[] = [
  {
    className: 'predator-tiger',
    render: () => (
      <>
        <path className={'predator-body'} d={'M18 70 C28 42 72 36 98 54 C118 68 124 94 106 108 C78 130 28 116 18 70 Z'} />
        <path className={'predator-chest'} d={'M18 70 C36 86 72 92 106 108 C82 130 28 116 18 70 Z'} />
        <path className={'predator-head'} d={'M78 42 C96 20 132 28 140 58 C146 80 126 98 100 92 C80 88 66 62 78 42 Z'} />
        <circle className={'predator-cheek'} cx={'124'} cy={'72'} r={'9'} />
        <path className={'predator-belly'} d={'M40 82 C54 66 86 68 98 88 C86 108 54 108 40 82 Z'} />
        <path className={'predator-ear'} d={'M88 42 L90 18 L106 36 M120 40 L136 22 L136 48'} />
        <path className={'predator-snout'} d={'M118 62 C132 58 144 62 146 72 C136 82 120 80 112 70 Z'} />
        <path className={'predator-mark'} d={'M42 47 L32 78 M58 42 L48 86 M76 44 L66 92 M96 52 L86 88'} />
        <path className={'predator-leg predator-leg-front'} d={'M84 104 L96 136'} />
        <path className={'predator-leg predator-leg-back'} d={'M42 104 L30 136'} />
        <path className={'predator-tail'} d={'M21 66 C-4 54 -6 28 15 22'} />
        <circle className={'predator-eye'} cx={'116'} cy={'56'} r={'3'} />
        <circle className={'predator-eye-shine'} cx={'117'} cy={'55'} r={'1'} />
        <circle className={'predator-nose'} cx={'140'} cy={'70'} r={'3'} />
        <path className={'predator-mouth'} d={'M123 70 C130 72 135 70 140 66'} />
        <ellipse className={'predator-paw predator-leg-front'} cx={'99'} cy={'137'} rx={'10'} ry={'5'} />
        <ellipse className={'predator-paw predator-leg-back'} cx={'29'} cy={'137'} rx={'10'} ry={'5'} />
        <path className={'predator-claw'} d={'M96 136 L106 140 M30 136 L20 140'} />
      </>
    ),
  },
  {
    className: 'predator-rex',
    render: () => (
      <>
        <path className={'predator-body'} d={'M20 82 C42 44 94 38 116 70 C128 88 118 110 84 116 C48 122 12 108 20 82 Z'} />
        <path className={'predator-chest'} d={'M46 92 C62 104 92 106 112 92 C104 118 58 124 30 98 Z'} />
        <path className={'predator-head'} d={'M92 34 C118 12 154 28 158 56 C160 74 142 84 114 76 C94 70 82 50 92 34 Z'} />
        <path className={'predator-belly'} d={'M52 84 C70 68 102 74 108 92 C92 108 64 108 52 84 Z'} />
        <path className={'predator-mark'} d={'M48 62 L56 48 M68 56 L76 42 M88 58 L98 46'} />
        <path className={'predator-arm'} d={'M94 80 L118 92'} />
        <path className={'predator-leg predator-leg-front'} d={'M82 110 L96 138'} />
        <path className={'predator-leg predator-leg-back'} d={'M48 110 L34 138'} />
        <path className={'predator-tail'} d={'M24 78 C-10 62 -10 34 16 24'} />
        <circle className={'predator-eye'} cx={'132'} cy={'50'} r={'3'} />
        <circle className={'predator-eye-shine'} cx={'133'} cy={'49'} r={'1'} />
        <circle className={'predator-nose'} cx={'154'} cy={'58'} r={'3'} />
        <path className={'predator-mouth'} d={'M134 66 L158 66'} />
        <path className={'predator-tooth'} d={'M143 66 L147 74 L151 66'} />
        <ellipse className={'predator-paw predator-leg-front'} cx={'98'} cy={'139'} rx={'10'} ry={'5'} />
        <ellipse className={'predator-paw predator-leg-back'} cx={'33'} cy={'139'} rx={'10'} ry={'5'} />
        <path className={'predator-claw'} d={'M96 138 L108 142 M34 138 L24 142'} />
      </>
    ),
  },
  {
    className: 'predator-shark',
    render: () => (
      <>
        <path className={'predator-body'} d={'M12 82 C48 42 110 38 154 72 C112 112 54 126 12 82 Z'} />
        <path className={'predator-chest'} d={'M44 94 C76 108 118 100 154 72 C118 112 54 126 12 82 Z'} />
        <path className={'predator-belly'} d={'M46 94 C76 84 120 82 146 74 C118 104 72 116 46 94 Z'} />
        <path className={'predator-fin'} d={'M78 56 L96 18 L106 62'} />
        <path className={'predator-tail'} d={'M17 82 L-10 56 L-8 108 Z'} />
        <path className={'predator-gill'} d={'M112 72 L104 84 M120 74 L112 88'} />
        <path className={'predator-leg predator-leg-front'} d={'M88 110 L104 136'} />
        <path className={'predator-leg predator-leg-back'} d={'M54 112 L40 136'} />
        <circle className={'predator-eye'} cx={'130'} cy={'68'} r={'3'} />
        <circle className={'predator-eye-shine'} cx={'131'} cy={'67'} r={'1'} />
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
        <path className={'predator-chest'} d={'M48 94 C82 106 124 100 154 78 C124 106 52 118 18 86 Z'} />
        <path className={'predator-head'} d={'M110 52 C138 42 166 54 170 72 C146 82 124 82 104 72 Z'} />
        <path className={'predator-belly'} d={'M48 92 C78 80 122 82 148 78 C118 100 74 108 48 92 Z'} />
        <path className={'predator-mark'} d={'M40 76 L52 62 M60 76 L72 62 M80 76 L92 62 M100 76 L112 62'} />
        <path className={'predator-snout'} d={'M132 60 C152 56 168 62 174 72 C158 78 140 76 128 70 Z'} />
        <path className={'predator-tail'} d={'M22 84 C-12 74 -14 44 12 34'} />
        <path className={'predator-leg predator-leg-front'} d={'M96 106 L116 132'} />
        <path className={'predator-leg predator-leg-back'} d={'M50 108 L32 132'} />
        <circle className={'predator-eye'} cx={'146'} cy={'62'} r={'3'} />
        <circle className={'predator-eye-shine'} cx={'147'} cy={'61'} r={'1'} />
        <circle className={'predator-nose'} cx={'166'} cy={'70'} r={'2.5'} />
        <path className={'predator-mouth'} d={'M128 74 L166 74'} />
        <path className={'predator-tooth'} d={'M138 74 L142 82 L146 74 M154 74 L158 82 L162 74'} />
        <ellipse className={'predator-paw predator-leg-front'} cx={'117'} cy={'133'} rx={'10'} ry={'5'} />
        <ellipse className={'predator-paw predator-leg-back'} cx={'31'} cy={'133'} rx={'10'} ry={'5'} />
        <path className={'predator-claw'} d={'M116 132 L128 136 M32 132 L20 136'} />
      </>
    ),
  },
  {
    className: 'predator-raptor',
    render: () => (
      <>
        <path className={'predator-body'} d={'M24 82 C46 42 92 44 112 78 C126 102 96 122 58 112 C30 104 14 96 24 82 Z'} />
        <path className={'predator-chest'} d={'M50 92 C68 104 96 102 112 82 C108 116 58 126 24 92 Z'} />
        <path className={'predator-head'} d={'M88 40 C108 20 144 28 150 54 C136 66 112 68 92 56 Z'} />
        <path className={'predator-belly'} d={'M52 84 C68 70 94 74 106 92 C90 108 64 106 52 84 Z'} />
        <path className={'predator-mark'} d={'M50 62 L58 48 M70 58 L78 44 M92 62 L102 50'} />
        <path className={'predator-arm'} d={'M86 78 L112 82'} />
        <path className={'predator-leg predator-leg-front'} d={'M78 108 L96 138'} />
        <path className={'predator-leg predator-leg-back'} d={'M46 108 L32 138'} />
        <path className={'predator-tail'} d={'M28 78 C-4 64 -2 34 20 22'} />
        <circle className={'predator-eye'} cx={'128'} cy={'48'} r={'3'} />
        <circle className={'predator-eye-shine'} cx={'129'} cy={'47'} r={'1'} />
        <circle className={'predator-nose'} cx={'148'} cy={'54'} r={'2.5'} />
        <path className={'predator-mouth'} d={'M124 60 L148 58'} />
        <ellipse className={'predator-paw predator-leg-front'} cx={'98'} cy={'139'} rx={'10'} ry={'5'} />
        <ellipse className={'predator-paw predator-leg-back'} cx={'31'} cy={'139'} rx={'10'} ry={'5'} />
        <path className={'predator-claw'} d={'M96 138 L108 142 M32 138 L22 142'} />
      </>
    ),
  },
  {
    className: 'predator-wolf',
    render: () => (
      <>
        <path className={'predator-body'} d={'M20 76 C34 46 82 40 112 58 C132 72 126 104 96 114 C58 126 22 108 20 76 Z'} />
        <path className={'predator-chest'} d={'M42 88 C62 104 96 104 112 80 C104 118 58 126 22 92 Z'} />
        <path className={'predator-head'} d={'M88 44 C104 24 134 28 150 48 L130 64 C112 76 88 66 88 44 Z'} />
        <circle className={'predator-cheek'} cx={'128'} cy={'58'} r={'8'} />
        <path className={'predator-belly'} d={'M44 84 C62 66 96 70 108 92 C92 110 58 108 44 84 Z'} />
        <path className={'predator-ear'} d={'M102 34 L108 12 L118 36 M130 34 L142 18 L142 44'} />
        <path className={'predator-snout'} d={'M122 52 L152 48 L132 66 Z'} />
        <path className={'predator-leg predator-leg-front'} d={'M88 108 L104 136'} />
        <path className={'predator-leg predator-leg-back'} d={'M44 108 L30 136'} />
        <path className={'predator-tail'} d={'M24 70 C-2 42 8 20 30 30'} />
        <circle className={'predator-eye'} cx={'124'} cy={'48'} r={'3'} />
        <circle className={'predator-eye-shine'} cx={'125'} cy={'47'} r={'1'} />
        <circle className={'predator-nose'} cx={'148'} cy={'48'} r={'3'} />
        <path className={'predator-mouth'} d={'M130 58 C138 62 144 60 150 54'} />
        <ellipse className={'predator-paw predator-leg-front'} cx={'106'} cy={'137'} rx={'10'} ry={'5'} />
        <ellipse className={'predator-paw predator-leg-back'} cx={'29'} cy={'137'} rx={'10'} ry={'5'} />
        <path className={'predator-claw'} d={'M104 136 L114 140 M30 136 L20 140'} />
      </>
    ),
  },
  {
    className: 'predator-bear',
    render: () => (
      <>
        <path className={'predator-body'} d={'M16 82 C22 46 70 30 110 48 C146 64 146 104 110 120 C68 138 10 118 16 82 Z'} />
        <path className={'predator-chest'} d={'M46 94 C66 118 106 118 128 92 C116 134 50 142 16 100 Z'} />
        <path className={'predator-head'} d={'M92 42 C110 20 146 30 152 58 C156 82 132 96 108 86 C88 78 78 58 92 42 Z'} />
        <circle className={'predator-cheek'} cx={'128'} cy={'72'} r={'10'} />
        <path className={'predator-belly'} d={'M48 88 C64 66 104 68 122 94 C104 118 64 116 48 88 Z'} />
        <path className={'predator-ear'} d={'M102 38 C98 22 112 18 120 32 M136 42 C140 26 154 28 154 44'} />
        <path className={'predator-snout'} d={'M118 62 C134 58 150 66 150 76 C140 88 122 84 112 72 Z'} />
        <path className={'predator-leg predator-leg-front'} d={'M92 114 L110 138'} />
        <path className={'predator-leg predator-leg-back'} d={'M44 116 L28 138'} />
        <path className={'predator-tail'} d={'M18 82 C4 74 6 58 22 56'} />
        <circle className={'predator-eye'} cx={'126'} cy={'56'} r={'3'} />
        <circle className={'predator-eye-shine'} cx={'127'} cy={'55'} r={'1'} />
        <circle className={'predator-nose'} cx={'146'} cy={'72'} r={'3'} />
        <path className={'predator-mouth'} d={'M120 72 C130 78 140 76 150 68'} />
        <ellipse className={'predator-paw predator-leg-front'} cx={'111'} cy={'139'} rx={'11'} ry={'5'} />
        <ellipse className={'predator-paw predator-leg-back'} cx={'27'} cy={'139'} rx={'11'} ry={'5'} />
        <path className={'predator-claw'} d={'M110 138 L120 142 M28 138 L18 142'} />
      </>
    ),
  },
];

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const predatorGrowlDelays = (): [number, number] => {
  const first = randomBetween(FIRST_GROWL_EARLIEST_MS, FIRST_GROWL_LATEST_MS);
  const secondEarliest = Math.max(
    SECOND_GROWL_EARLIEST_MS,
    first + GROWL_DURATION_MS + GROWL_MIN_GAP_MS,
  );
  const second = randomBetween(secondEarliest, SECOND_GROWL_LATEST_MS);
  return [first, second];
};

const playGrowl = () => {
  const roar = new Audio(PREDATOR_ROAR_URL);
  roar.preload = 'auto';
  roar.volume = PREDATOR_ROAR_VOLUME;
  roar.currentTime = 0;

  void roar.play().catch(() => undefined);

  return () => {
    roar.pause();
    roar.currentTime = 0;
  };
};

export function PredatorEasterEgg({ onComplete }: PredatorEasterEggProps) {
  const predator = useMemo(() => predators[Math.floor(Math.random() * predators.length)] ?? predators[0], []);
  const direction = useMemo<PredatorDirection>(() => Math.random() < 0.5 ? 'left-to-right' : 'right-to-left', []);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let isCancelled = false;
    const stopGrowls: Array<() => void> = [];
    const growlTimers = predatorGrowlDelays().map((delay) =>
      window.setTimeout(() => {
        if (isCancelled) { return; }

        const stopGrowl = playGrowl();
        if (stopGrowl) {
          stopGrowls.push(stopGrowl);
        }
      }, delay),
    );
    const completeTimer = window.setTimeout(() => {
      isCancelled = true;
      for (const growlTimer of growlTimers) {
        window.clearTimeout(growlTimer);
      }
      onCompleteRef.current();
    }, RUN_DURATION_MS);

    return () => {
      isCancelled = true;
      for (const growlTimer of growlTimers) {
        window.clearTimeout(growlTimer);
      }
      window.clearTimeout(completeTimer);
      for (const stopGrowl of stopGrowls) {
        stopGrowl();
      }
    };
  }, []);

  return (
    <div className={`predator-easter-egg predator-easter-egg-${direction}`} aria-hidden={'true'}>
      <div className={'predator-shadow'} />
      <div className={'predator-puppet-facing'}>
        <svg
          className={`predator-puppet ${predator.className}`}
          viewBox={'-18 0 196 150'}
        >
          {predator.render()}
        </svg>
      </div>
    </div>
  );
}
