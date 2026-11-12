let products = [
  {id:'beige-ikat',name:'Beige Ikat Mulmul Saree',fabric:'Mulmul Cotton',category:'Mulmul',color:'Beige',description:'Airy handwoven cotton with an ikat border and soft tassel finish.',price:2999,was:3499,discount:14,badge:'Handloom',img:'Beige Ikat Mulmul Saree.png'},
  {id:'bottle-green',name:'Bottle Green Narayani Pattu',fabric:'Narayani Pattu',category:'Narayani',color:'Bottle Green',description:'Deep green pattu with a warm woven zari border.',price:6499,was:7999,discount:19,badge:'Pure Silk',img:'Bottle Green Narayani Pattu.png'},
  {id:'magenta-narayani',name:'Magenta Narayani Pattu',fabric:'Narayani Pattu',category:'Narayani',color:'Magenta',description:'A saturated magenta body finished with a rich gold border.',price:6999,was:8499,discount:18,badge:'Handloom',img:'Magenta Narayani Pattu.png'},
  {id:'maroon-narayani',name:'Maroon Narayani Pattu',fabric:'Narayani Pattu',category:'Narayani',color:'Maroon',description:'A classic maroon drape with intricate green and gold detailing.',price:6799,was:7999,discount:15,badge:'Pure Silk',img:'Maroon Narayani Pattu.png'},
  {id:'multicolor-mulmul',name:'Multicolor Mulmul Cotton Saree',fabric:'Mulmul Cotton',category:'Mulmul',color:'Multicolor',description:'Soft checks in a bright, joyful palette with playful tassels.',price:3299,was:3799,discount:13,badge:'Handloom',img:'Multicolor Mulmul Cotton Saree.png'},
  {id:'mustard-sungudi',name:'Mustard Yellow Sungudi Cotton Saree',fabric:'Sungudi Cotton',category:'Sungudi',color:'Mustard',description:'A sunshine yellow cotton with traditional woven border work.',price:2799,was:3299,discount:15,badge:'Craft Classic',img:'Mustard Yellow Sungudi Cotton Saree.png'},
  {id:'navy-narayani',name:'Navy Blue Narayani Pattu',fabric:'Narayani Pattu',category:'Narayani',color:'Navy Blue',description:'A deep navy pattu with a luminous, heritage-inspired border.',price:7299,was:8499,discount:14,badge:'Pure Silk',img:'Navy Blue Narayani Pattu.png'},
  {id:'orange-sungudi',name:'Orange Sungudi Cotton Saree',fabric:'Sungudi Cotton',category:'Sungudi',color:'Orange',description:'A lively orange cotton saree for bright days and celebrations.',price:2899,was:3399,discount:15,badge:'Handloom',img:'Orange Sungudi Cotton Saree.png'},
  {id:'red-sungudi',name:'Red Sungudi Saree',fabric:'Sungudi Cotton',category:'Sungudi',color:'Red',description:'A vivid red drape with a contrasting dark border and gold motifs.',price:2999,was:3599,discount:17,badge:'Craft Classic',img:'Red Sungudi Saree.png'},
  {id:'white-ikat',name:'White Ikat Mulmul Saree',fabric:'Mulmul Cotton',category:'Mulmul',color:'Ivory',description:'Lightweight ivory mulmul with a graphic ikat panel and tassels.',price:3199,was:3699,discount:14,badge:'Handloom',img:'White Ikat Mulmul Saree.png'},
  {id:'yellow-teal',name:'Yellow Teal Mulmul Cotton Saree',fabric:'Mulmul Cotton',category:'Mulmul',color:'Yellow & Teal',description:'Easy cotton in sunny yellow, pale cream and cool teal.',price:3399,was:3999,discount:15,badge:'Handloom',img:'Yellow Teal Mulmul Cotton Saree.png'}
];

async function fetchProductsFromBackend() {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        products = data;
        renderProducts();
        renderCart();
      }
    }
  } catch (err) {
    console.log('Serving catalogue from local cache');
  }
}
const asset = name => `assets/${name}`;
const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
let currentFilter='All';
let cart=JSON.parse(localStorage.getItem('kadha-cart')||'[]');
let wishlist=JSON.parse(localStorage.getItem('kadha-wishlist')||'[]');
let activeProduct=null;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

