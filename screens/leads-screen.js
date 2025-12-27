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
        audioManager.playSfx('papers');
        showScreen('leads-screen');
        this.elements.persistentLeads.style.display = 'block';

        // If already completed, show completion message
        if (this.state.leadsComplete) {
            this.elements.dialogueText.innerHTML = "You've already reviewed the leads.";
            this.elements.continueBtn.textContent = 'Back to Menu';
            this.elements.continueBtn.style.display = 'block';
            this.elements.continueBtn.onclick = () => {
                audioManager.playSfx('click');
                showScreen('menu-screen');
            };
            return;
        }

        // Fresh start
        this.state.leadsIndex = 0;
        gameState.currentScreen = 'leads-screen';
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

        // Handle different action types
        switch (item.action) {
            case 'wait':
                // Apply effects BEFORE typing (same as intro dialogue)
                if (item.effect === 'shake_flash') {
                    document.body.classList.add('flash');
                    this.elements.dialogueBox.classList.add('shake');
                    setTimeout(() => {
                        document.body.classList.remove('flash');
                        this.elements.dialogueBox.classList.remove('shake');
                    }, 500);
                }
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
                                            this.elements.dialogueText.parentElement.addEventListener('click', function onClick() {
                                                this.elements.dialogueText.parentElement.removeEventListener('click', onClick);
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
                await typeText(item.text || "That's all for now.", false, this.elements.dialogueText);
                this.state.leadsComplete = true;
                gameState.leadsComplete = true;
                this.elements.continueBtn.textContent = 'Back to Menu';
                this.elements.continueBtn.style.display = 'block';
                this.elements.continueBtn.onclick = () => {
                    audioManager.playSfx('click');
                    showScreen('menu-screen');
                };
                break;
        }
    }

    advance(playSound = true) {
        if (gameState.currentScreen === 'leads-screen' &&
            this.state.waitingForInput &&
            !gameState.isTyping) {
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

            await new Promise(resolve => setTimeout(resolve, 400));

            if (color.strike) {
                await new Promise(resolve => setTimeout(resolve, 300));
                span.classList.add('strikethrough');
            }

            // Add space
            this.elements.dialogueText.appendChild(document.createTextNode(' '));
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    async showColoredText(item) {
        // Type colored text with animalese sound
        this.elements.dialogueText.innerHTML = '';
        const colorClass = 'hair-' + item.color;
        const span = document.createElement('span');
        span.className = colorClass;
        this.elements.dialogueText.appendChild(span);

        // Type each character with sound
        for (let i = 0; i < item.text.length; i++) {
            const char = item.text[i];
            span.textContent += char;
            if (/[a-zA-Z]/.test(char)) {
                animalese.playLetter(char, false);
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Add strikethrough after a pause if specified
        if (item.strikethrough) {
            await new Promise(resolve => setTimeout(resolve, 400));
            span.classList.add('strikethrough');
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
