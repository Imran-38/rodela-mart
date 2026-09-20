/* ==========================================================================
   ১. কনফিগারেশন ও গ্লোবাল ভ্যারিয়েবল
   ========================================================================== */
const MY_WHATSAPP_NUMBER = "8801517851338"; 
const GOOGLE_SHEET_API = "https://script.google.com/macros/s/AKfycbwcA835WsS_PyjAM598bSz0plGH4bg8sWb3-DBlqtuyj7qLRHmHFjqlXPZGIsrHVkHzEw/exec";

let products = [];
let cart = [];

// পেজ লোড হলে ফেচ চালু করা
document.addEventListener("DOMContentLoaded", () => {
    fetchProductsFromSheet();
});

/* ==========================================================================
   ২. গুগল ড্রাইভ ও ইমেজ লিংক ফিক্স করার ফাংশন (Image Direct URL Formatter)
   ========================================================================== */
function fixImageUrl(url) {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return 'https://placehold.co/400x400?text=No+Image';
    }

    let cleanUrl = url.trim();

    // Google Drive Shareable Links Fix
    if (cleanUrl.includes('drive.google.com')) {
        const idMatch = cleanUrl.match(/\/d\/([^\/\?]+)/) || cleanUrl.match(/id=([^\&]+)/);
        if (idMatch && idMatch[1]) {
            return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
        }
    }

    return cleanUrl;
}

/* ==========================================================================
   ৩. গুগল শীট থেকে ডাটা ফেচ করা (Fetch Products)
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
            id: String(p.id || Math.random()),
            name: p.name || "",
            category: p.category ? String(p.category).toLowerCase().trim() : "all",
            price: Number(p.price) || 0,
            oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
            badge: p.badge || "",
            image: fixImageUrl(p.image),
            description: p.description || "এই প্রোডাক্টের কোনো বিস্তারিত বিবরণ দেওয়া নেই।"
        }));

        displayProducts(products);
    } catch (error) {
        console.error("ডাটা লোড করতে সমস্যা হয়েছে:", error);
        if (container) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red; padding: 40px;">প্রোডাক্ট লোড করা সম্ভব হয়নি। গুগল শীট এপিআই লিংকটি আবার চেক করুন।</p>';
        }
    }
}

/* ==========================================================================
   ৪. প্রোডাক্ট প্রদর্শন (Display Products)
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
            <img src="${p.image}" referrerpolicy="no-referrer" alt="${p.name}" class="product-img" onerror="this.onerror=null;this.src='https://placehold.co/400x400?text=No+Image';" onclick="openProductModal('${p.id}')" style="cursor:pointer;">
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
        displayProducts(products.filter(p => p.category === cat.toLowerCase()));
    }
}

// প্রোডাক্ট সার্চ
function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    displayProducts(filtered);
}

/* ==========================================================================
   ৫. প্রোডাক্ট ডিটেইলস পপ-আপ (Product Details Modal)
   ========================================================================== */
