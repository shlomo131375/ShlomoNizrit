"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/themeContext";

export default function FireCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const animationId = useRef<number>(0);
  const mouse = useRef({ x: -200, y: -200 });
  const glow = useRef({ x: -200, y: -200, opacity: 0 });
  const ring = useRef({ x: -200, y: -200 });
  const { theme } = useTheme();

  const isLight = theme === "light";
  // Dark navy for light mode, orange for dark mode
  const color = isLight ? { r: 6, g: 13, b: 27 } : { r: 212, g: 146, b: 10 };
  const coreColor = isLight ? { r: 6, g: 13, b: 27 } : { r: 229, g: 163, b: 18 };
  const dotBg = isLight ? "#060d1b" : "#d4920a";
  const ringBorder = isLight ? "rgba(6, 13, 27, 0.35)" : "rgba(212, 146, 10, 0.35)";

  useEffect(() => {
    const canvas = canvasRef.current;
    const dot = dotRef.current;
    const ringEl = ringRef.current;
    if (!canvas || !dot || !ringEl) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    document.body.style.cursor = "none";

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.current.x = -200;
      mouse.current.y = -200;
      dot.style.opacity = "0";
      ringEl.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      dot.style.opacity = "1";
      ringEl.style.opacity = "1";
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      glow.current.x += (mouse.current.x - glow.current.x) * 0.12;
      glow.current.y += (mouse.current.y - glow.current.y) * 0.12;

      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;

      dot.style.transform = `translate(${mouse.current.x - 3}px, ${mouse.current.y - 3}px)`;
      ringEl.style.transform = `translate(${ring.current.x - 16}px, ${ring.current.y - 16}px)`;

      const target = mouse.current.x > -100 ? 1 : 0;
      glow.current.opacity += (target - glow.current.opacity) * 0.08;

      if (glow.current.opacity > 0.005) {
        const x = glow.current.x;
        const y = glow.current.y;
        const alpha = glow.current.opacity;
        const { r, g, b } = color;
        const cr = coreColor.r, cg = coreColor.g, cb = coreColor.b;

        const outer = ctx.createRadialGradient(x, y, 0, x, y, 600);
        outer.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.01 * alpha})`);
        outer.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${0.005 * alpha})`);
        outer.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${0.002 * alpha})`);
        outer.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.beginPath();
        ctx.arc(x, y, 600, 0, Math.PI * 2);
        ctx.fillStyle = outer;
        ctx.fill();

        const inner = ctx.createRadialGradient(x, y, 0, x, y, 180);
        inner.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${0.03 * alpha})`);
        inner.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.012 * alpha})`);
        inner.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.beginPath();
        ctx.arc(x, y, 180, 0, Math.PI * 2);
        ctx.fillStyle = inner;
        ctx.fill();
      }

      animationId.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    animationId.current = requestAnimationFrame(animate);

    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationId.current);
    };
  }, [color, coreColor]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{ mixBlendMode: isLight ? "multiply" : "screen" }}
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: dotBg,
          transition: "opacity 0.3s, background-color 0.3s",
        }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `1px solid ${ringBorder}`,
          transition: "opacity 0.3s, border-color 0.3s",
        }}
      />
    </>
  );
}
