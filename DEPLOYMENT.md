# Deployment Guide — massar.kareemamgad.com

**Stack:** Vite + React SPA · PM2 (`serve`) · Nginx · Let's Encrypt  
**Server path:** `/var/www/exam-management-system`  
**App port:** `3000` (internal, confirmed free on this VPS)

---

## Prerequisites (run once if not already installed)

> Nginx is already running on this VPS. Only run what's missing.

```bash
# Install Node.js 20 LTS via nvm (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v   # Expected: v20.x.x

# Install PM2 and serve globally (if not installed)
npm install -g pm2 serve
```

---

## Step 1 — Upload the project to the VPS

```bash
sudo mkdir -p /var/www/exam-management-system
sudo chown $USER:$USER /var/www/exam-management-system
```

**Option A — Clone from Git (recommended):**
```bash
git clone https://github.com/kareemxamged/massar-app.git /var/www/exam-management-system
```

**Option B — Upload via SCP from your local machine:**
```bash
# Run this on your LOCAL machine, not the VPS
scp -r /path/to/exam-management-system user@YOUR_VPS_IP:/var/www/
```

> Expected: project files appear at `/var/www/exam-management-system/`

---

## Step 2 — Set up environment variables

```bash
cd /var/www/exam-management-system
cp .env.example .env   # if .env.example exists
nano .env              # fill in VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.
```

> **Important:** `.env` must contain `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`  
> (or their `VITE_` prefixed variants) for the keep-alive process to work.

---

## Step 3 — Install dependencies

```bash
cd /var/www/exam-management-system
npm install
```

> Expected: `node_modules/` created, no errors.

---

## Step 4 — Build the project

```bash
npm run build
```

> Expected: `dist/` folder created.  
> Last line of output: `✓ built in X.XXs`

---

## Step 5 — Create the PM2 log directory

```bash
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2
```

---

## Step 6 — Start PM2 processes

```bash
cd /var/www/exam-management-system
pm2 start ecosystem.config.cjs
```

> Expected output:
> ```
> ┌────┬──────────────────────┬─────────┬──────┬───────────┬──────────┐
> │ id │ name                 │ mode    │ ↺    │ status    │ cpu      │
> ├────┼──────────────────────┼─────────┼──────┼───────────┼──────────┤
> │ 0  │ massar-app           │ fork    │ 0    │ online    │ 0%       │
> │ 1  │ massar-keepalive     │ fork    │ 0    │ online    │ 0%       │
> └────┴──────────────────────┴─────────┴──────┴───────────┴──────────┘
> ```

Verify the app is reachable internally:
```bash
curl http://127.0.0.1:3000
```
> Expected: HTML output starting with `<!doctype html>`

---

## Step 7 — Enable PM2 auto-start on reboot

```bash
pm2 startup
```
> This prints a command starting with `sudo env PATH=...` — **copy and run it exactly**.

```bash
pm2 save
```
> Expected: `[PM2] Saving current process list...  [PM2] Successfully saved`

---

## Step 8 — Create the Nginx config file

```bash
sudo nano /etc/nginx/sites-available/massar.kareemamgad.com
```

Paste the full contents of `massar.kareemamgad.com.nginx.conf` from this repository,  
then save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## Step 9 — Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/massar.kareemamgad.com \
           /etc/nginx/sites-enabled/massar.kareemamgad.com
```

> **Do NOT remove the default site** — other websites are running on this VPS.

---

## Step 10 — Test Nginx config and reload

```bash
sudo nginx -t
```
> Expected:
> ```
> nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
> nginx: configuration file /etc/nginx/nginx.conf test is successful
> ```

```bash
sudo systemctl reload nginx
```
> Expected: no output (silent success).

---

## Step 11 — Point your DNS to the VPS

In your DNS provider (Cloudflare, Namecheap, etc.), add:

| Type | Name                      | Value          | TTL  |
|------|---------------------------|----------------|------|
| A    | massar.kareemamgad.com    | YOUR_VPS_IP    | Auto |

Wait 1–5 minutes for propagation, then verify:
```bash
dig massar.kareemamgad.com +short
```
> Expected: your VPS IP address.

---

## Step 12 — Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

## Step 13 — Issue the SSL certificate

```bash
sudo certbot --nginx -d massar.kareemamgad.com
```

Follow the prompts:
- Enter your email address
- Agree to the Terms of Service (`A`)
- Choose whether to share your email with EFF (optional)

> Expected final output:
> ```
> Successfully received certificate.
> Certificate is saved at: /etc/letsencrypt/live/massar.kareemamgad.com/fullchain.pem
> Key is saved at:         /etc/letsencrypt/live/massar.kareemamgad.com/privkey.pem
> ...
> Congratulations! You have successfully enabled HTTPS on https://massar.kareemamgad.com
> ```

Certbot will automatically update your Nginx config with the SSL lines and reload it.

---

## Step 14 — Verify HTTPS and HTTP redirect

```bash
# HTTPS should return HTML
curl -I https://massar.kareemamgad.com

# HTTP should redirect to HTTPS (301)
curl -I http://massar.kareemamgad.com
```

> Expected from HTTPS: `HTTP/2 200`  
> Expected from HTTP: `HTTP/1.1 301 Moved Permanently` with `Location: https://...`

Open in your browser: **https://massar.kareemamgad.com** — the app should load.

---

## Step 15 — Test SSL auto-renewal

```bash
sudo certbot renew --dry-run
```

> Expected: `Congratulations, all simulated renewals succeeded`

Certbot installs a systemd timer automatically. Verify it's active:
```bash
sudo systemctl status certbot.timer
```
> Expected: `active (waiting)`

---

## Useful commands after deployment

```bash
# View live logs for all processes
pm2 logs

# View logs for one process
pm2 logs massar-app
pm2 logs massar-keepalive

# Check process status
pm2 list

# Restart after code update
npm run build && pm2 restart massar-app

# Reload Nginx after config changes
sudo nginx -t && sudo systemctl reload nginx
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `502 Bad Gateway` | PM2 app not running | `pm2 restart massar-app` |
| `curl 127.0.0.1:3000` fails | `serve` not installed | `npm install -g serve` |
| SSL cert error | DNS not propagated | Wait, then rerun `certbot` |
| Keep-alive ❌ logs | Missing `.env` credentials | Check `/var/www/exam-management-system/.env` |
| App shows old version | `dist/` not rebuilt | `npm run build && pm2 restart massar-app` |
