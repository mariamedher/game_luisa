# Refactoring Roadmap - Phase 2: Tasks 10-13 (Detailed Instructions)

**Prerequisites:** Tasks 7-9 complete ✅

This document provides detailed step-by-step instructions for extracting the remaining screens (Leads, Evidence, Witness, Identify). Each follows the same pattern as Task 9 (IntroScreen).

---

## Task 10: Extract Leads Screen (3-4 hours)
**Risk:** 🟡 Medium - Second screen extraction, already using choiceHandler
**Files:** Create `screens/leads-screen.js`, modify `game.js`, update `index.html`

### Overview: What You're Extracting

The leads screen handles:
- Linear dialogue sequence with 8 different action types
- Lead collection and display
- Special animations (hair chaos, colored text)
- Kola overlay image show/hide
- Choice handling (already using choiceHandler from Task 7)
- Multiple types of continuation patterns

**Functions to extract:**
- `processLeads()` (lines ~711-863)
- `advanceLeads()` (lines ~865-874)
- `addLeadToList()` (lines ~672-679)
- `showHairChaos()` (lines ~681-709)
- `startLeads()` (lines ~876-891)

---

### Step 10.1: Create screens/leads-screen.js

```javascript
// ============================================
// LEADS SCREEN
// Evidence leads collection and review
// Global scope - no ES6 modules
// ============================================

class LeadsScreen {
    constructor() {
        this.state = {
            leadsIndex: 0,
            leadsComplete: false,
            collectedLeads: [],
            waitingForInput: false
        };

        this.elements = {
            screen: document.getElementById('leads-screen'),
            dialogueText: document.getElementById('leads-dialogue-text'),
            dialogueBox: document.getElementById('leads-dialogue-box'),
            enterHint: document.getElementById('leads-enter-hint'),
            choices: document.getElementById('leads-choices'),
            continueBtn: document.getElementById('leads-continue-btn'),
            backToMenuBtn: document.getElementById('back-to-menu-btn'),
            overlayImage: document.getElementById('overlay-image'),
            persistentLeads: document.getElementById('persistent-leads'),
            leadsList: document.getElementById('leads-list')
        };

        this.sequence = DIALOGUES.leads;
    }

    async start() {
        // If already completed, show completion message
        if (this.state.leadsComplete) {
            gameState.currentScreen = 'leads-screen';
            await typeText("You've already reviewed all the evidence. Time to investigate!", false, this.elements.dialogueText);
            this.elements.continueBtn.style.display = 'block';
            this.elements.continueBtn.textContent = 'Back to Menu';
            this.elements.continueBtn.onclick = () => {
                audioManager.playSfx('click');
                showScreen('menu-screen');
            };
            return;
        }

        // Fresh start
        this.state.leadsIndex = 0;
        this.state.collectedLeads = [];
        gameState.currentScreen = 'leads-screen';
        this.elements.persistentLeads.style.display = 'block';
        await this.processLeads();
    }

    async processLeads() {
        if (this.state.leadsIndex >= this.sequence.length) {
            return; // Safety check
        }

        const item = this.sequence[this.state.leadsIndex];
        hideInputs('leads-screen');
        this.state.waitingForInput = false;
        gameState.waitingForInput = false;

        // Apply visual effects
        if (item.effect) {
            applyEffects(item.effect, this.elements.dialogueBox);
        }

        // Handle different action types
        switch (item.action) {
            case 'wait':
                await typeText(item.text, item.loud, this.elements.dialogueText);
                this.state.waitingForInput = true;
                gameState.waitingForInput = true;
                this.elements.enterHint.style.display = 'block';
                break;

            case 'add_lead':
                await this.addLeadToList(item.lead);
                this.state.leadsIndex++;
                this.processLeads();
                break;

            case 'hair_chaos':
                await this.showHairChaos();
                this.state.waitingForInput = true;
                gameState.waitingForInput = true;
                this.elements.enterHint.style.display = 'block';
                break;

            case 'colored_text':
                await this.showColoredText(item);
                this.state.waitingForInput = true;
                gameState.waitingForInput = true;
                this.elements.enterHint.style.display = 'block';
                break;

            case 'show_kola':
                audioManager.playSfx('papers');
                this.elements.overlayImage.src = 'images/Kola.png';
                this.elements.overlayImage.style.display = 'block';
                this.state.leadsIndex++;
                this.processLeads();
                break;

            case 'hide_kola':
                audioManager.playSfx('papers');
                this.elements.overlayImage.style.display = 'none';
                this.state.leadsIndex++;
                this.processLeads();
                break;

            case 'choice':
                choiceHandler.showChoices(
                    this.elements.choices,
                    item.choices,
                    item.responses,
                    {
                        onChoice: async (index, response) => {
                            hideInputs('leads-screen');

                            // Handle single or multiple responses
                            if (Array.isArray(response)) {
                                for (let i = 0; i < response.length; i++) {
                                    await typeText(response[i], false, this.elements.dialogueText);
                                    if (i < response.length - 1) {
                                        // Wait for Enter between responses
                                        gameState.waitingForInput = true;
                                        this.elements.enterHint.style.display = 'block';
                                        await new Promise(resolve => {
                                            const handler = () => {
                                                if (gameState.waitingForInput) {
                                                    gameState.waitingForInput = false;
                                                    this.elements.enterHint.style.display = 'none';
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
                                            this.elements.dialogueBox.parentElement.addEventListener('click', function onClick() {
                                                this.elements.dialogueBox.parentElement.removeEventListener('click', onClick);
                                                handler();
                                            }.bind(this), { once: true });
                                        });
                                    }
                                }
                            } else {
                                await typeText(response, false, this.elements.dialogueText);
                            }

                            // Show continue button if specified
                            if (item.buttonText) {
                                this.elements.continueBtn.textContent = item.buttonText[index] || 'Continue';
                                this.elements.continueBtn.style.display = 'block';
                                this.elements.continueBtn.onclick = () => {
                                    audioManager.playSfx('click');
                                    this.state.leadsIndex++;
                                    this.processLeads();
                                };
                            } else {
                                this.state.waitingForInput = true;
                                gameState.waitingForInput = true;
                                this.elements.enterHint.style.display = 'block';
                            }
                        }
                    }
                );
                break;

            case 'end_leads':
                await typeText(item.text, item.loud, this.elements.dialogueText);
                this.state.leadsComplete = true;
                gameState.leadsComplete = true;
                this.elements.continueBtn.style.display = 'block';
                this.elements.continueBtn.textContent = 'Back to Menu';
                this.elements.continueBtn.onclick = () => {
                    audioManager.playSfx('click');
                    showScreen('menu-screen');
                };
                break;
        }
    }

    advance(playSound = true) {
        if (this.state.waitingForInput && !gameState.isTyping) {
            if (playSound) audioManager.playSfx('click');
            this.state.waitingForInput = false;
            gameState.waitingForInput = false;
            this.state.leadsIndex++;
            this.processLeads();
        }
    }

    async addLeadToList(leadText) {
        const li = document.createElement('li');
        this.elements.leadsList.appendChild(li);
        await typeSilent(leadText, li);
        if (!this.state.collectedLeads.includes(leadText)) {
            this.state.collectedLeads.push(leadText);
        }
        // Sync with gameState for now (can remove later)
        gameState.collectedLeads = this.state.collectedLeads;
    }

    async showHairChaos() {
        const colors = [
            { text: "Pink", class: "hair-pink", strike: true },
            { text: "Blue", class: "hair-blue", strike: false },
            { text: "Blonde", class: "hair-blonde", strike: false },
            { text: "brown", class: "hair-brown", strike: true },
            { text: "Red??", class: "hair-red", strike: false }
        ];

        this.elements.dialogueText.innerHTML = '';

        for (const color of colors) {
            const span = document.createElement('span');
            span.className = color.class;
            span.textContent = color.text;
            this.elements.dialogueText.appendChild(span);

            if (color.strike) {
                await new Promise(resolve => setTimeout(resolve, 400));
                span.style.textDecoration = 'line-through';
            }

            const space = document.createTextNode(' ');
            this.elements.dialogueText.appendChild(space);
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    async showColoredText(item) {
        const colorClass = `hair-${item.color}`;
        const span = document.createElement('span');
        span.className = colorClass;
        this.elements.dialogueText.innerHTML = '';
        this.elements.dialogueText.appendChild(span);

        for (const char of item.text) {
            span.textContent += char;
            animalese.playLetter(char, false);
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        if (item.strikethrough) {
            await new Promise(resolve => setTimeout(resolve, 300));
            span.style.textDecoration = 'line-through';
        }
    }

    reset() {
        this.state.leadsIndex = 0;
        this.state.leadsComplete = false;
        this.state.collectedLeads = [];
        this.state.waitingForInput = false;
        this.elements.leadsList.innerHTML = '';
        this.elements.persistentLeads.style.display = 'none';

        // Sync with gameState
        gameState.leadsIndex = 0;
        gameState.leadsComplete = false;
        gameState.collectedLeads = [];
    }
}

// Create global instance
const leadsScreen = new LeadsScreen();
```

