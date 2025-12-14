// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let currentUser = null;
let cart = [];
let currentCategory = 'all';
let currentPage = 1;
let productsPerPage = 12;
let allProducts = [];
let favorites = new Set();

// ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
function initializeApp() {
    console.log('DaTech приложение инициализировано');
    
    // Проверяем авторизацию
    checkAuth();
    
    // Загружаем корзину из localStorage
    loadCart();
    
    // Загружаем избранное из localStorage
    loadFavorites();
    
    // Инициализируем мобильное меню
    initMobileMenu();
    
    // Загружаем данные товаров
    loadProductsData();
    
    // Инициализируем главную страницу
    if (document.getElementById('home')?.classList.contains('active')) {
        initHomePage();
    }
    
    // Инициализируем каталог если он активен
    if (document.getElementById('catalog')?.classList.contains('active')) {
        initCatalogPage();
    }
    
    // Обновляем UI пользователя
    updateUserUI();
    
    // Обновляем счетчик корзины
    updateCartCount();
    
    // Добавляем обработчик для закрытия модалок по клику вне их
    setupModalClickHandlers();
}

// ===== ЗАГРУЗКА ДАННЫХ =====
function loadProductsData() {
    // Имитируем загрузку данных (в реальном приложении здесь был бы fetch)
    setTimeout(() => {
        // Объединяем все товары в один массив
        allProducts = [];
        for (const category in PRODUCTS_DATA) {
            PRODUCTS_DATA[category].forEach(product => {
                allProducts.push({
                    ...product,
                    category: category,
                    rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Рейтинг 3.5-5.0
                    reviews: Math.floor(Math.random() * 100) + 10, // Отзывы 10-110
                    isNew: Math.random() > 0.7, // 30% шанс что товар новый
                    discount: Math.random() > 0.8 ? Math.floor(Math.random() * 30) + 10 : 0 // Скидка 10-40%
                });
            });
        }
        
        console.log(`Загружено ${allProducts.length} товаров`);
        
        // Если на странице есть элементы для отображения товаров, обновляем их
        if (document.getElementById('top-products')) {
            loadTopProducts();
        }
        
        if (document.getElementById('all-products')) {
            loadCatalogProducts();
        }
        
        if (document.getElementById('products-grid-modal')) {
            loadModalProducts();
        }
    }, 500);
}

// ===== МОБИЛЬНОЕ МЕНЮ =====
function initMobileMenu() {
    const burgerMenu = document.getElementById('burgerMenu');
    const mobileNav = document.getElementById('mobileNav');
    
    if (burgerMenu && mobileNav) {
        burgerMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileNav.classList.toggle('active');
            const icon = burgerMenu.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                document.body.style.overflow = 'hidden';
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        });
        
        // Закрытие при клике на ссылку
        mobileNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileNav();
            });
        });
        
        // Закрытие при клике вне меню
        document.addEventListener('click', function(event) {
            if (!burgerMenu.contains(event.target) && !mobileNav.contains(event.target) && mobileNav.classList.contains('active')) {
                closeMobileNav();
            }
        });
        
        // Закрытие при нажатии Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && mobileNav.classList.contains('active')) {
                closeMobileNav();
            }
        });
    }
}

function closeMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    const burgerMenu = document.getElementById('burgerMenu');
    
    if (mobileNav && burgerMenu) {
        mobileNav.classList.remove('active');
        const icon = burgerMenu.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        document.body.style.overflow = '';
    }
}

// ===== НАВИГАЦИЯ МЕЖДУ СТРАНИЦАМИ =====
function showPage(pageId) {
    // Скрыть все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Показать выбранную страницу
    document.getElementById(pageId).classList.add('active');
    
    // Обновить активную ссылку в навигации
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Найти и активировать соответствующую ссылку
    const pageLinks = {
        'home': 'Главная',
        'catalog': 'Каталог',
        'about': 'О компании',
        'contacts': 'Контакты',
        'blog': 'Блог'
    };
    
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.trim() === pageLinks[pageId]) {
            link.classList.add('active');
        }
    });
    
    // Прокрутить наверх
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Закрыть мобильное меню
    closeMobileNav();
    
    // Инициализировать страницу если нужно
    switch(pageId) {
        case 'home':
            initHomePage();
            break;
        case 'catalog':
            initCatalogPage();
            break;
        case 'blog':
            initBlogPage();
            break;
    }
    
    // Обновить title страницы
    const pageTitles = {
        'home': 'DaTech | Премиум электроника и гаджеты',
        'catalog': 'Каталог товаров | DaTech',
        'about': 'О компании | DaTech',
        'contacts': 'Контакты | DaTech',
        'blog': 'Блог о технологиях | DaTech'
    };
    
    document.title = pageTitles[pageId] || 'DaTech';
}

