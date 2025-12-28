// ============================================
// MENU SCREEN - MOL IDLE DIALOGUE SYSTEM
// ============================================

class MenuScreen {
    constructor() {
        // Mol's idle dialogue lines for the menu screen
        this.idleDialogues = [
            // Desperate for coffee
            "My caffeine levels are dropping to critical. This is a tactical emergency.",
            "I would trade three cadets for a double espresso right now. Maybe four.",
            "My hands are shaking. Is it rage? Is it withdrawal? Let's find out.",
            "Do you smell that? It smells like... lack of coffee. Unacceptable.",
            "If a mug appeared in my hand right now, I might promise not to yell for... ten seconds.",
            "I don't sleep, Cadet. I just wait for my next caffeine intake.",
            // Bullying
            "Are you admiring the UI, Cadet? CLICK SOMETHING!",
            "I am aging here. The criminal is getting away while you stare at the buttons!",
            "Is this a staring contest? Because I WILL win. I literally don't blink.",
            "Straighten your back! You look like a swrimp!",
            "Did you polish your mouse cursor? It looks filthy.",
            "Tick tock, maggot. My boot is getting cold. It needs a face to warm it up.",
            // Soft
            "My throat hurts from all the screaming. Do not make me scream again, please.",
            "Sometimes I wonder... is the boot happier than the foot?",
            "Do you feel like coffee? I feel like coffee.",
            "Being a legend is exhausting. You wouldn't understand.",
            "I like coffee. Do you like coffee? We should get coffee sometime.",
            "I suppose you're not entirely useless. You bring me coffee, after all.",
            "If you were a coffee, you'd be full of sugar and cream. Yuck.",
            "I take my coffee black. Just like my soul.",
            "You know, for a cadet, you're not completely terrible.",
            "Sometimes I think you might actually be competent. Then I remember you brought me decaf.",
            "You remind me of my doggie. Loyal, but not very bright.",
            "I could get used to having you around. But don't let it go to your head."
        ];

        // Coffee reaction lines
        this.coffeeReactions = [
            "Hmph. Acceptable. Now get back to work.",
            "Cheers, lovely. You should get a tea, too. ...Don't tell anyone I said that.",
            "FINALLY! Someone with a brain! *siiiip*... Okay, I hate you 5% less now.",
            "What is this? Is it poisoned? ...I don't care, I'm drinking it.",
            "Is this... coffee? You shouldn't have. Actually, no, you should have.",
            "Ahhh, that's the stuff. Now I can yell properly.",
            "For me? Woah, I didn't expect that. Thanks, I guess... Lovely.",
            "You know, you're alright. Maybe I won't yell at you for the next five minutes.",
            "Aahh... that's the suff... I might consider not throwing you out the airlock.",
            "I needed that. Don't think this makes us friends or anything.",
            "I hold this coffee close to my heart. Mostly because it's warm and I am not.",
            "This better be strong. I don't have time for weak coffee or weak cadets."
        ];

        // Coffee-related dialogue indices (0-5 are coffee desperate, 14 is "Do you feel like coffee?")
        this.coffeeLineIndices = [0, 1, 2, 3, 4, 5, 14];

        // Special Mol sprites that unlock after all witnesses are interviewed
        this.specialMolSprites = ['Mol_cait.png', 'Mol_ella.png', 'Mol_ast_less.png'];

        // State references (synced with gameState)
        // Note: The actual timer/timeout values are stored in gameState for compatibility
    }

    areAllWitnessesInterviewed() {
        return witnessData.witnesses && gameState.completedWitnesses.length >= witnessData.witnesses.length;
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
