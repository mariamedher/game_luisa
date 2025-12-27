// ============================================
// ANIMALESE TEXT-TO-SPEECH ENGINE
// Based on animalese.js concept
// ============================================
class AnimaleseEngine {
    constructor() {
        this.audioContext = null;
        this.baseFrequency = 200;
        this.letterDuration = 0.06;
        // Pitch multipliers for different speakers
        this.pitchSettings = {
            'normal': 1.0,      // Mol's normal voice
            'medium': 1.3,      // Astarion - slightly higher
            'high': 1.8,        // Cait (hamster) - squeaky high
            'low': 0.7,         // Raphael - deep voice
            'veryHigh': 2.2,    // Even squeakier
            'alien': 2.0,       // Glorp - high base, distorted
            'luisa': 1.15       // Luisa - slightly higher but softer
        };
        // Special settings for alien voice
        this.alienSettings = {
            baseMultiplier: 2.0,      // High base pitch
            variationRange: 0.15,     // Low variation (flat intonation)
            letterDuration: 0.04,     // Faster syllables
            waveType: 'sawtooth'      // Harsher, more robotic sound
        };
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    getFrequencyForChar(char, isLoud, pitch = 'normal') {
        const pitchMultiplier = this.pitchSettings[pitch] || 1.0;
        const baseFreq = (isLoud ? this.baseFrequency * 1.5 : this.baseFrequency) * pitchMultiplier;
        const charCode = char.toLowerCase().charCodeAt(0);

        // Special handling for alien voice - flatter, less variation
        if (pitch === 'alien') {
            const alienBase = this.baseFrequency * this.alienSettings.baseMultiplier;
            // Very limited variation for flat intonation
            const variation = ((charCode - 97) / 26) * 50 * this.alienSettings.variationRange;
            // Boost upper frequencies for 'ee' timbre
            return alienBase + variation + (Math.random() * 10);
        }

        // Create variation based on character
        if (char >= 'a' && char <= 'z') {
            const variation = ((charCode - 97) / 26) * 150 * pitchMultiplier;
            return baseFreq + variation + (Math.random() * 30 - 15);
        }
        return baseFreq + Math.random() * 50;
    }

    playLetter(char, isLoud = false, pitch = 'normal') {
        if (!this.audioContext) this.init();
        if (!/[a-zA-Z]/.test(char)) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // For alien voice, add a filter to boost upper mids (bright 'ee' timbre)
        if (pitch === 'alien') {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
            filter.Q.setValueAtTime(1, this.audioContext.currentTime);

            oscillator.connect(filter);
            filter.connect(gainNode);
        } else {
            oscillator.connect(gainNode);
        }
        gainNode.connect(this.audioContext.destination);

        const frequency = this.getFrequencyForChar(char, isLoud, pitch);
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Use sawtooth for alien (harsher), square for others
        oscillator.type = pitch === 'alien' ? this.alienSettings.waveType : 'square';

        // Volume - louder for emphasized text, louder for alien
        const volume = isLoud ? 0.18 : (pitch === 'alien' ? 0.14 : 0.08);

        // Duration - faster for alien
        const duration = pitch === 'alien' ? this.alienSettings.letterDuration : this.letterDuration;

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
}

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

// Mol's idle dialogue lines for the menu screen
const MOL_IDLE_DIALOGUES = [
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
const MOL_COFFEE_REACTIONS = [
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
        stopIdleDialogue();
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
        startIdleDialogue();
        updateIdentifySuspectButton();
    }
}

function hideAllInputs() {
    elements.nameInputContainer.style.display = 'none';
    elements.confirmationContainer.style.display = 'none';
    elements.actionContainer.style.display = 'none';
    elements.enterHint.style.display = 'none';
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
// Coffee-related dialogue indices (0-5 are coffee desperate, 14 is "Do you feel like coffee?")
const COFFEE_LINE_INDICES = [0, 1, 2, 3, 4, 5, 14];

// Special Mol sprites that unlock after all witnesses are interviewed
const SPECIAL_MOL_SPRITES = ['Mol_cait.png', 'Mol_ella.png', 'Mol_ast_less.png'];

function areAllWitnessesInterviewed() {
    return witnessData.witnesses && gameState.completedWitnesses.length >= witnessData.witnesses.length;
}

function isCoffeeLine(index) {
    return COFFEE_LINE_INDICES.includes(index);
}

function getRandomIdleDialogue() {
    // Get a random dialogue different from the last one
    // If coffee cooldown is active, skip coffee lines
    let newIndex;
    let attempts = 0;
    do {
        newIndex = Math.floor(Math.random() * MOL_IDLE_DIALOGUES.length);
        attempts++;
        // Avoid infinite loop - after 20 attempts, accept any non-repeat
        if (attempts > 20) break;
    } while (
        (newIndex === gameState.idleDialogueIndex && MOL_IDLE_DIALOGUES.length > 1) ||
        (gameState.coffeeCooldown > 0 && isCoffeeLine(newIndex))
    );

    gameState.idleDialogueIndex = newIndex;

    // Decrement cooldown if active
    if (gameState.coffeeCooldown > 0) {
        gameState.coffeeCooldown--;
    }

    return MOL_IDLE_DIALOGUES[newIndex];
}

function showIdleDialogue() {
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

    const dialogue = getRandomIdleDialogue();
    elements.molIdleText.textContent = dialogue;

    // Show coffee button if it's a coffee line - coffee sprite takes priority
    if (isCoffeeLine(gameState.idleDialogueIndex)) {
        elements.giveCoffeeBtn.classList.add('visible');
        // Reset to normal Mol for coffee lines (coffee sprite will be used when clicked)
        elements.menuMol.src = 'images/Mol.png';
    } else {
        elements.giveCoffeeBtn.classList.remove('visible');
        // If all witnesses interviewed, randomly show a special sprite (50% chance)
        if (areAllWitnessesInterviewed() && Math.random() < 0.5) {
            const randomSprite = SPECIAL_MOL_SPRITES[Math.floor(Math.random() * SPECIAL_MOL_SPRITES.length)];
            elements.menuMol.src = `images/${randomSprite}`;
        } else {
            elements.menuMol.src = 'images/Mol.png';
        }
    }

    elements.molSpeechBubble.classList.add('visible');

    // Hide after delay (8 seconds for coffee lines to give time to click, 6 for others)
    const hideDelay = isCoffeeLine(gameState.idleDialogueIndex) ? 8000 : 6000;
    gameState.idleHideTimeout = setTimeout(() => {
        if (gameState.currentScreen === 'menu-screen') {
            elements.molSpeechBubble.classList.remove('visible');
            elements.giveCoffeeBtn.classList.remove('visible');
        }
    }, hideDelay);
}

function giveCoffee() {
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
    const reaction = MOL_COFFEE_REACTIONS[Math.floor(Math.random() * MOL_COFFEE_REACTIONS.length)];
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
                    showIdleDialogue();
                }
            }, 15000);
        }
    }, 20000);
}

function startIdleDialogue() {
    // Show first dialogue after a short delay
    setTimeout(() => {
        if (gameState.currentScreen === 'menu-screen') {
            showIdleDialogue();
        }
    }, 2000);

    // Then show a new one every 15 seconds
    gameState.idleDialogueTimer = setInterval(() => {
        if (gameState.currentScreen === 'menu-screen') {
            showIdleDialogue();
        }
    }, 15000);
}

