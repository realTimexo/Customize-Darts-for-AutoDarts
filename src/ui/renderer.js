(function() {
    const { PAGE_ID } = window.adTourney.constants;

    // Sprachsteuerung über localStorage
    const currentLng = 'en';
    const translations = {
        'de': {
            tournamentTitle: 'Lokales Turnier',
            resetBtn: 'Zurücksetzen',
            tabGroups: 'GRUPPENPHASE',
            tabLeague: 'LIGA',
            tabKo: 'KO-PHASE',
            settingsTitle: 'EINSTELLUNGEN ANPASSEN',
            saveBtn: 'SPEICHERN & SCHLIESSEN',
            gameModeLabel: 'Spielmodus: Legs (First to...)',
            firstTo: 'First to',
            leg: 'Leg',
            legs: 'Legs',
            baseScore: 'Base score',
            inMode: 'In mode',
            outMode: 'Out mode',
            maxRounds: 'Max Runden',
            bullMode: 'Bull mode',
            bullOff: 'Bull-off',
			returnMatch: 'Rückrunde',
			returnRound: 'RÜCKRUNDE',
            surrenderTitle: 'AUFGABE',
            surrenderText: 'gibt auf?',
            confirm: 'Bestätigen',
            resetMatchTitle: 'MATCH ZURÜCKSETZEN?',
            resetMatchBetween: 'Möchtest du das Match zwischen',
            resetMatchAnd: 'und',
            resetMatchText: 'wirklich zurücksetzen? Die Verknüpfung wird gelöscht.',
            yesReset: 'Ja, zurücksetzen',
			usePlus: 'Plus Abo nutzen',
			plusHint: 'Spiele von Spieler 1 zählen in die Statistik.'
        },
        'en': {
            tournamentTitle: 'Local Tournament',
            resetBtn: 'Reset',
            tabGroups: 'GROUP STAGE',
            tabLeague: 'LEAGUE',
            tabKo: 'KO PHASE',
            settingsTitle: 'ADJUST SETTINGS',
            saveBtn: 'SAVE & CLOSE',
            gameModeLabel: 'Game mode: Legs (First to...)',
            firstTo: 'First to',
            leg: 'Leg',
            legs: 'Legs',
            baseScore: 'Base score',
            inMode: 'In mode',
            outMode: 'Out mode',
            maxRounds: 'Max Rounds',
            bullMode: 'Bull mode',
            bullOff: 'Bull-off',
			returnMatch: 'Return Match',
			returnRound: 'RETURN ROUND',
            surrenderTitle: 'SURRENDER',
            surrenderText: 'surrenders?',
            confirm: 'Confirm',
            resetMatchTitle: 'RESET MATCH?',
            resetMatchBetween: 'Do you want to reset the match between',
            resetMatchAnd: 'and',
            resetMatchText: 'really reset? The link will be deleted.',
            yesReset: 'Yes, reset',
			usePlus: 'Use Plus Subscription',
			plusHint: 'Note: Player 1 matches count towards statistics, AI recognition works.'
        }
    };
    const t = translations['en'];

    const style = document.createElement('style');
    style.innerHTML = `
        /* ── Layout ─────────────────────────────────── */
        #autodarts-tools-config {
            flex: 1 !important; overflow-y: auto !important;
            padding: 0 !important; margin: 0 !important;
            font-family: var(--chakra-fonts-body,'Open Sans',sans-serif);
            color: white;
        }
        .adt-inner {
            max-width: 860px;
            margin: 0 auto;
            padding: 1.5rem 1.5rem 3rem;
        }

        /* ── Header ─────────────────────────────────── */
        .tournament-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            gap: .75rem;
        }
        .tournament-title {
            font-size: 1.3rem;
            font-weight: 800;
            color: white;
            text-transform: uppercase;
            margin: 0;
            letter-spacing: .06em;
        }
        .header-actions {
            display: flex;
            align-items: center;
            gap: .75rem;
        }

        /* ── Gear button ─────────────────────────────── */
        .gear-btn-glass {
            width: 38px; height: 38px;
            display: flex; align-items: center; justify-content: center;
            background: rgba(255,255,255,.05);
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 50%;
            cursor: pointer;
            transition: all .25s;
            font-size: 16px; padding: 0; line-height: 1;
            color: white;
        }
        .gear-btn-glass:hover {
            background: rgba(255,255,255,.12);
            transform: rotate(45deg);
            border-color: rgba(255,255,255,.2);
        }

        /* ── Reset button ────────────────────────────── */
        .btn-reset-glass {
            background: rgba(229,62,62,.12);
            border: 1px solid rgba(245,101,101,.18);
            color: #FEB2B2;
            padding: 0 14px;
            height: 32px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: .1em;
            cursor: pointer;
            transition: all .2s;
            font-family: inherit;
        }
        .btn-reset-glass:hover {
            background: rgba(229,62,62,.25);
            color: white;
            border-color: rgba(245,101,101,.35);
        }

        /* ── Tab slider ──────────────────────────────── */
        .main-slider-wrapper {
            --m-slider-w: 240px;
            --m-slider-p: 3px;
            width: var(--m-slider-w);
            height: 38px;
            position: relative;
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.08);
            border-radius: 10px;
            padding: var(--m-slider-p);
            display: flex;
        }
        .main-slider-thumb {
            position: absolute;
            height: calc(38px - var(--m-slider-p)*2);
            width: calc((var(--m-slider-w) - var(--m-slider-p)*2) / 2);
            left: var(--m-slider-p);
            background: rgba(49,130,206,.45);
            border: 1px solid rgba(255,255,255,.15);
            border-radius: 8px;
            z-index: 1;
            transition: transform .35s cubic-bezier(.25,1,.5,1);
        }
        .main-slider-thumb.is-right { transform: translateX(100%); }
        .animate-main-to-right { animation: mainSlideRight .35s cubic-bezier(.25,1,.5,1) forwards; }
        .animate-main-to-left  { animation: mainSlideLeft  .35s cubic-bezier(.25,1,.5,1) forwards; }
        @keyframes mainSlideRight { from{transform:translateX(0)} to{transform:translateX(100%)} }
        @keyframes mainSlideLeft  { from{transform:translateX(100%)} to{transform:translateX(0)} }
        .tab-btn {
            flex: 1; z-index: 2; text-align: center;
            font-weight: 700; font-size: 10px; letter-spacing: .08em;
            text-transform: uppercase; color: rgba(255,255,255,.35);
            cursor: pointer; transition: color .2s;
            background: none; border: none; font-family: inherit;
        }
        .tab-btn.active { color: white; }

        /* ── Settings overlay ────────────────────────── */
        .settings-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.55);
            backdrop-filter: blur(14px);
            display: flex; align-items: center; justify-content: center;
            z-index: 1000;
        }
        .settings-modal {
            background: rgba(15,20,35,.85);
            backdrop-filter: blur(24px) saturate(160%);
            width: 480px; padding: 2rem; border-radius: 16px;
            box-shadow: 0 24px 48px rgba(0,0,0,.5);
            border: 1px solid rgba(255,255,255,.1);
            color: white;
            max-height: 90vh; overflow-y: auto;
        }
        .modal-header {
            display: flex; justify-content: space-between;
            align-items: center; margin-bottom: 1.25rem;
        }
        .modal-header h3 {
            margin: 0; font-weight: 800;
            letter-spacing: .06em; font-size: 1rem; text-transform: uppercase;
        }
        .close-modal {
            background: rgba(255,255,255,.07);
            border: 1px solid rgba(255,255,255,.1);
            color: white; width: 32px; height: 32px;
            border-radius: 8px; font-size: 16px;
            cursor: pointer; display:flex; align-items:center; justify-content:center;
            transition: .2s; line-height:1;
        }
        .close-modal:hover { background: rgba(255,255,255,.14); }

        /* ── Setting rows ────────────────────────────── */
        .setting-item { margin-bottom: .75rem; }
        .setting-label {
            font-size: .65rem; font-weight: 700; color: rgba(255,255,255,.4);
            margin-bottom: .35rem; text-transform: uppercase;
            letter-spacing: .1em; display: block;
        }
        .liquid-slider-container {
            position: relative; display: flex;
            background: rgba(255,255,255,.04);
            border-radius: 8px; padding: 3px;
            border: 1px solid rgba(255,255,255,.07); overflow: hidden;
        }
        .slider-pill {
            position: absolute; height: calc(100% - 6px);
            background: rgba(49,130,206,.45);
            border: 1px solid rgba(255,255,255,.12); border-radius: 6px;
            z-index: 1;
            left: var(--pill-to);
            animation: pill-slide-anim .35s cubic-bezier(.2,1,.2,1) forwards;
        }
        @keyframes pill-slide-anim { from{left:var(--pill-from)} to{left:var(--pill-to)} }
        .setting-btn {
            flex: 1; padding: 7px 4px; background: transparent !important;
            border: none !important; color: rgba(255,255,255,.35);
            cursor: pointer; font-size: 11px; font-weight: 600;
            z-index: 2; border-radius: 6px; font-family: inherit;
        }
        .setting-btn.active { color: white !important; }
        .setting-select {
            width: 100%; background: rgba(255,255,255,.04); color: white;
            padding: 10px 14px; border-radius: 8px;
            border: 1px solid rgba(255,255,255,.08);
            outline: none; font-size: 12px; font-weight: 600;
            cursor: pointer; font-family: inherit;
            appearance: none; -webkit-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat; background-position: right 14px center; background-size: 12px;
        }
        .setting-select option { background: #0d1117; color: white; }
        .save-btn-glass {
            width: 100%; background: rgba(47,133,90,.55); color: white;
            padding: 13px; margin-top: 1rem; border-radius: 8px;
            border: 1px solid rgba(255,255,255,.12);
            font-weight: 700; text-transform: uppercase;
            letter-spacing: .1em; cursor: pointer; transition: .2s;
            font-family: inherit; font-size: .8rem;
        }
        .save-btn-glass:hover { background: rgba(56,161,105,.75); }
    `;
    document.head.appendChild(style);

    function renderSettingsHTML(settings) {
        const groups = [
            { label: t.baseScore, key: 'baseScore', opts: [121, 170, 301, 501, 701, 901] },
            { label: t.inMode, key: 'inMode', opts: ['Straight', 'Double', 'Master'] },
            { label: t.outMode, key: 'outMode', opts: ['Straight', 'Double', 'Master'] },
            { label: t.maxRounds, key: 'maxRounds', opts: [15, 20, 50, 80] },
            { label: t.bullMode, key: 'bullMode', opts: ['25/50', '50/50'] },
            { label: t.bullOff, key: 'bullOffMode', opts: ['Off', 'Normal', 'Official'] },
			...(window.adTourney.state.mode !== 'KO' ? [{ label: t.returnMatch, key: 'returnMatch', opts: ['Off', 'On'] }] : []),
			{ label: t.usePlus, key: 'usePlus', opts: ['Off', 'On'] }
        ];

        if (!window._adLastSettings) window._adLastSettings = {};

        return `
            <div class="settings-content">
                ${groups.map(g => {
                    const activeIdx = g.opts.findIndex(opt => opt == settings[g.key]);
                    const pillWidth = 100 / g.opts.length;
                    const prevIdx = typeof window._adLastSettings[g.key] !== 'undefined' ? window._adLastSettings[g.key] : activeIdx;
                    window._adLastSettings[g.key] = activeIdx;

                    return `
                    <div class="setting-item">
                        <label class="setting-label">${g.label}</label>
                        <div class="liquid-slider-container">
                            <div class="slider-pill" style="
                                width: calc(${pillWidth}% - 6px); 
                                --pill-from: calc(${prevIdx * pillWidth}% + 3px); 
                                --pill-to: calc(${activeIdx * pillWidth}% + 3px);">
                            </div>
                            ${g.opts.map(opt => `
                                <button class="setting-btn ${settings[g.key] == opt ? 'active' : ''}" 
                                    data-key="${g.key}" data-val="${opt}">${opt}</button>
                            `).join('')}
                        </div>
						${g.key === 'usePlus' ? `<div style="font-size:11px; color:rgba(255,255,255,0.3); margin-top:5px; margin-bottom:10px;">${t.plusHint}</div>` : ''}
                    </div>
                `;}).join('')}
                <div class="setting-item">
                    <label class="setting-label">${t.gameModeLabel}</label>
                    <select class="setting-select" id="target-legs-select">
                        ${[1,2,3,4,5,6,7,8,9,10,11,12].map(n => `<option value="${n}" ${settings.targetLegs == n ? 'selected' : ''}>${t.firstTo} ${n} ${n > 1 ? t.legs : t.leg}</option>`).join('')}
                    </select>
                </div>
            </div>
        `;
    }

    window.adTourney.renderUI = function() {
        const { state, syncMatchResults, actions } = window.adTourney;
        const container = document.getElementById(PAGE_ID); if (!container) return;

		// --- ANIMATIONS-LOGIK FÜR HAUPTMENÜ ---
        const currentView = state.view;
        const prevView = window._adLastMainView;
        window._adLastMainView = currentView;
        const showGroupsTab = state.mode === 'GROUPS';
        const showLeagueTab = state.mode === 'LEAGUE';
        const showKoTab = state.mode === 'KO' || (state.mode === 'GROUPS' && state.step === 'ACTIVE');
        const hasMultipleTabs = [showGroupsTab, showLeagueTab, showKoTab].filter(Boolean).length > 1;

        let mainAnimClass = "";
        if (prevView && prevView !== currentView && (currentView === 'KO' || currentView === 'GROUPS')) {
            mainAnimClass = currentView === 'KO' ? 'animate-main-to-right' : 'animate-main-to-left';
        }

        if (syncMatchResults) syncMatchResults();
        
        let headerHtml = `
			<div class="tournament-header">
                <h1 class="tournament-title">${t.tournamentTitle}</h1>
                <div class="header-actions">
                    ${(state.step !== 'SETUP') ? `
				<button class="gear-btn-glass" id="gear-toggle">⚙️</button>
				<div class="main-slider-wrapper" style="${!hasMultipleTabs ? 'width: 160px;' : ''}">
					<div class="main-slider-thumb ${hasMultipleTabs && state.view === 'KO' ? 'is-right' : ''} ${hasMultipleTabs ? mainAnimClass : ''}" style="${!hasMultipleTabs ? 'width: calc(100% - 8px);' : ''}"></div>
					${showGroupsTab ? `<button class="tab-btn ${state.view === 'GROUPS' ? 'active' : ''}" data-view="GROUPS">${t.tabGroups}</button>` : ''}
					${showLeagueTab ? `<button class="tab-btn ${state.view === 'LEAGUE' ? 'active' : ''}" data-view="LEAGUE">${t.tabLeague}</button>` : ''}
					${showKoTab ? `<button class="tab-btn ${state.view === 'KO' ? 'active' : ''}" data-view="KO">${t.tabKo}</button>` : ''}
				</div>
				<button id="reset-t" class="btn-reset-glass">${t.resetBtn}</button>
			` : ''}
		</div></div>`;

        let bodyHtml = `<div class="bracket-wrapper ${state.view === 'KO' ? 'is-ko' : 'is-groups'}">`;
        if (state.step === 'SETUP') {
            bodyHtml += window.adSetup.render(state);
        }
        else if (state.view === 'LEAGUE') bodyHtml += window.adLeague.render(state, container.offsetWidth, window.adTourney.getCurrentlyAdvancing);
        else if (state.view === 'GROUPS') bodyHtml += window.adGroups.render(state, container.offsetWidth, window.adTourney.getCurrentlyAdvancing);
        else bodyHtml += window.adBracket.render(state.rounds, state.matches, state.reachable);
        
        bodyHtml += `</div>`;

        if (state.showSettings) {
            bodyHtml += `<div class="settings-overlay"><div class="settings-modal">
                <div class="modal-header"><h3>${t.settingsTitle}</h3><button class="close-modal">✕</button></div>
                ${renderSettingsHTML(state.settings)}
                <button class="save-btn-glass" id="close-settings">${t.saveBtn}</button>
            </div></div>`;
        }

        container.innerHTML = `<div class="adt-inner">${headerHtml}${bodyHtml}</div>`;
        attachEvents();
    };

    function attachEvents() {
        const ad = window.adTourney;
        const { 
            state, save, renderUI, 
            updateTable, advanceWinner, checkFinalVictory, checkLeagueVictory, 
            createKOBracket, getCurrentlyAdvancing 
        } = ad;
        const actions = ad.actions; 
        
        const root = document.getElementById(PAGE_ID); 
        if (!root || !actions) return; 
        
        const b = (id) => document.getElementById(id);
        
        if (b('reset-t')) b('reset-t').onclick = actions.resetTournament;
        if (b('gear-toggle')) b('gear-toggle').onclick = actions.toggleSettingsPopup;
        if (root.querySelector('.close-modal')) root.querySelector('.close-modal').onclick = actions.toggleSettingsPopup;
        if (b('close-settings')) b('close-settings').onclick = actions.toggleSettingsPopup;

        // Schließen mit Esc-Taste
        document.onkeydown = (e) => {
            if (e.key === 'Escape' && state.showSettings) {
                actions.toggleSettingsPopup();
            }
        };

        root.querySelectorAll('.setting-btn').forEach(btn => btn.onclick = () => {
            actions.updateGlobalSetting(btn.dataset.key, btn.dataset.val);
        });
        if (b('target-legs-select')) b('target-legs-select').onchange = (e) => actions.updateGlobalSetting('targetLegs', e.target.value);

        if (state.step === 'SETUP') {
            window.adSetup.attachEvents(root, state, { onLaunch: actions.startTournament, onUpdate: () => { save(); renderUI(); }, onSave: save, showModal: (cfg) => window.adModals.show(cfg) });
        }

        if (b('start-ko-final')) b('start-ko-final').onclick = () => {
            const qualifiers = getCurrentlyAdvancing(); 
            createKOBracket(qualifiers.sort(() => Math.random() - 0.5));
            state.step = 'ACTIVE'; state.view = 'KO'; save(); renderUI();
        };

        root.querySelectorAll('.tab-btn').forEach(btn => btn.onclick = () => { if(ad.state.view !== btn.dataset.view) { ad.state.view = btn.dataset.view; ad.save(); ad.renderUI(); } });
        
        root.querySelectorAll('.schedule-tab-btn').forEach(btn => btn.onclick = () => {
            state.scheduleTab = btn.dataset.tab;
            state.manualScheduleToggle = true; 
            save();
            renderUI();
        });
        
        root.querySelectorAll('.surrender-btn').forEach(btn => btn.onclick = (e) => { 
            const mIdx = parseInt(btn.dataset.m);
            const type = btn.closest('.match-box').querySelector('.play-match').dataset.type;
            const m = type === 'league' ? state.leagueMatches[mIdx] : (type === 'group' ? state.groupMatches[mIdx] : state.matches[mIdx]);
            window.adModals.show({ title: t.surrenderTitle, text: `${btn.dataset.p === "1" ? m.p1 : m.p2} ${t.surrenderText}`, confirmText: t.confirm, onConfirm: () => {
                m.winner = (btn.dataset.p === "1") ? m.p2 : m.p1; m.finished = true;
                m.results = { p1L: '0', p1A: '-', p2L: '0', p2A: '-' };
                if (type === 'group' || type === 'league') updateTable(m, state.groups);
                else { advanceWinner(mIdx); checkFinalVictory(mIdx); }
                if (type === 'league') checkLeagueVictory();
                state.activePlayer1Name = null; save(); renderUI();
            }});
        });

        root.querySelectorAll('.reset-match').forEach(btn => btn.onclick = () => {
            const idx = btn.dataset.idx; const type = btn.dataset.type;
            const m = type === 'league' ? state.leagueMatches[idx] : (type === 'ko' ? state.matches[idx] : state.groupMatches[idx]);
            window.adModals.show({
                title: t.resetMatchTitle,
                text: `${t.resetMatchBetween} ${m.p1} ${t.resetMatchAnd} ${m.p2} ${t.resetMatchText}`, 
                confirmText: t.yesReset,
                onConfirm: () => {
                    if (m.boardId) {
                        state.busyBoards = state.busyBoards.filter(id => id !== m.boardId);
                        m.boardId = null;
                    }
                    m.uuid = null;
					m.finished = false;
                    m.results = null;
                    m.winner = null;
                    save();
                    renderUI();
                }
            });
        });

        root.querySelectorAll('.global-surrender-btn').forEach(btn => btn.onclick = (e) => actions.surrenderGlobally(btn.dataset.name));
        
        root.querySelectorAll('.play-match').forEach(btn => btn.onclick = () => {
            const idx = btn.dataset.idx;
            const type = btn.dataset.type;
            const m = type === 'league' ? state.leagueMatches[idx] : (type === 'ko' ? state.matches[idx] : state.groupMatches[idx]);
            if (m.uuid) window.location.href = `https://play.autodarts.io/matches/${m.uuid}`;
            else window.adTourney.startMatchDirectly(m.p1, m.p2, m);
        });
    }
})();