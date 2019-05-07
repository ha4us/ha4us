const PROXY_CONFIG = [
  {
    context: [
      '/socket.io',
      '/api'
    ],
    target: process.env['HA4US_REST_URL'] || 'http://localhost:8081',
    'ws': true,
    'changeOrigin': true
  }
]

module.exports = PROXY_CONFIG
