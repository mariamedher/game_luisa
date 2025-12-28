// ============================================
// IDENTIFY SCREEN
// Final suspect identification, fear/dream sequences, and finale
// Global scope - no ES6 modules
// ============================================

class IdentifyScreen {
    constructor() {
        this.state = {
            // Main dialogue state
            dialogueIndex: 0,
            phase: 'intro', // 'intro', 'grid', 'afterEvidence', 'fears', 'dreams', 'finale', 'complete'
            waitingForInput: false,

            // Evidence grid state
            revealedEvidence: [],
            currentEvidence: null,
            evidenceDialogueIndex: 0,

            // Fear sequence state
            fearIntroIndex: 0,
            fearClusterIndex: 0,
            fearDialogueIndex: 0,
            crossingEnabled: false,
            crossedClusters: 0,
            additionalClusterIndex: 0,
            fearConclusionIndex: 0,
            activeClusterIndex: 0,
            clusterDialogueStarted: false,
            depressionLevel: 0,
            floatingFearsController: null,

            // Dreams sequence state
            revealedDreams: [],
            dreamsConclusionIndex: 0,

            // Finale state
            finaleFloatingController: null,
            finaleDialogueIndex: 0,
            wrongAnswerCount: 0
        };

        this.elements = {
            screen: document.getElementById('identify-screen'),
            area: document.getElementById('identify-area'),
            portrait: document.getElementById('identify-portrait'),
            luisa: document.getElementById('identify-luisa'),
            dialogueBox: document.getElementById('identify-dialogue-box'),
            dialogueText: document.getElementById('identify-dialogue-text'),
            enterHint: document.getElementById('identify-enter-hint'),
            choices: document.getElementById('identify-choices'),
            continueBtn: document.getElementById('identify-continue-btn'),
            actions: document.getElementById('identify-actions'),
            grid: document.getElementById('identify-grid'),
            fearWordsContainer: document.getElementById('fear-words-container'),
            dreamsContainer: document.getElementById('dreams-container'),
            finaleInputContainer: document.getElementById('finale-input-container'),
            finaleNameInput: document.getElementById('finale-name-input'),
            finaleSubmitBtn: document.getElementById('finale-submit-btn'),
            fadeOverlay: document.getElementById('fade-overlay'),
            fadeOverlayText: document.getElementById('fade-overlay-text'),
            persistentLeads: document.getElementById('persistent-leads')
        };

        this.data = DIALOGUES.identifySuspect;
    }

    async start() {
        // Reset state
        this.state.dialogueIndex = 0;
        this.state.phase = 'intro';
        this.state.revealedEvidence = [];
        this.state.currentEvidence = null;
        this.state.evidenceDialogueIndex = 0;

        // Hide grid initially
        this.elements.grid.style.display = 'none';

        // Reset grid items
        this.elements.grid.querySelectorAll('.identify-item').forEach(item => {
            item.classList.remove('revealed');
            item.disabled = false;
            const label = item.querySelector('.identify-label');
            const itemId = item.dataset.item;
            const itemData = this.data.evidenceItems[itemId];
            if (itemData && label) {
                label.textContent = itemData.name;
            }
        });

        // Clear dialogue
        this.elements.dialogueText.textContent = '';
        hideInputs('identify-screen');

        // Hide leads list during identify section
        this.elements.persistentLeads.style.display = 'none';

        showScreen('identify-screen');
        await this.processDialogue();
    }

