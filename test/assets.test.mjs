import test from 'node:test';
import assert from 'node:assert/strict';
import { apply } from '../lib/index.js';

function route() {
  let handler;
  apply({inject(names, fn) { fn({effect(fn) {fn();}, get() {return {register(route) {handler=route.handler;return () => {};}};}});}});
  return async (url, method='GET', headers={}) => {
    const response={writeHead(status, headers={}) {this.status=status;this.headers=headers;return this;},end(body) {this.body=body;}};
    await handler({url,method,headers},response);
    return response;
  };
}
test('serves packaged artwork and matching HEAD metadata', async () => {
  const request=route();
  const get=await request('/skin-assets/offercontext-reading/mascot-chibi.png');
  const head=await request('/skin-assets/offercontext-reading/mascot-chibi.png','HEAD');
  assert.equal(get.status,200); assert.equal(head.status,200);
  assert.equal(get.headers['Content-Type'],'image/png');
  assert.equal(head.headers['Content-Length'],get.body.length); assert.equal(head.body,undefined);
});
test('rejects arbitrary files and path traversal', async () => {
  const request=route();
  for (const path of ['../package.json','%2e%2e/package.json','assets.json','reading.png/extra']) {
    assert.equal((await request('/skin-assets/offercontext-reading/'+path)).status,404);
  }
});
test('rejects mutations and supports conditional revalidation', async () => {
  const request=route(), url='/skin-assets/offercontext-reading/reading.png';
  assert.equal((await request(url,'POST')).status,405);
  const get=await request(url);
  assert.equal((await request(url,'GET',{'if-none-match':get.headers.ETag})).status,304);
});
