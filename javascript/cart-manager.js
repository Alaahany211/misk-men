// cart-manager.js
// ملف مركزي لإدارة سلة التسوق عبر جميع صفحات الموقع

const CART_KEY = 'misk_cart';

// الحصول على محتويات السلة من localStorage
function getCart() {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {
            console.error("خطأ في قراءة السلة", e);
            return [];
        }
    }
    return [];
}

// حفظ السلة بالكامل في localStorage
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // إطلاق حدث محلي لتحديث الواجهة في نفس الصفحة
    window.dispatchEvent(new Event('cartUpdated'));
}

// إضافة منتج إلى السلة
function addToCart(product) {
    let cart = getCart();
    const newItem = {
        id: Date.now() + Math.random(),
        ...product
    };
    cart.push(newItem);
    saveCart(cart);
    renderCart();
    openCartSidebar();
    return cart;
}

// حذف منتج من السلة حسب id
function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id != itemId);
    saveCart(cart);
    renderCart();
    return cart;
}

// تحديث كمية منتج (يمكن تطويرها لاحقًا)
function updateQuantity(itemId, newQuantity) {
    let cart = getCart();
    const item = cart.find(i => i.id == itemId);
    if (item && newQuantity > 0) {
        item.quantity = newQuantity;
        saveCart(cart);
        renderCart();
    }
    return cart;
}

// تفريغ السلة بالكامل
function clearCart() {
    saveCart([]);
    renderCart();
}

// عرض السلة في واجهة المستخدم
function renderCart() {
    const container = document.getElementById('cartItemsList');
    const totalSpan = document.getElementById('cartTotalPrice');
    const countSpan = document.getElementById('cartCount');
    
    if (!container) return;

    const cart = getCart();
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart">🛒 السلة فارغة</div>';
        if (totalSpan) totalSpan.innerText = '0 جنيه';
        if (countSpan) countSpan.innerText = '0';
        return;
    }

    let html = '';
    let total = 0;
    cart.forEach(item => {
        total += item.price || 0;
        html += `
            <div class="cart-item" data-id="${item.id}">
                <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                <div class="item-title">✨ ${item.productName}</div>
                <div class="item-details">📦 الحجم: ${item.size || 'غير محدد'}</div>
                <div class="item-details">🍾 الشكل: ${item.shape || 'غير محدد'}</div>
                <div class="item-details">⚖️ التركيز: ${item.concentration || 'غير محدد'}</div>
                <div class="item-price">💰 ${(item.price === 0 || !item.price) ? 'يحدد لاحقاً' : item.price.toLocaleString() + ' جنيه'}</div>
            </div>
        `;
    });
    container.innerHTML = html;
    if (totalSpan) totalSpan.innerText = total === 0 ? 'يحدد لاحقاً' : total.toLocaleString() + ' جنيه';
    if (countSpan) countSpan.innerText = cart.length;

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseFloat(btn.getAttribute('data-id'));
            removeFromCart(id);
        });
    });
}

// فتح شريط السلة الجانبي
function openCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    const floatingBtn = document.getElementById('floatingCartBtn');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    if (floatingBtn) floatingBtn.style.display = 'none';
}

// إغلاق شريط السلة الجانبي
function closeCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    const floatingBtn = document.getElementById('floatingCartBtn');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    if (floatingBtn) floatingBtn.style.display = 'flex';
}

// تهيئة السلة عند تحميل الصفحة
function initCart() {
    renderCart();
    
    const floatingBtn = document.getElementById('floatingCartBtn');
    const closeBtn = document.getElementById('closeCartBtn');
    const overlay = document.getElementById('cartOverlay');
    if (floatingBtn) floatingBtn.addEventListener('click', openCartSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeCartSidebar);
    if (overlay) overlay.addEventListener('click', closeCartSidebar);
    
    window.addEventListener('storage', function(event) {
        if (event.key === CART_KEY) {
            renderCart();
        }
    });
    
    window.addEventListener('cartUpdated', function() {
        renderCart();
    });
}

// تصدير الوظائف للنطاق العام (لتكون متاحة في الملفات الأخرى)
window.getCart = getCart;
window.saveCart = saveCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.renderCart = renderCart;
window.openCartSidebar = openCartSidebar;
window.closeCartSidebar = closeCartSidebar;
window.initCart = initCart;