function productCard(p){return `<article class="product-card" data-id="${p.id}"><div class="product-media"><img loading="lazy" src="${asset(p.img)}" alt="${p.name}"/><div class="badge-stack"><span class="badge badge-sale">-${p.discount}% OFF</span><span class="badge badge-type">${p.badge}</span></div><button class="wish-btn ${wishlist.includes(p.id)?'saved':''}" data-wish="${p.id}" aria-label="${wishlist.includes(p.id)?'Remove from':'Add to'} wishlist">${wishlist.includes(p.id) ? '<svg class="vector-ico ico-heart filled" viewBox="0 0 24 24" width="16" height="16" fill="#b74347" stroke="#b74347" stroke-width="1.5" style="vertical-align:-2px;" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' : '<svg class="vector-ico ico-heart outline" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" style="vertical-align:-2px;" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'}</button><button class="quick-view" data-quick="${p.id}"><svg viewBox="0 0 24 24"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg> Quick View</button></div><div class="product-info"><div class="product-meta"><span>${p.fabric}</span><span>${p.color}</span></div><h3>${p.name}</h3><p>${p.description}</p><div class="price-row"><span class="price-now">${money(p.price)}</span><span class="price-was">${money(p.was)}</span></div><div class="card-actions"><button class="add-btn" data-add="${p.id}"><svg viewBox="0 0 24 24"><path d="M4 8h16l-1.2 12H5.2L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg> Add</button><button class="book-btn" data-book="${p.name}">Book Drape</button></div></div></article>`}
function renderProducts(){
  const grid = $('#productGrid');
  if(!grid) return;
  let list=products.filter(p=>currentFilter==='All'||p.category===currentFilter);
  const sort=$('#sortSelect')?.value;
  if(sort==='price-low')list.sort((a,b)=>a.price-b.price);
  if(sort==='price-high')list.sort((a,b)=>b.price-a.price);
  grid.innerHTML=list.map(productCard).join('');
}
function saveCart(){localStorage.setItem('kadha-cart',JSON.stringify(cart));renderCart()}
function addToCart(id){const item=cart.find(x=>x.id===id);if(item)item.qty++;else cart.push({id,qty:1});saveCart();const p=products.find(x=>x.id===id);toast(`${p?.name || 'Item'} added to your bag`)}
function renderCart(){
  const count=cart.reduce((n,x)=>n+x.qty,0);
  if($('#cartCount')) $('#cartCount').textContent=count;
  if($('#bagTitleCount')) $('#bagTitleCount').textContent=`(${count})`;
  const items=cart.map(i=>({...products.find(p=>p.id===i.id),qty:i.qty})).filter(Boolean);
  if($('#cartItems')) $('#cartItems').innerHTML=items.map(p=>`<div class="cart-item"><img src="${asset(p.img)}" alt=""><div><h4>${p.name}</h4><small>${p.color} · ${p.fabric}</small><div class="qty-row"><button data-qty="${p.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${p.qty}</span><button data-qty="${p.id}" data-delta="1" aria-label="Increase quantity">+</button><button class="remove-item" data-remove="${p.id}">Remove</button></div></div><span class="cart-item-price">${money(p.price*p.qty)}</span></div>`).join('');
  const subtotal=items.reduce((n,p)=>n+p.price*p.qty,0);
  if($('#cartSubtotal')) $('#cartSubtotal').textContent=money(subtotal);
  if($('#cartEmpty')) $('#cartEmpty').style.display=items.length?'none':'flex';
  if($('#cartBottom')) $('#cartBottom').style.display=items.length?'block':'none';
}
function openCart(){closeSearch();$('#overlay')?.classList.add('visible');$('#cartDrawer')?.classList.add('open');$('#cartDrawer')?.setAttribute('aria-hidden','false');document.body.classList.add('locked')}
function closeCart(){ $('#cartDrawer')?.classList.remove('open');$('#cartDrawer')?.setAttribute('aria-hidden','true');if(!$('#searchPanel')?.classList.contains('open')){$('#overlay')?.classList.remove('visible');document.body.classList.remove('locked')}}
function openSearch(){closeCart();$('#overlay')?.classList.add('visible');$('#searchPanel')?.classList.add('open');$('#searchPanel')?.setAttribute('aria-hidden','false');document.body.classList.add('locked');setTimeout(()=>$('#searchInput')?.focus(),250)}
function closeSearch(){if(!$('#searchPanel')?.classList.contains('open'))return;$('#searchPanel')?.classList.remove('open');$('#searchPanel')?.setAttribute('aria-hidden','true');if(!$('#cartDrawer')?.classList.contains('open')){$('#overlay')?.classList.remove('visible');document.body.classList.remove('locked')}}
function openModal(el){if(!el) return; $('#overlay')?.classList.add('visible');el.classList.add('open');document.body.classList.add('locked')}
function closeModals(){ $$('.modal.open').forEach(m=>m.classList.remove('open'));if(!$('#cartDrawer')?.classList.contains('open')&&!$('#searchPanel')?.classList.contains('open')){$('#overlay')?.classList.remove('visible');document.body.classList.remove('locked')}}
function quickView(id){const p=products.find(x=>x.id===id);if(!p)return;activeProduct=p;const qc=$('#quickContent');if(qc)qc.innerHTML=`<img src="${asset(p.img)}" alt="${p.name}"><div class="quick-copy"><span class="eyebrow">${p.badge} · ${p.fabric}</span><h2 id="quickTitle">${p.name}</h2><p>${p.description} Carefully made in small batches, with the character and texture of a handwoven drape.</p><div class="price-row"><span class="price-now">${money(p.price)}</span><span class="price-was">${money(p.was)}</span></div><button class="btn btn-primary" data-quick-add="${p.id}">Add to bag <span>→</span></button><button class="btn btn-outline" data-book="${p.name}">Book Drape</button><p style="margin-top:17px;font-size:9px">A little variation is part of the charm of handloom.</p></div>`;openModal($('#quickModal'))}
function bookDrape(productName='A personal drape consultation'){activeProduct=products.find(p=>p.name===productName)||null;const select=$('#bookingForm select[name="interest"]');if(select){if(activeProduct){select.value='Help choosing a saree'}else{select.selectedIndex=0}}const bs=$('#bookingSuccess');if(bs)bs.textContent='';openModal($('#bookingModal'))}
let toastTimer;function toast(message){const t=$('#toast');if(!t)return;t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2400)}

