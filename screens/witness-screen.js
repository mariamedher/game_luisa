// ============================================
// WITNESS SCREEN
// Witness interviews and interrogations
// Global scope - no ES6 modules
// ============================================

class WitnessScreen {
    constructor() {
        this.state = {
            introComplete: false,
            introIndex: 0,
            dialogueIndex: 0,
            currentWitness: null,
            completedWitnesses: [],
            collectedLeads: [],
            waitingForInput: false,
            processingChoice: false,
            currentWitnessMusic: null
        };

        this.elements = {
            screen: document.getElementById('witness-screen'),
            dialogueText: document.getElementById('witness-dialogue-text'),
            dialogueBox: document.getElementById('witness-dialogue-box'),
            enterHint: document.getElementById('witness-enter-hint'),
            witnessList: document.getElementById('witness-list'),
            witnessImage: document.getElementById('witness-image'),
            witnessImageContainer: document.getElementById('witness-image-container'),
            witnessMol: document.getElementById('witness-mol'),
            choices: document.getElementById('witness-choices'),
            continueBtn: document.getElementById('witness-continue-btn'),
            backBtn: document.getElementById('witness-back-btn'),
            leadsList: document.getElementById('leads-list'),
            persistentLeads: document.getElementById('persistent-leads')
        };

        this.data = DIALOGUES.witnessReports || { intro: [], witnesses: [] };
    }

    async start() {
        playPapersSound();
        showScreen('witness-screen');
        this.elements.persistentLeads.style.display = 'block';

        // Hide witness image initially and collapse container
        this.elements.witnessImage.style.display = 'none';
        this.elements.witnessImage.classList.remove('fly-away', 'vanish', 'spinning');
        this.elements.witnessImageContainer.classList.add('collapsed');

        // Disable list during intro/dialogue
        this.setListEnabled(false);

        if (!this.state.introComplete) {
            // Play intro sequence
            this.state.introIndex = 0;
            gameState.witnessIntroComplete = false;
            gameState.witnessIntroIndex = 0;
            await this.processIntro();
        } else if (this.state.completedWitnesses.length >= this.data.witnesses.length) {
            // All witnesses interviewed
            this.setListEnabled(true);
            this.elements.dialogueText.textContent = "You've already interviewed all witnesses.";
            this.elements.continueBtn.textContent = 'Back to Menu';
            this.elements.continueBtn.style.display = 'block';
            this.elements.continueBtn.onclick = () => {
                playClickSound();
                showScreen('menu-screen');
            };
        } else {
            // Skip intro, enable list
            this.setListEnabled(true);
            this.elements.witnessList.style.display = 'flex';
            this.elements.dialogueText.textContent = 'Select a witness to interview.';
        }
    }

    async processIntro() {
        if (this.state.introIndex >= this.data.intro.length) {
            // Intro complete
            this.state.introComplete = true;
            gameState.witnessIntroComplete = true;
            this.setListEnabled(true);
            this.elements.witnessList.style.display = 'flex';
            this.elements.dialogueText.textContent = 'Select a witness to interview.';
            hideInputs('witness-screen');
            return;
        }

        const item = this.data.intro[this.state.introIndex];
        hideInputs('witness-screen');
        this.state.waitingForInput = false;
        gameState.waitingForInput = false;

        await typeText(item.text, item.loud, this.elements.dialogueText);
        this.state.waitingForInput = true;
        gameState.waitingForInput = true;
        this.elements.enterHint.style.display = 'block';
    }

    advanceIntro(playSound = true) {
        if (!this.state.introComplete && this.state.waitingForInput && !gameState.isTyping) {
            if (playSound) playClickSound();
            this.state.waitingForInput = false;
            gameState.waitingForInput = false;
            this.state.introIndex++;
            gameState.witnessIntroIndex++;
            this.processIntro();
        }
    }

    setListEnabled(enabled) {
        const items = this.elements.witnessList.querySelectorAll('.witness-item');
        items.forEach(item => {
            const witnessId = item.dataset.witness;
            const isCompleted = this.state.completedWitnesses.includes(witnessId);

            if (enabled && !isCompleted) {
                item.disabled = false;
                item.classList.remove('completed');
            } else if (isCompleted) {
                item.disabled = true;
                item.classList.add('completed');
            } else {
                item.disabled = true;
            }
        });
    }

