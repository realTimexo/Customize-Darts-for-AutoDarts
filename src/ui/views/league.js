(function() {
    const currentLng = 'en';
    const translations = {
        'de': {
            schedule: 'SPIELPLAN LIGA',
            returnRound: 'RÜCKRUNDE LIGA',
            hinBtn: 'Hinrunde', 
            rueckBtn: 'Rückrunde'
        },
        'en': {
            schedule: 'LEAGUE SCHEDULE', 
            returnRound: 'RETURN LEG LEAGUE', 
            hinBtn: 'First Leg', 
            rueckBtn: 'Return Leg'
        }
    };
    const t = translations['en'];

    // Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .ad-league-match-header { color: #3182CE; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; }
        .ad-league-match-container { display: flex; flex-wrap: wrap; gap: 15px; }
        .ad-league-section { margin-bottom: 30px; }

        /* --- SYMMETRISCHER LIQUID SLIDER (WIE IN GROUPS.JS) --- */
        .liquid-slider-wrapper {
            --slider-w: 240px;
            --slider-p: 4px;
            width: var(--slider-w);
            height: 40px;
            margin: 0 auto 25px auto;
            position: relative;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            display: flex;
            padding: var(--slider-p);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }

        .liquid-slider-thumb {
            position: absolute;
            height: 32px;
            width: calc((var(--slider-w) - (var(--slider-p) * 2)) / 2);
            left: var(--slider-p);
            background: rgba(49, 130, 206, 0.5);
            backdrop-filter: saturate(180%) blur(10px);
            -webkit-backdrop-filter: saturate(180%) blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            z-index: 1;
            transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .liquid-slider-thumb.is-right { transform: translateX(100%); }
        .animate-to-right { animation: leagueSlideRight 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .animate-to-left { animation: leagueSlideLeft 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards; }

        @keyframes leagueSlideRight {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
        }
        @keyframes leagueSlideLeft {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }

        .schedule-tab-btn {
            flex: 1;
            z-index: 2;
            text-align: center;
            font-weight: 800;
            font-size: 11px;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.4);
            cursor: pointer;
            transition: color 0.3s ease;
            background: none;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .schedule-tab-btn.active { color: white; }
    `;
    document.head.appendChild(style);

    window.adLeague = {
		render: function(state, containerWidth, getCurrentlyAdvancing) {
			let html = "";
			
			// 1. Tabelle rendern - KORRIGIERTER AUFRUF
			html += window.adTables.renderStandingGrid(
                state.groups, 
                'LEAGUE', 
                state.surrenderedPlayers || [], 
                [], 
                containerWidth
            );

			// 2. Spielplan Bereich
			const activeMatches = state.leagueMatches;
			
            // --- ANIMATIONS-LOGIK (WIE IN GROUPS.JS) ---
            const currentTab = state.scheduleTab || 'HIN';
            const prevTab = window._adLastScheduleTab;
            window._adLastScheduleTab = currentTab;
            let animClass = "";
            if (prevTab && prevTab !== currentTab) {
                animClass = currentTab === 'RUECK' ? 'animate-to-right' : 'animate-to-left';
            }

			if (state.settings.returnMatch === 'On') {
                const isRueck = currentTab === 'RUECK';
				html += `
				<div class="liquid-slider-wrapper">
                    <div class="liquid-slider-thumb ${animClass || (isRueck ? 'is-right' : '')}"></div>
					<button class="schedule-tab-btn ${!isRueck ? 'active' : ''}" data-tab="HIN">${t.hinBtn}</button>
					<button class="schedule-tab-btn ${isRueck ? 'active' : ''}" data-tab="RUECK">${t.rueckBtn}</button>
				</div>`;
			}

			state.groups.forEach(g => {
				// Filterung UND Sortierung (Offene Spiele zuerst)
				const displayMatches = activeMatches
					.filter(m => state.scheduleTab === 'RUECK' ? m.isReturn : !m.isReturn)
					.sort((a, b) => a.finished - b.finished);

				html += `
					<div class="ad-league-section">
						<div class="ad-league-match-header">${(state.scheduleTab === 'RUECK' ? t.returnRound : t.schedule)}</div>
						<div class="ad-league-match-container">
							${displayMatches.map(m => window.adMatchbox.render(m, activeMatches.indexOf(m), 'league')).join('')}
						</div>
					</div>`;
			});

			return html;
		}
	};
})();