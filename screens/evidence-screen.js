// ============================================
// EVIDENCE SCREEN
// Physical evidence examination
// Global scope - no ES6 modules
// ============================================

class EvidenceScreen {
    constructor() {
        this.state = {
            mode: 'intro', // 'intro', 'grid', 'viewing'
            introIndex: 0,
            dialogueIndex: 0,
            currentEvidence: null,
            completedEvidence: [],
            collectedLeads: [],
            introComplete: false,
            choiceResponse: null,
            waitingForInput: false,
            molSprite: null
        };

        this.elements = {
            screen: document.getElementById('evidence-screen'),
            dialogueText: document.getElementById('evidence-dialogue-text'),
            dialogueBox: document.getElementById('evidence-dialogue-box'),
            enterHint: document.getElementById('evidence-enter-hint'),
            evidenceGrid: document.getElementById('evidence-grid'),
            choices: document.getElementById('evidence-choices'),
            continueBtn: document.getElementById('evidence-continue-btn'),
            backBtn: document.getElementById('evidence-back-btn'),
            molImage: document.getElementById('evidence-mol'),
            persistentLeads: document.getElementById('persistent-leads'),
            leadsList: document.getElementById('leads-list')
        };

        this.introSequence = DIALOGUES.physicalEvidence.intro;
        this.evidenceItems = DIALOGUES.physicalEvidence.items;
    }

    async start() {
        audioManager.playSfx('papers');
        showScreen('evidence-screen');
        this.elements.persistentLeads.style.display = 'block';

        // Disable grid during intro/dialogue
        this.setGridEnabled(false);

        if (!this.state.introComplete) {
            // Play intro sequence
            this.state.mode = 'intro';
            this.state.introIndex = 0;
            gameState.currentScreen = 'evidence-screen';
            await this.processIntro();
        } else if (this.state.completedEvidence.length >= this.evidenceItems.length) {
            // All evidence examined
            this.setGridEnabled(true);
            this.elements.dialogueText.textContent = "You've already examined all the evidence.";
            this.elements.continueBtn.textContent = 'Back to Menu';
            this.elements.continueBtn.style.display = 'block';
            this.elements.continueBtn.onclick = () => {
                audioManager.playSfx('click');
                showScreen('menu-screen');
            };
        } else {
            // Skip intro, enable grid
            this.setGridEnabled(true);
            this.elements.dialogueText.textContent = 'Select an evidence item to examine.';
        }
    }

    setGridEnabled(enabled) {
        const items = this.elements.evidenceGrid.querySelectorAll('.evidence-item');
        items.forEach(item => {
            const evidenceId = item.dataset.evidence;
            if (this.state.completedEvidence.includes(evidenceId)) {
                item.disabled = true;
                item.classList.add('completed');
            } else {
                item.disabled = !enabled;
            }
        });
    }

