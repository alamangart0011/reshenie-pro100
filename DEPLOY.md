# Деплой сайта АСТРЕНТ на VPS

Готовый план публикации. Сайт — статика (HTML/CSS/JS), нужен любой VPS с nginx.
Предполагаемый домен — **assurent.ru** (если другой — заменить во всех командах и в og/canonical/robots/sitemap).

## 0. Что нужно
- VPS (Ubuntu 22.04+), root/sudo, IP-адрес
- Домен + доступ к DNS
- Файлы сайта (эта папка)

## 1. DNS
A-запись `assurent.ru` и `www.assurent.ru` → IP вашего VPS. Проверить:
```bash
dig +short assurent.ru
```

## 2. Загрузить файлы на сервер
Выкладываем ТОЛЬКО рабочие файлы (без .git, .claude, README, DEPLOY.md, astrent.html, .DS_Store):
```bash
ssh root@IP "mkdir -p /var/www/astrent"
cd /Users/sergey/Desktop/ASTRENT
rsync -av --exclude '.git' --exclude '.claude' --exclude '.DS_Store' \
  --exclude 'README.md' --exclude 'DEPLOY.md' --exclude 'ПРОЕКТ.md' \
  --exclude 'astrent.html' --exclude 'images/README.txt' \
  ./ root@IP:/var/www/astrent/
```
*(astrent.html — это копия «одним файлом» для пересылки, на сервер не нужна.)*

## 3. nginx
`/etc/nginx/sites-available/astrent`:
```nginx
server {
    listen 80;
    server_name assurent.ru www.assurent.ru;
    root /var/www/astrent;
    index index.html;

    error_page 404 /404.html;

    # длинный кэш статике, без кэша — html (чтобы правки подхватывались)
    location ~* \.(css|js|jpg|jpeg|png|webp|svg|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    location = /index.html { add_header Cache-Control "no-cache"; }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/json;
}
```
```bash
ln -s /etc/nginx/sites-available/astrent /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 4. HTTPS (Let's Encrypt)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d assurent.ru -d www.assurent.ru
certbot renew --dry-run   # проверка авто-продления
```
certbot сам добавит редирект http→https.

## 5. После публикации — обязательно
1. **Активировать форму:** отправить заявку на сайте → в почте **astreinte@bk.ru** нажать «Activate Form» (FormSubmit) → отправить ещё раз и убедиться, что письмо пришло. До активации заявки НЕ доставляются (сайт честно покажет ошибку «Не удалось отправить, позвоните…»).
2. **Яндекс.Метрика:** вставить счётчик (id от клиента) в `<head>` index.html, настроить цели: отправка формы + клик по tel.
3. **Проверить:** главную, /privacy.html, /404 (несуществующий URL), форму, виджет отзывов Яндекса, карту, телефон, мобильную версию.

## 6. Обновление сайта в будущем
Правим файлы локально → `rsync` (шаг 2) повторно. При правках css/js — добавлять `?v=N` к ссылкам или версионировать, чтобы сбить кэш.

## ⚠️ Перед запуском убедиться (уже сделано в коде)
- [x] Обработчик формы различает успех/ошибку (не показывает ложный «успех»)
- [x] og:image / og:url / canonical → https://assurent.ru/
- [x] robots.txt и sitemap.xml → assurent.ru
- [x] 404.html есть
- [ ] FormSubmit активирован (шаг 5.1) — действие клиента
- [ ] Ссылка MAX вставлена (сейчас MAX-кнопки ведут на форму) — ждём от клиента
- [ ] Яндекс.Метрика подключена — ждём id
