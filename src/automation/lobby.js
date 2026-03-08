(function() {
    window.adTourney = window.adTourney || {};

    window.adTourney.startMatchDirectly = async function(p1Name, p2Name, matchObj) {
        const { state, save } = window.adTourney;
        const s = state.settings;

        console.log('[AD-Lobby] ▶ startMatchDirectly aufgerufen:', p1Name, 'vs', p2Name);

        // TOKEN HOLEN
        const token = await window.adTourney.getAuthTokenAsync();
        console.log('[AD-Lobby] Token vorhanden:', !!token);

        if (!token) {
            window.adModals.show({
                title: 'TOKEN FEHLT',
                text: 'Bitte öffne kurz eine beliebige andere Seite auf autodarts.io und komm zurück, dann sollte es funktionieren.',
                confirmText: 'OK'
            });
            return;
        }

        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        try {
            // BOARDS LADEN
            console.log('[AD-Lobby] Lade Boards...');
            const boardRes = await fetch('https://api.autodarts.io/bs/v0/boards', { headers });
            console.log('[AD-Lobby] Boards HTTP Status:', boardRes.status);

            const boardsData = await boardRes.json();
            console.log('[AD-Lobby] Boards API Antwort:', boardsData);

            // API gibt entweder direkt ein Array oder { data: [...] } oder { boards: [...] }
            const allBoards = Array.isArray(boardsData)
                ? boardsData
                : (boardsData.data || boardsData.boards || boardsData.items || []);

            console.log('[AD-Lobby] Boards als Array:', allBoards.length, 'Boards gefunden');

            const { busyBoards } = window.adTourney.state;

            const availableBoards = allBoards.filter(b => {
                const isOnline = b.state && (b.state.connection === 'Connected' || b.state.connected === true);
                const isBusy = busyBoards.includes(b.id);
                return isOnline && !isBusy;
            });

            console.log('[AD-Lobby] Verfügbare Boards:', availableBoards.length);

            if (availableBoards.length === 1) {
                console.log('[AD-Lobby] Genau 1 Board online → starte direkt mit Board:', availableBoards[0].id);
                await performLobbyCreation(availableBoards[0].id);
            } else if (availableBoards.length === 0 && allBoards.length === 0) {
                window.adModals.show({
                    title: 'KEIN BOARD GEFUNDEN',
                    text: 'Es wurde kein Dartboard in deinem Account gefunden. Bitte stelle sicher, dass dein Board eingerichtet ist.',
                    confirmText: 'OK'
                });
            } else {
                console.log('[AD-Lobby] Mehrere/keine verfügbaren Boards → zeige Auswahl');
                window.adModals.selectBoard(allBoards, busyBoards, async (selectedId) => {
                    await performLobbyCreation(selectedId);
                });
            }
        } catch (err) {
            console.error('[AD-Lobby] ❌ Fehler beim Board-Laden:', err);
        }

        async function performLobbyCreation(boardId) {
            try {
                console.log('[AD-Lobby] Erstelle Lobby mit Board:', boardId);
                console.log('[AD-Lobby] Einstellungen:', s);

                // 1. LOBBY ERSTELLEN
                const createRes = await fetch('https://api.autodarts.io/gs/v0/lobbies', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        bullOffMode: s.bullOffMode,
                        isPrivate: true,
                        legs: parseInt(s.targetLegs),
                        settings: {
                            baseScore: parseInt(s.baseScore),
                            bullMode: s.bullMode,
                            inMode: s.inMode,
                            maxRounds: parseInt(s.maxRounds),
                            outMode: s.outMode
                        },
                        variant: "X01"
                    })
                });

                console.log('[AD-Lobby] Lobby erstellt, Status:', createRes.status);
                const lobby = await createRes.json();
                console.log('[AD-Lobby] Lobby:', lobby);
                const lobbyId = lobby.id;

                if (!lobbyId) {
                    console.error('[AD-Lobby] ❌ Keine Lobby-ID erhalten!', lobby);
                    return;
                }

                // 2. SPIELER HINZUFÜGEN
                const addPlayer = (name, bId) => {
                    console.log('[AD-Lobby] Füge Spieler hinzu:', name, 'Board:', bId);
                    return fetch(`https://api.autodarts.io/gs/v0/lobbies/${lobbyId}/players`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ name, boardId: bId })
                    });
                };

                const r1 = await addPlayer(p1Name, boardId);
                console.log('[AD-Lobby] Spieler 1 hinzugefügt, Status:', r1.status);
                const r2 = await addPlayer(p2Name, boardId);
                console.log('[AD-Lobby] Spieler 2 hinzugefügt, Status:', r2.status);

                // 3. START
                const startRes = await fetch(`https://api.autodarts.io/gs/v0/lobbies/${lobbyId}/start`, {
                    method: 'POST',
                    headers
                });
                console.log('[AD-Lobby] Match gestartet, Status:', startRes.status);

                matchObj.boardId = boardId;
                if (!state.busyBoards.includes(boardId)) state.busyBoards.push(boardId);
                matchObj.uuid = lobbyId;
                save();

                console.log('[AD-Lobby] ✅ Weiterleitung zu:', `https://play.autodarts.io/matches/${lobbyId}`);
                window.location.href = `https://play.autodarts.io/matches/${lobbyId}`;

            } catch (e) {
                console.error('[AD-Lobby] ❌ Fehler bei Lobby-Erstellung:', e);
            }
        }
    };
})();

