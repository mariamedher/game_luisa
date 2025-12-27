# Refactoring Roadmap - Phase 2: Screen Modularization
## 🎯 Goal: Make Content Editing Easy

**Prerequisites:** Complete Phase 1 (Tasks 1-6) ✅

**Why Phase 2:** You want to keep tweaking dialogue, adding scenes, and adjusting mechanics. This phase makes those edits **much easier** by organizing code by screen instead of having everything mixed together.

**After Phase 2:**
- Want to edit witness dialogue? → `screens/witness-screen.js` (clear, <400 lines)
- Want to add a choice option? → Unified pattern, one place to change
- Want to extend the game? → Clear structure to follow

---

## ⚠️ IMPORTANT: Safety First!

**Before starting Phase 2:**

1. **Test the current game thoroughly** - Play through completely
2. **Commit everything:**
   ```bash
   git add .
   git commit -m "Phase 1 complete - working version before Phase 2"
   ```
3. **Create safety tag:**
   ```bash
   git tag v1.0-phase1-complete
   git push origin main --tags
   ```
4. **Optional: Create a branch**
   ```bash
   git checkout -b refactor-phase2
   ```

Now you can always go back to this working version!

---

## Phase 2 Overview

**What we'll do:**
- Extract screen logic into separate files
- Create unified choice handler
- Simplify state management
- Make dialogue editing much easier

**Estimated time:** 1-2 weeks (doing 1-2 tasks per day)

**Risk level:** 🟡 Medium - Test thoroughly after each task

---

## Task 7: Create Unified Choice Handler (2-3 hours)
**Risk:** 🟢 Low - New utility, doesn't break existing code
**Files:** Create `core/choice-handler.js`, modify `game.js`

### Why This Task First:
All 5 screens duplicate choice button creation. This is the foundation for screen refactoring.

### Step 7.1: Create core/choice-handler.js

```javascript
// ============================================
// UNIFIED CHOICE HANDLER
// Handles choice button creation and responses
// Global scope - no ES6 modules
// ============================================
class ChoiceHandler {
    constructor(audioManager) {
        this.audioManager = audioManager;
    }

    // Create and show choice buttons
    showChoices(container, choices, responses, options = {}) {
        // Clear existing choices
        container.innerHTML = '';
        container.style.display = 'flex';

        choices.forEach((choiceText, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';

            // Support hover text (for identify screen)
            if (options.hoverTexts && options.hoverTexts[index]) {
                const defaultSpan = document.createElement('span');
                defaultSpan.className = 'btn-text-default';
                defaultSpan.textContent = choiceText;

                const hoverSpan = document.createElement('span');
                hoverSpan.className = 'btn-text-hover';
                hoverSpan.textContent = options.hoverTexts[index];

                btn.appendChild(defaultSpan);
                btn.appendChild(hoverSpan);
                btn.classList.add('btn-hover-change');
            } else {
                btn.textContent = choiceText;
            }

            btn.addEventListener('click', async () => {
                this.audioManager.playSfx('click');
                container.style.display = 'none';

                // Call the callback with the response
                if (options.onChoice) {
                    await options.onChoice(index, responses[index]);
                }
            });

            container.appendChild(btn);
        });
    }

    // Hide choice buttons
    hide(container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}
```

### Step 7.2: Update index.html

Add before game.js:
```html
<script src="core/animalese-engine.js"></script>
<script src="core/audio-manager.js"></script>
<script src="core/choice-handler.js"></script>  <!-- NEW -->
<script src="game.js"></script>
```

### Step 7.3: Update game.js

**After audioManager instantiation (around line 64):**
```javascript
const animalese = new AnimaleseEngine();
const audioManager = new AudioManager();
const choiceHandler = new ChoiceHandler(audioManager);  // NEW
```

### Step 7.4: Refactor one screen to use it (Leads - simplest)

**Find the leads choice handling code (around lines 878-939):**

