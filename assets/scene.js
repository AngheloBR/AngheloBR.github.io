/* scene.js — "The perimeter"
   One rack server. It starts on stock config: attackers log in as root, a miner
   appears in cron. Press "Harden this server" and the wireframe shell is built
   edge by edge while the config lines are applied; from then on packets bounce.
   Every event writes a line in the HUD so the picture and the log are one thing.
   States: stock → hardening → hardened (switch in the corner goes both ways).
   Requires THREE (r128 UMD). Without WebGL the HUD still tells the story. */
(function () {
    const box = document.getElementById('scene');
    if (!box) return;
    const hudLines = document.getElementById('hudLines');
    const counter = document.getElementById('hudCount');
    const hardenBtn = document.getElementById('hardenBtn');
    const switchBtns = Array.from(box.querySelectorAll('.scene-switch button'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- state ----------
    let state = 'stock';           // 'stock' | 'hardening' | 'hardened'
    let buildT = 0;                // 0..1 shell construction progress
    let userTouched = false;
    const AUTO_HARDEN_AFTER = 8;   // seconds of stock before we harden on our own
    let stockClock = 0;
    let hardenT = -1, stepsDone = 0;
    let rootLogins = 0, denied = 0, allowed = 0;

    function setState(next) {
        state = next;
        box.setAttribute('data-state', next);
        switchBtns.forEach(b => b.classList.toggle('on', b.dataset.set === (next === 'stock' ? 'stock' : 'hardened')));
        updateCount();
    }
    function updateCount() {
        if (!counter) return;
        counter.textContent = state === 'stock'
            ? rootLogins + ' root logins · 0 blocked'
            : denied + ' deny · ' + allowed + ' allow';
    }

    // ---------- log ----------
    const pad = n => String(n).padStart(2, '0');
    const now = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = arr => arr[(Math.random() * arr.length) | 0];
    // TEST-NET / documentation-style prefixes so no real host is named.
    const badPrefix = ['185.220.', '45.155.', '193.32.', '141.98.', '198.51.', '203.0.', '5.188.', '89.248.'];
    const ip = () => pick(badPrefix) + ((Math.random() * 254) | 1) + '.' + ((Math.random() * 254) | 1);
    const denyPorts = [':22', ':22', ':22', ':23', ':3389', ':445', ':8080', ':2222', ':5900'];
    const users = ['root', 'admin', 'ubuntu', 'test', 'oracle', 'pi', 'git'];

    function push(svc, verb, cls, src, rowCls) {
        if (!hudLines) return;
        const el = document.createElement('div');
        el.className = 'hud-line' + (rowCls ? ' ' + rowCls : '');
        el.innerHTML = '<span class="t">' + now() + '</span><span class="svc">' + svc + '</span>' +
            '<span class="verb ' + cls + '">' + verb + '</span><span class="src">' + src + '</span>';
        hudLines.appendChild(el);
        while (hudLines.children.length > 6) hudLines.removeChild(hudLines.firstChild);
    }
    // what a stock box logs when a packet gets in
    function logStockHit() {
        const r = Math.random();
        if (r < .42) { push('sshd', 'FAIL', 'warn', pick(users) + '@' + ip() + ' · password'); }
        else if (r < .78) { rootLogins++; push('sshd', 'ACCEPT', 'deny', 'root@' + ip() + ' · password'); }
        else if (r < .9) { push('cron', 'NEW', 'deny', '/tmp/.x/xmrig · @reboot'); }
        else { push(Math.random() < .5 ? 'ufw' : 'f2b', '—', 'warn', Math.random() < .5 ? 'inactive' : 'not installed'); }
        updateCount();
    }
    function logDeny() {
        denied++;
        if (Math.random() < .3) push('f2b', 'BAN', 'deny', ip() + ' · ' + pick(users) + ' × 5 fails');
        else push('ufw', 'DENY', 'deny', ip() + ' → ' + pick(denyPorts));
        updateCount();
    }
    function logAllow() { allowed++; push('sshd', 'ACCEPT', 'allow', 'deploy@203.0.113.7 · key ed25519'); updateCount(); }

    // the diff, applied line by line while the shell is built
    const HARDEN_STEPS = [
        ['sshd', 'PermitRootLogin no'],
        ['sshd', 'PasswordAuthentication no'],
        ['sshd', 'AllowUsers deploy · key ed25519'],
        ['ufw', 'enable · default deny incoming'],
        ['f2b', 'start · sshd jail · 5 → 1h ban'],
        ['apt', 'unattended-upgrades · security, daily']
    ];
    const HARDEN_TIME = 2.8;

    // seed
    push('sshd', 'FAIL', 'warn', 'admin@' + ip() + ' · password');
    push('sshd', 'FAIL', 'warn', 'root@' + ip() + ' · password');
    push('ufw', '—', 'warn', 'inactive');
    rootLogins = 1; push('sshd', 'ACCEPT', 'deny', 'root@' + ip() + ' · password');
    setState('stock');

    // ---------- 3D ----------
    let renderer;
    try {
        if (!window.THREE) throw new Error('three missing');
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) {
        // No WebGL: the HUD alone tells the story, on a timer.
        wireControls();
        if (!reduced) {
            let t = 0;
            setInterval(() => {
                if (state === 'stock') { logStockHit(); t += 1.2; if (t > AUTO_HARDEN_AFTER && !userTouched) hardenNoGL(); }
                else if (state === 'hardened') Math.random() < .15 ? logAllow() : logDeny();
            }, 1200);
        } else { setState('hardened'); }
        function hardenNoGL() {
            setState('hardening');
            HARDEN_STEPS.forEach((s, i) => setTimeout(() => push(s[0], 'APPLY', 'cfg', s[1], 'cfg'), i * 380));
            setTimeout(() => setState('hardened'), HARDEN_STEPS.length * 380 + 200);
        }
        window.__harden = hardenNoGL;
        return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    box.insertBefore(renderer.domElement, box.firstChild);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
    camera.position.set(0, 1.6, 11);
    camera.lookAt(0, .45, 0);

    const rig = new THREE.Group();      // follows the mouse; sits high so the HUD doesn't cover it
    rig.position.y = .8;
    scene.add(rig);

    const css = () => getComputedStyle(document.documentElement);
    const col = name => new THREE.Color(css().getPropertyValue(name).trim());
    const mats = {};

    // ---- lights ----
    const key = new THREE.DirectionalLight(0xffffff, .9); key.position.set(3, 5, 4); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, .25); fill.position.set(-4, -2, -3); scene.add(fill);
    const amb = new THREE.AmbientLight(0xffffff, .45); scene.add(amb);

    // ---- server: three 1U units ----
    const server = new THREE.Group();
    mats.body = new THREE.MeshStandardMaterial({ color: 0x1a1e26, metalness: .55, roughness: .45, emissive: 0x000000 });
    mats.edge = new THREE.LineBasicMaterial({ color: 0x343a45, transparent: true, opacity: .9 });
    const unitGeo = new THREE.BoxGeometry(2.3, .3, 1.5);
    const unitEdges = new THREE.EdgesGeometry(unitGeo);
    const leds = [];
    for (let i = 0; i < 3; i++) {
        const y = (i - 1) * .4;
        const m = new THREE.Mesh(unitGeo, mats.body); m.position.y = y; server.add(m);
        const e = new THREE.LineSegments(unitEdges, mats.edge); e.position.y = y; server.add(e);
        for (let j = 0; j < 2; j++) {
            const led = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 8), new THREE.MeshBasicMaterial({ color: 0x34d399 }));
            led.position.set(-.95 + j * .12, y, .76);
            led.userData.phase = Math.random() * 6.28;
            led.userData.status = j === 0;          // status LED vs activity LED
            server.add(led); leds.push(led);
        }
        for (let k = 0; k < 6; k++) {
            const slit = new THREE.Mesh(new THREE.PlaneGeometry(.16, .12), new THREE.MeshBasicMaterial({ color: 0x0b0d10 }));
            slit.position.set(-.55 + k * .24, y, .755);
            server.add(slit);
        }
    }
    server.rotation.y = -.35;
    rig.add(server);
    let bodyHit = 0;   // red flash when an attacker gets in

    // ---- shell: the perimeter, built edge by edge ----
    const SHELL_R = 2.55;
    mats.shell = new THREE.LineBasicMaterial({ color: 0xf5a524, transparent: true, opacity: .32 });
    const shellGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(SHELL_R, 2));
    const SHELL_VERTS = shellGeo.attributes.position.count;
    const shell = new THREE.LineSegments(shellGeo, mats.shell);
    rig.add(shell);
    mats.haze = new THREE.MeshBasicMaterial({ color: 0xf5a524, transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false });
    const haze = new THREE.Mesh(new THREE.SphereGeometry(SHELL_R - .02, 32, 32), mats.haze);
    rig.add(haze);
    let shellPulse = 0;
    function setBuild(t) {
        buildT = Math.max(0, Math.min(1, t));
        shellGeo.setDrawRange(0, Math.floor(SHELL_VERTS * buildT / 2) * 2);
        shell.visible = buildT > 0;
        haze.visible = buildT > .3;
    }
    setBuild(0);

    // ---- packets ----
    const N = 34;
    const packets = [];
    mats.deny = new THREE.MeshBasicMaterial({ color: 0xf0525a });
    mats.allow = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const pGeo = new THREE.SphereGeometry(.05, 8, 8);
    const trailPos = new Float32Array(N * 2 * 3);
    const trailCol = new Float32Array(N * 2 * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    trailGeo.setAttribute('color', new THREE.BufferAttribute(trailCol, 3));
    rig.add(new THREE.LineSegments(trailGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .55 })));

    function resetPacket(p, initial) {
        p.dir = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize();
        p.allow = Math.random() < .14;
        p.r = initial ? rnd(SHELL_R + .2, 7.5) : rnd(6.4, 7.6);
        p.speed = rnd(1.6, 2.6);
        p.wait = initial ? 0 : rnd(0, 2.2);   // stagger spawns so arrivals feel like traffic, not a wave
        p.crossed = false;
        p.mesh.material = p.allow ? mats.allow : mats.deny;
        p.mesh.visible = false;
    }
    for (let i = 0; i < N; i++) {
        const mesh = new THREE.Mesh(pGeo, mats.deny);
        rig.add(mesh);
        const p = { mesh, dir: null, r: 0, speed: 1, allow: false, wait: 0, crossed: false };
        resetPacket(p, true);
        packets.push(p);
    }

    // ---- ripples ----
    const ripples = [];
    for (let i = 0; i < 14; i++) {
        const m = new THREE.Mesh(new THREE.RingGeometry(.09, .12, 40),
            new THREE.MeshBasicMaterial({ color: 0xf0525a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
        m.visible = false; rig.add(m);
        ripples.push({ mesh: m, life: 0 });
    }
    function ripple(pos, color, size) {
        const r = ripples.find(x => !x.mesh.visible) || ripples[0];
        r.mesh.position.copy(pos);
        r.mesh.lookAt(pos.clone().multiplyScalar(2));
        r.mesh.scale.setScalar(1);
        r.mesh.material.color.copy(color);
        r.mesh.material.opacity = .9;
        r.mesh.visible = true;
        r.life = 0; r.size = size || 5;
    }

    // ---- theme ----
    let dark = true;
    function applyTheme() {
        const amber = col('--amber'), deny = col('--deny'), allow = col('--allow');
        dark = document.documentElement.getAttribute('data-theme') !== 'light';
        mats.shell.color.copy(amber);
        mats.haze.color.copy(amber);
        mats.deny.color.copy(deny); mats.allow.color.copy(allow);
        mats.body.color.set(dark ? 0x1a1e26 : 0x3a4150);
        mats.edge.color.set(dark ? 0x3d4450 : 0x6b7383);
        amb.intensity = dark ? .45 : .8;
    }
    applyTheme();
    window.addEventListener('themechange', applyTheme);

    // ---- pointer parallax ----
    let tx = 0, ty = 0;
    if (!reduced && matchMedia('(pointer: fine)').matches) {
        box.addEventListener('pointermove', e => {
            const r = box.getBoundingClientRect();
            tx = ((e.clientX - r.left) / r.width - .5) * .9;
            ty = ((e.clientY - r.top) / r.height - .5) * .5;
        });
        box.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
    }

    // ---- sizing ----
    function resize() {
        const w = box.clientWidth, h = box.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    resize();
    new ResizeObserver(resize).observe(box);

    // ---- transitions ----
    function harden() {
        if (state !== 'stock') return;
        setState('hardening');
        hardenT = 0; stepsDone = 0;
    }
    function unharden() {
        if (state === 'stock') return;
        setState('stock');
        hardenT = -1;
        stockClock = 0;
        rootLogins = 0; updateCount();
        push('sshd', 'RESET', 'warn', 'stock config restored');
    }
    function finishHarden() {
        setBuild(1);
        setState('hardened');
        denied = 0; allowed = 0; updateCount();
        push('ufw', 'ACTIVE', 'allow', 'default deny incoming · 22, 80, 443');
        // attackers already inside the new perimeter just vanish
        packets.forEach(p => { if (!p.allow && p.r < SHELL_R) resetPacket(p, false); });
    }
    function wireControls() {
        if (hardenBtn) hardenBtn.addEventListener('click', () => { userTouched = true; (window.__harden || harden)(); });
        switchBtns.forEach(b => b.addEventListener('click', () => {
            userTouched = true;
            if (b.dataset.set === 'hardened') (window.__harden || harden)(); else unharden();
        }));
    }
    wireControls();

    // ---- loop ----
    let visible = true, running = false;
    const tmp = new THREE.Vector3();
    const clock = new THREE.Clock();
    const RED = new THREE.Color(0xf0525a);

    function frame() {
        if (!visible || document.hidden) { running = false; return; }
        requestAnimationFrame(frame);
        const dt = Math.min(clock.getDelta(), .05);
        const t = clock.elapsedTime;
        const stock = state === 'stock';

        // auto-harden if the visitor just watches
        if (stock && !userTouched) { stockClock += dt; if (stockClock > AUTO_HARDEN_AFTER) harden(); }

        // hardening sequence: shell grows, config lines land
        if (state === 'hardening') {
            hardenT += dt;
            const k = Math.min(1, hardenT / HARDEN_TIME);
            setBuild(k * k * (3 - 2 * k));     // smoothstep
            const due = Math.floor(k * HARDEN_STEPS.length);
            while (stepsDone < due && stepsDone < HARDEN_STEPS.length) {
                const s = HARDEN_STEPS[stepsDone++];
                push(s[0], 'APPLY', 'cfg', s[1], 'cfg');
            }
            if (k >= 1) finishHarden();
        } else if (stock && buildT > 0) {
            setBuild(buildT - dt * 1.6);       // tearing the shell down is quick
        }

        rig.rotation.y += (tx - rig.rotation.y) * .06;
        rig.rotation.x += (ty - rig.rotation.x) * .06;
        shell.rotation.y += dt * .07;
        shell.rotation.x += dt * .025;
        server.rotation.y = -.35 + Math.sin(t * .25) * .12;
        server.position.y = Math.sin(t * .8) * .04;

        // LEDs: status green when hardened, red when stock; activity blinks like disk I/O — frantic while a miner runs
        leds.forEach(l => {
            if (l.userData.status) { l.material.color.set(stock ? 0xf0525a : 0x34d399); l.visible = !stock || Math.sin(t * 6 + l.userData.phase) > -.6; }
            else { l.material.color.set(stock ? 0xf0525a : 0xf5a524); l.visible = Math.sin(t * (stock ? 26 : 9) + l.userData.phase) > -.2; }
        });

        // chassis flashes red when someone gets in
        bodyHit = Math.max(0, bodyHit - dt * 2.2);
        mats.body.emissive.setRGB(.5 * bodyHit, .08 * bodyHit, .1 * bodyHit);

        shellPulse = Math.max(0, shellPulse - dt * 1.8);
        mats.shell.opacity = (dark ? .32 : .45) + shellPulse * .45;
        mats.haze.opacity = (dark ? .035 : .05) * buildT;

        // packets
        const guarded = state === 'hardened';
        packets.forEach((p, i) => {
            if (p.wait > 0) { p.wait -= dt; p.mesh.visible = false; setTrail(i, null); return; }
            p.r -= p.speed * dt;
            p.mesh.visible = true;
            tmp.copy(p.dir).multiplyScalar(p.r);
            p.mesh.position.copy(tmp);
            setTrail(i, p);
            if (guarded && !p.allow && p.r <= SHELL_R) {
                ripple(tmp, mats.deny.color, 5); shellPulse = Math.min(1, shellPulse + .5);
                logDeny(); resetPacket(p, false);
            } else if (guarded && p.allow && p.r <= SHELL_R && !p.crossed) {
                p.crossed = true; ripple(tmp, mats.allow.color, 5);
            } else if (p.r <= 1.05) {
                if (p.allow) { if (guarded) logAllow(); }
                else if (!guarded) { logStockHit(); bodyHit = 1; ripple(tmp, RED, 2.5); }
                resetPacket(p, false);
            }
        });
        trailGeo.attributes.position.needsUpdate = true;
        trailGeo.attributes.color.needsUpdate = true;

        ripples.forEach(r => {
            if (!r.mesh.visible) return;
            r.life += dt;
            const k = r.life / .7;
            r.mesh.scale.setScalar(1 + k * r.size);
            r.mesh.material.opacity = Math.max(0, .9 * (1 - k));
            if (k >= 1) r.mesh.visible = false;
        });

        renderer.render(scene, camera);
    }

    function setTrail(i, p) {
        const o = i * 6;
        if (!p) { for (let k = 0; k < 6; k++) trailPos[o + k] = 0; return; }
        const len = Math.min(.55, p.speed * .22);
        const c = p.allow ? mats.allow.color : mats.deny.color;
        trailPos[o] = p.mesh.position.x; trailPos[o + 1] = p.mesh.position.y; trailPos[o + 2] = p.mesh.position.z;
        trailPos[o + 3] = p.mesh.position.x + p.dir.x * len;
        trailPos[o + 4] = p.mesh.position.y + p.dir.y * len;
        trailPos[o + 5] = p.mesh.position.z + p.dir.z * len;
        trailCol[o] = c.r; trailCol[o + 1] = c.g; trailCol[o + 2] = c.b;
        trailCol[o + 3] = c.r * .2; trailCol[o + 4] = c.g * .2; trailCol[o + 5] = c.b * .2;
    }

    function start() { if (!running) { running = true; clock.getDelta(); frame(); } }

    if (reduced) {
        // Still picture, already hardened. The switch still works, just without the build animation.
        function still() {
            packets.forEach((p, i) => { p.mesh.visible = i < 12; tmp.copy(p.dir).multiplyScalar(p.r); p.mesh.position.copy(tmp); setTrail(i, i < 12 ? p : null); });
            trailGeo.attributes.position.needsUpdate = true; trailGeo.attributes.color.needsUpdate = true;
            leds.forEach(l => { l.material.color.set(state === 'stock' ? 0xf0525a : (l.userData.status ? 0x34d399 : 0xf5a524)); l.visible = true; });
            renderer.render(scene, camera);
        }
        window.__harden = function () { if (state === 'stock') { HARDEN_STEPS.forEach(s => push(s[0], 'APPLY', 'cfg', s[1], 'cfg')); setBuild(1); setState('hardened'); still(); } };
        switchBtns.forEach(b => { if (b.dataset.set === 'stock') b.addEventListener('click', () => { setBuild(0); still(); }); });
        setBuild(1); setState('hardened'); still();
        window.addEventListener('themechange', still);
        new ResizeObserver(still).observe(box);
        return;
    }

    new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) start();
    }, { threshold: .05 }).observe(box);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) start(); });
    start();
})();
