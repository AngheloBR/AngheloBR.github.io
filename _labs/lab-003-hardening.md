---
title: "Lab 003 · Hardening Debian — Jaren Bailon"
description: "Checklist de seguridad para un servidor Debian recién instalado: usuario sudo, SSH seguro, firewall UFW, Fail2Ban y actualizaciones automáticas."
order: 3
nav_title: "Lab 003 · Hardening"
crumb: "Lab 003"
badge: "LAB 003 · Security"
heading: "<span class=\"accent\">Hardening</span> Debian 13"
intro: "Checklist de seguridad para un servidor Debian recién instalado: usuario sudo, SSH seguro, firewall UFW, Fail2Ban y actualizaciones automáticas."
card_order: 1
card_flagship: true
card_type: "Lab 003"
card_is_lab: true
card_filters: "debian lab security hardening"
card_tags: ["debian", "security", "hardening"]
card_title: "Hardening Debian"
card_desc: "Initial hardening checklist for a Debian 13 server: users, sudo, SSH, firewall and automatic updates. The base of the Basic tier."
card_title_es: "Hardening Debian"
card_desc_es: "Checklist inicial de hardening para un servidor Debian 13: usuarios, sudo, SSH, firewall y actualizaciones automáticas. La base del plan Basic."
---

## <span class="step-num">Resumen</span> Checklist de seguridad

<ul class="checklist">
    <li><span class="check">✓</span><div>Actualizar el sistema completo</div></li>
    <li><span class="check">✓</span><div>Crear usuario admin y deshabilitar root</div></li>
    <li><span class="check">✓</span><div>Configurar SSH seguro con un drop-in validado (sin root, sin contraseñas)</div></li>
    <li><span class="check">✓</span><div>Activar firewall UFW con política deny-all</div></li>
    <li><span class="check">✓</span><div>Instalar y configurar Fail2Ban</div></li>
    <li><span class="check">✓</span><div>Deshabilitar servicios innecesarios</div></li>
    <li><span class="check">✓</span><div>Configurar actualizaciones automáticas de seguridad</div></li>
</ul>

## <span class="step-num">01</span> Actualizar el sistema

```
sudo apt update && sudo apt full-upgrade -y
sudo apt autoremove -y && sudo apt autoclean
```

## <span class="step-num">02</span> Crear usuario administrador

```
# Crear usuario (reemplaza 'admin' con tu nombre)
sudo adduser admin
sudo usermod -aG sudo admin

# Copiar la llave pública con la que entras ahora.
# Si entras como root es /root/.ssh; si entras con el usuario
# de la imagen cloud (debian, ubuntu) es /home/<usuario>/.ssh
sudo install -d -m 700 -o admin -g admin /home/admin/.ssh
sudo install -m 600 -o admin -g admin /root/.ssh/authorized_keys /home/admin/.ssh/authorized_keys
```

> Prueba la conexión con el nuevo usuario desde **otra terminal** antes de seguir: `ssh admin@ip_del_servidor` y luego `sudo -v`. No cierres la sesión actual hasta terminar el paso 03.
{: .note .note-info}

## <span class="step-num">03</span> Configurar SSH seguro

En lugar de editar `/etc/ssh/sshd_config`, crea un archivo aparte en `/etc/ssh/sshd_config.d/`. Es más fácil de revisar y de revertir (basta con borrarlo), y sobrevive a las actualizaciones del paquete.

```
sudo tee /etc/ssh/sshd_config.d/00-hardening.conf > /dev/null <<'EOF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers admin
X11Forwarding no
MaxAuthTries 3
LoginGraceTime 20
EOF
```

> El nombre empieza con `00-` a propósito: OpenSSH se queda con el **primer** valor que lee, y las imágenes cloud de Ubuntu traen `50-cloud-init.conf` con `PasswordAuthentication yes`. Un archivo `99-` sería ignorado.
{: .note .note-warning}

```
# Validar la sintaxis ANTES de reiniciar (si falla, no reinicies)
sudo sshd -t

# Aplicar (en Debian y Ubuntu el servicio se llama "ssh")
sudo systemctl restart ssh

# Comprobar la configuración efectiva
sudo sshd -T | grep -E '^(permitrootlogin|passwordauthentication|allowusers)'
```

> Con la sesión actual todavía abierta, confirma desde otra terminal que `ssh admin@ip_del_servidor` entra y que `ssh root@ip_del_servidor` es rechazado. Si algo falla, borra el archivo y reinicia `ssh` desde la sesión que sigue abierta.
{: .note .note-warning}

## <span class="step-num">04</span> Firewall UFW

```
sudo apt install -y ufw

# Política por defecto: bloquear lo entrante
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH ANTES de activar (ajusta el puerto si lo cambiaste)
sudo ufw allow 22/tcp

# Otros servicios según necesites
# sudo ufw allow 80/tcp   # HTTP
# sudo ufw allow 443/tcp  # HTTPS

# Activar firewall
sudo ufw enable
sudo ufw status verbose
```

> Si vas a usar Docker, ten en cuenta que sus puertos publicados no pasan por las reglas de UFW. Hay que filtrarlos en la cadena `DOCKER-USER`.
{: .note .note-info}

## <span class="step-num">05</span> Fail2Ban

```
sudo apt install -y fail2ban python3-systemd
```

No copies `jail.conf` entero. Crea solo lo que cambias en `/etc/fail2ban/jail.d/`:

```
sudo tee /etc/fail2ban/jail.d/sshd.local > /dev/null <<'EOF'
[sshd]
enabled  = true
backend  = systemd
port     = 22
maxretry = 5
findtime = 10m
bantime  = 1h
EOF
```

> `backend = systemd` es obligatorio en Debian 12 y 13: ya no existe `/var/log/auth.log` por defecto y, sin esa línea, la jail `sshd` no arranca.
{: .note .note-warning}

```
sudo systemctl enable --now fail2ban
sudo systemctl restart fail2ban
sudo fail2ban-client status sshd
```

## <span class="step-num">06</span> Servicios innecesarios

```
# Ver puertos abiertos y servicios activos
sudo ss -tulpn

# Deshabilitar servicios que no necesitas
sudo systemctl disable --now <nombre-servicio>

# Ejemplo: deshabilitar avahi si no usas mDNS
sudo systemctl disable --now avahi-daemon
```

## <span class="step-num">07</span> Actualizaciones automáticas

```
sudo apt install -y unattended-upgrades apt-listchanges

# Activar las ejecuciones diarias
sudo dpkg-reconfigure -plow unattended-upgrades
```

Comprueba que quedó activo y que va a instalar los parches de seguridad:

```
# Debe mostrar "1" en ambas líneas
cat /etc/apt/apt.conf.d/20auto-upgrades

# Simulación: lista los orígenes permitidos y lo que instalaría
sudo unattended-upgrade --dry-run --debug 2>&1 | grep -iE 'allowed origins|security'
```

> Con esto completado, el servidor tiene una postura de seguridad básica sólida. Para auditorías más profundas, considera instalar **Lynis**: `sudo apt install lynis && sudo lynis audit system`
{: .note .note-success}
