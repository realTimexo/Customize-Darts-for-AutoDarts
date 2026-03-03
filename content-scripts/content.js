// ================================================================
//  Autodarts Dart Skin Customizer – content.js
// ================================================================

const DEFAULT_COLORS = {
  flight:  '#ffffff',
  shaft:   '#ffffff',
  barrel:  '#c0c0c0',
  point:   '#d9d9d9',
  enabled: true,
  blend:   false,
  customSvg: '',
  useCustomSvg: false,
};

const PRESET_COLORS = [
  { label: 'White',   hex: '#ffffff' },
  { label: 'Silver',  hex: '#c0c0c0' },
  { label: 'Black',   hex: '#1a1a1a' },
  { label: 'Red',     hex: '#e53e3e' },
  { label: 'Blue',    hex: '#3182ce' },
  { label: 'Green',   hex: '#38a169' },
  { label: 'Yellow',  hex: '#d69e2e' },
  { label: 'Purple',  hex: '#805ad5' },
  { label: 'Orange',  hex: '#dd6b20' },
  { label: 'Pink',    hex: '#d53f8c' },
  { label: 'Cyan',    hex: '#00b5d8' },
  { label: 'Gold',    hex: '#b7791f' },
];

const PARTS = [
  { key: 'flight', label: 'Flight' },
  { key: 'shaft',  label: 'Shaft'  },
  { key: 'barrel', label: 'Barrel' },
  { key: 'point',  label: 'Point'  },
];

const DONATE_URL = 'https://www.paypal.com/donate/?hosted_button_id=38GT8LH75W4GU';
const CUSTOMIZE_PATH = '/customize';

// ─── SVG builder ─────────────────────────────────────────────────
function buildSvg(colors) {
  // If custom SVG is active, use it directly
  if (colors.useCustomSvg && colors.customSvg && colors.customSvg.trim()) {
    return colors.customSvg.trim();
  }

  const blend = colors.blend;
  const stops = blend
    ? `
      <stop offset="0%"   stop-color="${colors.flight}"/>
      <stop offset="20%"  stop-color="${colors.flight}"/>
      <stop offset="35%"  stop-color="${colors.shaft}"/>
      <stop offset="55%"  stop-color="${colors.barrel}"/>
      <stop offset="80%"  stop-color="${colors.barrel}"/>
      <stop offset="100%" stop-color="${colors.point}"/>`
    : `
      <stop offset="0%"   stop-color="${colors.flight}"/>
      <stop offset="20%"  stop-color="${colors.flight}"/>
      <stop offset="20%"  stop-color="${colors.shaft}"/>
      <stop offset="35%"  stop-color="${colors.shaft}"/>
      <stop offset="35%"  stop-color="${colors.barrel}"/>
      <stop offset="80%"  stop-color="${colors.barrel}"/>
      <stop offset="80%"  stop-color="${colors.point}"/>
      <stop offset="100%" stop-color="${colors.point}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 477 102">
  <defs>
    <linearGradient id="dartGradient" x1="0" y1="0" x2="477" y2="0" gradientUnits="userSpaceOnUse">${stops}
    </linearGradient>
  </defs>
  <path fill="url(#dartGradient)" d="M26.56.5h53.65l.14.11,55.78,45,42.2-.07,42.49.07c.95-.56,6.88-4,10.06-4h152.73c2.11,0,4.43.36,6.9,1.07,1.96.56,4.03,1.35,6.13,2.34,3.16,1.48,5.42,2.94,5.98,3.31,2.04,0,23.83-.1,40.68-.1,10.34,0,16.83.03,19.29.1,5.75.16,13.13,1.98,13.95,2.19h.02s-.12.48-.12.48h0s.12.5.12.5h-.02c-.82.21-8.2,2.02-13.95,2.19-2.45.07-8.94.1-19.29.1-16.85,0-38.64-.09-40.68-.1-.56.37-2.82,1.83-5.98,3.31-3.32,1.55-8.27,3.41-13.03,3.41h-152.73c-3.19,0-9.11-3.44-10.06-4l-42.49.07-42.2-.07-55.78,45-.14.11H26.56l-.14-.27L1,51.23l-.12-.23.12-.23L26.43.77l.14-.27Z"/>
</svg>`;
}

