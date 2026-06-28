# Деплой АСТРЕНТ на Jino VPS — финальный боевой план

Сайт — **статика** (HTML/CSS/JS, без сборки). Сервер чистый.

## Параметры
- Сервер: **89.23.99.152** (IPv6 `2a03:6f00:a::2:c002`), Ubuntu 24.04, 2 CPU / 2 GB / 40 GB
- Домен: **assurent.ru** + `www` (DNS: A `assurent.ru`→89.23.99.152, A `*.assurent.ru`→89.23.99.152, NS ns1-4.jino.ru)
- SSH-ключ: `~/.ssh/jino_vps` (публичный должен быть добавлен в Jino → Доступ → SSH-ключи)
- Код: `/Users/sergey/Desktop/Bitrix24/reshenie-100`
- SSL: **только на сервере** через certbot (панельный SSL Jino НЕ используем)

## 0. Проверка доступа (read-only, до всего)
```bash
ssh -i ~/.ssh/jino_vps root@89.23.99.152 'echo OK; hostname; . /etc/os-release; echo $PRETTY_NAME'
```
Если просит пароль / Permission denied — добавить `~/.ssh/jino_vps.pub` в Jino → Доступ → SSH-ключи и повторить.

## 1. Подготовка сервера (root по SSH)
```bash
apt update && apt upgrade -y
timedatectl set-timezone Europe/Moscow

# SWAP 2G (RAM всего 2 ГБ)
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Firewall
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable

# Защита SSH
apt install -y fail2ban

# Веб-сервер
apt install -y nginx
mkdir -p /var/www/assurent.ru
```

## 2. nginx-конфиг (на сервере)
```bash
cat > /etc/nginx/sites-available/assurent.ru <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name assurent.ru www.assurent.ru;
    root /var/www/assurent.ru;
    index index.html;
    error_page 404 /404.html;

    location ~* \.(css|js|jpg|jpeg|png|webp|svg|ico|woff2?)$ {
        expires 30d; add_header Cache-Control "public, immutable";
    }
    location = /index.html { add_header Cache-Control "no-cache"; }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/json;
}
EOF
ln -sf /etc/nginx/sites-available/assurent.ru /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

## 3. Заливка файлов (с Мака)
```bash
rsync -az --delete \
  --exclude '.git' --exclude '.claude' --exclude '.DS_Store' \
  --exclude 'README.md' --exclude 'DEPLOY.md' --exclude 'astrent.html' \
  --exclude 'ПРОЕКТ.md' --exclude 'images/README.txt' \
  -e "ssh -i ~/.ssh/jino_vps" \
  /Users/sergey/Desktop/Bitrix24/reshenie-100/ root@89.23.99.152:/var/www/assurent.ru/
ssh -i ~/.ssh/jino_vps root@89.23.99.152 'chown -R www-data:www-data /var/www/assurent.ru'
```
Проверка по IP: `curl -I http://89.23.99.152` (или открыть в браузере) — должна отдаться главная.

## 4. HTTPS (после того, как DNS резолвится в 89.23.99.152)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d assurent.ru -d www.assurent.ru --redirect \
  --non-interactive --agree-tos -m astreinte@bk.ru
systemctl status certbot.timer    # авто-продление
```

## 5. Хардненинг SSH — ТОЛЬКО ПОСЛЕ проверки входа по ключу!
```bash
# убедись, что `ssh -i ~/.ssh/jino_vps root@89.23.99.152` пускает БЕЗ пароля,
# только потом:
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
systemctl restart ssh
```

## 6. Финальная проверка
- https://assurent.ru открывается, http→https редиректит
- /privacy.html, несуществующий URL → 404.html
- форма заявки, виджет отзывов Яндекса, Метрика (счётчик 110194531)

## Обновление сайта потом
```bash
# повторить rsync из шага 3 — и всё
```
