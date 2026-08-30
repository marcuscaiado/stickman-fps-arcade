# 🎮 Stickman FPS Arcade (Stationary Rail Shooter)

A fast, responsive, zero-dependency first-person stickman arcade shooter built with HTML5 Canvas, Web Audio API, and Vanilla JavaScript.

![Stickman FPS Arcade](https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80)

---

## 🕹️ Controls

- **Mouse Move**: Aim Crosshair (with dynamic weapon sway & recoil)
- **Left Click**: Fire Weapon
- **Right Click / Spacebar**: Aim Down Sights (ADS) / Sniper Scope Zoom
- **R**: Reload Magazine
- **1, 2, 3, 4, 5 / Mouse Scroll**: Switch Weapons (Pistol, Shotgun, Assault Rifle, Sniper, RPG)
- **P / Esc**: Pause / Resume Game

---

## ⚡ Features

- **Classic Stationary FPS Perspective**: You are fixed in a sniper/bunker outpost. Only aim, shoot, and survive.
- **5 Distinct Weapons**: Pistol, Shotgun, Full-Auto Assault Rifle, Heavy Sniper Rifle, and RPG Launcher.
- **Wave & Progression System**: Increasing difficulty, enemy reaction speed, and enemy count.
- **Intermission Black Market Shop**: Buy weapon upgrades (Damage, Mag Size, Fire Rate, Reload Speed) and Body Armor between waves.
- **Dynamic Procedural Audio**: 100% Web Audio API synthesized audio (gunshots, shells, reloads, explosions, and headshot dings) - zero external audio assets required.
- **Physics & Decals**: Hitboxes for Headshots (instant kill), Torso, and Limbs. Ragdoll physics, blood splatters, and bullet holes on concrete.

---

## 🚀 How to Run

1. Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
2. Alternatively, serve with any local server:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```
