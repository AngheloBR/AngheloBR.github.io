/* lab.js — builds a sticky side index from the article's h2 headings (wide screens only). */
(function () {
    const heads = Array.from(document.querySelectorAll('.content > h2'));
    if (heads.length < 3) return;
    const es = document.documentElement.lang === 'es';
    const nav = document.createElement('nav');
    nav.className = 'side-toc';
    nav.setAttribute('aria-label', es ? 'Contenido' : 'Contents');
    nav.innerHTML = '<div class="side-toc-title">' + (es ? 'En esta página' : 'On this page') + '</div>';
    const links = heads.map((h, i) => {
        if (!h.id) h.id = 's-' + (i + 1);
        const a = document.createElement('a');
        a.href = '#' + h.id;
        const c = h.cloneNode(true); c.querySelectorAll('.step-num').forEach(n => n.remove());
        a.textContent = c.textContent.trim();
        nav.appendChild(a);
        return a;
    });
    document.body.appendChild(nav);
    document.body.classList.add('has-toc');
    nav.classList.add('ready');

    // Active item = last heading that has scrolled past 30% of the viewport.
    let ticking = false;
    function update() {
        ticking = false;
        const line = window.innerHeight * .3;
        let active = 0;
        heads.forEach((h, i) => { if (h.getBoundingClientRect().top <= line) active = i; });
        links.forEach((a, i) => a.classList.toggle('active', i === active));
    }
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
})();
