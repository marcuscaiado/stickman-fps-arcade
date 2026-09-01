// Stickman Enemy AI, Animation, Hitboxes & Physics
class Stickman {
  constructor(spawnPoint, type = 'grunt', difficultyMultiplier = 1.0) {
    this.spawnPoint = spawnPoint; // {x, y, type: 'window' | 'rooftop' | 'ground'}
    this.x = spawnPoint.x;
    this.y = spawnPoint.y;
    this.type = type; // 'grunt', 'sniper', 'rusher', 'shield'
    
    // Scale and size
    this.scale = spawnPoint.scale || 1.0;
    this.height = 74 * this.scale;
    this.headRadius = 11 * this.scale;
    
    // Health and state
    this.maxHealth = (type === 'shield' ? 140 : (type === 'sniper' ? 60 : (type === 'rusher' ? 40 : 70))) * difficultyMultiplier;
    this.health = this.maxHealth;
    this.shieldHealth = type === 'shield' ? 180 : 0;
    this.state = 'spawning'; // 'spawning', 'peeking', 'aiming', 'shooting', 'running', 'dead'
    
    // Timers & AI
    this.stateTimer = 0;
    this.aimDuration = Math.max(900, (type === 'sniper' ? 2400 : (type === 'rusher' ? 1200 : 1800)) / difficultyMultiplier);
    this.peekDuration = 800 + Math.random() * 800;
    this.attackDamage = type === 'sniper' ? 35 : (type === 'rusher' ? 25 : 15);
    
    // Movement for rushers
    this.vx = type === 'rusher' ? (Math.random() > 0.5 ? 2.2 : -2.2) * this.scale : 0;
    this.vy = 0;
    
    // Animation phases
    this.animPhase = Math.random() * Math.PI * 2;
    this.isDead = false;
    this.deathTimer = 0;
    this.headshot = false;
    
    // Ragdoll / death physics
    this.ragdollParts = [];
    this.hasFallenOffLedge = false;
  }

  update(dt, onAttackPlayer, addBloodParticles) {
    if (this.isDead) {
      this.deathTimer += dt;
      // Update ragdoll physics if active
      this.ragdollParts.forEach(part => {
        part.x += part.vx * dt;
        part.y += part.vy * dt;
        part.vy += 980 * dt; // Gravity
        part.rot += part.vRot * dt;
      });
      return;
    }

    this.animPhase += dt * 5;
    this.stateTimer += dt * 1000;

    switch (this.state) {
      case 'spawning':
        if (this.stateTimer > 400) {
          this.state = this.type === 'rusher' ? 'running' : 'peeking';
          this.stateTimer = 0;
        }
        break;

      case 'peeking':
        if (this.stateTimer > this.peekDuration) {
          this.state = 'aiming';
          this.stateTimer = 0;
        }
        break;

      case 'aiming':
        if (this.stateTimer >= this.aimDuration) {
          this.state = 'shooting';
          this.stateTimer = 0;
          onAttackPlayer(this.attackDamage, this.type);
        }
        break;

      case 'shooting':
        if (this.stateTimer > 350) {
          this.state = this.type === 'rusher' ? 'running' : 'aiming';
          this.stateTimer = 0;
        }
        break;

      case 'running':
        this.x += this.vx * (dt * 60);
        // Turn around at screen bounds
        if (this.x < 100 * this.scale) {
          this.vx = Math.abs(this.vx);
        } else if (this.x > 1500 * this.scale) {
          this.vx = -Math.abs(this.vx);
        }
        if (this.stateTimer > this.aimDuration) {
          this.state = 'aiming';
          this.stateTimer = 0;
        }
        break;
    }
  }