function stopIdleDialogue() {
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
async function processDialogue() {
    if (gameState.dialogueIndex >= dialogueSequence.length) {
        // End of dialogue - show title screen
        showScreen('title-screen');
        return;
    }

    const dialogue = dialogueSequence[gameState.dialogueIndex];
    hideAllInputs();
    gameState.waitingForInput = false;

    // Apply effects
    if (dialogue.effect === 'shake_flash') {
        document.body.classList.add('flash');
        elements.dialogueBox.classList.add('shake');
        setTimeout(() => {
            document.body.classList.remove('flash');
            elements.dialogueBox.classList.remove('shake');
        }, 500);
    }

    // Type the text
    await typeText(dialogue.text, dialogue.loud);

    // Handle action
    switch (dialogue.action) {
        case 'wait':
            // Wait for Enter key or click to continue
            gameState.waitingForInput = true;
            elements.enterHint.style.display = 'block';
            break;

        case 'name_input':
            elements.nameInputContainer.style.display = 'flex';
            elements.nameInput.value = '';
            elements.nameInput.focus();
            break;

        case 'continue_button':
            elements.actionContainer.style.display = 'block';
            elements.actionBtn.textContent = dialogue.buttonText || 'Continue';
            break;
    }
}

// Advance dialogue when waiting for input
function advanceDialogue(playSound = true) {
    if (gameState.currentScreen === 'dialogue-screen' &&
        gameState.waitingForInput &&
        !gameState.isTyping) {
        if (playSound) playClickSound();
        gameState.waitingForInput = false;
        gameState.dialogueIndex++;
        processDialogue();
    }
}

async function handleNameConfirmation() {
    hideAllInputs();
    await typeText(`Is your name ${gameState.playerName}?`);
    elements.confirmationContainer.style.display = 'flex';
    elements.confirmText.textContent = '';
}

// ============================================
// LEADS HANDLING
// ============================================
function playPapersSound() {
    audioManager.playSfx('papers');
}

function hideLeadsInputs() {
    elements.leadsEnterHint.style.display = 'none';
    elements.leadsChoices.style.display = 'none';
    elements.leadsContinueBtn.style.display = 'none';
}

async function addLeadToList(leadText) {
    const li = document.createElement('li');
    elements.leadsList.appendChild(li);
    await typeSilent(leadText, li);
    if (!gameState.collectedLeads.includes(leadText)) {
        gameState.collectedLeads.push(leadText);
    }
}

async function showHairChaos() {
    const colors = [
        { text: "Pink", class: "hair-pink", strike: true },
        { text: "Blue", class: "hair-blue", strike: false },
        { text: "Blonde", class: "hair-blonde", strike: false },
        { text: "brown", class: "hair-brown", strike: true },
        { text: "Red??", class: "hair-red", strike: false }
    ];

    elements.leadsDialogueText.innerHTML = '';

    for (const color of colors) {
        const span = document.createElement('span');
        span.className = color.class;
        span.textContent = color.text;
        elements.leadsDialogueText.appendChild(span);

        await new Promise(resolve => setTimeout(resolve, 400));

        if (color.strike) {
            await new Promise(resolve => setTimeout(resolve, 300));
            span.classList.add('strikethrough');
        }

        // Add space
        elements.leadsDialogueText.appendChild(document.createTextNode(' '));
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

async function processLeads() {
    if (gameState.leadsIndex >= leadsSequence.length) {
        return;
    }

    const item = leadsSequence[gameState.leadsIndex];
    hideLeadsInputs();
    gameState.waitingForInput = false;

    switch (item.action) {
        case 'wait':
            // Apply effects BEFORE typing (same as intro dialogue)
            if (item.effect === 'shake_flash') {
                document.body.classList.add('flash');
                document.getElementById('leads-dialogue-box').classList.add('shake');
                setTimeout(() => {
                    document.body.classList.remove('flash');
                    document.getElementById('leads-dialogue-box').classList.remove('shake');
                }, 500);
            }
            await typeText(item.text, item.loud, elements.leadsDialogueText);
            gameState.waitingForInput = true;
            elements.leadsEnterHint.style.display = 'block';
            break;

        case 'add_lead':
            await addLeadToList(item.lead);
            gameState.leadsIndex++;
            processLeads();
            break;

        case 'hair_chaos':
            await showHairChaos();
            gameState.waitingForInput = true;
            elements.leadsEnterHint.style.display = 'block';
            break;

        case 'colored_text':
            // Type colored text with animalese sound
            elements.leadsDialogueText.innerHTML = '';
            const colorClass = 'hair-' + item.color;
            const span = document.createElement('span');
            span.className = colorClass;
            elements.leadsDialogueText.appendChild(span);

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

            gameState.waitingForInput = true;
            elements.leadsEnterHint.style.display = 'block';
            break;

        case 'show_kola':
            playPapersSound();
            elements.overlayImage.src = 'images/Kola.png';
            elements.overlayImage.style.display = 'block';
            gameState.leadsIndex++;
            processLeads();
            break;

        case 'hide_kola':
            playPapersSound();
            elements.overlayImage.style.display = 'none';
            gameState.leadsIndex++;
            processLeads();
            break;

        case 'choice':
            elements.leadsChoices.innerHTML = '';
            elements.leadsChoices.style.display = 'flex';

            item.choices.forEach((choiceText, index) => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = choiceText;
                btn.addEventListener('click', async () => {
                    playClickSound();
                    hideLeadsInputs();

                    const response = item.responses[index];
                    if (Array.isArray(response)) {
                        // Multiple responses
                        for (let i = 0; i < response.length; i++) {
                            await typeText(response[i], false, elements.leadsDialogueText);
                            if (i < response.length - 1) {
                                gameState.waitingForInput = true;
                                elements.leadsEnterHint.style.display = 'block';
                                await new Promise(resolve => {
                                    const handler = () => {
                                        if (gameState.waitingForInput) {
                                            gameState.waitingForInput = false;
                                            elements.leadsEnterHint.style.display = 'none';
                                            resolve();
                                        }
                                    };
                                    document.addEventListener('keydown', function onKey(e) {
                                        if (e.key === 'Enter') {
                                            document.removeEventListener('keydown', onKey);
                                            handler();
                                        }
                                    });
                                    elements.leadsDialogueText.parentElement.addEventListener('click', function onClick() {
                                        elements.leadsDialogueText.parentElement.removeEventListener('click', onClick);
                                        handler();
                                    }, { once: true });
                                });
                            }
                        }
                    } else {
                        await typeText(response, false, elements.leadsDialogueText);
                    }

                    // Show continue button if specified
                    if (item.buttonText) {
                        elements.leadsContinueBtn.textContent = item.buttonText[index] || 'Continue';
                        elements.leadsContinueBtn.style.display = 'block';
                        elements.leadsContinueBtn.onclick = () => {
                            playClickSound();
                            gameState.leadsIndex++;
                            processLeads();
                        };
                    } else {
                        gameState.waitingForInput = true;
                        elements.leadsEnterHint.style.display = 'block';
                    }
                });
                elements.leadsChoices.appendChild(btn);
            });
            break;

        case 'end_leads':
            await typeText(item.text || "That's all for now.", false, elements.leadsDialogueText);
            gameState.leadsComplete = true;
            elements.leadsContinueBtn.textContent = 'Back to Menu';
            elements.leadsContinueBtn.style.display = 'block';
            elements.leadsContinueBtn.onclick = () => {
                playClickSound();
                showScreen('menu-screen');
            };
            break;
    }
}

function advanceLeads(playSound = true) {
    if (gameState.currentScreen === 'leads-screen' &&
        gameState.waitingForInput &&
        !gameState.isTyping) {
        if (playSound) playClickSound();
        gameState.waitingForInput = false;
        gameState.leadsIndex++;
        processLeads();
    }
}

function startLeads() {
    playPapersSound();
    showScreen('leads-screen');
    elements.persistentLeads.style.display = 'block';

    // If already completed, just show the end state
    if (gameState.leadsComplete) {
        elements.leadsDialogueText.innerHTML = "You've already reviewed the leads.";
        elements.leadsContinueBtn.textContent = 'Back to Menu';
        elements.leadsContinueBtn.style.display = 'block';
        elements.leadsContinueBtn.onclick = () => {
            playClickSound();
            showScreen('menu-screen');
        };
    } else {
        gameState.leadsIndex = 0;
        processLeads();
    }
}

// ============================================
// PHYSICAL EVIDENCE HANDLING
// ============================================
function hideEvidenceInputs() {
    elements.evidenceEnterHint.style.display = 'none';
    elements.evidenceChoices.style.display = 'none';
    elements.evidenceContinueBtn.style.display = 'none';
}

function setEvidenceGridEnabled(enabled) {
    const items = elements.evidenceGrid.querySelectorAll('.evidence-item');
    items.forEach(item => {
        const evidenceId = item.dataset.evidence;
        if (gameState.completedEvidence.includes(evidenceId)) {
            item.disabled = true;
            item.classList.add('completed');
        } else {
            item.disabled = !enabled;
        }
    });
}

function startEvidence() {
    playPapersSound();
    showScreen('evidence-screen');
    elements.persistentLeads.style.display = 'block';

    // Disable grid during intro/dialogue
    setEvidenceGridEnabled(false);

    if (!gameState.evidenceIntroComplete) {
        // Play intro sequence
        gameState.evidenceIntroIndex = 0;
        processEvidenceIntro();
    } else if (gameState.completedEvidence.length >= evidenceData.items.length) {
        // All evidence examined
        setEvidenceGridEnabled(true);
        elements.evidenceDialogueText.textContent = "You've already examined all the evidence.";
        elements.evidenceContinueBtn.textContent = 'Back to Menu';
        elements.evidenceContinueBtn.style.display = 'block';
        elements.evidenceContinueBtn.onclick = () => {
            playClickSound();
            showScreen('menu-screen');
        };
    } else {
        // Skip intro, enable grid
        setEvidenceGridEnabled(true);
        elements.evidenceDialogueText.textContent = 'Select an evidence item to examine.';
    }
}

async function processEvidenceIntro() {
    if (gameState.evidenceIntroIndex >= evidenceData.intro.length) {
        // Intro complete - reset Mol sprite if needed
        if (gameState.evidenceMolSprite) {
            elements.evidenceMol.src = 'images/Mol.png';
            gameState.evidenceMolSprite = null;
        }
        gameState.evidenceIntroComplete = true;
        setEvidenceGridEnabled(true);
        elements.evidenceDialogueText.textContent = 'Select an evidence item to examine.';
        hideEvidenceInputs();
        return;
    }

    // Reset Mol sprite from previous dialogue
    if (gameState.evidenceMolSprite) {
        elements.evidenceMol.src = 'images/Mol.png';
        gameState.evidenceMolSprite = null;
    }

    const item = evidenceData.intro[gameState.evidenceIntroIndex];
    hideEvidenceInputs();
    gameState.waitingForInput = false;

    // Check for strawberry jam line (index 2) - show jam sprite
    if (gameState.evidenceIntroIndex === 2 && item.text.includes('strawberry jam')) {
        audioManager.playSfx('sparkle');
        elements.evidenceMol.src = 'images/Mol_jam.png';
        gameState.evidenceMolSprite = 'jam';
    }

    await typeText(item.text, item.loud, elements.evidenceDialogueText);
    gameState.waitingForInput = true;
    elements.evidenceEnterHint.style.display = 'block';
}

function advanceEvidenceIntro(playSound = true) {
    if (gameState.currentScreen === 'evidence-screen' &&
        !gameState.evidenceIntroComplete &&
        gameState.waitingForInput &&
        !gameState.isTyping) {
        if (playSound) playClickSound();
        gameState.waitingForInput = false;
        gameState.evidenceIntroIndex++;
        processEvidenceIntro();
    }
}

async function startEvidenceDialogue(evidenceId) {
    const evidence = evidenceData.items.find(e => e.id === evidenceId);
    if (!evidence) return;

    gameState.currentEvidence = evidence;
    gameState.evidenceDialogueIndex = 0;
    gameState.evidenceChoiceResponse = null;
    setEvidenceGridEnabled(false);

    processEvidenceDialogue();
}

async function processEvidenceDialogue() {
    const evidence = gameState.currentEvidence;
    if (!evidence) return;

    // Reset Mol sprite if it was changed (pretzel, etc.)
    if (gameState.evidenceMolSprite) {
        elements.evidenceMol.src = 'images/Mol.png';
        gameState.evidenceMolSprite = null;
    }

    // Check if we're processing a choice response
    let dialogueList = evidence.dialogue;
    if (gameState.evidenceChoiceResponse !== null) {
        dialogueList = gameState.evidenceChoiceResponse;
    }

    if (gameState.evidenceDialogueIndex >= dialogueList.length) {
        // Dialogue complete - add to leads and mark complete
        await finishEvidence();
        return;
    }

    const item = dialogueList[gameState.evidenceDialogueIndex];
    hideEvidenceInputs();
    gameState.waitingForInput = false;

    // Apply effects before typing
    if (item.effect === 'shake_flash') {
        document.body.classList.add('flash');
        document.getElementById('evidence-dialogue-box').classList.add('shake');
        setTimeout(() => {
            document.body.classList.remove('flash');
            document.getElementById('evidence-dialogue-box').classList.remove('shake');
        }, 500);
    }

    // Play sound effect if specified
    if (item.sound) {
        playSfx(item.sound);
    }

    // Check for special sprite triggers
    if (item.text && item.text.includes('tactical positioning described here is')) {
        audioManager.playSfx('surprise');
        elements.evidenceMol.src = 'images/Mol_surprised.png';
        gameState.evidenceMolSprite = 'surprised';
    }

    if (item.action === 'choice') {
        // Show choices immediately (don't clear previous dialogue text)
        elements.evidenceChoices.innerHTML = '';
        elements.evidenceChoices.style.display = 'flex';

        item.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice;
            btn.onclick = () => handleEvidenceChoice(index, item.responses[index]);
            elements.evidenceChoices.appendChild(btn);
        });
        // Don't wait for input - choices are clickable immediately
        return;
    } else if (item.action === 'continue_button') {
        await typeText(item.text, item.loud, elements.evidenceDialogueText);
        elements.evidenceContinueBtn.textContent = item.buttonText || 'Continue';
        elements.evidenceContinueBtn.style.display = 'block';
        elements.evidenceContinueBtn.onclick = () => {
            playClickSound();
            gameState.evidenceDialogueIndex++;
            processEvidenceDialogue();
        };
    } else {
        // Default 'wait' action
        await typeText(item.text, item.loud, elements.evidenceDialogueText);

        // Check if the NEXT item is a choice - if so, show choices immediately
        const nextIndex = gameState.evidenceDialogueIndex + 1;
        if (nextIndex < dialogueList.length && dialogueList[nextIndex].action === 'choice') {
            // Show choices right after this dialogue without waiting
            gameState.evidenceDialogueIndex++;
            const nextItem = dialogueList[gameState.evidenceDialogueIndex];
            elements.evidenceChoices.innerHTML = '';
            elements.evidenceChoices.style.display = 'flex';

            nextItem.choices.forEach((choice, index) => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = choice;
                btn.onclick = () => handleEvidenceChoice(index, nextItem.responses[index]);
                elements.evidenceChoices.appendChild(btn);
            });
            return;
        }

        gameState.waitingForInput = true;
        elements.evidenceEnterHint.style.display = 'block';
    }
}

async function handleEvidenceChoice(choiceIndex, response) {
    playClickSound();
    elements.evidenceChoices.style.display = 'none';

    // Response can be an array of dialogue items or a single string
    if (Array.isArray(response) && typeof response[0] === 'object') {
        // Array of dialogue objects - set as response sequence
        gameState.evidenceChoiceResponse = response;
        gameState.evidenceDialogueIndex = 0;
        processEvidenceDialogue();
    } else if (Array.isArray(response)) {
        // Array of strings - type each one
        for (const text of response) {
            await typeText(text, false, elements.evidenceDialogueText);
            gameState.waitingForInput = true;
            elements.evidenceEnterHint.style.display = 'block';
            await waitForInput();
        }
        gameState.evidenceDialogueIndex++;
        gameState.evidenceChoiceResponse = null;
        processEvidenceDialogue();
    } else {
        // Single string response
        await typeText(response, false, elements.evidenceDialogueText);
        gameState.waitingForInput = true;
        elements.evidenceEnterHint.style.display = 'block';
    }
}

