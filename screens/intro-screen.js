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
            titleScreen.show();
            return;
        }

        const dialogue = this.dialogue[this.state.dialogueIndex];
        hideInputs('dialogue-screen');
        this.state.waitingForInput = false;
        gameState.waitingForInput = false;

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

    handleNameSubmit() {
        audioManager.playSfx('click');
        const name = this.elements.nameInput.value.trim();
        if (name) {
            gameState.playerName = name;
            this.handleNameConfirmation();
        }
    }

    handleYesConfirmation() {
        audioManager.playSfx('click');
        this.state.dialogueIndex++;
        this.processDialogue();
    }

    handleNoConfirmation() {
        audioManager.playSfx('click');
        hideInputs('dialogue-screen');
        this.elements.nameInputContainer.style.display = 'flex';
        this.elements.nameInput.value = '';
        this.elements.nameInput.focus();
    }

    handleActionButton() {
        audioManager.playSfx('click');
        this.state.dialogueIndex++;
        this.processDialogue();
    }

    reset() {
        this.state.dialogueIndex = 0;
        this.state.isTyping = false;
        this.state.waitingForInput = false;
    }
}

// Create global instance
const introScreen = new IntroScreen();