    async processIntro() {
        if (this.state.introIndex >= this.introSequence.length) {
            // Intro complete - reset Mol sprite if needed
            if (this.state.molSprite) {
                this.elements.molImage.src = 'images/Mol.png';
                this.state.molSprite = null;
            }
            this.state.introComplete = true;
            gameState.evidenceIntroComplete = true;
            this.setGridEnabled(true);
            this.elements.dialogueText.textContent = 'Select an evidence item to examine.';
            hideInputs('evidence-screen');
            return;
        }

        // Reset Mol sprite from previous dialogue
        if (this.state.molSprite) {
            this.elements.molImage.src = 'images/Mol.png';
            this.state.molSprite = null;
        }

        const item = this.introSequence[this.state.introIndex];
        hideInputs('evidence-screen');
        this.state.waitingForInput = false;
        gameState.waitingForInput = false;

        // Check for strawberry jam line (index 2) - show jam sprite
        if (this.state.introIndex === 2 && item.text.includes('strawberry jam')) {
            audioManager.playSfx('sparkle');
            this.elements.molImage.src = 'images/Mol_jam.png';
            this.state.molSprite = 'jam';
        }

        await typeText(item.text, item.loud, this.elements.dialogueText);
        this.state.waitingForInput = true;
        gameState.waitingForInput = true;
        this.elements.enterHint.style.display = 'block';
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

    async selectEvidence(evidenceId) {
        const evidence = this.evidenceItems.find(e => e.id === evidenceId);
        if (!evidence) return;

        this.state.currentEvidence = evidence;
        this.state.mode = 'viewing';
        this.state.dialogueIndex = 0;
        this.state.choiceResponse = null;
        gameState.currentEvidence = evidence;
        this.setGridEnabled(false);

        await this.processDialogue();
    }

    async processDialogue() {
        const evidence = this.state.currentEvidence;
        if (!evidence) return;

        // Reset Mol sprite if it was changed (pretzel, etc.)
        if (this.state.molSprite) {
            this.elements.molImage.src = 'images/Mol.png';
            this.state.molSprite = null;
        }

        // Check if we're processing a choice response
        let dialogueList = evidence.dialogue;
        if (this.state.choiceResponse !== null) {
            dialogueList = this.state.choiceResponse;
        }

        if (this.state.dialogueIndex >= dialogueList.length) {
            // Dialogue complete - add to leads and mark complete
            await this.finishEvidence();
            return;
        }

        const item = dialogueList[this.state.dialogueIndex];
        hideInputs('evidence-screen');
        this.state.waitingForInput = false;
        gameState.waitingForInput = false;

        // Apply effects before typing
        if (item.effect === 'shake_flash') {
            document.body.classList.add('flash');
            this.elements.dialogueBox.classList.add('shake');
            setTimeout(() => {
                document.body.classList.remove('flash');
                this.elements.dialogueBox.classList.remove('shake');
            }, 500);
        }

        // Play sound effect if specified
        if (item.sound) {
            audioManager.playSfx(item.sound);
        }

        // Check for special sprite triggers
        if (item.text && item.text.includes('tactical positioning described here is')) {
            audioManager.playSfx('surprise');
            this.elements.molImage.src = 'images/Mol_surprised.png';
            this.state.molSprite = 'surprised';
        }

        if (item.action === 'choice') {
            // Show choices immediately (don't clear previous dialogue text)
            this.elements.choices.innerHTML = '';
            this.elements.choices.style.display = 'flex';

            item.choices.forEach((choice, index) => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = choice;
                btn.onclick = () => this.handleChoice(index, item.responses[index]);
                this.elements.choices.appendChild(btn);
            });
            // Don't wait for input - choices are clickable immediately
            return;
        } else if (item.action === 'continue_button') {
            await typeText(item.text, item.loud, this.elements.dialogueText);
            this.elements.continueBtn.textContent = item.buttonText || 'Continue';
            this.elements.continueBtn.style.display = 'block';
            this.elements.continueBtn.onclick = () => {
                audioManager.playSfx('click');
                this.state.dialogueIndex++;
                this.processDialogue();
            };
        } else {
            // Default 'wait' action
            await typeText(item.text, item.loud, this.elements.dialogueText);

            // Check if the NEXT item is a choice - if so, show choices immediately
            const nextIndex = this.state.dialogueIndex + 1;
            if (nextIndex < dialogueList.length && dialogueList[nextIndex].action === 'choice') {
                // Show choices right after this dialogue without waiting
                this.state.dialogueIndex++;
                const nextItem = dialogueList[this.state.dialogueIndex];
                this.elements.choices.innerHTML = '';
                this.elements.choices.style.display = 'flex';

                nextItem.choices.forEach((choice, index) => {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn';
                    btn.textContent = choice;
                    btn.onclick = () => this.handleChoice(index, nextItem.responses[index]);
                    this.elements.choices.appendChild(btn);
                });
                return;
            }

            this.state.waitingForInput = true;
            gameState.waitingForInput = true;
            this.elements.enterHint.style.display = 'block';
        }
    }

