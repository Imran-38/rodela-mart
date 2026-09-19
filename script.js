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
        
        products = rawData.map(p => ({
            id: Number(p.id) || p.id,
            name: p.name || "",
            category: p.category || "all",
            price: Number(p.price) || 0,
            oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
            badge: p.badge || "",
            image: p.image || "https://via.placeholder.com/400",
            description: p.description || "এই প্রোডাক্টের কোনো বিস্তারিত বিবরণ দেওয়া নেই।"
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
   ৩. প্রোডাক্ট প্রদর্শন (Display Products)
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
            <img src="${p.image}" alt="${p.name}" class="product-img" onclick="openProductModal('${p.id}')" style="cursor:pointer;">
            <div>
                <div class="product-title" onclick="openProductModal('${p.id}')" style="cursor:pointer;">${p.name}</div>
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
   ৪. প্রোডাক্ট ডিটেইলস পপ-আপ মডাল (Product Details Modal)
   ========================================================================== */

function openProductModal(productId) {
    const product = products.find(p => p.id == productId);
    if (!product) return;

    let modal = document.getElementById('productDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'productDetailModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            padding: 15px;
            box-sizing: border-box;
        `;
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="
            background: #ffffff;
            width: 100%;
            max-width: 500px;
            max-height: 85vh;
            overflow-y: auto;
            border-radius: 12px;
            padding: 20px;
            position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            box-sizing: border-box;
        ">
            <button onclick="closeProductModal()" style="
                position: absolute;
                top: 12px;
                right: 15px;
                background: #f3f4f6;
                border: none;
                font-size: 22px;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                cursor: pointer;
                color: #374151;
                line-height: 1;
            ">&times;</button>
            
            <img src="${product.image}" alt="${product.name}" style="
                width: 100%;
                max-height: 280px;
                object-fit: contain;
                border-radius: 8px;
                margin-bottom: 15px;
                background-color: #f9fafb;
            ">
            
            <h3 style="font-size: 18px; color: #111827; margin-bottom: 8px;">${product.name}</h3>
            
            <div style="margin-bottom: 15px; font-size: 18px; font-weight: bold; color: #059669;">
                ৳${product.price}
                ${product.oldPrice ? `<span style="text-decoration: line-through; color: #9ca3af; font-size: 14px; margin-left: 8px;">৳${product.oldPrice}</span>` : ''}
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
                <h4 style="font-size: 15px; color: #374151; margin-bottom: 6px;">প্রোডাক্ট বিবরণ:</h4>
                <p style="font-size: 14px; color: #4b5563; line-height: 1.6; white-space: pre-line;">${product.description}</p>
            </div>
            
            <button onclick="addToCart('${product.id}'); closeProductModal();" style="
                width: 100%;
                margin-top: 20px;
                padding: 12px;
                background: #059669;
                color: #ffffff;
                border: none;
                border-radius: 8px;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            ">
                <i class="fa-solid fa-cart-plus"></i> কার্টে রাখুন
            </button>
        </div>
    `;

    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
}

function closeProductModal() {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
    }
}

/* ==========================================================================
   ৫. পপ-আপ নোটিফিকেশন (Top Toast Notification)
   ========================================================================== */

function showToast(message) {
    let toast = document.getElementById('toastNotification');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translate(-50%, -20px);
            background-color: #059669;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 9999999;
            transition: all 0.3s ease-in-out;
            opacity: 0;
            pointer-events: none;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
        `;
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -20px)';
    }, 2000);
}

/* ==========================================================================
   ৬. কার্ট ম্যানেজমেন্ট (Cart Operations)
   ========================================================================== */

function addToCart(productId) {
    showToast('প্রোডাক্টটি সফলভাবে কার্টে যোগ হয়েছে!');

    const item = products.find(p => p.id == productId);
    if (!item) return;

    const exist = cart.find(c => c.id == productId);

    if (exist) {
        exist.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    
    updateCartUI();
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

    if (checkoutForm) checkoutForm.style.display = 'none';

    if (cartCount) {
        cartCount.innerText = cart.reduce((sum, item) => sum + item.qty, 0);
    }

    if (cart.length === 0) {
        if (container) container.innerHTML = '<p style="text-align:center; padding:30px; color:#6b7280;">আপনার কার্ট ফাঁকা রয়েছে</p>';
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (container) {
        container.innerHTML = `
            <div style="padding-bottom:10px;">
                ${cart.map(item => `
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #f3f4f6;">
                        <img src="${item.image}" alt="${item.name}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;">
                        <div style="flex-grow:1; margin:0 12px;">
                            <div style="font-size:13px; font-weight:600; color:#111827;">${item.name}</div>
                            <div style="color:#059669; font-weight:bold; font-size:13px; margin-top:2px;">৳${item.price} x ${item.qty} = ৳${item.price * item.qty}</div>
                        </div>
                        <div style="display:flex; gap:6px; align-items:center;">
                            <button onclick="changeQty('${item.id}', -1)" style="padding:2px 8px; background:#e5e7eb; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">-</button>
                            <span style="font-size:14px; font-weight:600;">${item.qty}</span>
                            <button onclick="changeQty('${item.id}', 1)" style="padding:2px 8px; background:#e5e7eb; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">+</button>
                        </div>
                    </div>
                `).join('')}
                
                <div style="margin-top:20px; padding:15px; background:#f9fafb; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:15px; font-weight:bold; color:#374151;">মোট বিল:</span>
                    <span style="font-size:18px; font-weight:bold; color:#059669;">৳${subtotal}</span>
                </div>

                <button onclick="openCheckoutModal()" style="
                    width:100%;
                    margin-top:15px;
                    padding:12px;
                    background:#059669;
                    color:#ffffff;
                    border:none;
                    border-radius:8px;
                    font-size:15px;
                    font-weight:bold;
                    cursor:pointer;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    gap:8px;
                ">
                    অর্ডার কনফার্ম করুন <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    }
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

/* ==========================================================================
   ৭. পার্সোনাল ডিটেইলস পপ-আপ মডাল (Personal Details Checkout Modal)
   ========================================================================== */

function openCheckoutModal() {
    if (cart.length === 0) {
        alert('আপনার কার্ট ফাঁকা রয়েছে!');
        return;
    }

    // কার্ট ড্রয়ার বন্ধ করা
    toggleCart(false);

    let modal = document.getElementById('checkoutModalPopup');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'checkoutModalPopup';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            padding: 15px;
            box-sizing: border-box;
        `;
        document.body.appendChild(modal);
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const defaultDelivery = 60; // ঢাকার ভেতরে ডিফল্ট চার্জ

    modal.innerHTML = `
        <div style="
            background: #ffffff;
            width: 100%;
            max-width: 480px;
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 12px;
            padding: 22px;
            position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            box-sizing: border-box;
        ">
            <button onclick="closeCheckoutModal()" style="
                position: absolute;
                top: 12px;
                right: 15px;
                background: #f3f4f6;
                border: none;
                font-size: 22px;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                cursor: pointer;
                color: #374151;
                line-height: 1;
            ">&times;</button>
            
            <h3 style="font-size: 18px; color: #111827; margin-bottom: 15px; text-align:center; border-bottom: 2px solid #059669; padding-bottom: 8px;">
                📋 আপনার ডেলিভারি তথ্য দিন
            </h3>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div>
                    <label style="font-size: 13px; font-weight: bold; color: #374151; display:block; margin-bottom:4px;">আপনার নাম *</label>
                    <input type="text" id="modalCustName" placeholder="সম্পূর্ণ নাম লিখুন" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box; font-size:14px;">
                </div>

                <div>
                    <label style="font-size: 13px; font-weight: bold; color: #374151; display:block; margin-bottom:4px;">মোবাইল নম্বর *</label>
                    <input type="tel" id="modalCustPhone" placeholder="১১ ডিজিটের মোবাইল নম্বর" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box; font-size:14px;">
                </div>

                <div>
                    <label style="font-size: 13px; font-weight: bold; color: #374151; display:block; margin-bottom:4px;">সম্পূর্ণ ঠিকানা *</label>
                    <textarea id="modalCustAddress" rows="2" placeholder="বাড়ি নম্বর, রোড নম্বর, এলাকা..." style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box; font-size:14px;"></textarea>
                </div>

                <div>
                    <label style="font-size: 13px; font-weight: bold; color: #374151; display:block; margin-bottom:4px;">ডেলিভারি এলাকা *</label>
                    <select id="modalDeliveryZone" onchange="updateModalBill()" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box; font-size:14px;">
                        <option value="60">ঢাকার ভেতরে (৳৬০)</option>
                        <option value="120">ঢাকার বাইরে (৳১২০)</option>
                    </select>
                </div>

                <div>
                    <label style="font-size: 13px; font-weight: bold; color: #374151; display:block; margin-bottom:4px;">পেমেন্ট পদ্ধতি</label>
                    <select id="modalPayMethod" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box; font-size:14px;">
                        <option value="Cash on Delivery">ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা দিন)</option>
                        <option value="bKash / Nagad">বিকাশ / নগদ (অগ্রিম পেমেন্ট)</option>
                    </select>
                </div>

                <!-- বিল সামারি -->
                <div style="background:#f9fafb; padding:12px; border-radius:8px; margin-top:5px; font-size:14px;">
                    <div style="display:flex; justify-style:space-between; margin-bottom:4px;">
                        <span>পণ্যের দাম:</span>
                        <span style="font-weight:bold;">৳<span id="modalSubtotal">${subtotal}</span></span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span>ডেলিভারি চার্জ:</span>
                        <span style="font-weight:bold;">৳<span id="modalDeliveryCharge">${defaultDelivery}</span></span>
                    </div>
                    <div style="display:flex; justify-content:space-between; border-top:1px solid #e5e7eb; padding-top:6px; font-weight:bold; color:#059669; font-size:16px;">
                        <span>সর্বমোট:</span>
                        <span>৳<span id="modalGrandTotal">${subtotal + defaultDelivery}</span></span>
                    </div>
                </div>

                <button onclick="submitModalOrder()" style="
                    width: 100%;
                    margin-top: 10px;
                    padding: 12px;
                    background: #25D366;
                    color: #ffffff;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                ">
                    <i class="fa-brands fa-whatsapp" style="font-size:18px;"></i> অর্ডার সম্পন্ন করুন
                </button>
            </div>
        </div>
    `;

    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModalPopup');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
    }
}

function updateModalBill() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const deliveryCharge = parseInt(document.getElementById('modalDeliveryZone').value);
    
    document.getElementById('modalDeliveryCharge').innerText = deliveryCharge;
    document.getElementById('modalGrandTotal').innerText = subtotal + deliveryCharge;
}

function submitModalOrder() {
    const name = document.getElementById('modalCustName').value.trim();
    const phone = document.getElementById('modalCustPhone').value.trim();
    const address = document.getElementById('modalCustAddress').value.trim();
    const zoneSelect = document.getElementById('modalDeliveryZone');
    const zone = zoneSelect.options[zoneSelect.selectedIndex].text;
    const pay = document.getElementById('modalPayMethod').value;

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
   ৮. নেভিগেশন ও পলিসি মডাল (Navigation & Policy Modals)
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
   ৯. পেজ লোড ইভেন্ট (Init on DOM Loaded)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
    fetchProductsFromSheet();
});
