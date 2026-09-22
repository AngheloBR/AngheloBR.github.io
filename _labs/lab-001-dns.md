---
title: "Lab 001 · Fix DNS Debian — Jaren Bailon"
description: "Cómo resolver el error Temporary failure in name resolution configurando /etc/resolv.conf con servidores DNS públicos seguros."
order: 1
nav_title: "Lab 001 · Fix DNS"
crumb: "Lab 001"
badge: "LAB 001 · Networking"
heading: "<span class=\"accent\">Fix DNS</span> en Debian"
intro: "Cómo resolver el error <code>Temporary failure in name resolution</code> configurando <code>/etc/resolv.conf</code> con servidores DNS públicos seguros."
card_order: 3
card_flagship: false
card_type: "Lab 001"
card_is_lab: true
card_filters: "debian lab dns networking"
card_tags: ["debian", "dns", "networking"]
card_title: "Fix DNS on Debian"
card_desc: "Resolving “Temporary failure in name resolution” with a sane /etc/resolv.conf, and the permanent fix with systemd-resolved."
card_title_es: "Arreglar DNS en Debian"
card_desc_es: "Resolver “Temporary failure in name resolution” con un /etc/resolv.conf sano, y la solución permanente con systemd-resolved."
---

## <span class="step-num">01</span> Síntoma

El comando `apt update` falla al intentar resolver el repositorio de Debian. El mensaje de error es similar a:

```
sudo apt update
# Err:1 http://deb.debian.org/debian trixie InRelease
#   Temporary failure resolving 'deb.debian.org'
# W: Some index files failed to download.
```

> Este problema es común en servidores VPS recién instalados o en contenedores Docker donde `/etc/resolv.conf` está vacío o mal configurado.
{: .note .note-info}

## <span class="step-num">02</span> Causa raíz

El archivo `/etc/resolv.conf` no existe, está vacío, o apunta a un resolver interno que no responde. Sin DNS, el sistema no puede traducir nombres de dominio a direcciones IP.

```
# Verificar el estado actual
cat /etc/resolv.conf

# Probar resolución manual
nslookup deb.debian.org
```

## <span class="step-num">03</span> Remediación

Crear un `/etc/resolv.conf` mínimo con servidores DNS públicos y confiables:

```
sudo sh -c 'cat > /etc/resolv.conf << "EOF"
nameserver 1.1.1.1
nameserver 8.8.8.8
options timeout:2 attempts:3
EOF'
```

> En sistemas con **systemd-resolved** activo, modificar `/etc/resolv.conf` directamente puede revertirse al reiniciar. Ver paso 5 para una solución permanente.
{: .note .note-warning}

## <span class="step-num">04</span> Verificación

```
# Probar conectividad DNS
ping -c 3 debian.org

# Actualizar repositorios
sudo apt update
```

> Si `apt update` completa sin errores, el DNS está funcionando correctamente.
{: .note .note-success}

## <span class="step-num">05</span> Solución permanente (systemd-resolved)

Si el sistema usa `systemd-resolved`, la forma correcta es enlazar el archivo:

```
# Verificar si systemd-resolved está activo
systemctl status systemd-resolved

# Enlazar el stub resolver de systemd
sudo ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf

# O configurar DNS en resolved.conf
sudo nano /etc/systemd/resolved.conf
# Agregar bajo [Resolve]:
# DNS=1.1.1.1 8.8.8.8
# FallbackDNS=9.9.9.9

sudo systemctl restart systemd-resolved
```
