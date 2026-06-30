(function () {
  function startSpin(options) {
    const { startRotation, targetRotation, duration = 3000, onFrame, onComplete } = options;
    const startTime = performance.now();
    let frameId = 0;
    let cancelled = false;

    function tick(now) {
      if (cancelled) {
        return;
      }

      const elapsed = Math.min(now - startTime, duration);
      const progress = elapsed / duration;
      const curve = getCurve(progress);
      const rotation = startRotation + (targetRotation - startRotation) * curve;

      if (typeof onFrame === 'function') {
        onFrame(rotation, elapsed);
      }

      if (elapsed < duration) {
        frameId = window.requestAnimationFrame(tick);
      } else if (typeof onComplete === 'function') {
        onComplete();
      }
    }

    frameId = window.requestAnimationFrame(tick);

    return function cancel() {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
    };
  }

  function getCurve(progress) {
    if (progress < 0.3) {
      const eased = progress / 0.3;
      return eased * eased;
    }

    if (progress < 0.85) {
      return 1;
    }

    const eased = (progress - 0.85) / 0.15;
    return 1 - eased * eased;
  }

  window.RandomWheelAnimation = {
    startSpin
  };
})();
