/* ==========================================================================
   ১. কনফিগারেশন ও গুগল শীট লিংক (Configuration)
   ========================================================================== */

// আপনার হোয়াটসঅ্যাপ নম্বর
const MY_WHATSAPP_NUMBER = "8801517851338"; 

// আপনার গুগল অ্যাপস স্ক্রিপ্ট Web App URL
const GOOGLE_SHEET_API = "https://script.google.com/macros/s/AKfycbwcA835WsS_PyjAM598bSz0plGH4bg8sWb3-DBlqtuyj7qLRHmHFjqlXPZGIsrHVkHzEw/exec";

// ডাটা রাখার গ্লোবাল অ্যারেই
let products = [];
let cart = [];

/* ==========================================================================
   ২. গুগল শীট থেকে ডাটা ফেচ করা (Fetch Products from Google Sheet)
   ========================================================================== */

async function fetchProductsFromSheet() {
    const container = document.getElementById('productContainer');
    if (container) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; font-weight: bold;">প্রোডাক্ট লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>';
    }

    try {
        const response = await fetch(GOOGLE_SHEET_API);
        const rawData = await response.json();
        
        // টাইপ কনভার্সন (সংখ্যা নিশ্চিত করা)
        products = rawData.map(p => ({
            id: Number(p.id) || p.id,
            name: p.name || "",
            category: p.category || "all",
            price: Number(p.price) || 0,
            oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
            badge: p.badge || "",
            image: p.image || "https://via.placeholder.com/400"
        }));

        displayProducts(products);
    } catch (error) {
        console.error("ডাটা লোড করতে সমস্যা হয়েছে:", error);
        if (container) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red; padding: 40px;">প্রোডাক্ট লোড করা সম্ভব হয়নি। গুগল শীটে প্রোডাক্ট দেওয়া আছে কিনা নিশ্চিত করুন।</p>';
        }
    }
}

/* ==========================================================================
   ৩. প্রোডাক্ট প্রদর্শন ও সার্চ/ফিল্টার (Display & Search/Filter)
   ========================================================================== */

function displayProducts(items) {
    const container = document.getElementById('productContainer');
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 30px;">কোনো প্রোডাক্ট পাওয়া যায়নি!</p>';
        return;
    }

    container.innerHTML = items.map(p => `
        <div class="product-card">
            ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
            <img src="${p.image}" alt="${p.name}" class="product-img">
            <div>
                <div class="product-title">${p.name}</div>
                <div class="price-box">
                    <span class="current-price">৳${p.price}</span>
                    ${p.oldPrice ? `<span class="old-price">৳${p.oldPrice}</span>` : ''}
                </div>
            </div>
            <button class="add-cart-btn" onclick="addToCart('${p.id}')">
                <i class="fa-solid fa-cart-plus"></i> কার্টে রাখুন
            </button>
        </div>
    `).join('');
}

// ক্যাটাগরি ফিল্টার
function filterCategory(cat, event) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target && event.target.classList.contains('tab-btn')) {
        event.target.classList.add('active');
    }
    
    if (cat === 'all') {
        displayProducts(products);
    } else {
        displayProducts(products.filter(p => p.category === cat));
    }
}

// লাইভ প্রোডাক্ট সার্চ
function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    displayProducts(filtered);
}

/* ==========================================================================
   ৪. শপিং কার্ট ও অর্ডার সিষ্টেম (Cart & Order System)
   ========================================================================== */