---

### Step 10.2: Update index.html

Add the script tag after intro-screen.js:

```html
<!-- Intro Screen -->
<script src="screens/intro-screen.js"></script>
<!-- Leads Screen -->
<script src="screens/leads-screen.js"></script>
<!-- Game Logic -->
<script src="game.js"></script>
```

---

### Step 10.3: Update game.js

**1. Comment out old functions** (lines ~672-891):

Find and comment out:
- `playPapersSound()` - Keep this one, it's used elsewhere too
- `addLeadToList()`
- `showHairChaos()`
- `processLeads()`
- `advanceLeads()`
- `startLeads()`

Add a note:
```javascript
// ============================================
// LEADS HANDLING
// ============================================
// NOTE: These functions have been moved to screens/leads-screen.js
// Kept here for reference during refactoring
/*
async function addLeadToList(leadText) { ... }
async function showHairChaos() { ... }
async function processLeads() { ... }
function advanceLeads(playSound = true) { ... }
function startLeads() { ... }
*/
```

**2. Update event handlers:**

Find the leads button click handler (around line 2925):
```javascript
// OLD:
elements.leadsBtn.addEventListener('click', () => {
    startLeads();
});

// NEW:
elements.leadsBtn.addEventListener('click', () => {
    leadsScreen.start();
});
```

