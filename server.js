const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load private environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Check backend configuration
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[WARNING] SUPABASE_URL or SUPABASE_KEY is missing from .env');
}
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn('[WARNING] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from .env');
}

// Initialize Supabase Client on Backend Server ONLY
const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// Middleware
app.use(cors());
app.use(express.json());

// Default fallback catalogue
const defaultProducts = [
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

const defaultOrders = [
  {
    id: '#KD-2841',
    customer_name: 'Aarushi Mehta',
    customer_email: 'aarushi.m@email.com',
    customer_phone: '+91 98201 44521',
    delivery_address: 'Flat 402, Sea Green Apts, Worli, Mumbai - 400018',
    initials: 'AM',
    product_name: 'Beige Ikat Mulmul Saree',
    img: 'Beige Ikat Mulmul Saree.png',
    date: 'Nov 12, 2026',
    amount: 2999,
    status: 'Processing',
    payment_status: 'Completed',
    payment_id: 'pay_Pq781xM9sA'
  },
  {
    id: '#KD-2840',
    customer_name: 'Maya Krishnan',
    customer_email: 'maya.k@email.com',
    customer_phone: '+91 94440 18273',
    delivery_address: '14/2 Karpagam Gardens, Adyar, Chennai - 600020',
    initials: 'MK',
    product_name: 'Bottle Green Narayani Pattu',
    img: 'Bottle Green Narayani Pattu.png',
    date: 'Nov 12, 2026',
    amount: 6499,
    status: 'Shipped',
    payment_status: 'Completed',
    payment_id: 'pay_Pq692mN2bZ',
    courier: 'Blue Dart Express',
    awb_tracking: 'BD88219401'
  },
  {
    id: '#KD-2839',
    customer_name: 'Devika Rao',
    customer_email: 'devika.r@email.com',
    customer_phone: '+91 98800 31245',
    delivery_address: '77 Defence Colony, Indiranagar, Bengaluru - 560038',
    initials: 'DR',
    product_name: 'Mustard Sungudi Cotton Saree',
    img: 'Mustard Yellow Sungudi Cotton Saree.png',
    date: 'Nov 11, 2026',
    amount: 2799,
    status: 'Delivered',
    payment_status: 'Completed',
    payment_id: 'pay_Pq511kL0xY'
  },
  {
    id: '#KD-2838',
    customer_name: 'Nandita Shah',
    customer_email: 'nandita.s@email.com',
    customer_phone: '+91 98250 88219',
    delivery_address: 'B-12 Gulmohar Park, Satellite, Ahmedabad - 380015',
    initials: 'NS',
    product_name: 'Magenta Narayani Pattu',
    img: 'Magenta Narayani Pattu.png',
    date: 'Nov 11, 2026',
    amount: 6999,
    status: 'Failed',
    payment_status: 'Failed',
    failure_reason: 'Bank server timeout during OTP verification',
    payment_id: 'pay_FAILED_981'
  },
  {
    id: '#KD-2837',
    customer_name: 'Priya Menon',
    customer_email: 'priya.m@email.com',
    customer_phone: '+91 97455 60192',
    delivery_address: 'Rose Villa, Jawahar Nagar, Kochi - 682020',
    initials: 'PM',
    product_name: 'Yellow Teal Mulmul Cotton Saree',
    img: 'Yellow Teal Mulmul Cotton Saree.png',
    date: 'Nov 10, 2026',
    amount: 3399,
    status: 'Shipped',
    payment_status: 'Completed',
    payment_id: 'pay_Pq341aK9jT',
    courier: 'Delhivery Surface',
    awb_tracking: 'DEL77319042'
  },
  {
    id: '#KD-2836',
    customer_name: 'Kavita Sundaram',
    customer_email: 'kavita.s@email.com',
    customer_phone: '+91 98401 77334',
    delivery_address: '22 Jubilee Hills, Road 36, Hyderabad - 500033',
    initials: 'KS',
    product_name: 'Maroon Narayani Pattu',
    img: 'Maroon Narayani Pattu.png',
    date: 'Nov 09, 2026',
    amount: 6799,
    status: 'Pending',
    payment_status: 'Pending',
    failure_reason: 'Awaiting UPI authentication from user bank app',
    payment_id: 'pay_PEND_441'
  }
];

// ==============================================================================
// BACKEND API ENDPOINTS (Keys never exposed to client)
// ==============================================================================

// Health status
app.get('/api/health', async (req, res) => {
  let supabaseConnected = false;
  let errorMsg = null;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      if (!error) supabaseConnected = true;
      else errorMsg = error.message;
    } catch (e) {
      errorMsg = e.message;
    }
  }
  res.json({
    status: 'ok',
    server: 'Kadha Backend Server',
    supabaseConnected,
    supabaseConfigured: Boolean(supabase),
    razorpayConfigured: Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
    error: errorMsg
  });
});

