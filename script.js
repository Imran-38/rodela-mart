// ⚠️ আপনার আসল ওয়াটসঅ্যাপ নম্বরটি এখানে লিখুন (যেমন: +8801517851338)
const MY_WHATSAPP_NUMBER = "+8801517851338; 

// প্রোডাক্ট লিস্ট (ইচ্ছেমতো কাস্টমাইজ বা যোগ করা যাবে)
const products = [
    {
        id: 1,
        name: "RFL Italiano Hotpot 2500ml",
        category: "rfl",
        price: 850,
        oldPrice: 1000,
        badge: "RFL Original",
        image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400"
    },
    {
        id: 2,
        name: "RFL Smart Water Jug 2L",
        category: "rfl",
        price: 320,
        oldPrice: 400,
        badge: "RFL Original",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400"
    },
    {
        id: 3,
        name: "Electric Stainless Steel Blender 750W",
        category: "kitchen",
        price: 2450,
        oldPrice: 2800,
        badge: "Popular",
        image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400"
    },
    {
        id: 4,
        name: "Non-Stick Cookware Set (3 Pcs)",
        category: "kitchen",
        price: 1850,
        oldPrice: 2200,
        badge: "Best Offer",
        image: "https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=400"
    },
    {
        id: 5,
        name: "RFL Multi-Layer Tiffin Box",
        category: "rfl",
        price: 480,
        oldPrice: 550,
        badge: "RFL Original",
        image: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=400"
    },
    {
        id: 6,
        name: "Multipurpose Plastic Storage Rack",
        category: "home",
        price: 950,
        oldPrice: 1200,
        badge: "New",
        image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400"
    }
];

let cart = [];

// প্রোডাক্ট ব্রাউজারে রেন্ডার করা
function displayProducts(items) {
    const container = document.getElementById('productContainer');
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

// কার্ট ড্যাশবোর্ড আপডেট করা
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

// হোয়াটসঅ্যাপে মেসেজ রেডি করে পাঠানো
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

// সাইট লোড হলে প্রোডাক্ট শো করা
displayProducts(products);
      