function waitForInput() {
    return new Promise(resolve => {
        const checkInput = () => {
            if (!gameState.waitingForInput) {
                resolve();
            } else {
                setTimeout(checkInput, 100);
            }
        };
        checkInput();
    });
}

async function finishEvidence() {
    const evidence = gameState.currentEvidence;

    // Add lead to list
    const leadText = evidence.leadText;
    if (!gameState.collectedLeads.includes(leadText)) {
        await addLeadToList(leadText);

        // If this evidence has a "after" text (like manuscript), store it for later
        if (evidence.leadTextAfter) {
            // We'll update this when returning to menu
            evidence._needsUpdate = true;
        }
    }

    // Mark as complete
    if (!gameState.completedEvidence.includes(evidence.id)) {
        gameState.completedEvidence.push(evidence.id);
    }

    // Reset state
    gameState.currentEvidence = null;
    gameState.evidenceDialogueIndex = 0;
    gameState.evidenceChoiceResponse = null;

    // Update grid
    setEvidenceGridEnabled(true);
    elements.evidenceDialogueText.textContent = 'Select another evidence item to examine.';
    hideEvidenceInputs();

    // Check if all evidence is complete
    if (gameState.completedEvidence.length >= evidenceData.items.length) {
        elements.evidenceDialogueText.textContent = 'All evidence has been examined. Return to the menu to continue.';
    }
}

function advanceEvidenceDialogue(playSound = true) {
    if (gameState.currentScreen === 'evidence-screen' &&
        gameState.currentEvidence &&
        gameState.waitingForInput &&
        !gameState.isTyping) {
        if (playSound) playClickSound();
        gameState.waitingForInput = false;
        gameState.evidenceDialogueIndex++;
        processEvidenceDialogue();
    }
}

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
const witnessData = DIALOGUES.witnessReports || { intro: [], witnesses: [] };

function setWitnessListEnabled(enabled) {
    const items = elements.witnessList.querySelectorAll('.witness-item');
    items.forEach(item => {
        const witnessId = item.dataset.witness;
        const isCompleted = gameState.completedWitnesses.includes(witnessId);

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

function hideWitnessInputs() {
    elements.witnessEnterHint.style.display = 'none';
    elements.witnessChoices.style.display = 'none';
    elements.witnessContinueBtn.style.display = 'none';
}

function startWitness() {
    playPapersSound();
    showScreen('witness-screen');
    elements.persistentLeads.style.display = 'block';

    // Hide witness image initially and collapse container
    elements.witnessImage.style.display = 'none';
    elements.witnessImage.classList.remove('fly-away', 'vanish', 'spinning');
    document.getElementById('witness-image-container').classList.add('collapsed');

    // Disable list during intro/dialogue
    setWitnessListEnabled(false);

    if (!gameState.witnessIntroComplete) {
        // Play intro sequence
        gameState.witnessIntroIndex = 0;
        processWitnessIntro();
    } else if (gameState.completedWitnesses.length >= witnessData.witnesses.length) {
        // All witnesses interviewed
        setWitnessListEnabled(true);
        elements.witnessDialogueText.textContent = "You've already interviewed all witnesses.";
        elements.witnessContinueBtn.textContent = 'Back to Menu';
        elements.witnessContinueBtn.style.display = 'block';
        elements.witnessContinueBtn.onclick = () => {
            playClickSound();
            showScreen('menu-screen');
        };
    } else {
        // Skip intro, enable list
        setWitnessListEnabled(true);
        elements.witnessDialogueText.textContent = 'Select a witness to interview.';
    }
}

async function processWitnessIntro() {
    if (gameState.witnessIntroIndex >= witnessData.intro.length) {
        // Intro complete
        gameState.witnessIntroComplete = true;
        setWitnessListEnabled(true);
        elements.witnessDialogueText.textContent = 'Select a witness to interview.';
        hideWitnessInputs();
        return;
    }

    const item = witnessData.intro[gameState.witnessIntroIndex];
    hideWitnessInputs();
    gameState.waitingForInput = false;

    await typeText(item.text, item.loud, elements.witnessDialogueText);
    gameState.waitingForInput = true;
    elements.witnessEnterHint.style.display = 'block';
}

function advanceWitnessIntro(playSound = true) {
    if (gameState.currentScreen === 'witness-screen' &&
        !gameState.witnessIntroComplete &&
        gameState.waitingForInput &&
        !gameState.isTyping) {
        if (playSound) playClickSound();
        gameState.waitingForInput = false;
        gameState.witnessIntroIndex++;
        processWitnessIntro();
    }
}

async function startWitnessDialogue(witnessId) {
    const witness = witnessData.witnesses.find(w => w.id === witnessId);
    if (!witness) return;

    gameState.currentWitness = witness;
    gameState.witnessDialogueIndex = 0;
    setWitnessListEnabled(false);

    // Hide witness list during interview
    elements.witnessList.style.display = 'none';

    // Show witness image (unless delayImage is true - then wait for show_image action)
    if (witness.image && !witness.delayImage) {
        document.getElementById('witness-image-container').classList.remove('collapsed');
        elements.witnessImage.src = `images/${witness.image}`;
        elements.witnessImage.style.display = 'block';
        elements.witnessImage.classList.remove('fly-away', 'vanish', 'wide', 'spinning');
        // Add wide class for rectangular images
        if (witness.wide) {
            elements.witnessImage.classList.add('wide');
        }
    }

    // Switch to witness music
    if (witness.music) {
        switchToWitnessMusic(witness.id);
    }

    // Apply alien visual effect for glorp
    if (witness.id === 'glorp') {
        document.body.classList.add('alien-effect');
    }

    processWitnessDialogue();
}

function switchToWitnessMusic(witnessId) {
    audioManager.switchToWitnessMusic(witnessId);
    gameState.currentWitnessMusic = witnessId;
}

function switchToMainMusic() {
    audioManager.switchToMainMusic();
    gameState.currentWitnessMusic = null;
}

async function processWitnessDialogue() {
    const witness = gameState.currentWitness;
    if (!witness) return;

    if (gameState.witnessDialogueIndex >= witness.dialogue.length) {
        // Dialogue complete
        await finishWitness();
        return;
    }

    const item = witness.dialogue[gameState.witnessDialogueIndex];
    hideWitnessInputs();
    gameState.waitingForInput = false;

    // Play sound effect if specified
    if (item.sound) {
        playSfx(item.sound);
    }

    // Change witness image if specified (can be used with any action)
    if (item.changeImage) {
        elements.witnessImage.src = `images/${item.changeImage}`;
    }

    // Handle different action types
    if (item.action === 'show_image') {
        // Show the witness image (for delayed image display)
        document.getElementById('witness-image-container').classList.remove('collapsed');
        elements.witnessImage.src = `images/${witness.image}`;
        elements.witnessImage.style.display = 'block';
        elements.witnessImage.classList.remove('fly-away', 'vanish', 'wide', 'spinning');
        if (witness.wide) {
            elements.witnessImage.classList.add('wide');
        }
        // Continue to next dialogue item immediately
        gameState.witnessDialogueIndex++;
        processWitnessDialogue();
        return;
    }

    if (item.action === 'spin') {
        // Make the witness image spin (like a beyblade)
        elements.witnessImage.classList.add('spinning');

        // Type the text if there is any
        if (item.text) {
            await typeText(item.text, {
                loud: item.loud,
                target: elements.witnessDialogueText,
                speaker: item.speaker,
                pitch: item.pitch || witness.pitch || 'normal'
            });
        }

        // Show button to continue (stop spinning)
        elements.witnessContinueBtn.textContent = item.buttonText || 'Continue';
        elements.witnessContinueBtn.style.display = 'block';
        elements.witnessContinueBtn.onclick = () => {
            playClickSound();
            elements.witnessContinueBtn.style.display = 'none';
            elements.witnessImage.classList.remove('spinning');
            gameState.witnessDialogueIndex++;
            processWitnessDialogue();
        };
        return;
    }

    if (item.action === 'fly_away') {
        // Special action - witness flies away (like Cait's helicopter)
        // Show a button for the player to click
        playSfx('helicopter');
        elements.witnessImage.classList.add('fly-away');

        // Show surprised Mol during the helicopter departure
        elements.witnessMol.src = 'images/Mol_surprised.png';

        // Clear dialogue and show button
        elements.witnessDialogueText.textContent = '';
        elements.witnessContinueBtn.textContent = item.buttonText || 'Continue';
        elements.witnessContinueBtn.style.display = 'block';
        elements.witnessContinueBtn.onclick = () => {
            playClickSound();
            elements.witnessContinueBtn.style.display = 'none';
            elements.witnessImage.style.display = 'none';
            // Reset Mol sprite back to normal
            elements.witnessMol.src = 'images/Mol.png';
            gameState.witnessDialogueIndex++;
            processWitnessDialogue();
        };
        return;
    }

    if (item.action === 'beam_up') {
        // Special action - witness beams up to spaceship (like glorp)
        // First type the text if there is any
        if (item.text) {
            await typeText(item.text, {
                loud: item.loud,
                target: elements.witnessDialogueText,
                speaker: item.speaker,
                pitch: item.pitch || 'normal'
            });
        }

        // Play spaceship sound and fly away animation
        playSfx('spaceship');
        elements.witnessImage.classList.add('fly-away');

        // Show surprised Mol during the beam up
        elements.witnessMol.src = 'images/Mol_surprised.png';

        // Show choices for player response, or continue button if no choices
        if (item.choices) {
            elements.witnessChoices.innerHTML = '';
            elements.witnessChoices.style.display = 'flex';

            item.choices.forEach((choice, index) => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = choice;
                btn.onclick = () => handleWitnessChoice(index, item.responses[index]);
                elements.witnessChoices.appendChild(btn);
            });
        } else {
            // No choices - allow Enter/click to proceed (like normal dialogue)
            gameState.waitingForInput = true;
            elements.witnessEnterHint.style.display = 'block';
        }
        return;
    }

    if (item.action === 'vanish') {
        // Special action - witness vanishes (snap/poof)
        // First type the text if there is any
        if (item.text) {
            await typeText(item.text, {
                loud: item.loud,
                target: elements.witnessDialogueText,
                speaker: item.speaker,
                pitch: item.pitch || 'normal'
            });
        }

        // Sound is already played at the start of processWitnessDialogue()
        elements.witnessImage.classList.add('vanish');

        // Show button for player to continue
        elements.witnessContinueBtn.textContent = item.buttonText || 'Continue';
        elements.witnessContinueBtn.style.display = 'block';
        elements.witnessContinueBtn.onclick = () => {
            playClickSound();
            elements.witnessContinueBtn.style.display = 'none';
            elements.witnessImage.style.display = 'none';
            gameState.witnessDialogueIndex++;
            processWitnessDialogue();
        };
        return;
    }

    if (item.action === 'continue_button') {
        // Apply effects first if specified
        if (item.effect === 'shake_flash') {
            document.body.classList.add('flash');
            document.getElementById('witness-dialogue-box').classList.add('shake');
            setTimeout(() => {
                document.body.classList.remove('flash');
                document.getElementById('witness-dialogue-box').classList.remove('shake');
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
            target: elements.witnessDialogueText,
            speaker: item.speaker,
            pitch: pitch
        });

        // Show continue button
        elements.witnessContinueBtn.textContent = item.buttonText || 'Continue';
        elements.witnessContinueBtn.style.display = 'block';
        elements.witnessContinueBtn.onclick = () => {
            playClickSound();
            elements.witnessContinueBtn.style.display = 'none';
            gameState.witnessDialogueIndex++;
            processWitnessDialogue();
        };
        return;
    }

    // Apply shake_flash effect if specified
    if (item.effect === 'shake_flash') {
        document.body.classList.add('flash');
        document.getElementById('witness-dialogue-box').classList.add('shake');
        setTimeout(() => {
            document.body.classList.remove('flash');
            document.getElementById('witness-dialogue-box').classList.remove('shake');
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
        target: elements.witnessDialogueText,
        speaker: item.speaker,
        pitch: pitch
    });

    // Check if the CURRENT item has choices attached - if so, show them
    if (item.choices && item.responses) {
        elements.witnessChoices.innerHTML = '';
        elements.witnessChoices.style.display = 'flex';

        item.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice;
            btn.onclick = () => handleWitnessChoice(index, item.responses[index]);
            elements.witnessChoices.appendChild(btn);
        });
        return;
    }

    // Check if the NEXT item is a choice - if so, show choices immediately
    const nextIndex = gameState.witnessDialogueIndex + 1;
    if (nextIndex < witness.dialogue.length && witness.dialogue[nextIndex].action === 'choice') {
        gameState.witnessDialogueIndex++;
        const nextItem = witness.dialogue[gameState.witnessDialogueIndex];
        elements.witnessChoices.innerHTML = '';
        elements.witnessChoices.style.display = 'flex';

        nextItem.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice;
            btn.onclick = () => handleWitnessChoice(index, nextItem.responses[index]);
            elements.witnessChoices.appendChild(btn);
        });
        return;
    }

    gameState.waitingForInput = true;
    elements.witnessEnterHint.style.display = 'block';
}

