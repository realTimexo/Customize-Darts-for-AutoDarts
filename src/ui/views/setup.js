(function() {
    // Sprachsteuerung über localStorage
    const currentLng = 'en';
    const translations = {
        'de': {
            ko: 'KO',
            groupsKo: 'GRUPPEN + KO',
            league: 'LIGA',
            baseScore: 'Base score',
            inMode: 'In mode',
            outMode: 'Out mode',
            maxRounds: 'Max Runden',
            bullMode: 'Bull mode',
            bullOff: 'Bull-off',
            gameModeLabel: 'Spielmodus: Legs (First to...)',
            firstTo: 'First to',
            leg: 'Leg',
            legs: 'Legs',
			returnMatch: 'Rückrunde',
            groupSize: 'GRUPPENGRÖSSE',
            qualifiers: 'QUALIFIKANTEN',
            namePlaceholder: 'NAME...',
            startBtn: 'Starten',
            resetTitle: 'Setup & Namen zurücksetzen',
            errorTitle: 'DOPPELTER NAME',
            errorText: 'Dieser Name ist bereits im Turnier!',
			usePlus: 'Plus Abo nutzen',
			plusHint: 'Hinweis: Spiele von Spieler 1 zählen in die Statistik.'
        },
        'en': {
            ko: 'KO',
            groupsKo: 'GROUPS + KO',
            league: 'LEAGUE',
            baseScore: 'Base score',
            inMode: 'In mode',
            outMode: 'Out mode',
            maxRounds: 'Max Rounds',
            bullMode: 'Bull mode',
            bullOff: 'Bull-off',
            gameModeLabel: 'Game mode: Legs (First to...)',
            firstTo: 'First to',
            leg: 'Leg',
            legs: 'Legs',
			returnMatch: 'Return Match',
            groupSize: 'GROUP SIZE',
            qualifiers: 'QUALIFIERS',
            namePlaceholder: 'NAME...',
            startBtn: 'Start',
            resetTitle: 'Reset setup & names',
            errorTitle: 'DUPLICATE NAME',
            errorText: 'This name is already in the tournament!',
			usePlus: 'Use Plus Subscription',
			plusHint: 'Note: Player 1 matches count towards statistics.'
        }
    };
    const t = translations['en'];

    const style = document.createElement('style');
    style.innerHTML = `
        /* ── Setup container ─────────────────────────── */
        .ad-setup-container {
            background: rgba(255,255,255,.03);
            border: 1px solid rgba(255,255,255,.08);
            border-radius: 16px;
            padding: 1.5rem;
            max-width: 860px;
            color: white;
            margin: 0 auto;
        }

        /* ── Mode toggle ─────────────────────────────── */
        .mode-toggle {
            display: flex;
            background: rgba(255,255,255,.04);
            padding: 3px;
            border-radius: 10px;
            margin-bottom: 1.25rem;
            position: relative;
            border: 1px solid rgba(255,255,255,.07);
        }
        .mode-btn {
            flex: 1; padding: 9px;
            background: transparent !important;
            color: rgba(255,255,255,.35);
            border: none !important;
            font-weight: 700; letter-spacing: .05em;
            text-transform: uppercase; cursor: pointer;
            z-index: 2; font-size: 10px; border-radius: 8px;
            font-family: inherit;
        }
        .mode-btn.active { color: white !important; }

        /* ── Layout grid ─────────────────────────────── */
        .setup-main-layout { display: grid; grid-template-columns: 440px 1fr; gap: 2rem; align-items: start; }
        .setup-config-box { display: flex; flex-direction: column; gap: 4px; }
        .setup-setting-group { margin-bottom: 6px; width: 100%; }
        .setup-setting-label {
            font-size: .62rem; font-weight: 700; color: rgba(255,255,255,.4);
            margin-bottom: .3rem; text-transform: uppercase; letter-spacing: .1em; display: block;
        }

        /* ── Capsule slider ──────────────────────────── */
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
        .setup-btn-opt {
            flex: 1; padding: 7px 2px;
            background: transparent !important; border: none !important;
            color: rgba(255,255,255,.35); cursor: pointer;
            font-size: 11px; font-weight: 600; z-index: 2;
            border-radius: 6px; font-family: inherit;
        }
        .setup-btn-opt.active { color: white !important; }

        /* ── Selects ─────────────────────────────────── */
        .setup-select-field {
            width: 100%; background: rgba(255,255,255,.04); color: white;
            padding: 9px 14px; border-radius: 8px;
            border: 1px solid rgba(255,255,255,.08);
            outline: none; font-size: 12px; font-weight: 600;
            cursor: pointer; font-family: inherit;
            appearance: none; -webkit-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat; background-position: right 14px center; background-size: 12px;
        }
        .setup-select-field:hover { background: rgba(255,255,255,.07); }
        .setup-select-field option { background: #0d1117; color: white; }

        /* ── Player input ────────────────────────────── */
        .setup-input {
            flex: 1; background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.08);
            padding: 11px 16px; border-radius: 8px;
            color: white; text-transform: uppercase;
            font-weight: 700; outline: none;
            font-family: inherit; font-size: 13px;
        }
        #p-add {
            background: rgba(49,130,206,.75); color: white;
            width: 44px; height: 44px; border-radius: 8px;
            font-size: 22px; border: 1px solid rgba(255,255,255,.1);
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; transition: .15s;
        }
        #p-add:hover { background: rgba(66,153,225,.9); }

        /* ── Player list ─────────────────────────────── */
        .player-list-table { width: 100%; border-collapse: collapse; }
        .player-list-row { background: rgba(255,255,255,.03); border-radius: 8px; }
        .player-list-row + .player-list-row td { border-top: 1px solid rgba(255,255,255,.05); }
        .player-list-name { padding: 10px 16px; color: white; font-weight: 700; font-size: 13px; text-transform: uppercase; }
        .remove-p-btn { color: rgba(255,255,255,.2); font-size: 14px; background: transparent; border: none; cursor: pointer; padding-right: 16px; transition: .15s; }
        .remove-p-btn:hover { color: #FC8181; }

        /* ── Footer ──────────────────────────────────── */
        .setup-footer-row { display: flex; gap: 10px; margin-top: 1.5rem; height: 46px; }
        #launch-btn {
            flex: 1; background: rgba(47,133,90,.55); color: white;
            border-radius: 10px; font-weight: 700; text-transform: uppercase;
            letter-spacing: .08em; border: 1px solid rgba(255,255,255,.12);
            cursor: pointer; font-size: 12px; font-family: inherit; transition: .15s;
        }
        #launch-btn:hover { background: rgba(56,161,105,.75); }
        #full-reset-btn {
            background: rgba(229,62,62,.08); color: #FEB2B2;
            border: 1px solid rgba(229,62,62,.18);
            border-radius: 10px; cursor: pointer;
            width: 46px; display: flex; align-items: center; justify-content: center;
            font-size: 18px; transition: .15s;
        }
        #full-reset-btn:hover { background: rgba(229,62,62,.18); color: white; }
    `;
    document.head.appendChild(style);

    window.adSetup = {
        render: function(state) {
            const sizeOptions = [3, 4, 5, 6, 8, 10, 12, 24, 32];
            const advanceOptions = [2, 4, 8, 16, 32];
            const s = state.settings;

            const matchSettingsGroups = [
                { label: t.baseScore, key: 'baseScore', opts: [121, 170, 301, 501, 701, 901] },
                { label: t.inMode, key: 'inMode', opts: ['Straight', 'Double', 'Master'] },
                { label: t.outMode, key: 'outMode', opts: ['Straight', 'Double', 'Master'] },
                { label: t.maxRounds, key: 'maxRounds', opts: [15, 20, 50, 80] },
                { label: t.bullMode, key: 'bullMode', opts: ['25/50', '50/50'] },
                { label: t.bullOff, key: 'bullOffMode', opts: ['Off', 'Normal', 'Official'] },
				...(state.mode !== 'KO' ? [{ label: t.returnMatch, key: 'returnMatch', opts: ['Off', 'On'] }] : []),
				{ label: t.usePlus, key: 'usePlus', opts: ['Off', 'On'] }
            ];

            const modes = ['KO', 'GROUPS', 'LEAGUE'];
            const activeModeIdx = modes.indexOf(state.mode);
            const modePillWidth = 100 / modes.length;
            
            if (typeof window._adLastModeIdx === 'undefined') window._adLastModeIdx = activeModeIdx;
            const prevModeIdx = window._adLastModeIdx;
            window._adLastModeIdx = activeModeIdx;

            if (!window._adLastSettings) window._adLastSettings = {};

            return `
            <div class="ad-setup-container">
                <div class="mode-toggle">
					<div class="slider-pill" style="
                        width: calc(${modePillWidth}% - 8px); 
                        --pill-from: calc(${prevModeIdx * modePillWidth}% + 4px); 
                        --pill-to: calc(${activeModeIdx * modePillWidth}% + 4px);">
                    </div>
					<button class="mode-btn ${state.mode === 'KO' ? 'active' : ''}" data-mode="KO">${t.ko}</button>
					<button class="mode-btn ${state.mode === 'GROUPS' ? 'active' : ''}" data-mode="GROUPS">${t.groupsKo}</button>
					<button class="mode-btn ${state.mode === 'LEAGUE' ? 'active' : ''}" data-mode="LEAGUE">${t.league}</button>
				</div>

                <div class="setup-main-layout">
                    <div class="setup-config-box">
                        ${matchSettingsGroups.map(g => {
                            const activeIdx = g.opts.findIndex(opt => opt == s[g.key]);
                            const pillWidth = 100 / g.opts.length;
                            const prevIdx = typeof window._adLastSettings[g.key] !== 'undefined' ? window._adLastSettings[g.key] : activeIdx;
                            window._adLastSettings[g.key] = activeIdx;

                            return `
                            <div class="setup-setting-group">
                                <label class="setup-setting-label">${g.label}</label>
                                <div class="liquid-slider-container">
                                    <div class="slider-pill" style="
                                        width: calc(${pillWidth}% - 6px); 
                                        --pill-from: calc(${prevIdx * pillWidth}% + 3px); 
                                        --pill-to: calc(${activeIdx * pillWidth}% + 3px);">
                                    </div>
                                    ${g.opts.map(opt => `
                                        <button class="setup-btn-opt ${s[g.key] == opt ? 'active' : ''}" 
                                                data-key="${g.key}" data-val="${opt}">${opt}</button>
                                    `).join('')}
                                </div>
                            </div>`;
                        }).join('')}
                        
                        <div class="setup-setting-group">
                            <label class="setup-setting-label">${t.gameModeLabel}</label>
                            <select class="setup-select-field" id="target-legs-select-setup">
                                ${[1,2,3,4,5,6,7,8,9,10,11,12].map(n => `<option value="${n}" ${s.targetLegs == n ? 'selected' : ''}>${t.firstTo} ${n} ${n > 1 ? t.legs : t.leg}</option>`).join('')}
                            </select>
                        </div>

                        ${state.mode === 'GROUPS' ? `
                        <div class="setup-config-item" style="display:flex; gap:10px;">
                            <div style="flex:1;">
                                <label class="setup-setting-label">${t.groupSize}</label>
                                <select id="group-size-select" class="setup-select-field">
                                    ${sizeOptions.map(v => `<option value="${v}" ${state.groupSettings.size == v ? 'selected' : ''}>${v}</option>`).join('')}
                                </select>
                            </div>
                            <div style="flex:1;">
                                <label class="setup-setting-label">${t.qualifiers}</label>
                                <select id="group-advance-select" class="setup-select-field">
                                    ${advanceOptions.map(v => `<option value="${v}" ${state.groupSettings.totalAdvance == v ? 'selected' : ''}>${v}</option>`).join('')}
                                </select>
                            </div>
                        </div>` : ''}
                    </div>

                    <div class="player-setup-section">
                        <div class="input-row" style="display:flex; gap:10px; margin-bottom:20px;">
                            <input id="p-in" class="setup-input" placeholder="${t.namePlaceholder}">
                            <button id="p-add">+</button>
                        </div>
                        <div style="max-height: 420px; overflow-y: auto; padding-right: 5px;">
                            <table class="player-list-table"><tbody>
                                ${state.players.map((p, i) => `
                                    <tr class="player-list-row">
                                        <td class="player-list-name">${p}</td>
                                        <td style="text-align:right;"><button class="remove-p remove-p-btn" data-idx="${i}">✕</button></td>
                                    </tr>`).join('')}
                            </tbody></table>
                        </div>
                    </div>
                </div>

                <div class="setup-footer-row">
                    <button id="launch-btn">${t.startBtn}</button>
                    <button id="full-reset-btn" title="${t.resetTitle}">↺</button>
                </div>
            </div>`;
        },

        attachEvents: function(root, state, callbacks) {
            const b = (id) => document.getElementById(id);
            const inp = b('p-in');

            if (b('launch-btn')) b('launch-btn').onclick = callbacks.onLaunch;

            const addP = () => {
                if (document.querySelector('.ad-modal-overlay')) return;
                if (inp && inp.value.trim()) {
                    const v = inp.value.trim().toUpperCase();
                    if (state.players.includes(v)) {
                        callbacks.showModal({ title: t.errorTitle, text: t.errorText, confirmText: 'OK' });
                    } else {
                        state.players.push(v);
                        inp.value = "";
                        callbacks.onUpdate();
                        setTimeout(() => document.getElementById('p-in')?.focus(), 10);
                    }
                }
            };

            if (b('p-add')) b('p-add').onclick = addP;
            if (inp) inp.onkeydown = (e) => { if (e.key === 'Enter') addP(); };

            root.querySelectorAll('.mode-btn').forEach(btn => btn.onclick = () => {
                state.mode = btn.dataset.mode;
                callbacks.onUpdate();
            });

            root.querySelectorAll('.remove-p').forEach(btn => btn.onclick = () => {
                state.players.splice(btn.dataset.idx, 1);
                callbacks.onUpdate();
            });

            root.querySelectorAll('.setup-btn-opt').forEach(btn => btn.onclick = () => {
                state.settings[btn.dataset.key] = btn.dataset.val;
                callbacks.onUpdate();
            });
            if (b('target-legs-select-setup')) b('target-legs-select-setup').onchange = (e) => {
                state.settings.targetLegs = e.target.value;
                callbacks.onUpdate();
            };
            
            if (b('group-size-select')) b('group-size-select').onchange = (e) => { 
                state.groupSettings.size = parseInt(e.target.value); 
                callbacks.onSave(); 
            };
            if (b('group-advance-select')) b('group-advance-select').onchange = (e) => { 
                state.groupSettings.totalAdvance = parseInt(e.target.value); 
                callbacks.onSave(); 
            };

            if (b('full-reset-btn')) b('full-reset-btn').onclick = () => {
                if (window.adTourney.actions.fullReset) window.adTourney.actions.fullReset();
            };
        }
    };
})();