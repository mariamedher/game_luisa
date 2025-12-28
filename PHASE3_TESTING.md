# Phase 3 Testing Checklist

**Date:** December 28, 2024
**Tasks Completed:** 14-18
**Purpose:** Verify all Phase 3 extractions work correctly

---

## 📋 Quick Test Guide

Open `index.html` in a browser and test each section below. Mark items complete as you test.

---

## 🎮 Basic Game Flow

- [ ] Start screen loads without errors
- [ ] Click "Start" button begins game
- [ ] Intro dialogue plays correctly
- [ ] Name input works
- [ ] Confirmation works (Yes/No)
- [ ] ESC key skips to title screen
- [ ] Title screen appears after intro
- [ ] Title "Continue" button goes to menu

---

## 🍕 Menu Screen Tests (Task 14)

### Idle Dialogue System
- [ ] Menu screen loads properly
- [ ] Idle dialogue appears after 2 seconds
- [ ] New dialogue appears every 15 seconds
- [ ] Idle dialogue stops when leaving menu
- [ ] Idle dialogue restarts when returning to menu

### Coffee System
- [ ] Coffee button appears on coffee lines (indices 0,1,2,3,4,5,14)
- [ ] Clicking coffee button triggers Mol reaction
- [ ] Happy Mol sprite appears after coffee
- [ ] Coffee cooldown works (no coffee lines for 2 dialogues)
- [ ] Special sprites appear after all witnesses interviewed:
  - [ ] Mol_cait.png (after Cait's witness interview)
  - [ ] Mol_ella.png (after Ella & Tobias interview)
  - [ ] Mol_ast_less.png (after Glorp interview)

---

## 💫 Floating Text Tests (Task 15)

### Identify Screen Fear Sequence
- [ ] Fear sequence starts correctly
- [ ] Floating fear words appear and pulse
- [ ] Fear words can be double-clicked to cross out
- [ ] Depression stages apply correctly:
  - [ ] Stage 1: First cluster crossed
  - [ ] Stage 2: Second cluster crossed
  - [ ] Stage 3: Third cluster crossed
  - [ ] Stage 4: Fourth cluster crossed (recovery)

### Dreams Sequence
- [ ] Dreams sequence floating text appears
- [ ] Dream words pulse correctly
- [ ] Clicking dreams reveals them

### Finale Sequence
- [ ] Finale floating text appears
- [ ] Positive words transform correctly

---

## 🎬 Title & End Screen Tests (Task 16)

### Title Screen
- [ ] Title screen appears after intro dialogue
- [ ] Title screen "Continue" button goes to menu
- [ ] All assets load correctly

### End Screen
- [ ] Exit button from menu shows end screen
- [ ] End screen displays properly
- [ ] Music pauses on end screen
- [ ] Persistent leads hidden on end screen
- [ ] "Play Again" button works
- [ ] "Play Again" resets all game state
- [ ] Game can be replayed without refresh

---

## 📚 Leads Screen

- [ ] "Get the Leads" button works
- [ ] Leads dialogue plays
- [ ] Hair chaos animation works
- [ ] Colored text appears correctly
- [ ] Kola sprite appears/hides correctly
- [ ] Leads are added to persistent list
- [ ] Back to menu button works

---

## 🔍 Physical Evidence Screen

- [ ] "Physical Evidence" button works
- [ ] Evidence intro dialogue plays
- [ ] Evidence grid appears
- [ ] Clicking evidence items works
- [ ] Evidence dialogue plays for each item
- [ ] Choices work correctly
- [ ] Mol sprite changes (jam, surprised, pretzel)
- [ ] Pretzel sprite plays sparkle + munch sound
- [ ] Evidence marked as completed
- [ ] Manuscript lead updates when returning to menu
- [ ] All 9 evidence items can be completed
- [ ] Back to menu button works

---

## 👥 Witness Reports Screen

- [ ] "Witness Reports" button works
- [ ] Witness intro dialogue plays
- [ ] Witness list appears
- [ ] Clicking witness items works
- [ ] Witness-specific music plays:
  - [ ] Cait's music
  - [ ] Glorp's music
  - [ ] Couple's music
- [ ] Witness dialogue plays
- [ ] Special actions work:
  - [ ] Spin (Cait)
  - [ ] Fly away (Cait)
  - [ ] Beam up (Glorp)
  - [ ] Vanish (Glorp)
  - [ ] Show image transitions
- [ ] Squeak sound plays (Cait)
- [ ] Helicopter sound plays (Cait)
- [ ] Mol surprised sprite appears during helicopter
- [ ] Speaker colors work (Cait = purple, Goblin = green, Couple = orange)
- [ ] Pitch variations work
- [ ] Choices work correctly
- [ ] Witness marked as completed
- [ ] Leads added to list
- [ ] Back to menu returns to main music
- [ ] All 3 witnesses can be completed
- [ ] Back to menu button works

---

## 🎯 Identify Suspect Screen

### Entry Requirements
- [ ] Button is disabled until all leads/evidence/witnesses complete
- [ ] Button becomes enabled when all requirements met
- [ ] Clicking button starts identify sequence

### Intro Phase
- [ ] Intro dialogue plays
- [ ] Final music starts

### Grid Phase
- [ ] Evidence grid appears
- [ ] Clicking items reveals traits
- [ ] Trait text displays correctly
- [ ] Hover text shows on items
- [ ] All items can be revealed

### Fear Sequence
- [ ] Fear intro dialogue plays
- [ ] Floating fear words appear
- [ ] Words pulse and move
- [ ] Double-clicking crosses out words
- [ ] Depression stages (1-4) apply correctly
- [ ] Visual effects match depression level
- [ ] All 4 clusters can be crossed out
- [ ] Conclusion dialogue plays

### Dreams Sequence
- [ ] Dreams intro dialogue plays
- [ ] Dream orbs appear
- [ ] Clicking reveals dreams
- [ ] All 4 dreams can be revealed
- [ ] Conclusion dialogue plays

### Finale Sequence
- [ ] Finale dialogue plays
- [ ] Dual speakers work (Mol + Luisa)
- [ ] Name input appears
- [ ] Entering correct name ("Luisa") advances
- [ ] Entering wrong name shows error (max 3 tries)
- [ ] Floating positive words appear
- [ ] Bean-up animation works
- [ ] Fade overlay works
- [ ] Final dialogue plays
- [ ] Game completes successfully

---

## 🔊 Audio Tests

### Music
- [ ] Main BGM plays on start
- [ ] Music fades between tracks
- [ ] Witness music switches correctly
- [ ] Final music plays in identify sequence
- [ ] Music pauses on end screen

### Sound Effects
- [ ] Click sounds play
- [ ] Papers sound plays
- [ ] Dice sound plays
- [ ] Harp sound plays
- [ ] Munch sound plays (coffee, pretzel)
- [ ] Clack sound plays
- [ ] Sparkle sound plays
- [ ] Surprise sound plays
- [ ] Squeak sound plays (Cait)
- [ ] Helicopter sound plays (Cait)
- [ ] Snap sound plays
- [ ] Slurp sound plays (coffee)
- [ ] Alien sound plays (Glorp)
- [ ] Spaceship sound plays (Glorp)

### Animalese
- [ ] Letter sounds play during typing
- [ ] Loud text has loud pitch
- [ ] Normal text has normal pitch
- [ ] Different pitches work (high, low, veryHigh)
- [ ] Silent text (in asterisks) has no sound

---

## 🎨 Visual Effects

- [ ] Flash effect works (loud dialogue)
- [ ] Shake effect works (loud dialogue)
- [ ] Text colors work (speakers: Cait, Goblin, Couple)
- [ ] Action text styling works (*asterisks*)
- [ ] Depression filter stages work (1-4)
- [ ] Floating text animations work
- [ ] Fade overlays work
- [ ] Bean-up animations work

---

## ⌨️ Input Tests

### Keyboard
- [ ] Enter key advances dialogue (intro)
- [ ] Enter key advances dialogue (leads)
- [ ] Enter key advances dialogue (evidence)
- [ ] Enter key advances dialogue (witness)
- [ ] Enter key advances dialogue (identify)
- [ ] Enter key doesn't work when typing in input field
- [ ] ESC key skips intro to title screen

### Mouse
- [ ] Clicking dialogue box advances dialogue (all screens)
- [ ] Clicking buttons works (all buttons)
- [ ] Clicking evidence items works
- [ ] Clicking witness items works
- [ ] Clicking identify grid items works
- [ ] Double-clicking fear words works
- [ ] Clicking dream orbs works

---

## 🔄 State Management

- [ ] Game state persists across screens
- [ ] Collected leads persist
- [ ] Completed evidence persists
- [ ] Completed witnesses persist
- [ ] Special Mol sprites persist
- [ ] Coffee cooldown persists
- [ ] Player name persists
- [ ] Play Again resets all state correctly

---

## 🐛 Error Checking

- [ ] No console errors on page load
- [ ] No console errors during gameplay
- [ ] No console errors when switching screens
- [ ] No console errors when clicking items
- [ ] No console errors during fear sequence
- [ ] No console errors during dreams sequence
- [ ] No console errors during finale
- [ ] No console errors on reset

---

## 🎯 Full Playthrough Test

Complete the entire game from start to finish:

1. [ ] Click Start
2. [ ] Complete intro dialogue
3. [ ] Enter name
4. [ ] Confirm name
5. [ ] (Optional) ESC to title, or continue
6. [ ] Click Continue on title screen
7. [ ] Get the Leads (complete entire sequence)
8. [ ] Complete all 9 Physical Evidence items
9. [ ] Complete all 3 Witness Reports
10. [ ] Idle dialogue works in menu (test coffee system)
11. [ ] Identify Suspect button becomes enabled
12. [ ] Complete Identify sequence:
    - [ ] Intro
    - [ ] Reveal all evidence
    - [ ] Complete fear sequence (cross out all 4 clusters)
    - [ ] Complete dreams sequence (reveal all 4 dreams)
    - [ ] Enter "Luisa" in finale
    - [ ] Watch bean-up and ending
13. [ ] Return to menu via Exit button
14. [ ] Click Play Again
15. [ ] Verify game resets correctly

---

## ✅ Success Criteria

All tests pass if:

- ✅ No console errors throughout entire playthrough
- ✅ All interactive elements work as expected
- ✅ All audio plays correctly
- ✅ All visual effects display correctly
- ✅ Game can be completed start to finish
- ✅ Play Again resets everything properly
- ✅ File:// protocol works (no server needed)

---

## 🎉 Testing Complete!

If all tests pass, Phase 3 refactoring is **SUCCESSFUL**!

**Next Steps:**
1. Commit changes to git
2. Celebrate! 🎄🎁
3. Ship to Luisa!

---

*Testing checklist created December 28, 2024*
