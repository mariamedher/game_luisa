// ============================================
// GAME STATE AND CONFIGURATION
// ============================================
const gameState = {
    playerName: '',
    currentScreen: 'start',
    dialogueIndex: 0,
    isTyping: false,
    waitingForInput: false,
    skipTyping: false,
    leadsIndex: 0,
    leadsComplete: false,
    collectedLeads: [],
    idleDialogueTimer: null,
    idleDialogueIndex: -1,
    idleHideTimeout: null,
    // Coffee system state
    coffeeCooldown: 0,  // Number of dialogues to skip coffee lines
    molIsHappy: false,  // Whether Mol is showing happy sprite
    // Physical Evidence state
    evidenceIntroComplete: false,
    evidenceIntroIndex: 0,
    completedEvidence: [],
    currentEvidence: null,
    evidenceDialogueIndex: 0,
    evidenceChoiceResponse: null,
    evidenceMolSprite: null,  // Track special Mol sprite in evidence screen
    // Witness Reports state
    witnessIntroComplete: false,
    witnessIntroIndex: 0,
    completedWitnesses: [],
    currentWitness: null,
    witnessDialogueIndex: 0,
    currentWitnessMusic: null,  // Track which witness music is playing
    processingChoice: false,  // Flag to prevent double-advancing during choice responses
    // Identify Suspect state
    identifyDialogueIndex: 0,
    identifyPhase: 'intro',  // 'intro', 'grid', 'afterEvidence', 'fears', 'complete'
    revealedEvidence: [],    // Track which evidence items have been revealed
    currentIdentifyEvidence: null,  // Currently selected evidence item
    identifyEvidenceDialogueIndex: 0,
    // Fear sequence state
    fearIntroIndex: 0,
    fearClusterIndex: 0,
    fearDialogueIndex: 0,
    crossingEnabled: false,
    crossedClusters: 0,
    additionalClusterIndex: 0,
    fearConclusionIndex: 0,
    activeClusterIndex: 0,  // Which cluster is currently active for crossing out
    clusterDialogueStarted: false,  // Whether we've started the dialogue for current cluster
    depressionLevel: 0,  // 0 = normal, 1-4 = depression stages
    floatingFearsController: null,  // Controller for floating fear words
    // Dreams sequence state
    revealedDreams: [],  // Track which dreams have been clicked
    dreamsConclusionIndex: 0,
    // Finale state
    finaleFloatingController: null,
    finaleDialogueIndex: 0,
    wrongAnswerCount: 0
};

const animalese = new AnimaleseEngine();
const audioManager = new AudioManager();
const choiceHandler = new ChoiceHandler(audioManager);


