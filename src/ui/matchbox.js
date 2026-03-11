(function() {
    // Matchbox-spezifische Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .match-box { 
            position: relative; 
            background: rgba(40, 44, 52, 0.65); 
            backdrop-filter: saturate(180%) blur(14px); 
            -webkit-backdrop-filter: saturate(180%) blur(14px);
            border: 1px solid rgba(255, 255, 255, 0.12); 
            padding: 8px 16px; 
            border-radius: 18px; 
            width: 320px; /* Leicht verbreitert für die Stats */
            height: 60px; 
            z-index: 10; 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1); 
            transition: transform 0.2s ease;
        }
        
        .match-content { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; overflow: hidden; gap: 2px; }
        
        .player-row { display: flex; align-items: center; width: 100%; font-size: 14px; line-height: 1.4; }
        
        .player-name { 
            font-weight: 600; 
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            max-width: 120px; 
            color: rgba(255, 255, 255, 0.9); 
            text-transform: uppercase; 
            flex-shrink: 0; 
        }

        /* Stats-Bereich: Schiebt alles nach rechts */
        .stats-avg { 
            margin-left: auto; /* Das drückt den Rest nach rechts */
            font-weight: 400; 
            color: rgba(160, 174, 192, 0.7); 
            padding-right: 12px; 
            font-size: 12px; 
            font-family: monospace; /* Feste Breite für Zahlen */
        }

        .stats-legs { 
            font-weight: 700; 
            color: white; 
            min-width: 25px; 
            text-align: right; 
            font-size: 15px; 
            text-shadow: 0 0 10px rgba(255,255,255,0.3);
        }

        .winner-text .player-name { color: #68D391 !important; }
        .surrender-btn { background: transparent; border: none; color: rgba(255,255,255,0.2); cursor: pointer; margin-left: 6px; font-size: 12px; }

        /* Buttons */
        .play-btn-round { 
            width: 34px; height: 34px; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            border: none; cursor: pointer; flex-shrink: 0; margin-left: 12px; 
            box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.3), 0 4px 12px rgba(0,0,0,0.3);
        }
        .btn-green { background-image: linear-gradient(135deg, #48bb78, #2f855a); }
        .btn-red { background-image: linear-gradient(135deg, #F56565, #C53030); animation: pulse-red 2s infinite; }
        
        @keyframes pulse-red {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
        }

        .reset-match { background: transparent; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 16px; margin-right: 4px; }
    `;
    document.head.appendChild(style);

    window.adMatchbox = {
        render: function(m, idx, type) {
            const state = window.adTourney.state;
            const isStarted = m.uuid && !m.finished;

            // Play-Button anzeigen wenn: 
            // 1. Spieler feststehen und Match nicht beendet ist
            // 2. UND (entweder kein Match aktiv ist ODER genau dieses Match das aktive ist)
            const canStart = !m.finished && m.p1 !== 'TBD' && m.p2 !== 'TBD';

            return `
                <div class="match-box">
                    <div class="match-content">
                        <div class="player-row ${m.winner === m.p1 ? 'winner-text' : ''}">
                            <span class="player-name ${m.p1 === 'TBD' ? 'player-tbd' : ''}">${m.p1}</span>
                            ${canStart ? `<button class="surrender-btn" data-m="${idx}" data-p="1">🏳</button>` : ''}
                            <span class="stats-avg">${m.results ? m.results.p1A : ''}</span>
                            <span class="stats-legs">${m.results ? m.results.p1L : ''}</span>
                        </div>
                        <div class="player-row ${m.winner === m.p2 ? 'winner-text' : ''}">
                            <span class="player-name ${m.p2 === 'TBD' ? 'player-tbd' : ''}">${m.p2}</span>
                            ${canStart ? `<button class="surrender-btn" data-m="${idx}" data-p="2">🏳</button>` : ''}
                            <span class="stats-avg">${m.results ? m.results.p2A : ''}</span>
                            <span class="stats-legs">${m.results ? m.results.p2L : ''}</span>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center;">
                        ${isStarted ? `<button class="reset-match" data-type="${type}" data-idx="${idx}" style="background:transparent; border:none; color:#A0AEC0; cursor:pointer; margin-right:8px; font-size:16px;">↺</button>` : ''}
                        ${canStart ? `<button class="play-match play-btn-round ${isStarted ? 'btn-red' : 'btn-green'}" data-type="${type}" data-idx="${idx}">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M8 5v14l11-7z"/></svg>
                        </button>` : ''}
                    </div>
                </div>`;
        }
    };
})();