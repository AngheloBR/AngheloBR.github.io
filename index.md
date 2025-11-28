# Anghelo BR • Labs & Repos

Bienvenido a mi hub personal de configuraciones, labs y notas técnicas.

---

## 🐧 Repositorios para Debian 13 (Trixie) – srv-debian

**`/etc/apt/sources.list` recomendado:**

```text
# Repos principales
deb https://deb.debian.org/debian trixie main contrib non-free non-free-firmware
deb-src https://deb.debian.org/debian trixie main contrib non-free non-free-firmware

# Seguridad
deb https://security.debian.org/debian-security trixie-security main contrib non-free non-free-firmware
deb-src https://security.debian.org/debian-security trixie-security main contrib non-free non-free-firmware

# Actualizaciones
deb https://deb.debian.org/debian trixie-updates main contrib non-free non-free-firmware
deb-src https://deb.debian.org/debian trixie-updates main contrib non-free non-free-firmware

# Backports
deb https://deb.debian.org/debian trixie-backports main contrib non-free non-free-firmware
deb-src https://deb.debian.org/debian trixie-backports main contrib non-free non-free-firmware
```

---

## 🧪 Lab 001 – Fix DNS en Debian 13

**Problema detectado:**

`apt update` → `Fallo temporal al resolver «deb.debian.org»`.

**Causa raíz:**

El archivo `/etc/resolv.conf` no existía → sin servidores DNS configurados.

**Remediación aplicada:**

```bash
sudo sh -c 'cat > /etc/resolv.conf << "EOF"
nameserver 1.1.1.1
nameserver 8.8.8.8
EOF'
```

Luego verificación:

```bash
ping -c 4 debian.org
sudo apt update
```

**Resultado:** DNS funcional y repos de Debian accesibles.

---

Más labs, configs y notas se irán agregando conforme avance en redes, Linux y ciberseguridad.
