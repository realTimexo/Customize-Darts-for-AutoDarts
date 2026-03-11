(function() {
    // Sprachsteuerung über localStorage
    const currentLng = localStorage.getItem('i18nextLng') || 'en';
    const translations = {
        'de': {
            league: 'LIGA',
            group: 'GRUPPE',
            pos: 'POS',
            player: 'SPIELER',
            wins: 'S',
            legs: 'LEGS',
            avg: 'AVG'
        },
        'en': {
            league: 'LEAGUE',
            group: 'GROUP',
            pos: 'POS',
            player: 'PLAYER',
            wins: 'W',
            legs: 'LEGS',
            avg: 'AVG'
        }
    };
    const t = translations[currentLng.startsWith('de') ? 'de' : 'en'] || translations['en'];

    // Styles für Tabellen, Gruppen-Karten und Surrender-Buttons
    const style = document.createElement('style');
    style.innerHTML = `
        .groups-grid { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 30px; width: 100%; }
        .group-card { 
            background: rgba(30, 41, 59, 0.6); 
            backdrop-filter: blur(14px) saturate(180%); 
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.12); 
            border-radius: 20px; 
            padding: 20px; 
            flex: 1 1 430px; 
            min-width: 430px; 
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }
        .group-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .group-table th { 
            padding: 10px 5px; 
            color: rgba(255, 255, 255, 0.5); 
            font-size: 11px; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .group-table td { padding: 12px 5px; color: white; font-size: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .group-table th:nth-child(1), .group-table td:nth-child(1), 
        .group-table th:nth-child(3), .group-table td:nth-child(3), 
        .group-table th:nth-child(4), .group-table td:nth-child(4), 
        .group-table th:nth-child(5), .group-table td:nth-child(5) { width: 65px; text-align: center; }
        .group-table th:nth-child(2), .group-table td:nth-child(2) { min-width: 150px; text-align: left; font-weight: 500; }
        .adv-row { background: rgba(72, 187, 120, 0.08) !important; }
        .adv-row td:nth-child(2) { color: #68D391 !important; font-weight: 700; text-shadow: 0 0 10px rgba(104, 211, 145, 0.3); }
        .global-surrender-btn { 
            background: rgba(255, 255, 255, 0.05); 
            border: 1px solid rgba(255, 255, 255, 0.1); 
            color: rgba(255, 255, 255, 0.3); 
            cursor: pointer; 
            margin-left: 10px; 
            font-size: 12px; 
            padding: 2px 6px; 
            border-radius: 6px; 
            transition: 0.2s; 
        }
        .global-surrender-btn:hover { background: rgba(229, 62, 62, 0.2); color: #FC8181; border-color: #FC8181; }
    `;
    document.head.appendChild(style);

    window.adTables = {
        renderStandingGrid: function(groups, viewMode, surrenderedPlayers, advancingPlayers, containerWidth) {
            // SICHERHEITS-CHECK: Sicherstellen, dass die Variablen Arrays sind
            const surrSafe = Array.isArray(surrenderedPlayers) ? surrenderedPlayers : [];
            const advSafe = Array.isArray(advancingPlayers) ? advancingPlayers : [];

            const isLeague = viewMode === 'LEAGUE';
            let html = '<div class="groups-grid" id="ad-grid-target">';
            
            groups.forEach(g => {
                const sorted = [...g.players].sort((a,b) => {
                    const isSurrA = surrSafe.includes(a.name); 
                    const isSurrB = surrSafe.includes(b.name);
                    if (isSurrA && !isSurrB) return 1; if (!isSurrA && isSurrB) return -1;
                    return b.wins - a.wins || b.diff - a.diff || (b.totalAvg || 0) - (a.totalAvg || 0);
                });
                
                let numSplits = 1;
                if (isLeague) {
                    const availableWidth = containerWidth - 40; 
                    const maxSplitsByWidth = Math.max(1, Math.floor(availableWidth / 450));
                    if (sorted.length > 16) numSplits = Math.min(3, maxSplitsByWidth);
                    else if (sorted.length > 8) numSplits = Math.min(2, maxSplitsByWidth);
                }
                
                const chunkSize = Math.ceil(sorted.length / numSplits);
                for (let s = 0; s < numSplits; s++) {
                    const chunk = sorted.slice(s * chunkSize, (s + 1) * chunkSize);
                    if (chunk.length === 0) continue;
                    
                    html += `<div class="group-card"><div style="font-weight:bold; color:#3182CE; margin-bottom:10px;">${isLeague ? t.league : t.group + ' ' + g.id}</div><table class="group-table"><thead><tr><th>${t.pos}</th><th>${t.player}</th><th>${t.wins}</th><th>${t.legs}</th><th>${t.avg}</th></tr></thead><tbody>`;
                    
                    chunk.forEach((p, idx) => {
                        const globalIdx = (s * chunkSize) + idx;
                        const isAdv = !isLeague && advSafe.includes(p.name);
                        const isSurr = surrSafe.includes(p.name);
                        
                        html += `<tr class="${isAdv ? 'adv-row' : ''}"><td>${globalIdx+1}</td><td style="${isSurr ? 'opacity:0.4; text-decoration:line-through;' : ''}">${p.name}${!isSurr ? `<button class="global-surrender-btn" data-name="${p.name}">🏳</button>` : ''}</td><td>${p.wins}</td><td>${p.lf}:${p.la}</td><td>${(p.totalAvg || 0).toFixed(2)}</td></tr>`; 
                    });
                    
                    html += `</tbody></table></div>`;
                }
            });
            
            html += '</div>';
            return html;
        }
    };
})();