// ===== РАБОТА С ПРОДУКТАМИ =====

// Функции для работы с продуктами уже определены в main.js
// Здесь могут быть дополнительные функции для фильтрации, поиска и сортировки

function filterProductsByCategory(categoryId) {
    currentCategory = categoryId;
    currentPage = 1;
    loadCatalogProducts();
}

function searchProductsByTerm(term) {
    const searchTerm = term.toLowerCase().trim();
    
    if (!searchTerm) {
        return allProducts;
    }
    
    return allProducts.filter(product => {
        const productName = product.name.toLowerCase();
        const productDesc = product.description.toLowerCase();
        const categoryName = (CATEGORIES.find(c => c.id === product.category)?.name || '').toLowerCase();
        
        return productName.includes(searchTerm) ||
               productDesc.includes(searchTerm) ||
               categoryName.includes(searchTerm);
    });
}

function sortProductsBy(sortType) {
    const sortedProducts = [...allProducts];
    
    switch(sortType) {
        case 'price_asc':
            return sortedProducts.sort((a, b) => 
                calculatePriceWithDiscount(a.price, a.discount) - 
                calculatePriceWithDiscount(b.price, b.discount)
            );
            
        case 'price_desc':
            return sortedProducts.sort((a, b) => 
                calculatePriceWithDiscount(b.price, b.discount) - 
                calculatePriceWithDiscount(a.price, a.discount)
            );
            
        case 'rating':
            return sortedProducts.sort((a, b) => 
                parseFloat(b.rating) - parseFloat(a.rating)
            );
            
        case 'new':
            return sortedProducts.sort((a, b) => 
                (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
            );
            
        case 'discount':
            return sortedProducts.sort((a, b) => 
                (b.discount || 0) - (a.discount || 0)
            );
            
        default: // popular
            return sortedProducts.sort((a, b) => 
                b.reviews - a.reviews
            );
    }
}

function getProductById(productId) {
    return allProducts.find(product => product.id === productId);
}

function getProductsByCategory(categoryId) {
    if (categoryId === 'all') {
        return allProducts;
    }
    return allProducts.filter(product => product.category === categoryId);
}

function getRecommendedProducts(currentProductId, limit = 4) {
    const currentProduct = getProductById(currentProductId);
    if (!currentProduct) return [];
    
    // Находим товары из той же категории
    const sameCategory = allProducts.filter(product => 
        product.category === currentProduct.category && 
        product.id !== currentProductId
    );
    
    // Сортируем по рейтингу и берем первые N
    return sameCategory
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, limit);
}

function getNewArrivals(limit = 8) {
    return allProducts
        .filter(product => product.isNew)
        .sort((a, b) => new Date(b.addedDate || 0) - new Date(a.addedDate || 0))
        .slice(0, limit);
}

function getBestSellers(limit = 8) {
    // В реальном приложении здесь бы использовались данные о продажах
    // Сейчас просто берем товары с высоким рейтингом
    return allProducts
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, limit);
}

function getDiscountedProducts(limit = 8) {
    return allProducts
        .filter(product => product.discount > 0)
        .sort((a, b) => b.discount - a.discount)
        .slice(0, limit);
}