// কার্টে প্রোডাক্ট যোগ করার ফাংশন (অটো কার্ট ড্রয়ার ওপেন হওয়া বন্ধ করা হয়েছে)
function addToCart(productId) {
    const item = products.find(p => p.id == productId);
    if (!item) return;

    const exist = cart.find(c => c.id == productId);

    if (exist) {
        exist.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    
    updateCartUI();
    // toggleCart(true); // <-- এই অংশটি তুলে দেওয়া হয়েছে যাতে চাপ দিলে কার্ট পেজ নিজে থেকে না খোলে
}

function toggleCart(forceOpen = false) {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('overlay');
    if (!drawer || !overlay) return;

    if (forceOpen) {
        drawer.classList.add('open');
        overlay.classList.add('show');
    } else {
        drawer.classList.toggle('open');
        overlay.classList.toggle('show');
    }
}

function updateCartUI() {
    const container = document.getElementById('cartItemsContainer');
    const cartCount = document.getElementById('cartCount');
    const checkoutForm = document.getElementById('checkoutForm');

    if (cartCount) {
        cartCount.innerText = cart.reduce((sum, item) => sum + item.qty, 0);
    }

    if (cart.length === 0) {
        if (container) container.innerHTML = '<p class="empty-cart-msg">কার্ট ফাঁকা রয়েছে</p>';
        if (checkoutForm) checkoutForm.style.display = 'none';
    } else {
        if (checkoutForm) checkoutForm.style.display = 'block';
        if (container) {
            container.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div style="flex-grow:1; margin:0 10px;">
                        <div style="font-size:13px; font-weight:600;">${item.name}</div>
                        <div style="color:var(--primary-color); font-weight:bold; font-size:13px;">৳${item.price} x ${item.qty}</div>
                    </div>
                    <div style="display:flex; gap:5px; align-items:center;">
                        <button onclick="changeQty('${item.id}', -1)" style="padding:2px 8px; cursor:pointer;">-</button>
                        <span>${item.qty}</span>
                        <button onclick="changeQty('${item.id}', 1)" style="padding:2px 8px; cursor:pointer;">+</button>
                    </div>
                </div>
            `).join('');
        }
    }
    updateTotal();
}

function changeQty(id, delta) {
    const item = cart.find(c => c.id == id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(c => c.id != id);
        }
    }
    updateCartUI();
}

function updateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const deliverySelect = document.getElementById('deliveryZone');
    const delivery = (cart.length > 0 && deliverySelect) ? parseInt(deliverySelect.value) : 0;
    
    const subTotalElem = document.getElementById('subTotal');
    const deliveryChargeElem = document.getElementById('deliveryCharge');
    const grandTotalElem = document.getElementById('grandTotal');

    if (subTotalElem) subTotalElem.innerText = `৳${subtotal}`;
    if (deliveryChargeElem) deliveryChargeElem.innerText = `৳${delivery}`;
    if (grandTotalElem) grandTotalElem.innerText = `৳${subtotal + delivery}`;
}

/* ==========================================================================
   ৫. হোয়াটসঅ্যাপে অর্ডার পাঠানো (WhatsApp Order)
   ========================================================================== */

function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert('আপনার কার্ট ফাঁকা রয়েছে!');
        return;
    }

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const zoneSelect = document.getElementById('deliveryZone');
    const zone = zoneSelect.options[zoneSelect.selectedIndex].text;
    const pay = document.getElementById('payMethod').value;

    if (!name || !phone || !address) {
        alert('অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা প্রবেশ করান।');
        return;
    }

    let itemsList = "";
    let subtotal = 0;
    cart.forEach((item, index) => {
        itemsList += `${index + 1}. ${item.name} (${item.qty} টি) = ৳${item.price * item.qty}\n`;
        subtotal += item.price * item.qty;
    });

    const deliveryCharge = parseInt(zoneSelect.value);
    const total = subtotal + deliveryCharge;

    let msg = `🛒 *নতুন অর্ডার - রোদেলা মার্ট (Rodela Mart)*\n\n`;
    msg += `👤 *গ্রাহকের নাম:* ${name}\n`;
    msg += `📞 *মোবাইল:* ${phone}\n`;
    msg += `📍 *ঠিকানা:* ${address}\n`;
    msg += `🚚 *ডেলিভারি এরিয়া:* ${zone}\n`;
    msg += `💳 *পেমেন্ট পদ্ধতি:* ${pay}\n\n`;
    msg += `📦 *অর্ডারকৃত প্রোডাক্ট:* \n${itemsList}\n`;
    msg += `---------------------------\n`;
    msg += `💰 *পণ্য মোট:* ৳${subtotal}\n`;
    msg += `🚚 *ডেলিভারি চার্জ:* ৳${deliveryCharge}\n`;
    msg += `✅ *সর্বমোট:* ৳${total}`;

    const url = `https://wa.me/${MY_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

/* ==========================================================================
   ৬. নেভিগেশন ও পলিসি মডাল ফাংশন (Navigation & Policy Modals)
   ========================================================================== */

function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

const policyData = {
    refund: {
        title: "রিটার্ন ও রিফান্ড পলিসি",
        content: `
            <p><strong>১. রিটার্ন কন্ডিশন:</strong> পণ্য গ্রহণের সময় রাইডার/ডেলিভারি ম্যানের সামনে অবশ্যই প্রোডাক্ট চেক করে নিবেন। কোনো ভাঙা, ড্যামেজ বা ভুল পণ্য পেলে ডেলিভারি ম্যানের কাছেই রিটার্ন করুন।</p><br>
            <p><strong>২. রিফান্ড নিয়মাবলী:</strong> অগ্রিম পেমেন্ট করা থাকলে এবং পণ্য রিটার্ন হলে ৩-৭ কার্যদিবসের মধ্যে বিকাশ/নগদের মাধ্যমে সম্পূর্ণ রিফান্ড করা হবে।</p>
        `
    },
    privacy: {
        title: "প্রাইভেসি পলিসি",
        content: `
            <p>রোদেলা মার্টে আপনার ব্যক্তিগত তথ্যের সুরক্ষা আমাদের অগ্রাধিকার। অর্ডার প্রসেসিং ও ডেলিভারির উদ্দেশ্যে কেবল আপনার নাম, মোবাইল নম্বর এবং ঠিকানা সংগ্রহ করা হয়। আপনার তথ্য অন্য কোনো তৃতীয় পক্ষের কাছে শেয়ার করা হয় না।</p>
        `
    },
    terms: {
        title: "টার্মস অ্যান্ড কন্ডিশনস",
        content: `
            <p>১. প্রোডাক্টের স্টক ও দাম যেকোনো সময় পরিবর্তন হতে পারে।</p>
            <p>২. অর্ডার কনফার্মেশনের জন্য কাস্টমার কেয়ার থেকে ফোন দেওয়া হতে পারে।</p>
            <p>৩. ডেলিভারি চার্জ ক্যাশ অন ডেলিভারিতে প্রযোজ্য।</p>
        `
    }
};

function openPolicyModal(type) {
    const modal = document.getElementById('policyModal');
    const overlay = document.getElementById('policyOverlay');
    const title = document.getElementById('policyModalTitle');
    const content = document.getElementById('policyModalContent');

    if (policyData[type]) {
        if (title) title.innerText = policyData[type].title;
        if (content) content.innerHTML = policyData[type].content;
        if (modal) modal.style.display = 'flex';
        if (overlay) overlay.style.display = 'block';
    }
}

function closePolicyModal() {
    const modal = document.getElementById('policyModal');
    const overlay = document.getElementById('policyOverlay');
    if (modal) modal.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
}

/* ==========================================================================
   ৭. পেজ লোড ইভেন্ট (Init on DOM Loaded)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
    fetchProductsFromSheet();
});