// ─── Storage helpers ──────────────────────────────────────────────
function loadColors() {
  return new Promise(resolve => {
    chrome.storage.local.get('dartColors', d => {
      resolve(d.dartColors ? { ...DEFAULT_COLORS, ...d.dartColors } : { ...DEFAULT_COLORS });
    });
  });
}
function saveColors(colors) {
  return new Promise(resolve => chrome.storage.local.set({ dartColors: colors }, resolve));
}

// ─── Match injection ──────────────────────────────────────────────
async function injectDartSkin() {
  const colors = await loadColors();
  if (!colors.enabled) return;
  const tryInject = () => {
    const imgs = document.querySelectorAll('img');
    if (imgs.length >= 6) {
      const encoded = 'data:image/svg+xml;utf8,' + encodeURIComponent(buildSvg(colors));
      [3, 4, 5].forEach(i => { if (imgs[i]) imgs[i].src = encoded; });
      console.log('[DartSkin] Injected');
      return true;
    }
    return false;
  };
  if (!tryInject()) {
    const obs = new MutationObserver(() => { if (tryInject()) obs.disconnect(); });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => obs.disconnect(), 10000);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────
function waitForElement(selector, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) { resolve(el); return; }
    const start = Date.now();
    const iv = setInterval(() => {
      const found = document.querySelector(selector);
      if (found) { clearInterval(iv); resolve(found); return; }
      if (timeout && Date.now() - start >= timeout) { clearInterval(iv); reject(new Error(`Timeout: ${selector}`)); }
    }, 100);
  });
}

// ─── Color picker popup ───────────────────────────────────────────
let activePickerPart = null;
let liveColors = { ...DEFAULT_COLORS };

function openColorPicker(partKey, anchorEl) {
  document.getElementById('adt-color-picker')?.remove();
  if (activePickerPart === partKey) { activePickerPart = null; return; }
  activePickerPart = partKey;

  const currentHex = liveColors[partKey] || '#ffffff';
  const popup = document.createElement('div');
  popup.id = 'adt-color-picker';

  const presetsHTML = PRESET_COLORS.map(c => `
    <button data-hex="${c.hex}" title="${c.label}" style="
      width:32px;height:32px;border-radius:8px;background:${c.hex};
      border:2px solid ${currentHex===c.hex?'var(--chakra-colors-blue-400,#63b3ed)':'rgba(255,255,255,0.12)'};
      cursor:pointer;flex-shrink:0;transition:all .15s;outline:none;
    "></button>`).join('');

  popup.innerHTML = `
    <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.35);margin-bottom:.6rem;">Presets</div>
    <div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.85rem;">${presetsHTML}</div>
    <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.35);margin-bottom:.5rem;">Custom HEX</div>
    <div style="display:flex;align-items:center;gap:.5rem;">
      <input type="color" id="adt-native-picker" value="${currentHex}" style="width:36px;height:32px;border:none;border-radius:6px;background:none;cursor:pointer;padding:0;flex-shrink:0;"/>
      <input type="text" id="adt-hex-input" maxlength="7" value="${currentHex}" placeholder="#ffffff" style="flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);border-radius:6px;padding:.35rem .6rem;color:white;font-family:monospace;font-size:.85rem;outline:none;min-width:0;"/>
      <button id="adt-apply-color" style="background:var(--chakra-colors-blue-600,#2b6cb0);border:none;border-radius:6px;padding:.35rem .8rem;color:white;font-size:.78rem;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:inherit;">Apply</button>
    </div>`;

  popup.style.cssText = `position:fixed;background:var(--chakra-colors-gray-800,#1a202c);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:1rem;width:262px;box-shadow:0 12px 40px rgba(0,0,0,.7);z-index:99999;box-sizing:border-box;`;
  document.body.appendChild(popup);

  const rect = anchorEl.getBoundingClientRect();
  let top = rect.bottom + 8, left = rect.left;
  if (left + 262 > window.innerWidth) left = window.innerWidth - 270;
  if (top + 280 > window.innerHeight) top = rect.top - 288;
  popup.style.top = top + 'px'; popup.style.left = left + 'px';

  popup.querySelectorAll('[data-hex]').forEach(btn => {
    btn.addEventListener('click', () => { const h = btn.dataset.hex; document.getElementById('adt-hex-input').value = h; document.getElementById('adt-native-picker').value = h; applyColor(h); });
    btn.addEventListener('mouseover', () => btn.style.transform = 'scale(1.15)');
    btn.addEventListener('mouseout',  () => btn.style.transform = 'scale(1)');
  });
  document.getElementById('adt-native-picker').addEventListener('input', e => { document.getElementById('adt-hex-input').value = e.target.value; applyColor(e.target.value); });
  document.getElementById('adt-hex-input').addEventListener('input', e => {
    let v = e.target.value.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) { document.getElementById('adt-native-picker').value = v; applyColor(v); }
  });
  document.getElementById('adt-apply-color').addEventListener('click', () => { popup.remove(); activePickerPart = null; });

  setTimeout(() => document.addEventListener('click', outsideClose), 50);
  function outsideClose(e) {
    if (!popup.contains(e.target) && !anchorEl.contains(e.target)) { popup.remove(); activePickerPart = null; document.removeEventListener('click', outsideClose); }
  }
  function applyColor(hex) { liveColors[partKey] = hex; updatePreview(); updateSwatch(partKey, hex); }
}

