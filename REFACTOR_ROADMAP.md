# Refactoring Roadmap - Step-by-Step Guide

This document contains SPECIFIC, ACTIONABLE refactoring tasks. Each task is self-contained and can be done in a fresh Claude session.

---

## How to Use This Roadmap

**For each task:**
1. Start a new Claude chat
2. Share: game.js (or specific section), this roadmap, and the task number
3. Ask: "Please complete Task #X from the roadmap"
4. Test the changes
5. Commit to git before moving to next task

**IMPORTANT:** Do these in order! Later tasks depend on earlier ones.

---

## Task 1: Create Constants File (30 mins)
**Risk:** ⚪ None - New file, no changes to existing code
**Files:** Create `constants.js`

### What to do:
Create a new file `constants.js` with all magic strings from game.js:

```javascript
export const SCREENS = {
    START: 'start-screen',
    DIALOGUE: 'dialogue-screen',
    TITLE: 'title-screen',
    MENU: 'menu-screen',
    LEADS: 'leads-screen',
    EVIDENCE: 'evidence-screen',
    WITNESS: 'witness-screen',
    IDENTIFY: 'identify-screen',
    END: 'end-screen'
};

export const ACTIONS = {
    WAIT: 'wait',
    CHOICE: 'choice',
    CONTINUE_BUTTON: 'continue_button',
    NAME_INPUT: 'name_input',
    ADD_LEAD: 'add_lead',
    COLORED_TEXT: 'colored_text',
    SHOW_KOLA: 'show_kola',
    HIDE_KOLA: 'hide_kola',
    END_LEADS: 'end_leads',
    SHOW_IMAGE: 'show_image',
    FLY_AWAY: 'fly_away',
    SPIN: 'spin',
    BEAM_UP: 'beam_up',
    VANISH: 'vanish',
    SHOW_GRID: 'show_grid',
    HIDE_GRID: 'hide_grid',
    START_FEARS: 'start_fears',
    SHOW_FEARS: 'show_fears',
    SHOW_NEXT_CLUSTER: 'show_next_cluster',
    ENABLE_CROSSING: 'enable_crossing',
    FADE_WORDS: 'fade_words',
    FULL_RECOVERY: 'full_recovery',
    SHOW_DREAMS: 'show_dreams',
    SHOW_FINALE: 'show_finale',
    START_FADE: 'start_fade',
    END: 'end',
    MUSIC_CHANGE: 'music_change'
};

export const PITCHES = {
    NORMAL: 'normal',
    MEDIUM: 'medium',
    HIGH: 'high',
    LOW: 'low',
    VERY_HIGH: 'veryHigh',
    ALIEN: 'alien',
    LUISA: 'luisa'
};

export const SPEAKERS = {
    MOL: 'mol',
    CAIT: 'cait',
    GLORP: 'glorp',
    RAPHAEL: 'r',
    ASTARION: 'a',
    LUISA: 'luisa'
};

export const SFX = {
    CLICK: 'click',
    PAPERS: 'papers',
    DICE: 'dice',
    HARP: 'harp',
    MUNCH: 'munch',
    CLACK: 'clack',
    SPARKLE: 'sparkle',
    SURPRISE: 'surprise',
    SQUEAK: 'squeak',
    HELICOPTER: 'helicopter',
    SNAP: 'snap',
    SLURP: 'slurp',
    ALIEN: 'alien',
    SPACESHIP: 'spaceship'
};

export const BGM_TRACKS = {
    MAIN: 'bgm',
    CAIT: 'bgm-cait',
    GLORP: 'bgm-glorp',
    COUPLE: 'bgm-couple',
    FINAL: 'bgm-final'
};
```

### Then update index.html:
Add before `<script src="game.js">`:
```html
<script type="module" src="constants.js"></script>
```

### Testing:
- File loads without errors
- Don't change game.js yet - we'll use these constants in later tasks

---

## Task 2: Extract AudioManager Class (2 hours)
**Risk:** 🟡 Medium - Changes how audio works
**Files:** Create `core/audio-manager.js`, modify `game.js`

### What to do:

#### Step 2.1: Create core/audio-manager.js
```javascript
export class AudioManager {
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

#### Step 2.2: Update game.js

**Find line ~160 (after `const animalese = new AnimaleseEngine();`):**
```javascript
// Add this:
import { AudioManager } from './core/audio-manager.js';
const audioManager = new AudioManager();

// In initialization (around line 3591), replace audio setup:
// OLD:
// elements.bgm.volume = 0.4;
// elements.bgm.play();

// NEW:
// Register all tracks and SFX
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
audioManager.registerSfx('snap', elements.sfxSnap);
audioManager.registerSfx('slurp', elements.sfxSlurp);
audioManager.registerSfx('alien', elements.sfxAlien);
audioManager.registerSfx('spaceship', elements.sfxSpaceship);

