(function() {
    // Sprachsteuerung über localStorage
    const currentLng = 'en';
    const translations = {
        'de': {
			startKo: 'KO-Phase starten',
			schedule: 'SPIELPLAN GRUPPE',
			returnRound: 'RÜCKRUNDE GRUPPE',
			hinBtn: 'Hinrunde', 
			rueckBtn: 'Rückrunde'
		},
        'en': {
			startKo: 'START KO-PHASE',
			schedule: 'GROUP SCHEDULE', 
			returnRound: 'RETURN LEG GROUP', 
			hinBtn: 'First Leg', 
			rueckBtn: 'Return Leg'
		}
    };
    const t = translations['en'];

    // Styles für Gruppen-spezifische Elemente
    const style = document.createElement('style');
    style.innerHTML = `
		.ad-group-section { margin-bottom: 30px; }
        .ad-group-match-header { color: #3182CE; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; }
        .ad-group-match-container { display: flex; flex-wrap: wrap; gap: 15px; }
        
		/* --- SYMMETRISCHER LIQUID SLIDER --- */
        .liquid-slider-wrapper {
            --slider-w: 320px;
            --slider-p: 4px;
            margin: 0 auto 30px auto;
            width: var(--slider-w);
            height: 50px;
            position: relative;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 25px;
            padding: var(--slider-p);
            display: flex;
            align-items: center;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }

        .liquid-slider-thumb {
            position: absolute;
            height: 42px;
            /* Mathematisch exakte Breite für Symmetrie */
            width: calc((var(--slider-w) - (var(--slider-p) * 2)) / 2);
            left: var(--slider-p);
            background: rgba(49, 130, 206, 0.5);
            backdrop-filter: saturate(180%) blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 21px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3);
            z-index: 1;
            transform: translateX(0); /* Standard: Links */
        }

        .liquid-slider-thumb.is-right { transform: translateX(100%); }

        /* Animationen für den flüssigen Wechsel beim Re-Render */
        .liquid-slider-thumb.animate-to-right {
            animation: slideRight 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .liquid-slider-thumb.animate-to-left {
            animation: slideLeft 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @keyframes slideRight {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
        }
        @keyframes slideLeft {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }

        .schedule-tab-btn {
            flex: 1;
            z-index: 2;
            text-align: center;
            font-weight: 800;
            font-size: 11px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.4);
            cursor: pointer;
            transition: color 0.3s ease;
            background: none; border: none;
            height: 100%;
            user-select: none;
        }
        .schedule-tab-btn.active { color: white; text-shadow: 0 0 10px rgba(255,255,255,0.5); }

        /* --- KO-BUTTON (SOLID GLASS LOOK) --- */
        .btn-start-ko { 
            background: rgba(49, 130, 206, 0.75); 
            backdrop-filter: blur(14px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white; padding: 16px 35px; border-radius: 20px; cursor: pointer;
            text-transform: uppercase; font-weight: 800; letter-spacing: 2px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);
            margin: 30px auto 50px auto; display: block; 
            transition: all 0.3s ease;
        }
        .btn-start-ko:hover { 
            transform: translateY(-2px); 
            background: rgba(66, 153, 225, 0.9);
            box-shadow: 0 20px 45px rgba(49, 130, 206, 0.5);
        }
    `;
    document.head.appendChild(style);

    window.adGroups = {
		render: function(state, containerWidth, getCurrentlyAdvancing) {
			let html = "";
			
			// 1. Tabellen-Grid rendern
			html += window.adTables.renderStandingGrid(state.groups, 'GROUPS', state.surrenderedPlayers, getCurrentlyAdvancing(), containerWidth);

			const activeMatches = state.groupMatches;
			const allMatchesDone = activeMatches.length > 0 && activeMatches.every(m => m.finished);
            if (allMatchesDone && state.step !== 'ACTIVE') {
                html += `<button id="start-ko-final" class="btn-start-ko">${t.startKo}</button>`;
            }
            const hinMatches = activeMatches.filter(m => !m.isReturn);
            const allHinDone = hinMatches.every(m => m.finished);

			// AUTO-SWITCH Logik
            if (allHinDone && !state.manualScheduleToggle && state.settings.returnMatch === 'On') {
                state.scheduleTab = 'RUECK';
            }

            // ANIMATIONS-LOGIK: Merken des Zustands für den Slide-Effekt
            const currentTab = state.scheduleTab;
            const prevTab = window._adLastGroupTab;
            window._adLastGroupTab = currentTab;

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
                const mList = activeMatches.filter(m => m.groupId === g.id);
                const displayMatches = mList
                    .filter(m => state.scheduleTab === 'RUECK' ? m.isReturn : !m.isReturn)
                    .sort((a, b) => a.finished - b.finished);

                html += `
                    <div class="ad-group-section">
                        <div class="ad-group-match-header">${(state.scheduleTab === 'RUECK' ? t.returnRound : t.schedule)} ${g.id}</div>
                        <div class="ad-group-match-container">
                            ${displayMatches.map(m => window.adMatchbox.render(m, activeMatches.indexOf(m), 'group')).join('')}
                        </div>
                    </div>`;
            });
            return html;
		}
	};
})();