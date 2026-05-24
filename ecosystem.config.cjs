const APP_ROOT = '/var/www/exam-management-system';

module.exports = {
  apps: [
    // ─────────────────────────────────────────────
    // 1. Main application  (static SPA via serve)
    // ─────────────────────────────────────────────
    {
      name: 'massar-app',
      script: '/usr/bin/serve',
      interpreter: 'node',
      args: '-s dist -l 3000',
      cwd: APP_ROOT,

      instances: 1,
      autorestart: true,
      watch: false,

      // Memory / stability
      max_memory_restart: '256M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 3000,
      kill_timeout: 5000,

      // Logging
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: '/var/log/pm2/exam-app.out.log',
      error_file: '/var/log/pm2/exam-app.error.log',
      log_file: '/var/log/pm2/exam-app.combined.log',

      env: {
        NODE_ENV: 'production',
      },
    },

    // ─────────────────────────────────────────────
    // 2. Supabase keep-alive  (pings DB every 12 h)
    // ─────────────────────────────────────────────
    {
      name: 'massar-keepalive',
      script: 'keep-alive.js',
      interpreter: 'node',
      cwd: APP_ROOT,

      instances: 1,
      autorestart: true,
      watch: false,

      // Memory / stability
      max_memory_restart: '128M',
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 10000,
      kill_timeout: 3000,

      // Credentials loaded from .env at runtime — no secrets in this file
      env_file: `${APP_ROOT}/.env`,

      // Logging
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: '/var/log/pm2/supabase-keepalive.out.log',
      error_file: '/var/log/pm2/supabase-keepalive.error.log',
      log_file: '/var/log/pm2/supabase-keepalive.combined.log',

      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
