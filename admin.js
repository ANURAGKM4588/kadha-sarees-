/* ==============================================================================
   KADHA STORE ADMINISTRATION - LOGIC & CONTROLLER
   ============================================================================== */

(function () {
  'use strict';

  // State
  let state = {
    activeTab: 'products', // Default to products so the Product Adding Section is instantly visible!
    orderFilter: 'all',
    orderSearch: '',
    productSearch: '',
    customerSearch: '',
    orders: [],
    products: [],
    customers: []
  };

  // Currency Formatter
  const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(n) || 0);

  // Toast Notification
  function showToast(msg) {
    const toast = document.getElementById('adminToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // ============================================================================
  // TAB NAVIGATION (Sidebar & Top Horizontal Tabs Synchronized)
  // ============================================================================
  const tabTitles = {
    products: { title: 'Product Adding & Catalogue', sub: 'Publish new authentic handloom sarees and manage store availability' },
    orders: { title: 'Orders & Payments', sub: 'Track customer orders, contact info, and payment confirmation status' },
    customers: { title: 'Customer & Patron Directory', sub: 'Verified customer phone numbers, delivery destinations, and order history' }
  };

  function switchTab(tabKey) {
    if (!tabKey || !tabTitles[tabKey]) return;
    state.activeTab = tabKey;

    // Sync sidebar items
    document.querySelectorAll('.nav-item[data-tab]').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabKey);
    });

    // Sync top horizontal tabs
    document.querySelectorAll('.top-tab[data-tab]').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabKey);
    });

    // Show corresponding tab pane
    document.querySelectorAll('.tab-pane').forEach((pane) => pane.classList.remove('active'));
    const paneId = tabKey === 'products' ? 'paneProducts' : tabKey === 'orders' ? 'paneOrders' : 'paneCustomers';
    const activePane = document.getElementById(paneId);
    if (activePane) activePane.classList.add('active');

    // Update titles in topbar
    const titleEl = document.getElementById('pageTitle');
    const subEl = document.getElementById('pageSubtitle');
    if (titleEl) titleEl.textContent = tabTitles[tabKey].title;
    if (subEl) subEl.textContent = tabTitles[tabKey].sub;

    // Update hash silently
    if (window.location.hash !== `#${tabKey}`) {
      history.replaceState(null, null, `#${tabKey}`);
    }
  }

  function focusAddProduct() {
    switchTab('products');
    const section = document.getElementById('addProductSection');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      section.classList.remove('highlight-pulse');
      void section.offsetWidth; // retrigger animation
      section.classList.add('highlight-pulse');
    }
    const nameInput = document.getElementById('prodName');
    if (nameInput) {
      setTimeout(() => nameInput.focus(), 250);
    }
  }

  function initTabs() {
    // Sidebar nav click
    document.querySelectorAll('.nav-item[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchTab(btn.getAttribute('data-tab'));
      });
    });

    // Top horizontal tabs click
    document.querySelectorAll('.top-tab[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchTab(btn.getAttribute('data-tab'));
      });
    });

    // Add Product shortcut buttons
    const topbarAddBtn = document.getElementById('topbarAddProductBtn');
    const sidebarAddBtn = document.getElementById('sidebarAddProductBtn');
    if (topbarAddBtn) topbarAddBtn.addEventListener('click', focusAddProduct);
    if (sidebarAddBtn) sidebarAddBtn.addEventListener('click', focusAddProduct);

    // Initial tab from hash or default to products
    const initialHash = window.location.hash.replace('#', '').trim();
    if (initialHash === 'orders' || initialHash === 'products' || initialHash === 'customers') {
      switchTab(initialHash);
    } else {
      switchTab('products'); // Default to products view so Product Adding is instantly seen!
    }
  }

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) state.orders = data;
      }
    } catch (e) {
      console.warn('Orders fetch error, using local fallback:', e);
    }
    renderKPIs();
    renderOrders();
  }

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) state.products = data;
      }
    } catch (e) {
      console.warn('Products fetch error:', e);
    }
    renderKPIs();
    renderProducts();
  }

  async function fetchCustomers() {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) state.customers = data;
      }
    } catch (e) {
      console.warn('Customers fetch error:', e);
    }
    renderCustomers();
  }

  // ============================================================================
  // KPI METRICS CALCULATION
  // ============================================================================
  function renderKPIs() {
    let completedCount = 0;
    let failedCount = 0;
    let pendingCount = 0;
    let totalRevenue = 0;

    state.orders.forEach((o) => {
      const pStatus = (o.payment_status || (o.status === 'Paid' || o.status === 'Shipped' || o.status === 'Delivered' ? 'Completed' : (o.status === 'Failed' ? 'Failed' : 'Pending'))).toLowerCase();
      if (pStatus === 'completed') {
        completedCount++;
        totalRevenue += Number(o.amount) || 0;
      } else if (pStatus === 'failed') {
        failedCount++;
      } else {
        pendingCount++;
      }
    });

    const revEl = document.getElementById('kpiRevenue');
    const compEl = document.getElementById('kpiCompletedOrders');
    const failEl = document.getElementById('kpiFailedOrders');
    const prodEl = document.getElementById('kpiTotalProducts');

    if (revEl) revEl.textContent = formatINR(totalRevenue);
    if (compEl) compEl.textContent = completedCount;
    if (failEl) failEl.textContent = failedCount;
    if (prodEl) prodEl.textContent = state.products.length;

    // Sidebar counts
    const sOrdCount = document.getElementById('sidebarOrderCount');
    const sProdCount = document.getElementById('sidebarProductCount');
    const sCustCount = document.getElementById('sidebarCustomerCount');
    if (sOrdCount) sOrdCount.textContent = state.orders.length;
    if (sProdCount) sProdCount.textContent = state.products.length;
    if (sCustCount) sCustCount.textContent = state.customers.length || state.orders.length;

    // Top horizontal tabs count pills
    const tProdCount = document.getElementById('topProductCount');
    const tOrdCount = document.getElementById('topOrderCount');
    const tCustCount = document.getElementById('topCustomerCount');
    if (tProdCount) tProdCount.textContent = state.products.length;
    if (tOrdCount) tOrdCount.textContent = state.orders.length;
    if (tCustCount) tCustCount.textContent = state.customers.length || state.orders.length;

    // Filter pill count badges
    const cAll = document.getElementById('countAll');
    const cPaid = document.getElementById('countPaid');
    const cFail = document.getElementById('countFailed');
    const cPend = document.getElementById('countPending');
    if (cAll) cAll.textContent = state.orders.length;
    if (cPaid) cPaid.textContent = completedCount;
    if (cFail) cFail.textContent = failedCount;
    if (cPend) cPend.textContent = pendingCount;
  }

  // ============================================================================
  // TAB: ADD & MANAGE PRODUCTS (Live publisher & catalogue)
  // ============================================================================
  function renderProducts() {
    const tbody = document.getElementById('productsTbody');
    const catCount = document.getElementById('catalogueCount');
    if (!tbody) return;

    if (catCount) catCount.textContent = state.products.length;

    const query = state.productSearch.toLowerCase().trim();
    const filtered = state.products.filter((p) => {
      if (!query) return true;
      const haystack = `${p.name} ${p.category} ${p.fabric} ${p.color} ${p.badge}`.toLowerCase();
      return haystack.includes(query);
    });

    tbody.innerHTML = filtered.map((p) => {
      const discountText = p.discount ? `-${p.discount}% OFF` : '—';
      const priceText = formatINR(p.price);
      const wasText = p.was ? formatINR(p.was) : '';

      return `
        <tr>
          <td>
            <div class="product-cell">
              <img class="product-thumb" src="assets/${p.img}" alt="${p.name}">
            </div>
          </td>
          <td>
            <div style="display:flex;flex-direction:column">
              <strong style="font-size:13.5px;color:var(--deep)">${p.name}</strong>
              <small style="color:var(--emerald);font-weight:700;letter-spacing:0.04em">${p.category || 'Handloom'}</small>
            </div>
          </td>
          <td>
            <div style="font-size:13px">
              <span>${p.fabric || 'Pure Handloom'}</span>
              <span style="color:var(--muted);display:block;font-size:11.5px">${p.color || 'Artisan tone'}</span>
            </div>
          </td>
          <td>
            <div>
              <strong style="font-size:14px;color:var(--deep)">${priceText}</strong>
              ${wasText ? `<small style="display:block;text-decoration:line-through;color:var(--muted);font-size:11px">${wasText}</small>` : ''}
            </div>
          </td>
          <td>
            <span style="font-family:'Manrope',sans-serif;font-weight:700;color:#c53030;font-size:12px">${discountText}</span>
          </td>
          <td>
            <span class="badge-status" style="background:var(--surface-alt);color:var(--deep);border:1px solid var(--border)">
              ${p.badge || 'Handloom'}
            </span>
          </td>
          <td>
            <div style="display:flex;gap:8px">
              <a href="product.html?id=${p.id}" target="_blank" class="btn-action-sm">
                View
              </a>
              <button class="btn-delete-sm" data-delete-id="${p.id}" title="Remove from store">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach delete listeners
    tbody.querySelectorAll('.btn-delete-sm').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const prodId = btn.getAttribute('data-delete-id');
        const prod = state.products.find((x) => x.id === prodId);
        if (!confirm(`Are you sure you want to remove "${prod?.name || prodId}" from the live store?`)) {
          return;
        }

        try {
          await fetch(`/api/products/${prodId}`, { method: 'DELETE' });
        } catch (e) {}

        state.products = state.products.filter((x) => x.id !== prodId);
        renderKPIs();
        renderProducts();
        showToast(`Removed "${prod?.name || 'Saree'}" from catalogue`);
      });
    });
  }

  function initAddProductForm() {
    const form = document.getElementById('addProductForm');
    const imgSelect = document.getElementById('prodImgSelect');
    const imgPreview = document.getElementById('formImgPreview');
    const badgeSelect = document.getElementById('prodBadge');
    const previewTag = document.getElementById('previewBadgeTag');

    if (imgSelect && imgPreview) {
      imgSelect.addEventListener('change', () => {
        imgPreview.src = `assets/${imgSelect.value}`;
      });
    }

    if (badgeSelect && previewTag) {
      badgeSelect.addEventListener('change', () => {
        previewTag.textContent = badgeSelect.value.toUpperCase();
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('prodName')?.value.trim();
        const category = document.getElementById('prodCategory')?.value;
        const fabric = document.getElementById('prodFabric')?.value.trim();
        const color = document.getElementById('prodColor')?.value.trim();
        const badge = document.getElementById('prodBadge')?.value;
        const price = Number(document.getElementById('prodPrice')?.value);
        const was = Number(document.getElementById('prodWas')?.value) || Math.round(price * 1.18);
        const desc = document.getElementById('prodDesc')?.value.trim();
        const img = document.getElementById('prodImgSelect')?.value;

        if (!name || !price) {
          showToast('Please provide saree name and price');
          return;
        }

        const newSaree = {
          name,
          category,
          fabric,
          color,
          badge,
          price,
          was,
          description: desc,
          img
        };

        const submitBtn = document.getElementById('submitProductBtn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Publishing to store...</span>';
        }

        try {
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSaree)
          });

          if (res.ok) {
            const created = await res.json();
            state.products.unshift(created);
          } else {
            // Local fallback
            newSaree.id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(100 + Math.random() * 900);
            state.products.unshift(newSaree);
          }

          renderKPIs();
          renderProducts();
          showToast(`Published "${name}" to store catalogue!`);
          form.reset();
          if (imgPreview) imgPreview.src = `assets/${imgSelect.value}`;
        } catch (err) {
          console.error('Error submitting product:', err);
          showToast('Could not reach backend, added to local view');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>＋ Publish Saree to Store</span>';
          }
        }
      });
    }
  }

  // ============================================================================
  // TAB: ORDERS & PAYMENTS
  // ============================================================================
  function renderOrders() {
    const tbody = document.getElementById('ordersTbody');
    const emptyState = document.getElementById('ordersEmptyState');
    if (!tbody) return;

    const query = state.orderSearch.toLowerCase().trim();
    const filter = state.orderFilter;

    const filtered = state.orders.filter((o) => {
      const pStatus = o.payment_status || (o.status === 'Paid' || o.status === 'Shipped' || o.status === 'Delivered' ? 'Completed' : (o.status === 'Failed' ? 'Failed' : 'Pending'));
      
      // Filter matching
      if (filter !== 'all' && pStatus.toLowerCase() !== filter.toLowerCase()) {
        return false;
      }

      // Search matching
      if (!query) return true;
      const haystack = `${o.id} ${o.name || o.customer_name} ${o.email || o.customer_email} ${o.phone || o.customer_phone} ${o.product || o.product_name} ${o.address || o.delivery_address}`.toLowerCase();
      return haystack.includes(query);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map((o) => {
      const name = o.name || o.customer_name || 'Patron';
      const email = o.email || o.customer_email || '—';
      const phone = o.phone || o.customer_phone || '+91 98000 00000';
      const address = o.address || o.delivery_address || 'Address provided at checkout';
      const initials = o.initials || name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
      const product = o.product || o.product_name || 'Handloom Saree';
      const img = o.img || 'Beige Ikat Mulmul Saree.png';
      const amount = formatINR(o.amount);
      const date = o.date || 'Recent';
      const pStatus = o.payment_status || (o.status === 'Paid' || o.status === 'Shipped' || o.status === 'Delivered' ? 'Completed' : (o.status === 'Failed' ? 'Failed' : 'Pending'));
      const statusClass = pStatus.toLowerCase();
      const fulfillment = o.status || 'Processing';

      // Status Badge Markup
      let statusIcon = '✓';
      if (statusClass === 'failed') statusIcon = '✕';
      if (statusClass === 'pending') statusIcon = '⏳';

      return `
        <tr>
          <td><strong style="font-family:monospace;font-size:13px">${o.id}</strong></td>
          <td>
            <div class="customer-cell">
              <span class="customer-avatar">${initials}</span>
              <div class="customer-info-box">
                <span class="customer-name">${name}</span>
                <span class="customer-meta">${phone}</span>
                <span class="customer-meta" style="color:var(--muted)">${email}</span>
              </div>
            </div>
          </td>
          <td>
            <div class="address-cell" title="${address}">
              ${address}
            </div>
          </td>
          <td>
            <div class="product-cell">
              <img class="product-thumb" src="assets/${img}" alt="${product}">
              <span class="product-cell-name">${product}</span>
            </div>
          </td>
          <td style="color:var(--ink-secondary);font-size:13px">${date}</td>
          <td><span class="amount-val">${amount}</span></td>
          <td>
            <span class="badge-status ${statusClass}">
              <span>${statusIcon}</span>
              <span>Payment ${pStatus}</span>
            </span>
          </td>
          <td>
            <select class="fulfillment-select" data-order-id="${o.id}">
              <option value="Processing" ${fulfillment === 'Processing' ? 'selected' : ''}>Processing</option>
              <option value="Shipped" ${fulfillment === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" ${fulfillment === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${fulfillment === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>
            <button class="btn-action-sm view-order-btn" data-order-id="${o.id}">
              View
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach fulfillment change listener
    tbody.querySelectorAll('.fulfillment-select').forEach((sel) => {
      sel.addEventListener('change', async (e) => {
        const orderId = sel.getAttribute('data-order-id');
        const newStatus = sel.value;
        const ord = state.orders.find((x) => x.id === orderId);
        if (ord) ord.status = newStatus;

        try {
          await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          showToast(`Order ${orderId} marked as ${newStatus}`);
        } catch (err) {
          showToast(`Status updated locally to ${newStatus}`);
        }
      });
    });

    // Attach View Order modal listener
    tbody.querySelectorAll('.view-order-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-order-id');
        const ord = state.orders.find((x) => x.id === orderId);
        if (ord) openOrderModal(ord);
      });
    });
  }

  // Order Detail Modal
  function openOrderModal(ord) {
    const backdrop = document.getElementById('orderModalBackdrop');
    const modalId = document.getElementById('modalOrderId');
    const content = document.getElementById('modalOrderContent');
    if (!backdrop || !content) return;

    const name = ord.name || ord.customer_name || 'Valued Patron';
    const email = ord.email || ord.customer_email || '—';
    const phone = ord.phone || ord.customer_phone || '+91 98000 00000';
    const address = ord.address || ord.delivery_address || 'Address provided at checkout';
    const product = ord.product || ord.product_name || 'Handloom Saree';
    const img = ord.img || 'Beige Ikat Mulmul Saree.png';
    const amount = formatINR(ord.amount);
    const date = ord.date || 'Recent';
    const pStatus = ord.payment_status || (ord.status === 'Paid' || ord.status === 'Shipped' || ord.status === 'Delivered' ? 'Completed' : (ord.status === 'Failed' ? 'Failed' : 'Pending'));
    const statusClass = pStatus.toLowerCase();
    const pId = ord.payment_id || 'pay_RAZORPAY_DEMO';

    modalId.textContent = `Order ${ord.id}`;
    content.innerHTML = `
      <div class="modal-section">
        <span class="modal-sec-title">Payment Outcome</span>
        <div class="modal-info-card">
          <div class="modal-info-row">
            <span>Payment Status:</span>
            <span class="badge-status ${statusClass}">Payment ${pStatus}</span>
          </div>
          <div class="modal-info-row">
            <span>Transaction / Razorpay ID:</span>
            <code style="font-size:12px">${pId}</code>
          </div>
          ${
            ord.failure_reason
              ? `<div class="modal-info-row" style="color:#c53030">
                  <span>Failure Reason:</span>
                  <strong>${ord.failure_reason}</strong>
                </div>`
              : ''
          }
          <div class="modal-info-row">
            <span>Amount:</span>
            <strong style="font-size:16px;color:var(--deep)">${amount}</strong>
          </div>
          <div class="modal-info-row">
            <span>Order Date:</span>
            <span>${date}</span>
          </div>
        </div>
      </div>

      <div class="modal-section">
        <span class="modal-sec-title">Customer Contact & Delivery Destination</span>
        <div class="modal-info-card">
          <div class="modal-info-row">
            <span>Patron Name:</span>
            <strong>${name}</strong>
          </div>
          <div class="modal-info-row">
            <span>Phone Number:</span>
            <a href="tel:${phone}" style="color:var(--emerald);font-weight:700">${phone}</a>
          </div>
          <div class="modal-info-row">
            <span>Email Address:</span>
            <a href="mailto:${email}" style="color:var(--emerald)">${email}</a>
          </div>
          <div style="border-top:1px solid var(--border);padding-top:8px;margin-top:4px">
            <span style="font-size:12px;color:var(--muted);display:block;margin-bottom:3px">Full Delivery Address:</span>
            <p style="font-size:13.5px;line-height:1.45;color:var(--deep)">${address}</p>
          </div>
        </div>
      </div>

      <div class="modal-section">
        <span class="modal-sec-title">Ordered Item</span>
        <div class="modal-info-card" style="flex-direction:row;align-items:center;gap:14px">
          <img src="assets/${img}" alt="" style="width:54px;height:54px;border-radius:10px;object-fit:cover">
          <div>
            <strong style="display:block;font-size:14px">${product}</strong>
            <span style="font-size:12px;color:var(--muted)">100% Genuine Handloom Authenticated</span>
          </div>
        </div>
      </div>
    `;

    backdrop.classList.add('open');
  }

  // ============================================================================
  // TAB: CUSTOMER DATA DIRECTORY
  // ============================================================================
  function renderCustomers() {
    const tbody = document.getElementById('customersTbody');
    const emptyState = document.getElementById('customersEmptyState');
    if (!tbody) return;

    let list = state.customers;
    if (!list || list.length === 0) {
      const map = new Map();
      state.orders.forEach((o) => {
        const email = (o.email || o.customer_email || '').toLowerCase().trim();
        if (!email) return;
        const name = o.name || o.customer_name || 'Valued Patron';
        const phone = o.phone || o.customer_phone || '—';
        const address = o.address || o.delivery_address || '—';
        const amount = Number(o.amount) || 0;
        const pStatus = (o.payment_status || (o.status === 'Paid' || o.status === 'Shipped' || o.status === 'Delivered' ? 'Completed' : (o.status === 'Failed' ? 'Failed' : 'Pending'))).toLowerCase();

        if (!map.has(email)) {
          map.set(email, {
            name,
            email,
            phone,
            address,
            initials: name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
            totalOrders: 1,
            totalSpent: pStatus === 'completed' ? amount : 0,
            lastOrderDate: o.date || 'Recent',
            hasFailedPayment: pStatus === 'failed'
          });
        } else {
          const ex = map.get(email);
          ex.totalOrders += 1;
          if (pStatus === 'completed') ex.totalSpent += amount;
          if (pStatus === 'failed') ex.hasFailedPayment = true;
          if (phone !== '—') ex.phone = phone;
          if (address !== '—') ex.address = address;
        }
      });
      list = Array.from(map.values());
    }

    const query = state.customerSearch.toLowerCase().trim();
    const filtered = list.filter((c) => {
      if (!query) return true;
      const haystack = `${c.name} ${c.email} ${c.phone} ${c.address}`.toLowerCase();
      return haystack.includes(query);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map((c) => {
      const initials = c.initials || c.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
      const phone = c.phone || '—';
      const address = c.address || '—';
      const totalSpent = formatINR(c.totalSpent);
      const reliability = c.hasFailedPayment
        ? `<span class="badge-status failed" style="font-size:11px">Has Failed Attempts</span>`
        : `<span class="badge-status completed" style="font-size:11px">100% Verified</span>`;

      return `
        <tr>
          <td>
            <div class="customer-cell">
              <span class="customer-avatar">${initials}</span>
              <div>
                <strong class="customer-name">${c.name}</strong>
                <small style="display:block;color:var(--muted);font-size:11px">Verified Patron</small>
              </div>
            </div>
          </td>
          <td>
            <div style="display:flex;flex-direction:column;gap:2px">
              <a href="tel:${phone}" style="font-weight:700;color:var(--emerald);font-size:13px">${phone}</a>
              <a href="mailto:${c.email}" style="color:var(--muted);font-size:12px">${c.email}</a>
            </div>
          </td>
          <td>
            <div class="address-cell" title="${address}">
              ${address}
            </div>
          </td>
          <td>
            <strong style="font-size:14px;color:var(--deep)">${c.totalOrders} ${c.totalOrders === 1 ? 'Order' : 'Orders'}</strong>
          </td>
          <td>
            <strong style="font-size:14px;color:var(--deep)">${totalSpent}</strong>
          </td>
          <td style="color:var(--ink-secondary);font-size:13px">
            ${c.lastOrderDate || 'Recent'}
          </td>
          <td>
            ${reliability}
          </td>
        </tr>
      `;
    }).join('');
  }

  // ============================================================================
  // EVENT LISTENERS & SEARCH
  // ============================================================================
  function initListeners() {
    // Quick filter pills for orders
    document.querySelectorAll('.filter-pills .pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-pills .pill').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.orderFilter = btn.getAttribute('data-filter') || 'all';
        renderOrders();
      });
    });

    // Order search
    const ordSearch = document.getElementById('orderSearchInput');
    if (ordSearch) {
      ordSearch.addEventListener('input', (e) => {
        state.orderSearch = e.target.value;
        renderOrders();
      });
    }

    // Product search
    const prodSearch = document.getElementById('productSearchInput');
    if (prodSearch) {
      prodSearch.addEventListener('input', (e) => {
        state.productSearch = e.target.value;
        renderProducts();
      });
    }

    // Customer search
    const custSearch = document.getElementById('customerSearchInput');
    if (custSearch) {
      custSearch.addEventListener('input', (e) => {
        state.customerSearch = e.target.value;
        renderCustomers();
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        showToast('Refreshing data from server...');
        await Promise.all([fetchOrders(), fetchProducts(), fetchCustomers()]);
        showToast('Data updated');
      });
    }

    // Modal close
    const modalClose = document.getElementById('orderModalClose');
    const modalBackdrop = document.getElementById('orderModalBackdrop');
    if (modalClose && modalBackdrop) {
      modalClose.addEventListener('click', () => modalBackdrop.classList.remove('open'));
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) modalBackdrop.classList.remove('open');
      });
    }

    // Dark theme toggle
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      if (localStorage.getItem('kadha-theme') === 'dark') {
        document.body.classList.add('dark');
      }
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('kadha-theme', isDark ? 'dark' : 'light');
        showToast(`Theme switched to ${isDark ? 'Dark' : 'Light'}`);
      });
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  initTabs();
  initAddProductForm();
  initListeners();

  // Load initial data
  fetchProducts();
  fetchOrders();
  fetchCustomers();
})();
