(function() {
    // Sprachsteuerung über localStorage
    const currentLng = 'en';
    const translations = {
        'de': { cancel: 'Abbrechen' },
        'en': { cancel: 'Cancel' }
    };
    const t = translations['en'];

    const style = document.createElement('style');
    style.innerHTML = `
        .ad-modal-overlay { 
            position: fixed; inset: 0; 
            background: rgba(0, 0, 0, 0.4); 
            backdrop-filter: blur(12px) saturate(160%); 
            -webkit-backdrop-filter: blur(12px) saturate(160%);
            display: flex; align-items: center; justify-content: center; 
            z-index: 10001; 
        }
        .ad-modal-content { 
            background: rgba(30, 41, 59, 0.7); 
            border: 1px solid rgba(255, 255, 255, 0.12); 
            padding: 35px; 
            border-radius: 24px; 
            width: 420px; 
            text-align: center; 
            color: white; 
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }
        .board-select-btn { 
            width: 100%; 
            background: rgba(255, 255, 255, 0.05); 
            border: 1px solid rgba(255, 255, 255, 0.08); 
            color: white; 
            padding: 14px 18px; 
            margin-top: 10px; 
            border-radius: 14px; 
            cursor: pointer; 
            text-align: left; 
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
            font-weight: 600; 
            display: flex; justify-content: space-between; align-items: center; 
        }
        .board-select-btn:not(:disabled):hover { 
            background: rgba(49, 130, 206, 0.4); 
            border-color: rgba(99, 179, 237, 0.5); 
            transform: scale(1.02);
        }
        .board-offline { 
            opacity: 0.4; 
            filter: grayscale(0.8); 
            cursor: not-allowed !important; 
        }
        .board-status-tag { 
            font-size: 10px; 
            padding: 3px 8px; 
            border-radius: 6px; 
            text-transform: uppercase; 
            letter-spacing: 0.5px;
            font-weight: 800;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid currentColor;
        }
        .tag-online { color: #68D391; text-shadow: 0 0 8px rgba(104, 211, 145, 0.4); }
        .tag-offline { color: #A0AEC0; }
        .tag-busy { color: #F6AD55; text-shadow: 0 0 8px rgba(246, 173, 85, 0.4); }
		.btn-cancel-glass {
            margin-top: 25px;
            width: 100%;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #A0AEC0;
            padding: 12px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            transition: 0.2s;
        }
        .btn-cancel-glass:hover {
            background: rgba(255, 255, 255, 0.15);
            color: white;
        }
    `;
    document.head.appendChild(style);

    window.adModals = {
        show: function({ title, text, confirmText, onConfirm, isSuccess = false }) {
            if (document.querySelector('.ad-modal-overlay')) return;
            const overlay = document.createElement('div');
            overlay.className = 'ad-modal-overlay';
            overlay.innerHTML = `
                <div class="ad-modal-content">
                    <div style="font-size:24px; font-weight:800; color:white; margin-bottom:12px; text-transform:uppercase;">${title}</div>
                    <div style="color:#A0AEC0; margin-bottom:30px;">${text}</div>
                    <div style="display:flex; justify-content:center; gap:10px;">
                        <button class="ad-btn-styled" style="background:#4A5568; padding:10px 20px; border:none; color:white; border-radius:8px; cursor:pointer;">${t.cancel}</button>
                        <button class="ad-btn-styled" style="background:${isSuccess ? '#38A169' : '#E53E3E'}; padding:10px 20px; border:none; color:white; border-radius:8px; cursor:pointer;">${confirmText}</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
            const btns = overlay.querySelectorAll('button');
            btns[0].onclick = () => document.body.removeChild(overlay);
            btns[1].onclick = () => { if (onConfirm) onConfirm(); document.body.removeChild(overlay); };
        },
		
		selectBoard: function(boards, busyBoards, onSelect) {
            const overlay = document.createElement('div');
            overlay.className = 'ad-modal-overlay';
			// Boards sortieren: Online nach oben
            const sortedBoards = [...boards].sort((a, b) => {
                const aOn = a.state?.connection === 'Connected' || a.state?.connected === true;
                const bOn = b.state?.connection === 'Connected' || b.state?.connected === true;
                return bOn - aOn;
            });
            const renderBoardBtn = (b) => {
            const isOnline = b.state?.connection === 'Connected' || b.state?.connected === true;
            const isBusy = busyBoards.includes(b.id);
            
            let statusText = isOnline ? 'Online' : 'Offline';
            let tagClass = isOnline ? 'tag-online' : 'tag-offline';
            
            if (isBusy) {
                statusText = 'Im Turnier';
                tagClass = 'tag-busy';
            }
            
            return `
				<button class="board-select-btn ${isOnline && !isBusy ? '' : 'board-offline'}" 
					data-id="${b.id}"
					${(!isOnline || isBusy) ? 'disabled style="cursor: not-allowed; pointer-events: none;"' : ''}>
					<span>🎯 ${b.name}</span>
					<span class="board-status-tag ${tagClass}">${statusText}</span>
				</button>`;
        };

            overlay.innerHTML = `
                <div class="ad-modal-content">
                    <div style="font-size:20px; font-weight:800; color:white; margin-bottom:15px; text-transform:uppercase;">BOARD WÄHLEN</div>
                    <div style="max-height: 400px; overflow-y: auto; padding-right: 5px;">
                        ${sortedBoards.map(b => renderBoardBtn(b)).join('')}
                    </div>
                    <button id="cancel-board-sel" class="ad-btn-styled" style="width:100%; background:#4A5568; color:white; padding:12px; border-radius:8px; border:none; cursor:pointer; margin-top:20px;">${t.cancel}</button>
                </div>`;
            
            document.body.appendChild(overlay);
            
            overlay.querySelectorAll('.board-select-btn').forEach(btn => {
                btn.onclick = () => {
                    onSelect(btn.dataset.id);
                    document.body.removeChild(overlay);
                };
            });
            document.getElementById('cancel-board-sel').onclick = () => document.body.removeChild(overlay);
        }
    };
})();