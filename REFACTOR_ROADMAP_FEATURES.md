# Feature Expansion Roadmap - New Gameplay Features

**Prerequisites:** Phase 3 complete (or at minimum Phase 1 & 2)
**Goal:** Add quality-of-life features to improve player experience
**Constraint:** NO ES6 modules - global scope only (file:// protocol compatibility)

---

## Context for New Claude Sessions

This is a visual novel detective game with a complete, well-refactored codebase. We're now adding optional features to enhance the player experience.

**Current State:**
- ✅ All core gameplay complete and working
- ✅ Well-organized file structure (screens/, core/, utils/)
- ✅ No build step required (works with file:// protocol)

**Feature Expansion Goals:**
- Save/Load system (localStorage)
- Settings menu (volume, text speed, accessibility)
- Dialogue history and skip/replay
- Achievements/collectibles (optional)

---

## Task 19: Save/Load System

**Estimated Time:** 6-8 hours
**Risk:** 🟡 Medium
**Files to Create:** `core/save-manager.js`

### Overview

Implement auto-save and manual save/load functionality using localStorage. Players can continue their game later or replay from checkpoints.

### What to Save

The save system should track:
- Player name
- Current screen
- Completed sections (leads, evidence items, witnesses)
- Progress flags (leadsComplete, evidenceIntroComplete, etc.)
- Collected leads list
- Identify screen progress (revealed evidence, dreams, fears completed)

### Implementation

**core/save-manager.js:**
```javascript
class SaveManager {
    constructor() {
        this.SAVE_KEY = 'christmas-gift-save';
        this.AUTO_SAVE_KEY = 'christmas-gift-autosave';
        this.SAVE_VERSION = 1; // Increment when save format changes
    }

    /**
     * Get current game state as save data
     * @returns {Object} Serializable save data
     */
    getSaveData() {
        return {
            version: this.SAVE_VERSION,
            timestamp: Date.now(),
            playerName: gameState.playerName,
            currentScreen: gameState.currentScreen,
            // Progress flags
            leadsComplete: gameState.leadsComplete,
            evidenceIntroComplete: gameState.evidenceIntroComplete,
            witnessIntroComplete: gameState.witnessIntroComplete,
            // Collections
            collectedLeads: [...gameState.collectedLeads],
            completedEvidence: [...gameState.completedEvidence],
            completedWitnesses: [...gameState.completedWitnesses],
            // Identify progress
            identifyPhase: gameState.identifyPhase,
            revealedEvidence: [...gameState.revealedEvidence],
            revealedDreams: [...gameState.revealedDreams],
            // Screen-specific state
            dialogueIndex: gameState.dialogueIndex,
            leadsIndex: gameState.leadsIndex
        };
    }

    /**
     * Load save data into game state
     * @param {Object} saveData - Save data to load
     */
    loadSaveData(saveData) {
        if (!saveData || saveData.version !== this.SAVE_VERSION) {
            console.warn('Save data version mismatch or invalid data');
            return false;
        }

        // Restore state
        gameState.playerName = saveData.playerName || '';
        gameState.leadsComplete = saveData.leadsComplete || false;
        gameState.evidenceIntroComplete = saveData.evidenceIntroComplete || false;
        gameState.witnessIntroComplete = saveData.witnessIntroComplete || false;
        gameState.collectedLeads = saveData.collectedLeads || [];
        gameState.completedEvidence = saveData.completedEvidence || [];
        gameState.completedWitnesses = saveData.completedWitnesses || [];
        gameState.identifyPhase = saveData.identifyPhase || 'intro';
        gameState.revealedEvidence = saveData.revealedEvidence || [];
        gameState.revealedDreams = saveData.revealedDreams || [];
        gameState.dialogueIndex = saveData.dialogueIndex || 0;
        gameState.leadsIndex = saveData.leadsIndex || 0;

        // Update UI to reflect loaded state
        this.updateUIFromSave(saveData);

        return true;
    }

    /**
     * Update UI elements based on loaded save
     * @param {Object} saveData - Save data
     */
    updateUIFromSave(saveData) {
        // Restore leads list
        elements.leadsList.innerHTML = '';
        saveData.collectedLeads.forEach(lead => {
            const li = document.createElement('li');
            li.textContent = lead;
            elements.leadsList.appendChild(li);
        });

        // Mark completed evidence as disabled
        elements.evidenceGrid.querySelectorAll('.evidence-item').forEach(item => {
            const evidenceId = item.dataset.evidence;
            if (saveData.completedEvidence.includes(evidenceId)) {
                item.disabled = true;
                item.classList.add('completed');
            }
        });

        // Mark completed witnesses as disabled
        elements.witnessList.querySelectorAll('.witness-item').forEach(item => {
            const witnessId = item.dataset.witness;
            if (saveData.completedWitnesses.includes(witnessId)) {
                item.disabled = true;
                item.classList.add('completed');
            }
        });

        // Update identify button state
        updateIdentifySuspectButton();

        // Navigate to saved screen
        showScreen(saveData.currentScreen);
    }

    /**
     * Auto-save current game state
     */
    autoSave() {
        const saveData = this.getSaveData();
        try {
            localStorage.setItem(this.AUTO_SAVE_KEY, JSON.stringify(saveData));
            console.log('Auto-saved at', new Date(saveData.timestamp).toLocaleTimeString());
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    /**
     * Manual save to a specific slot
     * @param {number} slot - Save slot number (1-3)
     * @returns {boolean} Success status
     */
    save(slot = 1) {
        const saveData = this.getSaveData();
        const key = `${this.SAVE_KEY}-slot${slot}`;
        try {
            localStorage.setItem(key, JSON.stringify(saveData));
            audioManager.playSfx('sparkle'); // Success sound
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            return false;
        }
    }

    /**
     * Load from a specific slot
     * @param {number} slot - Save slot number (1-3)
     * @returns {boolean} Success status
     */
    load(slot = 1) {
        const key = `${this.SAVE_KEY}-slot${slot}`;
        try {
            const data = localStorage.getItem(key);
            if (!data) {
                console.log('No save data in slot', slot);
                return false;
            }
            const saveData = JSON.parse(data);
            return this.loadSaveData(saveData);
        } catch (error) {
            console.error('Load failed:', error);
            return false;
        }
    }

    /**
     * Check if auto-save exists and load it
     * @returns {boolean} Whether auto-save was loaded
     */
    loadAutoSave() {
        try {
            const data = localStorage.getItem(this.AUTO_SAVE_KEY);
            if (!data) return false;
            const saveData = JSON.parse(data);
            return this.loadSaveData(saveData);
        } catch (error) {
            console.error('Auto-save load failed:', error);
            return false;
        }
    }

    /**
     * Get save slot info for display
     * @param {number} slot - Save slot number
     * @returns {Object|null} Save info or null if empty
     */
    getSaveInfo(slot = 1) {
        const key = `${this.SAVE_KEY}-slot${slot}`;
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;
            const saveData = JSON.parse(data);
            return {
                playerName: saveData.playerName,
                timestamp: saveData.timestamp,
                screen: saveData.currentScreen,
                progress: this.calculateProgress(saveData)
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Calculate progress percentage
     * @param {Object} saveData - Save data
     * @returns {number} Progress percentage (0-100)
     */
    calculateProgress(saveData) {
        let completed = 0;
        let total = 5; // Total major sections

        if (saveData.dialogueIndex >= dialogueSequence.length) completed++;
        if (saveData.leadsComplete) completed++;
        if (saveData.completedEvidence.length >= evidenceData.items.length) completed++;
        if (saveData.completedWitnesses.length >= witnessData.witnesses.length) completed++;
        if (saveData.identifyPhase === 'complete') completed++;

        return Math.round((completed / total) * 100);
    }

    /**
     * Delete save from slot
     * @param {number} slot - Save slot number
     */
    deleteSave(slot = 1) {
        const key = `${this.SAVE_KEY}-slot${slot}`;
        localStorage.removeItem(key);
    }

    /**
     * Delete all saves
     */
    deleteAllSaves() {
        localStorage.removeItem(this.AUTO_SAVE_KEY);
        for (let i = 1; i <= 3; i++) {
            this.deleteSave(i);
        }
    }
}

// Create global instance
const saveManager = new SaveManager();
```

### Auto-Save Integration

Add auto-save triggers at key checkpoints:

**In game.js**, add auto-save calls:

```javascript
// After intro dialogue completes
// In intro-screen.js, at end of dialogue:
saveManager.autoSave();

// After leads complete
// In leads-screen.js, when setting leadsComplete = true:
saveManager.autoSave();

// After each evidence/witness completed
// In evidence-screen.js and witness-screen.js:
saveManager.autoSave();

// After each identify phase
// In identify-screen.js, when changing phases:
saveManager.autoSave();
```

### UI for Save/Load

**Add to menu screen (index.html):**

```html
<!-- Save/Load buttons in menu -->
<div class="save-load-container">
    <button id="save-btn" class="btn">Save Game</button>
    <button id="load-btn" class="btn">Load Game</button>
</div>

<!-- Save/Load modal -->
<div id="save-load-modal" class="modal" style="display: none;">
    <div class="modal-content">
        <h2 id="modal-title">Save Game</h2>
        <div class="save-slots">
            <div class="save-slot" data-slot="1">
                <div class="slot-header">Slot 1</div>
                <div class="slot-info" id="slot-1-info">Empty</div>
                <button class="btn btn-small" id="slot-1-btn">Save</button>
            </div>
            <div class="save-slot" data-slot="2">
                <div class="slot-header">Slot 2</div>
                <div class="slot-info" id="slot-2-info">Empty</div>
                <button class="btn btn-small" id="slot-2-btn">Save</button>
            </div>
            <div class="save-slot" data-slot="3">
                <div class="slot-header">Slot 3</div>
                <div class="slot-info" id="slot-info">Empty</div>
                <button class="btn btn-small" id="slot-3-btn">Save</button>
            </div>
        </div>
        <button id="close-modal-btn" class="btn">Close</button>
    </div>
</div>
```

**Event Listeners (game.js):**

```javascript
// Save button
document.getElementById('save-btn').addEventListener('click', () => {
    playClickSound();
    showSaveModal('save');
});

// Load button
document.getElementById('load-btn').addEventListener('click', () => {
    playClickSound();
    showSaveModal('load');
});

// Show save/load modal
function showSaveModal(mode) {
    const modal = document.getElementById('save-load-modal');
    const title = document.getElementById('modal-title');

    title.textContent = mode === 'save' ? 'Save Game' : 'Load Game';
    modal.style.display = 'flex';

    // Update slot info
    for (let i = 1; i <= 3; i++) {
        const info = saveManager.getSaveInfo(i);
        const infoEl = document.getElementById(`slot-${i}-info`);
        const btnEl = document.getElementById(`slot-${i}-btn`);

        if (info) {
            infoEl.textContent = `${info.playerName} - ${info.progress}% - ${new Date(info.timestamp).toLocaleString()}`;
            btnEl.textContent = mode === 'save' ? 'Overwrite' : 'Load';
            btnEl.disabled = false;
        } else {
            infoEl.textContent = 'Empty';
            btnEl.textContent = mode === 'save' ? 'Save' : 'Load';
            btnEl.disabled = mode === 'load'; // Can't load empty slot
        }

        // Set up click handler
        btnEl.onclick = () => {
            if (mode === 'save') {
                saveManager.save(i);
                modal.style.display = 'none';
            } else {
                if (saveManager.load(i)) {
                    modal.style.display = 'none';
                    audioManager.playSfx('sparkle');
                }
            }
        };
    }
}

// Close modal
document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('save-load-modal').style.display = 'none';
});
```

### Continue from Start Screen

Add "Continue" button to start screen:

```html
<!-- In start screen -->
<button id="continue-btn" class="btn" style="display: none;">Continue</button>
<button id="start-btn" class="btn">New Game</button>
```

```javascript
// Check for auto-save on page load
document.addEventListener('DOMContentLoaded', () => {
    const hasAutoSave = localStorage.getItem(saveManager.AUTO_SAVE_KEY);
    const continueBtn = document.getElementById('continue-btn');

    if (hasAutoSave) {
        continueBtn.style.display = 'block';
        continueBtn.addEventListener('click', () => {
            playClickSound();
            if (saveManager.loadAutoSave()) {
                // Auto-save loaded successfully
                animalese.init();
                // Register audio... (same as start button)
            }
        });
    }
});
```

### Testing Checklist

- [ ] Auto-save triggers at correct points
- [ ] Manual save to each slot works
- [ ] Manual load from each slot works
- [ ] Save info displays correctly (name, progress, timestamp)
- [ ] Continue button appears when auto-save exists
- [ ] Continue loads auto-save correctly
- [ ] UI updates properly after load (leads, evidence, witnesses)
- [ ] Can overwrite existing save
- [ ] Can't load from empty slot
- [ ] Save/load modal opens and closes correctly
- [ ] localStorage limits don't cause errors

### Changes to index.html

Add script tag:
```html
<script src="core/save-manager.js"></script>
<script src="game.js"></script>
```

---

## Task 20: Settings Menu

**Estimated Time:** 4-6 hours
**Risk:** 🟢 Low
**Files to Create:** `screens/settings-screen.js`
**Files to Modify:** `core/audio-manager.js`, `game.js`

### Overview

Add a settings menu for:
- Master volume control
- Music volume control
- SFX volume control
- Text speed control
- Accessibility options (reduce motion, high contrast)

### Implementation

**screens/settings-screen.js:**

```javascript
class SettingsScreen {
    constructor() {
        this.settings = {
            masterVolume: 0.7,
            musicVolume: 0.3,
            sfxVolume: 1.0,
            textSpeed: 1.0, // Multiplier: 0.5 = slow, 1.0 = normal, 2.0 = fast
            reduceMotion: false,
            highContrast: false
        };

        // Load saved settings
        this.loadSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('christmas-gift-settings');
        if (saved) {
            try {
                Object.assign(this.settings, JSON.parse(saved));
                this.applySettings();
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
    }

    saveSettings() {
        localStorage.setItem('christmas-gift-settings', JSON.stringify(this.settings));
        audioManager.playSfx('click');
    }

    applySettings() {
        // Apply volume settings
        audioManager.setMasterVolume(this.settings.masterVolume);
        audioManager.setMusicVolume(this.settings.musicVolume);
        audioManager.setSfxVolume(this.settings.sfxVolume);

        // Apply accessibility settings
        if (this.settings.reduceMotion) {
            document.body.classList.add('reduce-motion');
        } else {
            document.body.classList.remove('reduce-motion');
        }

        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }

    show() {
        showScreen('settings-screen');
        this.updateUI();
    }

    updateUI() {
        // Update sliders to reflect current settings
        document.getElementById('master-volume').value = this.settings.masterVolume;
        document.getElementById('music-volume').value = this.settings.musicVolume;
        document.getElementById('sfx-volume').value = this.settings.sfxVolume;
        document.getElementById('text-speed').value = this.settings.textSpeed;

        document.getElementById('reduce-motion').checked = this.settings.reduceMotion;
        document.getElementById('high-contrast').checked = this.settings.highContrast;

        // Update value displays
        document.getElementById('master-volume-value').textContent = Math.round(this.settings.masterVolume * 100) + '%';
        document.getElementById('music-volume-value').textContent = Math.round(this.settings.musicVolume * 100) + '%';
        document.getElementById('sfx-volume-value').textContent = Math.round(this.settings.sfxVolume * 100) + '%';
        document.getElementById('text-speed-value').textContent = this.settings.textSpeed + 'x';
    }

    setMasterVolume(value) {
        this.settings.masterVolume = parseFloat(value);
        this.applySettings();
        this.updateUI();
    }

    setMusicVolume(value) {
        this.settings.musicVolume = parseFloat(value);
        this.applySettings();
        this.updateUI();
    }

    setSfxVolume(value) {
        this.settings.sfxVolume = parseFloat(value);
        this.applySettings();
        this.updateUI();
        // Play test sound
        audioManager.playSfx('click');
    }

    setTextSpeed(value) {
        this.settings.textSpeed = parseFloat(value);
        this.updateUI();
    }

    toggleReduceMotion() {
        this.settings.reduceMotion = !this.settings.reduceMotion;
        this.applySettings();
    }

    toggleHighContrast() {
        this.settings.highContrast = !this.settings.highContrast;
        this.applySettings();
    }

    reset() {
        this.settings = {
            masterVolume: 0.7,
            musicVolume: 0.3,
            sfxVolume: 1.0,
            textSpeed: 1.0,
            reduceMotion: false,
            highContrast: false
        };
        this.applySettings();
        this.updateUI();
        this.saveSettings();
    }
}

const settingsScreen = new SettingsScreen();
```

### Audio Manager Updates

Add volume control methods to `core/audio-manager.js`:

```javascript
class AudioManager {
    constructor() {
        // ... existing code ...
        this.masterVolume = 0.7;
        this.musicVolume = 1.0;
        this.sfxVolume = 1.0;
    }

    setMasterVolume(volume) {
        this.masterVolume = volume;
        this.updateAllVolumes();
    }

    setMusicVolume(volume) {
        this.musicVolume = volume;
        this.updateAllVolumes();
    }

    setSfxVolume(volume) {
        this.sfxVolume = volume;
    }

    updateAllVolumes() {
        // Update currently playing track
        if (this.currentTrack) {
            this.currentTrack.element.volume = this.currentTrack.baseVolume * this.musicVolume * this.masterVolume;
        }
    }

    playSfx(soundName) {
        if (this.sfx[soundName]) {
            const sfx = this.sfx[soundName];
            sfx.volume = this.sfxVolume * this.masterVolume;
            sfx.currentTime = 0;
            sfx.play().catch(() => {});
        }
    }

    // Update playTrack to use volume multipliers
    playTrack(trackName) {
        // ... existing code ...
        track.element.volume = track.baseVolume * this.musicVolume * this.masterVolume;
        // ... existing code ...
    }
}
```

### Text Speed Integration

Modify `typeText()` in game.js to use text speed setting:

```javascript
async function typeText(text, isLoudOrOptions = false, targetElement = null) {
    // ... existing code ...

    // Variable delay - apply text speed multiplier
    let delay = 50 / settingsScreen.settings.textSpeed;
    if (char === '.' || char === '!' || char === '?') delay = 300 / settingsScreen.settings.textSpeed;
    else if (char === ',') delay = 150 / settingsScreen.settings.textSpeed;
    else if (char === '…' || char === '—') delay = 200 / settingsScreen.settings.textSpeed;

    // ... existing code ...
}
```

### HTML UI

Add to index.html:

```html
<!-- Settings Screen -->
<div id="settings-screen" class="screen">
    <h2>Settings</h2>

    <div class="settings-section">
        <h3>Audio</h3>

        <div class="setting-item">
            <label for="master-volume">Master Volume:</label>
            <input type="range" id="master-volume" min="0" max="1" step="0.01" value="0.7">
            <span id="master-volume-value">70%</span>
        </div>

        <div class="setting-item">
            <label for="music-volume">Music Volume:</label>
            <input type="range" id="music-volume" min="0" max="1" step="0.01" value="0.3">
            <span id="music-volume-value">30%</span>
        </div>

        <div class="setting-item">
            <label for="sfx-volume">Sound Effects Volume:</label>
            <input type="range" id="sfx-volume" min="0" max="1" step="0.01" value="1.0">
            <span id="sfx-volume-value">100%</span>
        </div>
    </div>

    <div class="settings-section">
        <h3>Gameplay</h3>

        <div class="setting-item">
            <label for="text-speed">Text Speed:</label>
            <input type="range" id="text-speed" min="0.5" max="2.0" step="0.1" value="1.0">
            <span id="text-speed-value">1.0x</span>
        </div>
    </div>

    <div class="settings-section">
        <h3>Accessibility</h3>

        <div class="setting-item">
            <label for="reduce-motion">Reduce Motion:</label>
            <input type="checkbox" id="reduce-motion">
        </div>

        <div class="setting-item">
            <label for="high-contrast">High Contrast:</label>
            <input type="checkbox" id="high-contrast">
        </div>
    </div>

    <div class="settings-buttons">
        <button id="reset-settings-btn" class="btn">Reset to Defaults</button>
        <button id="save-settings-btn" class="btn">Save & Close</button>
    </div>
</div>
```

### Event Listeners

In game.js:

```javascript
// Settings button in menu
document.getElementById('settings-btn').addEventListener('click', () => {
    settingsScreen.show();
});

// Volume sliders
document.getElementById('master-volume').addEventListener('input', (e) => {
    settingsScreen.setMasterVolume(e.target.value);
});

document.getElementById('music-volume').addEventListener('input', (e) => {
    settingsScreen.setMusicVolume(e.target.value);
});

document.getElementById('sfx-volume').addEventListener('input', (e) => {
    settingsScreen.setSfxVolume(e.target.value);
});

// Text speed slider
document.getElementById('text-speed').addEventListener('input', (e) => {
    settingsScreen.setTextSpeed(e.target.value);
});

// Accessibility checkboxes
document.getElementById('reduce-motion').addEventListener('change', () => {
    settingsScreen.toggleReduceMotion();
});

document.getElementById('high-contrast').addEventListener('change', () => {
    settingsScreen.toggleHighContrast();
});

// Reset button
document.getElementById('reset-settings-btn').addEventListener('click', () => {
    playClickSound();
    settingsScreen.reset();
});

// Save & Close button
document.getElementById('save-settings-btn').addEventListener('click', () => {
    playClickSound();
    settingsScreen.saveSettings();
    showScreen('menu-screen');
});
```

### CSS for Accessibility

Add to styles.css:

```css
/* Reduce motion */
body.reduce-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
}

/* High contrast */
body.high-contrast {
    --text-color: #ffffff;
    --bg-color: #000000;
    --accent-color: #ffff00;
}

body.high-contrast .btn {
    border: 3px solid var(--accent-color);
}
```

### Testing Checklist

- [ ] Settings screen opens from menu
- [ ] Master volume affects all audio
- [ ] Music volume affects background music only
- [ ] SFX volume affects sound effects only
- [ ] Text speed changes typewriter speed
- [ ] Reduce motion disables animations
- [ ] High contrast mode applies
- [ ] Settings persist after page reload
- [ ] Reset to defaults works
- [ ] Save & Close returns to menu
- [ ] Settings apply immediately when changed

### Changes to index.html

Add script tag and settings button to menu:
```html
<!-- In menu screen -->
<button id="settings-btn" class="btn">Settings</button>

<!-- Scripts -->
<script src="screens/settings-screen.js"></script>
```

---

## Task 21: Dialogue History & Skip/Replay

**Estimated Time:** 3-4 hours
**Risk:** 🟢 Low
**Files to Create:** `core/dialogue-history.js`

### Overview

Track all dialogue that's been shown and allow players to:
- View dialogue history (backlog)
- Skip through previously-seen dialogue quickly
- Mark sections as "seen" for skip functionality

### Implementation

**core/dialogue-history.js:**

```javascript
class DialogueHistory {
    constructor() {
        this.history = [];
        this.maxHistory = 100; // Keep last 100 dialogue entries
        this.seenDialogue = new Set(); // Track seen dialogue IDs
        this.loadSeenDialogue();
    }

    /**
     * Add dialogue to history
     * @param {string} text - Dialogue text
     * @param {string} screen - Screen where dialogue occurred
     * @param {string} id - Unique dialogue ID (optional)
     */
    addEntry(text, screen, id = null) {
        const entry = {
            text,
            screen,
            timestamp: Date.now(),
            id
        };

        this.history.push(entry);

        // Keep only last maxHistory entries
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        // Mark as seen if ID provided
        if (id) {
            this.seenDialogue.add(id);
            this.saveSeenDialogue();
        }
    }

    /**
     * Check if dialogue has been seen
     * @param {string} id - Dialogue ID
     * @returns {boolean}
     */
    hasSeenDialogue(id) {
        return this.seenDialogue.has(id);
    }

    /**
     * Get recent history entries
     * @param {number} count - Number of entries to get
     * @returns {Array}
     */
    getRecent(count = 20) {
        return this.history.slice(-count);
    }

    /**
     * Clear all history
     */
    clear() {
        this.history = [];
    }

    /**
     * Reset seen dialogue (for new playthrough)
     */
    resetSeen() {
        this.seenDialogue.clear();
        localStorage.removeItem('christmas-gift-seen-dialogue');
    }

    /**
     * Save seen dialogue to localStorage
     */
    saveSeenDialogue() {
        const seen = Array.from(this.seenDialogue);
        localStorage.setItem('christmas-gift-seen-dialogue', JSON.stringify(seen));
    }

    /**
     * Load seen dialogue from localStorage
     */
    loadSeenDialogue() {
        try {
            const saved = localStorage.getItem('christmas-gift-seen-dialogue');
            if (saved) {
                const seen = JSON.parse(saved);
                this.seenDialogue = new Set(seen);
            }
        } catch (error) {
            console.error('Failed to load seen dialogue:', error);
        }
    }

    /**
     * Show dialogue history UI
     */
    showHistory() {
        const modal = document.getElementById('history-modal');
        const container = document.getElementById('history-container');

        container.innerHTML = '';

        const recent = this.getRecent(20);
        recent.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'history-entry';
            div.textContent = entry.text;
            container.appendChild(div);
        });

        modal.style.display = 'flex';
    }
}

const dialogueHistory = new DialogueHistory();
```

### Integration with typeText

Modify `typeText()` in game.js to track dialogue:

```javascript
async function typeText(text, isLoudOrOptions = false, targetElement = null) {
    // ... existing code ...

    // At the end of function, add to history
    const screen = gameState.currentScreen;
    const dialogueId = isLoudOrOptions.id || null; // Can pass ID in options
    dialogueHistory.addEntry(text, screen, dialogueId);

    gameState.isTyping = false;
}
```

### Skip Functionality

Add skip mode to game:

```javascript
// In game.js, add skip state
gameState.skipMode = false;

// Add skip toggle function
function toggleSkipMode() {
    gameState.skipMode = !gameState.skipMode;
    const skipIndicator = document.getElementById('skip-indicator');
    if (gameState.skipMode) {
        skipIndicator.style.display = 'block';
    } else {
        skipIndicator.style.display = 'none';
    }
}

// Modify typeText to auto-advance in skip mode
async function typeText(text, isLoudOrOptions = false, targetElement = null) {
    // ... existing code ...

    // If in skip mode and dialogue has been seen, type instantly
    const dialogueId = isLoudOrOptions.id || null;
    if (gameState.skipMode && dialogueId && dialogueHistory.hasSeenDialogue(dialogueId)) {
        // Show text instantly
        target.innerHTML = '';
        const span = document.createElement('span');
        span.textContent = text;
        target.appendChild(span);
        gameState.isTyping = false;

        // Auto-advance after short delay
        setTimeout(() => {
            if (gameState.skipMode) {
                // Call appropriate advance function based on screen
                const advanceFn = {
                    'dialogue-screen': () => introScreen.advance(false),
                    'leads-screen': () => leadsScreen.advance(false),
                    // ... etc
                }[gameState.currentScreen];

                if (advanceFn) advanceFn();
            }
        }, 200);
        return;
    }

    // ... rest of normal typing code ...
}
```

### HTML UI

Add to index.html:

```html
<!-- History button (always visible during gameplay) -->
<button id="history-btn" class="overlay-btn" title="Dialogue History">H</button>

<!-- Skip indicator -->
<div id="skip-indicator" style="display: none;">SKIP MODE</div>

<!-- History Modal -->
<div id="history-modal" class="modal" style="display: none;">
    <div class="modal-content">
        <h2>Dialogue History</h2>
        <div id="history-container" class="history-scroll"></div>
        <button id="close-history-btn" class="btn">Close</button>
    </div>
</div>
```

### Event Listeners

```javascript
// History button
document.getElementById('history-btn').addEventListener('click', () => {
    playClickSound();
    dialogueHistory.showHistory();
});

// Close history
document.getElementById('close-history-btn').addEventListener('click', () => {
    document.getElementById('history-modal').style.display = 'none';
});

// Skip mode toggle (Ctrl key)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Control') {
        toggleSkipMode();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Control') {
        toggleSkipMode();
    }
});
```

### Testing Checklist

- [ ] Dialogue history tracks all text
- [ ] History modal shows recent dialogue
- [ ] Seen dialogue persists across sessions
- [ ] Skip mode activates with Ctrl key
- [ ] Skip mode auto-advances seen dialogue
- [ ] Skip mode stops on unseen dialogue
- [ ] Skip indicator shows when active
- [ ] History button accessible from all screens
- [ ] Reset clears seen dialogue

---

## Summary

These three major features significantly enhance the player experience:

**Task 19 - Save/Load:**
- Auto-save at checkpoints
- 3 manual save slots
- Continue from start screen
- Progress tracking

**Task 20 - Settings:**
- Volume controls (master, music, SFX)
- Text speed adjustment
- Accessibility options
- Persistent settings

**Task 21 - Dialogue History:**
- Backlog viewing
- Skip seen dialogue
- Progress tracking

**Total Implementation Time:** 13-18 hours
**Impact:** Professional-quality visual novel experience

---

## Usage Template

```
I'm adding features to a visual novel game. Here's the repo.
Please complete Task [NUMBER] from REFACTOR_ROADMAP_FEATURES.md - remember, no ES6 modules, global scope only.
Show me exactly what has changed, then I'll test it.
Make sure to review after finishing to not miss anything.
```

---

*Feature Roadmap - Created December 28, 2024*
