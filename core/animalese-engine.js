// ============================================
// ANIMALESE TEXT-TO-SPEECH ENGINE
// Based on animalese.js concept
// Global scope - no ES6 modules
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