**OLD:**
```javascript
case 'choice':
    elements.leadsChoices.innerHTML = '';
    elements.leadsChoices.style.display = 'flex';

    item.choices.forEach((choiceText, index) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choiceText;
        btn.addEventListener('click', async () => {
            playClickSound();
            hideInputs('leads-screen');
            // ... response handling ...
        });
        elements.leadsChoices.appendChild(btn);
    });
    break;
```

**NEW:**
```javascript
case 'choice':
    choiceHandler.showChoices(
        elements.leadsChoices,
        item.choices,
        item.responses,
        {
            onChoice: async (index, response) => {
                hideInputs('leads-screen');

                // Handle single or multiple responses
                if (Array.isArray(response)) {
                    for (let i = 0; i < response.length; i++) {
                        await typeText(response[i], false, elements.leadsDialogueText);
                        if (i < response.length - 1) {
                            // Wait for Enter between responses
                            gameState.waitingForInput = true;
                            elements.leadsEnterHint.style.display = 'block';
                            await new Promise(resolve => {
                                const handler = () => {
                                    if (gameState.waitingForInput) {
                                        gameState.waitingForInput = false;
                                        elements.leadsEnterHint.style.display = 'none';
                                        resolve();
                                    }
                                };
                                const keyHandler = (e) => {
                                    if (e.key === 'Enter') {
                                        document.removeEventListener('keydown', keyHandler);
                                        handler();
                                    }
                                };
                                document.addEventListener('keydown', keyHandler);
                                elements.leadsDialogueText.parentElement.addEventListener('click', function onClick() {
                                    elements.leadsDialogueText.parentElement.removeEventListener('click', onClick);
                                    handler();
                                }, { once: true });
                            });
                        }
                    }
                } else {
                    await typeText(response, false, elements.leadsDialogueText);
                }

                // Show continue button if specified
                if (item.buttonText) {
                    elements.leadsContinueBtn.textContent = item.buttonText[index] || 'Continue';
                    elements.leadsContinueBtn.style.display = 'block';
                    elements.leadsContinueBtn.onclick = () => {
                        audioManager.playSfx('click');
                        gameState.leadsIndex++;
                        processLeads();
                    };
                } else {
                    gameState.waitingForInput = true;
                    elements.leadsEnterHint.style.display = 'block';
                }
            }
        }
    );
    break;
```

### Testing Task 7:
- [ ] Leads screen choices still work
- [ ] Click sound plays
- [ ] Single responses work
- [ ] Multiple responses work (wait for Enter between)
- [ ] Button text updates correctly

---

## Task 8: Extract Common Dialogue Functions (1-2 hours)
**Risk:** 🟢 Low - Creates helpers, doesn't change existing code yet
**Files:** Create `core/dialogue-helpers.js`

### Why This Task:
All screens repeat the same "type text, wait for input, advance" pattern. Let's create helpers.

### Step 8.1: Create core/dialogue-helpers.js

```javascript
// ============================================
// DIALOGUE HELPERS
// Common patterns used across all screens
// Global scope - no ES6 modules
// ============================================

// Wait for user input (Enter key or click)
function waitForInput(config) {
    return new Promise(resolve => {
        const {
            screen,
            enterHintElement,
            dialogueBoxElement,
            onComplete
        } = config;

        gameState.waitingForInput = true;
        if (enterHintElement) {
            enterHintElement.style.display = 'block';
        }

        const cleanup = () => {
            gameState.waitingForInput = false;
            if (enterHintElement) {
                enterHintElement.style.display = 'none';
            }
            if (onComplete) onComplete();
            resolve();
        };

        // The unified input handler will call the advance function
        // which should check waitingForInput and call cleanup
        // For now, we'll resolve when waitingForInput changes to false
        const checkInterval = setInterval(() => {
            if (!gameState.waitingForInput) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 50);
    });
}

// Apply visual effects (shake, flash, etc.)
function applyEffects(effectName, targetElement) {
    switch (effectName) {
        case 'shake_flash':
            document.body.classList.add('flash');
            if (targetElement) {
                targetElement.classList.add('shake');
            }
            setTimeout(() => {
                document.body.classList.remove('flash');
                if (targetElement) {
                    targetElement.classList.remove('shake');
                }
            }, 500);
            break;

        case 'shake':
            if (targetElement) {
                targetElement.classList.add('shake');
                setTimeout(() => targetElement.classList.remove('shake'), 500);
            }
            break;

        case 'flash':
            document.body.classList.add('flash');
            setTimeout(() => document.body.classList.remove('flash'), 300);
            break;
    }
}

// Show continue button with custom text and callback
function showContinueButton(buttonElement, text, onClick) {
    buttonElement.textContent = text || 'Continue';
    buttonElement.style.display = 'block';
    buttonElement.onclick = () => {
        audioManager.playSfx('click');
        buttonElement.style.display = 'none';
        onClick();
    };
}
```

