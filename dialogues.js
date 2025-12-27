/**
 * DIALOGUE DATA FOR "WHO IS DAPHNE?"
 *
 * Edit this file to add/modify dialogue without touching the main code.
 *
 * ACTION TYPES:
 * - 'wait'           : Shows text, waits for Enter/click to continue
 * - 'name_input'     : Shows text input for player name
 * - 'continue_button': Shows a button (set buttonText: 'Button Label')
 * - 'add_lead'       : Adds item to leads list (set lead: 'Text to add')
 * - 'choice'         : Shows choice buttons (set choices: [...], responses: [...])
 * - 'colored_text'   : Shows colored text (set color: 'pink'|'blue'|'blonde'|'brown'|'red', strikethrough: true/false)
 * - 'show_kola'      : Shows Kola.png overlay
 * - 'hide_kola'      : Hides Kola.png overlay
 * - 'end_leads'      : Ends the leads section
 *
 * OPTIONS:
 * - loud: true       : Makes text red with higher pitch sound
 * - effect: 'shake_flash' : Screen shake and flash effect
 * - buttonText: '...' : Label for continue_button
 * - color: '...'     : For colored_text - 'pink', 'blue', 'blonde', 'brown', 'red'
 * - strikethrough: true : For colored_text - adds strikethrough after displaying
 */