// Dialogue sequences - loaded from dialogues.js
const dialogueSequence = DIALOGUES.intro;
const leadsSequence = DIALOGUES.leads;
const evidenceData = DIALOGUES.physicalEvidence;

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    startScreen: document.getElementById('start-screen'),
    dialogueScreen: document.getElementById('dialogue-screen'),
    titleScreen: document.getElementById('title-screen'),
    menuScreen: document.getElementById('menu-screen'),
    endScreen: document.getElementById('end-screen'),
    startBtn: document.getElementById('start-btn'),
    dialogueBox: document.getElementById('dialogue-box'),
    dialogueText: document.getElementById('dialogue-text'),
    nameInputContainer: document.getElementById('name-input-container'),
    nameInput: document.getElementById('name-input'),
    submitNameBtn: document.getElementById('submit-name-btn'),
    confirmationContainer: document.getElementById('confirmation-container'),
    confirmText: document.getElementById('confirm-text'),
    yesBtn: document.getElementById('yes-btn'),
    noBtn: document.getElementById('no-btn'),
    actionContainer: document.getElementById('action-container'),
    actionBtn: document.getElementById('action-btn'),
    titleContinueBtn: document.getElementById('title-continue-btn'),
    exitBtn: document.getElementById('exit-btn'),
    bgm: document.getElementById('bgm'),
    sfxClick: document.getElementById('sfx-click'),
    sfxPapers: document.getElementById('sfx-papers'),
    sfxDice: document.getElementById('sfx-dice'),
    sfxHarp: document.getElementById('sfx-harp'),
    sfxMunch: document.getElementById('sfx-munch'),
    sfxClack: document.getElementById('sfx-clack'),
    sfxSparkle: document.getElementById('sfx-sparkle'),
    sfxSurprise: document.getElementById('sfx-surprise'),
    sfxSlurp: document.getElementById('sfx-slurp'),
    sfxAlien: document.getElementById('sfx-alien'),
    sfxSpaceship: document.getElementById('sfx-spaceship'),
    menuMol: document.querySelector('.menu-mol'),
    gameContainer: document.getElementById('game-container'),
    enterHint: document.getElementById('enter-hint'),
    // Leads elements
    leadsScreen: document.getElementById('leads-screen'),
    leadsBtn: document.getElementById('leads-btn'),
    leadsDialogueText: document.getElementById('leads-dialogue-text'),
    leadsEnterHint: document.getElementById('leads-enter-hint'),
    leadsChoices: document.getElementById('leads-choices'),
    leadsContinueBtn: document.getElementById('leads-continue-btn'),
    backToMenuBtn: document.getElementById('back-to-menu-btn'),
    overlayImage: document.getElementById('overlay-image'),
    persistentLeads: document.getElementById('persistent-leads'),
    leadsList: document.getElementById('leads-list'),
    // Idle dialogue elements
    molSpeechBubble: document.getElementById('mol-speech-bubble'),
    molIdleText: document.getElementById('mol-idle-text'),
    giveCoffeeBtn: document.getElementById('give-coffee-btn'),
    // Physical Evidence elements
    evidenceScreen: document.getElementById('evidence-screen'),
    evidenceGrid: document.getElementById('evidence-grid'),
    evidenceDialogueText: document.getElementById('evidence-dialogue-text'),
    evidenceEnterHint: document.getElementById('evidence-enter-hint'),
    evidenceChoices: document.getElementById('evidence-choices'),
    evidenceContinueBtn: document.getElementById('evidence-continue-btn'),
    evidenceBackBtn: document.getElementById('evidence-back-btn'),
    evidenceMol: document.getElementById('evidence-mol'),
    // Witness Reports elements
    witnessScreen: document.getElementById('witness-screen'),
    witnessBtn: document.getElementById('witness-btn'),
    witnessList: document.getElementById('witness-list'),
    witnessImage: document.getElementById('witness-image'),
    witnessDialogueText: document.getElementById('witness-dialogue-text'),
    witnessEnterHint: document.getElementById('witness-enter-hint'),
    witnessChoices: document.getElementById('witness-choices'),
    witnessContinueBtn: document.getElementById('witness-continue-btn'),
    witnessBackBtn: document.getElementById('witness-back-btn'),
    witnessMol: document.getElementById('witness-mol'),
    // Witness audio elements
    sfxSqueak: document.getElementById('sfx-squeak'),
    sfxHelicopter: document.getElementById('sfx-helicopter'),
    bgmCait: document.getElementById('bgm-cait'),
    bgmGlorp: document.getElementById('bgm-glorp'),
    bgmCouple: document.getElementById('bgm-couple'),
    // Identify Suspect elements
    identifySuspectBtn: document.getElementById('identify-suspect-btn'),
    identifyScreen: document.getElementById('identify-screen'),
    identifyPortrait: document.getElementById('identify-portrait'),
    identifyLuisa: document.getElementById('identify-luisa'),
    identifyCharacters: document.getElementById('identify-characters'),
    identifyDialogueBox: document.getElementById('identify-dialogue-box'),
    identifyDialogueText: document.getElementById('identify-dialogue-text'),
    identifyEnterHint: document.getElementById('identify-enter-hint'),
    identifyChoices: document.getElementById('identify-choices'),
    identifyContinueBtn: document.getElementById('identify-continue-btn'),
    identifyGrid: document.getElementById('identify-grid'),
    identifyArea: document.getElementById('identify-area'),
    identifyActions: document.getElementById('identify-actions'),
    fearWordsContainer: document.getElementById('fear-words-container'),
    dreamsContainer: document.getElementById('dreams-container'),
    bgmFinal: document.getElementById('bgm-final'),
    // Finale elements
    finaleInputContainer: document.getElementById('finale-input-container'),
    finaleNameInput: document.getElementById('finale-name-input'),
    finaleSubmitBtn: document.getElementById('finale-submit-btn'),
    finaleCharacters: document.getElementById('finale-characters'),
    finaleMol: document.getElementById('finale-mol'),
    finaleWho: document.getElementById('finale-who'),
    finaleDialogueBox: document.getElementById('finale-dialogue-box'),
    finaleDialogueText: document.getElementById('finale-dialogue-text'),
    fadeOverlay: document.getElementById('fade-overlay'),
    fadeOverlayText: document.getElementById('fade-overlay-text')
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function playClickSound() {
    audioManager.playSfx('click');
}

