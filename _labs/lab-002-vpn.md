---
title: "Lab 002 · VPN WireGuard — Jaren Bailon"
description: "Túnel WireGuard punto a punto entre tu PC y un VPS con IP pública. Ideal para saltarse CGNAT o acceder a servicios del servidor de forma segura."
order: 2
nav_title: "Lab 002 · VPN WireGuard"
crumb: "Lab 002"
badge: "LAB 002 · VPN"
heading: "<span class=\"accent\">VPN WireGuard</span> PC → VPS"
intro: "Túnel WireGuard punto a punto entre tu PC y un VPS con IP pública. Ideal para saltarse CGNAT o acceder a servicios del servidor de forma segura."
card_order: 2
card_flagship: false
card_type: "Lab 002"
card_is_lab: true
card_filters: "debian lab security networking vpn wireguard"
card_tags: ["debian", "wireguard", "vpn"]
card_title: "VPN PC → VPS with WireGuard"
card_desc: "A direct WireGuard tunnel from your PC to a public-IP VPS. No router involved."
card_title_es: "VPN PC → VPS con WireGuard"
card_desc_es: "Túnel WireGuard directo desde tu PC a un VPS con IP pública. Sin depender del router."
---

## <span class="step-num">01</span> Topología

<div class="topology-box">
    <div>[ <span class="t-label">PC Cliente</span> ] ─── WireGuard tunnel ──→ [ <span class="t-label">VPS Servidor</span> ]</div>
    <div class="topology-meta">
        10.10.10.2/32 (cliente) &nbsp;·&nbsp; 10.10.10.1/24 (servidor, IP pública: 203.0.113.10)
    </div>
</div>

- **VPS:** Debian 13, con IP pública estática. Actúa como servidor WireGuard.
- **PC:** Tu laptop o equipo local (Debian, Arch, etc.) tras un router o CGNAT.

## <span class="step-num">02</span> Preparar el VPS (Servidor)

```
# Instalar WireGuard
apt update && apt install -y wireguard

# Generar par de claves del servidor
cd /etc/wireguard
umask 077
wg genkey | tee server.key | wg pubkey > server.pub

# Ver la clave pública (la necesitarás en el cliente)
cat server.pub
```

### Archivo de configuración del servidor

Crea `/etc/wireguard/wg0.conf`:

```
[Interface]
Address    = 10.10.10.1/24
ListenPort = 51820
PrivateKey = <contenido de /etc/wireguard/server.key>
PostUp     = sysctl -w net.ipv4.ip_forward=1
PostDown   = sysctl -w net.ipv4.ip_forward=0

# El cliente se añade aquí después de generar sus claves
[Peer]
PublicKey  = <client.pub>
AllowedIPs = 10.10.10.2/32
```

```
# Iniciar y habilitar el servicio
systemctl enable --now wg-quick@wg0

# Verificar estado
wg show
```

> Asegúrate de abrir el puerto UDP 51820 en el firewall del VPS: `ufw allow 51820/udp`
{: .note .note-warning}

## <span class="step-num">03</span> Preparar el Cliente (PC)

```
# Debian/Ubuntu
sudo apt install -y wireguard

# Arch / CachyOS
sudo pacman -S wireguard-tools

# Generar claves del cliente
wg genkey | tee client.key | wg pubkey > client.pub
cat client.pub  # Añade esto al [Peer] del servidor
```

## <span class="step-num">04</span> Configurar el Cliente

Crea `/etc/wireguard/wg0.conf` en tu PC:

```
[Interface]
Address    = 10.10.10.2/32
PrivateKey = <contenido de client.key>

[Peer]
PublicKey           = <contenido de server.pub>
Endpoint            = 203.0.113.10:51820
AllowedIPs          = 10.10.10.0/24
PersistentKeepalive = 25
```

> `AllowedIPs = 10.10.10.0/24` solo enruta el tráfico de la red VPN a través del túnel. Usa `0.0.0.0/0` si quieres enrutar todo el tráfico por el VPS.
{: .note .note-info}

## <span class="step-num">05</span> Conectar y Verificar

```
# Levantar el túnel
sudo wg-quick up wg0

# Probar conectividad con el servidor
ping 10.10.10.1

# Ver estado del túnel
sudo wg show

# Para desconectar
sudo wg-quick down wg0
```

> Si el ping a `10.10.10.1` responde, el túnel está activo. Puedes acceder al VPS por `ssh usuario@10.10.10.1` sin exponer el puerto SSH a internet.
{: .note .note-success}
