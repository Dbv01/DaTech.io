// ===== КОРЗИНА =====

function loadCart() {
    const savedCart = localStorage.getItem('datech_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            console.log(`Загружена корзина: ${cart.length} товаров`);
        } catch (e) {
            console.error('Ошибка загрузки корзины:', e);
            cart = [];
        }
    }
    
    updateCartCount();
}

function loadFavorites() {
    const savedFavorites = localStorage.getItem('datech_favorites');
    if (savedFavorites) {
        try {
            favorites = new Set(JSON.parse(savedFavorites));
        } catch (e) {
            console.error('Ошибка загрузки избранного:', e);
            favorites = new Set();
        }
    }
}

function addToCart(productId, category, name, price, discount = 0) {
    const finalPrice = calculatePriceWithDiscount(price, discount);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            category,
            name,
            price: finalPrice,
            originalPrice: price,
            discount,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    updateCart();
    showNotification(`✅ "${name}" добавлен в корзину`, 'success');
    
    // Анимация добавления в корзину
    animateAddToCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    showNotification('Товар удален из корзины', 'info');
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity < 1) {
            removeFromCart(productId);
        } else {
            updateCart();
        }
    }
}

function toggleFavorite(productId) {
    if (favorites.has(productId)) {
        favorites.delete(productId);
        event.target.classList.remove('active');
        showNotification('Удалено из избранного', 'info');
    } else {
        favorites.add(productId);
        event.target.classList.add('active');
        showNotification('Добавлено в избранное', 'success');
    }
    
    // Сохраняем избранное
    localStorage.setItem('datech_favorites', JSON.stringify([...favorites]));
}

