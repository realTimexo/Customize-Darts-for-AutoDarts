(function() {
    window.adTourney = window.adTourney || {};

    // Sprachsteuerung über localStorage
    const currentLng = 'en';
    const translations = {
        'de': {
            resetTitle: 'TURNIER LÖSCHEN?',
            resetText: 'Möchtest du das aktuelle Turnier beenden? Spieler und Einstellungen bleiben gespeichert.',
            resetConfirm: 'Turnier beenden',
            fullResetTitle: 'ALLES ZURÜCKSETZEN?',
            fullResetText: 'Dies löscht alle eingetragenen Namen und setzt alle Match-Optionen auf Standardwerte.',
            fullResetConfirm: 'Alles löschen',
            globalSurrenderTitle: 'KOMPLETTE AUFGABE',
            globalSurrenderText: 'gibt das gesamte Turnier auf?',
            globalSurrenderConfirm: 'Ja, aufgeben',
			boardMissingTitle: 'BOARD-ID FEHLT',
			boardMissingText: 'Es wurde keine gültige Board-ID gefunden (oder sie steht auf "manual"). Bitte öffne zuerst einmal manuell eine private Lobby auf Autodarts und wähle dein Board aus. Lade danach diese Seite neu, damit die ID gespeichert werden kann.',
			boardMissingConfirm: 'Verstanden'
        },
        'en': {
            resetTitle: 'DELETE TOURNAMENT?',
            resetText: 'Do you want to end the current tournament? Players and settings remain saved.',
            resetConfirm: 'End tournament',
            fullResetTitle: 'RESET EVERYTHING?',
            fullResetText: 'This will delete all entered names and reset all match options to default values.',
            fullResetConfirm: 'Delete all',
            globalSurrenderTitle: 'COMPLETE SURRENDER',
            globalSurrenderText: 'surrenders the entire tournament?',
            globalSurrenderConfirm: 'Yes, surrender',
			boardMissingTitle: 'BOARD-ID MISSING',
			boardMissingText: 'No valid Board-ID found (or it is set to "manual"). Please open a private lobby manually on Autodarts first and select your board. Reload this page afterwards so the ID can be synchronized.',
			boardMissingConfirm: 'Got it'
        }
    };
    const t = translations['en'];

    window.adTourney.actions = {
        updateGlobalSetting: function(key, value) {
            window.adTourney.state.settings[key] = value;
            window.adTourney.save();
            window.adTourney.renderUI();
        },

        toggleSettingsPopup: function() {
            window.adTourney.state.showSettings = !window.adTourney.state.showSettings;
            window.adTourney.save();
            window.adTourney.renderUI();
        },

        resetTournament: function() {
            const { state, save, renderUI } = window.adTourney;
            window.adModals.show({ 
                title: t.resetTitle, text: t.resetText, confirmText: t.resetConfirm, onConfirm: () => {
                    state.step = 'SETUP'; state.view = 'KO'; state.activePlayer1Name = null;
                    state.surrenderedPlayers = []; state.matches = [];
                    state.groupMatches = []; state.leagueMatches = []; state.groups = []; state.rounds = []; state.reachable = [];
                    state.showSettings = false;
                    save(); renderUI();
                }
            });
        },

        fullReset: function() {
            const { state, save, renderUI } = window.adTourney;
            window.adModals.show({ 
                title: t.fullResetTitle, text: t.fullResetText, confirmText: t.fullResetConfirm, onConfirm: () => {
                    const defaults = {
                        step: 'SETUP', mode: 'KO', view: 'KO', activePlayer1Name: null,
                        groupSettings: { size: 4, totalAdvance: 8 },
                        players: [], surrenderedPlayers: [], matches: [],
                        groupMatches: [], leagueMatches: [], groups: [], rounds: [], reachable: [],
                        showSettings: false,
                        settings: { baseScore: 501, inMode: "Straight", outMode: "Double", maxRounds: 50, bullMode: "25/50", bullOffMode: "Normal", targetLegs: 2, returnMatch: 'Off', usePlus: 'Off' }
                    };
                    Object.assign(state, defaults);
                    save(); renderUI();
                }
            });
        },

        surrenderGlobally: function(playerName) {
            const { state, save, renderUI, updateTable, advanceWinner, checkFinalVictory, checkLeagueVictory } = window.adTourney;
            window.adModals.show({ 
                title: t.globalSurrenderTitle, text: `${playerName} ${t.globalSurrenderText}`, confirmText: t.globalSurrenderConfirm, onConfirm: () => {
                    if (!state.surrenderedPlayers.includes(playerName)) state.surrenderedPlayers.push(playerName);
                    [state.groupMatches, state.matches, state.leagueMatches].forEach(list => {
                        list.forEach((m, idx) => {
                            if ((m.p1 === playerName || m.p2 === playerName) && !m.finished) {
                                m.winner = (m.p1 === playerName) ? m.p2 : m.p1; m.finished = true; m.results = { p1L: '0', p1A: '-', p2L: '0', p2A: '-' };
                                if (list !== state.matches) updateTable(m, state.groups);
                                else { advanceWinner(idx); checkFinalVictory(idx); }
                            }
                        });
                    });
                    state.activePlayer1Name = null;
                    if (state.mode === 'LEAGUE') checkLeagueVictory();
                    save(); renderUI();
                }
            });
        },

		startTournament: async function() {
            const { state, save, renderUI, createKOBracket } = window.adTourney;
            if (state.players.length < 2) return;
            
            // Board-ID wird beim Spielstart live von der API geholt (kein Vorcheck nötig)
            const shuffledPlayers = [...state.players].sort(() => Math.random() - 0.5);

            // VERBESSERTE LOGIK: Erzwingt Pausen
            const distributeMatchesFairly = (matches) => {
                let pool = [...matches].sort(() => Math.random() - 0.5);
                let result = [];
                let lastPlayed = []; // Speichert die letzten 2-4 Spieler

                while (pool.length > 0) {
                    // Suche Match, wo BEIDE Spieler am längsten nicht dran waren
                    let bestMatchIdx = pool.findIndex(m => 
                        !lastPlayed.includes(m.p1) && !lastPlayed.includes(m.p2)
                    );

                    // Falls kein perfektes Match (z.B. am Ende), nimm eines, wo nur einer pausiert hat
                    if (bestMatchIdx === -1) {
                        bestMatchIdx = pool.findIndex(m => !lastPlayed.slice(-2).includes(m.p1) && !lastPlayed.slice(-2).includes(m.p2));
                    }
                    
                    if (bestMatchIdx === -1) bestMatchIdx = 0;

                    let match = pool.splice(bestMatchIdx, 1)[0];
                    result.push(match);
                    
                    // Aktualisiere die "Gerade gespielt"-Liste
                    lastPlayed.push(match.p1, match.p2);
                    if (lastPlayed.length > 4) lastPlayed.splice(0, 2); // Behalte die letzten 4 Spieler im Gedächtnis
                }
                return result;
            };

            if (state.mode === 'GROUPS') {
                const targetSize = state.groupSettings.size;
                const numGroups = Math.ceil(shuffledPlayers.length / targetSize);
                const baseSize = Math.floor(shuffledPlayers.length / numGroups);
                const extraPlayers = shuffledPlayers.length % numGroups;
                let currentIdx = 0; let groups = []; let allGroupMatches = [];

                for (let i = 0; i < numGroups; i++) {
                    const size = baseSize + (i < extraPlayers ? 1 : 0);
                    const groupPlayersNames = shuffledPlayers.slice(currentIdx, currentIdx + size);
                    const gId = String.fromCharCode(65 + i);
                    groups.push({ id: gId, players: groupPlayersNames.map(p => ({ name: p, wins: 0, diff: 0, lf: 0, la: 0, totalAvg: 0, sumAvg: 0, playedAvgMatches: 0 })) });

                    let pairs = [];
                    for (let j = 0; j < groupPlayersNames.length; j++) {
                        for (let k = j + 1; k < groupPlayersNames.length; k++) {
                            pairs.push({ groupId: gId, p1: groupPlayersNames[j], p2: groupPlayersNames[k], finished: false, results: null, winner: null, uuid: null, isReturn: false });
                            if (state.settings.returnMatch === 'On') {
                                pairs.push({ groupId: gId, p1: groupPlayersNames[k], p2: groupPlayersNames[j], finished: false, results: null, winner: null, uuid: null, isReturn: true });
                            }
                        }
                    }
                    allGroupMatches.push(...distributeMatchesFairly(pairs));
                    currentIdx += size;
                }
                state.groups = groups; state.groupMatches = allGroupMatches;
                state.step = 'ACTIVE_GROUPS'; state.view = 'GROUPS';
            } else if (state.mode === 'LEAGUE') {
                state.groups = [{ id: 'LIGA', players: shuffledPlayers.map(p => ({ name: p, wins: 0, diff: 0, lf: 0, la: 0, totalAvg: 0, sumAvg: 0, playedAvgMatches: 0 })) }];
                let pairs = [];
                for (let j = 0; j < shuffledPlayers.length; j++) {
                    for (let k = j + 1; k < shuffledPlayers.length; k++) {
                        pairs.push({ p1: shuffledPlayers[j], p2: shuffledPlayers[k], finished: false, results: null, winner: null, uuid: null, isReturn: false });
                        if (state.settings.returnMatch === 'On') {
                            pairs.push({ p1: shuffledPlayers[k], p2: shuffledPlayers[j], finished: false, results: null, winner: null, uuid: null, isReturn: true });
                        }
                    }
                }
                state.leagueMatches = distributeMatchesFairly(pairs);
                state.step = 'ACTIVE_LEAGUE'; state.view = 'LEAGUE';
            } else {
                createKOBracket(shuffledPlayers);
                state.step = 'ACTIVE'; state.view = 'KO';
            }
            save(); renderUI();
        }
    };
})();