**3. Update unified keyboard handler** (around line 3193):

```javascript
// OLD:
'leads-screen': () => advanceLeads(false),

// NEW:
'leads-screen': () => leadsScreen.advance(false),
```

**4. Update click handler** (around line 2938):

```javascript
// OLD:
'leads-screen': { element: document.getElementById('leads-dialogue-box'), advance: advanceLeads },

// NEW:
'leads-screen': { element: document.getElementById('leads-dialogue-box'), advance: () => leadsScreen.advance() },
```

**5. Update reset function** (around line 3078-3080):

```javascript
// OLD:
gameState.leadsIndex = 0;
gameState.leadsComplete = false;
gameState.collectedLeads = [];

// NEW:
leadsScreen.reset();
```

---

### Testing Task 10:

- [ ] Leads screen starts correctly from menu
- [ ] Dialogue types correctly
- [ ] Leads add to list properly
- [ ] Hair chaos animation works
- [ ] Colored text displays correctly
- [ ] Kola image shows/hides correctly
- [ ] Choices work (already using choiceHandler)
- [ ] Multiple responses work with Enter pauses
- [ ] End leads shows "Back to Menu"
- [ ] Already-completed check works
- [ ] Reset clears all state

**Commit:**
```bash
git add .
git commit -m "Task 10: Extract leads screen to separate file"
```

---

## Task 11: Extract Evidence Screen (3-4 hours)
**Risk:** 🟡 Medium - More complex state management
**Files:** Create `screens/evidence-screen.js`, modify `game.js`, update `index.html`

### Overview: What You're Extracting

The evidence screen is more complex than leads:
- Evidence item selection from list
- Sub-modes: viewing lead, examining details, making notes
- Evidence reveal animations (flash)
- State tracking for viewed evidence
- Multiple back navigation paths

**Functions to extract:**
- `startEvidence()` (initialize evidence screen)
- `processEvidenceIntro()` (intro dialogue)
- `advanceEvidenceIntro()` (intro progression)
- `showEvidenceList()` (display evidence items)
- `selectEvidence()` (handle evidence selection)
- `processEvidenceDialogue()` (show evidence details)
- `advanceEvidenceDialogue()` (progress through evidence)
- `returnToEvidenceList()` (back navigation)

### Step 11.1: Create screens/evidence-screen.js

