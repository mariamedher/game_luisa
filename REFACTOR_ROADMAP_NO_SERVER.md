# Refactoring Roadmap - Step-by-Step Guide
## ⚠️ NO SERVER VERSION - Works with file:// protocol

This document contains SPECIFIC, ACTIONABLE refactoring tasks. Each task is self-contained and can be done in a fresh Claude session.

**IMPORTANT:** This game must work by opening index.html directly (no server). All code uses global variables, NO ES6 modules.

---

## How to Use This Roadmap

**For each task:**
1. Start a new Claude chat
2. Share: game.js (or specific section), this roadmap, and the task number
3. Say: "Please complete Task #X from the roadmap. The game must work without a server (no ES6 modules)."
4. Test the changes
5. Commit to git before moving to next task

**IMPORTANT:** Do these in order! Later tasks depend on earlier ones.

---

## Task 1: Create Constants File (30 mins) ✅ COMPLETED
**Risk:** ⚪ None - New file, no changes to existing code
**Files:** Create `constants.js`

### What you did:
Created `constants.js` with global constants (NO `export` keyword):

```javascript
const SCREENS = {
    START: 'start-screen',
    DIALOGUE: 'dialogue-screen',
    // ... etc
};

const ACTIONS = { /* ... */ };
const PITCHES = { /* ... */ };
const SPEAKERS = { /* ... */ };
const SFX = { /* ... */ };
const BGM_TRACKS = { /* ... */ };
```

Updated `index.html`:
```html
<script src="dialogues.js"></script>
<script src="constants.js"></script>
<script src="game.js"></script>
```

**Status:** ✅ Done and committed

---

## Task 2: Extract AudioManager Class (2 hours)
**Risk:** 🟡 Medium - Changes how audio works
**Files:** Create `core/audio-manager.js`, modify `game.js`

### Step 2.1: Create core/audio-manager.js

**Create the folder first:**
```
christmas-gift/
├── core/              ← NEW FOLDER
│   └── audio-manager.js
```

**NO `export` - Make it global:**

```javascript
// core/audio-manager.js
// Audio management class - global, no ES6 modules
class AudioManager {
    constructor() {
        this.tracks = new Map();
        this.sfxMap = new Map();
        this.currentTrack = null;
        this.currentWitnessMusic = null;
    }

    // Register audio elements
    registerTrack(name, element, defaultVolume = 0.4) {
        this.tracks.set(name, { element, defaultVolume });
    }

    registerSfx(name, element) {
        this.sfxMap.set(name, element);
    }

    // Play background music
    playTrack(name, volume = null) {
        const track = this.tracks.get(name);
        if (!track) return;

        // Stop current track
        if (this.currentTrack) {
            this.currentTrack.element.pause();
        }

        track.element.volume = volume ?? track.defaultVolume;
        track.element.play().catch(() => {});
        this.currentTrack = track;
    }

    // Fade between tracks
    async fadeToTrack(newTrackName, duration = 1000) {
        const newTrack = this.tracks.get(newTrackName);
        if (!newTrack) return;

        // Fade out current
        if (this.currentTrack) {
            await this.fadeOut(this.currentTrack.element, duration / 2);
            this.currentTrack.element.pause();
        }

        // Fade in new
        newTrack.element.volume = 0;
        newTrack.element.play().catch(() => {});
        await this.fadeIn(newTrack.element, newTrack.defaultVolume, duration / 2);
        this.currentTrack = newTrack;
    }

    fadeOut(element, duration) {
        return new Promise(resolve => {
            const startVolume = element.volume;
            const steps = 20;
            const stepTime = duration / steps;
            const stepSize = startVolume / steps;

            const interval = setInterval(() => {
                element.volume = Math.max(0, element.volume - stepSize);
                if (element.volume <= 0.01) {
                    clearInterval(interval);
                    element.volume = 0;
                    resolve();
                }
            }, stepTime);
        });
    }

    fadeIn(element, targetVolume, duration) {
        return new Promise(resolve => {
            const steps = 20;
            const stepTime = duration / steps;
            const stepSize = targetVolume / steps;

            const interval = setInterval(() => {
                element.volume = Math.min(targetVolume, element.volume + stepSize);
                if (element.volume >= targetVolume - 0.01) {
                    clearInterval(interval);
                    element.volume = targetVolume;
                    resolve();
                }
            }, stepTime);
        });
    }

    // Play sound effect
    playSfx(name, onPlay = null) {
        const sfx = this.sfxMap.get(name);
        if (sfx) {
            sfx.currentTime = 0;
            sfx.play().catch(() => {});
            if (onPlay) onPlay();
        }
    }

    // Pause current track
    pauseCurrent() {
        if (this.currentTrack) {
            this.currentTrack.element.pause();
        }
    }

    // Stop all witness music
    stopWitnessMusic() {
        ['bgm-cait', 'bgm-glorp', 'bgm-couple'].forEach(name => {
            const track = this.tracks.get(name);
            if (track) {
                track.element.pause();
                track.element.currentTime = 0;
            }
        });
        this.currentWitnessMusic = null;
    }

    // Switch to witness music
    switchToWitnessMusic(witnessId) {
        this.pauseCurrent();
        this.stopWitnessMusic();

        const trackName = `bgm-${witnessId}`;
        this.playTrack(trackName, 0.3);
        this.currentWitnessMusic = witnessId;
    }

    // Return to main music
    switchToMainMusic() {
        this.stopWitnessMusic();
        this.playTrack('bgm', 0.4);
    }
}
```