function showScreen(screenId) {
    // Stop idle dialogue when leaving menu
    if (gameState.currentScreen === 'menu-screen' && screenId !== 'menu-screen') {
        menuScreen.stop();
    }

    // Stop any ongoing typing/animalese when switching screens
    gameState.skipTyping = true;
    gameState.isTyping = false;
    gameState.waitingForInput = false;

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;

    // Start idle dialogue when entering menu
    if (screenId === 'menu-screen') {
        menuScreen.start();
        updateIdentifySuspectButton();
    }
}

function hideInputs(screen = gameState.currentScreen) {
    // Define what to hide for each screen
    const hideActions = {
        'dialogue-screen': () => {
            elements.nameInputContainer.style.display = 'none';
            elements.confirmationContainer.style.display = 'none';
            elements.actionContainer.style.display = 'none';
            elements.enterHint.style.display = 'none';
        },
        'leads-screen': () => {
            elements.leadsEnterHint.style.display = 'none';
            elements.leadsChoices.style.display = 'none';
            elements.leadsContinueBtn.style.display = 'none';
        },
        'evidence-screen': () => {
            elements.evidenceEnterHint.style.display = 'none';
            elements.evidenceChoices.style.display = 'none';
            elements.evidenceContinueBtn.style.display = 'none';
        },
        'witness-screen': () => {
            elements.witnessEnterHint.style.display = 'none';
            elements.witnessChoices.style.display = 'none';
            elements.witnessContinueBtn.style.display = 'none';
        },
        'identify-screen': () => {
            elements.identifyEnterHint.style.display = 'none';
            elements.identifyChoices.style.display = 'none';
            elements.identifyContinueBtn.style.display = 'none';
        }
    };

    const action = hideActions[screen];
    if (action) action();
}

// Check if all leads have been collected and enable the Identify Suspect button
function updateIdentifySuspectButton() {
    const allLeadsComplete = gameState.leadsComplete;
    const allEvidenceComplete = gameState.completedEvidence.length >= evidenceData.items.length;
    const allWitnessesComplete = gameState.completedWitnesses.length >= witnessData.witnesses.length;

    const canIdentify = allLeadsComplete && allEvidenceComplete && allWitnessesComplete;

    if (elements.identifySuspectBtn) {
        elements.identifySuspectBtn.disabled = !canIdentify;
    }
}

function playSfx(soundName) {
    // Special handling for munch (pretzel sprite)
    if (soundName === 'munch' && elements.evidenceMol) {
        audioManager.playSfx('sparkle');
        audioManager.playSfx('munch');
        elements.evidenceMol.src = 'images/Mol_pretzel.png';
        gameState.evidenceMolSprite = 'pretzel';
    } else {
        audioManager.playSfx(soundName);
    }
}

function isTextLoud(text) {
    // Check if text is all caps (excluding punctuation/spaces) or contains !
    const letters = text.replace(/[^a-zA-Z]/g, '');
    const isAllCaps = letters.length > 0 && letters === letters.toUpperCase();
    const hasExclamation = text.includes('!');
    // Also check for sequences of 3+ capital letters (like "SEXY LEGS")
    const hasCapsWords = /[A-Z]{3,}/.test(text);
    return isAllCaps || hasExclamation || hasCapsWords;
}

// ============================================
// MOL IDLE DIALOGUE SYSTEM
// ============================================
// NOTE: Menu screen logic has been moved to screens/menu-screen.js

