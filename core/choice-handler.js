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
