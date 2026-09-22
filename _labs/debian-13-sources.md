---
title: "Debian 13 sources.list — Jaren Bailon"
description: "Configuración recomendada de /etc/apt/sources.list para Debian 13 Trixie. Incluye repositorios principales, seguridad, actualizaciones y backports."
order: 5
nav_title: "Debian 13 sources.list"
crumb: "Debian 13 sources.list"
badge: "Config · APT"
heading: "<span class=\"accent\">Debian 13</span> sources.list"
intro: "Configuración recomendada de <code>/etc/apt/sources.list</code> para Debian 13 Trixie. Incluye repositorios principales, seguridad, actualizaciones y backports."
card_order: 5
card_flagship: false
card_type: "Config"
card_is_lab: false
card_filters: "debian repos apt config"
card_tags: ["debian", "apt"]
card_title: "Debian 13 sources.list"
card_desc: "Recommended /etc/apt/sources.list for Trixie: main, contrib, non-free, firmware and backports."
card_title_es: "sources.list para Debian 13"
card_desc_es: "/etc/apt/sources.list recomendado para Trixie: main, contrib, non-free, firmware y backports."
---

## <span class="step-num">Configuración</span> /etc/apt/sources.list

Copia y pega esta configuración en `/etc/apt/sources.list`. Cubre todas las fuentes necesarias para un servidor Debian 13 bien mantenido:

```
# =============================================
# Debian 13 (Trixie) - sources.list
# =============================================

# Repositorios principales
deb https://deb.debian.org/debian trixie main contrib non-free non-free-firmware
deb-src https://deb.debian.org/debian trixie main contrib non-free non-free-firmware

# Seguridad (actualizaciones urgentes)
deb https://security.debian.org/debian-security trixie-security main contrib non-free non-free-firmware
deb-src https://security.debian.org/debian-security trixie-security main contrib non-free non-free-firmware

# Actualizaciones menores estables
deb https://deb.debian.org/debian trixie-updates main contrib non-free non-free-firmware
deb-src https://deb.debian.org/debian trixie-updates main contrib non-free non-free-firmware

# Backports (versiones más nuevas de paquetes)
deb https://deb.debian.org/debian trixie-backports main contrib non-free non-free-firmware
deb-src https://deb.debian.org/debian trixie-backports main contrib non-free non-free-firmware
```

## <span class="step-num">Aplicar</span> Actualizar repositorios

```
# Refrescar índices
sudo apt update

# Aplicar actualizaciones disponibles
sudo apt full-upgrade -y

# Instalar paquete de backports (ejemplo)
sudo apt install -t trixie-backports <paquete>
```

> El repositorio **backports** permite instalar versiones más recientes de software sin actualizar todo el sistema. Usa `-t trixie-backports` solo cuando necesites un paquete específico.
{: .note .note-info}

## <span class="step-num">Info</span> Qué incluye cada repo

- **main** — Software libre mantenido por Debian.
- **contrib** — Software libre que depende de paquetes non-free.
- **non-free** — Software propietario (drivers NVIDIA, firmware, etc.).
- **non-free-firmware** — Firmware binario para hardware (WiFi, tarjetas de red).
- **trixie-security** — Parches de seguridad urgentes. Siempre habilitado.
- **trixie-updates** — Correcciones no urgentes antes del próximo punto de release.
- **trixie-backports** — Versiones más recientes de paquetes portadas desde testing.