// Helper function to wait for user input in witness dialogue
function waitForWitnessInput() {
    return new Promise(resolve => {
        const onAdvance = () => {
            gameState.waitingForInput = false;
            elements.witnessEnterHint.style.display = 'none';
            resolve();
        };
        const clickHandler = () => {
            playClickSound();
            document.getElementById('witness-dialogue-box').removeEventListener('click', clickHandler);
            document.removeEventListener('keydown', keyHandler);
            onAdvance();
        };
        const keyHandler = (e) => {
            if (e.key === 'Enter' && !e.target.matches('input')) {
                document.getElementById('witness-dialogue-box').removeEventListener('click', clickHandler);
                document.removeEventListener('keydown', keyHandler);
                onAdvance();
            }
        };
        document.getElementById('witness-dialogue-box').addEventListener('click', clickHandler);
        document.addEventListener('keydown', keyHandler);
    });
}

async function handleWitnessChoice(choiceIndex, response) {
    playClickSound();
    elements.witnessChoices.style.display = 'none';

    // Reset Mol sprite if it was surprised (from beam_up)
    elements.witnessMol.src = 'images/Mol.png';

    // Flag to prevent advanceWitnessDialogue from interfering
    gameState.processingChoice = true;

    // Response can be: string, array of strings, or array of dialogue objects
    if (Array.isArray(response)) {
        for (const item of response) {
            if (typeof item === 'string') {
                // Simple string response
                await typeText(item, false, elements.witnessDialogueText);
                // Wait for user input to continue
                gameState.waitingForInput = true;
                elements.witnessEnterHint.style.display = 'block';
                await waitForWitnessInput();
            } else if (item.action === 'choice') {
                // Nested choice - show choice buttons and wait for selection
                elements.witnessChoices.innerHTML = '';
                elements.witnessChoices.style.display = 'flex';

                await new Promise(resolve => {
                    item.choices.forEach((choice, index) => {
                        const btn = document.createElement('button');
                        btn.className = 'choice-btn';
                        btn.textContent = choice;
                        btn.onclick = async () => {
                            playClickSound();
                            elements.witnessChoices.style.display = 'none';
                            // Process the nested response
                            const nestedResponse = item.responses[index];
                            if (Array.isArray(nestedResponse)) {
                                for (const nestedItem of nestedResponse) {
                                    if (typeof nestedItem === 'string') {
                                        await typeText(nestedItem, false, elements.witnessDialogueText);
                                    } else {
                                        if (nestedItem.sound) playSfx(nestedItem.sound);
                                        if (nestedItem.effect === 'shake_flash') {
                                            document.body.classList.add('flash');
                                            document.getElementById('witness-dialogue-box').classList.add('shake');
                                            setTimeout(() => {
                                                document.body.classList.remove('flash');
                                                document.getElementById('witness-dialogue-box').classList.remove('shake');
                                            }, 500);
                                        }
                                        await typeText(nestedItem.text, {
                                            loud: nestedItem.loud,
                                            target: elements.witnessDialogueText,
                                            speaker: nestedItem.speaker,
                                            pitch: nestedItem.pitch || 'normal'
                                        });
                                    }
                                    gameState.waitingForInput = true;
                                    elements.witnessEnterHint.style.display = 'block';
                                    await waitForWitnessInput();
                                }
                            }
                            resolve();
                        };
                        elements.witnessChoices.appendChild(btn);
                    });
                });
            } else {
                // Dialogue object with speaker, pitch, loud, effect, sound
                if (item.sound) {
                    playSfx(item.sound);
                }
                if (item.effect === 'shake_flash') {
                    document.body.classList.add('flash');
                    document.getElementById('witness-dialogue-box').classList.add('shake');
                    setTimeout(() => {
                        document.body.classList.remove('flash');
                        document.getElementById('witness-dialogue-box').classList.remove('shake');
                    }, 500);
                }
                await typeText(item.text, {
                    loud: item.loud,
                    target: elements.witnessDialogueText,
                    speaker: item.speaker,
                    pitch: item.pitch || 'normal'
                });
                // Wait for user input to continue
                gameState.waitingForInput = true;
                elements.witnessEnterHint.style.display = 'block';
                await waitForWitnessInput();
            }
        }
    } else {
        await typeText(response, false, elements.witnessDialogueText);
        // Wait for user input
        gameState.waitingForInput = true;
        elements.witnessEnterHint.style.display = 'block';
        await waitForWitnessInput();
    }

    gameState.processingChoice = false;
    gameState.witnessDialogueIndex++;
    processWitnessDialogue();
}

async function finishWitness() {
    const witness = gameState.currentWitness;

    // Switch back to main music
    switchToMainMusic();

    // Add leads to list
    if (witness.leads && witness.leads.length > 0) {
        for (const lead of witness.leads) {
            if (!gameState.collectedLeads.includes(lead)) {
                await addLeadToList(lead);
            }
        }
    }

    // Mark as complete
    if (!gameState.completedWitnesses.includes(witness.id)) {
        gameState.completedWitnesses.push(witness.id);
    }

    // Reset state
    gameState.currentWitness = null;
    gameState.witnessDialogueIndex = 0;

    // Hide witness image and collapse container
    elements.witnessImage.style.display = 'none';
    elements.witnessImage.classList.remove('fly-away', 'vanish', 'spinning');
    document.getElementById('witness-image-container').classList.add('collapsed');

    // Remove alien visual effect
    document.body.classList.remove('alien-effect');

    // Show witness list again
    elements.witnessList.style.display = 'flex';

    // Update list
    setWitnessListEnabled(true);
    elements.witnessDialogueText.textContent = 'Select another witness to interview.';
    hideWitnessInputs();

    // Check if all witnesses interviewed
    if (gameState.completedWitnesses.length >= witnessData.witnesses.length) {
        elements.witnessDialogueText.textContent = 'All witnesses have been interviewed. Return to the menu to continue.';
    }
}

function advanceWitnessDialogue(playSound = true) {
    // Don't advance if we're processing a choice response (it has its own handlers)
    if (gameState.processingChoice) return;

    if (gameState.currentScreen === 'witness-screen' &&
        gameState.currentWitness &&
        gameState.waitingForInput &&
        !gameState.isTyping) {
        if (playSound) playClickSound();
        gameState.waitingForInput = false;
        gameState.witnessDialogueIndex++;
        processWitnessDialogue();
    }
}

// ============================================
// IDENTIFY SUSPECT SECTION
// ============================================
const identifyData = DIALOGUES.identifySuspect;

function startIdentifySuspect() {
    playClickSound();

    // Reset state
    gameState.identifyDialogueIndex = 0;
    gameState.identifyPhase = 'intro';
    gameState.revealedEvidence = [];
    gameState.currentIdentifyEvidence = null;
    gameState.identifyEvidenceDialogueIndex = 0;

    // Hide grid initially
    elements.identifyGrid.style.display = 'none';

    // Reset grid items
    elements.identifyGrid.querySelectorAll('.identify-item').forEach(item => {
        item.classList.remove('revealed');
        item.disabled = false;
        const label = item.querySelector('.identify-label');
        const itemId = item.dataset.item;
        const itemData = identifyData.evidenceItems[itemId];
        if (itemData && label) {
            label.textContent = itemData.name;
        }
    });

    // Clear dialogue
    elements.identifyDialogueText.textContent = '';
    hideIdentifyInputs();

    // Hide leads list during identify section
    elements.persistentLeads.style.display = 'none';

    showScreen('identify-screen');
    processIdentifyDialogue();
}

function hideIdentifyInputs() {
    elements.identifyEnterHint.style.display = 'none';
    elements.identifyChoices.style.display = 'none';
    elements.identifyContinueBtn.style.display = 'none';
}

async function processIdentifyDialogue() {
    hideIdentifyInputs();
    gameState.waitingForInput = false;

    let dialogue;
    let index;

    if (gameState.identifyPhase === 'intro') {
        dialogue = identifyData.intro;
        index = gameState.identifyDialogueIndex;
    } else if (gameState.identifyPhase === 'afterEvidence') {
        dialogue = identifyData.afterEvidence;
        index = gameState.identifyDialogueIndex;
    } else {
        return;
    }

    if (index >= dialogue.length) {
        // Phase complete
        if (gameState.identifyPhase === 'intro') {
            // This shouldn't happen - show_grid should trigger before end
            return;
        } else if (gameState.identifyPhase === 'afterEvidence') {
            // TODO: Move to next phase (dreams and fears)
            gameState.identifyPhase = 'complete';
            return;
        }
        return;
    }

    const item = dialogue[index];

    // Handle special actions
    if (item.action === 'music_change') {
        // Change to final music
        audioManager.fadeToTrack('bgm-final', 2000);

        // Type text and continue
        await typeText(item.text, false, elements.identifyDialogueText);
        gameState.waitingForInput = true;
        elements.identifyEnterHint.style.display = 'block';
        return;
    }

    if (item.action === 'show_grid') {
        // Show the evidence grid
        await typeText(item.text, false, elements.identifyDialogueText);
        elements.identifyGrid.style.display = 'flex';
        elements.identifyGrid.classList.remove('fade-out');
        gameState.identifyPhase = 'grid';
        setIdentifyGridEnabled(true);
        return;
    }

    if (item.action === 'hide_grid') {
        // Fade out and hide the evidence grid
        await typeText(item.text, false, elements.identifyDialogueText);
        elements.identifyGrid.classList.add('fade-out');
        // Wait for fade animation then hide
        await new Promise(resolve => setTimeout(resolve, 1000));
        elements.identifyGrid.style.display = 'none';
        elements.identifyGrid.classList.remove('fade-out');
        gameState.waitingForInput = true;
        elements.identifyEnterHint.style.display = 'block';
        return;
    }

    if (item.action === 'choice') {
        // Type the text first
        await typeText(item.text, item.loud, elements.identifyDialogueText);

        // Show choices
        elements.identifyChoices.innerHTML = '';
        elements.identifyChoices.style.display = 'flex';

        item.choices.forEach((choice, choiceIndex) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';

            // Check if this choice has hover text change
            if (item.choiceHover && item.choiceHover[choiceIndex]) {
                btn.classList.add('btn-hover-change');
                btn.innerHTML = `<span class="btn-text-default">${choice}</span><span class="btn-text-hover">${item.choiceHover[choiceIndex]}</span>`;
            } else {
                btn.textContent = choice;
            }

            btn.onclick = () => handleIdentifyChoice(choiceIndex, item.responses[choiceIndex]);
            elements.identifyChoices.appendChild(btn);
        });
        return;
    }

    // Default: wait action
    await typeText(item.text, item.loud, elements.identifyDialogueText);
    gameState.waitingForInput = true;
    elements.identifyEnterHint.style.display = 'block';
}

