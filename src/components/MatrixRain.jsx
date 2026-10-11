import { useEffect, useRef } from 'react';

const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const FONT_SIZE = 14;
const TICK_MS = 35; // ~28 fps — locked, stable slow rate

export default function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let columns = 0;
    let drops = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / FONT_SIZE);
      // Preserve existing positions; initialise new columns at random staggered start
      drops = Array.from({ length: columns }, (_, i) =>
        Number.isFinite(drops[i]) ? drops[i] : Math.floor(Math.random() * -50)
      );
    }

    resize();
    window.addEventListener('resize', resize);

    function tick() {
      // Trail fade — rgba black overlay. 0.15 alpha = slow, dark fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px monospace`;
      // Lead character: bright white; trail rendered via fade
      ctx.fillStyle = '#00ff66';

      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * FONT_SIZE;

        if (y > 0 && y <= canvas.height + FONT_SIZE) {
          const char = CHARS[Math.floor(Math.random() * CHARS.length)];
          // Paint lead character white, rest use the green fillStyle set above
          ctx.fillStyle = '#ffffffff';
          ctx.fillText(char, i * FONT_SIZE, y);
          ctx.fillStyle = '#00ff66';
        }

        // Exactly +1 step per tick — no variable speed
        drops[i] += 1;

        // Reset once fully off-screen, with staggered random delay
        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.97) {
          drops[i] = Math.floor(Math.random() * -20);
        }
      }
    }

    const intervalId = setInterval(tick, TICK_MS);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.25,
      }}
    />
  );
}
