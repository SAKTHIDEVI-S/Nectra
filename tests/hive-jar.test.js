import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { products } from '../worker/catalog.js';
const read = path => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Multiflora uses the new jar in hero, shared rooms and catalogue', async () => {
  const product = products.find(p => p.id === 'signature');
  assert.equal(product.image, '/assets/multiflora-hive-jar.png');
  assert.deepEqual(product.gallery, ['/assets/multiflora-hive-jar.png', '/assets/multiflora-choosing-guide.png', '/assets/multiflora-serving-ideas.png', '/assets/multiflora-our-hives.png']);
  for (const path of [product.image, ...product.gallery]) {
    await fs.access(new URL(`../public${path}`, import.meta.url));
  }
  for (const file of ['public/index.html', 'public/honey-house.js', 'public/house-commerce.js']) {
    assert.ok((await read(file)).includes('multiflora-hive-jar.png'), file);
  }
});

test('Hive listening story is scoped to Multiflora and its stylesheet is loaded', async () => {
  const script = await read('public/product.js');
  assert.ok(script.includes("product.id === 'signature' ? `<section class=\"hive-listen\""));
  assert.ok(script.includes('Scan the code on your physical jar.'));
  assert.ok((await read('public/product.html')).includes('/hive-listen.css'));
  assert.ok(!script.includes('multiflora-hive-front.png'));
  assert.ok(script.includes('data-hive-move'));
  assert.ok(script.includes('initHiveStory();'));
  for (let i = 0; i < 4; i++) await fs.access(new URL(`../public/assets/hive-story-${i}.png`, import.meta.url));
});