// ============================================
// TYPEWRITER EFFECT WITH ANIMALESE
// ============================================
// Options: { loud, target, speaker, pitch }
// - speaker: 'mol', 'cait', 'goblin', 'couple' - adds CSS class for color
// - pitch: 'normal', 'high', 'low', 'veryHigh' - changes animalese pitch
async function typeText(text, isLoudOrOptions = false, targetElement = null) {
    gameState.isTyping = true;
    gameState.skipTyping = false;

    // Handle both old API (isLoud, targetElement) and new options API
    let isLoud = false;
    let target = elements.dialogueText;
    let speaker = null;
    let pitch = 'normal';

    if (typeof isLoudOrOptions === 'object' && isLoudOrOptions !== null) {
        // New options API
        isLoud = isLoudOrOptions.loud || false;
        target = isLoudOrOptions.target || elements.dialogueText;
        speaker = isLoudOrOptions.speaker || null;
        pitch = isLoudOrOptions.pitch || 'normal';
    } else {
        // Old API - backwards compatible
        isLoud = isLoudOrOptions;
        target = targetElement || elements.dialogueText;
    }

    target.innerHTML = '';

    // If loud:true is explicitly set, always use it; otherwise check text
    const autoLoud = isLoud || isTextLoud(text);

    // Apply flash and shake effect for loud dialogue
    if (isLoud) {
        document.body.classList.add('flash');
        // Shake the dialogue box container (parent of target)
        const dialogueBox = target.parentElement || target;
        dialogueBox.classList.add('shake');
        setTimeout(() => {
            document.body.classList.remove('flash');
            dialogueBox.classList.remove('shake');
        }, 500);
    }

    let insideAsterisk = false; // Track if we're inside *action text*

    for (let i = 0; i < text.length; i++) {
        if (gameState.skipTyping) break;

        const char = text[i];

        // Toggle asterisk mode (for *action* text - no sound)
        if (char === '*') {
            insideAsterisk = !insideAsterisk;
        }

        // Create span for styling
        const span = document.createElement('span');
        span.textContent = char;
        if (autoLoud) {
            span.classList.add('text-loud');
        }
        if (insideAsterisk || char === '*') {
            span.classList.add('text-action');
        }
        // Add speaker-specific color class
        if (speaker && speaker !== 'mol') {
            span.classList.add(`speaker-${speaker}`);
        }
        target.appendChild(span);

        // Play animalese sound for letters (only if not skipping and not in *action* text)
        if (/[a-zA-Z]/.test(char) && !gameState.skipTyping && !insideAsterisk) {
            animalese.playLetter(char, autoLoud, pitch);
        }

        // Variable delay
        let delay = 50;
        if (char === '.' || char === '!' || char === '?') delay = 300;
        else if (char === ',') delay = 150;
        else if (char === '…' || char === '—') delay = 200;

        await new Promise(resolve => setTimeout(resolve, delay));
    }

    gameState.isTyping = false;
}

// Silent typing effect for leads list
async function typeSilent(text, targetElement) {
    for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.textContent = text[i];
        targetElement.appendChild(span);
        await new Promise(resolve => setTimeout(resolve, 30));
    }
}

// ============================================
// DIALOGUE HANDLING
// ============================================
// NOTE: These functions have been moved to screens/intro-screen.js

// ============================================
// LEADS HANDLING
// ============================================
// NOTE: Most functions have been moved to screens/leads-screen.js
// addLeadToList is still used by evidence and witness screens

function playPapersSound() {
    audioManager.playSfx('papers');
}
async function addLeadToList(leadText) {
    const li = document.createElement('li');
    elements.leadsList.appendChild(li);
    await typeSilent(leadText, li);
    if (!gameState.collectedLeads.includes(leadText)) {
        gameState.collectedLeads.push(leadText);
    }
}

// The following functions have been moved to screens/leads-screen.js:

// ============================================
// PHYSICAL EVIDENCE HANDLING
// ============================================
// NOTE: These functions have been moved to screens/evidence-screen.js
// Kept here for reference during refactoring

function updateManuscriptLead() {
    // Update manuscript lead text when returning to menu
    const manuscript = evidenceData.items.find(e => e.id === 'manuscript');
    if (manuscript && manuscript._needsUpdate && gameState.completedEvidence.includes('manuscript')) {
        const listItems = elements.leadsList.querySelectorAll('li');
        listItems.forEach(li => {
            if (li.textContent === manuscript.leadText) {
                li.textContent = manuscript.leadTextAfter;
            }
        });
        manuscript._needsUpdate = false;
    }
}

// ============================================
// WITNESS REPORTS HANDLING
// ============================================
// NOTE: These functions have been moved to screens/witness-screen.js
// Kept here for reference during refactoring