function updateSwatch(partKey, hex) {
  const s = document.getElementById(`adt-swatch-${partKey}`); if (s) s.style.background = hex;
  const l = document.getElementById(`adt-hex-label-${partKey}`); if (l) l.textContent = hex;
}
function updatePreview() {
  const p = document.getElementById('adt-svg-preview'); if (p) p.innerHTML = buildSvg(liveColors);
}

// ─── Customize page ───────────────────────────────────────────────
function renderCustomizePage() {
  if (document.getElementById('adt-customize-page')) return;
  const mainContent = document.querySelector('#root > div > div:nth-of-type(2)');
  if (mainContent) Array.from(mainContent.children).forEach(c => { if (c.id !== 'adt-customize-page') c.style.display = 'none'; });

  const page = document.createElement('div');
  page.id = 'adt-customize-page';
  page.style.cssText = `display:flex;flex-direction:column;align-items:center;padding:2rem 1.5rem;color:var(--chakra-colors-whiteAlpha-900,white);font-family:var(--chakra-fonts-body,'Open Sans',sans-serif);min-height:80vh;overflow-y:auto;width:100%;box-sizing:border-box;`;

  page.innerHTML = `
    <div style="width:100%;max-width:640px;display:flex;flex-direction:column;gap:1.25rem;">

      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:.75rem;">
        <div>
          <h1 style="font-size:1.4rem;font-weight:700;margin:0 0 .2rem;color:var(--chakra-colors-white,#fff);">Dart Skin Customizer</h1>
          <p style="margin:0;font-size:.8rem;color:rgba(255,255,255,.4);">Customize the colors of your darts</p>
        </div>
        <div style="display:flex;align-items:center;gap:.6rem;flex-shrink:0;">
          <a href="${DONATE_URL}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:.4rem;background:rgba(255,99,71,.12);border:1px solid rgba(255,99,71,.3);border-radius:8px;padding:.4rem .85rem;color:#fc8181;font-size:.78rem;font-weight:600;text-decoration:none;transition:all .15s;font-family:inherit;" onmouseover="this.style.background='rgba(255,99,71,.22)'" onmouseout="this.style.background='rgba(255,99,71,.12)'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
            Donate
          </a>
          <!-- Skin toggle -->
          <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer;user-select:none;">
            <span id="adt-toggle-label" style="font-size:.82rem;color:${liveColors.enabled?'var(--chakra-colors-green-400,#68d391)':'rgba(255,255,255,.35)'};">${liveColors.enabled?'Enabled':'Disabled'}</span>
            <div style="position:relative;display:inline-block;width:44px;height:24px;">
              <input id="adt-toggle" type="checkbox" ${liveColors.enabled?'checked':''} style="opacity:0;width:0;height:0;position:absolute;">
              <span id="adt-toggle-track" style="position:absolute;inset:0;border-radius:12px;background:${liveColors.enabled?'var(--chakra-colors-green-500,#48bb78)':'rgba(255,255,255,.15)'};transition:background .2s;cursor:pointer;">
                <span id="adt-toggle-thumb" style="position:absolute;top:3px;left:${liveColors.enabled?'23px':'3px'};width:18px;height:18px;border-radius:50%;background:white;transition:left .2s;"></span>
              </span>
            </div>
          </label>
        </div>
      </div>

      <!-- SVG Preview -->
      <div style="background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:2.5rem 2rem;display:flex;align-items:center;justify-content:center;">
        <div id="adt-svg-preview" style="width:100%;">${buildSvg(liveColors)}</div>
      </div>

      <!-- Color section -->
      <div id="adt-color-section" style="${liveColors.useCustomSvg?'opacity:.4;pointer-events:none;':''}background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden;transition:opacity .2s;">
        <div style="padding:.7rem 1rem;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.3);">Colors</span>
          <!-- Blend toggle -->
          <label style="display:flex;align-items:center;gap:.45rem;cursor:pointer;user-select:none;">
            <span style="font-size:.72rem;color:rgba(255,255,255,.4);">Color blend</span>
            <div style="position:relative;display:inline-block;width:36px;height:20px;">
              <input id="adt-blend-toggle" type="checkbox" ${liveColors.blend?'checked':''} style="opacity:0;width:0;height:0;position:absolute;">
              <span id="adt-blend-track" style="position:absolute;inset:0;border-radius:10px;background:${liveColors.blend?'var(--chakra-colors-blue-500,#3182ce)':'rgba(255,255,255,.15)'};transition:background .2s;cursor:pointer;">
                <span id="adt-blend-thumb" style="position:absolute;top:2px;left:${liveColors.blend?'18px':'2px'};width:16px;height:16px;border-radius:50%;background:white;transition:left .2s;"></span>
              </span>
            </div>
          </label>
        </div>
        ${PARTS.map((p,i) => `
          <div style="${i>0?'border-top:1px solid rgba(255,255,255,.05);':''}display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;transition:background .12s;" onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background='transparent'">
            <div style="display:flex;align-items:center;gap:.75rem;">
              <div id="adt-swatch-${p.key}" style="width:32px;height:32px;border-radius:8px;background:${liveColors[p.key]};border:1px solid rgba(255,255,255,.18);flex-shrink:0;"></div>
              <div>
                <div style="font-weight:600;font-size:.88rem;">${p.label}</div>
                <div id="adt-hex-label-${p.key}" style="font-size:.7rem;color:rgba(255,255,255,.38);font-family:monospace;">${liveColors[p.key]}</div>
              </div>
            </div>
            <button id="adt-pick-${p.key}" style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.35rem .8rem;color:rgba(255,255,255,.75);font-size:.75rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:.35rem;font-family:inherit;transition:all .12s;" onmouseover="this.style.background='rgba(255,255,255,.12)'" onmouseout="this.style.background='rgba(255,255,255,.07)'">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style="opacity:.7"><path d="M17.66 5.41l1.07 1.07-12.5 12.5-1.07-1.07 12.5-12.5zM19.5 3L12 10.5 6.5 5 5 6.5l5.5 5.5L3 19.5V21h1.5l7.5-7.5 5.5 5.5L19 17.5 13.5 12 21 4.5 19.5 3z"/></svg>
              Pick color
            </button>
          </div>`).join('')}
      </div>

      <!-- Custom SVG section -->
      <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden;">
        <div style="padding:.7rem 1rem;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between;">
          <div>
            <span style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.3);">Custom SVG</span>
            <span style="margin-left:.5rem;font-size:.65rem;color:rgba(255,255,255,.2);">Overrides color settings</span>
          </div>
          <label style="display:flex;align-items:center;gap:.45rem;cursor:pointer;user-select:none;">
            <span style="font-size:.72rem;color:rgba(255,255,255,.4);">Use custom</span>
            <div style="position:relative;display:inline-block;width:36px;height:20px;">
              <input id="adt-custom-toggle" type="checkbox" ${liveColors.useCustomSvg?'checked':''} style="opacity:0;width:0;height:0;position:absolute;">
              <span id="adt-custom-track" style="position:absolute;inset:0;border-radius:10px;background:${liveColors.useCustomSvg?'var(--chakra-colors-blue-500,#3182ce)':'rgba(255,255,255,.15)'};transition:background .2s;cursor:pointer;">
                <span id="adt-custom-thumb" style="position:absolute;top:2px;left:${liveColors.useCustomSvg?'18px':'2px'};width:16px;height:16px;border-radius:50%;background:white;transition:left .2s;"></span>
              </span>
            </div>
          </label>
        </div>
        <div style="padding:1rem;">
          <textarea id="adt-custom-svg-input" placeholder='Paste your SVG code here... e.g. <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 477 102">...</svg>' style="
            width:100%;min-height:110px;resize:vertical;
            background:rgba(0,0,0,.3);
            border:1px solid rgba(255,255,255,.12);border-radius:8px;
            padding:.6rem .75rem;color:white;font-family:monospace;font-size:.75rem;
            outline:none;box-sizing:border-box;line-height:1.5;
            color:rgba(255,255,255,.8);
          ">${liveColors.customSvg || ''}</textarea>
          <div style="display:flex;gap:.5rem;margin-top:.6rem;">
            <button id="adt-preview-svg" style="flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:.4rem .8rem;color:rgba(255,255,255,.75);font-size:.75rem;font-weight:600;cursor:pointer;font-family:inherit;transition:all .12s;" onmouseover="this.style.background='rgba(255,255,255,.12)'" onmouseout="this.style.background='rgba(255,255,255,.07)'">Preview</button>
            <button id="adt-clear-svg" style="background:rgba(255,60,60,.08);border:1px solid rgba(255,60,60,.2);border-radius:8px;padding:.4rem .8rem;color:rgba(255,120,120,.8);font-size:.75rem;font-weight:600;cursor:pointer;font-family:inherit;transition:all .12s;" onmouseover="this.style.background='rgba(255,60,60,.15)'" onmouseout="this.style.background='rgba(255,60,60,.08)'">Clear</button>
          </div>
          <div id="adt-svg-error" style="display:none;margin-top:.5rem;font-size:.72rem;color:#fc8181;padding:.4rem .6rem;background:rgba(255,80,80,.08);border-radius:6px;border:1px solid rgba(255,80,80,.2);"></div>
        </div>
      </div>

      <!-- Save -->
      <button id="adt-save-btn" style="background:var(--chakra-colors-blue-600,#2b6cb0);border:none;border-radius:10px;padding:.85rem 2rem;color:white;font-weight:700;font-size:.92rem;font-family:inherit;cursor:pointer;width:100%;transition:background .15s;display:flex;align-items:center;justify-content:center;gap:.5rem;" onmouseover="this.style.background='var(--chakra-colors-blue-500,#3182ce)'" onmouseout="this.style.background='var(--chakra-colors-blue-600,#2b6cb0)'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16a3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3zm3-10H5V5h10v4z"/></svg>
        Save &amp; Apply
      </button>
      <div id="adt-save-msg" style="text-align:center;font-size:.8rem;color:var(--chakra-colors-green-400,#68d391);display:none;padding:.5rem;background:rgba(72,187,120,.08);border-radius:8px;border:1px solid rgba(72,187,120,.18);"></div>
    </div>`;

  if (mainContent) mainContent.appendChild(page);
  else document.body.appendChild(page);
  attachPageListeners();
}

