/* lab.js — builds a sticky side index from the article's h2 headings (wide screens only). */
(function () {
    const heads = Array.from(document.querySelectorAll('.content section > h2'));
    if (heads.length < 3) return;
    const nav = document.createElement('nav');
    nav.className = 'side-toc';
    nav.setAttribute('aria-label', document.documentElement.lang === 'es' ? 'Contenido' : 'Contents');
    nav.innerHTML = '<div class="side-toc-title">' + (document.documentElement.lang === 'es' ? 'En esta página' : 'On this page') + '</div>';
    const links = heads.map((h, i) => {
        const sec = h.parentElement;
        if (!sec.id) sec.id = 's-' + (i + 1);
        const a = document.createElement('a');
        a.href = '#' + sec.id;
        const c = h.cloneNode(true); c.querySelectorAll('.step-num').forEach(n => n.remove());
        a.textContent = c.textContent.trim();
        nav.appendChild(a);
        return a;
    });
    document.body.appendChild(nav);
    document.body.classList.add('has-toc');
    nav.classList.add('ready');

    const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            const i = heads.findIndex(h => h.parentElement === en.target);
            links.forEach((a, k) => a.classList.toggle('active', k === i));
        });
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
    heads.forEach(h => io.observe(h.parentElement));
})();
