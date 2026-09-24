/* home.js — EN/ES copy, language toggle, lab filters, diff stagger. */
(function () {
    const root = document.documentElement;

    // English lives in the HTML. Only Spanish is stored here; keys mirror data-i18n attributes.
    const es = {
        'nav.changes': 'Qué cambia', 'nav.process': 'Proceso', 'nav.pricing': 'Precios', 'nav.labs': 'Labs', 'nav.about': 'Sobre mí',

        'hero.label': 'Disponible para freelance · Perú · GMT-5',
        'hero.h1': 'Tu VPS nuevo está abierto de par en par.',
        'hero.h2': 'Yo lo cierro, y te entrego cada cambio por escrito.',
        'hero.sub': 'Solo llaves SSH, root bloqueado, firewall activo, Fail2Ban vigilando, parches de seguridad automáticos. <strong>Cada cambio queda por escrito</strong>, para que puedas auditarlo, revertirlo o repetirlo dentro de dos años.',
        'hero.cta1': 'Contrátame en Fiverr', 'hero.cta2': 'Ver qué cambia', 'distro.other': '¿Otra distro? Pregunta primero',
        'hud.title': 'Lo que ve un servidor endurecido', 'hud.title.stock': 'Lo que ve un servidor de fábrica',
        'scene.stock.label': '· config de fábrica', 'scene.hardened.label': '· endurecido',
        'scene.sw.stock': 'fábrica', 'scene.sw.hardened': 'endurecido', 'scene.harden': 'Endurecer este servidor',

        'changes.title': 'Qué cambia realmente en tu servidor',
        'changes.lede': 'Sin caja negra. Esta es la diferencia entre un VPS recién creado y el que te devuelvo. Cada línea corresponde a una página del reporte.',
        'diff.head': 'de fábrica → endurecido',
        'why.1.t': 'Acceso', 'why.1.p': 'Las contraseñas reciben fuerza bruta todo el día, todos los días. Las llaves no. Root desaparece y lo reemplaza un usuario sudo con nombre, así cada acción tiene un responsable.',
        'why.2.t': 'Red', 'why.2.p': 'Denegar por defecto significa que cualquier servicio nuevo que instales queda cerrado hasta que decidas abrirlo. Fail2Ban banea a los que insisten.',
        'why.3.t': 'Mantenimiento', 'why.3.p': 'Los parches de seguridad se instalan solos. No tienes que entrar por SSH a las 2 a.m. porque salió un CVE.',
        'why.4.t': 'Registro', 'why.4.p': 'Cada cambio, por qué se hizo y cómo deshacerlo: un resumen escrito en Basic, un reporte PDF completo desde Standard. Si algún día cambias de proveedor, puedes repetirlo tú mismo.',

        'process.eyebrow': 'cómo va un trabajo', 'process.title': 'Tres pasos, sin sorpresas',
        'process.lede': 'Compartes el acceso una vez. Nada se aplica sin una segunda sesión abierta, así nadie queda afuera, incluido tú.',
        'step.1.t': 'Auditoría', 'step.1.p': 'Leo el servidor antes de tocarlo: usuarios, puertos abiertos, servicios corriendo, configuración SSH actual. Recibes una línea base corta de lo que está expuesto.',
        'step.2.t': 'Hardening', 'step.2.p': 'Aplico los cambios de arriba uno por uno, probando cada uno desde una segunda conexión. Puerto personalizado, Docker, TLS y la auditoría Lynis dependen del plan.',
        'step.2.m': 'el alcance depende del plan', 'step.3.m': 'con la entrega · 1–3 días', 'step.3.t': 'Reporte', 'step.3.p': 'Un PDF con cada comando, por qué se ejecutó y cómo revertirlo (Basic recibe un resumen en texto). Premium incluye 14 días de soporte por si algo se comporta raro después.',

        'pricing.eyebrow': 'precio fijo · un servidor', 'pricing.title': 'Precios',
        'pricing.lede': 'Se pide y se paga por Fiverr, así estás cubierto por su garantía. ¿Varios servidores? Escríbeme primero.',
        'tier.basic.alias': '· Cierre básico', 'tier.std.alias': '· Listo para desplegar', 'tier.prem.alias': '· Auditado',
        'tier.basic.eta': 'entrega en 1 día',
        'tier.std.eta': 'entrega en 2 días',
        'tier.prem.eta': 'en pruebas', 'tier.soon': 'Próximamente', 'tier.soon.cta': 'Aún no disponible',
        'tier.basic': 'Acabas de comprar un VPS y quieres cerrarlo hoy.',
        'tier.std': 'Vas a desplegar Docker, n8n o Coolify y quieres el servidor listo.',
        'tier.prem': 'Un negocio pequeño que necesita constancia de que se hizo bien.',
        'tier.flag': 'Recomendado', 'tier.cta': 'Pedir en Fiverr',
        'feat.user': 'Usuario sudo con llave SSH', 'feat.root': 'Login de root y por contraseña deshabilitados',
        'feat.fw': 'UFW deny por defecto (22, 80, 443 o tus puertos)', 'feat.f2b': 'Fail2Ban en SSH',
        'feat.updates': 'Actualizaciones de seguridad automáticas', 'feat.summary': 'Resumen en texto de cada cambio',
        'feat.docker': 'Docker + Compose integrado con el firewall', 'feat.report': 'Reporte PDF con notas de reversión',
        'feat.basic': 'Todo lo de Basic', 'feat.port': 'Puerto SSH personalizado (opcional)',
        'feat.sysctl': 'Hardening de sysctl: SYN cookies, anti-spoofing, sin redirects ICMP', 'feat.base': 'Zona horaria, NTP, swap',
        'feat.std': 'Todo lo de Standard', 'feat.audit': 'Auditoría Lynis antes y después, puntaje en el informe', 'feat.lynisfix': 'Correcciones seguras de los hallazgos de Lynis', 'feat.auditd': 'auditd: quién cambió usuarios, sudo, SSH, cron', 'feat.aide': 'Chequeo diario de integridad de archivos (AIDE)', 'feat.logwatch': 'Resumen diario de seguridad en el servidor',
        'feat.2fa': '2FA para SSH (TOTP), opcional',
        'feat.warranty': '14 días de soporte post-entrega',
        'extras.title': 'Extras', 'extra.server': 'Servidor adicional', 'extra.express': 'Entrega express en 24 h', 'extra.mo': '/mes', 'extra.maint': 'Mantenimiento mensual: updates, revisión de logs, re-auditoría',

        'access.eyebrow': 'acceso, entrada y salida', 'access.title': 'Nunca me das una contraseña',
        'access.1': '<strong>Entrada.</strong> Agregas mi llave pública a un usuario sudo. Nunca pido la contraseña de root.',
        'access.2': '<strong>Durante.</strong> Cada cambio se aplica con una segunda sesión abierta, así nadie queda afuera.',
        'access.3': '<strong>Salida.</strong> Al entregar borro mi llave, y el reporte lo deja por escrito. Lo que queda es tuyo.',
        'callout.t': 'Ojo: Docker se salta UFW.',
        'callout.p': 'Docker escribe sus propias reglas de iptables, así que un puerto publicado por un contenedor queda accesible desde internet aunque ufw diga "deny". Desde Standard se configura la cadena DOCKER-USER para que el firewall siga mandando.',

        'labs.eyebrow': 'cuaderno público', 'labs.title': 'Labs y notas',
        'labs.lede': 'Lo que hago en servidores de clientes, primero lo practico en mi homelab y lo documento aquí. En español, práctico, para copiar y pegar.',
        'filter.all': 'Todo', 'filter.lab': 'Labs', 'filter.sec': 'Seguridad', 'filter.net': 'Redes',
        'lab.go': 'Leer →',
        'labs.empty': 'Todavía no hay nada con ese filtro.',

        'about.title': 'Sobre mí',
        'about.p1': 'Soy <strong>Jaren Bailon</strong>, egresado de Redes y Ciberseguridad de SENATI, Perú. Tengo un homelab Linux, rompo cosas a propósito y las documento para que el siguiente no tenga que hacerlo.',
        'about.p2': 'Mi foco es la seguridad de servidores Linux: hardening de SSH, firewall, actualizaciones automáticas, prevención de intrusiones. No es trabajo vistoso. Es aburrido, confiable y documentado.',
        'about.p3': 'Este sitio es mi registro público. Si necesitas a alguien que asegure tu VPS sin venderte humo, estás en el lugar correcto.',
        'about.quote': 'La mejor configuración de seguridad es la que puedes explicar, revertir y volver a aplicar dentro de dos años.',
        'fact.k.loc': 'ubicación', 'fact.loc': 'Perú · GMT-5',
        'fact.k.edu': 'formación', 'fact.edu': 'SENATI, Redes y Ciberseguridad (2025)',
        'fact.k.certs': 'certs', 'fact.k.daily': 'uso diario',
        'fact.k.lang': 'idiomas', 'fact.lang': 'Español (nativo) · Inglés',
        'fact.k.status': 'estado', 'fact.status': 'Abierto a trabajo freelance',
        'cta.title': '¿Tienes un servidor que sigue con la config por defecto?',
        'cta.sub': 'Mándame la distro y qué va a correr. Te digo qué plan encaja antes de que pidas nada.',
        'cta.btn': 'Escríbeme en Fiverr',

        'footer.tag': 'Hardening de servidores Linux, documentado. Labs y notas desde un homelab en Perú.',
        'footer.site': 'Sitio', 'footer.elsewhere': 'En otros lados',
        'footer.built': 'Hecho a mano · sin framework · GitHub Pages'
    };

    // Lab card strings live in each lab's front matter (_labs/*.md), injected by index.html.
    Object.assign(es, window.__labsEs || {});

    // Capture the English copy from the DOM once, so toggling back is lossless.
    const en = {};
    document.querySelectorAll('[data-i18n],[data-i18n-html]').forEach(el => {
        const key = el.dataset.i18n || el.dataset.i18nHtml;
        en[key] = el.dataset.i18nHtml ? el.innerHTML : el.textContent;
    });

    function applyLang(lang) {
        const dict = lang === 'es' ? es : en;
        document.querySelectorAll('[data-i18n]').forEach(el => { const v = dict[el.dataset.i18n]; if (v != null) el.textContent = v; });
        document.querySelectorAll('[data-i18n-html]').forEach(el => { const v = dict[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v; });
        root.setAttribute('lang', lang);
        const btn = document.getElementById('langText');
        if (btn) btn.textContent = lang === 'es' ? 'EN' : 'ES';
        document.title = lang === 'es' ? 'Jaren Bailon — Hardening de servidores Linux' : 'Jaren Bailon — Linux server hardening';
    }
    window.toggleLang = function () {
        const next = root.getAttribute('lang') === 'es' ? 'en' : 'es';
        try { localStorage.setItem('lang', next); } catch (e) {}
        applyLang(next);
    };
    applyLang(root.getAttribute('lang') === 'es' ? 'es' : 'en');

    // ---- lab filters ----
    const chips = document.querySelectorAll('.chip');
    const grid = document.getElementById('labsGrid');
    const cards = grid ? Array.from(grid.querySelectorAll('.lab-card')) : [];
    chips.forEach(chip => chip.addEventListener('click', () => {
        chips.forEach(c => { c.classList.toggle('active', c === chip); c.setAttribute('aria-pressed', String(c === chip)); });
        const f = chip.dataset.filter;
        let shown = 0;
        cards.forEach(card => {
            const on = f === 'all' || card.dataset.tags.split(' ').includes(f);
            card.classList.toggle('hidden', !on);
            if (on) { shown++; card.classList.add('in'); }
        });
        grid.classList.toggle('empty', shown === 0);
        grid.classList.toggle('filtered', f !== 'all');
    }));

    // ---- diff line stagger index ----
    document.querySelectorAll('#diff .diff-line').forEach((l, i) => l.style.setProperty('--i', i));
})();
