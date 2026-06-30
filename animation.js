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
    // 使用平滑的 ease-out 三次方缓动，避免长时间匀速或跳跃导致的不顺滑感
    const t = Math.max(0, Math.min(1, progress));
    return 1 - Math.pow(1 - t, 3); // easeOutCubic
  }

  window.RandomWheelAnimation = {
    startSpin
  };
})();