    async processDialogue() {
        hideInputs('identify-screen');
        this.state.waitingForInput = false;
        gameState.waitingForInput = false;

        let dialogue;
        let index;

        if (this.state.phase === 'intro') {
            dialogue = this.data.intro;
            index = this.state.dialogueIndex;
        } else if (this.state.phase === 'afterEvidence') {
            dialogue = this.data.afterEvidence;
            index = this.state.dialogueIndex;
        } else {
            return;
        }

        if (index >= dialogue.length) {
            // Phase complete
            if (this.state.phase === 'intro') {
                return;
            } else if (this.state.phase === 'afterEvidence') {
                this.state.phase = 'complete';
                return;
            }
            return;
        }

        const item = dialogue[index];

        // Handle special actions
        if (item.action === 'music_change') {
            audioManager.fadeToTrack('bgm-final', 2000);
            await typeText(item.text, false, this.elements.dialogueText);
            this.state.waitingForInput = true;
            gameState.waitingForInput = true;
            this.elements.enterHint.style.display = 'block';
            return;
        }

        if (item.action === 'show_grid') {
            await typeText(item.text, false, this.elements.dialogueText);
            this.elements.grid.style.display = 'flex';
            this.elements.grid.classList.remove('fade-out');
            this.state.phase = 'grid';
            this.setGridEnabled(true);
            return;
        }

        if (item.action === 'hide_grid') {
            await typeText(item.text, false, this.elements.dialogueText);
            this.elements.grid.classList.add('fade-out');
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.elements.grid.style.display = 'none';
            this.elements.grid.classList.remove('fade-out');
            this.state.waitingForInput = true;
            gameState.waitingForInput = true;
            this.elements.enterHint.style.display = 'block';
            return;
        }

        if (item.action === 'choice') {
            await typeText(item.text, item.loud, this.elements.dialogueText);

            // Disable waiting for input - player must make a choice
            this.state.waitingForInput = false;
            gameState.waitingForInput = false;

            this.elements.choices.innerHTML = '';
            this.elements.choices.style.display = 'flex';

            item.choices.forEach((choice, choiceIndex) => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';

                if (item.choiceHover && item.choiceHover[choiceIndex]) {
                    btn.classList.add('btn-hover-change');
                    btn.innerHTML = `<span class="btn-text-default">${choice}</span><span class="btn-text-hover">${item.choiceHover[choiceIndex]}</span>`;
                } else {
                    btn.textContent = choice;
                }

                btn.onclick = () => this.handleChoice(choiceIndex, item.responses[choiceIndex]);
                this.elements.choices.appendChild(btn);
            });
            return;
        }

