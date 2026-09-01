(() => {
  const keyFor = item => `${item.id}::${item.size || ''}`;
  const offerRate = count => count >= 5 ? .2 : count >= 3 ? .15 : 0;
  const groupLines = items => [...items.reduce((map, item) => {
    const key = keyFor(item);
    const current = map.get(key) || { ...item, quantity: 0 };
    current.quantity += item.quantity || 1;
    map.set(key, current);
    return map;
  }, new Map()).values()];

  function loadBundles() {
    const saved = JSON.parse(localStorage.getItem('nectra-gift-bundles') || '[]');
    if (Array.isArray(saved) && saved.length) return saved;
    const legacy = JSON.parse(localStorage.getItem('nectra-gift-bundle') || 'null');
    return legacy?.items?.length ? [{ id: 'legacy-combo', items: legacy.items, gift: Boolean(JSON.parse(localStorage.getItem('nectra-gift-preferences') || 'null')), ...JSON.parse(localStorage.getItem('nectra-gift-preferences') || 'null') }] : [];
  }

  function saveBundles(bundles) {
    localStorage.setItem('nectra-gift-bundles', JSON.stringify(bundles));
    localStorage.removeItem('nectra-gift-bundle');
    localStorage.removeItem('nectra-gift-preferences');
  }

  function calculate(entries, bundles = []) {
    const byKey = new Map(entries.map(item => [keyFor(item), item]));
    const remaining = new Map(entries.map(item => [keyFor(item), item.quantity]));
    const sections = [];

    bundles.forEach(bundle => {
      const requestedKeys = (bundle.items || []).map(keyFor);
      if (new Set(requestedKeys).size !== requestedKeys.length) return;
      const picked = [];
      (bundle.items || []).forEach(requested => {
        const key = keyFor(requested);
        const source = byKey.get(key);
        if (!source || !(remaining.get(key) || 0)) return;
        remaining.set(key, remaining.get(key) - 1);
        picked.push({ ...source, quantity: 1 });
      });
      const rate = offerRate(picked.length);
      if (!rate) {
        picked.forEach(item => remaining.set(keyFor(item), (remaining.get(keyFor(item)) || 0) + 1));
        return;
      }
      const lines = groupLines(picked);
      const original = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
      sections.push({ type: bundle.gift ? 'gift' : 'combo', count: picked.length, rate, lines, original, saving: Math.round(original * rate), gift: bundle.gift ? { message: bundle.message || '', ribbon: bundle.ribbon || 'Forest green' } : null });
    });

    const ordinary = entries.map(item => ({ ...item, quantity: remaining.get(keyFor(item)) || 0 })).filter(item => item.quantity > 0);
    return { sections, ordinary, saving: sections.reduce((sum, section) => sum + section.saving, 0) };
  }

  window.NectraPromotion = { calculate, loadBundles, saveBundles };
})();