function initHomePage() {
    console.log('Инициализация главной страницы');
    if (document.getElementById('home-categories')) {
        initCategoryCards();
    }
    if (allProducts.length > 0) {
        loadTopProducts();
    }
}

function initCatalogPage() {
    console.log('Инициализация страницы каталога');
    if (allProducts.length > 0) {
        loadCatalogProducts();
    }
    initSearch();
}

function initBlogPage() {
    console.log('Инициализация блога');
    // Здесь можно добавить загрузку статей из API
}

// ===== КАТЕГОРИИ И ТОВАРЫ =====
function initCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.querySelector('.category-title')?.textContent.toLowerCase();
            if (category) {
                openProductsModal(getCategoryIdByName(category));
            }
        });
    });
}

function getCategoryIdByName(name) {
    const categoryMap = {
        'смартфоны': 'smartphones',
        'ноутбуки': 'laptops',
        'умный дом': 'smart_home',
        'аудиотехника': 'audio',
        'планшеты': 'tablets',
        'носимая электроника': 'wearables',
        'гейминг': 'gaming',
        'фото и видео': 'photo_video',
        'телевизоры': 'tv',
        'офисная техника': 'office',
        'аксессуары': 'accessories',
        'дроны': 'drones'
    };
    
    return categoryMap[name.toLowerCase()] || 'all';
}

function openProductsModal(categoryId = 'all') {
    currentCategory = categoryId;
    
    const filtersContainer = document.getElementById('category-filters');
    if (filtersContainer) {
        filtersContainer.innerHTML = '';
        
        CATEGORIES.forEach(cat => {
            const isActive = cat.id === categoryId;
            const button = document.createElement('button');
            button.className = `category-filter ${isActive ? 'active' : ''}`;
            button.innerHTML = `${cat.icon} ${cat.name}`;
            button.onclick = () => filterCategory(cat.id);
            filtersContainer.appendChild(button);
        });
    }
    
    loadModalProducts();
    
    const modalTitle = document.getElementById('products-title');
    if (modalTitle) {
        const category = CATEGORIES.find(c => c.id === categoryId);
        modalTitle.textContent = category ? category.name : 'Все товары';
    }
    
    openModal('products-modal');
}

function filterCategory(categoryId) {
    currentCategory = categoryId;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Загружаем товары
    loadModalProducts();
}