        // Default: wait action
        await typeText(item.text, item.loud, this.elements.dialogueText);
        this.state.waitingForInput = true;
        gameState.waitingForInput = true;
        this.elements.enterHint.style.display = 'block';
    }

    async handleChoice(choiceIndex, response) {
        audioManager.playSfx('click');
        this.elements.choices.style.display = 'none';

        for (const item of response) {
            if (item.action === 'choice') {
                await typeText(item.text, item.loud, this.elements.dialogueText);

                // Disable waiting for input - player must make a choice
                this.state.waitingForInput = false;
                gameState.waitingForInput = false;

                this.elements.choices.innerHTML = '';
                this.elements.choices.style.display = 'flex';

                item.choices.forEach((choice, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn';
                    btn.textContent = choice;
                    btn.onclick = () => this.handleChoice(idx, item.responses[idx]);
                    this.elements.choices.appendChild(btn);
                });
                return;
            }

            if (item.action === 'music_change') {
                audioManager.fadeToTrack('bgm-final', 2000);
                this.elements.persistentLeads.style.display = 'none';
            }

            if (item.action === 'start_fears') {
                await typeText(item.text, item.loud, this.elements.dialogueText);
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.startFearSequence();
                return;
            }

            await typeText(item.text, item.loud, this.elements.dialogueText);

            await new Promise(resolve => {
                this.state.waitingForInput = true;
                gameState.waitingForInput = true;
                this.elements.enterHint.style.display = 'block';

                const handler = () => {
                    if (this.state.waitingForInput) {
                        audioManager.playSfx('click');
                        this.state.waitingForInput = false;
                        gameState.waitingForInput = false;
                        this.elements.enterHint.style.display = 'none';
                        this.elements.dialogueBox.removeEventListener('click', handler);
                        document.removeEventListener('keydown', keyHandler);
                        resolve();
                    }
                };
                const keyHandler = (e) => {
                    if (e.key === 'Enter') {
                        handler();
                    }
                };
                this.elements.dialogueBox.addEventListener('click', handler);
                document.addEventListener('keydown', keyHandler);
            });
        }

        this.state.dialogueIndex++;
        this.processDialogue();
    }

    advanceDialogue(playSound = true) {
        if (this.state.waitingForInput && !gameState.isTyping) {
            if (playSound) audioManager.playSfx('click');
            this.state.waitingForInput = false;
            gameState.waitingForInput = false;
            this.elements.enterHint.style.display = 'none';
            this.state.dialogueIndex++;
            this.processDialogue();
        }
    }

    setGridEnabled(enabled) {
        this.elements.grid.querySelectorAll('.identify-item').forEach(item => {
            if (!item.classList.contains('revealed')) {
                item.disabled = !enabled;
            }
        });
    }

    async handleItemClick(itemId) {
        const itemData = this.data.evidenceItems[itemId];
        if (!itemData) return;

        this.setGridEnabled(false);
        this.state.currentEvidence = itemId;
        this.state.evidenceDialogueIndex = 0;
        gameState.currentIdentifyEvidence = itemId;

        await this.processEvidenceDialogue();
    }

    async processEvidenceDialogue() {
        hideInputs('identify-screen');

        const itemId = this.state.currentEvidence;
        const itemData = this.data.evidenceItems[itemId];

        if (this.state.evidenceDialogueIndex >= itemData.dialogue.length) {
            const trait = itemData.trait;

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

            await new Promise(resolve => setTimeout(resolve, 4000));

            const itemEl = this.elements.grid.querySelector(`[data-item="${itemId}"]`);
            if (itemEl) {
                itemEl.classList.add('revealed');
                const label = itemEl.querySelector('.identify-label');
                if (label) {
                    label.textContent = trait;
                }
            }

            floatingController.stop();
            await new Promise(resolve => setTimeout(resolve, 3000));

            if (!this.state.revealedEvidence.includes(itemId)) {
                this.state.revealedEvidence.push(itemId);
                gameState.revealedEvidence = this.state.revealedEvidence;
            }

            this.state.currentEvidence = null;
            this.state.evidenceDialogueIndex = 0;
            gameState.currentIdentifyEvidence = null;

            const allItems = Object.keys(this.data.evidenceItems);
            if (this.state.revealedEvidence.length >= allItems.length) {
                this.elements.dialogueText.textContent = '';
                this.state.phase = 'afterEvidence';
                this.state.dialogueIndex = 0;
                this.processDialogue();
            } else {
                this.elements.dialogueText.textContent = 'Select another item to examine.';
                this.setGridEnabled(true);
            }
            return;
        }

        const item = itemData.dialogue[this.state.evidenceDialogueIndex];

        await typeText(item.text, item.loud, this.elements.dialogueText);
        this.state.waitingForInput = true;
        gameState.waitingForInput = true;
        this.elements.enterHint.style.display = 'block';
    }

    advanceEvidenceDialogue(playSound = true) {
        if (this.state.currentEvidence && this.state.waitingForInput && !gameState.isTyping) {
            if (playSound) audioManager.playSfx('click');
            this.state.waitingForInput = false;
            gameState.waitingForInput = false;
            this.elements.enterHint.style.display = 'none';
            this.state.evidenceDialogueIndex++;
            this.processEvidenceDialogue();
        }
    }

    // ============================================
    // FEAR SEQUENCE
    // ============================================
    startFearSequence() {
        this.state.phase = 'fears';
        this.state.fearIntroIndex = 0;
        this.state.fearClusterIndex = 0;
        this.state.fearDialogueIndex = 0;
        this.state.crossingEnabled = false;
        this.state.crossedClusters = 0;
        this.state.additionalClusterIndex = 0;
        this.state.fearConclusionIndex = 0;
        this.state.activeClusterIndex = 0;
        this.state.clusterDialogueStarted = false;

        this.elements.fearWordsContainer.innerHTML = '';
        this.elements.fearWordsContainer.style.display = 'none';

        const fearData = this.data.fears;
        const allFearWords = [];
        fearData.wordClusters.forEach(c => allFearWords.push(...c.words));
        fearData.additionalClusters.forEach(c => allFearWords.push(...c.words));

        this.state.floatingFearsController = createFloatingText(
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

        this.processFearIntro();
    }

    async processFearIntro() {
        hideInputs('identify-screen');

        const fearData = this.data.fears;

        if (this.state.fearIntroIndex >= fearData.intro.length) {
            return;
        }

        const item = fearData.intro[this.state.fearIntroIndex];

        await typeText(item.text, false, this.elements.dialogueText);

        if (item.action === 'show_fears') {
            this.elements.fearWordsContainer.style.display = 'flex';
            this.state.fearIntroIndex++;
            this.showNextFearCluster();
        } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.state.fearIntroIndex++;
            this.processFearIntro();
        }
    }

    async showNextFearCluster() {
        const fearData = this.data.fears;

        if (this.state.fearClusterIndex >= fearData.wordClusters.length) {
            return;
        }

        const cluster = fearData.wordClusters[this.state.fearClusterIndex];

        this.setDepressionLevel(cluster.depressionStage);

        if (cluster.depressionStage === 1) {
            audioManager.currentTrack.element.volume = 0.15;
        } else if (cluster.depressionStage >= 2) {
            audioManager.currentTrack.element.volume = 0;
        }

        for (const word of cluster.words) {
            await this.typeWordToContainer(word, cluster.doubleClick === word, this.state.fearClusterIndex);
            await new Promise(resolve => setTimeout(resolve, 400));
        }

        await new Promise(resolve => setTimeout(resolve, 800));

        this.state.fearDialogueIndex = 0;
        this.processFearClusterDialogue();
    }

    async typeWordToContainer(word, needsDoubleClick = false, clusterIndex = 0) {
        const wordEl = document.createElement('span');
        wordEl.className = 'fear-word';
        wordEl.dataset.word = word;
        wordEl.dataset.cluster = clusterIndex;
        if (needsDoubleClick) {
            wordEl.dataset.doubleClick = 'true';
            wordEl.dataset.clicks = '0';
        }
        wordEl.textContent = '';
        this.elements.fearWordsContainer.appendChild(wordEl);

        for (let i = 0; i < word.length; i++) {
            wordEl.textContent = word.substring(0, i + 1);
            if (this.state.depressionLevel > 0 && /[a-zA-Z]/.test(word[i])) {
                animalese.playLetter(word[i], false, 'low');
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    async processFearClusterDialogue() {
        const fearData = this.data.fears;
        const cluster = fearData.wordClusters[this.state.fearClusterIndex];

        if (this.state.fearDialogueIndex >= cluster.afterAppear.length) {
            return;
        }

        const item = cluster.afterAppear[this.state.fearDialogueIndex];

        await typeText(item.text, item.loud, this.elements.dialogueText);

        if (item.action === 'show_next_cluster') {
            this.state.fearClusterIndex++;
            this.state.fearDialogueIndex = 0;

            if (this.state.fearClusterIndex < fearData.wordClusters.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
                this.showNextFearCluster();
            }
        } else if (item.action === 'enable_crossing') {
            this.state.activeClusterIndex = 0;
            this.state.crossingEnabled = true;
            this.enableFearWordClicking();
        } else {
            await new Promise(resolve => setTimeout(resolve, 1200));
            this.state.fearDialogueIndex++;
            this.processFearClusterDialogue();
        }
    }

    enableFearWordClicking() {
        const activeCluster = this.state.activeClusterIndex;
        const words = this.elements.fearWordsContainer.querySelectorAll(`.fear-word[data-cluster="${activeCluster}"]:not(.crossed-out)`);
        words.forEach(wordEl => {
            wordEl.classList.add('clickable');
            wordEl.onclick = () => this.handleFearWordClick(wordEl);
        });
    }

    async handleFearWordClick(wordEl) {
        if (!this.state.crossingEnabled) return;

        const needsDouble = wordEl.dataset.doubleClick === 'true';
        const clicks = parseInt(wordEl.dataset.clicks || '0');

        if (needsDouble) {
            if (clicks === 0) {
                wordEl.dataset.clicks = '1';
                wordEl.classList.add('crossed-out');
                audioManager.playSfx('click');
                return;
            } else if (clicks === 1) {
                wordEl.classList.add('double-cross');
                audioManager.playSfx('click');
            }
        } else {
            if (wordEl.classList.contains('crossed-out')) return;
            wordEl.classList.add('crossed-out');
            audioManager.playSfx('click');
        }

        wordEl.onclick = null;
        wordEl.classList.remove('clickable');

        if (!this.state.clusterDialogueStarted) {
            this.state.clusterDialogueStarted = true;
            this.startClusterResponseDialogue();
        }

        const activeCluster = this.state.activeClusterIndex;
        const uncrossedWords = this.elements.fearWordsContainer.querySelectorAll(`.fear-word[data-cluster="${activeCluster}"]:not(.crossed-out)`);
        const partiallyDouble = this.elements.fearWordsContainer.querySelectorAll(`.fear-word[data-cluster="${activeCluster}"].crossed-out:not(.double-cross)[data-double-click="true"]`);

        if (uncrossedWords.length === 0 && partiallyDouble.length === 0) {
            await this.handleClusterCrossedOut();
        }
    }

    startClusterResponseDialogue() {
        const fearData = this.data.fears;
        if (this.state.crossedClusters < fearData.crossOutResponses.length) {
            const response = fearData.crossOutResponses[this.state.crossedClusters];
            typeText(response.dialogue, false, this.elements.dialogueText);
        } else if (this.state.additionalClusterIndex < fearData.additionalClusters.length) {
            const addCluster = fearData.additionalClusters[this.state.additionalClusterIndex];
            typeText(addCluster.crossOutResponse, false, this.elements.dialogueText);
        }
    }

    async handleClusterCrossedOut() {
        const fearData = this.data.fears;
        this.state.crossingEnabled = false;

        while (gameState.isTyping) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (this.state.crossedClusters < fearData.crossOutResponses.length) {
            const response = fearData.crossOutResponses[this.state.crossedClusters];

            if (response.recoveryStage) {
                this.setRecoveryLevel(response.recoveryStage);
            }

            if (response.showMoreWords) {
                this.state.crossedClusters++;
                this.state.clusterDialogueStarted = false;
                await this.showAdditionalCluster();
            } else {
                this.state.crossedClusters++;
                this.state.clusterDialogueStarted = false;
                this.state.activeClusterIndex++;
                this.state.crossingEnabled = true;
                this.enableFearWordClicking();
            }
        } else if (this.state.additionalClusterIndex < fearData.additionalClusters.length) {
            const addCluster = fearData.additionalClusters[this.state.additionalClusterIndex];

            if (addCluster.recoveryStage) {
                this.setRecoveryLevel(addCluster.recoveryStage);
            }

            this.state.additionalClusterIndex++;
            this.state.clusterDialogueStarted = false;

            if (this.state.additionalClusterIndex < fearData.additionalClusters.length) {
                await this.showAdditionalCluster();
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.processFearConclusion();
            }
        }
    }

    async showAdditionalCluster() {
        const fearData = this.data.fears;
        if (this.state.additionalClusterIndex >= fearData.additionalClusters.length) {
            return;
        }

        const cluster = fearData.additionalClusters[this.state.additionalClusterIndex];
        const clusterIndex = fearData.wordClusters.length + this.state.additionalClusterIndex;

        this.state.activeClusterIndex = clusterIndex;

        const separator = document.createElement('div');
        separator.className = 'fear-word-separator';
        this.elements.fearWordsContainer.appendChild(separator);

        for (const word of cluster.words) {
            await this.typeWordToContainer(word, false, clusterIndex);
            await new Promise(resolve => setTimeout(resolve, 400));
        }

        this.state.crossingEnabled = true;
        this.enableFearWordClicking();
    }

    async processFearConclusion() {
        const fearData = this.data.fears;
        hideInputs('identify-screen');

        if (this.state.floatingFearsController) {
            this.state.floatingFearsController.stop();
        }

        if (this.state.fearConclusionIndex >= fearData.conclusion.length) {
            this.state.phase = 'complete';
            audioManager.currentTrack.element.volume = 0.3;
            return;
        }

        const item = fearData.conclusion[this.state.fearConclusionIndex];

        await typeText(item.text, false, this.elements.dialogueText);

        if (item.action === 'fade_words') {
            this.elements.fearWordsContainer.style.transition = 'opacity 2s ease';
            this.elements.fearWordsContainer.style.opacity = '0';
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.elements.fearWordsContainer.style.display = 'none';
            this.elements.fearWordsContainer.innerHTML = '';

            this.state.fearConclusionIndex++;
            this.processFearConclusion();
        } else if (item.action === 'full_recovery') {
            this.setRecoveryLevel(4);

            if (this.state.floatingFearsController) {
                this.state.floatingFearsController.clear();
            }

            audioManager.currentTrack.element.volume = 0.3;

            await new Promise(resolve => setTimeout(resolve, 1500));
            this.state.fearConclusionIndex++;
            this.processFearConclusion();
        } else if (item.action === 'show_dreams') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.startDreamsSequence();
        } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.state.fearConclusionIndex++;
            this.processFearConclusion();
        }
    }

    setDepressionLevel(level) {
        this.elements.area.classList.remove(
            'depression-1', 'depression-2', 'depression-3', 'depression-4',
            'recovery-1', 'recovery-2', 'recovery-3', 'recovery-4'
        );

        this.state.depressionLevel = level;
        gameState.depressionLevel = level;

        if (level > 0 && level <= 4) {
            this.elements.area.classList.add(`depression-${level}`);
        }
    }

    setRecoveryLevel(level) {
        this.elements.area.classList.remove(
            'depression-1', 'depression-2', 'depression-3', 'depression-4',
            'recovery-1', 'recovery-2', 'recovery-3', 'recovery-4'
        );

        if (level > 0 && level <= 4) {
            this.elements.area.classList.add(`recovery-${level}`);
        }
    }

    // ============================================
    // DREAMS SEQUENCE
    // ============================================
    startDreamsSequence() {
        this.state.phase = 'dreams';
        this.state.revealedDreams = [];
        this.state.dreamsConclusionIndex = 0;

        const dreamsData = this.data.dreams;

        this.elements.dreamsContainer.innerHTML = '';
        dreamsData.items.forEach((dream, index) => {
            const dreamEl = document.createElement('div');
            dreamEl.className = 'dream-item';
            dreamEl.dataset.index = index;
            dreamEl.innerHTML = `
                <span class="surface-text">${dream.surface}</span>
                <span class="hidden-text">${dream.hidden}</span>
            `;
            dreamEl.onclick = () => this.handleDreamClick(index);
            this.elements.dreamsContainer.appendChild(dreamEl);
        });

        this.elements.dreamsContainer.style.display = 'flex';
    }

    async handleDreamClick(index) {
        if (this.state.revealedDreams.includes(index)) return;

        const dreamsData = this.data.dreams;
        const dreamEl = this.elements.dreamsContainer.querySelector(`[data-index="${index}"]`);
        const dream = dreamsData.items[index];

        this.state.revealedDreams.push(index);
        dreamEl.classList.add('revealed');
        dreamEl.onclick = null;

        audioManager.playSfx('click');

        await typeText(dream.response, false, this.elements.dialogueText);

        if (this.state.revealedDreams.length >= dreamsData.items.length) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.processDreamsConclusion();
        }
    }

    async processDreamsConclusion() {
        const dreamsData = this.data.dreams;

        if (this.state.dreamsConclusionIndex >= dreamsData.conclusion.length) {
            this.elements.dreamsContainer.style.transition = 'opacity 2s ease';
            this.elements.dreamsContainer.style.opacity = '0';
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.elements.dreamsContainer.style.display = 'none';

            this.state.phase = 'complete';
            return;
        }

        const item = dreamsData.conclusion[this.state.dreamsConclusionIndex];

        // If lowOpacity, append it to the previous dialogue (don't clear)
        if (item.lowOpacity) {
            // Add a space before the whispered text
            this.elements.dialogueText.appendChild(document.createTextNode(' '));
            const span = document.createElement('span');
            span.classList.add('low-opacity-text');
            this.elements.dialogueText.appendChild(span);
            await typeText(item.text, false, span);
        } else {
            await typeText(item.text, false, this.elements.dialogueText);
        }

        if (item.action === 'show_finale') {
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.startFinaleSequence();
        } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.state.dreamsConclusionIndex++;
            this.processDreamsConclusion();
        }
    }

    // ============================================
    // FINALE SEQUENCE
    // ============================================
    startFinaleSequence() {
        this.state.phase = 'finale';
        this.state.finaleDialogueIndex = 0;
        this.state.wrongAnswerCount = 0;

        const finaleData = this.data.finale;

        this.elements.dreamsContainer.style.display = 'none';

        this.state.finaleFloatingController = createFloatingText(
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

        this.showFinaleInput();
    }

    async showFinaleInput() {
        const finaleData = this.data.finale;
        await typeText(finaleData.prompt, false, this.elements.dialogueText);

        await new Promise(resolve => setTimeout(resolve, 500));
        this.elements.finaleInputContainer.style.display = 'flex';
        this.elements.finaleNameInput.value = '';
        this.elements.finaleNameInput.focus();
    }

    handleFinaleSubmit() {
        const finaleData = this.data.finale;
        const answer = this.elements.finaleNameInput.value.trim().toLowerCase();

        const validAnswers = [...finaleData.validAnswers];
        if (gameState.playerName) {
            validAnswers.push(gameState.playerName.toLowerCase());
        }

        if (validAnswers.includes(answer)) {
            audioManager.playSfx('click');
            this.elements.finaleInputContainer.style.display = 'none';
            this.startFinalReveal();
        } else {
            audioManager.playSfx('click');
            const messages = finaleData.wrongAnswerMessages;
            const message = messages[this.state.wrongAnswerCount % messages.length];
            this.state.wrongAnswerCount++;

            this.elements.finaleNameInput.value = '';
            typeText(message, false, this.elements.dialogueText).then(() => {
                this.elements.finaleNameInput.focus();
            });
        }
    }

    async startFinalReveal() {
        this.elements.actions.style.display = 'none';
        this.elements.grid.style.display = 'none';
        this.elements.enterHint.style.display = 'none';
        this.elements.finaleInputContainer.style.display = 'none';

        this.elements.luisa.style.display = 'block';
        this.elements.area.classList.add('finale-mode');
        this.elements.dialogueText.innerHTML = '';

        await new Promise(resolve => setTimeout(resolve, 800));

        this.elements.luisa.classList.add('visible');

        await new Promise(resolve => setTimeout(resolve, 3000));

        this.processFinaleDialogue();
    }

    async processFinaleDialogue() {
        const finaleData = this.data.finale;

        if (this.state.finaleDialogueIndex >= finaleData.finalDialogue.length) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            this.elements.fadeOverlay.classList.add('active');

            if (this.state.finaleFloatingController) {
                this.state.finaleFloatingController.stop();
            }

            await audioManager.fadeOut(audioManager.currentTrack.element, 3000);

            await new Promise(resolve => setTimeout(resolve, 4000));
            endScreen.show();
            this.elements.fadeOverlay.classList.remove('active');
            return;
        }

        const item = finaleData.finalDialogue[this.state.finaleDialogueIndex];

        if (item.action === 'start_fade') {
            this.elements.portrait.classList.add('bean-up');
            this.elements.luisa.classList.add('bean-up');

            if (this.state.finaleFloatingController) {
                this.state.finaleFloatingController.stop();
            }

            audioManager.fadeOut(audioManager.currentTrack.element, 8000);
        }

        this.elements.dialogueText.innerHTML = '';
        const speakerClass = item.speaker === 'luisa' ? 'speaker-luisa' : 'speaker-mol';
        const voicePitch = item.speaker === 'luisa' ? 'luisa' : 'normal';

        await this.typeTextToElement(item.text, this.elements.dialogueText, speakerClass, voicePitch);

        if (item.action === 'end') {
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.elements.fadeOverlay.classList.add('active');

            await new Promise(resolve => setTimeout(resolve, 3500));

            const endMessages = finaleData.endMessages || [];
            for (const message of endMessages) {
                this.elements.fadeOverlayText.textContent = message;
                this.elements.fadeOverlayText.classList.add('visible');

                await new Promise(resolve => setTimeout(resolve, 4000));

                this.elements.fadeOverlayText.classList.remove('visible');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            endScreen.show();
            this.elements.fadeOverlay.classList.remove('active');
            this.elements.fadeOverlayText.textContent = '';
        } else {
            await new Promise(resolve => setTimeout(resolve, 1800));
            this.state.finaleDialogueIndex++;
            this.processFinaleDialogue();
        }
    }

    async typeTextToElement(text, element, className, pitch = 'normal') {
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
    // ADVANCE METHODS
    // ============================================
    advance(playSound = true) {
        if (this.state.phase === 'fears') {
            // Fear sequence has different states
            const fearData = this.data.fears;
            if (this.state.fearConclusionIndex > 0 ||
                (this.state.crossedClusters >= fearData.crossOutResponses.length &&
                 this.state.additionalClusterIndex >= fearData.additionalClusters.length)) {
                // In conclusion phase - do nothing, auto-advances
            } else if (this.state.fearIntroIndex < fearData.intro.length) {
                // In intro - do nothing, auto-advances
            } else if (!this.state.crossingEnabled) {
                // In cluster dialogue - do nothing, auto-advances
            }
            // If crossing is enabled, don't advance - player must click words
        } else if (this.state.currentEvidence) {
            this.advanceEvidenceDialogue(playSound);
        } else if (this.state.phase !== 'grid') {
            this.advanceDialogue(playSound);
        }
    }

    // ============================================
    // RESET
    // ============================================
    reset() {
        // Main state
        this.state.dialogueIndex = 0;
        this.state.phase = 'intro';
        this.state.waitingForInput = false;

        // Evidence grid state
        this.state.revealedEvidence = [];
        this.state.currentEvidence = null;
        this.state.evidenceDialogueIndex = 0;

        // Fear sequence state
        this.state.fearIntroIndex = 0;
        this.state.fearClusterIndex = 0;
        this.state.fearDialogueIndex = 0;
        this.state.crossingEnabled = false;
        this.state.crossedClusters = 0;
        this.state.additionalClusterIndex = 0;
        this.state.fearConclusionIndex = 0;
        this.state.activeClusterIndex = 0;
        this.state.clusterDialogueStarted = false;
        this.state.depressionLevel = 0;

        if (this.state.floatingFearsController) {
            this.state.floatingFearsController.clear();
            this.state.floatingFearsController = null;
        }

        // Dreams state
        this.state.revealedDreams = [];
        this.state.dreamsConclusionIndex = 0;

        // Finale state
        this.state.finaleDialogueIndex = 0;
        this.state.wrongAnswerCount = 0;

        if (this.state.finaleFloatingController) {
            this.state.finaleFloatingController.clear();
            this.state.finaleFloatingController = null;
        }

        // Reset DOM elements
        this.elements.area.classList.remove(
            'depression-1', 'depression-2', 'depression-3', 'depression-4',
            'recovery-1', 'recovery-2', 'recovery-3', 'recovery-4',
            'finale-mode'
        );
        this.elements.fearWordsContainer.innerHTML = '';
        this.elements.fearWordsContainer.style.display = 'none';
        this.elements.fearWordsContainer.style.opacity = '1';
        this.elements.dreamsContainer.innerHTML = '';
        this.elements.dreamsContainer.style.display = 'none';
        this.elements.dreamsContainer.style.opacity = '1';
        this.elements.finaleInputContainer.style.display = 'none';
        this.elements.portrait.classList.remove('bean-up');
        this.elements.luisa.style.display = 'none';
        this.elements.luisa.classList.remove('visible', 'bean-up');
        this.elements.grid.querySelectorAll('.identify-item').forEach(item => {
            item.disabled = false;
            item.classList.remove('revealed');
        });
        this.elements.grid.style.display = 'none';
        this.elements.fadeOverlay.classList.remove('active');
        this.elements.fadeOverlayText.classList.remove('visible');
        this.elements.fadeOverlayText.textContent = '';

        // Sync with gameState
        gameState.identifyDialogueIndex = 0;
        gameState.identifyPhase = 'intro';
        gameState.revealedEvidence = [];
        gameState.currentIdentifyEvidence = null;
        gameState.identifyEvidenceDialogueIndex = 0;
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
        gameState.revealedDreams = [];
        gameState.dreamsConclusionIndex = 0;
        gameState.finaleDialogueIndex = 0;
        gameState.wrongAnswerCount = 0;
    }
}

// Create global instance
const identifyScreen = new IdentifyScreen();