// ============================================
// IDENTIFY SUSPECT SECTION
// ============================================
// NOTE: These functions have been moved to screens/identify-screen.js
// Kept here for reference during refactoring

// ============================================
// EVENT LISTENERS
// ============================================

// Start button
elements.startBtn.addEventListener('click', () => {
    playClickSound();
    animalese.init();

    // Register all tracks and SFX
    audioManager.registerTrack('bgm', elements.bgm, 0.3);
    audioManager.registerTrack('bgm-cait', elements.bgmCait, 0.3);
    audioManager.registerTrack('bgm-glorp', elements.bgmGlorp, 0.3);
    audioManager.registerTrack('bgm-couple', elements.bgmCouple, 0.3);
    audioManager.registerTrack('bgm-final', elements.bgmFinal, 0.3);

    audioManager.registerSfx('click', elements.sfxClick);
    audioManager.registerSfx('papers', elements.sfxPapers);
    audioManager.registerSfx('dice', elements.sfxDice);
    audioManager.registerSfx('harp', elements.sfxHarp);
    audioManager.registerSfx('munch', elements.sfxMunch);
    audioManager.registerSfx('clack', elements.sfxClack);
    audioManager.registerSfx('sparkle', elements.sfxSparkle);
    audioManager.registerSfx('surprise', elements.sfxSurprise);
    audioManager.registerSfx('squeak', elements.sfxSqueak);
    audioManager.registerSfx('helicopter', elements.sfxHelicopter);
    audioManager.registerSfx('snap', document.getElementById('sfx-snap'));
    audioManager.registerSfx('slurp', elements.sfxSlurp);
    audioManager.registerSfx('alien', elements.sfxAlien);
    audioManager.registerSfx('spaceship', elements.sfxSpaceship);

    // Start main music
    audioManager.playTrack('bgm');

    showScreen('dialogue-screen');
    introScreen.start();
});

// Name submission
elements.submitNameBtn.addEventListener('click', () => {
    introScreen.handleNameSubmit();
});

elements.nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        elements.submitNameBtn.click();
    }
});

// Finale name input
elements.finaleSubmitBtn.addEventListener('click', () => {
    identifyScreen.handleFinaleSubmit();
});

elements.finaleNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        identifyScreen.handleFinaleSubmit();
    }
});

// Yes/No confirmation
elements.yesBtn.addEventListener('click', () => {
    introScreen.handleYesConfirmation();
});

elements.noBtn.addEventListener('click', () => {
    introScreen.handleNoConfirmation();
});

// Action button (Continue, I am ready, etc.)
elements.actionBtn.addEventListener('click', () => {
    introScreen.handleActionButton();
});

// Title screen continue
elements.titleContinueBtn.addEventListener('click', () => {
    playClickSound();
    showScreen('menu-screen');
});

// Menu buttons - add click sound to all
document.querySelectorAll('#menu-screen .btn').forEach(btn => {
    btn.addEventListener('click', () => {
        playClickSound();
    });
});

// Leads button
elements.leadsBtn.addEventListener('click', () => {
    leadsScreen.start();
});

// Back to menu button (from leads)
elements.backToMenuBtn.addEventListener('click', () => {
    playClickSound();
    showScreen('menu-screen');
});

// Unified click-to-continue handlers
const clickHandlerMap = {
    'dialogue-screen': { element: elements.dialogueBox, advance: () => introScreen.advance() },
    'leads-screen': { element: document.getElementById('leads-dialogue-box'), advance: () => leadsScreen.advance() },
    'evidence-screen': {
        element: document.getElementById('evidence-dialogue-box'),
        advance: () => {
            evidenceScreen.advance();
        }
    },
    'witness-screen': {
        element: document.getElementById('witness-dialogue-box'),
        advance: () => witnessScreen.advance()
    },
    'identify-screen': {
        element: document.getElementById('identify-dialogue-box'),
        advance: () => identifyScreen.advance()
    }
};

Object.entries(clickHandlerMap).forEach(([screen, config]) => {
    config.element.addEventListener('click', () => {
        if (gameState.currentScreen === screen &&
            gameState.waitingForInput &&
            !gameState.isTyping) {
            config.advance();
        }
    });
});

// Physical Evidence button
document.getElementById('evidence-btn').addEventListener('click', () => {
    evidenceScreen.start();
});

