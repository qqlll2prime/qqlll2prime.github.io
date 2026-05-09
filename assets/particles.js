(() => {
  const reduceMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initParticleNetwork(canvas) {
    if (!canvas) return;
    if (reduceMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0,
      h = 0,
      dpr = 1;
    const mouse = { x: 0, y: 0, active: false };
    const pts = [];
    const isLightTheme =
      document.body && document.body.dataset && document.body.dataset.theme === "light";

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // sparse mode: a few particles only (leave room for photos/content)
      const base = Math.floor((w * h) / 52000);
      const count = Math.max(12, Math.min(26, base));

      // reserved whitespace zones (relative to viewport)
      const reserved = [
        { x: w * 0.58, y: h * 0.18, w: w * 0.36, h: h * 0.52 },
        { x: w * 0.14, y: h * 0.72, w: w * 0.72, h: h * 0.18 },
      ];
      const isInReserved = (x, y) =>
        reserved.some((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h);

      while (pts.length < count) {
        let x = Math.random() * w;
        let y = Math.random() * h;
        let guard = 0;
        while (isInReserved(x, y) && guard < 80) {
          guard++;
          x = Math.random() * w;
          y = Math.random() * h;
        }

        pts.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 1.0 + Math.random() * 1.6,
        });
      }
      pts.length = count;
    }

    function drawParticles() {
      ctx.clearRect(0, 0, w, h);
      // Light theme: keep it clean and airy; avoid "multiply" muddiness
      ctx.globalCompositeOperation = isLightTheme ? "source-over" : "screen";

      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist2 = dx * dx + dy * dy;
          const range = 160;
          if (dist2 < range * range) {
            const dist = Math.sqrt(dist2) || 1;
            const f = (1 - dist / range) * 0.14;
            p.vx += (dx / dist) * f;
            p.vy += (dy / dist) * f;
          }
        }

        p.vx *= 0.985;
        p.vy *= 0.985;
      }

      // mouse spotlight (radial gradient halo)
      if (mouse.active) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 260);
        g.addColorStop(0, isLightTheme ? "rgba(0, 120, 255, 0.14)" : "rgba(0, 255, 204, 0.22)");
        g.addColorStop(0.35, isLightTheme ? "rgba(0, 255, 210, 0.06)" : "rgba(0, 170, 255, 0.12)");
        g.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 260, 0, Math.PI * 2);
        ctx.fill();
      }

      // sparse links: a few scattered connections only
      const maxD = 130;
      let drawn = 0;
      const maxLines = Math.min(18, Math.floor(pts.length * 1.1));
      for (let i = 0; i < pts.length && drawn < maxLines; i++) {
        const a = pts[i];
        // connect to a couple of subsequent points, keep it sparse
        for (let j = i + 1; j < pts.length && drawn < maxLines; j++) {
          if ((j - i) > 5) break;
          const b = pts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > maxD * maxD) continue;
          // probability gate to avoid dense webs
          if (Math.random() > 0.22) continue;
          const d = Math.sqrt(d2);
          const alpha = (1 - d / maxD) * 0.22;
          ctx.strokeStyle = isLightTheme
            ? `rgba(0, 140, 255, ${alpha * 0.85})`
            : `rgba(0, 255, 204, ${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          drawn++;
        }
      }

      for (const p of pts) {
        // glow halo
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18);
        halo.addColorStop(0, isLightTheme ? "rgba(0, 140, 255, 0.16)" : "rgba(0, 170, 255, 0.22)");
        halo.addColorStop(0.55, isLightTheme ? "rgba(0, 255, 210, 0.07)" : "rgba(0, 255, 204, 0.10)");
        halo.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isLightTheme ? "rgba(0, 120, 255, 0.30)" : "rgba(255,255,255,0.88)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function animate() {
      drawParticles();
      requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener(
      "mousemove",
      (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
      },
      { passive: true }
    );
    window.addEventListener(
      "mouseleave",
      () => {
        mouse.active = false;
      },
      { passive: true }
    );

    resize();
    requestAnimationFrame(animate);
  }

  function initAll() {
    document.querySelectorAll("canvas#particle-canvas").forEach((c) => {
      initParticleNetwork(c);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll, { once: true });
  } else {
    initAll();
  }
})();