async function handleIdentifyChoice(choiceIndex, response) {
    playClickSound();
    elements.identifyChoices.style.display = 'none';

    // Process response array
    for (const item of response) {
        if (item.action === 'choice') {
            // Nested choice
            await typeText(item.text, item.loud, elements.identifyDialogueText);

            elements.identifyChoices.innerHTML = '';
            elements.identifyChoices.style.display = 'flex';

            item.choices.forEach((choice, idx) => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = choice;
                btn.onclick = () => handleIdentifyChoice(idx, item.responses[idx]);
                elements.identifyChoices.appendChild(btn);
            });
            return;
        }

        // Handle music change in response
        if (item.action === 'music_change') {
            audioManager.fadeToTrack('bgm-final', 2000);
            // Hide the leads list
            elements.persistentLeads.style.display = 'none';
        }

        // Handle start_fears action - transitions to fear sequence
        if (item.action === 'start_fears') {
            await typeText(item.text, item.loud, elements.identifyDialogueText);
            await new Promise(resolve => setTimeout(resolve, 1000));
            startFearSequence();
            return;
        }

        await typeText(item.text, item.loud, elements.identifyDialogueText);

        // Wait for input after each item
        await new Promise(resolve => {
            gameState.waitingForInput = true;
            elements.identifyEnterHint.style.display = 'block';

            const handler = () => {
                if (gameState.waitingForInput) {
                    playClickSound();
                    gameState.waitingForInput = false;
                    elements.identifyEnterHint.style.display = 'none';
                    document.getElementById('identify-dialogue-box').removeEventListener('click', handler);
                    document.removeEventListener('keydown', keyHandler);
                    resolve();
                }
            };
            const keyHandler = (e) => {
                if (e.key === 'Enter') {
                    handler();
                }
            };
            document.getElementById('identify-dialogue-box').addEventListener('click', handler);
            document.addEventListener('keydown', keyHandler);
        });
    }

    // Continue to next dialogue
    gameState.identifyDialogueIndex++;
    processIdentifyDialogue();
}

function advanceIdentifyDialogue(playSound = true) {
    if (gameState.currentScreen === 'identify-screen' &&
        gameState.waitingForInput &&
        !gameState.isTyping) {
        if (playSound) playClickSound();
        gameState.waitingForInput = false;
        elements.identifyEnterHint.style.display = 'none';
        gameState.identifyDialogueIndex++;
        processIdentifyDialogue();
    }
}

function setIdentifyGridEnabled(enabled) {
    elements.identifyGrid.querySelectorAll('.identify-item').forEach(item => {
        if (!item.classList.contains('revealed')) {
            item.disabled = !enabled;
        }
    });
}

async function handleIdentifyItemClick(itemId) {
    const itemData = identifyData.evidenceItems[itemId];
    if (!itemData) return;

    // Disable grid while processing
    setIdentifyGridEnabled(false);
    gameState.currentIdentifyEvidence = itemId;
    gameState.identifyEvidenceDialogueIndex = 0;

    // Process dialogue for this item
    await processIdentifyEvidenceDialogue();
}

async function processIdentifyEvidenceDialogue() {
    hideIdentifyInputs();

    const itemId = gameState.currentIdentifyEvidence;
    const itemData = identifyData.evidenceItems[itemId];

    if (gameState.identifyEvidenceDialogueIndex >= itemData.dialogue.length) {
        // Dialogue complete - show floating trait words before revealing
        const trait = itemData.trait;

        // Create floating words effect with the trait - soft white, slow, on edges
        const floatingController = createFloatingText(
            [trait, trait, trait, trait, trait, trait, trait, trait, trait, trait, trait, trait],
            {
                variant: 'soft',
                interval: 800,
                duration: 5000,
                loop: false,
                minSize: 1.5,
                maxSize: 3.2,
                minOpacity: 0.12,
                maxOpacity: 0.35
            }
        );

        // Wait for floating effect to build up, then reveal
        await new Promise(resolve => setTimeout(resolve, 4000));

        // Reveal the trait on the item
        const itemEl = elements.identifyGrid.querySelector(`[data-item="${itemId}"]`);
        if (itemEl) {
            itemEl.classList.add('revealed');
            const label = itemEl.querySelector('.identify-label');
            if (label) {
                label.textContent = trait;
            }
        }

        // Stop spawning new words and let existing ones fade naturally
        floatingController.stop();
        // Wait for remaining words to fade out with their animation
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mark as revealed
        if (!gameState.revealedEvidence.includes(itemId)) {
            gameState.revealedEvidence.push(itemId);
        }

        // Reset current evidence
        gameState.currentIdentifyEvidence = null;
        gameState.identifyEvidenceDialogueIndex = 0;

        // Check if all evidence is revealed
        const allItems = Object.keys(identifyData.evidenceItems);
        if (gameState.revealedEvidence.length >= allItems.length) {
            // All revealed - keep grid visible until afterEvidence dialogue prompts next question
            // Re-enable grid temporarily (will be hidden later)
            elements.identifyDialogueText.textContent = '';
            gameState.identifyPhase = 'afterEvidence';
            gameState.identifyDialogueIndex = 0;
            processIdentifyDialogue();
        } else {
            // Re-enable grid for more selections
            elements.identifyDialogueText.textContent = 'Select another item to examine.';
            setIdentifyGridEnabled(true);
        }
        return;
    }

    const item = itemData.dialogue[gameState.identifyEvidenceDialogueIndex];

    await typeText(item.text, item.loud, elements.identifyDialogueText);
    gameState.waitingForInput = true;
    elements.identifyEnterHint.style.display = 'block';
}

function advanceIdentifyEvidenceDialogue(playSound = true) {
    if (gameState.currentScreen === 'identify-screen' &&
        gameState.currentIdentifyEvidence &&
        gameState.waitingForInput &&
        !gameState.isTyping) {
        if (playSound) playClickSound();
        gameState.waitingForInput = false;
        elements.identifyEnterHint.style.display = 'none';
        gameState.identifyEvidenceDialogueIndex++;
        processIdentifyEvidenceDialogue();
    }
}

// ============================================
// FEAR SEQUENCE - The Shadows
// ============================================
const fearData = DIALOGUES.identifySuspect.fears;

// Set depression level (applies CSS class to identify-area)
function setDepressionLevel(level) {
    // Remove all depression/recovery classes
    elements.identifyArea.classList.remove(
        'depression-1', 'depression-2', 'depression-3', 'depression-4',
        'recovery-1', 'recovery-2', 'recovery-3', 'recovery-4'
    );

    gameState.depressionLevel = level;

    if (level > 0 && level <= 4) {
        elements.identifyArea.classList.add(`depression-${level}`);
    }
}

// Set recovery level (color coming back)
function setRecoveryLevel(level) {
    // Remove all depression/recovery classes
    elements.identifyArea.classList.remove(
        'depression-1', 'depression-2', 'depression-3', 'depression-4',
        'recovery-1', 'recovery-2', 'recovery-3', 'recovery-4'
    );

    if (level > 0 && level <= 4) {
        elements.identifyArea.classList.add(`recovery-${level}`);
    }
}

// Start the fear sequence
function startFearSequence() {
    gameState.identifyPhase = 'fears';
    gameState.fearIntroIndex = 0;
    gameState.fearClusterIndex = 0;
    gameState.fearDialogueIndex = 0;
    gameState.crossingEnabled = false;
    gameState.crossedClusters = 0;
    gameState.additionalClusterIndex = 0;
    gameState.fearConclusionIndex = 0;
    gameState.activeClusterIndex = 0;
    gameState.clusterDialogueStarted = false;

    // Clear fear words container
    elements.fearWordsContainer.innerHTML = '';
    elements.fearWordsContainer.style.display = 'none';

    // Start floating negative words in background
    const allFearWords = [];
    fearData.wordClusters.forEach(c => allFearWords.push(...c.words));
    fearData.additionalClusters.forEach(c => allFearWords.push(...c.words));

    gameState.floatingFearsController = createFloatingText(
        allFearWords,
        {
            variant: 'negative',
            interval: 1000,
            duration: 5000,
            loop: true,
            minSize: 1.2,
            maxSize: 2.5,
            minOpacity: 0.25,
            maxOpacity: 0.5
        }
    );

    processFearIntro();
}

// Process fear intro dialogue - auto-advances without waiting for input
async function processFearIntro() {
    hideIdentifyInputs();

    if (gameState.fearIntroIndex >= fearData.intro.length) {
        // Intro complete, move to showing word clusters
        return;
    }

    const item = fearData.intro[gameState.fearIntroIndex];

    await typeText(item.text, false, elements.identifyDialogueText);

    if (item.action === 'show_fears') {
        // Show the fear words container and start showing clusters
        elements.fearWordsContainer.style.display = 'flex';
        gameState.fearIntroIndex++;
        showNextFearCluster();
    } else {
        // Auto-advance after a pause (no enter required)
        await new Promise(resolve => setTimeout(resolve, 1500));
        gameState.fearIntroIndex++;
        processFearIntro();
    }
}

