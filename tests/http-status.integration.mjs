import assert from "node:assert/strict";

const origin=process.env.TEST_ORIGIN??"http://127.0.0.1:3100";

async function request(path){
  return fetch(new URL(path,origin),{redirect:"manual"});
}

let checks=0;

for(const path of ["/","/about","/work","/lab/web-doctor","/guides/title-tags"]){
  const response=await request(path);
  assert.equal(response.status,200,`${path} should return 200`);
  checks++;
}
for(const path of ["/work/tripcart","/work/coachpodium"]){
  const response=await request(path);
  assert.equal(response.status,404,`${path} should remain removed employer work`);
}

for(const [source,destination] of [["/home","/"],["/contact.html","/contact"],["/lab/seo-checker","/lab/web-doctor"]]){
  const response=await request(source);
  assert.ok(response.status===301||response.status===308,`${source} should return 301/308, received ${response.status}`);
  assert.equal(new URL(response.headers.get("location"),origin).pathname,destination,`${source} should redirect to ${destination}`);
  checks++;
}

for(const path of ["/does-not-exist-a22","/work/not-a-real-project","/guides/not-a-real-guide","/writing/not-a-real-article"]){
  const response=await request(path);
  const html=await response.text();
  assert.equal(response.status,404,`${path} should return 404`);
  assert.match(html,/404 \/ PAGE NOT FOUND/);
  assert.match(html,/This page isn(?:&#x27;|')t here\./);
  assert.match(html,/name="robots" content="noindex"/);
  assert.match(html,/Return home/);
  checks++;
}

console.log(`✓ ${checks} HTTP status and custom 404 checks passed.`);