    async handleChoice(choiceIndex, response) {
        audioManager.playSfx('click');
        this.elements.choices.style.display = 'none';

        // Response can be an array of dialogue items or a single string
        if (Array.isArray(response) && typeof response[0] === 'object') {
            // Array of dialogue objects - set as response sequence
            this.state.choiceResponse = response;
            this.state.dialogueIndex = 0;
            this.processDialogue();
        } else if (Array.isArray(response)) {
            // Array of strings - type each one
            for (const text of response) {
                await typeText(text, false, this.elements.dialogueText);
                this.state.waitingForInput = true;
                gameState.waitingForInput = true;
                this.elements.enterHint.style.display = 'block';
                await this.waitForInput();
            }
            this.state.dialogueIndex++;
            this.state.choiceResponse = null;
            this.processDialogue();
        } else {
            // Single string response
            await typeText(response, false, this.elements.dialogueText);
            this.state.waitingForInput = true;
            gameState.waitingForInput = true;
            this.elements.enterHint.style.display = 'block';
        }
    }

    waitForInput() {
        return new Promise(resolve => {
            const checkInput = () => {
                if (!this.state.waitingForInput) {
                    resolve();
                } else {
                    setTimeout(checkInput, 100);
                }
            };
            checkInput();
        });
    }

    async finishEvidence() {
        const evidence = this.state.currentEvidence;

        // Add lead to list using our encapsulated method
        const leadText = evidence.leadText;
        if (!this.state.collectedLeads.includes(leadText)) {
            await this.addLeadToList(leadText);

            // If this evidence has a "after" text (like manuscript), store it for later
            if (evidence.leadTextAfter) {
                // We'll update this when returning to menu
                evidence._needsUpdate = true;
            }
        }

        // Mark as complete
        if (!this.state.completedEvidence.includes(evidence.id)) {
            this.state.completedEvidence.push(evidence.id);
            gameState.completedEvidence = this.state.completedEvidence;
        }

        // Reset state
        this.state.currentEvidence = null;
        this.state.dialogueIndex = 0;
        this.state.choiceResponse = null;
        gameState.currentEvidence = null;

        // Update grid
        this.setGridEnabled(true);
        this.elements.dialogueText.textContent = 'Select another evidence item to examine.';
        hideInputs('evidence-screen');

        // Check if all evidence is complete
        if (this.state.completedEvidence.length >= this.evidenceItems.length) {
            this.elements.dialogueText.textContent = 'All evidence has been examined. Return to the menu to continue.';
        }
    }

    async addLeadToList(leadText) {
        const li = document.createElement('li');
        this.elements.leadsList.appendChild(li);
        await typeSilent(leadText, li);
        if (!this.state.collectedLeads.includes(leadText)) {
            this.state.collectedLeads.push(leadText);
        }
        // Sync with gameState
        gameState.collectedLeads = this.state.collectedLeads;
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
        this.state.completedEvidence = [];
        this.state.collectedLeads = [];
        this.state.introComplete = false;
        this.state.choiceResponse = null;
        this.state.waitingForInput = false;
        this.state.molSprite = null;

        // Reset Mol sprite
        if (this.elements.molImage) {
            this.elements.molImage.src = 'images/Mol.png';
        }

        // Sync with gameState
        gameState.evidenceIntroComplete = false;
        gameState.evidenceIntroIndex = 0;
        gameState.completedEvidence = [];
        gameState.currentEvidence = null;
        gameState.evidenceDialogueIndex = 0;
        gameState.evidenceChoiceResponse = null;

        // Reset evidence grid
        const items = this.elements.evidenceGrid.querySelectorAll('.evidence-item');
        items.forEach(item => {
            item.disabled = false;
            item.classList.remove('completed');
        });
    }
}

// Create global instance
const evidenceScreen = new EvidenceScreen();