// Products: GET
app.get('/api/products', async (req, res) => {
  if (!supabase) return res.json(defaultProducts);
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      return res.json(defaultProducts);
    }
    res.json(data);
  } catch (err) {
    res.json(defaultProducts);
  }
});

// Products: POST (Add new saree product with luxury fashion attributes)
app.post('/api/products', async (req, res) => {
  try {
    const { name, fabric, category, color, description, price, was, discount, badge, img, stock_type, blouse_piece, care } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Saree name and price are required' });
    }
    const cleanId = (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'saree') + '-' + Math.floor(100 + Math.random() * 900);
    const parsedPrice = Number(price);
    const parsedWas = Number(was) || Math.round(parsedPrice * 1.18);
    const parsedDiscount = Number(discount) || Math.round(((parsedWas - parsedPrice) / parsedWas) * 100);

    const newProduct = {
      id: cleanId,
      name,
      fabric: fabric || category || 'Handloom Silk',
      category: category || 'Narayani',
      color: color || 'Heritage Color',
      description: description || 'Artisanal handwoven saree shaped on authentic traditional pit looms.',
      price: parsedPrice,
      was: parsedWas,
      discount: parsedDiscount > 0 ? parsedDiscount : 10,
      badge: badge || 'Handloom',
      img: img || 'Beige Ikat Mulmul Saree.png',
      stock_type: stock_type || '1 of 1 (Exclusive)',
      blouse_piece: blouse_piece || 'Running 0.8m Included',
      care: care || 'Dry Clean Recommended'
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').insert([newProduct]).select();
        if (!error && data) {
          defaultProducts.unshift(newProduct);
          return res.status(201).json(data[0]);
        }
      } catch (err) {
        console.error('Supabase product insert error:', err);
      }
    }

    defaultProducts.unshift(newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Products: DELETE (Remove product)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase product delete error:', err);
      }
    }
    const idx = defaultProducts.findIndex(p => p.id === id);
    if (idx !== -1) defaultProducts.splice(idx, 1);
    res.json({ success: true, message: 'Product removed from catalogue', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Orders: GET
app.get('/api/orders', async (req, res) => {
  if (!supabase) return res.json(defaultOrders);
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      return res.json(defaultOrders);
    }
    const formatted = data.map(o => ({
      id: o.id,
      name: o.customer_name || o.name || 'Patron',
      email: o.customer_email || o.email || 'patron@example.com',
      phone: o.customer_phone || o.phone || '+91 98000 00000',
      address: o.delivery_address || o.address || 'Address on file',
      initials: o.initials || (o.customer_name ? o.customer_name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'KD'),
      product: o.product_name || o.product || 'Handloom Saree',
      img: o.img || 'Beige Ikat Mulmul Saree.png',
      date: o.date || new Date(o.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: o.amount || 0,
      status: o.status || 'Processing',
      payment_status: o.payment_status || (o.status === 'Paid' || o.status === 'Shipped' || o.status === 'Delivered' ? 'Completed' : (o.status === 'Failed' ? 'Failed' : 'Pending')),
      failure_reason: o.failure_reason || '',
      courier: o.courier || '',
      awb_tracking: o.awb_tracking || ''
    }));
    res.json(formatted);
  } catch (err) {
    res.json(defaultOrders);
  }
});

// Orders: PATCH (Update order fulfillment, tracking or payment status)
app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status, courier, awb_tracking } = req.body;
    if (supabase) {
      try {
        const updateObj = {};
        if (status) updateObj.status = status;
        if (payment_status) updateObj.payment_status = payment_status;
        if (courier !== undefined) updateObj.courier = courier;
        if (awb_tracking !== undefined) updateObj.awb_tracking = awb_tracking;
        await supabase.from('orders').update(updateObj).eq('id', id);
      } catch (err) {
        console.error('Supabase order update error:', err);
      }
    }
    const order = defaultOrders.find(o => o.id === id);
    if (order) {
      if (status) order.status = status;
      if (payment_status) order.payment_status = payment_status;
      if (courier !== undefined) order.courier = courier;
      if (awb_tracking !== undefined) order.awb_tracking = awb_tracking;
    }
    res.json({ success: true, message: 'Order status updated', id, status, payment_status, courier, awb_tracking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Bookings: GET (Drape consultations for clienteling)
app.get('/api/bookings', async (req, res) => {
  const defaultBookings = [
    { id: 1, name: 'Ananya Deshmukh', email: 'ananya.d@gmail.com', phone: '+91 98202 55102', interest: 'Maroon Narayani Pattu - Bridal drape styling', time_slot: 'Nov 14, 2026 at 4:00 PM', status: 'Confirmed' },
    { id: 2, name: 'Sneha Nambiar', email: 'sneha.n@outlook.com', phone: '+91 97401 12903', interest: 'Mulmul Cotton Sarees - Everyday drape selection', time_slot: 'Nov 15, 2026 at 11:30 AM', status: 'Pending' }
  ];
  if (supabase) {
    try {
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length) return res.json(data);
    } catch (e) {}
  }
  res.json(defaultBookings);
});

// Customers: GET (Aggregated directory of patrons with order counts and spent totals)
app.get('/api/customers', async (req, res) => {
  let ordersList = defaultOrders;
  if (supabase) {
    try {
      const { data } = await supabase.from('orders').select('*');
      if (data && data.length) ordersList = data;
    } catch (e) {}
  }

  const map = new Map();
  ordersList.forEach(o => {
    const email = (o.customer_email || o.email || '').toLowerCase().trim();
    if (!email) return;
    const name = o.customer_name || o.name || 'Valued Patron';
    const phone = o.customer_phone || o.phone || '—';
    const address = o.delivery_address || o.address || '—';
    const amount = Number(o.amount) || 0;
    const pStatus = o.payment_status || (o.status === 'Paid' || o.status === 'Shipped' || o.status === 'Delivered' ? 'Completed' : (o.status === 'Failed' ? 'Failed' : 'Pending'));
    const isCompleted = (pStatus === 'Completed');

    if (!map.has(email)) {
      map.set(email, {
        name,
        email,
        phone,
        address,
        initials: name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(),
        totalOrders: 1,
        completedOrders: isCompleted ? 1 : 0,
        failedOrders: pStatus === 'Failed' ? 1 : 0,
        totalSpent: isCompleted ? amount : 0,
        lastOrderDate: o.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastPaymentStatus: pStatus
      });
    } else {
      const existing = map.get(email);
      existing.totalOrders += 1;
      if (isCompleted) {
        existing.completedOrders += 1;
        existing.totalSpent += amount;
      }
      if (pStatus === 'Failed') existing.failedOrders += 1;
      if (phone !== '—') existing.phone = phone;
      if (address !== '—') existing.address = address;
    }
  });

  res.json(Array.from(map.values()));
});

// Razorpay: POST Payment Failed Logger
app.post('/api/razorpay/payment-failed', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, delivery_address, product_name, img, amount, failure_reason } = req.body;
    const orderId = '#KD-FAIL-' + Math.floor(1000 + Math.random() * 9000);
    const failedOrder = {
      id: orderId,
      customer_name: customer_name || 'Valued Patron',
      customer_email: customer_email || 'patron@kadha.heritage',
      customer_phone: customer_phone || '+91 90000 00000',
      delivery_address: delivery_address || 'Address provided at checkout',
      initials: (customer_name || 'Valued Patron').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(),
      product_name: product_name || 'Handloom Saree Order',
      img: img || 'Beige Ikat Mulmul Saree.png',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: Number(amount) || 0,
      status: 'Failed',
      payment_status: 'Failed',
      failure_reason: failure_reason || 'Transaction cancelled or failed at bank verification'
    };

    if (supabase) {
      try {
        await supabase.from('orders').insert([failedOrder]);
      } catch (e) {
        console.error('Supabase failed order insert:', e);
      }
    }
    defaultOrders.unshift(failedOrder);
    res.status(200).json({ success: true, orderId: failedOrder.id });
  } catch (err) {
    res.status(500).json({ error: 'Could not record failed payment' });
  }
});

