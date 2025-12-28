const SCREENS = {
    START: 'start-screen',
    DIALOGUE: 'dialogue-screen',
    TITLE: 'title-screen',
    MENU: 'menu-screen',
    LEADS: 'leads-screen',
    EVIDENCE: 'evidence-screen',
    WITNESS: 'witness-screen',
    IDENTIFY: 'identify-screen',
    END: 'end-screen'
};

const ACTIONS = {
    WAIT: 'wait',
    CHOICE: 'choice',
    CONTINUE_BUTTON: 'continue_button',
    NAME_INPUT: 'name_input',
    ADD_LEAD: 'add_lead',
    COLORED_TEXT: 'colored_text',
    SHOW_KOLA: 'show_kola',
    HIDE_KOLA: 'hide_kola',
    END_LEADS: 'end_leads',
    SHOW_IMAGE: 'show_image',
    FLY_AWAY: 'fly_away',
    SPIN: 'spin',
    BEAM_UP: 'beam_up',
    VANISH: 'vanish',
    SHOW_GRID: 'show_grid',
    HIDE_GRID: 'hide_grid',
    START_FEARS: 'start_fears',
    SHOW_FEARS: 'show_fears',
    SHOW_NEXT_CLUSTER: 'show_next_cluster',
    ENABLE_CROSSING: 'enable_crossing',
    FADE_WORDS: 'fade_words',
    FULL_RECOVERY: 'full_recovery',
    SHOW_DREAMS: 'show_dreams',
    SHOW_FINALE: 'show_finale',
    START_FADE: 'start_fade',
    END: 'end',
    MUSIC_CHANGE: 'music_change'
};

const PITCHES = {
    NORMAL: 'normal',
    MEDIUM: 'medium',
    HIGH: 'high',
    LOW: 'low',
    VERY_HIGH: 'veryHigh',
    ALIEN: 'alien',
    LUISA: 'luisa'
};

const SPEAKERS = {
    MOL: 'mol',
    CAIT: 'cait',
    GLORP: 'glorp',
    RAPHAEL: 'r',
    ASTARION: 'a',
    LUISA: 'luisa'
};

const SFX = {
    CLICK: 'click',
    PAPERS: 'papers',
    DICE: 'dice',
    HARP: 'harp',
    MUNCH: 'munch',
    CLACK: 'clack',
    SPARKLE: 'sparkle',
    SURPRISE: 'surprise',
    SQUEAK: 'squeak',
    HELICOPTER: 'helicopter',
    SNAP: 'snap',
    SLURP: 'slurp',
    ALIEN: 'alien',
    SPACESHIP: 'spaceship'
};

const BGM_TRACKS = {
    MAIN: 'bgm',
    CAIT: 'bgm-cait',
    GLORP: 'bgm-glorp',
    COUPLE: 'bgm-couple',
    FINAL: 'bgm-final'
};

// ============================================
// MOL DIALOGUE CONSTANTS
// ============================================
const MOL = {
    IDLE_DIALOGUES: [
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
    ],

    COFFEE_REACTIONS: [
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
    ],

    // Coffee-related dialogue indices (0-5 are coffee desperate, 14 is "Do you feel like coffee?")
    COFFEE_LINE_INDICES: [0, 1, 2, 3, 4, 5, 14],

    // Special Mol sprites that unlock after all witnesses are interviewed
    SPECIAL_SPRITES: ['Mol_cait.png', 'Mol_ella.png', 'Mol_ast_less.png']
};
