document.addEventListener('DOMContentLoaded', () => {

    /* THEME TOGGLE */
    const themeBtn = document.getElementById('themeToggleBtn');
    const themeText = document.getElementById('themeModeText');

    if (themeBtn && themeText) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            if (currentTheme === 'light') {
                document.body.removeAttribute('data-theme');
                themeText.textContent = 'Dark';
            } else {
                document.body.setAttribute('data-theme', 'light');
                themeText.textContent = 'Light';
            }
        });
    }

    /* LIQUID GLASS FILTER */
    const nav = document.querySelector('header');
    const mapEl = document.getElementById('glass-map');
    const redEl = document.getElementById('glass-red');
    const greenEl = document.getElementById('glass-green');
    const blueEl = document.getElementById('glass-blue');
    const filterReady = nav && mapEl && redEl && greenEl && blueEl;

    let unit = 58;
    let warp = 1;

    const updateWarp = () => {
        if (!filterReady) return;
        const base = -1.3 * unit;
        redEl.setAttribute('scale', base * warp);
        greenEl.setAttribute('scale', (base + 0.07 * unit) * warp);
        blueEl.setAttribute('scale', (base + 0.14 * unit) * warp);
    };

    const buildMap = () => {
        if (!filterReady) return;

        const rect = nav.getBoundingClientRect();
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        if (!w || !h) return;

        unit = Math.min(w, h);

        const radius = Math.min(parseFloat(getComputedStyle(nav).borderTopLeftRadius) || 0, h / 2);
        const edge = unit * 0.035;
        const soften = unit * 0.08;

        const svg = `
            <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="r" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stop-color="#0000"/>
                        <stop offset="100%" stop-color="red"/>
                    </linearGradient>
                    <linearGradient id="b" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#0000"/>
                        <stop offset="100%" stop-color="blue"/>
                    </linearGradient>
                </defs>
                <rect width="${w}" height="${h}" fill="black"/>
                <rect width="${w}" height="${h}" rx="${radius}" fill="url(#r)"/>
                <rect width="${w}" height="${h}" rx="${radius}" fill="url(#b)" style="mix-blend-mode:difference"/>
                <rect x="${edge}" y="${edge}" width="${w - edge * 2}" height="${h - edge * 2}" rx="${radius}"
                      fill="hsl(0 0% 50% / 0.93)" style="filter:blur(${soften}px)"/>
            </svg>`;

        const uri = 'data:image/svg+xml,' + encodeURIComponent(svg);
        mapEl.setAttribute('href', uri);
        mapEl.setAttributeNS('http://www.w3.org/1999/xlink', 'href', uri);

        updateWarp();
    };

    if (filterReady) {
        buildMap();
        if ('ResizeObserver' in window) new ResizeObserver(buildMap).observe(nav);
        else window.addEventListener('resize', buildMap);
    }

    /* TRANSPARENCY DROPDOWN + PRESETS */
    const PRESETS = {
        transparent: { frost: 0.05, blur: '0px',  saturation: 1.2, warp: 1    },
        balanced:    { frost: 0.20, blur: '4px',  saturation: 1.3, warp: 0.6  },
        frosted:     { frost: 0.40, blur: '14px', saturation: 1.4, warp: 0.25 }
    };

    const KEY = 'nav-glass-preset';
    const menuBtn = document.getElementById('glassMenuBtn');
    const dropdown = document.getElementById('glassDropdown');
    const presetBtns = document.querySelectorAll('.glass-preset');
    const root = document.documentElement;

    const setMenu = (open) => {
        if (!menuBtn || !dropdown) return;
        dropdown.classList.toggle('open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
    };

    if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setMenu(!dropdown.classList.contains('open'));
        });
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) setMenu(false);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setMenu(false);
        });
    }

    if (presetBtns.length) {
        const applyPreset = (name) => {
            const p = PRESETS[name];
            if (!p) return;

            root.style.setProperty('--glass-frost', p.frost);
            root.style.setProperty('--header-blur', p.blur);
            root.style.setProperty('--glass-saturation', p.saturation);

            warp = p.warp;
            updateWarp();

            presetBtns.forEach((btn) => {
                btn.setAttribute('aria-pressed', String(btn.dataset.preset === name));
            });
        };

        presetBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                applyPreset(btn.dataset.preset);
                try { localStorage.setItem(KEY, btn.dataset.preset); } catch {}
                setMenu(false);
            });
        });

        let saved = null;
        try { saved = localStorage.getItem(KEY); } catch {}
        applyPreset(PRESETS[saved] ? saved : 'transparent');
    }

});