// Show the next cluster of fear words with typewriter effect
async function showNextFearCluster() {
    if (gameState.fearClusterIndex >= fearData.wordClusters.length) {
        // All initial clusters shown
        return;
    }

    const cluster = fearData.wordClusters[gameState.fearClusterIndex];

    // Set depression level and fade out music
    setDepressionLevel(cluster.depressionStage);

    // Fade out background music as depression increases
    if (cluster.depressionStage === 1) {
        audioManager.currentTrack.element.volume = 0.15;
    } else if (cluster.depressionStage >= 2) {
        audioManager.currentTrack.element.volume = 0;
    }

    // Type out each word with delay
    for (const word of cluster.words) {
        await typeWordToContainer(word, cluster.doubleClick === word, gameState.fearClusterIndex);
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    // Wait a moment then show Mol's reaction
    await new Promise(resolve => setTimeout(resolve, 800));

    gameState.fearDialogueIndex = 0;
    processFearClusterDialogue();
}

// Type a single word into the fear container (like typewriter)
async function typeWordToContainer(word, needsDoubleClick = false, clusterIndex = 0) {
    const wordEl = document.createElement('span');
    wordEl.className = 'fear-word';
    wordEl.dataset.word = word;
    wordEl.dataset.cluster = clusterIndex;  // Track which cluster this word belongs to
    if (needsDoubleClick) {
        wordEl.dataset.doubleClick = 'true';
        wordEl.dataset.clicks = '0';
    }
    wordEl.textContent = '';
    elements.fearWordsContainer.appendChild(wordEl);

    // Type out letter by letter
    for (let i = 0; i < word.length; i++) {
        wordEl.textContent = word.substring(0, i + 1);
        // Play a subtle sound for each letter (using animalese at low pitch for muffled effect)
        if (gameState.depressionLevel > 0 && /[a-zA-Z]/.test(word[i])) {
            // Muffled voice during depression - low pitch
            animalese.playLetter(word[i], false, 'low');
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

// Process dialogue after a fear cluster appears - auto-advances
async function processFearClusterDialogue() {
    const cluster = fearData.wordClusters[gameState.fearClusterIndex];

    if (gameState.fearDialogueIndex >= cluster.afterAppear.length) {
        // Dialogue for this cluster complete
        return;
    }

    const item = cluster.afterAppear[gameState.fearDialogueIndex];

    await typeText(item.text, item.loud, elements.identifyDialogueText);

    if (item.action === 'show_next_cluster') {
        gameState.fearClusterIndex++;
        gameState.fearDialogueIndex = 0;

        if (gameState.fearClusterIndex < fearData.wordClusters.length) {
            // Small pause before next cluster
            await new Promise(resolve => setTimeout(resolve, 500));
            showNextFearCluster();
        }
    } else if (item.action === 'enable_crossing') {
        // Enable clicking on words to cross them out
        // Start with the first cluster (index 0)
        gameState.activeClusterIndex = 0;
        gameState.crossingEnabled = true;
        enableFearWordClicking();
    } else {
        // Auto-advance after a pause (no enter required)
        await new Promise(resolve => setTimeout(resolve, 1200));
        gameState.fearDialogueIndex++;
        processFearClusterDialogue();
    }
}

// Enable clicking on fear words to cross them out (only for active cluster)
function enableFearWordClicking() {
    // Determine which cluster is currently active
    const activeCluster = gameState.activeClusterIndex;

    // Only enable words from the active cluster
    const words = elements.fearWordsContainer.querySelectorAll(`.fear-word[data-cluster="${activeCluster}"]:not(.crossed-out)`);
    words.forEach(wordEl => {
        wordEl.classList.add('clickable');
        wordEl.onclick = () => handleFearWordClick(wordEl);
    });
}

// Handle clicking a fear word to cross it out
async function handleFearWordClick(wordEl) {
    if (!gameState.crossingEnabled) return;

    const needsDouble = wordEl.dataset.doubleClick === 'true';
    const clicks = parseInt(wordEl.dataset.clicks || '0');

    if (needsDouble) {
        if (clicks === 0) {
            // First click on a double-click word - add single strikethrough
            wordEl.dataset.clicks = '1';
            wordEl.classList.add('crossed-out');
            playClickSound();
            return; // Wait for second click
        } else if (clicks === 1) {
            // Second click - add double strikethrough
            wordEl.classList.add('double-cross');
            playClickSound();
            // Continue to disable and check completion
        }
    } else {
        // Normal single-click word - skip if already crossed
        if (wordEl.classList.contains('crossed-out')) return;
        wordEl.classList.add('crossed-out');
        playClickSound();
    }

    // Disable clicking on this word
    wordEl.onclick = null;
    wordEl.classList.remove('clickable');

    // Check if this is the FIRST word crossed in this cluster - start dialogue
    if (!gameState.clusterDialogueStarted) {
        gameState.clusterDialogueStarted = true;
        // Start typing the response dialogue (don't await - let it type while player crosses more)
        startClusterResponseDialogue();
    }

    // Check if all words in the ACTIVE cluster are crossed out
    const activeCluster = gameState.activeClusterIndex;
    const uncrossedWords = elements.fearWordsContainer.querySelectorAll(`.fear-word[data-cluster="${activeCluster}"]:not(.crossed-out)`);
    const partiallyDouble = elements.fearWordsContainer.querySelectorAll(`.fear-word[data-cluster="${activeCluster}"].crossed-out:not(.double-cross)[data-double-click="true"]`);

    if (uncrossedWords.length === 0 && partiallyDouble.length === 0) {
        // All words in active cluster crossed out
        await handleClusterCrossedOut();
    }
}

// Start typing the cluster response dialogue (called on FIRST word cross)
function startClusterResponseDialogue() {
    // Determine which response to show based on progress
    if (gameState.crossedClusters < fearData.crossOutResponses.length) {
        const response = fearData.crossOutResponses[gameState.crossedClusters];
        // Start typing (don't await - let player keep crossing while it types)
        typeText(response.dialogue, false, elements.identifyDialogueText);
    } else if (gameState.additionalClusterIndex < fearData.additionalClusters.length) {
        const addCluster = fearData.additionalClusters[gameState.additionalClusterIndex];
        typeText(addCluster.crossOutResponse, false, elements.identifyDialogueText);
    }
}

// Handle when all words in a cluster are crossed out
async function handleClusterCrossedOut() {
    gameState.crossingEnabled = false;

    // Wait for any ongoing dialogue to finish typing
    while (gameState.isTyping) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Determine which response to show based on progress
    if (gameState.crossedClusters < fearData.crossOutResponses.length) {
        const response = fearData.crossOutResponses[gameState.crossedClusters];

        // Dialogue already started on first word cross, no need to type again

        // Apply recovery if specified
        if (response.recoveryStage) {
            setRecoveryLevel(response.recoveryStage);
        }

        // Check if we should show more words
        if (response.showMoreWords) {
            gameState.crossedClusters++;
            gameState.clusterDialogueStarted = false;  // Reset for next cluster
            await showAdditionalCluster();
        } else {
            gameState.crossedClusters++;
            gameState.clusterDialogueStarted = false;  // Reset for next cluster
            // Move to next cluster
            gameState.activeClusterIndex++;
            gameState.crossingEnabled = true;
            enableFearWordClicking();
        }
    } else if (gameState.additionalClusterIndex < fearData.additionalClusters.length) {
        // Handle additional clusters
        const addCluster = fearData.additionalClusters[gameState.additionalClusterIndex];

        // Dialogue already started on first word cross

        if (addCluster.recoveryStage) {
            setRecoveryLevel(addCluster.recoveryStage);
        }

        gameState.additionalClusterIndex++;
        gameState.clusterDialogueStarted = false;  // Reset for next cluster

        if (gameState.additionalClusterIndex < fearData.additionalClusters.length) {
            await showAdditionalCluster();
        } else {
            // All words crossed out - go to conclusion
            await new Promise(resolve => setTimeout(resolve, 1000));
            processFearConclusion();
        }
    }
}

// Show an additional cluster of fear words
async function showAdditionalCluster() {
    if (gameState.additionalClusterIndex >= fearData.additionalClusters.length) {
        return;
    }

    const cluster = fearData.additionalClusters[gameState.additionalClusterIndex];

    // Calculate the cluster index for this additional cluster
    // Additional clusters start after the main wordClusters
    const clusterIndex = fearData.wordClusters.length + gameState.additionalClusterIndex;

    // Set this as the active cluster
    gameState.activeClusterIndex = clusterIndex;

    // Add a separator
    const separator = document.createElement('div');
    separator.className = 'fear-word-separator';
    elements.fearWordsContainer.appendChild(separator);

    // Type out each word with the correct cluster index
    for (const word of cluster.words) {
        await typeWordToContainer(word, false, clusterIndex);
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    // Enable crossing
    gameState.crossingEnabled = true;
    enableFearWordClicking();
}

// Process the fear conclusion dialogue - auto-advances
async function processFearConclusion() {
    hideIdentifyInputs();

    // Stop floating fears
    if (gameState.floatingFearsController) {
        gameState.floatingFearsController.stop();
    }

    if (gameState.fearConclusionIndex >= fearData.conclusion.length) {
        // Conclusion complete - move to next phase (dreams or end)
        gameState.identifyPhase = 'complete';
        // Restore music
        audioManager.currentTrack.element.volume = 0.3;
        return;
    }

    const item = fearData.conclusion[gameState.fearConclusionIndex];

    await typeText(item.text, false, elements.identifyDialogueText);

    if (item.action === 'fade_words') {
        // Fade out all the crossed words
        elements.fearWordsContainer.style.transition = 'opacity 2s ease';
        elements.fearWordsContainer.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 2000));
        elements.fearWordsContainer.style.display = 'none';
        elements.fearWordsContainer.innerHTML = '';

        // Auto-advance
        gameState.fearConclusionIndex++;
        processFearConclusion();
    } else if (item.action === 'full_recovery') {
        // Full color recovery
        setRecoveryLevel(4);

        // Clear floating fears completely
        if (gameState.floatingFearsController) {
            gameState.floatingFearsController.clear();
        }

        // Restore music
        audioManager.currentTrack.element.volume = 0.3;

        // Auto-advance after a pause
        await new Promise(resolve => setTimeout(resolve, 1500));
        gameState.fearConclusionIndex++;
        processFearConclusion();
    } else if (item.action === 'show_dreams') {
        // Start the dreams sequence
        await new Promise(resolve => setTimeout(resolve, 1000));
        startDreamsSequence();
    } else {
        // Auto-advance after a pause (no enter required)
        await new Promise(resolve => setTimeout(resolve, 1500));
        gameState.fearConclusionIndex++;
        processFearConclusion();
    }
}

// ============================================
// DREAMS SEQUENCE
// ============================================
const dreamsData = DIALOGUES.identifySuspect.dreams;

function startDreamsSequence() {
    gameState.identifyPhase = 'dreams';
    gameState.revealedDreams = [];
    gameState.dreamsConclusionIndex = 0;

    // Build the dreams list
    elements.dreamsContainer.innerHTML = '';
    dreamsData.items.forEach((dream, index) => {
        const dreamEl = document.createElement('div');
        dreamEl.className = 'dream-item';
        dreamEl.dataset.index = index;
        dreamEl.innerHTML = `
            <span class="surface-text">${dream.surface}</span>
            <span class="hidden-text">${dream.hidden}</span>
        `;
        dreamEl.onclick = () => handleDreamClick(index);
        elements.dreamsContainer.appendChild(dreamEl);
    });

    // Show the dreams container
    elements.dreamsContainer.style.display = 'flex';
}

async function handleDreamClick(index) {
    // Check if already revealed
    if (gameState.revealedDreams.includes(index)) return;

    const dreamEl = elements.dreamsContainer.querySelector(`[data-index="${index}"]`);
    const dream = dreamsData.items[index];

    // Mark as revealed
    gameState.revealedDreams.push(index);
    dreamEl.classList.add('revealed');
    dreamEl.onclick = null;

    playClickSound();

    // Type Mol's response
    await typeText(dream.response, false, elements.identifyDialogueText);

    // Check if all dreams revealed
    if (gameState.revealedDreams.length >= dreamsData.items.length) {
        // All dreams revealed - start conclusion
        await new Promise(resolve => setTimeout(resolve, 1500));
        processDreamsConclusion();
    }
}

async function processDreamsConclusion() {
    if (gameState.dreamsConclusionIndex >= dreamsData.conclusion.length) {
        // Dreams complete - fade out and end
        elements.dreamsContainer.style.transition = 'opacity 2s ease';
        elements.dreamsContainer.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 2000));
        elements.dreamsContainer.style.display = 'none';

        gameState.identifyPhase = 'complete';
        // TODO: Move to final reveal or end
        return;
    }

    const item = dreamsData.conclusion[gameState.dreamsConclusionIndex];

    // Handle special styling for "And who she is"
    if (item.lowOpacity) {
        elements.identifyDialogueText.classList.add('low-opacity-text');
    } else {
        elements.identifyDialogueText.classList.remove('low-opacity-text');
    }

    await typeText(item.text, false, elements.identifyDialogueText);

    if (item.action === 'show_finale') {
        // Start the finale sequence
        await new Promise(resolve => setTimeout(resolve, 2000));
        startFinaleSequence();
    } else {
        // Auto-advance after a pause
        await new Promise(resolve => setTimeout(resolve, 1500));
        gameState.dreamsConclusionIndex++;
        processDreamsConclusion();
    }
}

// ============================================
// FINALE SEQUENCE
// ============================================
const finaleData = DIALOGUES.identifySuspect.finale;

function startFinaleSequence() {
    gameState.identifyPhase = 'finale';
    gameState.finaleDialogueIndex = 0;
    gameState.wrongAnswerCount = 0;

    // Hide dreams container
    elements.dreamsContainer.style.display = 'none';

    // Start floating positive words
    gameState.finaleFloatingController = createFloatingText(
        finaleData.floatingWords,
        {
            variant: 'soft',
            interval: 600,
            duration: 5000,
            loop: true,
            minSize: 1,
            maxSize: 2,
            minOpacity: 0.2,
            maxOpacity: 0.45
        }
    );

    // Type the prompt and show input
    showFinaleInput();
}

async function showFinaleInput() {
    await typeText(finaleData.prompt, false, elements.identifyDialogueText);

    // Show input after prompt
    await new Promise(resolve => setTimeout(resolve, 500));
    elements.finaleInputContainer.style.display = 'flex';
    elements.finaleNameInput.value = '';
    elements.finaleNameInput.focus();
}

function handleFinaleSubmit() {
    const answer = elements.finaleNameInput.value.trim().toLowerCase();
    console.log('[FINALE] Answer submitted:', answer);

    // Check if answer is valid (includes player's name from the beginning)
    const validAnswers = [...finaleData.validAnswers];
    if (gameState.playerName) {
        validAnswers.push(gameState.playerName.toLowerCase());
    }
    console.log('[FINALE] Valid answers:', validAnswers);

    if (validAnswers.includes(answer)) {
        // Correct answer!
        console.log('[FINALE] Correct answer! Starting reveal...');
        playClickSound();
        elements.finaleInputContainer.style.display = 'none';
        startFinalReveal();
    } else {
        // Wrong answer - show comforting message
        playClickSound();
        const messages = finaleData.wrongAnswerMessages;
        const message = messages[gameState.wrongAnswerCount % messages.length];
        gameState.wrongAnswerCount++;

        elements.finaleNameInput.value = '';
        typeText(message, false, elements.identifyDialogueText).then(() => {
            elements.finaleNameInput.focus();
        });
    }
}

async function startFinalReveal() {
    console.log('[FINALE] Starting final reveal');

    // Hide identify actions (grid, choices, enter hint, etc.)
    elements.identifyActions.style.display = 'none';
    elements.identifyGrid.style.display = 'none';
    elements.identifyEnterHint.style.display = 'none';

    // Hide the input container
    elements.finaleInputContainer.style.display = 'none';

    // Show Luisa (starts invisible due to CSS opacity: 0)
    elements.identifyLuisa.style.display = 'block';

    // Trigger the layout transition - Mol moves to center, dialogue box moves below
    elements.identifyArea.classList.add('finale-mode');

    // Clear the dialogue text for new content
    elements.identifyDialogueText.innerHTML = '';

    // Wait for the layout transition
    await new Promise(resolve => setTimeout(resolve, 800));

    // Fade in Luisa
    elements.identifyLuisa.classList.add('visible');

    console.log('[FINALE] Characters visible, starting dialogue');

    // Wait for Luisa to fully fade in (1s transition) + 2 seconds pause
    await new Promise(resolve => setTimeout(resolve, 3000));

    processFinaleDialogue();
}

async function processFinaleDialogue() {
    if (gameState.finaleDialogueIndex >= finaleData.finalDialogue.length) {
        // All dialogue complete - fade to end
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Fade overlay to black
        elements.fadeOverlay.classList.add('active');

        // Stop floating text
        if (gameState.finaleFloatingController) {
            gameState.finaleFloatingController.stop();
        }

        // Fade out music
        await audioManager.fadeOut(audioManager.currentTrack.element, 3000);

        // After fade, show end screen
        await new Promise(resolve => setTimeout(resolve, 4000));
        showScreen('end-screen');
        elements.fadeOverlay.classList.remove('active');
        return;
    }

    const item = finaleData.finalDialogue[gameState.finaleDialogueIndex];

    // Start fade effect at "Okayish!"
    if (item.action === 'start_fade') {
        // Start the bean up animation on both characters
        elements.identifyPortrait.classList.add('bean-up');
        elements.identifyLuisa.classList.add('bean-up');

        // Start fading floating text
        if (gameState.finaleFloatingController) {
            gameState.finaleFloatingController.stop();
        }

        // Start fading music
        audioManager.fadeOut(audioManager.currentTrack.element, 8000);
    }

    // Type the dialogue with speaker color and voice pitch
    elements.identifyDialogueText.innerHTML = '';
    const speakerClass = item.speaker === 'luisa' ? 'speaker-luisa' : 'speaker-mol';
    const voicePitch = item.speaker === 'luisa' ? 'luisa' : 'normal';

    await typeTextToElement(item.text, elements.identifyDialogueText, speakerClass, voicePitch);

    if (item.action === 'end') {
        // Final line - wait then fade to black
        await new Promise(resolve => setTimeout(resolve, 2000));
        elements.fadeOverlay.classList.add('active');

        // Wait for fade to complete
        await new Promise(resolve => setTimeout(resolve, 3500));

        // Show end messages from dialogues.js
        const endMessages = finaleData.endMessages || [];
        for (const message of endMessages) {
            elements.fadeOverlayText.textContent = message;
            elements.fadeOverlayText.classList.add('visible');

            // Wait for text to be read
            await new Promise(resolve => setTimeout(resolve, 4000));

            // Fade out text
            elements.fadeOverlayText.classList.remove('visible');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Show end screen
        showScreen('end-screen');
        elements.fadeOverlay.classList.remove('active');
        elements.fadeOverlayText.textContent = '';
    } else {
        // Auto-advance
        await new Promise(resolve => setTimeout(resolve, 1800));
        gameState.finaleDialogueIndex++;
        processFinaleDialogue();
    }
}

// Helper to type text with a specific class wrapper and voice pitch
async function typeTextToElement(text, element, className, pitch = 'normal') {
    const span = document.createElement('span');
    span.className = className;
    element.appendChild(span);

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        span.textContent += char;

        if (/[a-zA-Z]/.test(char)) {
            animalese.playLetter(char, false, pitch);
        }

        let delay = 50;
        if (char === '.' || char === '!' || char === '?') delay = 300;
        else if (char === ',') delay = 150;

        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

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
    processDialogue();
});

// Name submission
elements.submitNameBtn.addEventListener('click', () => {
    playClickSound();
    const name = elements.nameInput.value.trim();
    if (name) {
        gameState.playerName = name;
        handleNameConfirmation();
    }
});

elements.nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        elements.submitNameBtn.click();
    }
});