$('#productGrid')?.addEventListener('click',e=>{const add=e.target.closest('[data-add]'),quick=e.target.closest('[data-quick]'),wish=e.target.closest('[data-wish]'),book=e.target.closest('[data-book]');if(add)addToCart(add.dataset.add);if(quick)quickView(quick.dataset.quick);if(wish){const id=wish.dataset.wish;wishlist=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id];localStorage.setItem('kadha-wishlist',JSON.stringify(wishlist));renderProducts();toast(wishlist.includes(id)?'Saved to your wishlist':'Removed from your wishlist')}if(book)bookDrape(book.dataset.book)});
$('#quickContent')?.addEventListener('click',e=>{const add=e.target.closest('[data-quick-add]'),book=e.target.closest('[data-book]');if(add){addToCart(add.dataset.quickAdd);closeModals()}if(book)bookDrape(book.dataset.book)});
$('#cartItems')?.addEventListener('click',e=>{const qty=e.target.closest('[data-qty]'),remove=e.target.closest('[data-remove]');if(qty){const id=qty.dataset.qty;const item=cart.find(x=>x.id===id);if(item){item.qty+=Number(qty.dataset.delta);if(item.qty<1)cart=cart.filter(x=>x.id!==id);saveCart()}}if(remove){cart=cart.filter(x=>x.id!==remove.dataset.remove);saveCart()}});
$('#cartOpen')?.addEventListener('click',openCart);$('#cartClose')?.addEventListener('click',closeCart);$('#overlay')?.addEventListener('click',()=>{closeCart();closeSearch();closeModals();$('#mobileNav')?.classList.remove('open')});$('#searchOpen')?.addEventListener('click',openSearch);$('#searchClose')?.addEventListener('click',closeSearch);$('#continueShopping')?.addEventListener('click',()=>{closeCart();const shop=document.querySelector('#shop') || document.querySelector('#catalogue');if(shop)shop.scrollIntoView({behavior:'smooth'});else window.location.href='collections.html';});$$('[data-close]').forEach(b=>b.addEventListener('click',closeModals));