```javascript
// ============================================
// EVIDENCE SCREEN
// Evidence examination and note-taking
// Global scope - no ES6 modules
// ============================================

class EvidenceScreen {
    constructor() {
        this.state = {
            mode: 'intro', // 'intro', 'list', 'viewing'
            introIndex: 0,
            dialogueIndex: 0,
            currentEvidence: null,
            viewedEvidence: [],
            waitingForInput: false
        };

        this.elements = {
            screen: document.getElementById('evidence-screen'),
            dialogueText: document.getElementById('evidence-dialogue-text'),
            dialogueBox: document.getElementById('evidence-dialogue-box'),
            enterHint: document.getElementById('evidence-enter-hint'),
            evidenceList: document.getElementById('evidence-list'),
            continueBtn: document.getElementById('evidence-continue-btn'),
            backBtn: document.getElementById('evidence-back-btn'),
            backToMenuFromEvidence: document.getElementById('back-to-menu-from-evidence')
        };

        this.introSequence = DIALOGUES.evidenceIntro;
        this.evidenceItems = DIALOGUES.evidenceItems;
    }

    async start() {
        this.state.mode = 'intro';
        this.state.introIndex = 0;
        gameState.currentScreen = 'evidence-screen';
        gameState.evidenceMode = 'intro';
        await this.processIntro();
    }

    async processIntro() {
        if (this.state.introIndex >= this.introSequence.length) {
            this.showEvidenceList();
            return;
        }

        const item = this.introSequence[this.state.introIndex];
        hideInputs('evidence-screen');
        this.state.waitingForInput = false;
        gameState.waitingForInput = false;

        if (item.effect) {
            applyEffects(item.effect, this.elements.dialogueBox);
        }

        await typeText(item.text, item.loud, this.elements.dialogueText);

        if (item.action === 'wait') {
            this.state.waitingForInput = true;
            gameState.waitingForInput = true;
            this.elements.enterHint.style.display = 'block';
        } else if (item.action === 'end_intro') {
            this.showEvidenceList();
        }
    }

    advanceIntro(playSound = true) {
        if (this.state.mode === 'intro' && this.state.waitingForInput && !gameState.isTyping) {
            if (playSound) audioManager.playSfx('click');
            this.state.waitingForInput = false;
            gameState.waitingForInput = false;
            this.state.introIndex++;
            this.processIntro();
        }
    }

    showEvidenceList() {
        this.state.mode = 'list';
        gameState.evidenceMode = 'list';
        hideInputs('evidence-screen');
        this.elements.evidenceList.innerHTML = '';
        this.elements.evidenceList.style.display = 'block';
        this.elements.backToMenuFromEvidence.style.display = 'block';

        this.evidenceItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = item.name;
            li.className = 'evidence-item';

            // Visual indicator if already viewed
            if (this.state.viewedEvidence.includes(index)) {
                li.classList.add('viewed');
            }

            li.addEventListener('click', () => {
                audioManager.playSfx('click');
                this.selectEvidence(index);
            });

            this.elements.evidenceList.appendChild(li);
        });
    }

    async selectEvidence(index) {
        this.state.currentEvidence = index;
        this.state.mode = 'viewing';
        this.state.dialogueIndex = 0;
        gameState.evidenceMode = 'viewing';
        gameState.currentEvidence = index;

        // Mark as viewed
        if (!this.state.viewedEvidence.includes(index)) {
            this.state.viewedEvidence.push(index);
            gameState.viewedEvidence = this.state.viewedEvidence;
        }

        hideInputs('evidence-screen');
        this.elements.evidenceList.style.display = 'none';
        this.elements.backToMenuFromEvidence.style.display = 'none';

        // Flash effect when revealing evidence
        document.body.classList.add('flash');
        setTimeout(() => document.body.classList.remove('flash'), 300);

        await this.processDialogue();
    }

    async processDialogue() {
        const evidence = this.evidenceItems[this.state.currentEvidence];
        const sequence = evidence.dialogue;

        if (this.state.dialogueIndex >= sequence.length) {
            this.returnToList();
            return;
        }

        const item = sequence[this.state.dialogueIndex];
        hideInputs('evidence-screen');
        this.state.waitingForInput = false;
        gameState.waitingForInput = false;

        if (item.effect) {
            applyEffects(item.effect, this.elements.dialogueBox);
        }

        await typeText(item.text, item.loud, this.elements.dialogueText);

        switch (item.action) {
            case 'wait':
                this.state.waitingForInput = true;
                gameState.waitingForInput = true;
                this.elements.enterHint.style.display = 'block';
                break;

            case 'show_back':
                this.elements.backBtn.style.display = 'block';
                this.elements.backBtn.textContent = item.buttonText || 'Back to Evidence';
                this.elements.backBtn.onclick = () => {
                    audioManager.playSfx('click');
                    this.returnToList();
                };
                break;
        }
    }

    advanceDialogue(playSound = true) {
        if (this.state.mode === 'viewing' && this.state.waitingForInput && !gameState.isTyping) {
            if (playSound) audioManager.playSfx('click');
            this.state.waitingForInput = false;
            gameState.waitingForInput = false;
            this.state.dialogueIndex++;
            this.processDialogue();
        }
    }

    returnToList() {
        this.state.mode = 'list';
        this.state.currentEvidence = null;
        this.state.dialogueIndex = 0;
        gameState.evidenceMode = 'list';
        hideInputs('evidence-screen');
        this.showEvidenceList();
    }

    advance(playSound = true) {
        if (this.state.mode === 'intro') {
            this.advanceIntro(playSound);
        } else if (this.state.mode === 'viewing') {
            this.advanceDialogue(playSound);
        }
    }

    reset() {
        this.state.mode = 'intro';
        this.state.introIndex = 0;
        this.state.dialogueIndex = 0;
        this.state.currentEvidence = null;
        this.state.viewedEvidence = [];
        this.state.waitingForInput = false;

        // Sync with gameState
        gameState.evidenceMode = 'intro';
        gameState.currentEvidence = null;
        gameState.viewedEvidence = [];
    }
}

// Create global instance
const evidenceScreen = new EvidenceScreen();
```

---

### Step 11.2: Update index.html

```html
<!-- Leads Screen -->
<script src="screens/leads-screen.js"></script>
<!-- Evidence Screen -->
<script src="screens/evidence-screen.js"></script>
<!-- Game Logic -->
<script src="game.js"></script>
```

---

### Step 11.3: Update game.js

**1. Comment out old evidence functions**

**2. Update menu button handler:**
```javascript
elements.evidenceBtn.addEventListener('click', () => {
    evidenceScreen.start();
});
```

**3. Update unified keyboard handler** (around line 3194):
```javascript
'evidence-screen': () => {
    evidenceScreen.advance(false);
},
```

**4. Update click handler:**
```javascript
'evidence-screen': {
    element: document.getElementById('evidence-dialogue-box'),
    advance: () => evidenceScreen.advance()
},
```

