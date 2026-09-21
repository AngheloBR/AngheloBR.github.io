/* site.js — theme, mobile menu, footer year, copy buttons, scroll reveal.
   Theme is applied early by the inline script in <head>; this only wires the toggle. */
(function () {
    const root = document.documentElement;

    // ---- theme ----
    window.toggleTheme = function () {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
        window.dispatchEvent(new CustomEvent('themechange', { detail: next }));
    };

    // ---- mobile menu ----
    const menuBtn = document.querySelector('.menu-btn');
    const links = document.querySelector('.nav-links');
    if (menuBtn && links) {
        menuBtn.addEventListener('click', () => {
            const open = links.classList.toggle('open');
            menuBtn.setAttribute('aria-expanded', String(open));
        });
        links.addEventListener('click', e => {
            if (e.target.closest('a')) { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
        });
    }

    // ---- year ----
    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

    // ---- copy buttons on <pre> ----
    const copyLabel = root.lang === 'es' ? ['Copiar', 'Copiado'] : ['Copy', 'Copied'];
    document.querySelectorAll('pre').forEach(pre => {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.type = 'button';
        btn.textContent = copyLabel[0];
        btn.addEventListener('click', () => {
            const code = pre.querySelector('code');
            const text = (code ? code.innerText : pre.innerText).trim();
            navigator.clipboard.writeText(text).then(() => {
                btn.textContent = copyLabel[1];
                btn.classList.add('done');
                setTimeout(() => { btn.textContent = copyLabel[0]; btn.classList.remove('done'); }, 1800);
            });
        });
        pre.appendChild(btn);
    });

    // ---- reveal on scroll ----
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        reveals.forEach(el => io.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('in'));
    }
})();
