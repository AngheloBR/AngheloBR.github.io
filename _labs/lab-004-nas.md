---
title: "Lab 004 · NAS casero — Jaren Bailon"
description: "Montar un NAS sencillo y funcional usando Debian y Samba para compartir archivos en tu red local, sin pagar por hardware especializado."
order: 4
nav_title: "Lab 004 · Home NAS"
crumb: "Lab 004"
badge: "LAB 004 · Storage"
heading: "<span class=\"accent\">NAS casero</span> con Debian + Samba"
intro: "Montar un NAS sencillo y funcional usando Debian y Samba para compartir archivos en tu red local, sin pagar por hardware especializado."
card_order: 4
card_flagship: false
card_type: "Lab 004"
card_is_lab: true
card_filters: "debian lab networking nas storage"
card_tags: ["debian", "samba", "storage"]
card_title: "Home NAS"
card_desc: "A simple NAS with Debian + Samba to share files across your LAN and homelab."
card_title_es: "NAS casero"
card_desc_es: "Un NAS simple con Debian + Samba para compartir archivos en tu red local y homelab."
---

## <span class="step-num">01</span> Preparar el disco de almacenamiento

> El siguiente comando formatea el disco y **borra todos los datos**. Asegúrate de apuntar al disco correcto con `lsblk` antes de continuar.
{: .note .note-warning}

```
# Identificar discos disponibles
lsblk

# Formatear el disco (reemplaza sdb con tu disco)
sudo mkfs.ext4 -L nas-datos /dev/sdb

# Crear punto de montaje
sudo mkdir -p /srv/nas/datos
```

### Montaje persistente (fstab)

```
# Obtener UUID del disco
sudo blkid /dev/sdb

# Añadir a /etc/fstab para montaje automático
# UUID=xxxx-xxxx  /srv/nas/datos  ext4  defaults,nofail  0  2
echo "UUID=$(sudo blkid -s UUID -o value /dev/sdb)  /srv/nas/datos  ext4  defaults,nofail  0  2" | sudo tee -a /etc/fstab

# Montar todo
sudo mount -a
df -h /srv/nas/datos
```

## <span class="step-num">02</span> Instalar Samba

```
sudo apt update && sudo apt install -y samba

# Crear usuario para el NAS
sudo useradd -M -s /sbin/nologin nasuser
sudo smbpasswd -a nasuser  # Establece contraseña Samba

# Permisos en la carpeta
sudo chown -R nasuser:nasuser /srv/nas/datos
sudo chmod -R 750 /srv/nas/datos
```

## <span class="step-num">03</span> Configurar el compartido

Añade al final de `/etc/samba/smb.conf`:

```
[nas-datos]
    path           = /srv/nas/datos
    comment        = NAS personal
    browseable     = yes
    read only      = no
    valid users    = nasuser
    create mask    = 0640
    directory mask = 0750
    force user     = nasuser
```

```
# Verificar configuración (no debe mostrar errores)
testparm

# Reiniciar Samba
sudo systemctl enable --now smbd nmbd
```

## <span class="step-num">04</span> Firewall para Samba

```
# Permitir Samba en UFW
sudo ufw allow Samba

# O manualmente
sudo ufw allow 445/tcp
sudo ufw allow 139/tcp
```

## <span class="step-num">05</span> Acceder desde otros equipos

### Desde Windows

```
\\IP_DEL_NAS\nas-datos
# Ejemplo: \\192.168.1.50\nas-datos
```

### Desde Linux

```
# Montaje manual
sudo apt install -y cifs-utils
sudo mkdir -p /mnt/nas
sudo mount -t cifs //192.168.1.50/nas-datos /mnt/nas \
  -o username=nasuser,uid=$(id -u),gid=$(id -g)

# Montaje automático en /etc/fstab
# //192.168.1.50/nas-datos /mnt/nas cifs credentials=/etc/nas-creds,uid=1000 0 0
```

### Desde macOS

```
smb://IP_DEL_NAS/nas-datos
# Finder → Ir → Conectar al servidor
```

> El NAS está listo. Para acceso fuera de tu red local, combínalo con el [Lab 002 (WireGuard VPN)](lab-002-vpn.html).
{: .note .note-success}