function attachPageListeners() {
  // Color pick buttons
  PARTS.forEach(p => {
    document.getElementById(`adt-pick-${p.key}`)?.addEventListener('click', e => {
      e.stopPropagation();
      openColorPicker(p.key, e.currentTarget);
    });
  });

  // Skin enabled toggle
  document.getElementById('adt-toggle')?.addEventListener('change', e => {
    liveColors.enabled = e.target.checked;
    document.getElementById('adt-toggle-track').style.background = liveColors.enabled ? 'var(--chakra-colors-green-500,#48bb78)' : 'rgba(255,255,255,.15)';
    document.getElementById('adt-toggle-thumb').style.left = liveColors.enabled ? '23px' : '3px';
    const lbl = document.getElementById('adt-toggle-label');
    lbl.style.color = liveColors.enabled ? 'var(--chakra-colors-green-400,#68d391)' : 'rgba(255,255,255,.35)';
    lbl.textContent = liveColors.enabled ? 'Enabled' : 'Disabled';
  });

  // Blend toggle
  document.getElementById('adt-blend-toggle')?.addEventListener('change', e => {
    liveColors.blend = e.target.checked;
    document.getElementById('adt-blend-track').style.background = liveColors.blend ? 'var(--chakra-colors-blue-500,#3182ce)' : 'rgba(255,255,255,.15)';
    document.getElementById('adt-blend-thumb').style.left = liveColors.blend ? '18px' : '2px';
    updatePreview();
  });

  // Custom SVG toggle
  document.getElementById('adt-custom-toggle')?.addEventListener('change', e => {
    liveColors.useCustomSvg = e.target.checked;
    document.getElementById('adt-custom-track').style.background = liveColors.useCustomSvg ? 'var(--chakra-colors-blue-500,#3182ce)' : 'rgba(255,255,255,.15)';
    document.getElementById('adt-custom-thumb').style.left = liveColors.useCustomSvg ? '18px' : '2px';
    const colorSection = document.getElementById('adt-color-section');
    if (colorSection) {
      colorSection.style.opacity = liveColors.useCustomSvg ? '.4' : '1';
      colorSection.style.pointerEvents = liveColors.useCustomSvg ? 'none' : '';
    }
    // Update preview with or without custom SVG
    if (liveColors.useCustomSvg) {
      const raw = document.getElementById('adt-custom-svg-input')?.value?.trim();
      liveColors.customSvg = raw || '';
    }
    updatePreview();
  });

  // Preview custom SVG button
  document.getElementById('adt-preview-svg')?.addEventListener('click', () => {
    const raw = document.getElementById('adt-custom-svg-input')?.value?.trim();
    const errEl = document.getElementById('adt-svg-error');
    errEl.style.display = 'none';
    if (!raw) { errEl.textContent = 'Please paste SVG code first.'; errEl.style.display = 'block'; return; }
    if (!raw.includes('<svg') || !raw.includes('</svg>')) {
      errEl.textContent = 'Invalid SVG: must start with <svg> and end with </svg>.'; errEl.style.display = 'block'; return;
    }
    liveColors.customSvg = raw;
    const wasUsing = liveColors.useCustomSvg;
    liveColors.useCustomSvg = true;
    const preview = document.getElementById('adt-svg-preview');
    if (preview) preview.innerHTML = raw;
    if (!wasUsing) {
      // turn on toggle visually
      const tog = document.getElementById('adt-custom-toggle');
      if (tog) { tog.checked = true; tog.dispatchEvent(new Event('change')); }
    }
  });

  // Clear custom SVG
  document.getElementById('adt-clear-svg')?.addEventListener('click', () => {
    const ta = document.getElementById('adt-custom-svg-input');
    if (ta) ta.value = '';
    liveColors.customSvg = '';
    liveColors.useCustomSvg = false;
    const tog = document.getElementById('adt-custom-toggle');
    if (tog && tog.checked) { tog.checked = false; tog.dispatchEvent(new Event('change')); }
    document.getElementById('adt-svg-error').style.display = 'none';
    updatePreview();
  });

  // Save
  document.getElementById('adt-save-btn')?.addEventListener('click', async () => {
    // Sync textarea value before saving
    const raw = document.getElementById('adt-custom-svg-input')?.value?.trim();
    liveColors.customSvg = raw || '';
    await saveColors(liveColors);
    const msg = document.getElementById('adt-save-msg');
    msg.textContent = '✓ Saved! Will be applied on the next match page.';
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3500);
  });
}

