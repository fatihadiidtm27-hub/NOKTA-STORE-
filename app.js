(() => {
  // ============================================================
  // WAJIB DIISI SEBELUM PUBLISH:
  // 1. Ganti WA_NUMBER dengan nomor WhatsApp asli (format 62812xxxxxxx)
  // 2. Ganti semua harga di PRODUCTS & BUNDLES sesuai harga jual asli
  // 3. Ganti "link" tiap produk dengan URL GitHub Pages tools terkait
  //    (setelah kamu deploy nokta-reframe, nokta-voice, nokta-pdf-studio)
  // ============================================================
  const WA_NUMBER = '6285643840150';

  const PRODUCTS = [
    {
      key: 'clip',
      name: 'NOKTA Clip',
      tagline: 'Editor video mobile',
      desc: 'Auto hook, teks bergaya CapCut, subtitle otomatis, analisa momen menarik, dan thumbnail editor.',
      price: 30000,
      link: 'https://fatihadiidtm27-hub.github.io/Nokta-clip-/'
    },
    {
      key: 'reframe',
      name: 'NOKTA Reframe',
      tagline: 'Multi-rasio otomatis',
      desc: 'Ubah satu video jadi 9:16, 1:1, dan 16:9 sekaligus — tanpa re-edit manual tiap platform.',
      price: 20000,
      link: 'https://GANTI-LINK-NOKTA-REFRAME.github.io/' // GANTI setelah kamu deploy repo Reframe
    },
    {
      key: 'voice',
      name: 'NOKTA Voice Kit',
      tagline: 'Preview narasi TTS',
      desc: 'Ubah naskah jadi suara buat cek narasi sebelum rekam — gratis, tanpa API berbayar.',
      price: 15000,
      link: 'https://GANTI-LINK-NOKTA-VOICE.github.io/' // GANTI dengan link repo Voice Kit kamu yang sudah live
    },
    {
      key: 'pdf',
      name: 'NOKTA PDF Studio',
      tagline: 'Bikin e-book & panduan',
      desc: 'Susun e-book atau lead magnet blok demi blok, ekspor jadi PDF langsung dari browser.',
      price: 20000,
      link: 'https://GANTI-LINK-NOKTA-PDF.github.io/' // GANTI setelah kamu deploy repo PDF Studio
    },
  ];

  const BUNDLES = [
    {
      key: 'starter',
      name: 'Bundle Starter',
      badge: 'HEMAT',
      includes: ['clip', 'reframe'],
      price: 40000,
      oldPrice: 50000,
      featured: false,
    },
    {
      key: 'all',
      name: 'Bundle Lengkap — Semua Tools',
      badge: 'PALING HEMAT',
      includes: ['clip', 'reframe', 'voice', 'pdf'],
      price: 60000,
      oldPrice: 85000,
      featured: true,
    },
  ];

  function fmtRupiah(n){
    return 'Rp' + n.toLocaleString('id-ID');
  }

  function waLink(message){
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function initials(name){
    return name.replace('NOKTA', '').trim().slice(0,2).toUpperCase() || 'NK';
  }

  // ---------- Render products ----------
  const productGrid = document.getElementById('productGrid');
  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    const msg = `Halo, saya mau beli ${p.name} seharga ${fmtRupiah(p.price)}. Mohon info cara pembayarannya ya.`;
    card.innerHTML = `
      <div class="product-head">
        <div class="product-icon">${initials(p.name)}</div>
        <div>
          <div class="product-name">${p.name}</div>
          <div class="product-tagline">${p.tagline}</div>
        </div>
      </div>
      <div class="product-desc">${p.desc}</div>
      <div class="product-foot">
        <div class="price">${fmtRupiah(p.price)}</div>
        <a class="btn buy" href="${waLink(msg)}" target="_blank" rel="noopener">Beli</a>
      </div>
      <a class="demo-link" href="${p.link}" target="_blank" rel="noopener">Lihat demo / buka aplikasi →</a>
    `;
    productGrid.appendChild(card);
  });

  // ---------- Render bundles ----------
  const bundleGrid = document.getElementById('bundleGrid');
  const productMap = Object.fromEntries(PRODUCTS.map(p => [p.key, p]));
  BUNDLES.forEach(b => {
    const card = document.createElement('div');
    card.className = 'bundle-card' + (b.featured ? ' featured' : '');
    const includesNames = b.includes.map(k => productMap[k] ? productMap[k].name.replace('NOKTA ', '') : k).join(', ');
    const savePct = Math.round((1 - b.price / b.oldPrice) * 100);
    const msg = `Halo, saya mau beli ${b.name} seharga ${fmtRupiah(b.price)}. Mohon info cara pembayarannya ya.`;
    card.innerHTML = `
      <div class="bundle-badge">${b.badge}</div>
      <div class="bundle-name">${b.name}</div>
      <div class="bundle-includes">Termasuk: <b>${includesNames}</b></div>
      <div class="bundle-price-row">
        <div class="bundle-price">${fmtRupiah(b.price)}</div>
        <div class="bundle-price-old">${fmtRupiah(b.oldPrice)}</div>
      </div>
      <div class="bundle-save">Hemat ${savePct}% dibanding beli satuan</div>
      <a class="btn buy ${b.featured ? 'gold' : ''}" href="${waLink(msg)}" target="_blank" rel="noopener">Beli Paket Ini</a>
    `;
    bundleGrid.appendChild(card);
  });

  if('serviceWorker' in navigator){
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(()=>{}); });
  }
})();