// Finale name input
elements.finaleSubmitBtn.addEventListener('click', () => {
    handleFinaleSubmit();
});

elements.finaleNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleFinaleSubmit();
    }
});

// Yes/No confirmation
elements.yesBtn.addEventListener('click', () => {
    playClickSound();
    gameState.dialogueIndex++;
    processDialogue();
});

elements.noBtn.addEventListener('click', () => {
    playClickSound();
    hideAllInputs();
    elements.nameInputContainer.style.display = 'flex';
    elements.nameInput.value = '';
    elements.nameInput.focus();
});

// Action button (Continue, I am ready, etc.)
elements.actionBtn.addEventListener('click', () => {
    playClickSound();
    gameState.dialogueIndex++;
    processDialogue();
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
    startLeads();
});

// Back to menu button (from leads)
elements.backToMenuBtn.addEventListener('click', () => {
    playClickSound();
    showScreen('menu-screen');
});

// Unified click-to-continue handlers
const clickHandlerMap = {
    'dialogue-screen': { element: elements.dialogueBox, advance: advanceDialogue },
    'leads-screen': { element: document.getElementById('leads-dialogue-box'), advance: advanceLeads },
    'evidence-screen': {
        element: document.getElementById('evidence-dialogue-box'),
        advance: () => {
            if (!gameState.evidenceIntroComplete) {
                advanceEvidenceIntro();
            } else if (gameState.currentEvidence) {
                advanceEvidenceDialogue();
            }
        }
    },
    'witness-screen': {
        element: document.getElementById('witness-dialogue-box'),
        advance: () => {
            if (!gameState.witnessIntroComplete) {
                advanceWitnessIntro();
            } else if (gameState.currentWitness) {
                advanceWitnessDialogue();
            }
        }
    },
    'identify-screen': {
        element: document.getElementById('identify-dialogue-box'),
        advance: () => {
            if (gameState.identifyPhase === 'fears') {
                // Fear sequence - different states
                if (gameState.fearConclusionIndex > 0 || (gameState.crossedClusters >= fearData.crossOutResponses.length && gameState.additionalClusterIndex >= fearData.additionalClusters.length)) {
                    advanceFearConclusion();
                } else if (gameState.fearIntroIndex < fearData.intro.length) {
                    advanceFearIntro();
                } else if (!gameState.crossingEnabled) {
                    advanceFearClusterDialogue();
                }
                // If crossing is enabled, don't advance - player must click words
            } else if (gameState.currentIdentifyEvidence) {
                advanceIdentifyEvidenceDialogue();
            } else if (gameState.identifyPhase !== 'grid') {
                advanceIdentifyDialogue();
            }
        }
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
    startEvidence();
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
            startEvidenceDialogue(item.dataset.evidence);
        }
    });
});

// Give Coffee button
elements.giveCoffeeBtn.addEventListener('click', () => {
    playClickSound();
    giveCoffee();
});

// Witness Reports button
elements.witnessBtn.addEventListener('click', () => {
    startWitness();
});

// Witness back to menu button
elements.witnessBackBtn.addEventListener('click', () => {
    playClickSound();
    // Stop witness music if playing
    switchToMainMusic();
    showScreen('menu-screen');
});

// Witness item click handlers
elements.witnessList.querySelectorAll('.witness-item').forEach(item => {
    item.addEventListener('click', () => {
        if (!item.disabled) {
            playClickSound();
            startWitnessDialogue(item.dataset.witness);
        }
    });
});

// Identify Suspect button
elements.identifySuspectBtn.addEventListener('click', () => {
    startIdentifySuspect();
});

