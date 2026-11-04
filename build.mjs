import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('./', import.meta.url);
await mkdir(new URL('lib/', root), {recursive: true});
const assets = {};
for (const name of await readdir(new URL('assets/', root))) {
  if (!/\.(png|webp|svg)$/.test(name)) continue;
  const bytes = await readFile(new URL(`assets/${name}`, root));
  assets[name] = createHash('sha256').update(bytes).digest('hex');
}
let css = await readFile(new URL('src/theme.css', root), 'utf8');
css = css.replace(/asset\(([^)]+)\)/g, (_, name) => {
  if (!assets[name]) throw new Error(`Missing asset: ${name}`);
  return `url("/skin-assets/offercontext-reading/${name}?v=${assets[name].slice(0,16)}")`;
});
const client = await readFile(new URL('src/client.js', root), 'utf8');
await writeFile(new URL('lib/client.js', root), (await readFile(new URL('src/model-controls.js', root), 'utf8')) + '\n' + client.replace('/* THEME_CSS */ ""', JSON.stringify(css)));
await writeFile(new URL('lib/assets.json', root), JSON.stringify(assets, null, 2) + '\n');
await writeFile(new URL('lib/index.js', root), await readFile(new URL('src/server.js', root)));
console.log(`Built reading theme: ${Object.keys(assets).length} local assets, ${css.length} CSS characters`);