function loadModalProducts() {
    const productsGrid = document.getElementById('products-grid-modal');
    if (!productsGrid) return;
    
    // Фильтруем товары по категории
    let filteredProducts = allProducts;
    if (currentCategory !== 'all') {
        filteredProducts = allProducts.filter(p => p.category === currentCategory);
    }
    
    // Сортируем товары
    filteredProducts.sort((a, b) => b.price - a.price);
    
    // Ограничиваем количество для модалки
    filteredProducts = filteredProducts.slice(0, 12);
    
    // Генерируем HTML
    let productsHTML = '';
    
    filteredProducts.forEach(product => {
        const oldPrice = product.discount > 0 ? 
            `<div class="old-price">${Math.round(product.price / (1 - product.discount/100)).toLocaleString()} ₽</div>` : '';
        
        productsHTML += `
            <div class="product-card">
                ${product.isNew ? '<div class="badge">NEW</div>' : ''}
                ${product.discount > 0 ? `<div class="badge" style="background: linear-gradient(135deg, #FF3B30, #FF9500); top: 45px;">-${product.discount}%</div>` : ''}
                
                <div class="product-image">
                    <div style="font-size: 60px; color: var(--accent);">${product.icon}</div>
                </div>
                
                <div class="product-info">
                    <div class="product-category">${CATEGORIES.find(c => c.id === product.category)?.name || product.category}</div>
                    <h4 class="product-title">${product.name}</h4>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-rating">
                        <div class="stars">
                            ${generateStars(product.rating)}
                        </div>
                        <div class="rating-value">${product.rating} (${product.reviews})</div>
                    </div>
                    
                    <div class="product-price">
                        <div class="current-price">${calculatePriceWithDiscount(product.price, product.discount).toLocaleString()} ₽</div>
                        ${oldPrice}
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn-add-to-cart" onclick="addToCart(${product.id}, '${product.category}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, ${product.discount})">
                            <i class="fas fa-cart-plus"></i> В корзину
                        </button>
                        <button class="btn-favorite ${favorites.has(product.id) ? 'active' : ''}" onclick="toggleFavorite(${product.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    productsGrid.innerHTML = productsHTML;
}

function loadTopProducts() {
    const topProductsContainer = document.getElementById('top-products');
    if (!topProductsContainer) return;
    
    // Берем 8 самых дорогих товаров как "топ"
    const topProducts = [...allProducts]
        .sort((a, b) => b.price - a.price)
        .slice(0, 8);
    
    let productsHTML = '';
    
    topProducts.forEach(product => {
        const oldPrice = product.discount > 0 ? 
            `<div class="old-price">${Math.round(product.price / (1 - product.discount/100)).toLocaleString()} ₽</div>` : '';
        
        productsHTML += `
            <div class="product-card">
                ${product.isNew ? '<div class="badge">NEW</div>' : ''}
                ${product.discount > 0 ? `<div class="badge" style="background: linear-gradient(135deg, #FF3B30, #FF9500); top: 45px;">-${product.discount}%</div>` : ''}
                
                <div class="product-image">
                    <div style="font-size: 60px; color: var(--accent);">${product.icon}</div>
                </div>
                
                <div class="product-info">
                    <div class="product-category">${CATEGORIES.find(c => c.id === product.category)?.name || product.category}</div>
                    <h4 class="product-title">${product.name}</h4>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-price">
                        <div class="current-price">${calculatePriceWithDiscount(product.price, product.discount).toLocaleString()} ₽</div>
                        ${oldPrice}
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn-add-to-cart" onclick="addToCart(${product.id}, '${product.category}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, ${product.discount})">
                            <i class="fas fa-cart-plus"></i> В корзину
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    topProductsContainer.innerHTML = productsHTML;
}

function loadCatalogProducts() {
    const allProductsContainer = document.getElementById('all-products');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (!allProductsContainer) return;
    
    // Фильтруем по поиску если есть
    const searchInput = document.getElementById('search-input');
    let filteredProducts = [...allProducts];
    
    if (searchInput && searchInput.value.trim()) {
        const searchTerm = searchInput.value.toLowerCase().trim();
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            (CATEGORIES.find(c => c.id === product.category)?.name || '').toLowerCase().includes(searchTerm)
        );
    }
    
    // Сортируем
    const sortSelect = document.getElementById('sort-select');
    const sortValue = sortSelect ? sortSelect.value : 'popular';
    
    switch(sortValue) {
        case 'price_asc':
            filteredProducts.sort((a, b) => calculatePriceWithDiscount(a.price, a.discount) - calculatePriceWithDiscount(b.price, b.discount));
            break;
        case 'price_desc':
            filteredProducts.sort((a, b) => calculatePriceWithDiscount(b.price, b.discount) - calculatePriceWithDiscount(a.price, a.discount));
            break;
        case 'new':
            filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            break;
        case 'rating':
            filteredProducts.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
            break;
        default: // popular
            filteredProducts.sort((a, b) => b.reviews - a.reviews);
    }
    
    // Пагинация
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(0, endIndex);
    
    let productsHTML = '';
    
    productsToShow.forEach(product => {
        const oldPrice = product.discount > 0 ? 
            `<div class="old-price">${Math.round(product.price / (1 - product.discount/100)).toLocaleString()} ₽</div>` : '';
        
        productsHTML += `
            <div class="product-card">
                ${product.isNew ? '<div class="badge">NEW</div>' : ''}
                ${product.discount > 0 ? `<div class="badge" style="background: linear-gradient(135deg, #FF3B30, #FF9500); top: 45px;">-${product.discount}%</div>` : ''}
                
                <div class="product-image">
                    <div style="font-size: 60px; color: var(--accent);">${product.icon}</div>
                </div>
                
                <div class="product-info">
                    <div class="product-category">${CATEGORIES.find(c => c.id === product.category)?.name || product.category}</div>
                    <h4 class="product-title">${product.name}</h4>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-rating">
                        <div class="stars">
                            ${generateStars(product.rating)}
                        </div>
                        <div class="rating-value">${product.rating} (${product.reviews})</div>
                    </div>
                    
                    <div class="product-price">
                        <div class="current-price">${calculatePriceWithDiscount(product.price, product.discount).toLocaleString()} ₽</div>
                        ${oldPrice}
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn-add-to-cart" onclick="addToCart(${product.id}, '${product.category}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, ${product.discount})">
                            <i class="fas fa-cart-plus"></i> В корзину
                        </button>
                        <button class="btn-favorite ${favorites.has(product.id) ? 'active' : ''}" onclick="toggleFavorite(${product.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    allProductsContainer.innerHTML = productsHTML;
    
    // Показываем/скрываем кнопку "Показать еще"
    if (loadMoreBtn) {
        if (endIndex >= filteredProducts.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
            loadMoreBtn.innerHTML = `<i class="fas fa-spinner"></i> Показать еще (${filteredProducts.length - endIndex})`;
        }
    }
}

function loadMoreProducts() {
    currentPage++;
    loadCatalogProducts();
}

function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // Добавляем debounce для поиска
        let timeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                currentPage = 1;
                loadCatalogProducts();
            }, 300);
        });
    }
}

function sortProducts() {
    currentPage = 1;
    loadCatalogProducts();
}

function searchProducts() {
    currentPage = 1;
    loadCatalogProducts();
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function calculatePriceWithDiscount(price, discount) {
    return Math.round(price * (1 - discount / 100));
}

// ===== МОДАЛЬНЫЕ ОКНА =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Добавляем обработчик Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal(modalId);
            }
        };
        modal._escapeHandler = escapeHandler;
        document.addEventListener('keydown', escapeHandler);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Удаляем обработчик Escape
        if (modal._escapeHandler) {
            document.removeEventListener('keydown', modal._escapeHandler);
            delete modal._escapeHandler;
        }
    }
}

function setupModalClickHandlers() {
    document.addEventListener('click', function(event) {
        // Закрытие модалок при клике вне их
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
        
        // Закрытие уведомлений
        const notification = document.getElementById('notification');
        if (notification && notification.classList.contains('active') && 
            !notification.contains(event.target) && 
            !event.target.closest('.notification')) {
            notification.classList.remove('active');
        }
    });
}

// ===== УВЕДОМЛЕНИЯ =====
function showNotification(message, type = 'success', duration = 4000) {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notification-icon');
    const text = document.getElementById('notification-text');
    
    if (!notification || !icon || !text) return;
    
    // Устанавливаем тип и сообщение
    notification.className = `notification ${type} active`;
    
    // Иконка в зависимости от типа
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    icon.className = icons[type] || icons.success;
    
    text.textContent = message;
    
    // Автоматическое скрытие
    clearTimeout(notification._timeout);
    notification._timeout = setTimeout(() => {
        notification.classList.remove('active');
    }, duration);
    
    // Добавляем кнопку закрытия
    notification.innerHTML = `
        <i id="notification-icon" class="${icon.className}"></i>
        <span id="notification-text">${message}</span>
        <button class="notification-close" onclick="this.parentElement.classList.remove('active')">
            &times;
        </button>
    `;
}

// ===== КОНСТАНТЫ ДАННЫХ =====
const CATEGORIES = [
    { id: 'all', name: 'Все товары', icon: '📦' },
    { id: 'smartphones', name: 'Смартфоны', icon: '📱' },
    { id: 'laptops', name: 'Ноутбуки', icon: '💻' },
    { id: 'tablets', name: 'Планшеты', icon: '📱' },
    { id: 'audio', name: 'Аудиотехника', icon: '🎧' },
    { id: 'smart_home', name: 'Умный дом', icon: '🏠' },
    { id: 'wearables', name: 'Носимая электроника', icon: '⌚' },
    { id: 'gaming', name: 'Гейминг', icon: '🎮' },
    { id: 'photo_video', name: 'Фото и Видео', icon: '📸' },
    { id: 'tv', name: 'Телевизоры', icon: '📺' },
    { id: 'office', name: 'Офисная техника', icon: '🖨️' },
    { id: 'accessories', name: 'Аксессуары', icon: '🔌' },
    { id: 'drones', name: 'Дроны', icon: '🚁' }
];

const PRODUCTS_DATA = {
    smartphones: [
        { id: 1, name: "iPhone 16 Pro", price: 129990, description: "Титановый корпус, процессор A18 Pro, камера 48 МП", icon: "📱" },
        { id: 2, name: "Samsung Galaxy S25 Ultra", price: 149990, description: "S Pen, камера 200 МП, Snapdragon 8 Gen 4", icon: "📱" },
        { id: 3, name: "Xiaomi 15 Pro", price: 99990, description: "Камера Leica, Snapdragon 8 Gen 4, 120W зарядка", icon: "📱" },
        { id: 4, name: "Google Pixel 9 Pro", price: 109990, description: "Тензорный чип G4, ИИ-фото, 7 лет обновлений", icon: "📱" },
        { id: 5, name: "OnePlus 13", price: 89990, description: "120Hz дисплей, 150W зарядка, Hasselblad камера", icon: "📱" },
        { id: 6, name: "ASUS ROG Phone 8", price: 119990, description: "Игровой смартфон, 165Hz, активное охлаждение", icon: "📱" }
    ],
    laptops: [
        { id: 10, name: "MacBook Pro 16\" M4 Max", price: 399990, description: "Максимальная производительность, Mini-LED", icon: "💻" },
        { id: 11, name: "ASUS ROG Zephyrus G16", price: 229990, description: "RTX 4080, OLED 240Hz, i9-14900HX", icon: "💻" },
        { id: 12, name: "Dell XPS 15", price: 199990, description: "4K OLED, Intel Core Ultra 9, тонкий корпус", icon: "💻" },
        { id: 13, name: "Lenovo Legion Pro 7i", price: 209990, description: "RTX 4090, i9-14900HX, 32 ГБ RAM", icon: "💻" },
        { id: 14, name: "Microsoft Surface Laptop 6", price: 169990, description: "3:2 дисплей, Windows 11, тонкий и легкий", icon: "💻" }
    ],
    audio: [
        { id: 17, name: "Apple AirPods Pro 3", price: 29990, description: "Активное шумоподавление, пространственное аудио", icon: "🎧" },
        { id: 18, name: "Sony WH-1000XM6", price: 39990, description: "Лучшее шумоподавление, 40 часов работы", icon: "🎧" },
        { id: 19, name: "Samsung Galaxy Buds3 Pro", price: 24990, description: "24-bit Hi-Fi звук, ANC, беспроводная зарядка", icon: "🎧" },
        { id: 20, name: "Sony HT-A5000", price: 89990, description: "Саундбар Dolby Atmos, 7.1.2, беспроводной сабвуфер", icon: "🔊" }
    ],
    smart_home: [
        { id: 21, name: "Apple HomePod 3", price: 34990, description: "Умная колонка с пространственным аудио", icon: "🏠" },
        { id: 22, name: "Яндекс Станция 3", price: 19990, description: "С Алисой, экран 8\", умный дом", icon: "🏠" },
        { id: 23, name: "Xiaomi Robot Vacuum X10", price: 49990, description: "Робот-пылесос с автоподъемом и мытьем", icon: "🏠" },
        { id: 24, name: "Philips Hue Starter Kit", price: 24990, description: "Умные лампы, мост, управление со смартфона", icon: "💡" }
    ],
    gaming: [
        { id: 25, name: "PlayStation 5 Pro", price: 79990, description: "Консоль нового поколения, 8K, 120 FPS", icon: "🎮" },
        { id: 26, name: "Xbox Series X", price: 59990, description: "4K 120FPS, Game Pass, быстрая загрузка", icon: "🎮" },
        { id: 27, name: "Nintendo Switch 2", price: 39990, description: "Гибридная консоль, экран OLED", icon: "🎮" },
        { id: 28, name: "Steam Deck OLED", price: 69990, description: "Портативная игровая ПК-консоль", icon: "🎮" }
    ],
    wearables: [
        { id: 29, name: "Apple Watch Ultra 3", price: 79990, description: "Спортивные функции, дайвинг, 48 часов", icon: "⌚" },
        { id: 30, name: "Samsung Galaxy Watch7", price: 39990, description: "Классический дизайн, Body Composition", icon: "⌚" },
        { id: 31, name: "Garmin Fenix 8", price: 89990, description: "Для экстремальных видов спорта, 1 месяц работы", icon: "⌚" },
        { id: 32, name: "Apple Vision Pro 2", price: 349990, description: "Смешанная реальность, пространственные вычисления", icon: "👓" }
    ]
};

// Экспортируем функции для использования в других файлах
window.showPage = showPage;
window.openProductsModal = openProductsModal;
window.openModal = openModal;
window.closeModal = closeModal;
window.showNotification = showNotification;
window.filterCategory = filterCategory;