### Step 8.2: Update index.html

```html
<script src="core/choice-handler.js"></script>
<script src="core/dialogue-helpers.js"></script>  <!-- NEW -->
<script src="game.js"></script>
```

### Step 8.3: Use in one screen (optional - test it works)

You don't need to refactor all screens yet - just verify it loads without errors.

### Testing Task 8:
- [ ] Game loads without errors
- [ ] No console errors about undefined functions

---

## Task 9: Extract Intro Screen (2-3 hours)
**Risk:** 🟡 Medium - First screen extraction
**Files:** Create `screens/intro-screen.js`, modify `game.js`

### Why Start with Intro:
It's the simplest screen - no complex state, just linear dialogue.

### Step 9.1: Create screens/intro-screen.js

```javascript
// ============================================
// INTRO SCREEN
// Initial dialogue sequence and name input
// Global scope - no ES6 modules
// ============================================

class IntroScreen {
    constructor() {
        this.state = {
            dialogueIndex: 0,
            isTyping: false,
            waitingForInput: false
        };

        this.elements = {
            screen: document.getElementById('dialogue-screen'),
            dialogueText: document.getElementById('dialogue-text'),
            dialogueBox: document.getElementById('dialogue-box'),
            enterHint: document.getElementById('enter-hint'),
            nameInputContainer: document.getElementById('name-input-container'),
            nameInput: document.getElementById('name-input'),
            submitNameBtn: document.getElementById('submit-name-btn'),
            confirmationContainer: document.getElementById('confirmation-container'),
            confirmText: document.getElementById('confirm-text'),
            yesBtn: document.getElementById('yes-btn'),
            noBtn: document.getElementById('no-btn'),
            actionContainer: document.getElementById('action-container'),
            actionBtn: document.getElementById('action-btn')
        };

        this.dialogue = DIALOGUES.intro;
    }

    async start() {
        this.state.dialogueIndex = 0;
        gameState.currentScreen = 'dialogue-screen';
        await this.processDialogue();
    }

    async processDialogue() {
        if (this.state.dialogueIndex >= this.dialogue.length) {
            // End of intro - show title screen
            showScreen('title-screen');
            return;
        }

        const dialogue = this.dialogue[this.state.dialogueIndex];
        hideInputs('dialogue-screen');
        this.state.waitingForInput = false;

        // Apply effects
        if (dialogue.effect) {
            applyEffects(dialogue.effect, this.elements.dialogueBox);
        }

        // Type the text
        await typeText(dialogue.text, dialogue.loud, this.elements.dialogueText);

        // Handle action
        switch (dialogue.action) {
            case 'wait':
                this.state.waitingForInput = true;
                gameState.waitingForInput = true;
                this.elements.enterHint.style.display = 'block';
                break;

            case 'name_input':
                this.elements.nameInputContainer.style.display = 'flex';
                this.elements.nameInput.value = '';
                this.elements.nameInput.focus();
                break;

            case 'continue_button':
                this.elements.actionContainer.style.display = 'block';
                this.elements.actionBtn.textContent = dialogue.buttonText || 'Continue';
                break;
        }
    }

    advance() {
        if (this.state.waitingForInput && !gameState.isTyping) {
            this.state.waitingForInput = false;
            gameState.waitingForInput = false;
            this.state.dialogueIndex++;
            this.processDialogue();
        }
    }

    async handleNameConfirmation() {
        hideInputs('dialogue-screen');
        await typeText(`Is your name ${gameState.playerName}?`, false, this.elements.dialogueText);
        this.elements.confirmationContainer.style.display = 'flex';
    }
}

// Create global instance
const introScreen = new IntroScreen();
```

