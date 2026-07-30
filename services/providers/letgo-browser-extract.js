function extractLetgoListings(maxListings) {
  const results = [];
  const seen = new Set();

  const parsePrice = (text) => {
    const match = text.match(/([\d.]+)\s*TL/i);
    if (!match || !match[1]) return 0;
    return parseInt(match[1].replace(/\./g, ''), 10);
  };

  const splitLocation = (raw) => {
    const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) return { city: parts[0], district: parts[1] };
    if (parts.length === 1) return { city: parts[0], district: parts[0] };
    return { city: 'Istanbul', district: 'Istanbul' };
  };

  for (const link of document.querySelectorAll('a.absolute.inset-0[href*="-iid-"]')) {
    if (results.length >= maxListings) break;

    const href = link.href;
    const externalId = href.match(/-iid-(\d+)/)?.[1];
    if (!externalId || seen.has(externalId)) continue;

    const container =
      link.closest('div.relative') || link.parentElement?.parentElement || link.parentElement;
    const texts = [...(container?.querySelectorAll('p, span, h2, h3') || [])]
      .map((el) => (el.textContent || '').trim())
      .filter(Boolean);

    const title =
      (link.querySelector('.sr-only')?.textContent || '').trim() ||
      texts.find(
        (text) =>
          text.length > 4 &&
          !/TL|taksit|Plus Satıcı|Öne Çıkan|Büyük İlan|Satıcı/i.test(text),
      ) ||
      '';
    const priceText = texts.find((text) => /\d[\d.]*\s*TL/i.test(text)) || '';
    const price = parsePrice(priceText);
    const image =
      container?.querySelector('img[src*="imvm.letgo.com/v1/files"]')?.getAttribute('src') || '';
    const locationText =
      texts.find((text) => text.includes(',') && !/TL|taksit/i.test(text)) || '';
    const sellerName = texts.find((text) => /Satıcı/i.test(text)) || undefined;

    if (!title || price <= 0 || !image) continue;

    seen.add(externalId);
    const { city, district } = splitLocation(locationText);
    results.push({
      externalId,
      title,
      price,
      url: href,
      imageUrls: [image],
      city,
      district,
      sellerName,
    });
  }

  if (results.length < maxListings) {
    for (const card of document.querySelectorAll('[data-slot="item-card"]')) {
      if (results.length >= maxListings) break;

      const link = card.closest('a[href*="-iid-"]') || card.querySelector('a[href*="-iid-"]');
      if (!link) continue;

      const href = link.href;
      const externalId = href.match(/-iid-(\d+)/)?.[1];
      if (!externalId || seen.has(externalId)) continue;

      const imageEl = card.querySelector('[data-slot="item-card-image"] img, img.object-cover');
      const title = (imageEl?.getAttribute('alt') || '').trim();
      const image = imageEl?.getAttribute('src') || '';
      const sellerName = (card.querySelector('p.font-semibold')?.textContent || '').trim() || undefined;
      const price = parsePrice(card.textContent || '');

      if (!title || /letgo plus banner/i.test(title) || !image) continue;
      if (price <= 0) continue;

      seen.add(externalId);
      results.push({
        externalId,
        title,
        price,
        url: href,
        imageUrls: [image],
        city: 'Istanbul',
        district: 'Istanbul',
        sellerName,
      });
    }
  }

  return results;
}