**5. Update back to menu button:**
```javascript
elements.backToMenuFromEvidence.addEventListener('click', () => {
    audioManager.playSfx('click');
    showScreen('menu-screen');
});
```

**6. Update reset:**
```javascript
evidenceScreen.reset();
```

---

### Testing Task 11:

- [ ] Evidence screen intro plays
- [ ] Evidence list displays
- [ ] Can select evidence items
- [ ] Evidence details show correctly
- [ ] Flash effect works
- [ ] Back button returns to list
- [ ] Viewed evidence marked
- [ ] Multiple evidence items work
- [ ] Back to menu works
- [ ] Reset clears state

**Commit:**
```bash
git add .
git commit -m "Task 11: Extract evidence screen to separate file"
```

---

## Task 12: Extract Witness Screen (4-5 hours) - MOST COMPLEX
**Risk:** 🟡 Medium-High - Complex state, music switching, multiple sub-modes
**Files:** Create `screens/witness-screen.js`, modify `game.js`, update `index.html`

### Overview: What You're Extracting

The witness screen is the most complex:
- Witness selection from list
- Per-witness intro sequences
- Interview dialogue with choices
- Music switching per witness
- State tracking for completed witnesses
- Multiple navigation paths

**Key complexity:**
- Each witness has: intro sequence, interview sequence
- Music changes per witness (Astarion, Cait, Raphael, Glorp)
- State: witnessMode ('intro', 'list', 'interviewing'), currentWitness, completedWitnesses
- Choice handling using choiceHandler

### Step 12.1: Create screens/witness-screen.js

```javascript
// ============================================
// WITNESS SCREEN
// Witness interviews and interrogations
// Global scope - no ES6 modules
// ============================================

class WitnessScreen {
    constructor() {
        this.state = {
            mode: 'intro', // 'intro', 'list', 'interviewing'
            introIndex: 0,
            interviewIndex: 0,
            currentWitness: null,
            completedWitnesses: [],
            waitingForInput: false
        };

        this.elements = {
            screen: document.getElementById('witness-screen'),
            dialogueText: document.getElementById('witness-dialogue-text'),
            dialogueBox: document.getElementById('witness-dialogue-box'),
            enterHint: document.getElementById('witness-enter-hint'),
            witnessList: document.getElementById('witness-list'),
            choices: document.getElementById('witness-choices'),
            continueBtn: document.getElementById('witness-continue-btn'),
            backBtn: document.getElementById('witness-back-btn'),
            backToMenuFromWitness: document.getElementById('back-to-menu-from-witness')
        };

        this.introSequence = DIALOGUES.witnessIntro;
        this.witnesses = DIALOGUES.witnesses;

        // Witness music mapping
        this.witnessMusic = {
            0: 'astarion',    // Astarion
            1: 'cait',        // Cait
            2: 'raphael',     // Raphael
            3: 'glorp'        // Glorp
        };
    }

    async start() {
        this.state.mode = 'intro';
        this.state.introIndex = 0;
        gameState.currentScreen = 'witness-screen';
        gameState.witnessMode = 'intro';

        // Start witness theme music
        audioManager.fadeToTrack('witness', 1500);

        await this.processIntro();
    }

    async processIntro() {
        if (this.state.introIndex >= this.introSequence.length) {
            this.showWitnessList();
            return;
        }

        const item = this.introSequence[this.state.introIndex];
        hideInputs('witness-screen');
        this.state.waitingForInput = false;
        gameState.waitingForInput = false;

        if (item.effect) {
            applyEffects(item.effect, this.elements.dialogueBox);
        }

        await typeText(item.text, item.loud, this.elements.dialogueText);

        if (item.action === 'wait') {
            this.state.waitingForInput = true;
            gameState.waitingForInput = true;
            this.elements.enterHint.style.display = 'block';
        } else if (item.action === 'end_intro') {
            this.showWitnessList();
        }
    }

    advanceIntro(playSound = true) {
        if (this.state.mode === 'intro' && this.state.waitingForInput && !gameState.isTyping) {
            if (playSound) audioManager.playSfx('click');
            this.state.waitingForInput = false;
            gameState.waitingForInput = false;
            this.state.introIndex++;
            this.processIntro();
        }
    }

    showWitnessList() {
        this.state.mode = 'list';
        gameState.witnessMode = 'list';
        hideInputs('witness-screen');

        this.elements.witnessList.innerHTML = '';
        this.elements.witnessList.style.display = 'flex';
        this.elements.backToMenuFromWitness.style.display = 'block';

        this.witnesses.forEach((witness, index) => {
            const btn = document.createElement('button');
            btn.className = 'witness-btn';
            btn.textContent = witness.name;

            // Disable if already completed
            if (this.state.completedWitnesses.includes(index)) {
                btn.disabled = true;
                btn.classList.add('completed');
            }

            btn.addEventListener('click', () => {
                audioManager.playSfx('click');
                this.selectWitness(index);
            });

            this.elements.witnessList.appendChild(btn);
        });
    }

    async selectWitness(index) {
        this.state.currentWitness = index;
        this.state.mode = 'interviewing';
        this.state.interviewIndex = 0;
        gameState.witnessMode = 'interviewing';
        gameState.currentWitness = index;

        hideInputs('witness-screen');
        this.elements.witnessList.style.display = 'none';
        this.elements.backToMenuFromWitness.style.display = 'none';

        // Switch to witness-specific music
        const musicTrack = this.witnessMusic[index];
        if (musicTrack) {
            audioManager.fadeToTrack(musicTrack, 1000);
        }

        await this.processInterview();
    }

    async processInterview() {
        const witness = this.witnesses[this.state.currentWitness];
        const sequence = witness.dialogue;

        if (this.state.interviewIndex >= sequence.length) {
            this.completeWitness();
            return;
        }

        const item = sequence[this.state.interviewIndex];
        hideInputs('witness-screen');
        this.state.waitingForInput = false;
        gameState.waitingForInput = false;

        if (item.effect) {
            applyEffects(item.effect, this.elements.dialogueBox);
        }

        await typeText(item.text, item.loud, this.elements.dialogueText);

        switch (item.action) {
            case 'wait':
                this.state.waitingForInput = true;
                gameState.waitingForInput = true;
                this.elements.enterHint.style.display = 'block';
                break;

            case 'choice':
                choiceHandler.showChoices(
                    this.elements.choices,
                    item.choices,
                    item.responses,
                    {
                        onChoice: async (index, response) => {
                            hideInputs('witness-screen');
                            await typeText(response, false, this.elements.dialogueText);
                            this.state.waitingForInput = true;
                            gameState.waitingForInput = true;
                            this.elements.enterHint.style.display = 'block';
                        }
                    }
                );
                break;

            case 'end_interview':
                this.completeWitness();
                break;
        }
    }

    advanceInterview(playSound = true) {
        if (this.state.mode === 'interviewing' && this.state.waitingForInput && !gameState.isTyping) {
            if (playSound) audioManager.playSfx('click');
            this.state.waitingForInput = false;
            gameState.waitingForInput = false;
            this.state.interviewIndex++;
            this.processInterview();
        }
    }

    completeWitness() {
        if (!this.state.completedWitnesses.includes(this.state.currentWitness)) {
            this.state.completedWitnesses.push(this.state.currentWitness);
            gameState.completedWitnesses = this.state.completedWitnesses;
        }

        // Return to witness music
        audioManager.fadeToTrack('witness', 1000);

        this.returnToList();
    }

    returnToList() {
        this.state.mode = 'list';
        this.state.currentWitness = null;
        this.state.interviewIndex = 0;
        gameState.witnessMode = 'list';
        hideInputs('witness-screen');
        this.showWitnessList();
    }

    advance(playSound = true) {
        if (this.state.mode === 'intro') {
            this.advanceIntro(playSound);
        } else if (this.state.mode === 'interviewing') {
            this.advanceInterview(playSound);
        }
    }

    reset() {
        this.state.mode = 'intro';
        this.state.introIndex = 0;
        this.state.interviewIndex = 0;
        this.state.currentWitness = null;
        this.state.completedWitnesses = [];
        this.state.waitingForInput = false;

        // Sync with gameState
        gameState.witnessMode = 'intro';
        gameState.currentWitness = null;
        gameState.completedWitnesses = [];
    }
}

// Create global instance
const witnessScreen = new WitnessScreen();
```