// Open Razorpay Checkout Modal
$('#checkoutBtn')?.addEventListener('click', () => {
  if (!cart.length) {
    toast('Your bag is empty. Please select a saree first.');
    return;
  }
  openRazorpayCheckoutModal();
});
$('#newsletterForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('#newsletterEmail')?.value.trim();
  try {
    await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  } catch(e) {}
  if($('#newsletterSuccess')) $('#newsletterSuccess').textContent = 'Thank you for joining us. Look out for a note from KADHA.';
  e.target.reset();
});
$('#bookingForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());
  try {
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch(e) {}
  if($('#bookingSuccess')) $('#bookingSuccess').textContent = 'Thank you. Our styling team will be in touch to find a time.';
  e.target.reset();
});
$$('[data-book]').forEach(b=>b.addEventListener('click',()=>bookDrape(b.dataset.book)));
$('#menuOpen')?.addEventListener('click',()=>{closeCart();$('#overlay')?.classList.add('visible');$('#mobileNav')?.classList.add('open');document.body.classList.add('locked')});$('#menuClose')?.addEventListener('click',()=>{$('#mobileNav')?.classList.remove('open');$('#overlay')?.classList.remove('visible');document.body.classList.remove('locked')});$$('#mobileNav a').forEach(a=>a.addEventListener('click',()=>{$('#mobileNav')?.classList.remove('open');$('#overlay')?.classList.remove('visible');document.body.classList.remove('locked')}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();closeSearch();closeModals();$('#mobileNav')?.classList.remove('open');$('#overlay')?.classList.remove('visible');document.body.classList.remove('locked')}});

$('#themeToggle')?.addEventListener('click',()=>{document.body.classList.toggle('dark');const dark=document.body.classList.contains('dark');localStorage.setItem('kadha-theme',dark?'dark':'light');$('#themeToggle')?.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme')});if(localStorage.getItem('kadha-theme')==='dark'){document.body.classList.add('dark');$('#themeToggle')?.setAttribute('aria-label','Switch to light theme')}
$('#filterRow')?.addEventListener('click',e=>{const chip=e.target.closest('[data-filter]');if(!chip)return;currentFilter=chip.dataset.filter;$$('.filter-chip').forEach(c=>c.classList.toggle('active',c===chip));renderProducts()});$('#sortSelect')?.addEventListener('change',renderProducts);
$$('[data-filter-link]').forEach(a=>a.addEventListener('click',()=>{currentFilter=a.dataset.filterLink;$$('.filter-chip').forEach(c=>c.classList.toggle('active',c.dataset.filter===currentFilter));renderProducts()}));
$('#searchInput')?.addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();const found=products.filter(p=>`${p.name} ${p.fabric} ${p.color}`.toLowerCase().includes(q)).slice(0,8);const sr=$('#searchResults');if(sr)sr.innerHTML=q?found.map(p=>`<button class="search-result" data-search-product="${p.id}"><img src="${asset(p.img)}" alt=""><span><b>${p.name}</b><small>${p.fabric} · ${money(p.price)}</small></span></button>`).join('')||'<span class="search-hint">No sarees found. Try another colour or fabric.</span>':'<span class="search-hint">Popular: Mulmul · Narayani · Sungudi</span>'});
$('#searchResults')?.addEventListener('click',e=>{const r=e.target.closest('[data-search-product]');if(!r)return;closeSearch();quickView(r.dataset.searchProduct)});