### Step 2.2: Update index.html

Add the audio-manager.js script BEFORE game.js:

```html
<script src="dialogues.js"></script>
<script src="constants.js"></script>
<script src="core/audio-manager.js"></script>  <!-- NEW -->
<script src="game.js"></script>
```

### Step 2.3: Update game.js

**Find line ~160 (after `const animalese = new AnimaleseEngine();`):**

Add:
```javascript
const audioManager = new AudioManager();
```

**Find the initialization section (around line 3591):**

Replace:
```javascript
// OLD:
elements.bgm.volume = 0.4;
elements.bgm.play().catch(() => {});
```

With:
```javascript
// NEW: Register all tracks and SFX
audioManager.registerTrack('bgm', elements.bgm, 0.4);
audioManager.registerTrack('bgm-cait', elements.bgmCait, 0.3);
audioManager.registerTrack('bgm-glorp', elements.bgmGlorp, 0.3);
audioManager.registerTrack('bgm-couple', elements.bgmCouple, 0.3);
audioManager.registerTrack('bgm-final', elements.bgmFinal, 0.3);

audioManager.registerSfx('click', elements.sfxClick);
audioManager.registerSfx('papers', elements.sfxPapers);
audioManager.registerSfx('dice', elements.sfxDice);
audioManager.registerSfx('harp', elements.sfxHarp);
audioManager.registerSfx('munch', elements.sfxMunch);
audioManager.registerSfx('clack', elements.sfxClack);
audioManager.registerSfx('sparkle', elements.sfxSparkle);
audioManager.registerSfx('surprise', elements.sfxSurprise);
audioManager.registerSfx('squeak', elements.sfxSqueak);
audioManager.registerSfx('helicopter', elements.sfxHelicopter);
audioManager.registerSfx('snap', document.getElementById('sfx-snap'));
audioManager.registerSfx('slurp', elements.sfxSlurp);
audioManager.registerSfx('alien', elements.sfxAlien);
audioManager.registerSfx('spaceship', elements.sfxSpaceship);

// Start main music
audioManager.playTrack('bgm');
```

**Replace `playClickSound()` (line ~326):**
```javascript
function playClickSound() {
    audioManager.playSfx('click');
}
```

**Replace `playPapersSound()` (line ~748):**
```javascript
function playPapersSound() {
    audioManager.playSfx('papers');
}
```

**Replace `playSfx()` (lines ~373-397):**
```javascript
function playSfx(soundName) {
    // Special handling for munch (pretzel sprite)
    if (soundName === 'munch' && elements.evidenceMol) {
        audioManager.playSfx('sparkle');
        audioManager.playSfx('munch');
        elements.evidenceMol.src = 'images/Mol_pretzel.png';
        gameState.evidenceMolSprite = 'pretzel';
    } else {
        audioManager.playSfx(soundName);
    }
}
```

