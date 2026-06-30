(function () {
  function drawWheel(canvas, wheel, rotation) {
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // 以可用空间的 42% 作为转盘半径，确保留出指针区域。
    const radius = Math.min(rect.width, rect.height) * 0.42;
    const items = wheel && Array.isArray(wheel.items) ? wheel.items : [];

    context.save();
    context.translate(centerX, centerY);
    context.rotate(rotation || 0);

    if (!items.length) {
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.fillStyle = '#fff';
      context.fill();
      context.strokeStyle = '#000';
      context.lineWidth = 1.2;
      context.stroke();

      context.fillStyle = '#000';
      context.font = '20px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('请添加选项', 0, 0);
      context.restore();
      return;
    }

    const segmentAngle = (Math.PI * 2) / items.length;

    items.forEach((item, index) => {
      const startAngle = -Math.PI / 2 - segmentAngle / 2 + index * segmentAngle;
      const endAngle = startAngle + segmentAngle;

      context.beginPath();
      context.moveTo(0, 0);
      context.arc(0, 0, radius, startAngle, endAngle);
      context.closePath();
      context.fillStyle = '#fff';
      context.strokeStyle = '#000';
      context.lineWidth = 1.2;
      context.fill();
      context.stroke();

      const textRadius = radius * 0.72;
      const textAngle = startAngle + segmentAngle / 2;
      const x = Math.cos(textAngle) * textRadius;
      const y = Math.sin(textAngle) * textRadius;

      context.save();
      context.translate(x, y);
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = '#000';

      let fontSize = Math.max(12, Math.min(24, radius * 0.09));
      context.font = `${fontSize}px sans-serif`;
      while (context.measureText(item).width > radius * 0.6 && fontSize > 10) {
        fontSize -= 1;
        context.font = `${fontSize}px sans-serif`;
      }

      context.fillText(item, 0, 0);
      context.restore();
    });

    context.beginPath();
    context.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
    context.fillStyle = '#fff';
    context.fill();
    context.strokeStyle = '#000';
    context.lineWidth = 1.2;
    context.stroke();

    context.restore();
  }

  window.RandomWheelCanvas = {
    drawWheel
  };
})();
