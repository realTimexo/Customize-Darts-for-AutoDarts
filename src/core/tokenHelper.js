(function() {
    window.adTourney = window.adTourney || {};

    // Token kommt via postMessage von pageScript.js (läuft im Seiten-Kontext)
    window.addEventListener('message', (event) => {
        if (event.source === window && event.data?.type === 'AD_TOKEN_CAPTURED') {
            window._adToken = event.data.token;
        }
    });

    window.adTourney.getAuthToken = function() {
        return window._adToken || null;
    };

    // Wartet bis zu 8 Sekunden auf den Token (bis Autodarts seinen ersten API-Call macht)
    window.adTourney.getAuthTokenAsync = function() {
        return new Promise((resolve) => {
            if (window._adToken) return resolve(window._adToken);
            let tries = 0;
            const iv = setInterval(() => {
                tries++;
                if (window._adToken) { clearInterval(iv); resolve(window._adToken); }
                else if (tries >= 80) { clearInterval(iv); resolve(null); }
            }, 100);
        });
    };
})();
