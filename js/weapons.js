// Weapon Definitions and Progression System
class WeaponManager {
  constructor() {
    this.weapons = {
      pistol: {
        id: 'pistol',
        name: 'Service .45 Pistol',
        shortName: 'Pistol',
        slot: 1,
        unlocked: true,
        damage: 45,
        fireRate: 260, // ms delay
        magSize: 12,
        currentAmmo: 12,
        reserveAmmo: Infinity,
        reloadTime: 1200, // ms
        recoil: 6,
        spread: 0.005,
        automatic: false,
        pellets: 1,
        zoomFactor: 1.1,
        soundType: 'pistol',
        upgrades: {
          damageLevel: 1,
          magLevel: 1,
          reloadLevel: 1
        }
      },
      shotgun: {
        id: 'shotgun',
        name: 'Tactical 12G Shotgun',
        shortName: 'Shotgun',
        slot: 2,
        unlocked: false,
        unlockCost: 600,
        damage: 30, // per pellet
        pellets: 8,
        fireRate: 750,
        magSize: 6,
        currentAmmo: 6,
        reserveAmmo: 48,
        reloadTime: 2200,
        recoil: 18,
        spread: 0.040,
        automatic: false,
        zoomFactor: 1.05,
        soundType: 'shotgun',
        upgrades: {
          damageLevel: 1,
          magLevel: 1,
          reloadLevel: 1
        }
      },
      rifle: {
        id: 'rifle',
        name: 'AR-15 Assault Rifle',
        shortName: 'Assault Rifle',
        slot: 3,
        unlocked: false,
        unlockCost: 1200,
        damage: 38,
        fireRate: 110, // Full Auto!
        magSize: 30,
        currentAmmo: 30,
        reserveAmmo: 180,
        reloadTime: 1800,
        recoil: 9,
        spread: 0.016,
        automatic: true,
        pellets: 1,
        zoomFactor: 1.25,
        soundType: 'rifle',
        upgrades: {
          damageLevel: 1,
          magLevel: 1,
          reloadLevel: 1
        }
      },
      sniper: {
        id: 'sniper',
        name: 'AWM .50 Heavy Sniper',
        shortName: 'Heavy Sniper',
        slot: 4,
        unlocked: false,
        unlockCost: 2000,
        damage: 280,
        fireRate: 1400,
        magSize: 5,
        currentAmmo: 5,
        reserveAmmo: 30,
        reloadTime: 2600,
        recoil: 28,
        spread: 0.0005,
        automatic: false,
        zoomFactor: 2.8,
        soundType: 'sniper',
        upgrades: {
          damageLevel: 1,
          magLevel: 1,
          reloadLevel: 1
        }
      },
      rpg: {
        id: 'rpg',
        name: 'RPG-7 Rocket Launcher',
        shortName: 'RPG',
        slot: 5,
        unlocked: false,
        unlockCost: 3500,
        damage: 450,
        fireRate: 2000,
        magSize: 1,
        currentAmmo: 1,
        reserveAmmo: 8,
        reloadTime: 3200,
        recoil: 35,
        spread: 0.01,
        automatic: false,
        splashRadius: 180,
        zoomFactor: 1.1,
        soundType: 'rpg',
        upgrades: {
          damageLevel: 1,
          magLevel: 1,
          reloadLevel: 1
        }
      }
    };

    this.currentWeaponId = 'pistol';
    this.lastShotTime = 0;
    this.isReloading = false;
    this.reloadStartTime = 0;
  }

  getCurrentWeapon() {
    return this.weapons[this.currentWeaponId];
  }

  selectWeapon(id) {
    if (this.weapons[id] && this.weapons[id].unlocked) {
      this.currentWeaponId = id;
      this.isReloading = false;
      return true;
    }
    return false;
  }

  selectBySlot(slot) {
    for (let key in this.weapons) {
      if (this.weapons[key].slot === slot) {
        return this.selectWeapon(key);
      }
    }
    return false;
  }

  cycleWeapon(direction) {
    const list = Object.keys(this.weapons).filter(k => this.weapons[k].unlocked);
    const currentIndex = list.indexOf(this.currentWeaponId);
    let nextIndex = (currentIndex + direction + list.length) % list.length;
    this.selectWeapon(list[nextIndex]);
  }

  canFire() {
    const w = this.getCurrentWeapon();
    const now = Date.now();
    return !this.isReloading && w.currentAmmo > 0 && (now - this.lastShotTime >= w.fireRate);
  }

  fire() {
    const w = this.getCurrentWeapon();
    if (!this.canFire()) return false;
    w.currentAmmo--;
    this.lastShotTime = Date.now();
    return true;
  }

  startReload() {
    const w = this.getCurrentWeapon();
    if (this.isReloading || w.currentAmmo >= w.magSize || w.reserveAmmo <= 0) return false;
    this.isReloading = true;
    this.reloadStartTime = Date.now();
    if (window.soundEngine) window.soundEngine.playReload();
    return true;
  }

  updateReload() {
    if (!this.isReloading) return;
    const w = this.getCurrentWeapon();
    const now = Date.now();
    if (now - this.reloadStartTime >= w.reloadTime) {
      const needed = w.magSize - w.currentAmmo;
      const toLoad = Math.min(needed, w.reserveAmmo);
      w.currentAmmo += toLoad;
      if (w.reserveAmmo !== Infinity) {
        w.reserveAmmo -= toLoad;
      }
      this.isReloading = false;
    }
  }

  upgradeDamage(weaponId) {
    const w = this.weapons[weaponId];
    if (!w) return;
    w.upgrades.damageLevel++;
    w.damage = Math.round(w.damage * 1.25);
  }

  upgradeMag(weaponId) {
    const w = this.weapons[weaponId];
    if (!w) return;
    w.upgrades.magLevel++;
    w.magSize += (w.id === 'sniper' || w.id === 'shotgun') ? 2 : (w.id === 'rpg' ? 1 : 6);
    w.currentAmmo = w.magSize;
  }

  upgradeReload(weaponId) {
    const w = this.weapons[weaponId];
    if (!w) return;
    w.upgrades.reloadLevel++;
    w.reloadTime = Math.max(600, Math.round(w.reloadTime * 0.8));
  }
}

window.weaponManager = new WeaponManager();