    async selectWitness(witnessId) {
        const witness = this.data.witnesses.find(w => w.id === witnessId);
        if (!witness) return;

        this.state.currentWitness = witness;
        this.state.dialogueIndex = 0;
        gameState.currentWitness = witness;
        gameState.witnessDialogueIndex = 0;
        this.setListEnabled(false);

        // Hide witness list during interview
        this.elements.witnessList.style.display = 'none';

        // Show witness image (unless delayImage is true - then wait for show_image action)
        if (witness.image && !witness.delayImage) {
            this.elements.witnessImageContainer.classList.remove('collapsed');
            this.elements.witnessImage.src = `images/${witness.image}`;
            this.elements.witnessImage.style.display = 'block';
            this.elements.witnessImage.classList.remove('fly-away', 'vanish', 'wide', 'spinning');
            // Add wide class for rectangular images
            if (witness.wide) {
                this.elements.witnessImage.classList.add('wide');
            }
        }

        // Switch to witness music
        if (witness.music) {
            this.switchToWitnessMusic(witness.id);
        }

        // Apply alien visual effect for glorp
        if (witness.id === 'glorp') {
            document.body.classList.add('alien-effect');
        }

        await this.processDialogue();
    }

    switchToWitnessMusic(witnessId) {
        audioManager.switchToWitnessMusic(witnessId);
        this.state.currentWitnessMusic = witnessId;
        gameState.currentWitnessMusic = witnessId;
    }

    switchToMainMusic() {
        audioManager.switchToMainMusic();
        this.state.currentWitnessMusic = null;
        gameState.currentWitnessMusic = null;
    }