// Identify grid item click handlers
elements.identifyGrid.querySelectorAll('.identify-item').forEach(item => {
    item.addEventListener('click', () => {
        if (!item.disabled && !item.classList.contains('revealed')) {
            playClickSound();
            handleIdentifyItemClick(item.dataset.item);
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
    gameState.leadsIndex = 0;
    gameState.leadsComplete = false;
    gameState.collectedLeads = [];
    // Reset evidence state
    gameState.evidenceIntroComplete = false;
    gameState.evidenceIntroIndex = 0;
    gameState.completedEvidence = [];
    gameState.currentEvidence = null;
    gameState.evidenceDialogueIndex = 0;
    gameState.evidenceChoiceResponse = null;
    // Reset evidence grid
    elements.evidenceGrid.querySelectorAll('.evidence-item').forEach(item => {
        item.disabled = false;
        item.classList.remove('completed');
    });
    // Reset witness state
    gameState.witnessIntroComplete = false;
    gameState.witnessIntroIndex = 0;
    gameState.completedWitnesses = [];
    gameState.currentWitness = null;
    gameState.witnessDialogueIndex = 0;
    // Reset witness list
    elements.witnessList.querySelectorAll('.witness-item').forEach(item => {
        item.disabled = false;
        item.classList.remove('completed');
    });
    elements.witnessList.style.display = 'flex';
    elements.witnessImage.style.display = 'none';
    // Reset identify suspect state
    gameState.identifyDialogueIndex = 0;
    gameState.identifyPhase = 'intro';
    gameState.revealedEvidence = [];
    gameState.currentIdentifyEvidence = null;
    gameState.identifyEvidenceDialogueIndex = 0;
    // Reset fear sequence state
    gameState.fearIntroIndex = 0;
    gameState.fearClusterIndex = 0;
    gameState.fearDialogueIndex = 0;
    gameState.crossingEnabled = false;
    gameState.crossedClusters = 0;
    gameState.additionalClusterIndex = 0;
    gameState.fearConclusionIndex = 0;
    gameState.activeClusterIndex = 0;
    gameState.clusterDialogueStarted = false;
    gameState.depressionLevel = 0;
    if (gameState.floatingFearsController) {
        gameState.floatingFearsController.clear();
        gameState.floatingFearsController = null;
    }
    // Reset depression/recovery classes
    elements.identifyArea.classList.remove(
        'depression-1', 'depression-2', 'depression-3', 'depression-4',
        'recovery-1', 'recovery-2', 'recovery-3', 'recovery-4'
    );
    // Reset fear words container
    elements.fearWordsContainer.innerHTML = '';
    elements.fearWordsContainer.style.display = 'none';
    elements.fearWordsContainer.style.opacity = '1';
    // Reset dreams state
    gameState.revealedDreams = [];
    gameState.dreamsConclusionIndex = 0;
    elements.dreamsContainer.innerHTML = '';
    elements.dreamsContainer.style.display = 'none';
    elements.dreamsContainer.style.opacity = '1';
    // Reset finale state
    gameState.finaleDialogueIndex = 0;
    gameState.wrongAnswerCount = 0;
    if (gameState.finaleFloatingController) {
        gameState.finaleFloatingController.clear();
        gameState.finaleFloatingController = null;
    }
    elements.finaleInputContainer.style.display = 'none';
    elements.finaleCharacters.style.display = 'none';
    elements.finaleDialogueBox.style.display = 'none';
    elements.finaleMol.classList.remove('bean-up');
    elements.finaleWho.classList.remove('bean-up', 'visible');
    elements.fadeOverlay.classList.remove('active');
    elements.fadeOverlayText.classList.remove('visible');
    elements.fadeOverlayText.textContent = '';
    // Restore identify screen elements
    elements.identifyArea.style.display = '';
    elements.identifyArea.classList.remove('finale-mode');
    elements.identifyActions.style.display = '';
    elements.identifyEnterHint.style.display = '';
    elements.identifyPortrait.style.display = '';
    elements.identifyPortrait.classList.remove('bean-up');
    elements.identifyLuisa.style.display = 'none';
    elements.identifyLuisa.classList.remove('visible', 'bean-up');
    elements.identifyDialogueBox.style.display = '';
    elements.identifyDialogueText.classList.remove('low-opacity-text');
    // Reset identify grid
    elements.identifyGrid.querySelectorAll('.identify-item').forEach(item => {
        item.disabled = false;
        item.classList.remove('revealed');
    });
    elements.identifyGrid.style.display = 'none';
    // Stop final music if playing
    audioManager.pauseCurrent();
    if (audioManager.currentTrack) {
        audioManager.currentTrack.element.currentTime = 0;
    }
    elements.dialogueText.innerHTML = '';
    elements.leadsList.innerHTML = '';
    elements.persistentLeads.style.display = 'none';
    hideAllInputs();
    // Go back to start screen
    showScreen('start-screen');
});

// Unified keyboard input handler
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.target.matches('input')) {
        // Map screens to their advance functions
        const screenHandlers = {
            'dialogue-screen': () => advanceDialogue(false),
            'leads-screen': () => advanceLeads(false),
            'evidence-screen': () => {
                if (!gameState.evidenceIntroComplete) {
                    advanceEvidenceIntro(false);
                } else if (gameState.currentEvidence) {
                    advanceEvidenceDialogue(false);
                }
            },
            'witness-screen': () => {
                if (!gameState.witnessIntroComplete) {
                    advanceWitnessIntro(false);
                } else if (gameState.currentWitness) {
                    advanceWitnessDialogue(false);
                }
            },
            'identify-screen': () => {
                if (gameState.identifyPhase === 'fears') {
                    // Fear sequence - different states
                    if (gameState.fearConclusionIndex > 0 || gameState.crossedClusters >= fearData.crossOutResponses.length) {
                        advanceFearConclusion();
                    } else if (gameState.fearIntroIndex < fearData.intro.length) {
                        advanceFearIntro();
                    } else if (!gameState.crossingEnabled) {
                        advanceFearClusterDialogue();
                    }
                    // If crossing is enabled, don't advance with Enter - player must click words
                } else if (gameState.currentIdentifyEvidence) {
                    advanceIdentifyEvidenceDialogue(false);
                } else if (gameState.identifyPhase !== 'grid') {
                    advanceIdentifyDialogue(false);
                }
            }
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
        hideAllInputs();
        showScreen('title-screen');
    }

    // ============================================
    // DEBUG: ESC TO SKIP/COMPLETE SECTIONS
    // Remove this entire block when done testing
    // ============================================
    if (e.key === 'Escape') {
        // Skip Leads section
        if (gameState.currentScreen === 'leads-screen' && !gameState.leadsComplete) {
            gameState.skipTyping = true;
            gameState.isTyping = false;
            gameState.waitingForInput = false;
            gameState.leadsComplete = true;
            // Add all leads that would have been collected
            const allLeads = ["Woman. 20s.", "Has hair.", "Weird beverage called Fritz Kola."];
            allLeads.forEach(lead => {
                if (!gameState.collectedLeads.includes(lead)) {
                    gameState.collectedLeads.push(lead);
                    const li = document.createElement('li');
                    li.textContent = lead;
                    elements.leadsList.appendChild(li);
                }
            });
            showScreen('menu-screen');
            console.log('[DEBUG] Leads section skipped/completed');
        }
        // Skip Evidence section (complete all evidence)
        else if (gameState.currentScreen === 'evidence-screen') {
            gameState.skipTyping = true;
            gameState.isTyping = false;
            gameState.waitingForInput = false;
            gameState.evidenceIntroComplete = true;
            // Mark all evidence as complete and add leads
            evidenceData.items.forEach(evidence => {
                if (!gameState.completedEvidence.includes(evidence.id)) {
                    gameState.completedEvidence.push(evidence.id);
                }
                if (evidence.leadText && !gameState.collectedLeads.includes(evidence.leadText)) {
                    gameState.collectedLeads.push(evidence.leadText);
                    const li = document.createElement('li');
                    li.textContent = evidence.leadText;
                    elements.leadsList.appendChild(li);
                }
            });
            gameState.currentEvidence = null;
            setEvidenceGridEnabled(true);
            showScreen('menu-screen');
            console.log('[DEBUG] Evidence section skipped/completed');
        }
        // Skip Witness section (complete all witnesses)
        else if (gameState.currentScreen === 'witness-screen') {
            gameState.skipTyping = true;
            gameState.isTyping = false;
            gameState.waitingForInput = false;
            gameState.processingChoice = false;
            gameState.witnessIntroComplete = true;
            // Stop witness music if playing
            switchToMainMusic();
            // Mark all witnesses as complete and add leads
            witnessData.witnesses.forEach(witness => {
                if (!gameState.completedWitnesses.includes(witness.id)) {
                    gameState.completedWitnesses.push(witness.id);
                }
                if (witness.leads) {
                    witness.leads.forEach(lead => {
                        if (!gameState.collectedLeads.includes(lead)) {
                            gameState.collectedLeads.push(lead);
                            const li = document.createElement('li');
                            li.textContent = lead;
                            elements.leadsList.appendChild(li);
                        }
                    });
                }
            });
            gameState.currentWitness = null;
            // Reset witness UI
            elements.witnessImage.style.display = 'none';
            elements.witnessImage.classList.remove('fly-away', 'vanish', 'spinning');
            document.getElementById('witness-image-container').classList.add('collapsed');
            // Remove alien visual effect
            document.body.classList.remove('alien-effect');
            elements.witnessList.style.display = 'flex';
            setWitnessListEnabled(true);
            showScreen('menu-screen');
            console.log('[DEBUG] Witness section skipped/completed');
        }
        // Skip to fears section directly (from identify screen, before fears)
        else if (gameState.currentScreen === 'identify-screen' && gameState.identifyPhase !== 'fears' && gameState.identifyPhase !== 'dreams') {
            gameState.skipTyping = true;
            gameState.isTyping = false;
            gameState.waitingForInput = false;
            // Mark all evidence as revealed
            gameState.revealedEvidence = ['candle', 'd20', 'manuscript', 'harpstring', 'snack'];
            // Hide leads list during identify
            document.getElementById('persistent-leads').style.display = 'none';
            // Change music to final
            audioManager.fadeToTrack('bgm-final', 2000);
            // Start fears directly
            startFearSequence();
            console.log('[DEBUG] Skipped to fear sequence');
        }
        // Skip current fear cluster (auto-cross all words in active cluster)
        else if (gameState.currentScreen === 'identify-screen' && gameState.identifyPhase === 'fears' && gameState.crossingEnabled) {
            const activeCluster = gameState.activeClusterIndex;
            const words = elements.fearWordsContainer.querySelectorAll(`.fear-word[data-cluster="${activeCluster}"]:not(.crossed-out), .fear-word[data-cluster="${activeCluster}"].crossed-out:not(.double-cross)[data-double-click="true"]`);
            words.forEach(wordEl => {
                wordEl.classList.add('crossed-out');
                if (wordEl.dataset.doubleClick === 'true') {
                    wordEl.classList.add('double-cross');
                }
                wordEl.classList.remove('clickable');
                wordEl.onclick = null;
            });
            handleClusterCrossedOut();
            console.log('[DEBUG] Auto-crossed fear cluster', activeCluster);
        }
        // Skip fears entirely - jump to dreams
        else if (gameState.currentScreen === 'identify-screen' && gameState.identifyPhase === 'fears' && !gameState.crossingEnabled) {
            gameState.skipTyping = true;
            gameState.isTyping = false;
            // Stop floating fears
            if (gameState.floatingFearsController) {
                gameState.floatingFearsController.clear();
            }
            // Clear fear words
            elements.fearWordsContainer.style.display = 'none';
            elements.fearWordsContainer.innerHTML = '';
            // Remove depression filter
            setRecoveryLevel(4);
            // Restore music volume
            audioManager.currentTrack.element.volume = 0.3;
            // Start dreams
            startDreamsSequence();
            console.log('[DEBUG] Skipped fears, jumped to dreams');
        }
        // Skip dreams - reveal all dreams at once
        else if (gameState.currentScreen === 'identify-screen' && gameState.identifyPhase === 'dreams') {
            // Mark all dreams as revealed
            const allDreamItems = elements.dreamsContainer.querySelectorAll('.dream-item:not(.revealed)');
            allDreamItems.forEach(item => {
                item.classList.add('revealed');
                item.onclick = null;
                const index = parseInt(item.dataset.index);
                if (!gameState.revealedDreams.includes(index)) {
                    gameState.revealedDreams.push(index);
                }
            });
            // Start conclusion
            processDreamsConclusion();
            console.log('[DEBUG] Skipped dreams, starting conclusion');
        }
    }
    // ============================================
    // END DEBUG BLOCK
    // ============================================
});

// ============================================
// DEBUG PANEL - Remove before release
// ============================================
document.getElementById('debug-toggle').addEventListener('click', () => {
    document.getElementById('debug-buttons').classList.toggle('open');
});

document.querySelectorAll('#debug-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.debug;
        console.log('[DEBUG PANEL] Triggering:', action);

        // Setup common state for identify screen
        const setupIdentifyScreen = () => {
            gameState.skipTyping = true;
            gameState.isTyping = false;
            gameState.waitingForInput = false;
            // Hide leads
            elements.persistentLeads.style.display = 'none';
            // Switch to final music
            audioManager.fadeToTrack('bgm-final', 2000);
            // Show identify screen
            showScreen('identify-screen');
        };

        if (action === 'fears') {
            setupIdentifyScreen();
            startFearSequence();
        } else if (action === 'dreams') {
            setupIdentifyScreen();
            // Clear any fear state
            elements.fearWordsContainer.style.display = 'none';
            elements.fearWordsContainer.innerHTML = '';
            setRecoveryLevel(4);
            startDreamsSequence();
        } else if (action === 'finale') {
            setupIdentifyScreen();
            // Clear fear/dreams state
            elements.fearWordsContainer.style.display = 'none';
            elements.fearWordsContainer.innerHTML = '';
            elements.dreamsContainer.style.display = 'none';
            elements.dreamsContainer.innerHTML = '';
            // Reset Luisa state
            elements.identifyLuisa.style.display = 'none';
            elements.identifyLuisa.classList.remove('visible', 'bean-up');
            elements.identifyArea.classList.remove('finale-mode');
            elements.identifyPortrait.classList.remove('bean-up');
            setRecoveryLevel(4);
            startFinaleSequence();
        }

        // Close the debug panel
        document.getElementById('debug-buttons').classList.remove('open');
    });
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
