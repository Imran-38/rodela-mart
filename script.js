// ⚠️ আপনার আসল ওয়াটসঅ্যাপ নম্বরটি এখানে লিখুন (যেমন: 8801700000000)
const MY_WHATSAPP_NUMBER = "8801700000000"; 

// প্রোডাক্ট লিস্ট (আপনার ছবির নাম বা লিংক এখানে বসাবেন)
const products = [
    {
        id: 1,
        name: "RFL Italiano Hotpot 2500ml",
        category: "rfl",
        price: 850,
        oldPrice: 1000,
        badge: "RFL Original",
        image: "https://placehold.co/400x400/059669/white?text=RFL+Hotpot"
    },
    {
        id: 2,
        name: "RFL Smart Water Jug 2L",
        category: "rfl",
        price: 320,
        oldPrice: 400,
        badge: "RFL Original",
        image: "https://placehold.co/400x400/059669/white?text=RFL+Jug"
    },
    {
        id: 3,
        name: "Electric Blender 750W",
        category: "kitchen",
        price: 2450,
        oldPrice: 2800,
        badge: "Popular",
        image: "https://placehold.co/400x400/059669/white?text=Blender"
    },
    {
        id: 4,
        name: "Non-Stick Cookware Set",
        category: "kitchen",
        price: 1850,
        oldPrice: 2200,
        badge: "Best Offer",
        image: "https://placehold.co/400x400/059669/white?text=Cookware"
    }
];

let cart = [];

// প্রোডাক্ট ব্রাউজারে রেন্ডার করা
function displayProducts(items) {
    const container = document.getElementById('productContainer');
    if(!container) return;
    
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
            <button class="add-cart-btn" onclick="addToCart(${p.id})">
                <i class="fa-solid fa-cart-plus"></i> কার্টে রাখুন
            </button>
        </div>
    `).join('');
}

// ক্যাটাগরি ফিল্টার
function filterCategory(cat, event) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');
    
    if (cat === 'all') displayProducts(products);
    else displayProducts(products.filter(p => p.category === cat));
}

// লাইভ প্রোডাক্ট সার্চ
function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    displayProducts(filtered);
}

// কার্টে আইটেম যুক্ত করা
function addToCart(productId) {
    const item = products.find(p => p.id === productId);
    const exist = cart.find(c => c.id === productId);

    if (exist) {
        exist.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
    toggleCart(true);
}

// কার্ট স্লাইডার ওপেন/ক্লোজ করা
function toggleCart(forceOpen = false) {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('overlay');
    if (forceOpen) {
        drawer.classList.add('open');
        overlay.classList.add('show');
    } else {
        drawer.classList.toggle('open');
        overlay.classList.toggle('show');
    }
}

// কার্ট আপডেট করা
function updateCartUI() {
    const container = document.getElementById('cartItemsContainer');
    const cartCount = document.getElementById('cartCount');
    const checkoutForm = document.getElementById('checkoutForm');

    cartCount.innerText = cart.reduce((sum, item) => sum + item.qty, 0);

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-msg">কার্ট ফাঁকা রয়েছে</p>';
        checkoutForm.style.display = 'none';
    } else {
        checkoutForm.style.display = 'block';
        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="">
                <div style="flex-grow:1; margin:0 10px;">
                    <div style="font-size:13px; font-weight:600;">${item.name}</div>
                    <div style="color:var(--primary-color); font-weight:bold; font-size:13px;">৳${item.price} x ${item.qty}</div>
                </div>
                <div>
                    <button onclick="changeQty(${item.id}, -1)" style="padding:2px 8px; cursor:pointer;">-</button>
                    <button onclick="changeQty(${item.id}, 1)" style="padding:2px 8px; cursor:pointer;">+</button>
                </div>
            </div>
        `).join('');
    }
    updateTotal();
}

function changeQty(id, delta) {
    const item = cart.find(c => c.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(c => c.id !== id);
        }
    }
    updateCartUI();
}

function updateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const delivery = cart.length > 0 ? parseInt(document.getElementById('deliveryZone').value) : 0;
    
    document.getElementById('subTotal').innerText = `৳${subtotal}`;
    document.getElementById('deliveryCharge').innerText = `৳${delivery}`;
    document.getElementById('grandTotal').innerText = `৳${subtotal + delivery}`;
}

// হোয়াটসঅ্যাপে অর্ডার পাঠানো
function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert('আপনার কার্ট ফাঁকা রয়েছে!');
        return;
    }

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const zone = document.getElementById('deliveryZone').options[document.getElementById('deliveryZone').selectedIndex].text;
    const pay = document.getElementById('payMethod').value;

    if (!name || !phone || !address) {
        alert('অনুগ্রহ করে নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা পূরণ করুন।');
        return;
    }

    let itemsList = "";
    let subtotal = 0;
    cart.forEach((item, index) => {
        itemsList += `${index + 1}. ${item.name} (${item.qty} টি) = ৳${item.price * item.qty}\n`;
        subtotal += item.price * item.qty;
    });

    const deliveryCharge = parseInt(document.getElementById('deliveryZone').value);
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

// পেজ লোড হলে প্রোডাক্ট প্রদর্শন
document.addEventListener("DOMContentLoaded", function() {
    displayProducts(products);
});
// পলিসি পপ-আপ ডাটা ও ফাংশন
const policyData = {
    refund: {
        title: "রিটার্ন ও রিফান্ড পলিসি",
        content: `
            <p><strong>১. রিটার্ন কন্ডিশন:</strong> পণ্য গ্রহণের সময় রাইডার/ডেলিভারি ম্যানের সামনে অবশ্যই প্রোডাক্ট চেক করে নিবেন। কোনো ভাঙা, ড্যামেজ বা ভুল পণ্য পেলে ডেলিভারি ম্যানের কাছেই রিটার্ন করুন।</p> <br>
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
        title.innerText = policyData[type].title;
        content.innerHTML = policyData[type].content;
        modal.style.display = 'flex';
        overlay.style.display = 'block';
    }
}

function closePolicyModal() {
    document.getElementById('policyModal').style.display = 'none';
    document.getElementById('policyOverlay').style.display = 'none';
}
// মোবাইল নেভিগেশন মেনু ওপেন ও ক্লোজ করা
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

