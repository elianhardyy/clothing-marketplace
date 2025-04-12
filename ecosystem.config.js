module.exports = {
  apps: [
    {
      name: 'clothing-marketplace',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      autorestart: true,
    },
  ],
};
