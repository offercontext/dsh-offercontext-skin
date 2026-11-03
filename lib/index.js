import { readFile } from 'node:fs/promises';
const manifest = JSON.parse(await readFile(new URL('./assets.json', import.meta.url), 'utf8'));
const prefix = '/skin-assets/offercontext-reading/';
const types = {png:'image/png', webp:'image/webp', svg:'image/svg+xml'};
// Exact package allowlist: never accept caller-provided paths or remote assets.
export function apply(ctx) {
  ctx.inject(['webServer'], child => {
    child.effect(() => child.get('webServer').register({kind:'prefix', path:prefix.slice(0,-1), handler: async (req, res) => {
      if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405, {Allow:'GET, HEAD'}).end(); return;}
      const path = new URL(req.url, 'http://localhost').pathname;
      const name = path.startsWith(prefix) ? path.slice(prefix.length) : '';
      if (!Object.hasOwn(manifest, name)) {res.writeHead(404).end(); return;}
      const headers = {'Content-Type':types[name.split('.').at(-1)], 'X-Content-Type-Options':'nosniff', 'Cache-Control':'no-cache', ETag:`"${manifest[name]}"`};
      if (req.headers['if-none-match'] === headers.ETag) {res.writeHead(304, headers).end(); return;}
      const bytes = await readFile(new URL(`../assets/${name}`, import.meta.url));
      res.writeHead(200, {...headers, 'Content-Length':bytes.length});
      res.end(req.method === 'HEAD' ? undefined : bytes);
    }}), 'reading: local artwork');
  });
}
