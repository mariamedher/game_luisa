// ============================================
// MENU SCREEN - MOL IDLE DIALOGUE SYSTEM
// ============================================

class MenuScreen {
    constructor() {
        // Reference constants from constants.js
        this.idleDialogues = MOL.IDLE_DIALOGUES;
        this.coffeeReactions = MOL.COFFEE_REACTIONS;
        this.coffeeLineIndices = MOL.COFFEE_LINE_INDICES;
        this.specialMolSprites = MOL.SPECIAL_SPRITES;

        // State references (synced with gameState)
        // Note: The actual timer/timeout values are stored in gameState for compatibility
    }

    areAllWitnessesInterviewed() {
        return DIALOGUES.witnessReports && DIALOGUES.witnessReports.witnesses && gameState.completedWitnesses.length >= DIALOGUES.witnessReports.witnesses.length;
    }

    isCoffeeLine(index) {
        return this.coffeeLineIndices.includes(index);
    }

    getRandomIdleDialogue() {
        // Get a random dialogue different from the last one
        // If coffee cooldown is active, skip coffee lines
        let newIndex;
        let attempts = 0;
        do {
            newIndex = Math.floor(Math.random() * this.idleDialogues.length);
            attempts++;
            // Avoid infinite loop - after 20 attempts, accept any non-repeat
            if (attempts > 20) break;
        } while (
            (newIndex === gameState.idleDialogueIndex && this.idleDialogues.length > 1) ||
            (gameState.coffeeCooldown > 0 && this.isCoffeeLine(newIndex))
        );

        gameState.idleDialogueIndex = newIndex;

        // Decrement cooldown if active
        if (gameState.coffeeCooldown > 0) {
            gameState.coffeeCooldown--;
        }

        return this.idleDialogues[newIndex];
    }

    showIdleDialogue() {
        // Clear any existing timeout first to prevent overlaps
        if (gameState.idleHideTimeout) {
            clearTimeout(gameState.idleHideTimeout);
            gameState.idleHideTimeout = null;
        }

        // Reset to normal Mol sprite when new dialogue appears (unless we're showing a special sprite)
        if (gameState.molIsHappy) {
            gameState.molIsHappy = false;
            elements.menuMol.src = 'images/Mol.png';
        }

        const dialogue = this.getRandomIdleDialogue();
        elements.molIdleText.textContent = dialogue;

        // Show coffee button if it's a coffee line - coffee sprite takes priority
        if (this.isCoffeeLine(gameState.idleDialogueIndex)) {
            elements.giveCoffeeBtn.classList.add('visible');
            // Reset to normal Mol for coffee lines (coffee sprite will be used when clicked)
            elements.menuMol.src = 'images/Mol.png';
        } else {
            elements.giveCoffeeBtn.classList.remove('visible');
            // If all witnesses interviewed, randomly show a special sprite (50% chance)
            if (this.areAllWitnessesInterviewed() && Math.random() < 0.5) {
                const randomSprite = this.specialMolSprites[Math.floor(Math.random() * this.specialMolSprites.length)];
                elements.menuMol.src = `images/${randomSprite}`;
            } else {
                elements.menuMol.src = 'images/Mol.png';
            }
        }

        elements.molSpeechBubble.classList.add('visible');

        // Hide after delay (8 seconds for coffee lines to give time to click, 6 for others)
        const hideDelay = this.isCoffeeLine(gameState.idleDialogueIndex) ? 8000 : 6000;
        gameState.idleHideTimeout = setTimeout(() => {
            if (gameState.currentScreen === 'menu-screen') {
                elements.molSpeechBubble.classList.remove('visible');
                elements.giveCoffeeBtn.classList.remove('visible');
            }
        }, hideDelay);
    }

    giveCoffee() {
        // Clear the hide timeout so the reaction stays visible
        if (gameState.idleHideTimeout) {
            clearTimeout(gameState.idleHideTimeout);
        }

        // Clear and reset the idle dialogue timer for extended pause
        if (gameState.idleDialogueTimer) {
            clearInterval(gameState.idleDialogueTimer);
        }

        // Play sparkle sound, then slurp after a short delay
        audioManager.playSfx('sparkle');
        setTimeout(() => {
            audioManager.playSfx('slurp');
        }, 400);

        // Switch to happy Mol sprite
        gameState.molIsHappy = true;
        elements.menuMol.src = 'images/Mol_happy_coffee.png';

        // Set coffee cooldown (skip coffee lines for next 2 dialogues)
        gameState.coffeeCooldown = 2;

        // Pick a random coffee reaction
        const reaction = this.coffeeReactions[Math.floor(Math.random() * this.coffeeReactions.length)];
        elements.molIdleText.textContent = reaction;
        elements.giveCoffeeBtn.classList.remove('visible');

        // Hide bubble after showing reaction (10 seconds to read)
        gameState.idleHideTimeout = setTimeout(() => {
            if (gameState.currentScreen === 'menu-screen') {
                elements.molSpeechBubble.classList.remove('visible');
            }
        }, 10000);

        // Restart idle dialogue timer with extended delay (20 seconds before next dialogue)
        setTimeout(() => {
            if (gameState.currentScreen === 'menu-screen') {
                gameState.idleDialogueTimer = setInterval(() => {
                    if (gameState.currentScreen === 'menu-screen') {
                        this.showIdleDialogue();
                    }
                }, 15000);
            }
        }, 20000);
    }

    start() {
        // Start idle dialogue when menu screen is shown
        this.startIdleDialogue();
    }

    startIdleDialogue() {
        // Show first dialogue after a short delay
        setTimeout(() => {
            if (gameState.currentScreen === 'menu-screen') {
                this.showIdleDialogue();
            }
        }, 2000);

        // Then show a new one every 15 seconds
        gameState.idleDialogueTimer = setInterval(() => {
            if (gameState.currentScreen === 'menu-screen') {
                this.showIdleDialogue();
            }
        }, 15000);
    }

    stop() {
        // Stop idle dialogue when leaving menu screen
        this.stopIdleDialogue();
    }

    stopIdleDialogue() {
        if (gameState.idleDialogueTimer) {
            clearInterval(gameState.idleDialogueTimer);
            gameState.idleDialogueTimer = null;
        }
        if (gameState.idleHideTimeout) {
            clearTimeout(gameState.idleHideTimeout);
            gameState.idleHideTimeout = null;
        }
        elements.molSpeechBubble.classList.remove('visible');
        elements.giveCoffeeBtn.classList.remove('visible');
        // Reset Mol sprite when leaving menu
        if (gameState.molIsHappy) {
            gameState.molIsHappy = false;
            elements.menuMol.src = 'images/Mol.png';
        }
    }
}

// Create global instance
const menuScreen = new MenuScreen();