  // Hit testing against custom hitboxes
  checkHit(rayX, rayY, damage, isSplash = false) {
    if (this.isDead) return null;

    const headY = this.y - this.height + this.headRadius;
    const torsoY = this.y - this.height / 2;

    // Head hitbox — generous, realistic arcade hitbox (covers head, chin, neck, and crown)
    const headHitRadius = Math.max(18, 22 * this.scale);
    const distHead = Math.hypot(rayX - this.x, rayY - headY);
    const inHeadCapsule = (
      distHead <= headHitRadius ||
      (rayY >= headY - headHitRadius * 1.2 && rayY <= headY + headHitRadius * 1.1 && Math.abs(rayX - this.x) <= headHitRadius * 0.95)
    );

    if (inHeadCapsule) {
      this.health -= damage * 3.0; // 1-tap instant headshot critical
      if (this.health <= 0) {
        this.die(true, rayX, rayY);
      }
      return { hit: true, zone: 'head', isDead: this.isDead };
    }

    // Shield check
    if (this.type === 'shield' && this.shieldHealth > 0 && !isSplash) {
      const shieldLeft = this.x - 22 * this.scale;
      const shieldRight = this.x + 22 * this.scale;
      const shieldTop = this.y - this.height + 15 * this.scale;
      const shieldBottom = this.y - 10 * this.scale;

      if (rayX >= shieldLeft && rayX <= shieldRight && rayY >= shieldTop && rayY <= shieldBottom) {
        this.shieldHealth -= damage;
        return { hit: true, zone: 'shield', isDead: false };
      }
    }

    // Body / Torso & Limbs hitbox (starts below the head zone so body doesn't intercept headshots)
    const bodyHalfWidth = 22 * this.scale;
    const bodyTop = headY + headHitRadius * 0.8;
    const bodyBottom = this.y;

    if (rayX >= this.x - bodyHalfWidth && rayX <= this.x + bodyHalfWidth &&
        rayY >= bodyTop && rayY <= bodyBottom) {
      
      const isLimb = rayY > this.y - (this.height * 0.3);
      const actualDamage = isLimb ? damage * 0.6 : damage;
      this.health -= actualDamage;

      if (this.health <= 0) {
        this.die(false, rayX, rayY);
      }
      return { hit: true, zone: isLimb ? 'limb' : 'torso', isDead: this.isDead };
    }

    // Splash explosive hit
    if (isSplash) {
      const dist = Math.hypot(rayX - this.x, rayY - torsoY);
      if (dist < 150) {
        const falloff = 1 - (dist / 150);
        this.health -= damage * falloff;
        if (this.health <= 0) {
          this.die(false, rayX, rayY);
        }
        return { hit: true, zone: 'torso', isDead: this.isDead };
      }
    }

    return null;
  }

  die(isHeadshot = false, hitX = this.x, hitY = this.y) {
    this.isDead = true;
    this.headshot = isHeadshot;

    // Generate ragdoll bone parts
    const pushDirection = (this.x - hitX) >= 0 ? 1 : -1;
    const force = isHeadshot ? 300 : 200;

    this.ragdollParts = [
      {
        type: 'torso',
        x: this.x,
        y: this.y - this.height / 2,
        vx: pushDirection * (Math.random() * force + 50),
        vy: -Math.random() * 200 - 100,
        rot: 0,
        vRot: (Math.random() - 0.5) * 8
      },
      {
        type: isHeadshot ? 'head_exploded' : 'head',
        x: this.x,
        y: this.y - this.height + this.headRadius,
        vx: pushDirection * (Math.random() * force * 1.5 + 80),
        vy: -Math.random() * 350 - 150,
        rot: 0,
        vRot: (Math.random() - 0.5) * 15
      }
    ];
  }