function updateCart() {
    // Сохраняем корзину
    localStorage.setItem('datech_cart', JSON.stringify(cart));
    
    // Обновляем счетчик
    updateCartCount();
    
    // Обновляем модалку корзины если она открыта
    if (document.getElementById('cart-modal')?.classList.contains('active')) {
        updateCartModal();
    }
    
    // Обновляем кнопки в товарах если есть
    updateProductButtons();
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function updateProductButtons() {
    // Обновляем кнопки "В корзине" у товаров
    document.querySelectorAll('.btn-add-to-cart').forEach(button => {
        const productId = parseInt(button.getAttribute('data-product-id'));
        if (productId && cart.some(item => item.id === productId)) {
            button.innerHTML = '<i class="fas fa-check"></i> В корзине';
            button.style.background = 'var(--success)';
            button.disabled = true;
        }
    });
}

function openCart() {
    updateCartModal();
    openModal('cart-modal');
}

function updateCartModal() {
    const cartContent = document.getElementById('cart-content');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (!cartContent) return;
    
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <h3>Корзина пуста</h3>
                <p>Добавьте товары из каталога, чтобы сделать заказ</p>
                <button class="btn btn-primary" onclick="closeModal('cart-modal'); showPage('catalog');">
                    <i class="fas fa-shopping-bag"></i> Перейти к товарам
                </button>
            </div>
        `;
        
        if (cartSummary) {
            cartSummary.style.display = 'none';
        }
        return;
    }
    
    let cartHTML = '';
    let subtotal = 0;
    let totalDiscount = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const originalTotal = item.originalPrice * item.quantity;
        const itemDiscount = originalTotal - itemTotal;
        
        subtotal += itemTotal;
        totalDiscount += itemDiscount;
        
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-icon">
                    ${getProductIcon(item.category)}
                </div>
                
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">
                        ${item.price.toLocaleString()} ₽
                        ${item.discount > 0 ? 
                            `<span class="item-discount">-${item.discount}%</span>` : ''}
                    </div>
                </div>
                
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartContent.innerHTML = cartHTML;
    
    // Обновляем итоги
    if (cartSummary) {
        document.getElementById('cart-subtotal').textContent = subtotal.toLocaleString() + ' ₽';
        
        // Рассчитываем доставку (бесплатно от 15000)
        const deliveryCost = subtotal >= 15000 ? 0 : 500;
        const deliveryText = deliveryCost === 0 ? 'Бесплатно' : '500 ₽';
        
        document.getElementById('delivery-cost').textContent = deliveryText;
        document.getElementById('cart-total').textContent = (subtotal + deliveryCost).toLocaleString() + ' ₽';
        cartSummary.style.display = 'block';
        
        // Добавляем информацию о скидке если есть
        if (totalDiscount > 0) {
            const discountRow = cartSummary.querySelector('.discount-row') || 
                document.createElement('div');
            discountRow.className = 'summary-row discount-row';
            discountRow.innerHTML = `
                <span>Скидка:</span>
                <span style="color: var(--success);">−${totalDiscount.toLocaleString()} ₽</span>
            `;
            
            const subtotalRow = cartSummary.querySelector('.summary-row:first-child');
            if (subtotalRow && !subtotalRow.nextElementSibling?.classList.contains('discount-row')) {
                subtotalRow.after(discountRow);
            }
        } else {
            const discountRow = cartSummary.querySelector('.discount-row');
            if (discountRow) discountRow.remove();
        }
    }
}

function openCheckoutModal() {
    if (cart.length === 0) {
        showNotification('Корзина пуста', 'error');
        return;
    }
    
    if (!currentUser) {
        showNotification('Для оформления заказа необходимо войти в аккаунт', 'warning');
        showAuthModal('login');
        return;
    }
    
    updateOrderItems();
    
    // Заполняем данные пользователя если они есть
    if (currentUser) {
        document.getElementById('checkout-name').value = currentUser.name || '';
        document.getElementById('checkout-phone').value = currentUser.phone || '';
        document.getElementById('checkout-email').value = currentUser.email || '';
    }
    
    closeModal('cart-modal');
    openModal('checkout-modal');
}

function updateOrderItems() {
    const orderItemsContainer = document.getElementById('order-items-container');
    if (!orderItemsContainer) return;
    
    let itemsHTML = '';
    let subtotal = 0;
    let totalDiscount = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const originalTotal = item.originalPrice * item.quantity;
        const itemDiscount = originalTotal - itemTotal;
        
        subtotal += itemTotal;
        totalDiscount += itemDiscount;
        
        itemsHTML += `
            <div class="order-item">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-quantity">× ${item.quantity}</div>
                <div class="order-item-price">${itemTotal.toLocaleString()} ₽</div>
            </div>
        `;
    });
    
    orderItemsContainer.innerHTML = itemsHTML;
    
    // Рассчитываем доставку
    const deliveryCost = subtotal >= 15000 ? 0 : 500;
    const total = subtotal + deliveryCost;
    
    document.getElementById('checkout-total-price').textContent = total.toLocaleString() + ' ₽';
}

function submitOrder() {
    // Получаем данные из формы
    const name = document.getElementById('checkout-name').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const email = document.getElementById('checkout-email').value.trim();
    const address = document.getElementById('checkout-address').value.trim();
    const comment = document.getElementById('checkout-comment').value.trim();
    
    // Валидация
    if (!name) {
        showNotification('Введите ФИО', 'error');
        document.getElementById('checkout-name').focus();
        return;
    }
    
    if (!phone || !validatePhone(phone)) {
        showNotification('Введите корректный телефон', 'error');
        document.getElementById('checkout-phone').focus();
        return;
    }
    
    if (!address) {
        showNotification('Введите адрес доставки', 'error');
        document.getElementById('checkout-address').focus();
        return;
    }
    
    // Рассчитываем итоговую сумму
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCost = subtotal >= 15000 ? 0 : 500;
    const total = subtotal + deliveryCost;
    
    // Создаем объект заказа
    const order = {
        id: 'DT' + Date.now(),
        userId: currentUser ? currentUser.id : null,
        date: new Date().toISOString(),
        status: 'new',
        customer: {
            name,
            phone,
            email,
            address,
            comment
        },
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            quantity: item.quantity,
            discount: item.discount
        })),
        subtotal,
        deliveryCost,
        total,
        paymentMethod: 'online', // В реальном приложении выбирал бы пользователь
        notes: ''
    };
    
    // Сохраняем заказ
    saveOrder(order);
    
    // Очищаем корзину
    clearCart();
    
    // Очищаем форму
    resetCheckoutForm();
    
    // Закрываем модалку
    closeModal('checkout-modal');
    
    // Показываем подтверждение
    showOrderConfirmation(order);
}

function saveOrder(order) {
    let orders = JSON.parse(localStorage.getItem('datech_orders')) || [];
    orders.push(order);
    localStorage.setItem('datech_orders', JSON.stringify(orders));
    console.log(`Заказ сохранен: #${order.id}`);
}

function clearCart() {
    cart = [];
    updateCart();
}

function resetCheckoutForm() {
    document.getElementById('checkout-name').value = '';
    document.getElementById('checkout-phone').value = '';
    document.getElementById('checkout-email').value = '';
    document.getElementById('checkout-address').value = '';
    document.getElementById('checkout-comment').value = '';
}

function showOrderConfirmation(order) {
    const modalContent = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <div class="modal-header">
                <h3 class="modal-title">Заказ оформлен!</h3>
                <button class="modal-close" onclick="closeModal('confirmation-modal')">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="confirmation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                
                <h4 style="margin: 20px 0 10px;">Спасибо за заказ!</h4>
                <p>Ваш заказ <strong>#${order.id}</strong> успешно оформлен.</p>
                
                <div class="confirmation-details">
                    <div class="detail-row">
                        <span>Номер заказа:</span>
                        <strong>#${order.id}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Сумма:</span>
                        <strong>${order.total.toLocaleString()} ₽</strong>
                    </div>
                    <div class="detail-row">
                        <span>Статус:</span>
                        <span class="order-status status-new">Новый</span>
                    </div>
                    <div class="detail-row">
                        <span>Дата:</span>
                        <span>${new Date(order.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                </div>
                
                <p style="color: var(--gray); margin: 20px 0;">
                    Менеджер свяжется с вами в течение часа для подтверждения заказа.
                </p>
                
                <div class="confirmation-actions">
                    <button class="btn btn-primary" onclick="closeModal('confirmation-modal'); showUserOrders();">
                        <i class="fas fa-shopping-bag"></i> Мои заказы
                    </button>
                    <button class="btn btn-outline" onclick="closeModal('confirmation-modal'); showPage('catalog');">
                        <i class="fas fa-store"></i> Продолжить покупки
                    </button>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--light);">
                    <p style="font-size: 14px; color: var(--gray);">
                        По вопросам заказа пишите в Telegram: 
                        <a href="https://t.me/daab17" target="_blank" style="color: var(--accent);">@daab17</a>
                    </p>
                </div>
            </div>
        </div>
    `;
    
    let confirmationModal = document.getElementById('confirmation-modal');
    if (!confirmationModal) {
        confirmationModal = document.createElement('div');
        confirmationModal.id = 'confirmation-modal';
        confirmationModal.className = 'modal';
        document.body.appendChild(confirmationModal);
    }
    
    confirmationModal.innerHTML = modalContent;
    openModal('confirmation-modal');
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 12;
}

function animateAddToCart() {
    const cartIcon = document.querySelector('.btn-icon[onclick="openCart()"]');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartIcon.style.transform = '';
        }, 300);
    }
}

// Экспортируем функции
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleFavorite = toggleFavorite;
window.openCart = openCart;
window.openCheckoutModal = openCheckoutModal;
window.submitOrder = submitOrder;
window.showOrderConfirmation = showOrderConfirmation;