// Evidence back to menu button
elements.evidenceBackBtn.addEventListener('click', () => {
    playClickSound();
    updateManuscriptLead();
    showScreen('menu-screen');
});

// Evidence item click handlers
elements.evidenceGrid.querySelectorAll('.evidence-item').forEach(item => {
    item.addEventListener('click', () => {
        if (!item.disabled) {
            playClickSound();
            evidenceScreen.selectEvidence(item.dataset.evidence);
        }
    });
});

// Give Coffee button
elements.giveCoffeeBtn.addEventListener('click', () => {
    playClickSound();
    menuScreen.giveCoffee();
});

// Witness Reports button
elements.witnessBtn.addEventListener('click', () => {
    witnessScreen.start();
});

// Witness back to menu button
elements.witnessBackBtn.addEventListener('click', () => {
    playClickSound();
    // Stop witness music if playing
    witnessScreen.switchToMainMusic();
    showScreen('menu-screen');
});

// Witness item click handlers
elements.witnessList.querySelectorAll('.witness-item').forEach(item => {
    item.addEventListener('click', () => {
        if (!item.disabled) {
            playClickSound();
            witnessScreen.selectWitness(item.dataset.witness);
        }
    });
});

// Identify Suspect button
elements.identifySuspectBtn.addEventListener('click', () => {
    identifyScreen.start();
});

// Identify grid item click handlers
elements.identifyGrid.querySelectorAll('.identify-item').forEach(item => {
    item.addEventListener('click', () => {
        if (!item.disabled && !item.classList.contains('revealed')) {
            playClickSound();
            identifyScreen.handleItemClick(item.dataset.item);
        }
    });
});

// Exit button
elements.exitBtn.addEventListener('click', () => {
    playClickSound();
    audioManager.pauseCurrent();
    // Hide leads list
    elements.persistentLeads.style.display = 'none';
    showScreen('end-screen');
    document.getElementById('end-message').style.display = 'block';
});

// Play again button
document.getElementById('play-again-btn').addEventListener('click', () => {
    playClickSound();
    // Reset game state
    gameState.playerName = '';
    gameState.dialogueIndex = 0;
    gameState.isTyping = false;
    gameState.waitingForInput = false;
    gameState.skipTyping = false;
    // Reset intro screen
    introScreen.reset();
    // Reset leads screen
    leadsScreen.reset();
    // Reset evidence screen
    evidenceScreen.reset();
    // Reset evidence grid
    elements.evidenceGrid.querySelectorAll('.evidence-item').forEach(item => {
        item.disabled = false;
        item.classList.remove('completed');
    });
    // Reset witness state
    witnessScreen.reset();
    // Reset witness list
    elements.witnessList.querySelectorAll('.witness-item').forEach(item => {
        item.disabled = false;
        item.classList.remove('completed');
    });
    elements.witnessList.style.display = 'flex';
    elements.witnessImage.style.display = 'none';
    // Reset identify screen
    identifyScreen.reset();
    // Stop final music if playing
    audioManager.pauseCurrent();
    if (audioManager.currentTrack) {
        audioManager.currentTrack.element.currentTime = 0;
    }
    elements.dialogueText.innerHTML = '';
    elements.leadsList.innerHTML = '';
    elements.persistentLeads.style.display = 'none';
    hideInputs('dialogue-screen');
    // Go back to start screen
    showScreen('start-screen');
});

// Unified keyboard input handler
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.target.matches('input')) {
        // Map screens to their advance functions
        const screenHandlers = {
            'dialogue-screen': () => introScreen.advance(),
            'leads-screen': () => leadsScreen.advance(false),
            'evidence-screen': () => {
                evidenceScreen.advance(false);
            },
            'witness-screen': () => {
                witnessScreen.advance(false);
            },
            'identify-screen': () => identifyScreen.advance(false)
        };

        const handler = screenHandlers[gameState.currentScreen];
        if (handler) {
            handler();
        }
    }

    // Press Escape to skip dialogue and go to title screen
    if (e.key === 'Escape' && gameState.currentScreen === 'dialogue-screen') {
        gameState.skipTyping = true;
        gameState.isTyping = false;
        gameState.waitingForInput = false;
        hideInputs('dialogue-screen');
        showScreen('title-screen');
    }
});

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
