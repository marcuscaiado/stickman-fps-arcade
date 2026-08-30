# 🎯 Stickman FPS Arcade: Master Prompt & Specification

## 1. Concept & Gameplay Vision
**Stickman FPS Arcade** is a fast-paced, stationary first-person gallery shooter inspired by classic Flash stickman sniper titles (*Tactical Assassin*, *Sniper Assassin*) and 90s arcade rail shooters (*Virtua Cop*, *Time Crisis*). 

The player sits in a fixed sniper/defense vantage point overlooking an urban hostile sector. Enemies (animated stick figures) pop out of building windows, line up shots on rooftops, and rush from alleyways. The player must rely purely on mouse aim, trigger discipline, quick weapon switching, and tactical reloads to survive escalating waves.

---

## 2. Core Controls
| Action | Key / Control |
|---|---|
| **Aim** | Mouse Movement (dynamic crosshair with weapon sway) |
| **Shoot** | Left Mouse Button |
| **ADS / Sniper Scope** | Right Mouse Button / Space (hold to zoom) |
| **Reload** | `R` Key |
| **Switch Weapons** | Keys `1`, `2`, `3`, `4`, `5` or Mouse Wheel |
| **Pause / Resume** | `P` or `Escape` |

---

## 3. Weapon Arsenal
1. **Service Pistol (.45 ACP)**: 
   - Moderate damage, semi-automatic, fast reload, infinite backup magazines.
2. **Tactical Pump Shotgun (12-Gauge)**:
   - High multi-pellet spread, devastating at close/medium range, heavy knockback.
3. **Assault Rifle (5.56 NATO)**:
   - Rapid fully-automatic fire, progressive vertical recoil climb, medium penetration.
4. **Heavy Bolt-Action Sniper (.50 BMG)**:
   - Extreme zoom, one-shot torso/head kills, slow cycle time, massive screen shake.
5. **RPG / Grenade Launcher**:
   - Explosive area-of-effect damage, eliminates clusters of enemies and destructible cover.

---

## 4. Stickman Enemy Archetypes & Hitboxes
- **Window Snipers**: Emerge from windows, show an aiming countdown laser, and fire high-damage rounds.
- **Rooftop Riflemen**: Stand on top ledges, lay down suppressing burst fire.
- **Kamikaze Rushers**: Sprint rapidly across the bottom alleys toward the player screen.
- **Riot Shield Heavies**: Require precision leg shots or explosive weapons to dismantle.

### Hitbox Precision:
- **Headshot**: Instant kill + decapitation/blood fountain + 2.5x Score multiplier + audio bell chime.
- **Torso**: Standard body damage + knockback stumble.
- **Limbs**: 50% damage + disarms or slows movement speed.

---

## 5. Visual & Audio Architecture
- **Rendering**: 100% vector HTML5 Canvas rendering for high frame rate, zero asset lag, and responsive resolution scaling.
- **Juice**: Screen shake, dynamic muzzle flash illumination, persistent blood splatter decals on walls, bullet hole sparks, and bullet-cam slow-motion effects.
- **Procedural Audio**: Web Audio API oscillator/noise synthesis for gunshots, reload ratchets, explosions, shell drops, and headshot chimes without external `.mp3` dependencies.
