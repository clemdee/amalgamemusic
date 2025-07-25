import type { MaybeRef } from 'vue';
import { reactive, ref, toRef } from 'vue';
import { useOn } from './event';

export const useTimer = (parameters: {
  timeout?: MaybeRef<number>
  duration?: MaybeRef<number>
  isRepeat?: MaybeRef<boolean>
  loopStart?: MaybeRef<number>
  loopEnd?: MaybeRef<number>
} = {}) => {
  const timeout = toRef(parameters.timeout ?? 200);
  const duration = toRef(parameters.duration ?? Number.POSITIVE_INFINITY);
  const isRepeat = toRef(parameters.isRepeat ?? false);
  const loopStart = toRef(parameters.loopStart ?? 0);
  const loopEnd = toRef(parameters.loopEnd ?? duration);

  const { on, dispatch } = useOn(['play', 'pause', 'loop', 'end']);

  let lastTime = 0;
  let intervalId: ReturnType<typeof setInterval> | undefined;
  const time = ref(0);
  const running = ref(false);
  const loopCount = ref(0);

  const _clearInterval = () => {
    clearInterval(intervalId);
    intervalId = undefined;
  };

  const _updateTimer = () => {
    const now = performance.now() / 1000;
    time.value += now - lastTime;
    lastTime = now;

    if (isRepeat.value && time.value >= loopEnd.value) {
      const offset = time.value - loopEnd.value;
      time.value = loopStart.value + offset;
      loopCount.value++;
      dispatch('loop');
    }

    // End of timer
    if (!isRepeat.value && time.value >= duration.value) {
      _clearInterval();
      time.value = duration.value;
      running.value = false;
      dispatch('end');
    }
  };

  const _setInterval = () => {
    _clearInterval();
    intervalId = setInterval(_updateTimer, timeout.value);
  };

  const resume = () => {
    lastTime = performance.now() / 1000;
    _updateTimer();
    running.value = true;
    dispatch('play');

    _setInterval();
  };

  const pause = () => {
    if (!running.value) return;
    _clearInterval();
    _updateTimer();
    running.value = false;
    dispatch('pause');
  };

  const update = (value: number) => {
    lastTime = performance.now() / 1000;
    time.value = value;

    if (value < loopStart.value) {
      loopCount.value = 0;
    }

    if (running.value) {
      _setInterval();
    }
  };

  return reactive({
    time,
    pause,
    resume,
    update,
    running,
    loopCount,
    on,
  });
};