**Replace `switchToWitnessMusic()` (lines ~1431-1449):**
```javascript
function switchToWitnessMusic(witnessId) {
    audioManager.switchToWitnessMusic(witnessId);
    gameState.currentWitnessMusic = witnessId;
}
```

**Replace `switchToMainMusic()` (lines ~1451-1461):**
```javascript
function switchToMainMusic() {
    audioManager.switchToMainMusic();
    gameState.currentWitnessMusic = null;
}
```

**Find music change in `processIdentifyDialogue()` (around line 2302):**
```javascript
// OLD:
// elements.bgm.pause();
// elements.bgmFinal.volume = 0.3;
// elements.bgmFinal.play();

// NEW:
audioManager.fadeToTrack('bgm-final', 2000);
```

**Find fade in finale (around lines 3195-3217) - DELETE entire fadeout logic, replace with:**
```javascript
await audioManager.fadeOut(audioManager.currentTrack.element, 3000);
```

### Testing Task 2:
- [ ] Main music plays on start
- [ ] Click sounds work
- [ ] Papers sound in leads
- [ ] Witness music switches correctly (Cait, Glorp, Couple)
- [ ] Returns to main music when leaving witness
- [ ] Final music fades in during identify
- [ ] Music fades out in finale

---

## Task 3: Unify Input Handlers (1 hour)
**Risk:** 🟡 Medium - Changes keyboard input
**Files:** Modify `game.js`

### What to do:

**Find lines ~3612-3696 (all the separate keydown handlers):**

**DELETE all these separate handlers:**
- Lines ~3612-3628: Intro dialogue Enter
- Lines ~3629-3645: Leads Enter
- Lines ~3646-3662: Evidence Enter
- Lines ~3663-3679: Witness Enter
- Lines ~3680-3696: Identify Enter

**REPLACE with single unified handler:**
```javascript
// Unified keyboard input handler
document.addEventListener('keydown', (e) => {
    // Map screens to their advance functions
    const screenHandlers = {
        'dialogue-screen': advanceDialogue,
        'leads-screen': advanceLeads,
        'evidence-screen': advanceEvidenceDialogue,
        'witness-screen': advanceWitnessDialogue,
        'identify-screen': advanceIdentifyDialogue
    };

    if (e.key === 'Enter') {
        const handler = screenHandlers[gameState.currentScreen];

        if (handler) {
            if (gameState.waitingForInput && !gameState.isTyping) {
                handler();
            } else if (gameState.isTyping) {
                gameState.skipTyping = true;
            }
        }
    }
});

// Unified click-to-continue handlers
const clickHandlerMap = {
    'dialogue-screen': { element: elements.dialogueBox, advance: advanceDialogue },
    'leads-screen': { element: document.getElementById('leads-dialogue-box'), advance: advanceLeads },
    'evidence-screen': { element: document.getElementById('evidence-dialogue-box'), advance: advanceEvidenceDialogue },
    'witness-screen': { element: document.getElementById('witness-dialogue-box'), advance: advanceWitnessDialogue },
    'identify-screen': { element: elements.identifyDialogueBox, advance: advanceIdentifyDialogue }
};

Object.entries(clickHandlerMap).forEach(([screen, config]) => {
    config.element.addEventListener('click', () => {
        if (gameState.currentScreen === screen &&
            gameState.waitingForInput &&
            !gameState.isTyping) {
            config.advance(false); // false = don't play click sound
        }
    });
});
```

### Testing:
- [ ] Enter key advances all screens
- [ ] Enter skips typing animation
- [ ] Click on dialogue box advances
- [ ] Works in intro, leads, evidence, witness, identify

---

## Task 4: Unify Hide Inputs Functions (30 mins)
**Risk:** 🟢 Low - Simple consolidation
**Files:** Modify `game.js`

### What to do:

**DELETE these functions:**
- `hideAllInputs()` (lines ~353-358)
- `hideLeadsInputs()` (lines ~753-757)
- `hideEvidenceInputs()` (lines ~988-992)
- `hideWitnessInputs()` (lines ~1324-1328)