---

### Step 12.2: Update index.html

```html
<!-- Evidence Screen -->
<script src="screens/evidence-screen.js"></script>
<!-- Witness Screen -->
<script src="screens/witness-screen.js"></script>
<!-- Game Logic -->
<script src="game.js"></script>
```

---

### Step 12.3: Update game.js

**1. Comment out witness functions**

**2. Update menu button:**
```javascript
elements.witnessBtn.addEventListener('click', () => {
    witnessScreen.start();
});
```

**3. Update keyboard handler:**
```javascript
'witness-screen': () => {
    witnessScreen.advance(false);
},
```

**4. Update click handler:**
```javascript
'witness-screen': {
    element: document.getElementById('witness-dialogue-box'),
    advance: () => witnessScreen.advance()
},
```

**5. Update back to menu:**
```javascript
elements.backToMenuFromWitness.addEventListener('click', () => {
    audioManager.playSfx('click');
    audioManager.fadeToTrack('menu', 1000);
    showScreen('menu-screen');
});
```

**6. Update reset:**
```javascript
witnessScreen.reset();
```

---

### Testing Task 12:

- [ ] Witness intro plays
- [ ] Witness music starts
- [ ] Witness list displays
- [ ] Can select witnesses
- [ ] Music changes per witness
- [ ] Interview dialogue works
- [ ] Choices work correctly
- [ ] Completed witnesses disabled
- [ ] Back to list works
- [ ] Music returns to witness theme
- [ ] Back to menu works
- [ ] Reset clears state

**Commit:**
```bash
git add .
git commit -m "Task 12: Extract witness screen to separate file"
```

