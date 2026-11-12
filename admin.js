let adminOrders=[
 {id:'#KD-2841',name:'Aarushi Mehta',email:'aarushi.m@email.com',initials:'AM',product:'Beige Ikat Mulmul',img:'Beige Ikat Mulmul Saree.png',date:'Nov 12, 2026',amount:2999,status:'Processing'},
 {id:'#KD-2840',name:'Maya Krishnan',email:'maya.k@email.com',initials:'MK',product:'Bottle Green Narayani',img:'Bottle Green Narayani Pattu.png',date:'Nov 12, 2026',amount:6499,status:'Shipped'},
 {id:'#KD-2839',name:'Devika Rao',email:'devika.r@email.com',initials:'DR',product:'Mustard Sungudi Cotton',img:'Mustard Yellow Sungudi Cotton Saree.png',date:'Nov 11, 2026',amount:2799,status:'Delivered'},
 {id:'#KD-2838',name:'Nandita Shah',email:'nandita.s@email.com',initials:'NS',product:'Magenta Narayani Pattu',img:'Magenta Narayani Pattu.png',date:'Nov 11, 2026',amount:6999,status:'Processing'},
 {id:'#KD-2837',name:'Priya Menon',email:'priya.m@email.com',initials:'PM',product:'Yellow Teal Mulmul',img:'Yellow Teal Mulmul Cotton Saree.png',date:'Nov 10, 2026',amount:3399,status:'Shipped'}
];

async function loadOrdersFromBackend(){
  try{
    const res = await fetch('/api/orders');
    if(res.ok){
      const data = await res.json();
      if(Array.isArray(data) && data.length){
        adminOrders = data;
        showOrders();
      }
    }
  }catch(e){}
}
const adminMoney=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
function showOrders(){const q=document.querySelector('#orderSearch').value.toLowerCase(),status=document.querySelector('#statusFilter').value;const list=adminOrders.filter(o=>(status==='all'||o.status===status)&&`${o.id} ${o.name} ${o.email} ${o.product}`.toLowerCase().includes(q));document.querySelector('#orderRows').innerHTML=list.map(o=>`<tr><td><input type="checkbox" aria-label="Select ${o.id}"></td><td><strong>${o.id}</strong></td><td><div class="order-customer"><span class="customer-avatar">${o.initials}</span><span><span class="customer-name">${o.name}</span><small class="customer-email">${o.email}</small></span></div></td><td><div class="product-cell"><img src="assets/${o.img}" alt=""><span>${o.product}</span></div></td><td>${o.date}</td><td><strong>${adminMoney(o.amount)}</strong></td><td><span class="status ${o.status}">${o.status}</span></td><td><button class="row-menu" aria-label="More about ${o.id}">···</button></td></tr>`).join('');document.querySelector('#rowCount').textContent=list.length}
document.querySelector('#orderSearch').addEventListener('input',showOrders);document.querySelector('#statusFilter').addEventListener('change',showOrders);showOrders();loadOrdersFromBackend();
document.querySelector('#adminTheme').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('kadha-theme',document.body.classList.contains('dark')?'dark':'light')});if(localStorage.getItem('kadha-theme')==='dark')document.body.classList.add('dark');
document.querySelector('.solid-button').addEventListener('click',()=>notify('Add a product flow is ready to connect to your catalogue.'));document.querySelector('.export-button').addEventListener('click',()=>notify('Your order report is ready to export.'));function notify(s){const e=document.querySelector('#adminToast');e.textContent=s;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2400)}
