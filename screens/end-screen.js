// ============================================
// END SCREEN
// ============================================

class EndScreen {
    constructor() {
        // Minimal state
    }

    show() {
        audioManager.pauseCurrent();
        elements.persistentLeads.style.display = 'none';
        showScreen('end-screen');
        document.getElementById('end-message').style.display = 'block';
    }

    reset() {
        // Called when playing again
        document.getElementById('end-message').style.display = 'none';
    }
}

// Create global instance
const endScreen = new EndScreen();
