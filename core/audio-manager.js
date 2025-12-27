// ============================================
// AUDIO MANAGER
// Audio management class - global, no ES6 modules
// ============================================
class AudioManager {
    constructor() {
        this.tracks = new Map();
        this.sfxMap = new Map();
        this.currentTrack = null;
        this.currentWitnessMusic = null;
    }

    // Register audio elements
    registerTrack(name, element, defaultVolume = 0.4) {
        this.tracks.set(name, { element, defaultVolume });
    }

    registerSfx(name, element) {
        this.sfxMap.set(name, element);
    }

    // Play background music
    playTrack(name, volume = null) {
        const track = this.tracks.get(name);
        if (!track) return;

        // Stop current track
        if (this.currentTrack) {
            this.currentTrack.element.pause();
        }

        track.element.volume = volume ?? track.defaultVolume;
        track.element.play().catch(() => {});
        this.currentTrack = track;
    }

    // Fade between tracks
    async fadeToTrack(newTrackName, duration = 1000) {
        const newTrack = this.tracks.get(newTrackName);
        if (!newTrack) return;

        // Fade out current
        if (this.currentTrack) {
            await this.fadeOut(this.currentTrack.element, duration / 2);
            this.currentTrack.element.pause();
        }

        // Fade in new
        newTrack.element.volume = 0;
        newTrack.element.play().catch(() => {});
        await this.fadeIn(newTrack.element, newTrack.defaultVolume, duration / 2);
        this.currentTrack = newTrack;
    }

    fadeOut(element, duration) {
        return new Promise(resolve => {
            const startVolume = element.volume;
            const steps = 20;
            const stepTime = duration / steps;
            const stepSize = startVolume / steps;

            const interval = setInterval(() => {
                element.volume = Math.max(0, element.volume - stepSize);
                if (element.volume <= 0.01) {
                    clearInterval(interval);
                    element.volume = 0;
                    resolve();
                }
            }, stepTime);
        });
    }

    fadeIn(element, targetVolume, duration) {
        return new Promise(resolve => {
            const steps = 20;
            const stepTime = duration / steps;
            const stepSize = targetVolume / steps;

            const interval = setInterval(() => {
                element.volume = Math.min(targetVolume, element.volume + stepSize);
                if (element.volume >= targetVolume - 0.01) {
                    clearInterval(interval);
                    element.volume = targetVolume;
                    resolve();
                }
            }, stepTime);
        });
    }

    // Play sound effect
    playSfx(name, onPlay = null) {
        const sfx = this.sfxMap.get(name);
        if (sfx) {
            sfx.currentTime = 0;
            sfx.play().catch(() => {});
            if (onPlay) onPlay();
        }
    }

    // Pause current track
    pauseCurrent() {
        if (this.currentTrack) {
            this.currentTrack.element.pause();
        }
    }

    // Stop all witness music
    stopWitnessMusic() {
        ['bgm-cait', 'bgm-glorp', 'bgm-couple'].forEach(name => {
            const track = this.tracks.get(name);
            if (track) {
                track.element.pause();
                track.element.currentTime = 0;
            }
        });
        this.currentWitnessMusic = null;
    }

    // Switch to witness music
    switchToWitnessMusic(witnessId) {
        this.pauseCurrent();
        this.stopWitnessMusic();

        const trackName = `bgm-${witnessId}`;
        this.playTrack(trackName, 0.3);
        this.currentWitnessMusic = witnessId;
    }

    // Return to main music
    switchToMainMusic() {
        this.stopWitnessMusic();
        this.playTrack('bgm', 0.4);
    }
}