---

## Task 13: Extract Identify Screen (4-5 hours) - MOST COMPLEX
**Risk:** 🟡 Medium-High - Most complex screen, multiple endings
**Files:** Create `screens/identify-screen.js`, modify `game.js`, update `index.html`

### Overview: What You're Extracting

The identify screen handles:
- Suspect selection with hover text
- Branching endings based on selection
- Correct/incorrect reveal sequences
- Depression filter stages (visual effects)
- Final game completion

**Key features:**
- Uses choiceHandler with hoverTexts option
- 4 suspects with different outcomes
- Correct answer (index 1 - Cait)
- Depression filter progression
- Multiple ending sequences

### Step 13.1: Create screens/identify-screen.js

```javascript
// ============================================
// IDENTIFY SCREEN
// Final suspect identification and endings
// Global scope - no ES6 modules
// ============================================

class IdentifyScreen {
    constructor() {
        this.state = {
            mode: 'intro', // 'intro', 'choosing', 'reveal', 'ending'
            introIndex: 0,
            endingIndex: 0,
            selectedSuspect: null,
            waitingForInput: false
        };

        this.elements = {
            screen: document.getElementById('identify-screen'),
            dialogueText: document.getElementById('identify-dialogue-text'),
            dialogueBox: document.getElementById('identify-dialogue-box'),
            enterHint: document.getElementById('identify-enter-hint'),
            choices: document.getElementById('identify-choices'),
            continueBtn: document.getElementById('identify-continue-btn'),
            creditsBtn: document.getElementById('credits-btn')
        };

        this.introSequence = DIALOGUES.identifyIntro;
        this.suspects = DIALOGUES.suspects;
        this.correctSuspect = 1; // Cait
    }

    async start() {
        this.state.mode = 'intro';
        this.state.introIndex = 0;
        gameState.currentScreen = 'identify-screen';

        // Start dramatic music
        audioManager.fadeToTrack('identify', 1500);

        await this.processIntro();
    }

    async processIntro() {
        if (this.state.introIndex >= this.introSequence.length) {
            this.showSuspectChoice();
            return;
        }

        const item = this.introSequence[this.state.introIndex];
        hideInputs('identify-screen');
        this.state.waitingForInput = false;
        gameState.waitingForInput = false;

        if (item.effect) {
            applyEffects(item.effect, this.elements.dialogueBox);
        }

        await typeText(item.text, item.loud, this.elements.dialogueText);

        if (item.action === 'wait') {
            this.state.waitingForInput = true;
            gameState.waitingForInput = true;
            this.elements.enterHint.style.display = 'block';
        } else if (item.action === 'show_choices') {
            this.showSuspectChoice();
        }
    }

    advanceIntro(playSound = true) {
        if (this.state.mode === 'intro' && this.state.waitingForInput && !gameState.isTyping) {
            if (playSound) audioManager.playSfx('click');
            this.state.waitingForInput = false;
            gameState.waitingForInput = false;
            this.state.introIndex++;
            this.processIntro();
        }
    }

    showSuspectChoice() {
        this.state.mode = 'choosing';
        hideInputs('identify-screen');

        const choices = this.suspects.map(s => s.name);
        const hoverTexts = this.suspects.map(s => s.hoverText);

        choiceHandler.showChoices(
            this.elements.choices,
            choices,
            this.suspects, // Pass full suspect objects as responses
            {
                hoverTexts: hoverTexts,
                onChoice: async (index, suspect) => {
                    this.state.selectedSuspect = index;
                    gameState.selectedSuspect = index;
                    await this.revealChoice(index, suspect);
                }
            }
        );
    }

    async revealChoice(index, suspect) {
        this.state.mode = 'reveal';
        hideInputs('identify-screen');

        // Determine if correct
        const isCorrect = (index === this.correctSuspect);

        if (isCorrect) {
            await this.showCorrectEnding(suspect);
        } else {
            await this.showIncorrectEnding(suspect);
        }
    }

    async showCorrectEnding(suspect) {
        // Stage 1: Depression filter
        document.body.classList.add('depression-stage-1');
        await new Promise(resolve => setTimeout(resolve, 500));

        await typeText(suspect.correctResponse, true, this.elements.dialogueText);
        this.state.waitingForInput = true;
        gameState.waitingForInput = true;
        this.elements.enterHint.style.display = 'block';

        // Wait for user input
        await new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (!this.state.waitingForInput) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 50);
        });

        // Stage 2
        document.body.classList.remove('depression-stage-1');
        document.body.classList.add('depression-stage-2');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Continue with ending sequence
        await this.playEndingSequence(suspect.endingSequence);
    }

    async showIncorrectEnding(suspect) {
        await typeText(suspect.incorrectResponse, false, this.elements.dialogueText);

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Game over or retry logic
        this.elements.continueBtn.style.display = 'block';
        this.elements.continueBtn.textContent = 'Try Again';
        this.elements.continueBtn.onclick = () => {
            audioManager.playSfx('click');
            this.showSuspectChoice();
        };
    }

    async playEndingSequence(sequence) {
        this.state.mode = 'ending';
        this.state.endingIndex = 0;

        for (const item of sequence) {
            hideInputs('identify-screen');

            if (item.effect) {
                applyEffects(item.effect, this.elements.dialogueBox);
            }

            if (item.filterStage) {
                document.body.className = ''; // Clear all
                if (item.filterStage !== 'none') {
                    document.body.classList.add(item.filterStage);
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            await typeText(item.text, item.loud, this.elements.dialogueText);

            if (item.action === 'wait') {
                this.state.waitingForInput = true;
                gameState.waitingForInput = true;
                this.elements.enterHint.style.display = 'block';

                await new Promise(resolve => {
                    const checkInterval = setInterval(() => {
                        if (!this.state.waitingForInput) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 50);
                });
            }

            this.state.endingIndex++;
        }

        // Show credits button
        this.showCredits();
    }

    showCredits() {
        gameState.gameComplete = true;
        hideInputs('identify-screen');
        this.elements.creditsBtn.style.display = 'block';
        this.elements.creditsBtn.onclick = () => {
            audioManager.playSfx('click');
            showScreen('credits-screen');
        };
    }

    advanceEnding() {
        if (this.state.mode === 'ending' && this.state.waitingForInput && !gameState.isTyping) {
            this.state.waitingForInput = false;
            gameState.waitingForInput = false;
        }
    }

    advance(playSound = true) {
        if (this.state.mode === 'intro') {
            this.advanceIntro(playSound);
        } else if (this.state.mode === 'ending') {
            this.advanceEnding();
        }
    }

    reset() {
        this.state.mode = 'intro';
        this.state.introIndex = 0;
        this.state.endingIndex = 0;
        this.state.selectedSuspect = null;
        this.state.waitingForInput = false;

        // Clear depression filters
        document.body.className = '';

        // Sync with gameState
        gameState.selectedSuspect = null;
        gameState.gameComplete = false;
    }
}

// Create global instance
const identifyScreen = new IdentifyScreen();
```