const DIALOGUES = {

    // ==========================================
    // INTRO SEQUENCE (Opening dialogue with Mol)
    // ==========================================
    intro: [
        { text: "Ah, there you are, cadet.", action: 'wait' },
        { text: "Tell me, then. What is your name?", action: 'name_input' },
        { text: "Hah, joke’s on you, cadet. I don’t care. Here, you are nothing. I spit on your name.", action: 'wait', loud: true },
        { text: "I’ll keep calling you cadet. You are still a worm under my face-stomping military boot.", action: 'wait' },
        { text: "Now, cadet, I hope you are ready for your first task. The world will not wait for the likes of you.", action: 'continue_button', buttonText: 'Continue' },
        { text: "Listen up! A high-profile target is loose. A real nasty piece of work... Arrrg, my boot is practically vibrating to stomp that face.", action: 'wait' },
        { text: "Since our star empath profiler ran off with a cannibal to live his best murderous life, YOU have been selected! I know, a total waste of taxpayer money, but the budget cuts are hitting everyone, cadet.", action: 'continue_button', buttonText: 'I am ready' },
        { text: "Ready? You still don’t even know what your task is.", action: 'wait' },
        { text: "These days they let anyone into our ranks…", action: 'wait' },
        { text: "PAY ATTENTION!", action: 'wait', loud: true, effect: 'shake_flash' },
        { text: "You’ll be given a dossier on the suspect. Finish it, gather enough information, and you may prove yourself by identifying the subject.", action: 'wait' },
        { text: "Good luck, cadet. You will need it.", action: 'continue_button', buttonText: 'Continue' }
    ],

    // ==========================================
    // LEADS - First case file
    // ==========================================
    leads: [
        { text: "Okay… let’s see what we’ve got here.", action: 'wait' },
        { text: "From the reports we have gathered, this very, very dangerous criminal appears to be… quite the individual.", action: 'wait' },
        { text: "Young woman. In her twenties.", action: 'wait' },
        { text: "Witness report: 'Total carnage. Blood, limbs, hearts on the floor... awful stuff to come home to. But still, I'd wade through it all again for a piece of those sexy legs I saw sneaking out.'", action: 'wait' },
        { text: "SEXY LEGS?!", action: 'wait', loud: true, effect: 'shake_flash' },
        { text: "Goodness. We should take all of this with a grain of salt… This poor individual was clearly affected by the gruesome sight of their dead family.", action: 'wait' },
        { action: 'add_lead', lead: "Woman. 20s." },
        { text: "Let's keep reading.", action: 'wait' },
        { text: "Hair colour:", action: 'wait' },
        { text: "Pink", action: 'colored_text', color: 'pink', strikethrough: true },
        { text: "Blue", action: 'colored_text', color: 'blue' },
        { text: "Blonde", action: 'colored_text', color: 'blonde' },
        { text: "brown", action: 'colored_text', color: 'brown', strikethrough: true },
        { text: "Red??", action: 'colored_text', color: 'red' },
        { text: "…", action: 'wait' },
        { text: "WHICH COLOUR IS IT, THEN?!", action: 'wait', loud: true },
        { text: "The sidenote says: ‘Some witnesses said it was impossible to state a specific colour, as the tone is not being present in the visible spectrum, stating: Such astonishing hair just grabbed the light and threw it in a wave our brain is not physically and mentally capable of comprehending. Totally awesome, dude.'", action: 'wait' },
        { text: "You know what? I'm just gonna write down: 'Has hair.'", action: 'wait' },
        { action: 'add_lead', lead: "Has hair." },
        { text: "A weird beverage was found at every crime scene.", action: 'wait' },
        { text: "Okay! This sounds more like my kind of stuff. Let's see…", action: 'wait' },
        { action: 'show_kola' },
        { text: "Ugh. What is this slop? I have never seen such a weird thing. It looks like battery acid. You kids will drink anything.", action: 'wait' },
        {
            action: 'choice',
            choices: ["I know what this is", "I don't know what this is either"],
            responses: [
                "Figures you'd recognize trash... I MEAN—Excellent! This specific knowledge is... vital.",
                "Do you know anything at all?"
            ]
        },
        { text: "Let’s continue, shall we…", action: 'wait' },
        { action: 'hide_kola' },
        {
            action: 'choice',
            choices: ["You're not very nice, are you?", "Yes, let's continue… I got my gnocchi casserole in the fire."],
            responses: [
                ["You are very charming too, cadet. Tell me something I don’t know.", "Are you done now? Can we please continue?"],
                ["Cooking?! On duty?! UNACCEPTABLE! Go save your pasta, you dummy. I’ll wait here!"]
            ],
            buttonText: ["Continue", "We can continue"]
        },
        { action: 'add_lead', lead: "Weird beverage called Fritz Kola." },
        { text: "Okay, there’s nothing else in the leads for now.", action: 'end_leads' }
    ],

    // ==========================================
    // PHYSICAL EVIDENCE - Case File 2
    // ==========================================
    physicalEvidence: {
        // Intro plays once when entering the screen
        intro: [
            { text: "Let's go over the evidence from the crime scene, Cadet. You might just prove yourself yet.", action: 'wait' },
            { text: "Ugh, look at this mess. Everything is covered in blood—oh, wait... *Licks fingers*", action: 'wait' },
         
            { text: "This is... strawberry jam? No. No! It cannot be—I am just hungry. Ignore that. I need a tactical snack break soon.", action: 'wait' }
        ],

        // Evidence items - each has an id, icon type, and dialogue sequence
        items: [
            {
                id: 'candle',
                label: 'Evidence 1',
                icon: 'cylinder',
                leadText: 'A Lavender Scented Candle',
                dialogue: [
                    { text: "We found this wax cylinder. It releases a weird smell... The label says: 'Lavender'  It seems designed to lower our defenses and make us feel 'relaxed.'", action: 'wait' },
                    { text: "DON'T FALL FOR IT, CADET!", action: 'wait', loud: true },
                    { text: "It is clearly a witchy ritual to entrap victims in a state of comfort!", action: 'wait'},
                    { text: "She likely lulls them to sleep before... well, I don't want to think about it. She disgusts me.", action: 'continue_button', buttonText: 'Light the candle' },
                    { text: "HEY! Who told you to—", action: 'wait', loud: true },
                    { text: "*Sniffs*.", action: 'wait' },
                    { text: "Oh. That is quite pleasant, actually.", action: 'wait' },
                    { text: "I might keep this wax container close. Just to protect you, of course!! Not because I like it.", action: 'wait' }
                ]
            },
            {
                id: 'd20',
                label: 'Evidence 2',
                icon: 'd20',
                leadText: 'A D20 Dice (DnD)',
                dialogue: [
                    { text: "Hmm... A polyhedral object with numbers on every side.", action: 'wait' },
                    { text: "Our analysts say it belongs to a cult activity known as 'Dungeons and Dragons.' Dungeons?! Dragons?!", action: 'wait' },
                    { text: "She is clearly planning to lock people in a basement and feed them to giant lizards! We must find where she is hiding these dragons immediately!", action: 'wait' },
                    {
                        action: 'choice',
                        choices: ["Roll the dice", "It's just a game, silly goose."],
                        responses: [
                            [
                                { text: "AHHH! TAKE COVER! ...What is it? A 20?", action: 'wait', loud: true, sound: 'dice' },
                                { text: "Is that good? It sounds high. Does that mean the dragon eats us? Truly terrifying days we are living in...", action: 'wait' }
                            ],
                            [
                                { text: "Silly?! Such insubordination demands 30 jumping jacks, cadet!", action: 'wait' },
                                { text: "...I am not a goose.", action: 'wait' }
                            ]
                        ]
                    }
                ]
            },
            {
                id: 'manuscript',
                label: 'Evidence 3',
                icon: 'document',
                leadText: 'Digital questionable manuscript',
                leadTextAfter: 'Digital questionable manuscript (Suspiciously missing)',
                dialogue: [
                    { text: "We found digital manuscripts. At first glance, it appeared to be a combat report between a Devil and a Vampire. But then...", action: 'wait' },
                    { text: "Wait. Why are they... oh. Oh my.", action: 'wait' },
                    { text: "Cadet! Don't look! The tactical positioning described here is... extremely intimate. The devil is using his tail in ways that are NOT regulation!", action: 'wait'},
                    { text: "I am... uh... flagging this as 'Psychological Warfare.' Because my brain is certainly under attack.", action: 'wait' },
                    { text: "I'm confiscating this. You know. To... study it. Later. In my private quarters. Alone.", action: 'wait' },
                    { text: "*Sneaks a long look before putting it away.*", action: 'wait' },
                    { text: "Damn. That's sexy writing.", action: 'continue_button', buttonText: 'May I have a look?' },
                    { text: "WHAT?! NO! ABSOLUTELY NOT!", action: 'wait', loud: true, effect: 'shake_flash' },
                    { text: "You are not cleared for this level of spice, Cadet! This will be safe with me. I'll add it to the evidence... eventually.", action: 'wait' }
                ]
            },
            {
                id: 'harpstring',
                label: 'Evidence 4',
                icon: 'wave',
                leadText: 'Harp string. Condition: slightly water-damaged.',
                dialogue: [
                    { text: "A loose string. It is... soaking wet? Why is it wet?!", action: 'wait' },
                    { text: "Intel says her base of operations was hit by a flood, but I don't buy it. A harpist surrounded by water? Our criminal must be a SIREN.", action: 'wait' },
                    { text: "The water coudn't possibly attack her base. It was obviously trying to get closer to the music! She clearly played a melody so powerful it summoned the tides.", action: 'continue_button', buttonText: 'Touch the string' },
                    { text: "NO! COVER YOUR EARS! Do not listen to the frequency!", action: 'wait', loud: true, sound: 'harp' },
                    { text: "Too late. You are already charmed. I can see it in your eyes. Snap out of it, maggot!", action: 'wait' }
                ]
            },
            {
                id: 'shoppinglist',
                label: 'Evidence 5',
                icon: 'notepad',
                leadText: 'A delicious, sweet and savoury snack.',
                dialogue: [
                    { text: "It looks like a shopping list, but it only contains one entry: 'A delicious, sweet and savoury snack.'", action: 'wait' },
                    { text: "Huh. That doesn't tell us much. Although... *Stomach growls loudly.*", action: 'wait' },
                    { text: "This criminal fuels herself with high-tier treats. She clearly has good taste. I am craving pretzels now. Or chocolate. Or chocolate covered pretzels. Do you happen to have any contraband on you, Cadet?", action: 'wait' },
                    {
                        action: 'choice',
                        choices: ["No, sir.", "Give her a pretzel"],
                        responses: [
                            [
                                { text: "Useless! What are you waiting for? Go buy some rations, dummy.", action: 'wait' }
                            ],
                            [
                                { text: "*Crunch crunch.*", action: 'wait', sound: 'munch' },
                                { text: "Mmm. Acceptable. Slightly stale, but acceptable.", action: 'wait' },
                                { text: "You might yet not be the worst Cadet I have ever trained. Don't let it go to your head.", action: 'wait' }
                            ]
                        ]
                    }
                ]
            }
        ]
    },

    // ==========================================
    // IDENTIFY SUSPECT - Final sequence
    // ==========================================
    identifySuspect: {
        // Initial dialogue before evidence grid
        intro: [
            { text: "So, the time has come to analyse our leads and evidence to profile our criminal.", action: 'wait' },
            { text: "Finally, I thought you weren't going to do anything helpful around here, cadet.", action: 'wait' },
            { text: "Let's review all our leads and all the intel we have gathered.", action: 'wait' },
            { text: "We are dealing with a young woman with hair that is luscious and indescribable—multiple colours, as it happens. A connoisseur of sweet and bubbly beverages.", action: 'wait' },
            { text: "What does that all-powerful profiler hunch tell you?", action: 'choice',
                choices: ["Don't forget the sexy legs.", "Must be a bald, middle-aged man that drinks too much beer."],
                responses: [
                    [{ text: "I would never forget your sexy legs—I MEAN—tiny unit soldier did also mention the ankles… you *are* catching up. I feel almost proud.", action: 'wait' }],
                    [
                        { text: "Are you fucking dumb?", action: 'choice', loud: true,
                            choices: ["Ugh, okay, bitch. Don't forget the legs."],
                            responses: [
                                [{ text: "I would never forget your sexy legs—I MEAN—tiny unit soldier did also mention the ankles… you are catching up. I feel almost proud.", action: 'wait' }]
                            ]
                        }
                    ]
                ]
            },
            { text: "Do you have enough information to profile with this, yes or no?", action: 'choice',
                choices: ["No, this is too little. Could be anyone.", "Yes."],
                choiceHover: [null, "No. A person is so much more than this."],
                // Both choices lead to the same response
                responses: [
                    [{ text: "Yes… You are right.", action: 'music_change' }],
                    [{ text: "Yes… You are right.", action: 'music_change' }]
                ]
            },
            { text: "These are just, like… facts.", action: 'wait' },
            { text: "But a person is so much, much more. Isn't it?", action: 'wait' },
            { text: "What does it make a person, one?", action: 'choice',
                choices: ["A person has likes and dislikes."],
                responses: [
                    [{ text: "'Likes' you say? As in things we enjoy doing? I guess that does make sense… I do enjoy some gardening in my spare time.", action: 'wait' }]
                ]
            },
            { text: "You know what? Let's look at the evidence and the crime scene again… but this time, as a life.", action: 'show_grid' }
        ],

        // Evidence items for the "likes" section
        // When clicked, they reveal their meaning
        evidenceItems: {
            candle: {
                name: "Apple Cinnamon Scented Candle",
                trait: "Peace",
                dialogue: [
                    { text: "This smell… it reminds me of when my grandma used to bake pie back when I was little.", action: 'wait' },
                    { text: "… I can see it now, cadet. This candle is not a weapon as we originally thought.", action: 'wait' },
                    { text: "This candle means that she knows how to design comfort. When the world is loud, when the world is heavy, she builds her own little sanctuary.", action: 'wait' },
                    { text: "A peace pocket where only warmth is welcome, the outside cannot reach you, and you are safe.", action: 'wait' }
                ]
            },
            d20: {
                name: "A D20 Dice (DnD)",
                trait: "Imagination",
                dialogue: [
                    { text: "Life can be hard sometimes… doesn't it, cadet?", action: 'wait' },
                    { text: "Sometimes we just need to dream of a better world, a kinder one.", action: 'wait' },
                    { text: "Where we can be the hero, or even the villain. Where victims do not need to get avenged, and the princess does not need to be rescued, because she yields her own sword in a world where destiny is of her own creation.", action: 'wait' },
                    { text: "Where no fear can live.", action: 'wait' }
                ]
            },
            manuscript: {
                name: "Digital Questionable Manuscript",
                trait: "Passion",
                dialogue: [
                    { text: "What are writers made of, cadet?", action: 'wait' },
                    { text: "When the wounds are deep and the pain surges too high to be contained, they write. They bleed, drop by drop, on the paper.", action: 'wait' },
                    { text: "Not afraid to feel deep. Not afraid to cry. Creating art from nothing, from everything, pouring love. Pouring pain.", action: 'wait' },
                    { text: "The most understated gift to share with others, the one that leaves you open and exposed. Something truly special.", action: 'wait' }
                ]
            },
            harpstring: {
                name: "Harp String (Water-damaged)",
                trait: "Resilience",
                dialogue: [
                    { text: "The sea is a scary place for me, you know? The tides can rise so high, so, so fast, seeking to pull you under.", action: 'wait' },
                    { text: "But you only own your old, tired wooden boat.", action: 'wait' },
                    { text: "Time after time, the waves hit it, and the planks are worn out, you can see splinters starting to appear… and wonder if this will finally be the time.", action: 'wait' },
                    { text: "Yet it is still your tough boat. You know your boat. It has been with you your whole life. Beating after beating. Storm after storm.", action: 'wait' },
                    { text: "The boat keeps afloat, cradling your tired body to shore. Every time.", action: 'wait' }
                ]
            },
            snack: {
                name: "A Delicious, Sweet and Savoury Snack",
                trait: "Joy",
                dialogue: [
                    { text: "What a short life this is, cadet… full of hardships and sorrows.", action: 'wait' },
                    { text: "Demands after demands after demands after demands, and you just can't keep up because they just keep coming.", action: 'wait' },
                    { text: "From the world, from society, ourselves… even when we should be the ones saying 'Enough. I have done enough.'", action: 'wait' },
                    { text: "If we don't take care of ourselves, who will?", action: 'wait' },
                    { text: "It takes a special kind of person to find joy in the smallest things. Even a yummy snack.", action: 'wait' }
                ]
            }
        },

        // After all evidence is revealed
        afterEvidence: [
            { text: "Peaceful. Imaginative. Passionate. Resilient. Joyful.", action: 'wait' },
            { text: "These now appear as proper traits. We are learning. Let's keep stripping layers, lovely. We are getting closer.", action: 'hide_grid' },
            { text: "What else makes a person, one?", action: 'choice',
                choices: ["A person has dreams and fears."],
                responses: [
                    [{ text: "Dreams and fears… yes. The things we aspire to become, and the shadows that hold us back.", action: 'start_fears' }]
                ]
            }
        ],

        // Fear sequence - the shadows
        fears: {
            intro: [
                { text: "Let's start with the shadows. Get them out of the way.", action: 'wait' },
                { text: "The report says these were found scrawled in the margins of her notes. Late at night, I presume. When the world is quiet and the mind is loud.", action: 'show_fears' }
            ],

            // Word clusters that appear - each triggers a depression stage
            wordClusters: [
                {
                    words: ["Mediocre.", "Unproductive.", "Untalented."],
                    depressionStage: 1,
                    afterAppear: [
                        { text: "...", action: 'wait' },
                        { text: "Cadet, what is this?", action: 'show_next_cluster' }
                    ]
                },
                {
                    words: ["Fat.", "Loud.", "Ugly.", "Disgusting."],
                    depressionStage: 2,
                    doubleClick: "Disgusting.", // This word needs two clicks
                    afterAppear: [
                        { text: "No. No, no, no. I refuse to enter these into evidence. These are not actual facts. All of these are wounds. Old, infected wounds that never got the care they deserved.", action: 'show_next_cluster' }
                    ]
                },
                {
                    words: ["Bad friend.", "Bad girlfriend.", "Bad writer.", "A fraud."],
                    depressionStage: 3,
                    afterAppear: [
                        { text: "...", action: 'wait' },
                        { text: "I see.", action: 'wait' },
                        { text: "Cadet, I need you to do something for me.", action: 'wait' },
                        { text: "This evidence is contaminated. I need you to cross it out. Every single word.", action: 'wait' },
                        { text: "Go on. Click them.", action: 'enable_crossing' }
                    ]
                }
            ],

            // Responses when player crosses out word clusters
            crossOutResponses: [
                {
                    // After crossing "Mediocre. Unproductive. Untalented."
                    dialogue: "That's good. Cross them all out. She is not mediocre. She is creative and imaginative, and she tries every day. That is the opposite of mediocre."
                },
                {
                    // After crossing "Fat. Loud. Ugly. Disgusting."
                    dialogue: "Gone. Take all out. Having a body is not a crime. Having a voice is not a mistake, and she is allowed to take up space. Disgusting? How can someone be so blind? Cross this one twice.",
                    recoveryStage: 1
                },
                {
                    // After crossing "Bad friend. Bad girlfriend. Bad writer. A fraud."
                    dialogue: "Excellent, you are doing wonderfully, cadet. Bad friends don't stay up late worrying about their friends. Bad writers don't pour themselves onto the page. Bad girlfriends don't try so hard.",
                    showMoreWords: true
                }
            ],

            // Additional word clusters that appear after first three are crossed
            additionalClusters: [
                {
                    words: ["Disappointing.", "Stupid.", "Undesirable.", "Unlovable."],
                    crossOutResponse: "Yes. Destroy it. She has never been any of these things to the people who matter."
                },
                {
                    words: ["Self-destructive.", "A joke.", "A fraud.", "Crybaby."],
                    crossOutResponse: "A 'crybaby.' As if having feelings were a weakness... It isn't, and it never was.",
                    recoveryStage: 2
                },
                {
                    words: ["Disturbed.", "Bad influence.", "Forgetful.", "Without conviction."],
                    crossOutResponse: "…Very good, Cadet. You did very well.",
                    recoveryStage: 3
                }
            ],

            // Final dialogue after all words crossed out
            conclusion: [
                { text: "These words were never true, lovely. They were just very loud in a very quiet moment.", action: 'wait' },
                { text: "Repeated so many times they started to feel like facts. But they are not true facts. They are wounds, and wounds can heal.", action: 'wait' },
                { text: "When we find ourselves here, in this deep, dark place. We need to let them all out. All of them. Cross them out. Because they aren't welcome, and most importantly—they aren't ours.", action: 'fade_words' },
                { text: "That's much better.", action: 'full_recovery' },
                { text: "Now. Let's look at what's actually real, beautiful.", action: 'wait' },
                { text: "The dreams. The things she reaches for, even when she's tired. Even when it's hard to keep moving forward.", action: 'show_dreams' }
            ]
        },

        // Dreams sequence - the things she reaches for
        dreams: {
            items: [
                {
                    surface: "Provided nutritious treats.",
                    hidden: "To nurture.",
                    response: "She feeds the people she loves. With food, comfort, care, and attention, even when there's not enough for her. She wants to be someone who makes others feel full."
                },
                {
                    surface: "Suspicious ankles → related to sexy legs?",
                    hidden: "To feel beautiful.",
                    response: "Not for others, but for herself. To look in the mirror and finally see what everyone else sees."
                },
                {
                    surface: "Objectifies the military with cute labels.",
                    hidden: "To soften the hard things.",
                    response: "She takes the scary, the harsh, the cruel, and makes it gentle. Gives it a cute label. Makes it survivable."
                },
                {
                    surface: "Booped the nose.",
                    hidden: "To connect.",
                    response: "Small moments. A boop on the nose. A hand held. She dreams of tenderness, of being close, and needed. Loved."
                },
                {
                    surface: "Warm and soft squish.",
                    hidden: "To be a safe place.",
                    response: "Warm and soft. A person others can collapse into. She wants to be someone's comfort."
                },
                {
                    surface: "Tactical and complex sleepwear.",
                    hidden: "To rest.",
                    response: "Real rest. A blanket. Low-energy engine gyration. Permission to just… stop. And be. Without guilt."
                },
                {
                    surface: "Maniac expression while composing evilness.",
                    hidden: "To create.",
                    response: "Even chaos. Even darkness. Even messy, unhinged, beautiful things. She dreams of making something from nothing and feeling powerful doing it."
                },
                {
                    surface: "Enjoys traumatizing protagonists.",
                    hidden: "To feel deeply.",
                    response: "To laugh until it hurts. To cry without shame. To love characters so much it aches. She doesn't want a small life. She wants to feel all of it."
                },
                {
                    surface: "Clearly emotionally invested in the witnesses.",
                    hidden: "To matter.",
                    response: "To the people she loves. To be remembered. To leave a mark in the people she touches. A 'she was here, and it was better because she was here, with me.'"
                }
            ],
            conclusion: [
                { text: "These are her dreams, Cadet.", action: 'wait' },
                { text: "And not a single one of them is out of reach.", action: 'wait' },
                { text: "She just needs to remember they exist.", action: 'wait' },
                { text: "And who she is.", action: 'show_finale', italic: true, lowOpacity: true }
            ]
        },

        // Finale - identify the subject
        finale: {
            // Floating positive words for the background
            floatingWords: [
                "nurturing", "caring", "supportive", "attentive",
                "radiant", "graceful",
                "comforting", "soothing", "gentle", "calming",
                "warm", "open", "empathetic",
                "trustworthy", "steady", "grounding", "reassuring",
                "peaceful", "unhurried", "calm",
                "creative", "inspiring",
                "sensitive", "compassionate", "tender", "emotionally intelligent",
                "meaningful", "important", "valued", "unforgettable",
                "Peaceful.", "Imaginative.", "Passionate.", "Resilient.", "Joyful."
            ],

            // Prompt for identification
            prompt: "Do you think you can identify our subject now, pretty?",

            // Valid answers (case insensitive check will also be done)
            validAnswers: ["me", "i", "daphne", "luisa", "luiza", "it is i"],

            // Comforting messages for wrong answers
            wrongAnswerMessages: [
                "It is ok, we have as long as you need.",
                "Just try again.",
                "We can just stay here if you wish.",
                "Take your time, lovely.",
                "No rush. I'm here."
            ],

            // Final conversation after correct answer
            finalDialogue: [
                { speaker: 'mol', text: "Hello, pretty.", action: 'wait' },
                { speaker: 'mol', text: "How are you? Did you sleep proper tonight, or did you stay until late again?", action: 'wait' },
                { speaker: 'luisa', text: "Turns out, I'm hyposomnic again, I just slept another 5 hours and I'm feeling soooo sleepy!", action: 'wait' },
                { speaker: 'mol', text: "Having plans on sleeping some more?", action: 'wait' },
                { speaker: 'luisa', text: "Mayyyyybee… hehe What about you? How was your day?", action: 'wait' },
                { speaker: 'mol', text: "Okayish!", action: 'start_fade' },
                { speaker: 'luisa', text: "Ooh I see you had a writing day?", action: 'wait' },
                { speaker: 'mol', text: "Yas! I had an interview, and I finally finished the draft!", action: 'wait' },
                { speaker: 'luisa', text: "Oh damn you go girly!! What a productive lady", action: 'end' }
            ],

            // Messages shown on black screen after fade
            // Each message fades in, stays, then fades out before the next
            endMessages: [
                "You are loved."
            ]
        }
    },

    // ==========================================
    // WITNESS REPORTS - Case File 3
    // ==========================================
    witnessReports: {
        // Intro plays once when entering the screen
        intro: [
            { text: "We managed to scrape up a few witnesses from the scene. We are to interrogate them immediately and squeeze every drop of intel out of their brains!", action: 'wait' },
            { text: "Oh, and don't adjust your screen. I have tactically blurred their faces.", action: 'wait' },
            { text: "This is for their own safety; if the suspect finds them, she might hug them to death, or whatever it is that she does. We cannot risk losing civilians to such brutality.", action: 'wait' }
        ],

        // Witnesses - each has an id, image, music, pitch, dialogue, and leads
        witnesses: [
            {
                id: 'cait',
                image: 'cait.png',
                music: true,
                pitch: 'high',  // High-pitched hamster voice
                leads: [
                    "Provided nutritious treats.",
                    "Suspicious ankles → related to sexy legs?",
                    "Objectifies the military with cute labels.",
                    "Booped the nose.",
                    "Warm and soft squish."
                ],
                dialogue: [
                    { speaker: 'mol', text: "STATE YOUR NAME AND RANK! ...Hold on. You are the size of a ration bar!", action: 'wait', loud: true },
                    { speaker: 'mol', text: "*Mol squints* You are vibrating. Is that a tactical engine purr? ...Or are you just… ridiculously small? STOP LOOKING AT ME WITH THOSE BEADY EYES! IT'S DISTRACTING!", action: 'wait' },
                    { speaker: 'cait', text: "Private Cait, Serial Number H-4M-5T3R, reporting for duty! And I'm not vibrating, this is tactical trembling. Advanced threat detection. It's a very specialised skill. As for my size, I prefer 'compact and mobile.'", action: 'wait', sound: 'squeak'  },
                    { speaker: 'mol', text: "...Roger that. Micro-unit 'Cait' identified. Now, report! To a tiny soldier like you, the suspect must be a TITAN!", action: 'wait' },
                    { speaker: 'mol', text: "Did she loom over you? Did she use her giant grabbing claws to ruffle your... extremely fluffy camouflage? Report!", action: 'wait' },
                    { speaker: 'cait', text: "She did loom. Terrifyingly. Like a... a fleshy skyscraper with opposable thumbs.", action: 'wait' },
                    { speaker: 'cait', text: "And YES, she used her grabbing claws *shudders* to ruffle my fur. Completely compromised my camouflage profile; it took me 20 minutes to groom it back into regulation fluff.", action: 'wait' },
                    { speaker: 'cait', text: "But I got a good look at her. From ground level, I saw everything. Well, mostly ankles... But very suspicious ankles!", action: 'wait' },
                    { speaker: 'mol', text: "A giant hand descending from the sky... terrifying. And yet... you survived. Prodigious rodent…", action: 'wait' },
                    { speaker: 'mol', text: "What was the suspect doing? Was she making high-pitched noises? Was she poking your... suspiciously pink nose?", action: 'wait' },
                    { speaker: 'mol', text: "*Mol leans closer.* Is that nose even real? It looks very boop-able. I MEAN—WAS IT TACTICALLY BOOPED?!", action: 'wait'},
                    { speaker: 'cait', text: "*Cait covers nose with tiny paws*", action: 'wait', sound: 'squeak'  },
                    { speaker: 'cait', text: "Yes! She was making very high-pitched noises! Disturbingly cooing sounds. Classic distraction technique. 'Who's a cute little baby?' she kept saying. Clearly trying to compromise my objectivity!", action: 'wait' },
                    { speaker: 'cait', text: "And my nose is 100% regulation issue! Standard hamster equipment! The pinkness is... well, that's just how British hamsters look.", action: 'wait' },
                    { speaker: 'cait', text: "I do believe it was a tactical boop. Multiple times, too. I tried to maintain my composure but— look, I'm professionally trained, but I'm not made of STONE! The boops were... they were very effective.", action: 'wait' },
                    { speaker: 'mol', text: "'Who's a little baby'...? DISGUSTING! She is mocking your rank!", action: 'wait' },
                    { speaker: 'mol', text: "Now, we know she buys loyalty. Did she offer you a bribe? A sunflower seed? A yogie drop?", action: 'wait' },
                    { speaker: 'mol', text: "You... you have pouches. You are smuggling contraband right now, aren't you? Look at those cheeks! They are so full! ...It's actually kind of adorable. STOP IT!", action: 'wait'},
                    { speaker: 'cait', text: "I— I can explain! She did offer bribes! Multiple bribes! A sunflower seed, two yogie drops, and a piece of carrot!", action: 'wait', sound: 'squeak'  },
                    { speaker: 'cait', text: "But I didn't ACCEPT them! I merely... secured them as evidence! For the investigation! They're in protective custody! In my cheeks! For safekeeping!", action: 'wait' },
                    { speaker: 'cait', text: "...Okay, I may have eaten one yogie drop. But only because it was melting and compromising the integrity of the evidence! The rest is secure!", action: 'wait' },
                    { speaker: 'mol', text: "Final question, Rodent Warrior. Be honest.", action: 'wait' },
                    { speaker: 'mol', text: "If she were to squish you… Would it be a horrible death? Or would it be... a warm, cozy, soft embrace?", action: 'wait' },
                    { speaker: 'mol', text: "Do I need to nuke the site from orbit? BLINK TWICE IF YOU ARE A HOSTAGE!", action: 'wait', loud: true },
                    { speaker: 'cait', text: "…", action: 'wait' },
                    { speaker: 'cait', text: "A squish is a squish! Lethal force is lethal force, regardless of the... the warmth... or softness... or—", action: 'wait' },
                    { speaker: 'cait', text: "*Clears throat* Look, I'm a professional! I would never compromise this investigation just because she has warm hands and gives excellent chin scratches and sometimes lets me run around in a little exercise ball and—", action: 'wait' },
                    { speaker: 'cait', text: "…If you're going to nuke the site, I respectfully request witness protection. Preferably with a spacious cage. And maybe some of those yogie drops as part of the relocation package?", action: 'wait' },
                    { speaker: 'mol', text: "Can I pet you? Just once? FOR SCIENCE?!", action: 'wait'},
                    { speaker: 'cait', text: "!!", action: 'wait', sound: 'squeak'},
                    { speaker: 'cait', text: "…Fine. ONCE. For science. But this stays off the record! If this gets back to command, my credibility is ruined!", action: 'wait' },
                    { speaker: 'cait', text: "*Whispering* Make it quick. And NO booping the nose this time!", action: 'wait' },
                    { speaker: 'cait', text: "...Okay maybe ONE boop. But that's it!", action: 'wait' },
                    { speaker: 'cait', text: "Are we done here? Can I please go into witness protection now? Preferably somewhere with a running wheel and premium bedding?", action: 'wait' },
                    { speaker: 'mol', text: "Yes, rodent unit Cait, you are dismissed. Please vacate the perimeter.", action: 'wait' },
                    { action: 'fly_away', buttonText: 'Did she just take off?' },
                    { speaker: 'mol', text: "Being part of such an important unit has its perks, cadet. Keep up, and one day you'll be just like her.", action: 'wait' },
                    { speaker: 'mol', text: "Let's write down all we have discovered:", action: 'wait' }
                ]
            },
            {
                id: 'glorp',
                image: 'glorp.png',
                music: true,
                pitch: 'alien',  // Distorted alien voice
                leads: [
                    "Tactical and complex sleepwear.",
                    "Maniac expression while composing evilness.",
                    "Low-energy velocistical engine gyration with a blanket.",
                    "Manipulative intimacy tactics."
                ],
                dialogue: [
                    { speaker: 'mol', text: "HE… HELLO?! Is this our witness? Why is it... wobbly?", action: 'continue_button', buttonText: 'Good evening' },
                    { speaker: 'mol', text: "Yes, ehem. Greetings, good citizen. Stop vibrating for a second, I am trying to conduct a serious military investigation... am I seeing colours?", action: 'wait' },
                    { speaker: 'glorp', text: "GLEEP! Be AfRaId In My PrEsEnCe, InFeRiOr CiViLiZaTiOn!", action: 'wait', sound: 'alien' },
                    { speaker: 'mol', text: "...Right. Let's ignore that for a second, cadet. Listen closely, amorphous shapely thing! Our surveillance suggests you were at the scene of the crime. Do not deny it! I can see the guilt in your unblinking eyes!", action: 'wait' },
                    { speaker: 'glorp', text: "GLORP! I wAs TrYiNg lOcAl DeLicAcY! ZEEP! 'CaRpEt' YoU cAlL iT i BeLiEvE.", action: 'wait' },
                    { speaker: 'mol', text: "A local delicacy? Were you eating the carpet? Jesus… Focus! State what you saw with those weird peepers! What was the suspect wearing? Was she in disguise?", action: 'wait' },
                    { speaker: 'glorp', text: "ZABORB MaNy ThInG… GNARP! sHe LoOkEd LiKe A pIlE oF LaUnDrY.", action: 'wait' },
                    { speaker: 'mol', text: "A tactical shell... it is clever. Now, the activity! Reports state she was maniacally typing... Questionable Literature. Stories about devils and vampires holding hands and *sweats* doing non-regulation activities. Did you see this filth?! …Did you see any spoilers of next chapter by any chance?", action: 'wait' },
                    { speaker: 'glorp', text: "ZOOP! ShE wRiTeS SoMeThInG aBoUt A SuN iN a ShAdOw. GLORP! ShE tYpEs MaNy WoRdS rEaLlY fAsT aNd ThEn SmIlEs. ZABORB! BiG sMiLe KiNdA sCaRy BiG...", action: 'wait' },
                    { speaker: 'mol', text: "I KNEW IT! She is conducting psychological warfare!", action: 'wait', loud: true },
                    { speaker: 'mol', text: "Now, the weapon! Crime scenes are covered in a black sludge labeled 'Fritz-kola'. What is this isotope?! Is it rocket fuel? Does it melt bones?! TELL ME!", action: 'wait' },
                    { speaker: 'glorp', text: "ZORB?", action: 'wait',},
                    { speaker: 'mol', text: "... terrifying, we are dealing with a 'Zorb'. Must be a new nuclear weapon, I might not yet know of.", action: 'wait' },
                    { speaker: 'mol', text: "Now, audio analysis: did the suspect emit any high-frequency signals? A screech? A 'Gamer Rage' roar? Or perhaps... a 'snore'? Mimic the sound, witness!", action: 'wait' },
                    { speaker: 'glorp', text: "GLORP... AAAAAAAAAAAAHHHHHHHH! sHe ScReAm LiKe AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHHHHHHHHHHH!", action: 'wait', loud: true, effect: 'shake_flash' },
                    { speaker: 'mol', text: "MY EARS! Okay, okay!", action: 'wait' },
                    { speaker: 'mol', text: "How did she flee? Did she sprint? Did she roll? Or did she deploy the 'Tactical Burrito' maneuver—wrapping herself in a blanket and refusing to acknowledge reality until the naps were over?", action: 'wait' },
                    { speaker: 'glorp', text: "GLEEP! YeS sHe JuMp In AiR aNd In SpLiT sEcOnD wRaP bLaNkEt ArOuNd HeRsElF. ZEEP! ThE sNoRiNg StArTs AnD aLl Of A sUdDeN sHe RoLlS aRoUnD aT sPeEd Of LiGhT lIkE bEyBlAdE sTiLl FuLlY aSlEeP.", action: 'wait' },
                    { speaker: 'glorp', text: "LiKe ThIs:", action: 'spin', buttonText: 'I get it! I get it!' },
                    { speaker: 'mol', text: "Ugh—I’m gonna puke, cadet... It cannot be.", action: 'wait' },

                    { speaker: 'mol', text: "The burrito-helicopter-gyrating manoeuvre. A coma-based defence strategy that only the strongest of debauchers and specially trained whores are able to pull off. My fears have been confirmed, cadet. She is a genius.", action: 'wait' },
                    { speaker: 'mol', text: "Alright, last question, green thing. Look at me! Did she touch you? Did she pat your head? Did she offer you… SNACKS?", action: 'wait' },
                    { speaker: 'mol', text: "AND DO NOT LIE TO ME! I smell crumbs on you. Are you compromised?", action: 'wait', loud: true },
                    { speaker: 'glorp', text: "gnarp... We... We HoLd HaNd... AnD kIsS... glorp", action: 'wait', changeImage: 'glorp_blush.png' },
                    { speaker: 'mol', text: "You did WHAT?!", action: 'beam_up', loud: true, effect: 'shake_flash' },
                    { speaker: 'mol', text: "Fast, cadet! Shoot! Use your pistol! It is trying to get away on a… spaceship? Should The Secret Service be informed about this…?", action: 'wait',
                        choices: ["I don't have a pistol.", "I won't hurt it, she was… beautiful…"],
                        responses: [
                            [
                                { speaker: 'mol', text: "You don't own a pistol? What did they teach you in school? To braid your beautiful hair?", action: 'wait' },
                                {
                                    action: 'choice',
                                    choices: ["To protect the innocents and the helpless."],
                                    responses: [
                                        [
                                            { speaker: 'mol', text: "Figures…", action: 'wait' }
                                        ]
                                    ]
                                }
                            ],
                            [
                                { speaker: 'mol', text: "Excuse me?", action: 'wait' },
                                {
                                    action: 'choice',
                                    choices: ["I said I won't hurt her. I will give my life for her."],
                                    responses: [
                                        [
                                            { speaker: 'mol', text: "Fuck me. You have been hypnotized by its brain-juicer abilities.", action: 'wait' }
                                        ]
                                    ]
                                }
                            ]
                        ]
                    },
                    { speaker: 'mol', text: "I believe we can confirm already that the subject is compromised. They could be working together, cadet. This runs much deeper than we thought…", action: 'wait' },
                    { speaker: 'mol', text: "Let's recap all the new information we obtained and write it down.", action: 'wait' }
                ]
            },
            {
                id: 'couple',
                image: 'couple.png',
                music: true,
                pitch: 'normal',
                wide: true,        // Rectangular image - use larger display
                delayImage: true,  // Don't show image at start - wait for show_image action
                leads: [
                    "Enjoys traumatizing protagonists.",
                    "Clearly emotionally invested in the witnesses."
                ],
                dialogue: [
                    { speaker: 'mol', text: "Next witness!", action: 'wait', loud: true },
                    { action: 'show_image' },  // Show the couple image after "Next witness!"
                    { speaker: 'mol', text: "Wait. Are you the witnesses? You are clearly overdressed. This is an investigation, not a gala.", action: 'wait'},
                    { speaker: 'r', text: "Greetings. We are but humble travellers, observing the theatre of life… and the crushing disappointment of this décor.", action: 'wait', pitch: 'low' },
                    { speaker: 'a', text: "Ugh. It smells like wet dog in here. Let’s make this quick, darling. I have a headache, and the necks in this room look dry.", action: 'wait', pitch: 'medium' },
                    { speaker: 'mol', text: "‘Dry necks.’ Funny. I’m writing you down as 'Potential Cannibals.'", action: 'wait' },
                    { speaker: 'mol', text: "I can’t risk losing more profilers to sexy, intense, prohibited love affairs with Lithuanian middle-aged men. One cannibal incident was enough for HR.", action: 'wait' },
                    {
                        action: 'choice',
                        choices: ["That was oddly specific…", "Should we offer refreshments?"],
                        responses: [
                            [
                                { speaker: 'mol', text: "This job is full of specific nightmares, Cadet. You get used to it, or you go mad.", action: 'wait'},
                            
                            ],
                            [
                                { speaker: 'mol', text: "Refreshments?! This is an interrogation, not a bloody tea party! Do you want to braid their hair next?", action: 'wait'},
                            ]
                        ]
                    },
                    { speaker: 'mol', text: "Now, silliness aside, you two. Did you see the suspect? Indescribably awesome hair, looks like she hasn't slept in a decade, typing furiously on a phone?", action: 'wait'},
                    { speaker: 'a', text: "Oh, the little voyeur? Yes, she was staring at us. Quite intensely at that. I usually like that in a woman, but she looked like she was mentally subjecting me to things I don’t approve of as much. Like an enormous quantity of trauma and drama.", action: 'wait', pitch: 'medium' },
                    { speaker: 'r', text: "Actually, if refreshments are on the table, I would take a red.", action: 'wait', pitch: 'low' },
                    { speaker: 'mol', text: "We are not a catering service. Also… did you say she was staring?", action: 'wait'},
                    { speaker: 'mol', text: "I confiscated a file from her. A 'fan-fiction.' It was describing a pale elf and a devil… doing things that are physically impossible without breaking a spine. Do you happen to know anything about this smutty piece of evidence?", action: 'wait'},
                    { speaker: 'a', text: "I know nothing about that. But now that I see it properly… May I have a copy? My nocturnal reading catalogue needs some freshening up, and this seems like the right piece.", action: 'wait', pitch: 'medium' },
                    { speaker: 'mol', text: "This is EVIDENCE!! No copies! It stays in the archives, specifically my private archive. For security reasons.", action: 'wait', loud: true },
                    { speaker: 'r', text: "Hm. Before you archive it, in this… narrative piece of hers, did the fiction imply whether the devil was the top or the bottom of the arrangement? My reputation requires… specific positioning.", action: 'wait', pitch: 'low' },
                    { speaker: 'a', text: "My love, I’m afraid it is far too late for your reputation.", action: 'wait', pitch: 'medium' },
                    { speaker: 'mol', text: "Did the suspect approach you in any way? Did she offer you opportunities to 'open your third eye' and join a cult?", action: 'wait'},
                    { speaker: 'a', text: "HAH! The only 'third eye' I’m interested in opening warms my bed every night, darling. But thank you for your worry.", action: 'wait', pitch: 'medium', loud: true },
                    { speaker: 'r', text: "THAT’S NOT…", action: 'wait', pitch: 'low', loud: true, effect: 'shake_flash' },
                    { speaker: 'a', text: "Anyway, she didn't recruit us. She looked about to die from a heart attack, most likely. She passed out right there, clutching her heart as she tried to form words. I didn’t even get to sup on her blood. A tragedy, really.", action: 'wait', pitch: 'medium' },
                    { speaker: 'mol', text: "She fainted? Impossible. She is a criminal mastermind! A true hazard who sleeps too much and eats pretzels. And Fritz Kola.", action: 'wait' },
                    { speaker: 'r', text: "Ah, my favourite kind of client then. I’ll make sure to visit this… eater of ‘Pretzels’. A bland snack for a bland world. Come now, beloved. We have wasted enough time with this mortal loudmouth.", action: 'wait', pitch: 'low' },
                    { speaker: 'a', text: "I agree, she seems like fun. I like this criminal—I could use a nap right now myself. Anything to skip this ‘Nutcracker Suite’ you keep pestering me about.", action: 'wait', pitch: 'medium' },
                    { speaker: 'mol', text: "LOUDMOUTH?!", action: 'wait' },
                    { speaker: 'mol', text: "I am the Senior Officer Investigator Profiler First Sergeant Colonel MOL!", action: 'vanish', sound: 'snap' },
                    { speaker: 'mol', text: "You don't leave me, I DISMISS YOU! Get back here! ...Wait, did they just vanish in a puff of smoke?!", action: 'wait' },
                    {
                        action: 'choice',
                        choices: ["Well, they seemed nice.", "Did he say 'sup on blood'?"],
                        responses: [
                            [
                                { speaker: 'mol', text: "Nice? They looked like they were deciding which wine pairs best with my liver. You need better instincts, Cadet.", action: 'wait'},
                            ],
                            [
                                { speaker: 'mol', text: "I stopped listening after 'theatre of life.' If I listened to every weirdo in this city, I’d have jumped off a bridge years ago. Let's move on.", action: 'wait'},
                            ]
                        ]
                    },
                    { speaker: 'mol', text: "Alright, let's write down what we have learned from these two… interesting individuals.", action: 'wait'}
                ]
            }
        ]
    }

};