**REPLACE with single function (add around line 353):**
```javascript
function hideInputs(screen = gameState.currentScreen) {
    // Define what to hide for each screen
    const hideActions = {
        'dialogue-screen': () => {
            elements.nameInputContainer.style.display = 'none';
            elements.confirmationContainer.style.display = 'none';
            elements.actionContainer.style.display = 'none';
            elements.enterHint.style.display = 'none';
        },
        'leads-screen': () => {
            elements.leadsEnterHint.style.display = 'none';
            elements.leadsChoices.style.display = 'none';
            elements.leadsContinueBtn.style.display = 'none';
        },
        'evidence-screen': () => {
            elements.evidenceEnterHint.style.display = 'none';
            elements.evidenceChoices.style.display = 'none';
            elements.evidenceContinueBtn.style.display = 'none';
        },
        'witness-screen': () => {
            elements.witnessEnterHint.style.display = 'none';
            elements.witnessChoices.style.display = 'none';
            elements.witnessContinueBtn.style.display = 'none';
        },
        'identify-screen': () => {
            elements.identifyEnterHint.style.display = 'none';
            elements.identifyChoices.style.display = 'none';
            elements.identifyContinueBtn.style.display = 'none';
        }
    };

    const action = hideActions[screen];
    if (action) action();
}
```

**Find and replace all calls:**
Use your editor's find-and-replace:
- `hideAllInputs()` → `hideInputs('dialogue-screen')`
- `hideLeadsInputs()` → `hideInputs('leads-screen')`
- `hideEvidenceInputs()` → `hideInputs('evidence-screen')`
- `hideWitnessInputs()` → `hideInputs('witness-screen')`

Or just `hideInputs()` if already in the correct screen context.

### Testing:
- [ ] Input fields hide correctly on all screens
- [ ] No visual glitches

---

## Task 5: Extract AnimaleseEngine to Separate File (30 mins)
**Risk:** 🟢 Low - Clean extraction
**Files:** Create `core/animalese-engine.js`, modify `game.js`

### Step 5.1: Create core/animalese-engine.js

Copy the AnimaleseEngine class from game.js (lines ~5-96) to new file.

**NO `export` - Keep it global:**

```javascript
// core/animalese-engine.js
// Animalese text-to-speech engine - global, no ES6 modules

class AnimaleseEngine {
    constructor() {
        this.audioContext = null;
        this.baseFrequency = 200;
        this.letterDuration = 0.06;
        // Pitch multipliers for different speakers
        this.pitchSettings = {
            'normal': 1.0,      // Mol's normal voice
            'medium': 1.3,      // Astarion - slightly higher
            'high': 1.8,        // Cait (hamster) - squeaky high
            'low': 0.7,         // Raphael - deep voice
            'veryHigh': 2.2,    // Even squeakier
            'alien': 2.0,       // Glorp - high base, distorted
            'luisa': 1.15       // Luisa - slightly higher but softer
        };
        // Special settings for alien voice
        this.alienSettings = {
            baseMultiplier: 2.0,      // High base pitch
            variationRange: 0.15,     // Low variation (flat intonation)
            letterDuration: 0.04,     // Faster syllables
            waveType: 'sawtooth'      // Harsher, more robotic sound
        };
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    getFrequencyForChar(char, isLoud, pitch = 'normal') {
        const pitchMultiplier = this.pitchSettings[pitch] || 1.0;
        const baseFreq = (isLoud ? this.baseFrequency * 1.5 : this.baseFrequency) * pitchMultiplier;
        const charCode = char.toLowerCase().charCodeAt(0);

        // Special handling for alien voice - flatter, less variation
        if (pitch === 'alien') {
            const alienBase = this.baseFrequency * this.alienSettings.baseMultiplier;
            const variation = ((charCode - 97) / 26) * 50 * this.alienSettings.variationRange;
            return alienBase + variation + (Math.random() * 10);
        }

        // Create variation based on character
        if (char >= 'a' && char <= 'z') {
            const variation = ((charCode - 97) / 26) * 150 * pitchMultiplier;
            return baseFreq + variation + (Math.random() * 30 - 15);
        }
        return baseFreq + Math.random() * 50;
    }

    playLetter(char, isLoud = false, pitch = 'normal') {
        if (!this.audioContext) this.init();
        if (!/[a-zA-Z]/.test(char)) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // For alien voice, add a filter to boost upper mids (bright 'ee' timbre)
        if (pitch === 'alien') {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
            filter.Q.setValueAtTime(1, this.audioContext.currentTime);

            oscillator.connect(filter);
            filter.connect(gainNode);
        } else {
            oscillator.connect(gainNode);
        }
        gainNode.connect(this.audioContext.destination);

        const frequency = this.getFrequencyForChar(char, isLoud, pitch);
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Use sawtooth for alien (harsher), square for others
        oscillator.type = pitch === 'alien' ? this.alienSettings.waveType : 'square';

        // Volume - louder for emphasized text, louder for alien
        const volume = isLoud ? 0.18 : (pitch === 'alien' ? 0.14 : 0.08);

        // Duration - faster for alien
        const duration = pitch === 'alien' ? this.alienSettings.letterDuration : this.letterDuration;

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
}
```