// Orders: POST
app.post('/api/orders', async (req, res) => {
  const { customer_name, customer_email, product_name, img, amount } = req.body;
  const orderId = '#KD-' + Math.floor(1000 + Math.random() * 9000);
  const newOrder = {
    id: orderId,
    customer_name: customer_name || 'Guest Customer',
    customer_email: customer_email || 'guest@example.com',
    initials: (customer_name || 'Guest Customer').split(' ').map(n=>n[0]).join('').slice(0,2),
    product_name: product_name || 'Handloom Saree',
    img: img || 'Beige Ikat Mulmul Saree.png',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    amount: Number(amount) || 2999,
    status: 'Processing'
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').insert([newOrder]).select();
      if (!error && data) return res.status(201).json(data[0]);
    } catch (err) {
      console.error('Supabase order insert error:', err);
    }
  }

  res.status(201).json(newOrder);
});

// Bookings: POST
app.post('/api/bookings', async (req, res) => {
  const { name, email, interest, time } = req.body;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('bookings').insert([{
        name,
        email,
        interest,
        time_slot: time
      }]).select();
      if (!error) return res.status(201).json({ success: true, data });
    } catch (err) {
      console.error('Supabase booking insert error:', err);
    }
  }
  res.status(201).json({ success: true, message: 'Booking received successfully' });
});