// Apple-style interactive fluid 3D tilt & elevation on hero product cards
function initHeroCardMotion() {
  const cards = document.querySelectorAll('.gallery-tile');
  cards.forEach(card => {
    let bounds = null;
    let rafId = null;

    function onMouseEnter() {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    function onMouseMove(e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;

        const percentX = Math.max(0, Math.min(100, (x / bounds.width) * 100));
        const percentY = Math.max(0, Math.min(100, (y / bounds.height) * 100));
        card.style.setProperty('--mouse-x', `${percentX.toFixed(1)}%`);
        card.style.setProperty('--mouse-y', `${percentY.toFixed(1)}%`);

        // Subtle Apple 3D tilt frame motion
        const rotateX = ((centerY - y) / centerY) * 7;
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = `translateY(-10px) scale(1.03) perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      });
    }

    function onMouseLeave() {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)';
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
      bounds = null;
    }

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  });
}

// Account page interactions
function initAccountPage() {
  const tabs = document.querySelectorAll('.account-tab');
  const panes = document.querySelectorAll('.account-pane');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.querySelector(`#${tab.dataset.tab}`);
      if (target) target.classList.add('active');
      if (tab.dataset.tab === 'wishlist-pane') renderWishlistPane();
    });
  });

  const trackForm = document.querySelector('#trackOrderForm');
  if (trackForm) {
    trackForm.addEventListener('submit', async e => {
      e.preventDefault();
      const orderId = document.querySelector('#orderTrackId')?.value.trim();
      const resultBox = document.querySelector('#trackResult');
      if (!resultBox) return;
      resultBox.innerHTML = '<p style="color:var(--muted)">Searching for order...</p>';

      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const orders = await res.json();
          const match = orders.find(o => o.id.toLowerCase() === orderId.toLowerCase());
          if (match) {
            resultBox.innerHTML = `
              <div class="order-lookup-card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                  <strong>Order ${match.id}</strong>
                  <span class="status ${match.status || 'Processing'}" style="padding:4px 10px;border-radius:999px;font-size:10px;font-weight:700;background:var(--soft);color:var(--emerald);">${match.status || 'Processing'}</span>
                </div>
                <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
                  <img src="assets/${match.img}" alt="${match.product}" style="width:54px;height:68px;object-fit:cover;border-radius:10px;">
                  <div>
                    <h4 style="margin:0 0 4px;font-size:14px;">${match.product}</h4>
                    <small style="color:var(--muted)">Placed on ${match.date} · ₹${Number(match.amount).toLocaleString('en-IN')}</small>
                  </div>
                </div>
                <div class="order-progress-track">
                  <div class="track-step done"><div class="track-step-dot"><svg class="vector-ico ico-check" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;display:inline-block;" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></div><span>Confirmed</span></div>
                  <div class="track-step ${match.status === 'Shipped' || match.status === 'Delivered' ? 'done' : ''}"><div class="track-step-dot">●</div><span>Handloom QC</span></div>
                  <div class="track-step ${match.status === 'Shipped' || match.status === 'Delivered' ? 'done' : ''}"><div class="track-step-dot">●</div><span>Shipped</span></div>
                  <div class="track-step ${match.status === 'Delivered' ? 'done' : ''}"><div class="track-step-dot"><svg class="vector-ico ico-star" viewBox="0 0 24 24" width="14" height="14" fill="#d89b35" aria-hidden="true"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></div><span>Delivered</span></div>
                </div>
              </div>
            `;
            return;
          }
        }
      } catch (err) {}
      resultBox.innerHTML = `<p style="color:#b23b3b;font-size:12px;">Order "${orderId}" not found. Try one of our sample orders like <strong>#KD-2841</strong> or check your confirmation email.</p>`;
    });
  }

  function renderWishlistPane() {
    const container = document.querySelector('#accountWishlistGrid');
    if (!container) return;
    const saved = products.filter(p => wishlist.includes(p.id));
    if (!saved.length) {
      container.innerHTML = '<p style="text-align:center;color:var(--muted);grid-column:1/-1;padding:30px 0;">Your wishlist is empty. Explore our sarees to save your favourites.</p>';
      return;
    }
    container.innerHTML = saved.map(productCard).join('');
  }
}

// ==============================================================================
// RAZORPAY PAYMENT GATEWAY INTEGRATION (Zero Frontend Hardcoded Keys)
// ==============================================================================
function ensureRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => {
      console.error('Failed to load Razorpay checkout script');
      resolve(false);
    };
    document.head.appendChild(s);
  });
}