### Step 5.2: Update index.html

Add before game.js:
```html
<script src="constants.js"></script>
<script src="core/animalese-engine.js"></script>  <!-- NEW -->
<script src="core/audio-manager.js"></script>
<script src="game.js"></script>
```

### Step 5.3: Update game.js

**DELETE lines ~1-96** (the entire AnimaleseEngine class)

Keep the instantiation line (~160):
```javascript
const animalese = new AnimaleseEngine();
```

### Testing:
- [ ] Animalese voice still works
- [ ] Different pitches work (Mol, Cait, Glorp, etc.)
- [ ] Loud text has higher pitch

---

## Task 6: Remove Debug Code (15 mins)
**Risk:** 🟢 None - Just cleanup
**Files:** Modify `game.js`, `index.html`, `styles.css`

### In index.html:

**DELETE lines ~344-352:**
```html
<!-- DEBUG PANEL - Remove before release -->
<div id="debug-panel">
    <button id="debug-toggle">DBG</button>
    <div id="debug-buttons">
        <button data-debug="fears">Fears</button>
        <button data-debug="dreams">Dreams</button>
        <button data-debug="finale">Finale</button>
    </div>
</div>
```

### In styles.css:

**DELETE lines ~1537-1589:**
All the `#debug-panel` styles.

### In game.js:

**DELETE lines ~3376-3531:**
The entire ESC key debug handler starting with:
```javascript
// Debug shortcuts (ESC key menu)
let debugMenuOpen = false;
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // ... entire block
    }
});
```

And DELETE the debug panel toggle near the end too (around line ~3600).

### Testing:
- [ ] Game still works
- [ ] ESC key does nothing
- [ ] No debug panel visible
- [ ] No console errors

---

## After Completing Tasks 1-6

You'll have:
- ✅ ~400-500 lines removed from game.js
- ✅ Better organized code (core/ folder with modular classes)
- ✅ No debug code
- ✅ Unified audio management
- ✅ Cleaner input handling
- ✅ **Game still works perfectly without a server**

### Final file structure:
```
christmas-gift/
├── index.html
├── game.js                  (~3300 lines, down from 3752)
├── dialogues.js
├── styles.css
├── constants.js             (NEW)
├── core/
│   ├── animalese-engine.js  (NEW)
│   └── audio-manager.js     (NEW)
├── images/
└── audio/
```

---

## Git Commit Messages

```
Task 1: Add constants file (no ES6 modules)
Task 2: Extract AudioManager class (global scope)
Task 3: Unify keyboard and click input handlers
Task 4: Consolidate hide inputs functions
Task 5: Extract AnimaleseEngine to separate file
Task 6: Remove debug panel and ESC shortcuts
```

---

## Important Notes

**NO SERVER REQUIRED:**
- ✅ All scripts use global scope
- ✅ No `import`/`export` keywords
- ✅ Load order matters (use `<script>` tags in order)
- ✅ Works with `file://` protocol

**When starting each new Claude chat, say:**
> "I'm refactoring a game that must work WITHOUT a server (no ES6 modules, file:// protocol). Please complete Task #X using global scope only."

This ensures the new Claude doesn't accidentally use modules!