// Start main music
audioManager.playTrack('bgm');
```

**Replace playClickSound() (line 326):**
```javascript
function playClickSound() {
    audioManager.playSfx('click');
}
```

**Replace playPapersSound() (line 748):**
```javascript
function playPapersSound() {
    audioManager.playSfx('papers');
}
```

**Replace playSfx() (lines 373-397):**
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

**Replace switchToWitnessMusic() (lines 1431-1449):**
```javascript
function switchToWitnessMusic(witnessId) {
    audioManager.switchToWitnessMusic(witnessId);
    gameState.currentWitnessMusic = witnessId;
}
```

**Replace switchToMainMusic() (lines 1451-1461):**
```javascript
function switchToMainMusic() {
    audioManager.switchToMainMusic();
    gameState.currentWitnessMusic = null;
}
```

**Find music change in processIdentifyDialogue() (around line 2302):**
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

### Testing:
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

**Find lines 3612-3696 (all the separate keydown handlers):**

**DELETE all these separate handlers:**
- Lines 3612-3628: Intro dialogue Enter
- Lines 3629-3645: Leads Enter
- Lines 3646-3662: Evidence Enter
- Lines 3663-3679: Witness Enter
- Lines 3680-3696: Identify Enter

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
- `hideAllInputs()` (lines 353-358)
- `hideLeadsInputs()` (lines 753-757)
- `hideEvidenceInputs()` (lines 988-992)
- `hideWitnessInputs()` (lines 1324-1328)

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
- `hideAllInputs()` → `hideInputs('dialogue-screen')`
- `hideLeadsInputs()` → `hideInputs('leads-screen')`
- `hideEvidenceInputs()` → `hideInputs('evidence-screen')`
- `hideWitnessInputs()` → `hideInputs('witness-screen')`
- Or just `hideInputs()` if in the right screen context

### Testing:
- [ ] Input fields hide correctly on all screens
- [ ] No visual glitches

---

## Task 5: Extract AnimaleseEngine to Separate File (30 mins)
**Risk:** 🟢 Low - Clean extraction
**Files:** Create `core/animalese-engine.js`, modify `game.js`

### What to do:

#### Step 5.1: Create core/animalese-engine.js
Copy lines 1-96 from game.js to this new file, add export:
```javascript
export class AnimaleseEngine {
    // ... (all existing code from game.js lines 5-96)
}
```

#### Step 5.2: Update game.js
**DELETE lines 1-96**

**ADD at top of game.js:**
```javascript
import { AnimaleseEngine } from './core/animalese-engine.js';
```

**Line ~160 stays the same:**
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

### What to do:

#### In index.html:
**DELETE lines 344-352:**
```html
<!-- DEBUG PANEL - Remove before release -->
<div id="debug-panel">
    ...
</div>
```

#### In styles.css:
**DELETE lines 1537-1589:**
```css
/* ============================================
   DEBUG PANEL - Remove before release
   ============================================ */
#debug-panel { ... }
```

#### In game.js:
**DELETE lines 3376-3531 (ESC key debug handlers):**
All the code starting with:
```javascript
// Debug shortcuts (ESC key menu)
let debugMenuOpen = false;
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // ... entire debug menu
    }
});
```

### Testing:
- [ ] Game still works
- [ ] ESC key does nothing
- [ ] No debug panel visible

---

## Task 7: Create Dialogue Manager Base (3-4 hours)
**Risk:** 🔴 High - Major refactor
**Files:** Create `core/dialogue-manager.js`, modify screen processing

**STOP HERE FOR NOW - This needs more planning**

I recommend doing Tasks 1-6 first, then reassessing if you want to continue with deeper refactoring.

---

## Testing Checklist (Run After Each Task)

### Basic Flow:
- [ ] Game starts
- [ ] Name input works
- [ ] Intro dialogue completes
- [ ] Title screen shows
- [ ] Menu appears

### Leads:
- [ ] Leads dialogue works
- [ ] Colored hair text appears
- [ ] Kola image shows/hides
- [ ] Choices work
- [ ] Leads added to sidebar

### Evidence:
- [ ] Intro dialogue plays
- [ ] All 5 evidence items clickable
- [ ] Dice rolls, harp plucks
- [ ] Manuscript confiscated
- [ ] Pretzel sprite appears
- [ ] Back to menu works

### Witness:
- [ ] All 3 witnesses work
- [ ] Cait: squeaks, helicopter takeoff
- [ ] Glorp: spins, alien effect, beam up
- [ ] Couple: vanish effect
- [ ] Music changes per witness
- [ ] Returns to main music

### Identify:
- [ ] Intro dialogue
- [ ] Evidence grid shows
- [ ] Each item reveals trait
- [ ] Fear words appear
- [ ] Can cross out fears
- [ ] Depression filter darkens
- [ ] Recovery lightens
- [ ] Dreams reveal on hover
- [ ] Name input works
- [ ] Wrong answers have responses
- [ ] Correct answer triggers finale

### Finale:
- [ ] Dialogue between Mol & Luisa
- [ ] Fade to black
- [ ] "You are loved" appears
- [ ] Can replay

---

## Git Commit Messages (Use These)

After each task:
```
Task 1: Add constants file for magic strings
Task 2: Extract AudioManager class
Task 3: Unify keyboard and click input handlers
Task 4: Consolidate hide inputs functions
Task 5: Extract AnimaleseEngine to separate file
Task 6: Remove debug panel and ESC shortcuts
```

---

## If Something Breaks

1. **Don't panic** - Check browser console
2. **Check the diff** - What changed?
3. **Revert** - `git checkout game.js` (if committed before)
4. **Ask Claude** - Start new chat: "I'm doing Task X, getting error Y"

---

## After Completing Tasks 1-6

You'll have:
- ✅ ~400 lines removed from game.js
- ✅ Better organized code (core/ folder)
- ✅ No debug code
- ✅ Easier to maintain audio
- ✅ Unified input handling

**Then decide:** Stop here or continue with dialogue manager refactor?

The game will work perfectly after Task 6. Further refactoring is optional polish.
