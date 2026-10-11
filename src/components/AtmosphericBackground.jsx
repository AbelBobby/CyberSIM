import { useEffect, useRef } from 'react';

export default function AtmosphericBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = 0;
    let height = 0;

    // Restrained ambient dust particles
    const PARTICLE_COUNT = 35;
    const particles = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Re-initialize particles
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 0.9 + 0.3,
          alpha: Math.random() * 0.18 + 0.04,
          speedX: (Math.random() - 0.5) * 0.08,
          speedY: -Math.random() * 0.15 - 0.03, // slow upward drift
          color: Math.random() > 0.8 ? '#8A929D' : '#475569',
        });
      }
    }

    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();

    function render(currentTime) {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Pitch-black Gravity-inspired subtle radial gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.4, width * 0.05,
        width * 0.5, height * 0.5, width * 0.9
      );
      bgGrad.addColorStop(0, '#07090C');
      bgGrad.addColorStop(0.5, '#030405');
      bgGrad.addColorStop(1, '#010203');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ultra-faint monochrome spatial grid
      const gridSize = 64;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.012)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Render drifting digital particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX * 60 * delta;
        p.y += p.speedY * 60 * delta;

        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
}