// Newsletter: POST
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (supabase && email) {
    try {
      const { data, error } = await supabase.from('newsletter_subscribers').insert([{ email }]).select();
      if (!error) return res.status(201).json({ success: true, data });
    } catch (err) {
      console.error('Supabase newsletter insert error:', err);
    }
  }
  res.status(201).json({ success: true, message: 'Subscribed successfully' });
});

// ==============================================================================
// RAZORPAY PAYMENT GATEWAY ENDPOINTS (Confidential Keys Stored Only on Backend)
// ==============================================================================

// Razorpay: GET Config (Public Key ID only for client checkout SDK)
app.get('/api/razorpay/config', (req, res) => {
  if (!RAZORPAY_KEY_ID) {
    return res.status(500).json({ error: 'Razorpay keys not configured on backend server' });
  }
  res.json({
    key_id: RAZORPAY_KEY_ID,
    currency: 'INR',
    storeName: 'KADHA Atelier'
  });
});

// Razorpay: POST Create Order
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { amount, receipt, notes } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid order amount' });
    }
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay gateway credentials not configured on backend' });
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);
    const orderPayload = JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {}
    });

    const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const options = {
      hostname: 'api.razorpay.com',
      port: 443,
      path: '/v1/orders',
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(orderPayload)
      }
    };

    const rzpReq = https.request(options, (rzpRes) => {
      let responseData = '';
      rzpRes.on('data', chunk => responseData += chunk);
      rzpRes.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (rzpRes.statusCode >= 200 && rzpRes.statusCode < 300) {
            res.json({
              success: true,
              orderId: parsed.id,
              amount: parsed.amount,
              currency: parsed.currency,
              key_id: RAZORPAY_KEY_ID
            });
          } else {
            console.error('[Razorpay Order Error]', parsed);
            res.status(rzpRes.statusCode).json({ error: parsed.error?.description || 'Failed to create Razorpay order' });
          }
        } catch (e) {
          res.status(500).json({ error: 'Error parsing Razorpay response' });
        }
      });
    });

    rzpReq.on('error', (err) => {
      console.error('[Razorpay Network Error]', err);
      res.status(500).json({ error: 'Could not communicate with Razorpay API' });
    });

    rzpReq.write(orderPayload);
    rzpReq.end();
  } catch (err) {
    console.error('Server error creating Razorpay order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Razorpay: POST Verify Payment Signature and confirm Order
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      product_name,
      img,
      amount
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment signature verification parameters' });
    }

    if (!RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, error: 'Razorpay secret key not found on server' });
    }

    // Verify HMAC SHA256 Signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = (expectedSignature === razorpay_signature);

    if (!isAuthentic) {
      console.warn('[SECURITY] Razorpay payment signature mismatch detected!');
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // Signature verified! Record confirmed paid order
    const orderId = '#KD-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: orderId,
      customer_name: customer_name || 'Valued Patron',
      customer_email: customer_email || 'patron@kadha.heritage',
      initials: (customer_name || 'Valued Patron').split(' ').map(n=>n[0]).join('').slice(0,2),
      product_name: product_name || 'Handloom Saree Heirloom Order',
      img: img || 'Beige Ikat Mulmul Saree.png',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: Number(amount) || 0,
      status: 'Paid'
    };

    // Store in Supabase if connected
    if (supabase) {
      try {
        const { data, error } = await supabase.from('orders').insert([newOrder]).select();
        if (!error && data) {
          return res.status(200).json({
            success: true,
            message: 'Payment verified and order confirmed successfully',
            orderId: data[0].id,
            paymentId: razorpay_payment_id
          });
        }
      } catch (err) {
        console.error('Supabase order insert error on payment verification:', err);
      }
    }

    // Fallback store in defaultOrders
    defaultOrders.unshift(newOrder);

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      orderId: newOrder.id,
      paymentId: razorpay_payment_id
    });
  } catch (err) {
    console.error('Payment verification server error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during verification' });
  }
});

// Serve frontend static assets (Storefront & Admin)
app.use(express.static(path.join(__dirname)));

// Fallback for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` KADHA Storefront & Backend Server Running!`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(` Admin URL: http://localhost:${PORT}/admin.html`);
  console.log(` API Endpoint: http://localhost:${PORT}/api/products`);
  console.log(` Supabase Status: ${supabase ? 'Configured (Backend only)' : 'Local mode'}`);
  console.log(`====================================================`);
});