  draw(ctx) {
    if (this.isDead) {
      this.drawRagdoll(ctx);
      return;
    }

    ctx.save();
    ctx.lineWidth = 3.5 * this.scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#39ff14';
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 8;

    const headX = this.x;
    const headY = this.y - this.height + this.headRadius;
    const neckY = headY + this.headRadius;
    const pelvisY = this.y - this.height * 0.35;
    const groundY = this.y;

    // Visual Telegraph Warning Indicator (Exclamation Badge / Laser)
    if (this.state === 'aiming') {
      const aimProgress = Math.min(1, this.stateTimer / this.aimDuration);
      
      // Laser sight for sniper
      if (this.type === 'sniper') {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 0, 85, ${0.3 + aimProgress * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 4]);
        ctx.moveTo(this.x, headY + 5);
        ctx.lineTo(800, 450); // Aiming at screen center
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Warning exclamation badge
      const badgeY = headY - 24 * this.scale;
      ctx.beginPath();
      ctx.arc(headX, badgeY, 11 * this.scale, 0, Math.PI * 2);
      ctx.fillStyle = aimProgress > 0.7 ? '#ff0055' : '#ffb703';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10 * aimProgress;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#000';
      ctx.font = `bold ${13 * this.scale}px Orbitron, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', headX, badgeY);
    }

    ctx.strokeStyle = '#39ff14';
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 8;

    // Head
    ctx.beginPath();
    ctx.arc(headX, headY, this.headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Body (Torso Spine)
    ctx.beginPath();
    ctx.moveTo(headX, neckY);
    ctx.lineTo(headX, pelvisY);
    ctx.stroke();

    // Arms & Gun
    const gunLength = 26 * this.scale;
    const gunX = headX + (this.state === 'aiming' || this.state === 'shooting' ? -gunLength : gunLength * 0.5);
    const gunY = neckY + 10 * this.scale;

    // Draw Rifle / Handgun
    ctx.beginPath();
    ctx.moveTo(headX, neckY + 4 * this.scale);
    ctx.lineTo(gunX, gunY);
    ctx.stroke();

    // Gun Barrel
    ctx.save();
    ctx.lineWidth = 4 * this.scale;
    ctx.strokeStyle = '#c0c8d8';
    ctx.beginPath();
    ctx.moveTo(gunX - 5, gunY);
    ctx.lineTo(gunX - 18 * this.scale, gunY);
    ctx.stroke();

    // Muzzle flash when shooting
    if (this.state === 'shooting' && this.stateTimer < 120) {
      ctx.fillStyle = '#ffea00';
      ctx.shadowColor = '#ff5500';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(gunX - 22 * this.scale, gunY, 8 * this.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // Riot Shield
    if (this.type === 'shield' && this.shieldHealth > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 180, 216, 0.4)';
      ctx.strokeStyle = '#00b4d8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(this.x - 18 * this.scale, this.y - this.height + 12 * this.scale, 36 * this.scale, this.height - 18 * this.scale, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Legs
    const legAnim = Math.sin(this.animPhase) * 12 * this.scale;
    if (this.state === 'running') {
      ctx.beginPath();
      ctx.moveTo(headX, pelvisY);
      ctx.lineTo(headX - 10 * this.scale, pelvisY + 15 * this.scale);
      ctx.lineTo(headX - 14 * this.scale + legAnim, groundY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(headX, pelvisY);
      ctx.lineTo(headX + 10 * this.scale, pelvisY + 15 * this.scale);
      ctx.lineTo(headX + 14 * this.scale - legAnim, groundY);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(headX, pelvisY);
      ctx.lineTo(headX - 12 * this.scale, groundY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(headX, pelvisY);
      ctx.lineTo(headX + 12 * this.scale, groundY);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawRagdoll(ctx) {
    if (this.deathTimer > 3.0) return; // Disappear after 3s
    const alpha = Math.max(0, 1 - (this.deathTimer - 2.0));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 3.5 * this.scale;
    ctx.strokeStyle = '#39ff14';
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 6;

    this.ragdollParts.forEach(part => {
      ctx.save();
      ctx.translate(part.x, part.y);
      ctx.rotate(part.rot);

      if (part.type === 'head') {
        ctx.beginPath();
        ctx.arc(0, 0, this.headRadius, 0, Math.PI * 2);
        ctx.fill();
      } else if (part.type === 'torso') {
        ctx.beginPath();
        ctx.moveTo(0, -this.height * 0.25);
        ctx.lineTo(0, this.height * 0.25);
        ctx.stroke();
        // Limbs flailing
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-15 * this.scale, 15 * this.scale);
        ctx.moveTo(0, 0);
        ctx.lineTo(15 * this.scale, 15 * this.scale);
        ctx.stroke();
      }
      ctx.restore();
    });

    ctx.restore();
  }
}

window.Stickman = Stickman;
