(function() {
    window.adTourney = window.adTourney || {}; //

    let isSyncing = false; //


    window.adTourney.syncMatchResults = async function() {
        if (isSyncing) return; //
        isSyncing = true; //

        const token = window.adTourney.getAuthToken();
        if (!token) { isSyncing = false; return; } // Warte bis Token via pageScript verfügbar

        const { state, save, renderUI, updateTable, advanceWinner, checkFinalVictory, checkLeagueVictory } = window.adTourney; //
        if (!state) { isSyncing = false; return; } //

        const isLeague = state.mode === 'LEAGUE'; //
        const list = isLeague ? state.leagueMatches : (state.view === 'GROUPS' ? state.groupMatches : state.matches); //
        
        // WICHTIG: Wir filtern nur Matches, die eine UUID haben, aber noch nicht 'finished' sind.
        // Die UUID bleibt im Speicher erhalten, solange m.finished false ist.
        const pending = list.filter(m => m && m.uuid && !m.finished); //

        if (pending.length === 0) {
            isSyncing = false;
            return; //
        }

        try {
            let hasChanges = false;

            // Parallele Abfrage aller offenen Matches
            await Promise.all(pending.map(async (m) => {
                try {
                    const response = await fetch(`https://api.autodarts.io/as/v0/matches/${m.uuid}/stats`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }); //

                    if (response.ok) {
                        const data = await response.json(); //
                        
                        // Prüfen, ob das Match im Archiv einen gültigen Gewinner (Index 0 oder 1) hat
                        if (data.winner !== undefined && data.winner !== -1) {
    const apiPlayers = data.players || [];
    const apiStats = data.matchStats || [];

    // 1. Hole den Namen des Gewinners direkt über den API-Index
    const apiWinnerName = apiPlayers[data.winner]?.name || "";

    // 2. Finde heraus, welcher Statistik-Block der "Gewinner-Block" ist (mehr Legs)
    const statA = apiStats[0] || { legsWon: 0, average: 0 };
    const statB = apiStats[1] || { legsWon: 0, average: 0 };
    
    // Wer mehr Legs hat, ist der Sieger-Statistik-Block
    const winnerStats = (statA.legsWon >= statB.legsWon) ? statA : statB;
    const loserStats = (statA.legsWon >= statB.legsWon) ? statB : statA;

    // 3. ENTSCHEIDUNG: Hat dein Turnier-Spieler 2 (m.p2) gewonnen?
    const p2Won = apiWinnerName.trim().toLowerCase() === m.p2.trim().toLowerCase();

    // 4. ZUORDNUNG: Der Sieger bekommt immer die 'winnerStats'
    if (p2Won) {
        m.winner = m.p2;
        m.results = {
            p1L: String(loserStats.legsWon),
            p1A: (loserStats.average || 0).toFixed(2),
            p2L: String(winnerStats.legsWon),
            p2A: (winnerStats.average || 0).toFixed(2)
        };
    } else {
        m.winner = m.p1;
        m.results = {
            p1L: String(winnerStats.legsWon),
            p1A: (winnerStats.average || 0).toFixed(2),
            p2L: String(loserStats.legsWon),
            p2A: (loserStats.average || 0).toFixed(2)
        };
    }

    m.finished = true;

    // --- Turnier-Logik fortsetzen ---
    if (m.boardId && state.busyBoards.includes(m.boardId)) {
        state.busyBoards = state.busyBoards.filter(id => id !== m.boardId);
    }
    hasChanges = true;

    const mIdx = list.indexOf(m);
    if (state.mode === 'LEAGUE' || state.view === 'GROUPS') {
        updateTable(m, state.groups);
    } else {
        advanceWinner(mIdx);
        checkFinalVictory(mIdx);
    }
} else {
                            // Match läuft noch oder Archiv-Daten sind noch nicht bereit
                            console.log(`⏳ [AD-Sync] Match ${m.uuid} ist noch aktiv oder wird verarbeitet.`);
                        }
                    } else if (response.status === 404) {
                        console.log(`⏳ [AD-Sync] Match ${m.uuid} wird noch verarbeitet...`);
                    }
                } catch (e) {
                    console.error(`❌ [AD-Sync] Fehler bei Match ${m.uuid}:`, e); //
                }
            }));

            // Nur speichern und rendern, wenn tatsächlich ein Ergebnis gefunden wurde
            if (hasChanges) {
                save(); //
                renderUI(); //
            }

        } catch (globalErr) {
            console.error("❌ [AD-Sync] Globaler Synchronisierungsfehler:", globalErr); //
        } finally {
            isSyncing = false; //
        }
    };
})();
