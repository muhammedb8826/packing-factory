import http from 'http'
import { parse } from 'url'
import { spawn } from 'child_process'
import path from 'path'
import next from 'next'

const port = parseInt(process.env.PORT || '4000', 10)
const apiPort = parseInt(process.env.API_PORT || '3001', 10)
const dev = process.env.NODE_ENV !== 'production'
// Start json-server by default when using this server (npm start). Set RUN_API_IN_PROCESS=0 to disable.
const runApiInProcess = process.env.RUN_API_IN_PROCESS !== '0'

const app = next({ dev })
const handle = app.getRequestHandler()

async function main() {
  if (runApiInProcess) {
    const dbPath = path.join(process.cwd(), 'server', 'db.json')
    const apiProcess = spawn(
      'npx',
      ['json-server', dbPath, '--port', String(apiPort)],
      {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd(),
      }
    )
    apiProcess.on('error', (err) =>
      console.error('json-server start error:', err)
    )
    apiProcess.on('exit', (code) => {
      if (code !== 0 && code !== null)
        console.error('json-server exited with code', code)
    })
    await new Promise((r) => setTimeout(r, 1500))
    console.log(`> API (json-server) on http://127.0.0.1:${apiPort}`)
  }

  await app.prepare()

  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url || '', true)
    const pathname = parsedUrl.pathname || ''

    if (pathname.startsWith('/api/')) {
      const apiPath = pathname.slice(4) + (parsedUrl.search || '')
      const opts = {
        hostname: '127.0.0.1',
        port: apiPort,
        path: apiPath,
        method: req.method,
        headers: { ...req.headers, host: `127.0.0.1:${apiPort}` },
      }
      const proxyReq = http.request(opts, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers)
        proxyRes.pipe(res)
      })
      proxyReq.on('error', (err) => {
        console.error('API proxy error:', err.message)
        res.writeHead(502, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            error: 'API server unavailable. Is json-server running?',
          })
        )
      })
      req.pipe(proxyReq)
      return
    }

    handle(req, res, parsedUrl)
  })
  server.listen(port)

  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? 'development' : process.env.NODE_ENV
    }`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