---

### Step 13.2: Update index.html

```html
<!-- Witness Screen -->
<script src="screens/witness-screen.js"></script>
<!-- Identify Screen -->
<script src="screens/identify-screen.js"></script>
<!-- Game Logic -->
<script src="game.js"></script>
```

---

### Step 13.3: Update game.js

**1. Comment out identify functions**

**2. Update menu button:**
```javascript
elements.identifyBtn.addEventListener('click', () => {
    identifyScreen.start();
});
```

**3. Update keyboard handler:**
```javascript
'identify-screen': () => {
    identifyScreen.advance(false);
},
```

**4. Update click handler:**
```javascript
'identify-screen': {
    element: document.getElementById('identify-dialogue-box'),
    advance: () => identifyScreen.advance()
},
```

**5. Update reset:**
```javascript
identifyScreen.reset();
document.body.className = ''; // Clear depression filters
```

---

### Testing Task 13:

- [ ] Identify intro plays
- [ ] Identify music starts
- [ ] Suspect choices show with hover text
- [ ] Correct choice (Cait) plays correct ending
- [ ] Depression filters apply correctly
- [ ] Ending sequence plays
- [ ] Credits button appears
- [ ] Incorrect choices show retry
- [ ] Try again works
- [ ] Reset clears filters
- [ ] Game completion tracked

**Commit:**
```bash
git add .
git commit -m "Task 13: Extract identify screen to separate file"
```

---

## Phase 2 Complete! 🎉

After Task 13, you'll have:
- game.js reduced to ~1500-2000 lines (initialization only)
- 5 screen files (~150-600 lines each)
- Clean separation of concerns
- Easy content editing

### Final Steps:

1. **Test entire game flow:**
   - Play from start to finish
   - Test all screens
   - Verify music transitions
   - Check all buttons and navigation

2. **Clean up commented code:**
   - Remove old commented functions from game.js
   - Keep only active code

3. **Final commit:**
```bash
git add .
git commit -m "Phase 2 complete: All screens extracted"
git tag v2.0-phase2-complete
git push origin main --tags
```

4. **Celebrate!** You now have a maintainable, well-organized codebase! 🎄

---

## Benefits You've Achieved:

**Content editing is now EASY:**
- Edit witness dialogue → `screens/witness-screen.js` (clear, ~450 lines)
- Add evidence item → `screens/evidence-screen.js` (clear structure)
- Tweak choices → All use `choiceHandler.showChoices()` (one pattern)
- Add new scenes → Clear screen class pattern to follow

**Code is maintainable:**
- Each screen is self-contained
- Shared utilities in `core/`
- Clear separation of concerns
- Easy to understand and extend

**Future work is simpler:**
- Want to add a new screen? Follow the established pattern
- Want to add features? Clear place to put them
- Want to fix bugs? Easy to locate the relevant code

You did it! 🚀