function removeCustomizePage() {
  document.getElementById('adt-customize-page')?.remove();
  document.getElementById('adt-color-picker')?.remove();
  activePickerPart = null;
  const mainContent = document.querySelector('#root > div > div:nth-of-type(2)');
  if (mainContent) Array.from(mainContent.children).forEach(c => { c.style.display = ''; });
}

// ─── Sidebar button ───────────────────────────────────────────────
const CUSTOMIZE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`;
let sidebarInterval = null;

async function injectSidebarButton() {
  document.getElementById('adt-customize-menu-item')?.remove();
  try {
    const navStack = await waitForElement('#root > div > div > .chakra-stack', 15000);
    const lastItem = navStack.lastElementChild;
    if (!lastItem) return;
    const btn = lastItem.cloneNode(true);
    btn.removeAttribute('href');
    btn.id = 'adt-customize-menu-item';
    btn.style.cursor = 'pointer';
    btn.innerHTML = CUSTOMIZE_ICON;
    const isExpanded = lastItem.innerText.trim().length > 0;
    if (isExpanded) { const s = document.createElement('span'); s.textContent = 'Customize'; s.style.marginLeft = '.5rem'; btn.appendChild(s); }
    btn.addEventListener('click', async () => { liveColors = await loadColors(); window.history.pushState(null, '', CUSTOMIZE_PATH); renderCustomizePage(); });
    navStack.appendChild(btn);
    if (sidebarInterval) clearInterval(sidebarInterval);
    sidebarInterval = setInterval(() => {
      const w = document.querySelector('#root > div > div')?.getBoundingClientRect().width;
      const b = document.getElementById('adt-customize-menu-item');
      if (!b) return;
      if (w && w < 170) b.innerHTML = CUSTOMIZE_ICON;
      else if (w && w > 200) b.innerHTML = CUSTOMIZE_ICON + '<span style="margin-left:.5rem">Customize</span>';
    }, 1000);
  } catch (e) { console.error('[DartSkin] Sidebar inject failed', e); }
}

// ─── URL Watcher ──────────────────────────────────────────────────
let currentUrl = window.location.href;
function watchUrl(onChange) {
  const root = document.getElementById('root');
  if (!root) return;
  new MutationObserver(() => {
    if (window.location.href !== currentUrl) { const old = currentUrl; currentUrl = window.location.href; onChange(currentUrl, old); }
  }).observe(root, { childList: true, subtree: true });
}

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  try {
    liveColors = await loadColors();
    await waitForElement('#root > div:nth-of-type(1)', 15000);
    if (window.location.href.includes('/matches')) injectDartSkin();
    if (window.location.href.includes(CUSTOMIZE_PATH)) {
      await waitForElement('#root > div > div:nth-of-type(2)', 5000).catch(() => {});
      renderCustomizePage();
    }
    await injectSidebarButton();
    watchUrl(async newUrl => {
      if (newUrl.includes(CUSTOMIZE_PATH)) {
        liveColors = await loadColors();
        await waitForElement('#root > div > div:nth-of-type(2)', 5000).catch(() => {});
        renderCustomizePage();
      } else {
        removeCustomizePage();
      }
      if (newUrl.includes('/matches')) setTimeout(injectDartSkin, 800);
      injectSidebarButton();
    });
    const collapse = document.querySelector("button[aria-label='Collapse side bar']");
    if (collapse) collapse.addEventListener('click', () => injectSidebarButton());
  } catch (e) { console.error('[DartSkin] main() failed', e); }
}

main();
