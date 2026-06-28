#!/usr/bin/env bash
# Деплой АСТРЕНТ на Jino VPS (Ubuntu 24.04) — статика.
# Запускать ОТ ROOT в веб-консоли Jino (или по SSH, если доступ открыт).
# Сайт забирается прямо из публичного GitHub-репозитория — заливать ничего не нужно.
set -euo pipefail

DOMAIN="assurent.ru"
REPO="https://github.com/alamangart0011/reshenie-pro100.git"
ROOT="/var/www/${DOMAIN}"
EMAIL="astreinte@bk.ru"

echo "==> 1/7 Обновление системы"
export DEBIAN_FRONTEND=noninteractive
apt update && apt upgrade -y
timedatectl set-timezone Europe/Moscow || true

echo "==> 2/7 SWAP 2G (RAM всего 2 ГБ)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> 3/7 Файрвол + fail2ban"
apt install -y ufw fail2ban
ufw allow OpenSSH; ufw allow 80; ufw allow 443; ufw --force enable

echo "==> 4/7 nginx + git"
apt install -y nginx git rsync

echo "==> 5/7 Забираем сайт из GitHub"
rm -rf /tmp/astrent-src
git clone --depth 1 "$REPO" /tmp/astrent-src
mkdir -p "$ROOT"
rsync -a --delete \
  --exclude '.git' --exclude '.claude' --exclude 'README.md' \
  --exclude 'DEPLOY.md' --exclude 'deploy-jino.sh' --exclude 'ПРОЕКТ.md' \
  --exclude 'astrent.html' --exclude 'images/README.txt' \
  /tmp/astrent-src/ "$ROOT"/
chown -R www-data:www-data "$ROOT"

echo "==> 6/7 Конфиг nginx"
cat > /etc/nginx/sites-available/${DOMAIN} <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};
    root ${ROOT};
    index index.html;
    error_page 404 /404.html;
    location ~* \\.(css|js|jpg|jpeg|png|webp|svg|ico|woff2?)\$ { expires 30d; add_header Cache-Control "public, immutable"; }
    location = /index.html { add_header Cache-Control "no-cache"; }
    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/json;
}
EOF
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "    Проверка по IP: curl -I http://127.0.0.1  → должна отдаться главная"

echo "==> 7/7 HTTPS (Let's Encrypt). Нужно, чтобы ${DOMAIN} уже резолвился в этот сервер."
apt install -y certbot python3-certbot-nginx
if certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --redirect --non-interactive --agree-tos -m ${EMAIL}; then
  echo "ГОТОВО ✅  →  https://${DOMAIN}"
else
  echo "⚠️  certbot не смог выпустить сертификат (вероятно DNS ещё не долетел до этого сервера)."
  echo "    Сайт уже работает по http://${DOMAIN}. Позже повторите:"
  echo "    certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --redirect --agree-tos -m ${EMAIL}"
fi

# Обновление сайта в будущем:
#   git -C /tmp/astrent-src pull && rsync (повторить шаг 5) — и всё.