function openProductModal(productId) {
    const product = products.find(p => p.id == productId);
    if (!product) return;

    let modal = document.getElementById('productDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'productDetailModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.6); display: flex; align-items: center;
            justify-content: center; z-index: 999999; opacity: 0;
            pointer-events: none; transition: opacity 0.3s ease; padding: 15px; box-sizing: border-box;
        `;
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background: #ffffff; width: 100%; max-width: 500px; max-height: 85vh; overflow-y: auto; border-radius: 12px; padding: 20px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3); box-sizing: border-box;">
            <button onclick="closeProductModal()" style="position: absolute; top: 12px; right: 15px; background: #f3f4f6; border: none; font-size: 22px; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; color: #374151;">&times;</button>
            <img src="${product.image}" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='https://placehold.co/400x400?text=No+Image';" alt="${product.name}" style="width: 100%; max-height: 250px; object-fit: contain; border-radius: 8px; margin-bottom: 15px; background-color: #f9fafb;">
            <h3 style="font-size: 18px; color: #111827; margin-bottom: 8px;">${product.name}</h3>
            <div style="margin-bottom: 15px; font-size: 18px; font-weight: bold; color: #059669;">
                ৳${product.price} ${product.oldPrice ? `<span style="text-decoration: line-through; color: #9ca3af; font-size: 14px; margin-left: 8px;">৳${product.oldPrice}</span>` : ''}
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
                <h4 style="font-size: 15px; color: #374151; margin-bottom: 6px;">প্রোডাক্ট বিবরণ:</h4>
                <p style="font-size: 14px; color: #4b5563; line-height: 1.6; white-space: pre-line;">${product.description}</p>
            </div>
            <button onclick="addToCart('${product.id}'); closeProductModal();" style="width: 100%; margin-top: 20px; padding: 12px; background: #059669; color: #ffffff; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
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
   ৬. টোস্ট নোটিফিকেশন (Toast Notification)
   ========================================================================== */
function showToast(message) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translate(-50%, -20px);
            background-color: #059669; color: #ffffff; padding: 12px 24px; border-radius: 8px;
            font-size: 14px; font-weight: 600; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 9999999; transition: all 0.3s ease-in-out; opacity: 0; pointer-events: none;
            display: flex; align-items: center; gap: 8px; white-space: nowrap;
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
   ৭. কার্ট অপারেশনস (Cart Logic)
   ========================================================================== */
function addToCart(productId) {
    const item = products.find(p => p.id == productId);
    if (!item) return;

    showToast('প্রোডাক্টটি কার্টে যোগ হয়েছে!');

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

    if (cartCount) {
        cartCount.innerText = cart.reduce((sum, item) => sum + item.qty, 0);
    }

    if (cart.length === 0) {
        if (container) container.innerHTML = '<p class="empty-cart-msg">আপনার কার্ট ফাঁকা রয়েছে</p>';
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (container) {
        container.innerHTML = `
            <div style="padding-bottom:10px;">
                ${cart.map(item => `
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #f3f4f6;">
                        <img src="${item.image}" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='https://placehold.co/400x400?text=No+Image';" style="width:50px; height:50px; object-fit:cover; border-radius:6px;">
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

                <button onclick="openCheckoutModal()" style="width:100%; margin-top:15px; padding:12px; background:#059669; color:#ffffff; border:none; border-radius:8px; font-size:15px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
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
   ৮. চেকআউট মডাল ও হোয়াটসঅ্যাপ অর্ডার (Checkout & WhatsApp Submission)
   ========================================================================== */
function openCheckoutModal() {
    if (cart.length === 0) {
        alert('আপনার কার্ট ফাঁকা রয়েছে!');
        return;
    }

    toggleCart(false);

    let modal = document.getElementById('checkoutModalPopup');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'checkoutModalPopup';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.6); display: flex; align-items: center;
            justify-content: center; z-index: 999999; opacity: 0; pointer-events: none;
            transition: opacity 0.3s ease; padding: 15px; box-sizing: border-box;
        `;
        document.body.appendChild(modal);
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const defaultDelivery = 60;

    modal.innerHTML = `
        <div style="background: #ffffff; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; border-radius: 12px; padding: 22px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3); box-sizing: border-box;">
            <button onclick="closeCheckoutModal()" style="position: absolute; top: 12px; right: 15px; background: #f3f4f6; border: none; font-size: 22px; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; color: #374151;">&times;</button>
            
            <h3 style="font-size: 18px; color: #111827; margin-bottom: 15px; text-align:center; border-bottom: 2px solid #059669; padding-bottom: 8px;">
                📋 আপনার ডেলিভারি তথ্য দিন
            </h3>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div>
                    <label style="font-size: 13px; font-weight: bold; color: #374151; display:block; margin-bottom:4px;">আপনার নাম *</label>
                    <input type="text" id="modalCustName" placeholder="সম্পূর্ণ নাম লিখুন" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; font-size:14px;">
                </div>

                <div>
                    <label style="font-size: 13px; font-weight: bold; color: #374151; display:block; margin-bottom:4px;">মোবাইল নম্বর *</label>
                    <input type="tel" id="modalCustPhone" placeholder="১১ ডিজিটের মোবাইল নম্বর" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; font-size:14px;">
                </div>

                <div>
                    <label style="font-size: 13px; font-weight: bold; color: #374151; display:block; margin-bottom:4px;">সম্পূর্ণ ঠিকানা *</label>
                    <textarea id="modalCustAddress" rows="2" placeholder="বাড়ি নম্বর, রোড নম্বর, এলাকা..." style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; font-size:14px;"></textarea>
                </div>

                <div>
                    <label style="font-size: 13px; font-weight: bold; color: #374151; display:block; margin-bottom:4px;">ডেলিভারি এলাকা *</label>
                    <select id="modalDeliveryZone" onchange="updateModalBill()" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; font-size:14px;">
                        <option value="60">ঢাকার ভেতরে (৳৬০)</option>
                        <option value="120">ঢাকার বাইরে (৳১২০)</option>
                    </select>
                </div>

                <div>
                    <label style="font-size: 13px; font-weight: bold; color: #374151; display:block; margin-bottom:4px;">পেমেন্ট পদ্ধতি</label>
                    <select id="modalPayMethod" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; font-size:14px;">
                        <option value="Cash on Delivery">ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা দিন)</option>
                        <option value="bKash / Nagad">বিকাশ / নগদ (অগ্রিম পেমেন্ট)</option>
                    </select>
                </div>

                <div style="background:#f9fafb; padding:12px; border-radius:8px; margin-top:5px; font-size:14px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
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

                <button onclick="submitModalOrder()" style="width: 100%; margin-top: 10px; padding: 12px; background:#25D366; color:white; border:none; border-radius:8px; font-size:15px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <i class="fa-brands fa-whatsapp fa-lg"></i> হোয়াটসঅ্যাপে অর্ডার পাঠান
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
    const deliveryZone = Number(document.getElementById('modalDeliveryZone').value) || 60;

    document.getElementById('modalSubtotal').innerText = subtotal;
    document.getElementById('modalDeliveryCharge').innerText = deliveryZone;
    document.getElementById('modalGrandTotal').innerText = subtotal + deliveryZone;
}

function submitModalOrder() {
    const name = document.getElementById('modalCustName').value.trim();
    const phone = document.getElementById('modalCustPhone').value.trim();
    const address = document.getElementById('modalCustAddress').value.trim();
    const deliveryZoneSelect = document.getElementById('modalDeliveryZone');
    const deliveryFee = Number(deliveryZoneSelect ? deliveryZoneSelect.value : 60);
    const deliveryZoneText = deliveryZoneSelect ? deliveryZoneSelect.options[deliveryZoneSelect.selectedIndex].text : '';
    const payMethod = document.getElementById('modalPayMethod').value;

    // ভ্যালিডেশন
    if (!name || !phone || !address) {
        alert('অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা দিন!');
        return;
    }

    if (cart.length === 0) {
        alert('আপনার কার্ট ফাঁকা রয়েছে!');
        return;
    }

    // হোয়াটসঅ্যাপ মেসেজ তৈরি
    let itemDetails = cart.map((item, index) => `${index + 1}. ${item.name} (${item.qty}টি) = ৳${item.price * item.qty}`).join('\n');
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let grandTotal = subtotal + deliveryFee;

    let message = `🛒 *নতুন অর্ডার এসেছে*\n\n` +
                  `👤 *কাস্টমার তথ্য:*\n` +
                  `• নাম: ${name}\n` +
                  `• ফোন: ${phone}\n` +
                  `• ঠিকানা: ${address}\n` +
                  `• ডেলিভারি এলাকা: ${deliveryZoneText}\n` +
                  `• পেমেন্ট মেথড: ${payMethod}\n\n` +
                  `📦 *অর্ডারকৃত পণ্য:*\n${itemDetails}\n\n` +
                  `💰 *বিল বিবরণ:*\n` +
                  `• পণ্যের দাম: ৳${subtotal}\n` +
                  `• ডেলিভারি চার্জ: ৳${deliveryFee}\n` +
                  `• *সর্বমোট:* ৳${grandTotal}`;

    // হোয়াটসঅ্যাপ ইউআরএল জেনারেট ও ওপেন
    let whatsappUrl = `https://wa.me/${MY_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // কার্ট খালি ও মডাল বন্ধ করা
    cart = [];
    updateCartUI();
    closeCheckoutModal();
    showToast('অর্ডার সফলভাবে পাঠানো হয়েছে!');
}
