// Environment, Urban Backdrop, Decals & Particle VFX
class Environment {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    
    // Persistent decals
    this.bulletHoles = [];
    this.bloodDecals = [];
    
    // Dynamic particles
    this.particles = [];
    this.tracers = [];
    
    // Screen shake
    this.shakeIntensity = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;

    // Define urban buildings and enemy spawn nodes
    this.initScene();
  }

  initScene() {
    this.buildings = [
      // Left high-rise
      { x: 40, y: 180, w: 320, h: 620, color: '#161b26', trim: '#212836' },
      // Mid-left apartment
      { x: 400, y: 260, w: 260, h: 540, color: '#1a202c', trim: '#2d3748' },
      // Center sniper tower
      { x: 700, y: 120, w: 220, h: 680, color: '#141820', trim: '#1f2633' },
      // Mid-right complex
      { x: 960, y: 220, w: 280, h: 580, color: '#1e2430', trim: '#2b3445' },
      // Right skyscraper
      { x: 1280, y: 150, w: 280, h: 650, color: '#171c24', trim: '#222a36' }
    ];

    // Spawn points for enemies
    this.spawnPoints = [
      // Left Building Windows & Roof
      { x: 140, y: 180, type: 'rooftop', scale: 0.9 },
      { x: 260, y: 180, type: 'rooftop', scale: 0.9 },
      { x: 120, y: 340, type: 'window', scale: 0.85 },
      { x: 280, y: 340, type: 'window', scale: 0.85 },
      { x: 120, y: 500, type: 'window', scale: 0.9 },
      { x: 280, y: 500, type: 'window', scale: 0.9 },

      // Mid-Left Building
      { x: 470, y: 260, type: 'rooftop', scale: 0.95 },
      { x: 590, y: 260, type: 'rooftop', scale: 0.95 },
      { x: 530, y: 440, type: 'window', scale: 0.9 },
      { x: 530, y: 620, type: 'window', scale: 0.95 },

      // Center Sniper Tower
      { x: 810, y: 120, type: 'rooftop', scale: 0.85 },
      { x: 810, y: 280, type: 'window', scale: 0.85 },
      { x: 810, y: 460, type: 'window', scale: 0.9 },

      // Mid-Right Complex
      { x: 1040, y: 220, type: 'rooftop', scale: 0.9 },
      { x: 1160, y: 220, type: 'rooftop', scale: 0.9 },
      { x: 1040, y: 400, type: 'window', scale: 0.88 },
      { x: 1160, y: 400, type: 'window', scale: 0.88 },
      { x: 1100, y: 580, type: 'window', scale: 0.92 },

      // Right Skyscraper
      { x: 1360, y: 150, type: 'rooftop', scale: 0.85 },
      { x: 1480, y: 150, type: 'rooftop', scale: 0.85 },
      { x: 1360, y: 320, type: 'window', scale: 0.85 },
      { x: 1480, y: 320, type: 'window', scale: 0.85 },
      { x: 1420, y: 500, type: 'window', scale: 0.9 },

      // Ground Rushers / Street Alleyways
      { x: 200, y: 780, type: 'ground', scale: 1.1 },
      { x: 670, y: 780, type: 'ground', scale: 1.1 },
      { x: 940, y: 780, type: 'ground', scale: 1.1 },
      { x: 1350, y: 780, type: 'ground', scale: 1.1 }
    ];
  }

  triggerShake(amount) {
    this.shakeIntensity = Math.min(30, this.shakeIntensity + amount);
  }

  addBulletHole(x, y) {
    this.bulletHoles.push({
      x, y,
      size: Math.random() * 3 + 3,
      alpha: 1.0
    });
    if (this.bulletHoles.length > 80) this.bulletHoles.shift();

    // Spawn concrete sparks
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 220,
        vy: (Math.random() - 0.5) * 220,
        size: Math.random() * 2 + 1,
        color: '#ffd000',
        life: 0.35,
        maxLife: 0.35,
        isSpark: true
      });
    }
  }

  addBloodSpatter(x, y, isHeadshot = false) {
    const count = isHeadshot ? 28 : 12;
    const spread = isHeadshot ? 45 : 20;

    // Blood Decal on wall
    this.bloodDecals.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      radius: isHeadshot ? Math.random() * 16 + 12 : Math.random() * 8 + 6,
      alpha: 0.9
    });
    if (this.bloodDecals.length > 100) this.bloodDecals.shift();

    // Flying Blood Particles
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isHeadshot ? 380 : 180) + 40;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isHeadshot ? 120 : 40),
        size: Math.random() * 4 + (isHeadshot ? 3 : 2),
        color: Math.random() > 0.3 ? '#b8001f' : '#e60026',
        life: 0.6,
        maxLife: 0.6,
        gravity: 600
      });
    }
  }

  addTracer(fromX, fromY, toX, toY, color = '#00f3ff') {
    this.tracers.push({
      fromX, fromY, toX, toY,
      alpha: 1.0,
      color: color
    });
  }

  update(dt) {
    // Screen shake decay
    if (this.shakeIntensity > 0) {
      this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 45);
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
    }

    // Update Tracers
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.alpha -= dt * 7;
      if (t.alpha <= 0) {
        this.tracers.splice(i, 1);
      }
    }
  }

  draw(ctx, zoom = 1.0, lookX = 800, lookY = 450) {
    ctx.save();
    
    // Apply camera shake & zoom transformation
    ctx.translate(this.shakeOffsetX, this.shakeOffsetY);
    if (zoom > 1.0) {
      ctx.translate(lookX, lookY);
      ctx.scale(zoom, zoom);
      ctx.translate(-lookX, -lookY);
    }

    // Dark atmospheric sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#06080d');
    skyGrad.addColorStop(0.6, '#0f172a');
    skyGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Distant city silhouette
    ctx.fillStyle = '#0a0e17';
    for (let i = 0; i < 20; i++) {
      const bx = i * 85;
      const bw = 70;
      const bh = 300 + Math.sin(i * 1.5) * 120;
      ctx.fillRect(bx, this.height - bh, bw, bh);
    }

    // Foreground Urban Buildings
    this.buildings.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // Building Trim / Rooftop border
      ctx.fillStyle = b.trim;
      ctx.fillRect(b.x, b.y, b.w, 12);

      // Windows
      const winCols = Math.floor((b.w - 30) / 60);
      const winRows = Math.floor((b.h - 60) / 90);

      for (let r = 0; r < winRows; r++) {
        for (let c = 0; c < winCols; c++) {
          const wx = b.x + 25 + c * 60;
          const wy = b.y + 35 + r * 90;
          const isLit = (r + c * 3) % 4 === 0;

          ctx.fillStyle = isLit ? 'rgba(255, 183, 3, 0.15)' : 'rgba(0, 0, 0, 0.65)';
          ctx.fillRect(wx, wy, 35, 55);

          // Window frame
          ctx.strokeStyle = '#2d3748';
          ctx.lineWidth = 2;
          ctx.strokeRect(wx, wy, 35, 55);
        }
      }
    });

    // Street Ground Level Barricades & Road
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 780, this.width, 120);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 780);
    ctx.lineTo(this.width, 780);
    ctx.stroke();

    // Draw Persistent Blood Decals
    this.bloodDecals.forEach(b => {
      ctx.fillStyle = `rgba(160, 0, 30, ${b.alpha})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Persistent Bullet Holes
    this.bulletHoles.forEach(h => {
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.restore();
  }

  drawVFX(ctx, zoom = 1.0, lookX = 800, lookY = 450) {
    ctx.save();
    ctx.translate(this.shakeOffsetX, this.shakeOffsetY);
    if (zoom > 1.0) {
      ctx.translate(lookX, lookY);
      ctx.scale(zoom, zoom);
      ctx.translate(-lookX, -lookY);
    }

    // Draw Tracers
    this.tracers.forEach(t => {
      ctx.save();
      ctx.strokeStyle = t.color;
      ctx.globalAlpha = t.alpha;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(t.fromX, t.fromY);
      ctx.lineTo(t.toX, t.toY);
      ctx.stroke();
      ctx.restore();
    });

    // Draw Particles (Sparks & Blood drops)
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      if (p.isSpark) {
        ctx.shadowColor = '#ffea00';
        ctx.shadowBlur = 8;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }
}

window.Environment = Environment;