    async processDialogue() {
        const witness = this.state.currentWitness;
        if (!witness) return;

        if (this.state.dialogueIndex >= witness.dialogue.length) {
            // Dialogue complete
            await this.finishWitness();
            return;
        }

        const item = witness.dialogue[this.state.dialogueIndex];
        hideInputs('witness-screen');
        this.state.waitingForInput = false;
        gameState.waitingForInput = false;

        // Play sound effect if specified (but not for vanish - that plays at the moment of vanishing)
        if (item.sound && item.action !== 'vanish') {
            playSfx(item.sound);
        }

        // Change witness image if specified (can be used with any action)
        if (item.changeImage) {
            this.elements.witnessImage.src = `images/${item.changeImage}`;
        }

        // Handle different action types
        if (item.action === 'show_image') {
            // Show the witness image (for delayed image display)
            this.elements.witnessImageContainer.classList.remove('collapsed');
            this.elements.witnessImage.src = `images/${witness.image}`;
            this.elements.witnessImage.style.display = 'block';
            this.elements.witnessImage.classList.remove('fly-away', 'vanish', 'wide', 'spinning');
            if (witness.wide) {
                this.elements.witnessImage.classList.add('wide');
            }
            // Continue to next dialogue item immediately
            this.state.dialogueIndex++;
            gameState.witnessDialogueIndex++;
            this.processDialogue();
            return;
        }

        if (item.action === 'spin') {
            // Make the witness image spin (like a beyblade)
            this.elements.witnessImage.classList.add('spinning');

            // Type the text if there is any
            if (item.text) {
                await typeText(item.text, {
                    loud: item.loud,
                    target: this.elements.dialogueText,
                    speaker: item.speaker,
                    pitch: item.pitch || witness.pitch || 'normal'
                });
            }

            // Show button to continue (stop spinning)
            this.elements.continueBtn.textContent = item.buttonText || 'Continue';
            this.elements.continueBtn.style.display = 'block';
            this.elements.continueBtn.onclick = () => {
                playClickSound();
                this.elements.continueBtn.style.display = 'none';
                this.elements.witnessImage.classList.remove('spinning');
                this.state.dialogueIndex++;
                gameState.witnessDialogueIndex++;
                this.processDialogue();
            };
            return;
        }

        if (item.action === 'fly_away') {
            // Special action - witness flies away (like Cait's helicopter)
            // Show a button for the player to click
            playSfx('helicopter');
            this.elements.witnessImage.classList.add('fly-away');

            // Show surprised Mol during the helicopter departure
            this.elements.witnessMol.src = 'images/Mol_surprised.png';

            // Clear dialogue and show button
            this.elements.dialogueText.textContent = '';
            this.elements.continueBtn.textContent = item.buttonText || 'Continue';
            this.elements.continueBtn.style.display = 'block';
            this.elements.continueBtn.onclick = () => {
                playClickSound();
                this.elements.continueBtn.style.display = 'none';
                this.elements.witnessImage.style.display = 'none';
                // Reset Mol sprite back to normal
                this.elements.witnessMol.src = 'images/Mol.png';
                this.state.dialogueIndex++;
                gameState.witnessDialogueIndex++;
                this.processDialogue();
            };
            return;
        }

        if (item.action === 'beam_up') {
            // Special action - witness beams up to spaceship (like glorp)
            // First type the text if there is any
            if (item.text) {
                await typeText(item.text, {
                    loud: item.loud,
                    target: this.elements.dialogueText,
                    speaker: item.speaker,
                    pitch: item.pitch || 'normal'
                });
            }

            // Play spaceship sound and fly away animation
            playSfx('spaceship');
            this.elements.witnessImage.classList.add('fly-away');

            // Show surprised Mol during the beam up
            this.elements.witnessMol.src = 'images/Mol_surprised.png';

            // Show choices for player response, or continue button if no choices
            if (item.choices) {
                this.elements.choices.innerHTML = '';
                this.elements.choices.style.display = 'flex';

                item.choices.forEach((choice, index) => {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn';
                    btn.textContent = choice;
                    btn.onclick = () => this.handleChoice(index, item.responses[index]);
                    this.elements.choices.appendChild(btn);
                });
            } else {
                // No choices - allow Enter/click to proceed (like normal dialogue)
                this.state.waitingForInput = true;
                gameState.waitingForInput = true;
                this.elements.enterHint.style.display = 'block';
            }
            return;
        }

        if (item.action === 'vanish') {
            // Special action - witness vanishes (snap/poof)
            // First type the text if there is any
            if (item.text) {
                await typeText(item.text, {
                    loud: item.loud,
                    target: this.elements.dialogueText,
                    speaker: item.speaker,
                    pitch: item.pitch || 'normal'
                });
            }

            // Play sound at the moment of vanishing
            if (item.sound) {
                playSfx(item.sound);
            }
            this.elements.witnessImage.classList.add('vanish');

            // Show button for player to continue
            this.elements.continueBtn.textContent = item.buttonText || 'Continue';
            this.elements.continueBtn.style.display = 'block';
            this.elements.continueBtn.onclick = () => {
                playClickSound();
                this.elements.continueBtn.style.display = 'none';
                this.elements.witnessImage.style.display = 'none';
                this.state.dialogueIndex++;
                gameState.witnessDialogueIndex++;
                this.processDialogue();
            };
            return;
        }

        if (item.action === 'continue_button') {
            // Apply effects first if specified
            if (item.effect === 'shake_flash') {
                document.body.classList.add('flash');
                this.elements.dialogueBox.classList.add('shake');
                setTimeout(() => {
                    document.body.classList.remove('flash');
                    this.elements.dialogueBox.classList.remove('shake');
                }, 500);
            }

            // Determine pitch
            let pitch = 'normal';
            if (item.pitch) {
                pitch = item.pitch;
            } else if (item.speaker === witness.id) {
                pitch = witness.pitch || 'normal';
            }

            // Type the text
            await typeText(item.text, {
                loud: item.loud,
                target: this.elements.dialogueText,
                speaker: item.speaker,
                pitch: pitch
            });

            // Show continue button
            this.elements.continueBtn.textContent = item.buttonText || 'Continue';
            this.elements.continueBtn.style.display = 'block';
            this.elements.continueBtn.onclick = () => {
                playClickSound();
                this.elements.continueBtn.style.display = 'none';
                this.state.dialogueIndex++;
                gameState.witnessDialogueIndex++;
                this.processDialogue();
            };
            return;
        }

        // Apply shake_flash effect if specified
        if (item.effect === 'shake_flash') {
            document.body.classList.add('flash');
            this.elements.dialogueBox.classList.add('shake');
            setTimeout(() => {
                document.body.classList.remove('flash');
                this.elements.dialogueBox.classList.remove('shake');
            }, 500);
        }

        // Determine pitch based on speaker
        // For items with custom pitch, use that; otherwise use witness default or 'normal' for Mol
        let pitch = 'normal';
        if (item.pitch) {
            pitch = item.pitch;
        } else if (item.speaker === witness.id) {
            pitch = witness.pitch || 'normal';
        }

        // Type the text with speaker styling
        await typeText(item.text, {
            loud: item.loud,
            target: this.elements.dialogueText,
            speaker: item.speaker,
            pitch: pitch
        });

        // Check if the CURRENT item has choices attached - if so, show them
        if (item.choices && item.responses) {
            this.elements.choices.innerHTML = '';
            this.elements.choices.style.display = 'flex';

            item.choices.forEach((choice, index) => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = choice;
                btn.onclick = () => this.handleChoice(index, item.responses[index]);
                this.elements.choices.appendChild(btn);
            });
            return;
        }