### Step 9.2: Update index.html

```html
<script src="core/dialogue-helpers.js"></script>
<script src="screens/intro-screen.js"></script>  <!-- NEW -->
<script src="game.js"></script>
```

### Step 9.3: Update game.js

**Find the old processDialogue() function and replace its usage:**

**In the unified keyboard handler (around line 3291):**
```javascript
'dialogue-screen': () => introScreen.advance(),  // Use introScreen instead
```

**Find where intro starts (initialization section) and replace:**
```javascript
// OLD: processDialogue();
// NEW:
introScreen.start();
```

**You can delete (or comment out) the old:**
- `processDialogue()` function
- `advanceDialogue()` function
- `handleNameConfirmation()` function

But keep them commented for now in case you need to reference them.

### Testing Task 9:
- [ ] Game starts normally
- [ ] Intro dialogue plays
- [ ] Name input works
- [ ] Name confirmation works
- [ ] ESC skip still works
- [ ] Transitions to title screen

---

## Task 10-13: Extract Remaining Screens

After Task 9 works, you'll follow the same pattern for:

- **Task 10:** Extract Leads Screen (3-4 hours)
- **Task 11:** Extract Evidence Screen (3-4 hours)
- **Task 12:** Extract Witness Screen (4-5 hours - most complex)
- **Task 13:** Extract Identify Screen (4-5 hours - most complex)

Each task follows this pattern:
1. Create `screens/[name]-screen.js`
2. Move screen logic into class
3. Update game.js to use the class
4. Test thoroughly
5. Commit

I'll provide detailed instructions for each when you're ready for them.

---

## After Phase 2 Complete

### Your New File Structure:
```
christmas-gift/
├── index.html
├── game.js               (~1500 lines - just initialization and global state)
├── dialogues.js
├── styles.css
├── constants.js
├── core/
│   ├── animalese-engine.js
│   ├── audio-manager.js
│   ├── choice-handler.js     (NEW)
│   └── dialogue-helpers.js   (NEW)
├── screens/
│   ├── intro-screen.js       (NEW ~150 lines)
│   ├── leads-screen.js       (NEW ~300 lines)
│   ├── evidence-screen.js    (NEW ~350 lines)
│   ├── witness-screen.js     (NEW ~450 lines)
│   └── identify-screen.js    (NEW ~600 lines)
├── images/
└── audio/
```

### Benefits for Content Editing:

**Want to add dialogue to witness scene?**
- Before: Search through 3412 lines of game.js
- After: Open `screens/witness-screen.js` (450 lines, clear structure)

**Want to add a new choice option?**
- Before: Copy-paste from one of 5 different implementations
- After: Use `choiceHandler.showChoices()` (one pattern everywhere)

**Want to add a new evidence item?**
- Before: Navigate mixed logic
- After: Clear pattern in `screens/evidence-screen.js`

---

## Commit Strategy

After **each** task:
```bash
git add .
git commit -m "Task [N]: [description]"
```

Example:
```bash
git commit -m "Task 7: Create unified choice handler"
git commit -m "Task 8: Add dialogue helper utilities"
git commit -m "Task 9: Extract intro screen to separate file"
```

---

## If Something Breaks

Don't panic! You have safety tags:

```bash
# Go back to working Phase 1 version
git checkout v1.0-phase1-complete

# Or if on a branch, start over
git checkout main
git branch -D refactor-phase2
git checkout -b refactor-phase2
```

---

## Ready to Start?

**Recommended approach:**
1. Do Task 7 today (choice handler)
2. Do Task 8 tomorrow (dialogue helpers)
3. Do Task 9 the next day (intro screen)
4. Test thoroughly
5. Come back for Tasks 10-13 instructions

**Important:** Test after EVERY task. Don't move forward if something's broken.

Let me know when you're ready to start Task 7, or if you have any questions! 🚀
