# Phase 3 Refactoring Roadmap - Final Cleanup

**Prerequisites:** Phase 1 (Tasks 1-6) and Phase 2 (Tasks 7-13) must be complete
**Goal:** Extract remaining logic from game.js to achieve pure initialization file
**Constraint:** NO ES6 modules - global scope only (file:// protocol compatibility)

---

## Context for New Claude Sessions

This is a visual novel detective game. We've completed:
- ✅ Phase 1: Extracted core utilities, unified patterns
- ✅ Phase 2: Extracted all screen logic to separate files
- ✅ Cleanup: Removed ~2,200 lines of commented old code

**Current State:**
- game.js: 1,092 lines (was 3,299)
- All screens extracted to `screens/` folder
- Core utilities in `core/` folder
- Everything works with file:// protocol (no build step)

**Phase 3 Goal:**
- game.js → ~300-400 lines (pure initialization)
- Extract menu screen logic, floating text, title/end screens
- Consolidate constants

---

## Task 14: Extract Menu Screen Logic

**Estimated Time:** 2-3 hours
**Risk:** 🟢 Low
**Files to Create:** `screens/menu-screen.js`

### What to Extract

From `game.js`, extract the following to `screens/menu-screen.js`:

1. **Constants (lines 67-112):**
   - `MOL_IDLE_DIALOGUES` array
   - `MOL_COFFEE_REACTIONS` array
   - `COFFEE_LINE_INDICES` array (line 331)
   - `SPECIAL_MOL_SPRITES` array (line 334)

2. **Functions (lines 328-493):**
   - `areAllWitnessesInterviewed()`
   - `isCoffeeLine(index)`
   - `getRandomIdleDialogue()`
   - `showIdleDialogue()`
   - `giveCoffee()`
   - `startIdleDialogue()`
   - `stopIdleDialogue()`

### Implementation Pattern

Create a `MenuScreen` class following the pattern from other screens:

```javascript
// screens/menu-screen.js
class MenuScreen {
    constructor() {
        // Constants
        this.idleDialogues = [ /* MOL_IDLE_DIALOGUES array */ ];
        this.coffeeReactions = [ /* MOL_COFFEE_REACTIONS array */ ];
        this.coffeeLineIndices = [0, 1, 2, 3, 4, 5, 14];
        this.specialMolSprites = ['Mol_cait.png', 'Mol_ella.png', 'Mol_ast_less.png'];

        // State (synced with gameState)
        this.idleDialogueTimer = null;
        this.idleHideTimeout = null;
    }

    areAllWitnessesInterviewed() {
        return witnessData.witnesses && gameState.completedWitnesses.length >= witnessData.witnesses.length;
    }

    isCoffeeLine(index) {
        return this.coffeeLineIndices.includes(index);
    }

    getRandomIdleDialogue() {
        // [Copy logic from game.js]
    }

    showIdleDialogue() {
        // [Copy logic from game.js]
    }

    giveCoffee() {
        // [Copy logic from game.js]
    }

    start() {
        // Start idle dialogue when menu screen is shown
        this.startIdleDialogue();
    }

    startIdleDialogue() {
        // [Copy logic from game.js]
    }

    stop() {
        // Stop idle dialogue when leaving menu screen
        this.stopIdleDialogue();
    }

    stopIdleDialogue() {
        // [Copy logic from game.js]
    }
}

// Create global instance
const menuScreen = new MenuScreen();
```

### Changes to game.js

1. **Delete lines 67-112** (constants - moved to MenuScreen)
2. **Delete lines 328-493** (functions - moved to MenuScreen)
3. **Update `showScreen()` function** to call menuScreen methods:

```javascript
function showScreen(screenId) {
    // Stop idle dialogue when leaving menu
    if (gameState.currentScreen === 'menu-screen' && screenId !== 'menu-screen') {
        menuScreen.stop();  // Changed from stopIdleDialogue()
    }

    // [... existing code ...]

    // Start idle dialogue when entering menu
    if (screenId === 'menu-screen') {
        menuScreen.start();  // Changed from startIdleDialogue()
        updateIdentifySuspectButton();
    }
}
```

4. **Update event listener** (line 802-805):

```javascript
// Give Coffee button
elements.giveCoffeeBtn.addEventListener('click', () => {
    playClickSound();
    menuScreen.giveCoffee();  // Changed from giveCoffee()
});
```

### Changes to index.html

Add script tag BEFORE `game.js`:

```html
<script src="screens/menu-screen.js"></script>
<script src="game.js"></script>
```

### Testing Checklist

- [ ] Menu screen loads properly
- [ ] Idle dialogues appear after 2 seconds
- [ ] New dialogue every 15 seconds
- [ ] Coffee button appears on coffee lines
- [ ] Clicking coffee button triggers reaction
- [ ] Coffee cooldown works (no coffee lines for 2 dialogues)
- [ ] Happy Mol sprite appears after coffee
- [ ] Special sprites appear after all witnesses interviewed
- [ ] Leaving menu screen stops idle dialogue
- [ ] Returning to menu screen restarts idle dialogue

### Expected Reduction

game.js: 1,092 → ~700 lines (392 lines removed)

---

## Task 15: Extract Floating Text Utilities

**Estimated Time:** 1-2 hours
**Risk:** 🟢 Low
**Files to Create:** `utils/floating-text.js`

### What to Extract

From `game.js`, extract the following to `utils/floating-text.js`:

1. **Variable (line 937):**
   - `floatingTextContainer`

2. **Functions (lines 939-1092):**
   - `createFloatingText()`
   - `transformFloatingText()`

### Implementation

Create standalone utilities (NO class needed):

```javascript
// utils/floating-text.js

// Container for floating text (created once)
let floatingTextContainer = null;

/**
 * Creates floating words that pulse in and out around the screen
 * [Copy full JSDoc comment from game.js]
 */
function createFloatingText(words, options = {}) {
    // [Copy entire function from game.js]
}

/**
 * Transforms floating words from negative to positive
 * [Copy full JSDoc comment from game.js]
 */
function transformFloatingText(negativeWords, positiveWords, transitionDelay = 5000) {
    // [Copy entire function from game.js]
}
```

### Changes to game.js

1. **Delete lines 931-1092** (floating text section)

### Changes to index.html

Add script tag BEFORE `screens/identify-screen.js`:

```html
<script src="utils/floating-text.js"></script>
<script src="screens/intro-screen.js"></script>
```

### Testing Checklist

- [ ] Identify screen fear sequence works
- [ ] Floating fear words appear and pulse
- [ ] Depression stages (1-4) apply correctly
- [ ] Dreams sequence floating text works
- [ ] Finale floating text works
- [ ] transformFloatingText transitions from negative to positive

### Expected Reduction

game.js: ~700 → ~550 lines (150 lines removed)

---

## Task 16: Extract Title & End Screen Logic

**Estimated Time:** 1 hour
**Risk:** 🟢 Low
**Files to Create:** `screens/title-screen.js`, `screens/end-screen.js`

### What to Extract

Currently, title and end screens have minimal logic in game.js. We'll formalize them into screen classes for consistency.

### Implementation

**screens/title-screen.js:**
```javascript
class TitleScreen {
    constructor() {
        // Minimal state
    }

    show() {
        showScreen('title-screen');
    }
}

const titleScreen = new TitleScreen();
```

**screens/end-screen.js:**
```javascript
class EndScreen {
    constructor() {
        // Minimal state
    }

    show() {
        audioManager.pauseCurrent();
        elements.persistentLeads.style.display = 'none';
        showScreen('end-screen');
        document.getElementById('end-message').style.display = 'block';
    }

    reset() {
        // Called when playing again
        document.getElementById('end-message').style.display = 'none';
    }
}

const endScreen = new EndScreen();
```

### Changes to game.js

1. **Update intro screen** to use titleScreen:

In intro screen's dialogue processing, change:
```javascript
showScreen('title-screen');
```
to:
```javascript
titleScreen.show();
```

2. **Update exit button** event listener:

```javascript
// Exit button
elements.exitBtn.addEventListener('click', () => {
    playClickSound();
    endScreen.show();
});
```

3. **Update play again** to reset end screen:

```javascript
// Add to play again handler:
endScreen.reset();
```

### Changes to index.html

Add script tags:

```html
<script src="screens/title-screen.js"></script>
<script src="screens/end-screen.js"></script>
<script src="game.js"></script>
```

### Testing Checklist

- [ ] Title screen appears after intro dialogue
- [ ] Title screen "Continue" button goes to menu
- [ ] Exit button shows end screen
- [ ] End screen displays properly
- [ ] "Play Again" resets game correctly

### Expected Reduction

game.js: ~550 → ~500 lines (50 lines cleaned up)

---

## Task 17: Consolidate Constants

**Estimated Time:** 1 hour
**Risk:** 🟢 Low
**Files to Modify:** `constants.js`

### What to Move

After Tasks 14-16, verify all constants are in appropriate places:

### Current Organization

**Should stay in game.js:**
- `gameState` object (initialization state)
- `dialogueSequence`, `leadsSequence`, `evidenceData` (dialogue references)
- `elements` object (DOM references)

**Already in constants.js:**
- `SCREENS` object
- `ACTIONS` object
- `PITCHES` object

**Now in screen files:**
- `MOL_IDLE_DIALOGUES` → MenuScreen
- `MOL_COFFEE_REACTIONS` → MenuScreen
- `COFFEE_LINE_INDICES` → MenuScreen
- `SPECIAL_MOL_SPRITES` → MenuScreen

### Optional: Move Dialogue Constants to constants.js

If you want even more organization, you can move these from MenuScreen to constants.js:

```javascript
// constants.js

const MOL = {
    IDLE_DIALOGUES: [
        // [Array from MenuScreen]
    ],
    COFFEE_REACTIONS: [
        // [Array from MenuScreen]
    ],
    COFFEE_LINE_INDICES: [0, 1, 2, 3, 4, 5, 14],
    SPECIAL_SPRITES: ['Mol_cait.png', 'Mol_ella.png', 'Mol_ast_less.png']
};
```

Then update MenuScreen to use `MOL.IDLE_DIALOGUES` etc.

**Decision:** This is optional. Constants are fine living in MenuScreen class.

### Testing Checklist

- [ ] All constants accessible where needed
- [ ] No undefined reference errors
- [ ] Game works exactly as before

### Expected Reduction

game.js: No change (constants already moved in Task 14)

---

## Task 18: Final Cleanup & Documentation

**Estimated Time:** 30 minutes
**Risk:** 🟢 Low

### Code Cleanup

1. **Remove orphaned comments** in game.js
2. **Add section headers** for clarity
3. **Verify all "NOTE:" comments** are still accurate

### Update game.js Structure

After all extractions, game.js should have this structure:

```javascript
// ============================================
// GAME STATE AND CONFIGURATION
// ============================================
const gameState = { /* ... */ };
const animalese = new AnimaleseEngine();
const audioManager = new AudioManager();
const choiceHandler = new ChoiceHandler(audioManager);

// Dialogue sequences - loaded from dialogues.js
const dialogueSequence = DIALOGUES.intro;
const leadsSequence = DIALOGUES.leads;
const evidenceData = DIALOGUES.physicalEvidence;

// ============================================
// DOM ELEMENTS
// ============================================
const elements = { /* ... */ };

// ============================================
// UTILITY FUNCTIONS
// ============================================
function playClickSound() { /* ... */ }
function showScreen(screenId) { /* ... */ }
function hideInputs(screen) { /* ... */ }
function updateIdentifySuspectButton() { /* ... */ }
function playSfx(soundName) { /* ... */ }
function isTextLoud(text) { /* ... */ }

// ============================================
// TYPEWRITER EFFECT WITH ANIMALESE
// ============================================
async function typeText(...) { /* ... */ }
async function typeSilent(...) { /* ... */ }

// ============================================
// SHARED HELPER FUNCTIONS
// ============================================
function playPapersSound() { /* ... */ }
async function addLeadToList(leadText) { /* ... */ }
function updateManuscriptLead() { /* ... */ }

// ============================================
// EVENT LISTENERS
// ============================================
elements.startBtn.addEventListener('click', () => { /* ... */ });
// [All other event listeners]

// ============================================
// INITIALIZATION
// ============================================
// [Any initialization code if needed]
```

### Update Documentation

Update `REFACTOR_COMPARISON.md` with Phase 3 results:

```markdown
## Phase 3: Final Cleanup (COMPLETE!)

**Files After Phase 3:**
- game.js: ~350 lines (was 1,092, originally 3,299)
- screens/menu-screen.js: ~400 lines
- utils/floating-text.js: ~160 lines
- screens/title-screen.js: ~15 lines
- screens/end-screen.js: ~25 lines

**Total Reduction:** 3,299 → 350 lines in game.js (89% reduction!)
```

### Create Test Summary

Create `PHASE3_TESTING.md`:

```markdown
# Phase 3 Testing Checklist

## Menu Screen Tests
- [ ] Idle dialogues appear
- [ ] Coffee system works
- [ ] Special sprites appear
- [ ] Dialogue timing correct

## Floating Text Tests
- [ ] Fear sequence works
- [ ] Dreams sequence works
- [ ] Finale floating text works

## Screen Navigation Tests
- [ ] Title screen shows after intro
- [ ] End screen shows on exit
- [ ] Play again resets everything

## Full Playthrough Test
- [ ] Complete entire game from start to end
- [ ] All features work as before refactoring
```

### Testing Checklist

- [ ] Run complete game playthrough
- [ ] No console errors
- [ ] All features work
- [ ] Documentation updated

---

## Final File Structure (After Phase 3)

```
christmas-gift/
├── index.html          (432 lines)
├── game.js            (~350 lines) ← 89% reduction! 🎉
├── dialogues.js        (722 lines)
├── styles.css         (1532 lines)
├── constants.js         (85 lines)
├── core/
│   ├── animalese-engine.js     (97 lines)
│   ├── audio-manager.js       (134 lines)
│   ├── choice-handler.js       (57 lines)
│   └── dialogue-helpers.js     (82 lines)
├── screens/
│   ├── menu-screen.js         (~400 lines) ← NEW
│   ├── title-screen.js         (~15 lines) ← NEW
│   ├── end-screen.js           (~25 lines) ← NEW
│   ├── intro-screen.js        (133 lines)
│   ├── leads-screen.js        (288 lines)
│   ├── evidence-screen.js     (399 lines)
│   ├── witness-screen.js      (693 lines)
│   └── identify-screen.js    (1083 lines)
├── utils/
│   └── floating-text.js       (~160 lines) ← NEW
├── images/
└── audio/
```

---

## How to Use This Roadmap

### For a New Claude Session

**Prompt Template:**
```
I'm refactoring a visual novel game. Here's the repo.
Please complete Task [NUMBER] from REFACTOR_ROADMAP_PHASE3.md - remember, no ES6 modules, global scope only.
Show me exactly what has changed, then I'll test it.
Make sure to review after finishing to not miss anything.
```

### Task Sequence

**Recommended Order:**
1. Task 14 (Menu Screen) - Biggest impact
2. Task 15 (Floating Text) - Clean utilities extraction
3. Task 16 (Title/End Screens) - Quick consistency win
4. Task 17 (Constants) - Optional organization
5. Task 18 (Cleanup) - Polish and documentation

**Can be done in parallel:**
- Tasks 15 & 16 can be done together (no dependencies)

### Important Reminders for Claude

1. **NO ES6 modules** - Use global scope only
2. **Test after each task** - Game must work before committing
3. **Follow existing patterns** - Look at other screen files
4. **Preserve gameState sync** - Screens still sync with global gameState
5. **Update index.html** - Add script tags in correct order
6. **Check witness data** - Available globally as `witnessData`

---

## Success Criteria

After Phase 3 completion:

- [ ] game.js is ~350 lines (just initialization & core utilities)
- [ ] All screen logic in dedicated files
- [ ] All utilities properly organized
- [ ] No code duplication
- [ ] Full game playthrough works perfectly
- [ ] Documentation updated
- [ ] No console errors
- [ ] File:// protocol still works

---

## Rollback Plan

If something breaks:

```bash
git checkout HEAD -- [affected-file].js
```

Each task should be committed separately:
```bash
git add .
git commit -m "Task 14: Extract menu screen logic"
```

---

*Phase 3 Roadmap - Created December 28, 2024*
