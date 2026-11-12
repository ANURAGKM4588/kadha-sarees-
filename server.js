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
  {id:'#KD-2841',name:'Aarushi Mehta',email:'aarushi.m@email.com',initials:'AM',product:'Beige Ikat Mulmul',img:'Beige Ikat Mulmul Saree.png',date:'Nov 12, 2026',amount:2999,status:'Processing'},
  {id:'#KD-2840',name:'Maya Krishnan',email:'maya.k@email.com',initials:'MK',product:'Bottle Green Narayani',img:'Bottle Green Narayani Pattu.png',date:'Nov 12, 2026',amount:6499,status:'Shipped'},
  {id:'#KD-2839',name:'Devika Rao',email:'devika.r@email.com',initials:'DR',product:'Mustard Sungudi Cotton',img:'Mustard Yellow Sungudi Cotton Saree.png',date:'Nov 11, 2026',amount:2799,status:'Delivered'},
  {id:'#KD-2838',name:'Nandita Shah',email:'nandita.s@email.com',initials:'NS',product:'Magenta Narayani Pattu',img:'Magenta Narayani Pattu.png',date:'Nov 11, 2026',amount:6999,status:'Processing'},
  {id:'#KD-2837',name:'Priya Menon',email:'priya.m@email.com',initials:'PM',product:'Yellow Teal Mulmul',img:'Yellow Teal Mulmul Cotton Saree.png',date:'Nov 10, 2026',amount:3399,status:'Shipped'}
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
    const { data, error } = await supabase.from('products').select('*');
    if (error || !data || data.length === 0) {
      return res.json(defaultProducts);
    }
    res.json(data);
  } catch (err) {
    res.json(defaultProducts);
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
      name: o.customer_name || o.name,
      email: o.customer_email || o.email,
      initials: o.initials || (o.customer_name ? o.customer_name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'KD'),
      product: o.product_name || o.product,
      img: o.img,
      date: o.date || new Date(o.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: o.amount,
      status: o.status || 'Processing'
    }));
    res.json(formatted);
  } catch (err) {
    res.json(defaultOrders);
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
