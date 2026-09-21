import React, { useEffect, useRef } from 'react';

interface Props {
  isAnalyzing?: boolean;
  isFixing?: boolean;
}

const COLORS = ['#FF8A3D', '#FFAD73', '#FFB347', '#A6B1CC', '#FF9A5C'];
const HEX2RGB: Record<string, [number, number, number]> = {
  '#FF8A3D': [255, 138, 61],
  '#FFAD73': [255, 173, 115],
  '#FFB347': [255, 179, 71],
  '#A6B1CC': [166, 177, 204],
  '#FF9A5C': [255, 154, 92],
};

export default function Cinematic3DCanvas({ isAnalyzing, isFixing }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 400;
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking for gentle parallax
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      targetRotY = ((mouseX - width / 2) / width) * 0.5;
      targetRotX = -((mouseY - height / 2) / height) * 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const PARTICLE_COUNT = 40;
    const particles: { x: number; y: number; z: number; vx: number; vy: number; vz: number; size: number; color: string }[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.2,
        y: (Math.random() - 0.5) * height * 1.2,
        z: Math.random() * 600 - 300,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotX += (targetRotX - rotX) * 0.04;
      rotY += (targetRotY - rotY) * 0.04;

      const active = isAnalyzing || isFixing;
      const speedMultiplier = active ? 2.2 : 1.0;
      angle += 0.004 * speedMultiplier;

      const fov = 400;
      const centerX = width / 2;
      const centerY = height / 2;

      const projected: { px: number; py: number; scale: number; color: string; size: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;
        p.z += p.vz * speedMultiplier;

        if (p.x < -width / 1.5 || p.x > width / 1.5) p.vx *= -1;
        if (p.y < -height / 1.5 || p.y > height / 1.5) p.vy *= -1;
        if (p.z < -300 || p.z > 300) p.vz *= -1;

        const cosY = Math.cos(angle + rotY);
        const sinY = Math.sin(angle + rotY);
        const rx = p.x * cosY - p.z * sinY;
        let rz = p.z * cosY + p.x * sinY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const ry = p.y * cosX - rz * sinX;
        rz = rz * cosX + p.y * sinX;

        const scale = fov / (fov + rz + 400);
        const px = rx * scale + centerX;
        const py = ry * scale + centerY;

        projected.push({ px, py, scale, color: p.color, size: p.size * scale });
      }

      // Connection lines — faint so the surface stays calm
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 105) {
            const alpha = (1 - dist / 105) * (active ? 0.3 : 0.17);
            ctx.strokeStyle = isFixing
              ? `rgba(255, 138, 61, ${alpha})`
              : isAnalyzing
              ? `rgba(78, 242, 186, ${alpha})`
              : `rgba(255, 138, 61, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.stroke();
          }
        }
      }

      // Particle points + soft glow ring
      for (let i = 0; i < projected.length; i++) {
        const pt = projected[i];
        if (pt.scale <= 0) continue;
        const [r, g, b] = HEX2RGB[pt.color] || [255, 138, 61];
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, Math.max(0.5, pt.size), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, Math.max(1, pt.size * 2.6), 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isAnalyzing, isFixing]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-40 transition-opacity duration-700"
    />
  );
}