function ensureCheckoutModals() {
  if (document.querySelector('#checkoutModal')) return;

  const modalHtml = `
  <!-- Razorpay Checkout Modal -->
  <div class="modal checkout-modal" id="checkoutModal" role="dialog" aria-modal="true" aria-labelledby="checkoutModalTitle">
    <button class="modal-close" data-close aria-label="Close checkout">×</button>
    <div class="checkout-modal-content">
      <div class="checkout-form-col">
        <span class="eyebrow" style="color:var(--emerald);font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;"><svg class="vector-ico ico-lock" viewBox="0 0 24 24" width="14" height="14" fill="none" style="vertical-align:-2px;display:inline-block;" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2.5" fill="#f59e0b" stroke="#d97706" stroke-width="1.2"/><path d="M7 10V6.5a5 5 0 0 1 10 0V10" stroke="#78716c" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="15" r="1.3" fill="#78350f"/><path d="M12 16.3v2" stroke="#78350f" stroke-width="1.3" stroke-linecap="round"/></svg> SECURE ATELIER CHECKOUT</span>
        <h2 id="checkoutModalTitle">Shipping Details</h2>
        <p>Your handloom sarees are carefully wrapped in unbleached cotton and dispatched with insured express delivery.</p>
        
        <form id="checkoutShippingForm" class="checkout-grid-form">
          <label>Full name *
            <input type="text" id="chkName" required placeholder="e.g. Priyadarshini Sundaram" autocomplete="name">
          </label>
          <label>Mobile number *
            <input type="tel" id="chkPhone" required placeholder="10-digit mobile number" autocomplete="tel">
          </label>
          <label class="full-span">Email address *
            <input type="email" id="chkEmail" required placeholder="you@domain.com" autocomplete="email">
          </label>
          <label class="full-span">Street address / Flat No. *
            <textarea id="chkAddress" required placeholder="Apartment / Villa, Street, Landmark" autocomplete="street-address"></textarea>
          </label>
          <label>City & State *
            <input type="text" id="chkCity" required placeholder="e.g. Bangalore, Karnataka" autocomplete="address-level2">
          </label>
          <label>Postal PIN Code *
            <input type="text" id="chkPincode" required placeholder="e.g. 560001" maxlength="6" autocomplete="postal-code">
          </label>

          <div class="full-span" style="margin-top:8px">
            <button type="submit" class="rzp-btn" id="payWithRazorpayBtn">
              <span>Proceed to Razorpay</span>
              <span id="btnPayAmount">₹0</span>
              <span aria-hidden="true">→</span>
            </button>
            <div class="rzp-security-note">
              <span><svg class="vector-ico ico-lock" viewBox="0 0 24 24" width="14" height="14" fill="none" style="vertical-align:-2px;display:inline-block;" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2.5" fill="#f59e0b" stroke="#d97706" stroke-width="1.2"/><path d="M7 10V6.5a5 5 0 0 1 10 0V10" stroke="#78716c" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="15" r="1.3" fill="#78350f"/><path d="M12 16.3v2" stroke="#78350f" stroke-width="1.3" stroke-linecap="round"/></svg> 256-bit encrypted via Razorpay · Supports UPI, Cards, NetBanking</span>
            </div>
          </div>
        </form>
      </div>

      <div class="checkout-summary-col">
        <h3>Order Summary</h3>
        <div class="checkout-items-preview" id="checkoutItemsPreview"></div>

        <div class="checkout-bill">
          <div class="checkout-bill-row">
            <span>Subtotal</span>
            <strong id="chkSubtotal">₹0</strong>
          </div>
          <div class="checkout-bill-row">
            <span>Handloom Insured Shipping</span>
            <span style="color:var(--emerald);font-weight:700">COMPLIMENTARY</span>
          </div>
          <div class="checkout-bill-row">
            <span>GST (Handloom Textiles)</span>
            <span>Included</span>
          </div>
          <div class="checkout-bill-row total-row">
            <span>Total Payable</span>
            <strong id="chkTotal">₹0</strong>
          </div>
        </div>

        <div class="razorpay-badge">
          <span><svg class="vector-ico ico-card" viewBox="0 0 24 24" width="18" height="18" fill="none" style="vertical-align:-3px;display:inline-block;" aria-hidden="true"><rect x="2" y="4" width="20" height="15" rx="3" fill="#2563eb"/><rect x="2" y="7.5" width="20" height="3" fill="#1e293b"/><rect x="5" y="13.5" width="4" height="3" rx="0.5" fill="#fbbf24"/><circle cx="16" cy="15" r="1.5" fill="#ef4444" opacity="0.85"/><circle cx="18" cy="15" r="1.5" fill="#f59e0b" opacity="0.85"/></svg></span>
          <div>
            <strong class="razorpay-badge-logo">Razorpay Trusted Gateway</strong>
            <small style="display:block;color:var(--muted);font-size:9px">UPI (GPay, PhonePe, Paytm), Cards, NetBanking</small>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Order Success Modal -->
  <div class="modal success-modal" id="orderSuccessModal" role="dialog" aria-modal="true" aria-labelledby="orderSuccessTitle">
    <button class="modal-close" data-close aria-label="Close modal">×</button>
    <div class="success-icon-wrap"><svg class="vector-ico ico-check" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;display:inline-block;" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></div>
    <span class="eyebrow" style="color:var(--emerald);font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">THANK YOU FOR YOUR PATRONAGE</span>
    <h2 id="orderSuccessTitle">Payment Successful!</h2>
    <p>Your payment has been verified via Razorpay and your bespoke handloom order has been scheduled for weaver preparation and hand-packing.</p>

    <div class="success-order-box">
      <div>
        <span>Order Number</span>
        <strong id="successOrderId">#KD-0000</strong>
      </div>
      <div>
        <span>Razorpay Payment ID</span>
        <strong id="successPaymentId" style="font-family:monospace;font-size:11px">pay_...</strong>
      </div>
      <div>
        <span>Amount Paid</span>
        <strong id="successAmount" style="color:var(--emerald)">₹0</strong>
      </div>
      <div>
        <span>Dispatched To</span>
        <strong id="successCustomer">Customer</strong>
      </div>
    </div>

    <div class="success-actions">
      <a href="account.html#orders" class="btn btn-primary" style="text-decoration:none">Track Your Order ↗</a>
      <button class="btn btn-outline" data-close>Continue Exploring</button>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Hook close events
  document.querySelectorAll('#checkoutModal [data-close], #orderSuccessModal [data-close]').forEach(b => {
    b.addEventListener('click', closeModals);
  });

  // Attach submit handler to shipping form
  document.querySelector('#checkoutShippingForm')?.addEventListener('submit', handleRazorpayPayment);
}

function openRazorpayCheckoutModal() {
  ensureCheckoutModals();
  ensureRazorpayScript(); // Preload script

  const items = cart.map(i => ({ ...products.find(p => p.id === i.id), qty: i.qty })).filter(Boolean);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const preview = document.querySelector('#checkoutItemsPreview');
  if (preview) {
    preview.innerHTML = items.map(p => `
      <div class="checkout-item-row">
        <img src="${asset(p.img)}" alt="${p.name}">
        <div>
          <b>${p.name}</b>
          <span>Qty: ${p.qty} · ${p.fabric}</span>
        </div>
        <strong>${money(p.price * p.qty)}</strong>
      </div>
    `).join('');
  }

  if (document.querySelector('#chkSubtotal')) document.querySelector('#chkSubtotal').textContent = money(totalAmount);
  if (document.querySelector('#chkTotal')) document.querySelector('#chkTotal').textContent = money(totalAmount);
  if (document.querySelector('#btnPayAmount')) document.querySelector('#btnPayAmount').textContent = money(totalAmount);

  closeCart();
  document.querySelector('#overlay')?.classList.add('visible');
  document.querySelector('#checkoutModal')?.classList.add('open');
  document.body.classList.add('locked');
}

async function handleRazorpayPayment(e) {
  e.preventDefault();

  const name = document.querySelector('#chkName')?.value.trim();
  const phone = document.querySelector('#chkPhone')?.value.trim();
  const email = document.querySelector('#chkEmail')?.value.trim();
  const address = document.querySelector('#chkAddress')?.value.trim();
  const city = document.querySelector('#chkCity')?.value.trim();
  const pincode = document.querySelector('#chkPincode')?.value.trim();

  if (!name || !phone || !email || !address || !city || !pincode) {
    toast('Please fill in all shipping details');
    return;
  }

  const items = cart.map(i => ({ ...products.find(p => p.id === i.id), qty: i.qty })).filter(Boolean);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const payBtn = document.querySelector('#payWithRazorpayBtn');
  const originalBtnHtml = payBtn ? payBtn.innerHTML : '';

  try {
    if (payBtn) {
      payBtn.disabled = true;
      payBtn.innerHTML = `<span>Connecting to Razorpay...</span>`;
    }

    // Step 1: Create Order on Backend Server
    const orderRes = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalAmount,
        notes: {
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          items_count: items.length
        }
      })
    });

    if (!orderRes.ok) {
      const errData = await orderRes.json().catch(() => ({}));
      throw new Error(errData.error || 'Could not initiate Razorpay order');
    }

    const orderData = await orderRes.json();
    await ensureRazorpayScript();

    if (!window.Razorpay) {
      throw new Error('Razorpay checkout SDK could not be loaded. Please check your internet connection.');
    }

    // Step 2: Open Razorpay Payment Window (UPI, Cards, Netbanking, Wallets)
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'KADHA Atelier',
      description: `${items.length} Handloom Drape${items.length > 1 ? 's' : ''}`,
      image: 'assets/BRAND IDENTITY.png',
      order_id: orderData.orderId,
      prefill: {
        name: name,
        email: email,
        contact: phone
      },
      notes: {
        delivery_address: `${address}, ${city} - ${pincode}`
      },
      theme: {
        color: '#08765a'
      },
      modal: {
        ondismiss: function() {
          toast('Payment process was interrupted. Your bag is still saved.');
          if (payBtn) {
            payBtn.disabled = false;
            payBtn.innerHTML = originalBtnHtml;
          }
        }
      },
      handler: async function (response) {
        // Step 3: Verify Payment Signature via Backend
        try {
          if (payBtn) payBtn.innerHTML = `<span>Verifying payment...</span>`;

          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              customer_name: name,
              customer_email: email,
              customer_phone: phone,
              delivery_address: `${address}, ${city} - ${pincode}`,
              product_name: items.map(p => `${p.name} (x${p.qty})`).join(', '),
              img: items[0]?.img || 'Beige Ikat Mulmul Saree.png',
              amount: totalAmount
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            // Clear cart upon successful payment
            cart = [];
            saveCart();
            closeModals();

            // Populate Success Modal
            const sId = document.querySelector('#successOrderId');
            const sPay = document.querySelector('#successPaymentId');
            const sAmt = document.querySelector('#successAmount');
            const sCust = document.querySelector('#successCustomer');
            if (sId) sId.textContent = verifyData.orderId || '#KD-NEW';
            if (sPay) sPay.textContent = verifyData.paymentId;
            if (sAmt) sAmt.textContent = money(totalAmount);
            if (sCust) sCust.textContent = name;

            document.querySelector('#overlay')?.classList.add('visible');
            document.querySelector('#orderSuccessModal')?.classList.add('open');
            document.body.classList.add('locked');
            toast('Payment verified! Your order has been placed.');
          } else {
            toast('Payment verification failed: ' + (verifyData.error || 'Please contact support'));
          }
        } catch (err) {
          toast('Network error during verification. Your order details are saved.');
        } finally {
          if (payBtn) {
            payBtn.disabled = false;
            payBtn.innerHTML = originalBtnHtml;
          }
        }
      }
    };

    const rzpInstance = new window.Razorpay(options);
    rzpInstance.open();

  } catch (err) {
    console.error('Razorpay checkout error:', err);
    toast(err.message || 'Payment initiation failed. Please try again.');
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.innerHTML = originalBtnHtml;
    }
  }
}

renderProducts();renderCart();fetchProductsFromBackend();initHeroCardMotion();initAccountPage();ensureRazorpayScript();ensureCheckoutModals();
