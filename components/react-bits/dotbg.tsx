'use client';
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { useTheme } from 'next-themes';

gsap.registerPlugin(InertiaPlugin);

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  _inertiaApplied: boolean;
}

export interface DotGridProps {
  dotSize?: number;
  gap?: number;
  proximity?: number;
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  resistance?: number;
  returnDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Convert HSL (from CSS) to RGB for canvas usage
function hslToRgb(hsl: string) {
  const [h, s, l] = hsl
    .trim()
    .split(' ')
    .map((v) => parseFloat(v.replace('%', '')));

  const _s = s / 100;
  const _l = l / 100;

  const a = _s * Math.min(_l, 1 - _l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = _l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * color);
  };

  return { r: f(0), g: f(8), b: f(4) };
}

const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastCall = 0;
  return function (this: any, ...args: any[]) {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
};

const Dotbg: React.FC<DotGridProps> = ({
  dotSize = 3,
  gap = 10,
  proximity = 100,
  speedTrigger = 50,
  shockRadius = 250,
  shockStrength = 7,
  maxSpeed = 5000,
  resistance = 750,
  returnDuration = 1.5,
  className = '',
  style,
}) => {
  const { resolvedTheme } = useTheme();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
  });

  // Read CSS variable --primary and convert to RGB
  const getThemePrimaryColor = () => {
    if (typeof window === 'undefined') return '252 39% 50%'; // fallback
    const root = window.getComputedStyle(document.documentElement);
    return root.getPropertyValue('--primary').trim() || '252 39% 50%';
  };

  const primaryHSL = useMemo(getThemePrimaryColor, [resolvedTheme]);
  const baseRgb = useMemo(() => {
    // For base color, use a more subtle version based on the theme
    const baseHSL = resolvedTheme === 'dark' ? '220 13% 18%' : '220 13% 91%';
    return hslToRgb(baseHSL);
  }, [resolvedTheme]);
  const activeRgb = useMemo(() => hslToRgb(primaryHSL), [primaryHSL]);

  const circlePath = useMemo(() => {
    if (typeof window === 'undefined' || !window.Path2D) return null;
    const p = new Path2D();
    p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return p;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const cols = Math.floor((width + gap) / (dotSize + gap));
    const rows = Math.floor((height + gap) / (dotSize + gap));
    const cell = dotSize + gap;
    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;

    const startX = (width - gridW) / 2 + dotSize / 2;
    const startY = (height - gridH) / 2 + dotSize / 2;

    const dots: Dot[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        dots.push({
          cx: startX + x * cell,
          cy: startY + y * cell,
          xOffset: 0,
          yOffset: 0,
          _inertiaApplied: false,
        });
      }
    }

    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    buildGrid();
    const resizeObs =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(buildGrid)
        : null;

    if (resizeObs && wrapperRef.current) {
      resizeObs.observe(wrapperRef.current);
    } else {
      window.addEventListener('resize', buildGrid);
    }

    return () => {
      if (resizeObs) resizeObs.disconnect();
      else window.removeEventListener('resize', buildGrid);
    };
  }, [buildGrid]);

  useEffect(() => {
    if (!circlePath) return;

    const proxSq = proximity * proximity;
    let rafId: number;

    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: px, y: py } = pointerRef.current;

      for (const dot of dotsRef.current) {
        const ox = dot.cx + dot.xOffset;
        const oy = dot.cy + dot.yOffset;

        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dsq = dx * dx + dy * dy;

        let color = `rgb(${baseRgb.r},${baseRgb.g},${baseRgb.b},0.2)`;

        if (dsq <= proxSq) {
          const dist = Math.sqrt(dsq);
          const t = 1 - dist / proximity;
          const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
          const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
          const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
          color = `rgb(${r},${g},${b},0.2)`;
        }

        ctx.save();
        ctx.translate(ox, oy);
        ctx.fillStyle = color;
        ctx.fill(circlePath!);
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [baseRgb, activeRgb, proximity, circlePath]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const now = performance.now();
      const pr = pointerRef.current;
      const dt = pr.lastTime ? now - pr.lastTime : 16;
      const dx = e.clientX - pr.lastX;
      const dy = e.clientY - pr.lastY;

      let vx = (dx / dt) * 1000;
      let vy = (dy / dt) * 1000;
      let speed = Math.hypot(vx, vy);

      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed;
      }

      pr.lastTime = now;
      pr.lastX = e.clientX;
      pr.lastY = e.clientY;
      pr.vx = vx;
      pr.vy = vy;
      pr.speed = speed;

      const rect = canvasRef.current!.getBoundingClientRect();
      pr.x = e.clientX - rect.left;
      pr.y = e.clientY - rect.top;

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
        if (
          speed > speedTrigger &&
          dist < proximity &&
          !dot._inertiaApplied
        ) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);
          const pushX = dot.cx - pr.x + vx * 0.005;
          const pushY = dot.cy - pr.y + vy * 0.005;
          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance },
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration,
                ease: 'elastic.out(1, 0.75)',
              });
              dot._inertiaApplied = false;
            },
          });
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist < shockRadius && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);

          const falloff = Math.max(0, 1 - dist / shockRadius);
          const pushX = (dot.cx - cx) * shockStrength * falloff;
          const pushY = (dot.cy - cy) * shockStrength * falloff;

          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance },
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration,
                ease: 'elastic.out(1, 0.75)',
              });
              dot._inertiaApplied = false;
            },
          });
        }
      }
    };

    const throttledMove = throttle(handleMove, 50);
    window.addEventListener('mousemove', throttledMove, { passive: true });
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', throttledMove);
      window.removeEventListener('click', handleClick);
    };
  }, [
    maxSpeed,
    speedTrigger,
    proximity,
    resistance,
    returnDuration,
    shockRadius,
    shockStrength,
  ]);

  return (
    <section
      className={`p-4 flex items-center justify-center h-full w-full relative ${className}`}
      style={style}
    >
      <div ref={wrapperRef} className="w-full h-full relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>
    </section>
  );
};

export default Dotbg;
