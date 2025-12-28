// ============================================
// FLOATING PULSING TEXT EFFECT
// Creates words that pulse in and out around the screen
// ============================================

// Container for floating text (created once)
let floatingTextContainer = null;

/**
 * Creates floating words that pulse in and out around the screen
 * @param {string|string[]} words - Single word, space-separated string, or array of words
 * @param {Object} options - Configuration options
 * @param {string} options.variant - 'normal', 'negative', or 'positive' for color styling
 * @param {number} options.interval - Time between word appearances in ms (default: 800)
 * @param {number} options.duration - How long each word animation lasts in ms (default: 3000)
 * @param {boolean} options.loop - Whether to keep looping words (default: false)
 * @param {number} options.minSize - Minimum font size in rem (default: 1)
 * @param {number} options.maxSize - Maximum font size in rem (default: 2.5)
 * @param {number} options.minOpacity - Minimum target opacity (default: 0.2)
 * @param {number} options.maxOpacity - Maximum target opacity (default: 0.5)
 * @returns {Object} Controller with stop() method to cancel the effect
 */
function createFloatingText(words, options = {}) {
    const {
        variant = 'normal',
        interval = 800,
        duration = 3000,
        loop = false,
        minSize = 1,
        maxSize = 2.5,
        minOpacity = 0.2,
        maxOpacity = 0.5
    } = options;

    // Normalize words to array
    const wordList = Array.isArray(words) ? words : words.split(' ').filter(w => w.trim());

    // Create container if it doesn't exist
    if (!floatingTextContainer) {
        floatingTextContainer = document.createElement('div');
        floatingTextContainer.className = 'floating-text-container';
        document.body.appendChild(floatingTextContainer);
    }

    let wordIndex = 0;
    let intervalId = null;
    let isRunning = true;

    function spawnWord() {
        if (!isRunning) return;

        const word = wordList[wordIndex];
        wordIndex++;

        // Check if we've gone through all words
        if (wordIndex >= wordList.length) {
            if (loop) {
                wordIndex = 0;
            } else {
                clearInterval(intervalId);
                return;
            }
        }

        // Create word element
        const wordEl = document.createElement('span');
        wordEl.className = 'floating-word';
        if (variant !== 'normal') {
            wordEl.classList.add(variant);
        }
        wordEl.textContent = word;

        // Random position - favor edges of screen
        // Either left side (0-25%) or right side (75-100%), and full height range
        const side = Math.random() > 0.5;
        const x = side ? (2 + Math.random() * 23) : (75 + Math.random() * 23); // 2-25% or 75-98%
        const y = 5 + Math.random() * 90; // 5-95% of screen height
        wordEl.style.left = `${x}%`;
        wordEl.style.top = `${y}%`;

        // Random size
        const size = minSize + Math.random() * (maxSize - minSize);
        wordEl.style.fontSize = `${size}rem`;

        // Random opacity (set as CSS variable for animation)
        const opacity = minOpacity + Math.random() * (maxOpacity - minOpacity);
        wordEl.style.setProperty('--target-opacity', opacity);

        // Set animation duration
        wordEl.style.animationDuration = `${duration}ms`;

        floatingTextContainer.appendChild(wordEl);

        // Remove after animation completes
        setTimeout(() => {
            if (wordEl.parentNode) {
                wordEl.parentNode.removeChild(wordEl);
            }
        }, duration + 100);
    }

    // Start spawning words
    spawnWord(); // Spawn first immediately
    intervalId = setInterval(spawnWord, interval);

    // Return controller
    return {
        stop: function() {
            isRunning = false;
            clearInterval(intervalId);
        },
        clear: function() {
            isRunning = false;
            clearInterval(intervalId);
            if (floatingTextContainer) {
                // Fade out all remaining words smoothly
                const words = floatingTextContainer.querySelectorAll('.floating-word');
                words.forEach(word => {
                    word.style.transition = 'opacity 1s ease';
                    word.style.opacity = '0';
                });
                // Remove after fade completes
                setTimeout(() => {
                    if (floatingTextContainer) {
                        floatingTextContainer.innerHTML = '';
                    }
                }, 1000);
            }
        }
    };
}

/**
 * Transforms floating words from negative to positive
 * Shows negative words first, then transitions to positive words
 * @param {string[]} negativeWords - Array of negative/fear words
 * @param {string[]} positiveWords - Array of positive/affirming words
 * @param {number} transitionDelay - Time before switching to positive words in ms
 */
function transformFloatingText(negativeWords, positiveWords, transitionDelay = 5000) {
    // Start with negative words
    const negativeController = createFloatingText(negativeWords, {
        variant: 'negative',
        interval: 600,
        loop: true,
        minOpacity: 0.3,
        maxOpacity: 0.6
    });

    // After delay, stop negative and start positive
    setTimeout(() => {
        negativeController.clear();

        createFloatingText(positiveWords, {
            variant: 'positive',
            interval: 700,
            loop: true,
            minOpacity: 0.3,
            maxOpacity: 0.6
        });
    }, transitionDelay);
}