function viewProductDetails(productId) {
    const product = getProductById(productId);
    if (!product) {
        showNotification('Товар не найден', 'error');
        return;
    }
    
    const recommended = getRecommendedProducts(productId, 4);
    
    const modalContent = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3 class="modal-title">${product.name}</h3>
                <button class="modal-close" onclick="closeModal('product-details-modal')">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="product-details">
                    <div class="product-details-main">
                        <div class="product-details-image">
                            <div style="font-size: 100px; color: var(--accent); text-align: center; padding: 40px 0;">
                                ${product.icon}
                            </div>
                        </div>
                        
                        <div class="product-details-info">
                            <div class="product-details-header">
                                <div class="product-category">${CATEGORIES.find(c => c.id === product.category)?.name}</div>
                                <div class="product-rating">
                                    <div class="stars">
                                        ${generateStars(product.rating)}
                                    </div>
                                    <span class="rating-value">${product.rating} (${product.reviews} отзывов)</span>
                                </div>
                            </div>
                            
                            <h4>Описание</h4>
                            <p>${product.description}</p>
                            
                            <div class="product-details-price">
                                <div class="current-price">${calculatePriceWithDiscount(product.price, product.discount).toLocaleString()} ₽</div>
                                ${product.discount > 0 ? `
                                    <div class="price-details">
                                        <span class="old-price">${product.price.toLocaleString()} ₽</span>
                                        <span class="discount-badge">-${product.discount}%</span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="product-details-actions">
                                <button class="btn btn-primary" onclick="addToCart(${product.id}, '${product.category}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, ${product.discount}); closeModal('product-details-modal');">
                                    <i class="fas fa-cart-plus"></i> Добавить в корзину
                                </button>
                                <button class="btn btn-outline" onclick="toggleFavorite(${product.id})">
                                    <i class="fas fa-heart ${favorites.has(product.id) ? 'active' : ''}"></i>
                                </button>
                            </div>
                            
                            <div class="product-details-features">
                                <div class="feature">
                                    <i class="fas fa-shipping-fast"></i>
                                    <span>Бесплатная доставка от 15 000 ₽</span>
                                </div>
                                <div class="feature">
                                    <i class="fas fa-shield-alt"></i>
                                    <span>Гарантия 2 года</span>
                                </div>
                                <div class="feature">
                                    <i class="fas fa-undo"></i>
                                    <span>30 дней на возврат</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${recommended.length > 0 ? `
                        <div class="product-recommended">
                            <h4>Рекомендуем также</h4>
                            <div class="recommended-grid">
                                ${recommended.map(rec => `
                                    <div class="recommended-product" onclick="viewProductDetails(${rec.id})">
                                        <div class="rec-icon">${rec.icon}</div>
                                        <div class="rec-name">${rec.name}</div>
                                        <div class="rec-price">${calculatePriceWithDiscount(rec.price, rec.discount).toLocaleString()} ₽</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    let detailsModal = document.getElementById('product-details-modal');
    if (!detailsModal) {
        detailsModal = document.createElement('div');
        detailsModal.id = 'product-details-modal';
        detailsModal.className = 'modal';
        document.body.appendChild(detailsModal);
    }
    
    detailsModal.innerHTML = modalContent;
    openModal('product-details-modal');
}

// ===== ДОПОЛНИТЕЛЬНЫЕ СТИЛИ ДЛЯ ПРОДУКТОВ =====
function injectProductStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .product-details {
            max-width: 100%;
        }
        
        .product-details-main {
            display: grid;
            grid-template-columns: 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        
        @media (min-width: 768px) {
            .product-details-main {
                grid-template-columns: 1fr 1fr;
            }
        }
        
        .product-details-image {
            background: linear-gradient(135deg, var(--light) 0%, var(--light-dark) 100%);
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 300px;
        }
        
        .product-details-header {
            margin-bottom: 20px;
        }
        
        .product-details-info h4 {
            margin: 25px 0 15px;
            font-size: 20px;
        }
        
        .product-details-price {
            margin: 25px 0;
        }
        
        .price-details {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-top: 10px;
        }
        
        .discount-badge {
            background: linear-gradient(135deg, #FF3B30, #FF9500);
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 700;
        }
        
        .product-details-actions {
            display: flex;
            gap: 15px;
            margin: 30px 0;
        }
        
        .product-details-actions .btn {
            flex: 1;
        }
        
        .product-details-actions .btn-outline {
            width: 60px;
            min-width: 60px;
        }
        
        .product-details-features {
            background: var(--light);
            padding: 20px;
            border-radius: var(--radius);
            margin-top: 30px;
        }
        
        .feature {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }
        
        .feature:last-child {
            margin-bottom: 0;
        }
        
        .feature i {
            color: var(--accent);
            width: 20px;
        }
        
        .product-recommended {
            margin-top: 40px;
            padding-top: 40px;
            border-top: 1px solid var(--light-dark);
        }
        
        .recommended-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .recommended-product {
            background: var(--light);
            padding: 15px;
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: var(--transition-fast);
            text-align: center;
        }
        
        .recommended-product:hover {
            background: white;
            transform: translateY(-5px);
            box-shadow: var(--shadow);
        }
        
        .rec-icon {
            font-size: 32px;
            margin-bottom: 10px;
            color: var(--accent);
        }
        
        .rec-name {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 5px;
            line-height: 1.4;
        }
        
        .rec-price {
            font-weight: 700;
            color: var(--accent);
            font-size: 16px;
        }
        
        /* Стили для подтверждения заказа */
        .confirmation-icon {
            font-size: 80px;
            color: var(--success);
            margin: 20px 0;
        }
        
        .confirmation-details {
            background: var(--light);
            padding: 20px;
            border-radius: var(--radius);
            margin: 25px 0;
            text-align: left;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .detail-row:last-child {
            margin-bottom: 0;
        }
        
        .confirmation-actions {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }
        
        .confirmation-actions .btn {
            flex: 1;
        }
        
        /* Стили для профиля */
        .profile-header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .profile-avatar {
            width: 80px;
            height: 80px;
            background: var(--accent-gradient);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
            font-weight: 700;
        }
        
        .profile-info h4 {
            margin-bottom: 5px;
            font-size: 24px;
        }
        
        .profile-info p {
            color: var(--gray);
            margin-bottom: 5px;
        }
        
        .profile-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 30px 0;
        }
        
        .profile-stat {
            background: var(--light);
            padding: 20px;
            border-radius: var(--radius);
            text-align: center;
        }
        
        .profile-stat .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--accent);
            margin-bottom: 5px;
        }
        
        .profile-stat .stat-label {
            color: var(--gray);
            font-size: 13px;
        }
        
        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
        }
        
        .checkbox-label input {
            width: 18px;
            height: 18px;
        }
        
        .checkbox-label span {
            color: var(--dark);
        }
        
        /* Стили для заказов */
        .orders-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .order-card {
            background: var(--light);
            padding: 20px;
            border-radius: var(--radius);
            border: 1px solid rgba(0,0,0,0.05);
        }
        
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .order-id {
            font-weight: 700;
            color: var(--dark);
        }
        
        .order-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
        }
        
        .status-new {
            background: rgba(0, 122, 255, 0.1);
            color: var(--accent);
        }
        
        .status-processing {
            background: rgba(255, 149, 0, 0.1);
            color: #FF9500;
        }
        
        .status-shipped {
            background: rgba(52, 199, 89, 0.1);
            color: var(--success);
        }
        
        .status-delivered {
            background: rgba(88, 86, 214, 0.1);
            color: #5856D6;
        }
        
        .status-cancelled {
            background: rgba(255, 59, 48, 0.1);
            color: var(--danger);
        }
        
        .order-date {
            color: var(--gray);
            font-size: 14px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .order-items {
            margin-bottom: 15px;
        }
        
        .order-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            font-size: 14px;
        }
        
        .order-more {
            color: var(--gray);
            font-size: 13px;
            text-align: center;
            margin-top: 10px;
        }
        
        .order-total {
            display: flex;
            justify-content: space-between;
            font-weight: 700;
            font-size: 18px;
            padding-top: 15px;
            border-top: 1px solid rgba(0,0,0,0.1);
        }
        
        /* Стили для админ-панели */
        .admin-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 25px;
            border-bottom: 1px solid var(--light-dark);
            padding-bottom: 15px;
        }
        
        .admin-tab {
            padding: 10px 20px;
            background: none;
            border: none;
            border-radius: var(--radius-sm);
            color: var(--gray);
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .admin-tab.active {
            background: var(--accent);
            color: white;
        }
        
        .admin-tab-content {
            display: none;
        }
        
        .admin-tab-content.active {
            display: block;
        }
        
        .admin-order-card, .admin-user-card {
            background: var(--light);
            padding: 15px;
            border-radius: var(--radius-sm);
            margin-bottom: 10px;
        }
        
        .admin-order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .order-customer {
            color: var(--gray);
            margin-left: 10px;
            font-size: 14px;
        }
        
        .order-controls {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .admin-order-info {
            display: flex;
            gap: 20px;
            font-size: 14px;
            color: var(--gray);
        }
        
        .admin-user-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 10px;
        }
        
        .user-avatar-sm {
            width: 40px;
            height: 40px;
            background: var(--accent-gradient);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
        }
        
        .user-role {
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 10px;
            margin-left: 8px;
        }
        
        .user-role.admin {
            background: rgba(255, 59, 48, 0.1);
            color: var(--danger);
        }
        
        .user-role.user {
            background: rgba(0, 122, 255, 0.1);
            color: var(--accent);
        }
        
        .user-email {
            color: var(--gray);
            font-size: 14px;
        }
        
        .admin-user-info {
            font-size: 13px;
            color: var(--gray);
            display: flex;
            gap: 15px;
        }
        
        .analytics-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        
        @media (min-width: 768px) {
            .analytics-stats {
                grid-template-columns: repeat(4, 1fr);
            }
        }
        
        .analytics-stat {
            background: var(--light);
            padding: 20px;
            border-radius: var(--radius);
            text-align: center;
        }
        
        .analytics-stat .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--accent);
            margin-bottom: 5px;
        }
        
        .analytics-stat .stat-label {
            color: var(--gray);
            font-size: 14px;
        }
        
        .recent-orders {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .recent-order {
            display: grid;
            grid-template-columns: 1fr 2fr 1fr 1fr;
            gap: 15px;
            padding: 10px;
            background: var(--light);
            border-radius: var(--radius-sm);
            font-size: 14px;
            align-items: center;
        }
        
        @media (max-width: 768px) {
            .recent-order {
                grid-template-columns: 1fr;
                text-align: center;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Инициализация стилей при загрузке
document.addEventListener('DOMContentLoaded', injectProductStyles);

// Экспортируем функции
window.filterProductsByCategory = filterProductsByCategory;
window.searchProductsByTerm = searchProductsByTerm;
window.sortProductsBy = sortProductsBy;
window.getProductById = getProductById;
window.getProductsByCategory = getProductsByCategory;
window.getRecommendedProducts = getRecommendedProducts;
window.getNewArrivals = getNewArrivals;
window.getBestSellers = getBestSellers;
window.getDiscountedProducts = getDiscountedProducts;
window.viewProductDetails = viewProductDetails;
