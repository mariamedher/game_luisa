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
