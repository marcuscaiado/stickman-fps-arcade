// Main Game Controller, Loop, HUD Wiring & State Machine
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = 1600;
    this.height = 900;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Game state: 'menu', 'playing', 'shop', 'gameover', 'paused'
    this.state = 'menu';

    // Player stats
    this.maxHealth = 100;
    this.health = 100;
    this.maxArmor = 100;
    this.armor = 0;
    this.cash = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;

    // Aim & ADS
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;
    this.isADS = false; // Aim Down Sights
    this.recoilOffsetX = 0;
    this.recoilOffsetY = 0;

    // Systems
    this.environment = new Environment(this.width, this.height);
    this.sound = window.soundEngine;
    this.weapons = window.weaponManager;

    // Enemies & Waves
    this.enemies = [];
    this.currentWave = 1;
    this.enemiesRemainingInWave = 0;
    this.waveSpawnTimer = 0;
    this.isWaveActive = false;

    // Timing
    this.lastTime = performance.now();

    this.initInput();
    this.updateHUD();
    this.startLoop();
  }

  initInput() {
    const container = document.getElementById('game-container');

    // Mouse Move -> Aim
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      this.mouseX = (e.clientX - rect.left) * scaleX;
      this.mouseY = (e.clientY - rect.top) * scaleY;
    });

    // Left Click -> Shoot
    window.addEventListener('mousedown', (e) => {
      if (this.state !== 'playing') return;
      if (e.button === 0) { // Left click
        this.shoot();
      } else if (e.button === 2) { // Right click -> ADS
        this.isADS = true;
        this.updateScopeOverlay();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isADS = false;
        this.updateScopeOverlay();
      }
    });

    // Prevent context menu
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      this.sound.init(); // Initialize audio context on first user interaction

      if (e.code === 'KeyR') {
        this.weapons.startReload();
        this.updateHUD();
      } else if (e.code === 'Digit1') {
        this.weapons.selectBySlot(1);
        this.updateHUD();
      } else if (e.code === 'Digit2') {
        this.weapons.selectBySlot(2);
        this.updateHUD();
      } else if (e.code === 'Digit3') {
        this.weapons.selectBySlot(3);
        this.updateHUD();
      } else if (e.code === 'Digit4') {
        this.weapons.selectBySlot(4);
        this.updateHUD();
      } else if (e.code === 'Digit5') {
        this.weapons.selectBySlot(5);
        this.updateHUD();
      } else if (e.code === 'Space') {
        this.isADS = true;
        this.updateScopeOverlay();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.isADS = false;
        this.updateScopeOverlay();
      }
    });

    // Mouse wheel -> cycle weapons
    window.addEventListener('wheel', (e) => {
      if (this.state === 'playing') {
        this.weapons.cycleWeapon(e.deltaY > 0 ? 1 : -1);
        this.updateHUD();
      }
    });

    // Touch Input Support (Mobile / Galaxy A55)
    const updateTouchPos = (touch) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      this.mouseX = (touch.clientX - rect.left) * scaleX;
      this.mouseY = (touch.clientY - rect.top) * scaleY;
    };

    window.addEventListener('touchstart', (e) => {
      if (e.target.closest('.modal, .arcade-corner-btn, .weapon-slot, .ammo-box, #reloadPrompt')) return;
      this.sound.init();
      if (this.state !== 'playing') return;
      if (e.touches.length > 0) {
        updateTouchPos(e.touches[0]);
        this.isMouseDown = true;
        this.shoot();
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        updateTouchPos(e.touches[0]);
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      this.isMouseDown = false;
    });

    // Weapon slot tap / click listeners for mobile & PC
    [1, 2, 3, 4, 5].forEach(slot => {
      const slotEl = document.getElementById(`weaponSlot${slot}`);
      if (slotEl) {
        slotEl.style.cursor = 'pointer';
        slotEl.addEventListener('click', () => {
          this.sound.init();
          this.weapons.selectBySlot(slot);
          this.updateHUD();
        });
      }
    });

    // Reload prompt / ammo box click to reload
    const reloadPromptEl = document.getElementById('reloadPrompt');
    if (reloadPromptEl) {
      reloadPromptEl.addEventListener('click', () => {
        this.sound.init();
        this.weapons.startReload();
        this.updateHUD();
      });
    }
    const ammoBoxEl = document.querySelector('.ammo-box');
    if (ammoBoxEl) {
      ammoBoxEl.style.cursor = 'pointer';
      ammoBoxEl.addEventListener('click', () => {
        this.sound.init();
        this.weapons.startReload();
        this.updateHUD();
      });
    }
  }

  startLoop() {
    const loop = (currentTime) => {
      const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
      this.lastTime = currentTime;

      this.update(dt);
      this.render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  startGame() {
    if (window.ArcadeDifficulty) ArcadeDifficulty.reset();
    this.sound.init();
    this.health = 100;
    this.armor = 0;
    this.score = 0;
    this.cash = 100;
    this.combo = 0;
    this.currentWave = 1;
    this.state = 'playing';

    // Reset weapons
    this.weapons.weapons.pistol.currentAmmo = this.weapons.weapons.pistol.magSize;
    this.weapons.selectWeapon('pistol');

    document.getElementById('startModal').classList.remove('active');
    document.getElementById('gameoverModal').classList.remove('active');
    document.getElementById('shopModal').classList.remove('active');

    this.startWave(1);
    this.updateHUD();
  }

  startWave(waveNum) {
    this.currentWave = waveNum;
    this.enemiesRemainingInWave = window.ArcadeDifficulty ? ArcadeDifficulty.scaleCount(5 + waveNum * 3, this.score, 3500, 25) : (5 + waveNum * 3);
    this.isWaveActive = true;
    this.waveSpawnTimer = 0;
    this.enemies = [];
    this.updateHUD();
  }

  spawnEnemy() {
    if (this.enemiesRemainingInWave <= 0) return;

    // Pick random available spawn point
    const pts = this.environment.spawnPoints;
    const pt = pts[Math.floor(Math.random() * pts.length)];

    // Choose type based on wave number
    let type = 'grunt';
    const rand = Math.random();
    if (this.currentWave >= 2 && rand > 0.65) type = 'sniper';
    if (this.currentWave >= 3 && rand > 0.8) type = 'rusher';
    if (this.currentWave >= 4 && rand > 0.88) type = 'shield';

    const ddaMult = window.ArcadeDifficulty ? ArcadeDifficulty.getMultiplier(this.score, 3500, 2.2) : 1.0;
    const diffMultiplier = Math.max(1.0 + (this.currentWave - 1) * 0.15, ddaMult);
    this.enemies.push(new Stickman(pt, type, diffMultiplier));
    this.enemiesRemainingInWave--;
  }

  shoot() {
    const currentWeapon = this.weapons.getCurrentWeapon();
    if (!this.weapons.fire()) {
      if (currentWeapon.currentAmmo === 0) {
        this.weapons.startReload();
      }
      return;
    }

    // Play procedural gunshot sound
    this.sound.playGunshot(currentWeapon.soundType);
    this.sound.playShellDrop();

    // Visual recoil animation & screen shake (visual only — click accuracy is 100% true to crosshair)
    const currentRecoil = this.isADS ? currentWeapon.recoil * 0.5 : currentWeapon.recoil;
    this.recoilOffsetY = Math.min(15, this.recoilOffsetY + currentRecoil * 0.5);
    this.environment.triggerShake(currentRecoil * 0.4);

    // Origin of tracer (bottom right of screen)
    const tracerOriginX = this.width * 0.7;
    const tracerOriginY = this.height * 0.95;

    let hitAny = false;

    // Handle Shotgun multi-pellets vs single projectile
    const pellets = currentWeapon.pellets || 1;
    for (let p = 0; p < pellets; p++) {
      // 100% Pinpoint Accuracy: Primary raycast lands exactly at (mouseX, mouseY)
      let targetX = this.mouseX;
      let targetY = this.mouseY;

      // Secondary shotgun pellets only
      if (pellets > 1 && p > 0) {
        targetX += (Math.random() - 0.5) * (this.width * currentWeapon.spread);
        targetY += (Math.random() - 0.5) * (this.height * currentWeapon.spread);
      }

      this.environment.addTracer(tracerOriginX, tracerOriginY, targetX, targetY, currentWeapon.id === 'sniper' ? '#ff0055' : '#00f3ff');

      // Check hit against active enemies
      let hitTarget = null;
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        const hitRes = enemy.checkHit(targetX, targetY, currentWeapon.damage, currentWeapon.id === 'rpg');
        if (hitRes) {
          hitTarget = { enemy, ...hitRes };
          break;
        }
      }

      if (hitTarget) {
        hitAny = true;
        this.sound.playHitmarker();

        if (hitTarget.zone === 'head') {
          this.sound.playHeadshot();
          this.environment.addBloodSpatter(targetX, targetY, true);
          this.addScore(250 * (this.combo + 1), true);
          this.cash += 50;
          this.combo++;
          this.showFloatingText('CRITICAL HEADSHOT! 💀', targetX, targetY, '#ff0055');
        } else {
          this.environment.addBloodSpatter(targetX, targetY, false);
          this.addScore(100 * (this.combo + 1), false);
          this.cash += 25;
          this.combo++;
        }
      } else {
        // Concrete wall hit
        this.environment.addBulletHole(targetX, targetY);
      }
    }

    if (!hitAny && pellets === 1) {
      this.combo = 0; // Miss resets combo
    }

    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.updateHUD();
  }

  damagePlayer(amount, enemyType) {
    if (this.state !== 'playing') return;

    this.sound.playDamageAlert();
    this.environment.triggerShake(18);

    // Damage Flash effect
    const flash = document.getElementById('damageFlash');
    flash.classList.add('hit');
    setTimeout(() => flash.classList.remove('hit'), 150);

    // Absorb with armor first
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, amount);
      this.armor -= absorbed;
      amount -= absorbed;
    }

    this.health -= amount;
    this.combo = 0; // Reset combo on being hit
    this.updateHUD();

    if (this.health <= 0) {
      this.health = 0;
      this.gameOver();
    }
  }

  addScore(pts, isHeadshot) {
    this.score += pts;
    this.updateHUD();
    if (window.DopamineSynth) {
      if (isHeadshot) window.DopamineSynth.playCombo(4);
      else window.DopamineSynth.playTap(0.2, 1.2);
    }
  }

  showFloatingText(text, x, y, color = '#00f3ff') {
    if (window.DopamineJuice) {
      const px = (x / this.width) * window.innerWidth;
      const py = (y / this.height) * window.innerHeight;
      window.DopamineJuice.spawnScore(px, py, text, 2);
    }
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.color = color;
    el.style.left = `${(x / this.width) * 100}%`;
    el.style.top = `${(y / this.height) * 100}%`;
    document.getElementById('game-container').appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  update(dt) {
    if (this.state !== 'playing') return;

    // Recoil recovery
    this.recoilOffsetY = Math.max(0, this.recoilOffsetY - dt * 40);

    // Weapon reload timer
    this.weapons.updateReload();

    // Update environment & particles
    this.environment.update(dt);

    // Enemy wave spawner logic
    if (this.isWaveActive) {
      this.waveSpawnTimer += dt;
      const maxAlive = 3 + this.currentWave;
      const aliveCount = this.enemies.filter(e => !e.isDead).length;

      if (this.waveSpawnTimer > 1.2 && aliveCount < maxAlive && this.enemiesRemainingInWave > 0) {
        this.spawnEnemy();
        this.waveSpawnTimer = 0;
      }

      // Check if wave is cleared
      if (this.enemiesRemainingInWave === 0 && aliveCount === 0) {
        this.isWaveActive = false;
        setTimeout(() => this.openShop(), 1000);
      }
    }

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(dt, (dmg, type) => this.damagePlayer(dmg, type), (x, y, isHead) => this.environment.addBloodSpatter(x, y, isHead));
    });

    // Cleanup dead enemies after animation
    this.enemies = this.enemies.filter(e => !e.isDead || e.deathTimer < 3.0);
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const currentWeapon = this.weapons.getCurrentWeapon();
    const zoom = this.isADS ? currentWeapon.zoomFactor : 1.0;

    // 1. Draw environment & buildings
    this.environment.draw(this.ctx, zoom, this.mouseX, this.mouseY);

    // 2. Draw Stickmen enemies
    this.ctx.save();
    if (zoom > 1.0) {
      this.ctx.translate(this.mouseX, this.mouseY);
      this.ctx.scale(zoom, zoom);
      this.ctx.translate(-this.mouseX, -this.mouseY);
    }
    this.enemies.forEach(enemy => enemy.draw(this.ctx));
    this.ctx.restore();

    // 3. Draw VFX (Particles, tracers, sparks)
    this.environment.drawVFX(this.ctx, zoom, this.mouseX, this.mouseY);

    // 4. Custom In-Canvas Crosshair
    if (!this.isADS || currentWeapon.id !== 'sniper') {
      this.drawCrosshair(this.ctx);
    }
  }

  drawCrosshair(ctx) {
    const x = this.mouseX;
    const y = this.mouseY;
    const w = this.weapons.getCurrentWeapon();

    ctx.save();
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 6;

    const gap = 6 + (this.recoilOffsetY * 0.4);
    const len = 10;

    // Crosshair ticks
    ctx.beginPath();
    ctx.moveTo(x - gap - len, y); ctx.lineTo(x - gap, y);
    ctx.moveTo(x + gap, y); ctx.lineTo(x + gap + len, y);
    ctx.moveTo(x, y - gap - len); ctx.lineTo(x, y - gap);
    ctx.moveTo(x, y + gap); ctx.lineTo(x, y + gap + len);
    ctx.stroke();

    // Center precision dot (neon pink)
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  updateScopeOverlay() {
    const overlay = document.getElementById('sniperScopeOverlay');
    const cur = this.weapons.getCurrentWeapon();
    if (this.isADS && cur.id === 'sniper') {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  }

  updateHUD() {
    const curWeapon = this.weapons.getCurrentWeapon();

    document.getElementById('healthFill').style.width = `${(this.health / this.maxHealth) * 100}%`;
    document.getElementById('healthText').innerText = `${Math.ceil(this.health)} / ${this.maxHealth}`;
    document.getElementById('armorFill').style.width = `${(this.armor / this.maxArmor) * 100}%`;
    document.getElementById('armorText').innerText = `${Math.ceil(this.armor)} / ${this.maxArmor}`;

    document.getElementById('scoreDisplay').innerText = this.score.toLocaleString();
    document.getElementById('cashDisplay').innerText = `$${this.cash.toLocaleString()}`;
    document.getElementById('waveDisplay').innerText = `WAVE ${this.currentWave}`;

    // Combo
    const comboEl = document.getElementById('comboDisplay');
    if (this.combo > 1) {
      comboEl.innerText = `${this.combo}X COMBO!`;
      comboEl.classList.add('active');
    } else {
      comboEl.classList.remove('active');
    }

    // Ammo
    document.getElementById('ammoMain').innerText = this.weapons.isReloading ? '--' : curWeapon.currentAmmo;
    document.getElementById('ammoReserve').innerText = curWeapon.reserveAmmo === Infinity ? '∞' : `/${curWeapon.reserveAmmo}`;

    // Reload prompt
    const reloadPrompt = document.getElementById('reloadPrompt');
    if (curWeapon.currentAmmo === 0 || this.weapons.isReloading) {
      reloadPrompt.classList.add('visible');
      reloadPrompt.innerText = this.weapons.isReloading ? 'RELOADING...' : 'PRESS [R] TO RELOAD';
    } else {
      reloadPrompt.classList.remove('visible');
    }

    // Weapon inventory bar slots
    [1, 2, 3, 4, 5].forEach(slot => {
      const slotEl = document.getElementById(`weaponSlot${slot}`);
      let found = null;
      for (let k in this.weapons.weapons) {
        if (this.weapons.weapons[k].slot === slot) {
          found = this.weapons.weapons[k];
          break;
        }
      }
      if (found) {
        if (found.unlocked) {
          slotEl.classList.remove('locked');
        } else {
          slotEl.classList.add('locked');
        }
        if (found.id === curWeapon.id) {
          slotEl.classList.add('active');
        } else {
          slotEl.classList.remove('active');
        }
      }
    });
  }

  openShop() {
    this.state = 'shop';
    document.getElementById('shopWaveBonus').innerText = `+$${150 + this.currentWave * 75}`;
    this.cash += 150 + this.currentWave * 75;
    this.renderShopCards();
    document.getElementById('shopModal').classList.add('active');
    this.updateHUD();
  }

  closeShopAndNextWave() {
    document.getElementById('shopModal').classList.remove('active');
    this.state = 'playing';
    this.startWave(this.currentWave + 1);
  }

  renderShopCards() {
    const grid = document.getElementById('shopGrid');
    grid.innerHTML = '';

    const items = [
      {
        name: 'Kevlar Vest (+50 Armor)',
        desc: 'Absorbs ballistic damage from enemy fire.',
        cost: 150,
        canBuy: this.armor < this.maxArmor,
        buy: () => { this.armor = Math.min(this.maxArmor, this.armor + 50); }
      },
      {
        name: 'Military Medkit (+50 HP)',
        desc: 'Restore critical combat vital points.',
        cost: 120,
        canBuy: this.health < this.maxHealth,
        buy: () => { this.health = Math.min(this.maxHealth, this.health + 50); }
      },
      {
        name: 'Unlock 12G Shotgun',
        desc: 'Devastating close-range pump shotgun.',
        cost: 600,
        canBuy: !this.weapons.weapons.shotgun.unlocked,
        buy: () => { this.weapons.weapons.shotgun.unlocked = true; }
      },
      {
        name: 'Unlock AR-15 Assault Rifle',
        desc: 'Fully automatic tactical rifle.',
        cost: 1200,
        canBuy: !this.weapons.weapons.rifle.unlocked,
        buy: () => { this.weapons.weapons.rifle.unlocked = true; }
      },
      {
        name: 'Unlock .50 Heavy Sniper',
        desc: 'Extreme one-shot precision rifle.',
        cost: 2000,
        canBuy: !this.weapons.weapons.sniper.unlocked,
        buy: () => { this.weapons.weapons.sniper.unlocked = true; }
      },
      {
        name: 'Unlock RPG-7 Launcher',
        desc: 'Splash explosive rocket launcher.',
        cost: 3500,
        canBuy: !this.weapons.weapons.rpg.unlocked,
        buy: () => { this.weapons.weapons.rpg.unlocked = true; }
      }
    ];

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'shop-card';
      card.innerHTML = `
        <div>
          <h4>${item.name}</h4>
          <p>${item.desc}</p>
        </div>
        <button class="shop-btn" ${(!item.canBuy || this.cash < item.cost) ? 'disabled' : ''}>
          ${!item.canBuy ? 'ACQUIRED / FULL' : `BUY ($${item.cost})`}
        </button>
      `;

      card.querySelector('button').onclick = () => {
        if (this.cash >= item.cost && item.canBuy) {
          this.cash -= item.cost;
          item.buy();
          this.renderShopCards();
          this.updateHUD();
        }
      };

      grid.appendChild(card);
    });
  }

  gameOver() {
    this.state = 'gameover';
    if (window.DopamineSynth) window.DopamineSynth.playWin();
    if (window.DopamineJuice) window.DopamineJuice.explodeConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 65);
    document.getElementById('finalScore').innerText = this.score.toLocaleString();
    document.getElementById('finalWave').innerText = this.currentWave;
    document.getElementById('finalCombo').innerText = `${this.maxCombo}x`;

    document.getElementById('gameoverModal').classList.add('active');

    try {
      if (window.ArcadeLeaderboard) {
        window.ArcadeLeaderboard.submitScore('stickman-fps-arcade', this.score);
      }
    } catch(e){}
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
    } else if (this.state === 'paused') {
      this.state = 'playing';
    }
  }
}

window.addEventListener('load', () => {
  window.game = new Game();
});