        // Check if the NEXT item is a choice - if so, show choices immediately
        const nextIndex = this.state.dialogueIndex + 1;
        if (nextIndex < witness.dialogue.length && witness.dialogue[nextIndex].action === 'choice') {
            this.state.dialogueIndex++;
            gameState.witnessDialogueIndex++;
            const nextItem = witness.dialogue[this.state.dialogueIndex];
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

    waitForInput() {
        return new Promise(resolve => {
            const onAdvance = () => {
                this.state.waitingForInput = false;
                gameState.waitingForInput = false;
                this.elements.enterHint.style.display = 'none';
                resolve();
            };
            const clickHandler = () => {
                playClickSound();
                this.elements.dialogueBox.removeEventListener('click', clickHandler);
                document.removeEventListener('keydown', keyHandler);
                onAdvance();
            };
            const keyHandler = (e) => {
                if (e.key === 'Enter' && !e.target.matches('input')) {
                    this.elements.dialogueBox.removeEventListener('click', clickHandler);
                    document.removeEventListener('keydown', keyHandler);
                    onAdvance();
                }
            };
            this.elements.dialogueBox.addEventListener('click', clickHandler);
            document.addEventListener('keydown', keyHandler);
        });
    }

    async handleChoice(choiceIndex, response) {
        playClickSound();
        this.elements.choices.style.display = 'none';

        // Reset Mol sprite if it was surprised (from beam_up)
        this.elements.witnessMol.src = 'images/Mol.png';

        // Flag to prevent advanceDialogue from interfering
        this.state.processingChoice = true;
        gameState.processingChoice = true;

        // Response can be: string, array of strings, or array of dialogue objects
        if (Array.isArray(response)) {
            for (const item of response) {
                if (typeof item === 'string') {
                    // Simple string response
                    await typeText(item, false, this.elements.dialogueText);
                    // Wait for user input to continue
                    this.state.waitingForInput = true;
                    gameState.waitingForInput = true;
                    this.elements.enterHint.style.display = 'block';
                    await this.waitForInput();
                } else if (item.action === 'choice') {
                    // Nested choice - show choice buttons and wait for selection
                    this.elements.choices.innerHTML = '';
                    this.elements.choices.style.display = 'flex';

                    await new Promise(resolve => {
                        item.choices.forEach((choice, index) => {
                            const btn = document.createElement('button');
                            btn.className = 'choice-btn';
                            btn.textContent = choice;
                            btn.onclick = async () => {
                                playClickSound();
                                this.elements.choices.style.display = 'none';
                                // Process the nested response
                                const nestedResponse = item.responses[index];
                                if (Array.isArray(nestedResponse)) {
                                    for (const nestedItem of nestedResponse) {
                                        if (typeof nestedItem === 'string') {
                                            await typeText(nestedItem, false, this.elements.dialogueText);
                                        } else {
                                            if (nestedItem.sound) playSfx(nestedItem.sound);
                                            if (nestedItem.effect === 'shake_flash') {
                                                document.body.classList.add('flash');
                                                this.elements.dialogueBox.classList.add('shake');
                                                setTimeout(() => {
                                                    document.body.classList.remove('flash');
                                                    this.elements.dialogueBox.classList.remove('shake');
                                                }, 500);
                                            }
                                            await typeText(nestedItem.text, {
                                                loud: nestedItem.loud,
                                                target: this.elements.dialogueText,
                                                speaker: nestedItem.speaker,
                                                pitch: nestedItem.pitch || 'normal'
                                            });
                                        }
                                        this.state.waitingForInput = true;
                                        gameState.waitingForInput = true;
                                        this.elements.enterHint.style.display = 'block';
                                        await this.waitForInput();
                                    }
                                }
                                resolve();
                            };
                            this.elements.choices.appendChild(btn);
                        });
                    });
                } else {
                    // Dialogue object with speaker, pitch, loud, effect, sound
                    if (item.sound) {
                        playSfx(item.sound);
                    }
                    if (item.effect === 'shake_flash') {
                        document.body.classList.add('flash');
                        this.elements.dialogueBox.classList.add('shake');
                        setTimeout(() => {
                            document.body.classList.remove('flash');
                            this.elements.dialogueBox.classList.remove('shake');
                        }, 500);
                    }
                    await typeText(item.text, {
                        loud: item.loud,
                        target: this.elements.dialogueText,
                        speaker: item.speaker,
                        pitch: item.pitch || 'normal'
                    });
                    // Wait for user input to continue
                    this.state.waitingForInput = true;
                    gameState.waitingForInput = true;
                    this.elements.enterHint.style.display = 'block';
                    await this.waitForInput();
                }
            }
        } else {
            await typeText(response, false, this.elements.dialogueText);
            // Wait for user input
            this.state.waitingForInput = true;
            gameState.waitingForInput = true;
            this.elements.enterHint.style.display = 'block';
            await this.waitForInput();
        }

        this.state.processingChoice = false;
        gameState.processingChoice = false;
        this.state.dialogueIndex++;
        gameState.witnessDialogueIndex++;
        this.processDialogue();
    }

    async finishWitness() {
        const witness = this.state.currentWitness;

        // Switch back to main music
        this.switchToMainMusic();

        // Add leads to list
        if (witness.leads && witness.leads.length > 0) {
            for (const lead of witness.leads) {
                if (!this.state.collectedLeads.includes(lead)) {
                    await this.addLeadToList(lead);
                }
            }
        }

        // Mark as complete
        if (!this.state.completedWitnesses.includes(witness.id)) {
            this.state.completedWitnesses.push(witness.id);
            gameState.completedWitnesses = this.state.completedWitnesses;
        }

        updateIdentifySuspectButton();

        // Reset state
        this.state.currentWitness = null;
        this.state.dialogueIndex = 0;
        gameState.currentWitness = null;
        gameState.witnessDialogueIndex = 0;

        // Hide witness image and collapse container
        this.elements.witnessImage.style.display = 'none';
        this.elements.witnessImage.classList.remove('fly-away', 'vanish', 'spinning');
        this.elements.witnessImageContainer.classList.add('collapsed');

        // Remove alien visual effect
        document.body.classList.remove('alien-effect');

        // Show witness list again
        this.elements.witnessList.style.display = 'flex';

        // Update list
        this.setListEnabled(true);
        this.elements.dialogueText.textContent = 'Select another witness to interview.';
        hideInputs('witness-screen');

        // Check if all witnesses interviewed
        if (this.state.completedWitnesses.length >= this.data.witnesses.length) {
            this.elements.dialogueText.textContent = 'All witnesses have been interviewed. Return to the menu to continue.';
            this.elements.continueBtn.textContent = 'Back to Menu';
            this.elements.continueBtn.style.display = 'block';
            this.elements.continueBtn.onclick = () => {
                audioManager.playSfx('click');
                showScreen('menu-screen');
            };
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
        // Don't advance if we're processing a choice response (it has its own handlers)
        if (this.state.processingChoice) return;

        if (this.state.currentWitness && this.state.waitingForInput && !gameState.isTyping) {
            if (playSound) playClickSound();
            this.state.waitingForInput = false;
            gameState.waitingForInput = false;
            this.state.dialogueIndex++;
            gameState.witnessDialogueIndex++;
            this.processDialogue();
        }
    }

    advance(playSound = true) {
        if (!this.state.introComplete) {
            this.advanceIntro(playSound);
        } else if (this.state.currentWitness) {
            this.advanceDialogue(playSound);
        }
    }

    reset() {
        this.state.introComplete = false;
        this.state.introIndex = 0;
        this.state.dialogueIndex = 0;
        this.state.currentWitness = null;
        this.state.completedWitnesses = [];
        this.state.collectedLeads = [];
        this.state.waitingForInput = false;
        this.state.processingChoice = false;
        this.state.currentWitnessMusic = null;

        // Sync with gameState
        gameState.witnessIntroComplete = false;
        gameState.witnessIntroIndex = 0;
        gameState.completedWitnesses = [];
        gameState.currentWitness = null;
        gameState.witnessDialogueIndex = 0;
    }
}

// Create global instance
const witnessScreen = new WitnessScreen();
