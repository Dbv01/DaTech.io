// ===== АВТОРИЗАЦИЯ И ПОЛЬЗОВАТЕЛИ =====

function checkAuth() {
    const savedUser = localStorage.getItem('datech_user');
    const savedUsers = localStorage.getItem('datech_users');
    
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('Пользователь авторизован:', currentUser.email);
        } catch (e) {
            console.error('Ошибка парсинга пользователя:', e);
            currentUser = null;
        }
    }
    
    if (!savedUsers) {
        // Создаем начальных пользователей (включая админа)
        const initialUsers = [
            {
                id: 1,
                email: 'admin@datech.com',
                password: 'admin123',
                name: 'Администратор',
                role: 'admin',
                phone: '+7 (999) 000-00-00',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                email: 'user@datech.com',
                password: 'user123',
                name: 'Тестовый Пользователь',
                role: 'user',
                phone: '+7 (999) 111-11-11',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('datech_users', JSON.stringify(initialUsers));
    }
}

function updateUserUI() {
    const userSection = document.getElementById('user-section');
    if (!userSection) return;
    
    if (currentUser) {
        const firstLetter = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 
                          currentUser.email.charAt(0).toUpperCase();
        
        userSection.innerHTML = `
            <div class="user-avatar" onclick="toggleUserMenu()" style="cursor: pointer;">
                ${firstLetter}
            </div>
            <div class="user-dropdown" id="user-dropdown" style="display: none;">
                <div class="user-info">
                    <strong>${currentUser.name}</strong>
                    <small>${currentUser.email}</small>
                </div>
                <div class="user-menu-items">
                    <a href="#" onclick="showUserProfile()">
                        <i class="fas fa-user"></i> Профиль
                    </a>
                    <a href="#" onclick="showUserOrders()">
                        <i class="fas fa-shopping-bag"></i> Мои заказы
                    </a>
                    ${currentUser.role === 'admin' ? 
                        `<a href="#" onclick="showAdminPanel()">
                            <i class="fas fa-cog"></i> Админ-панель
                        </a>` : ''}
                    <hr>
                    <a href="#" onclick="logout()" style="color: var(--danger);">
                        <i class="fas fa-sign-out-alt"></i> Выйти
                    </a>
                </div>
            </div>
        `;
    } else {
        userSection.innerHTML = `
            <button class="btn-icon" onclick="showAuthModal('login')" title="Войти в аккаунт">
                <i class="fas fa-user"></i>
            </button>
        `;
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        
        // Закрытие при клике вне меню
        if (dropdown.style.display === 'block') {
            setTimeout(() => {
                document.addEventListener('click', closeUserMenuOnClickOutside);
            }, 0);
        } else {
            document.removeEventListener('click', closeUserMenuOnClickOutside);
        }
    }
}

function closeUserMenuOnClickOutside(event) {
    const dropdown = document.getElementById('user-dropdown');
    const avatar = document.querySelector('.user-avatar');
    
    if (dropdown && avatar && 
        !dropdown.contains(event.target) && 
        !avatar.contains(event.target)) {
        dropdown.style.display = 'none';
        document.removeEventListener('click', closeUserMenuOnClickOutside);
    }
}

function showAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('auth-title');
    const content = document.getElementById('auth-form-content');
    
    if (!modal || !title || !content) return;
    
    if (mode === 'login') {
        title.textContent = 'Вход в аккаунт';
        content.innerHTML = `
            <div class="auth-social">
                <button class="btn-auth-social" onclick="authWithTelegram()">
                    <i class="fab fa-telegram"></i> Войти через Telegram
                </button>
                <button class="btn-auth-social" onclick="authWithGoogle()">
                    <i class="fab fa-google"></i> Войти через Google
                </button>
            </div>
            
            <div class="auth-divider">
                <span>или через email</span>
            </div>
            
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="auth-email" class="form-control" placeholder="email@example.com" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Пароль</label>
                <div style="position: relative;">
                    <input type="password" id="auth-password" class="form-control" placeholder="••••••••" required>
                    <button type="button" class="btn-password-toggle" onclick="togglePasswordVisibility('auth-password')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            
            <div class="auth-options">
                <label class="auth-remember">
                    <input type="checkbox" id="auth-remember"> Запомнить меня
                </label>
                <a href="#" onclick="showPasswordRecovery()">Забыли пароль?</a>
            </div>
            
            <button type="button" class="btn btn-primary" onclick="handleAuth('login')" style="width: 100%; margin-top: 20px;">
                <i class="fas fa-sign-in-alt"></i> Войти
            </button>
            
            <div class="auth-switch">
                Нет аккаунта? <a href="#" onclick="showAuthModal('register')">Зарегистрироваться</a>
            </div>
        `;
    } else if (mode === 'register') {
        title.textContent = 'Регистрация';
        content.innerHTML = `
            <div class="form-group">
                <label class="form-label">Имя</label>
                <input type="text" id="auth-name" class="form-control" placeholder="Ваше имя" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="auth-email" class="form-control" placeholder="email@example.com" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Телефон</label>
                <input type="tel" id="auth-phone" class="form-control" placeholder="+7 (900) 123-45-67">
            </div>
            
            <div class="form-group">
                <label class="form-label">Пароль</label>
                <div style="position: relative;">
                    <input type="password" id="auth-password" class="form-control" placeholder="••••••••" required>
                    <button type="button" class="btn-password-toggle" onclick="togglePasswordVisibility('auth-password')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <small style="color: var(--gray); font-size: 12px; margin-top: 5px; display: block;">
                    Минимум 8 символов, буквы и цифры
                </small>
            </div>
            
            <div class="form-group">
                <label class="form-label">Подтвердите пароль</label>
                <div style="position: relative;">
                    <input type="password" id="auth-confirm-password" class="form-control" placeholder="••••••••" required>
                    <button type="button" class="btn-password-toggle" onclick="togglePasswordVisibility('auth-confirm-password')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            
            <div class="auth-agreement">
                <label>
                    <input type="checkbox" id="auth-agreement" required>
                    Я согласен с <a href="#" onclick="showNotification('Условия использования сайта', 'info')">условиями использования</a> 
                    и <a href="#" onclick="showNotification('Политика конфиденциальности', 'info')">политикой конфиденциальности</a>
                </label>
            </div>
            
            <button type="button" class="btn btn-primary" onclick="handleAuth('register')" style="width: 100%; margin-top: 20px;">
                <i class="fas fa-user-plus"></i> Зарегистрироваться
            </button>
            
            <div class="auth-switch">
                Уже есть аккаунт? <a href="#" onclick="showAuthModal('login')">Войти</a>
            </div>
        `;
    } else if (mode === 'recovery') {
        title.textContent = 'Восстановление пароля';
        content.innerHTML = `
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="recovery-email" class="form-control" placeholder="email@example.com" required>
            </div>
            
            <p style="color: var(--gray); font-size: 14px; margin-bottom: 20px;">
                На указанный email будет отправлена ссылка для восстановления пароля
            </p>
            
            <button type="button" class="btn btn-primary" onclick="handlePasswordRecovery()" style="width: 100%;">
                <i class="fas fa-paper-plane"></i> Отправить ссылку
            </button>
            
            <div class="auth-switch">
                <a href="#" onclick="showAuthModal('login')">← Вернуться к входу</a>
            </div>
        `;
    }
    
    openModal('auth-modal');
}

function handleAuth(action) {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const confirmPassword = document.getElementById('auth-confirm-password')?.value.trim();
    const name = document.getElementById('auth-name')?.value.trim() || email.split('@')[0];
    const phone = document.getElementById('auth-phone')?.value.trim();
    
    // Валидация
    if (!email || !password) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Введите корректный email', 'error');
        return;
    }
    
    if (action === 'register') {
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (password.length < 8) {
            showNotification('Пароль должен быть не менее 8 символов', 'error');
            return;
        }
        
        if (!document.getElementById('auth-agreement')?.checked) {
            showNotification('Необходимо согласие с условиями', 'error');
            return;
        }
    }
    
    // Получаем пользователей из localStorage
    let users = JSON.parse(localStorage.getItem('datech_users')) || [];
    
    if (action === 'login') {
        // Поиск пользователя
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            currentUser = {
                ...user,
                lastLogin: new Date().toISOString()
            };
            
            // Сохраняем сессию
            localStorage.setItem('datech_user', JSON.stringify(currentUser));
            
            // Запоминаем если нужно
            const rememberMe = document.getElementById('auth-remember')?.checked;
            if (rememberMe) {
                localStorage.setItem('datech_remember', 'true');
            }
            
            closeModal('auth-modal');
            updateUserUI();
            showNotification(`Добро пожаловать, ${currentUser.name}!`, 'success');
            
            // Обновляем историю активности
            updateUserActivity();
        } else {
            showNotification('Неверный email или пароль', 'error');
        }
    } else if (action === 'register') {
        // Проверка на существующего пользователя
        if (users.some(u => u.email === email)) {
            showNotification('Пользователь с таким email уже существует', 'error');
            return;
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            email,
            password,
            name,
            phone: phone || '',
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            preferences: {
                newsletter: true,
                smsNotifications: false,
                emailNotifications: true
            }
        };
        
        users.push(newUser);
        localStorage.setItem('datech_users', JSON.stringify(users));
        
        currentUser = newUser;
        localStorage.setItem('datech_user', JSON.stringify(newUser));
        
        closeModal('auth-modal');
        updateUserUI();
        showNotification('Регистрация успешна! Добро пожаловать!', 'success');
        
        // Добавляем бонус за регистрацию
        addRegistrationBonus();
    }
}

function authWithTelegram() {
    showNotification('Telegram авторизация в разработке', 'info');
    // В реальном приложении здесь была бы интеграция с Telegram Login
}

function authWithGoogle() {
    showNotification('Google авторизация в разработке', 'info');
    // В реальном приложении здесь была бы интеграция с Google OAuth
}

function showPasswordRecovery() {
    showAuthModal('recovery');
}

function handlePasswordRecovery() {
    const email = document.getElementById('recovery-email').value.trim();
    
    if (!email || !validateEmail(email)) {
        showNotification('Введите корректный email', 'error');
        return;
    }
    
    // Проверяем существование пользователя
    const users = JSON.parse(localStorage.getItem('datech_users')) || [];
    const userExists = users.some(u => u.email === email);
    
    if (userExists) {
        showNotification(`Ссылка для восстановления отправлена на ${email}`, 'success');
        
        // Сохраняем токен восстановления (в реальном приложении отправляли бы email)
        const recoveryToken = generateRecoveryToken();
        localStorage.setItem(`datech_recovery_${email}`, JSON.stringify({
            token: recoveryToken,
            expires: Date.now() + 3600000 // 1 час
        }));
        
        closeModal('auth-modal');
    } else {
        showNotification('Пользователь с таким email не найден', 'error');
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        button.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function logout() {
    // Сохраняем историю активности перед выходом
    updateUserActivity();
    
    // Очищаем данные сессии
    currentUser = null;
    localStorage.removeItem('datech_user');
    
    // Закрываем меню пользователя если открыто
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
    
    updateUserUI();
    showNotification('Вы успешно вышли из аккаунта', 'success');
}

// ===== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ =====
function showUserProfile() {
    if (!currentUser) {
        showAuthModal('login');
        return;
    }
    
    const modalContent = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3 class="modal-title">Мой профиль</h3>
                <button class="modal-close" onclick="closeModal('profile-modal')">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="profile-header">
                    <div class="profile-avatar">
                        ${currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="profile-info">
                        <h4>${currentUser.name}</h4>
                        <p>${currentUser.email}</p>
                        <p>${currentUser.phone || 'Телефон не указан'}</p>
                    </div>
                </div>
                
                <div class="profile-stats">
                    <div class="profile-stat">
                        <div class="stat-value">${getUserOrderCount()}</div>
                        <div class="stat-label">Заказов</div>
                    </div>
                    <div class="profile-stat">
                        <div class="stat-value">${favorites.size}</div>
                        <div class="stat-label">Избранное</div>
                    </div>
                    <div class="profile-stat">
                        <div class="stat-value">${getDaysSinceRegistration()}</div>
                        <div class="stat-label">Дней с нами</div>
                    </div>
                </div>
                
                <form id="profile-form">
                    <div class="form-group">
                        <label class="form-label">Имя</label>
                        <input type="text" id="profile-name" class="form-control" value="${currentUser.name}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Телефон</label>
                        <input type="tel" id="profile-phone" class="form-control" value="${currentUser.phone || ''}" placeholder="+7 (900) 123-45-67">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" id="profile-email" class="form-control" value="${currentUser.email}" disabled>
                        <small style="color: var(--gray);">Email нельзя изменить</small>
                    </div>
                    
                    <h4 style="margin: 30px 0 15px;">Настройки уведомлений</h4>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="profile-newsletter" ${currentUser.preferences?.newsletter ? 'checked' : ''}>
                            <span>Получать новости и акции</span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="profile-email-notifications" ${currentUser.preferences?.emailNotifications ? 'checked' : ''}>
                            <span>Уведомления на email</span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="profile-sms-notifications" ${currentUser.preferences?.smsNotifications ? 'checked' : ''}>
                            <span>SMS уведомления</span>
                        </label>
                    </div>
                    
                    <button type="button" class="btn btn-primary" onclick="saveProfile()" style="width: 100%; margin-top: 20px;">
                        <i class="fas fa-save"></i> Сохранить изменения
                    </button>
                </form>
            </div>
        </div>
    `;
    
    // Создаем или находим модальное окно профиля
    let profileModal = document.getElementById('profile-modal');
    if (!profileModal) {
        profileModal = document.createElement('div');
        profileModal.id = 'profile-modal';
        profileModal.className = 'modal';
        document.body.appendChild(profileModal);
    }
    
    profileModal.innerHTML = modalContent;
    openModal('profile-modal');
}

function saveProfile() {
    if (!currentUser) return;
    
    const name = document.getElementById('profile-name').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();
    const newsletter = document.getElementById('profile-newsletter').checked;
    const emailNotifications = document.getElementById('profile-email-notifications').checked;
    const smsNotifications = document.getElementById('profile-sms-notifications').checked;
    
    // Обновляем данные пользователя
    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.preferences = {
        newsletter,
        emailNotifications,
        smsNotifications
    };
    
    // Обновляем в localStorage
    localStorage.setItem('datech_user', JSON.stringify(currentUser));
    
    // Обновляем в списке пользователей
    let users = JSON.parse(localStorage.getItem('datech_users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('datech_users', JSON.stringify(users));
    }
    
    // Обновляем UI
    updateUserUI();
    
    showNotification('Профиль успешно обновлен', 'success');
    setTimeout(() => {
        closeModal('profile-modal');
    }, 1000);
}

function showUserOrders() {
    if (!currentUser) {
        showAuthModal('login');
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('datech_orders')) || [];
    const userOrders = orders.filter(order => order.userId === currentUser.id);
    
    let ordersHTML = '';
    
    if (userOrders.length === 0) {
        ordersHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <h3>Заказов нет</h3>
                <p>У вас еще нет заказов. Самое время что-нибудь выбрать!</p>
                <button class="btn btn-primary" onclick="closeModal('orders-modal'); showPage('catalog');">
                    <i class="fas fa-shopping-bag"></i> Перейти в каталог
                </button>
            </div>
        `;
    } else {
        ordersHTML = `
            <div class="orders-list">
                ${userOrders.map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <div class="order-id">Заказ #${order.id}</div>
                            <div class="order-status ${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</div>
                        </div>
                        
                        <div class="order-date">
                            <i class="fas fa-calendar"></i> ${new Date(order.date).toLocaleDateString('ru-RU')}
                        </div>
                        
                        <div class="order-items">
                            ${order.items.slice(0, 2).map(item => `
                                <div class="order-item">
                                    <div class="item-name">${item.name} × ${item.quantity}</div>
                                    <div class="item-price">${(item.price * item.quantity).toLocaleString()} ₽</div>
                                </div>
                            `).join('')}
                            
                            ${order.items.length > 2 ? 
                                `<div class="order-more">и еще ${order.items.length - 2} товаров</div>` : ''}
                        </div>
                        
                        <div class="order-total">
                            <span>Итого:</span>
                            <span class="total-price">${order.total.toLocaleString()} ₽</span>
                        </div>
                        
                        <button class="btn btn-outline btn-sm" onclick="viewOrderDetails('${order.id}')" style="width: 100%; margin-top: 15px;">
                            <i class="fas fa-eye"></i> Подробнее
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    const modalContent = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">Мои заказы</h3>
                <button class="modal-close" onclick="closeModal('orders-modal')">&times;</button>
            </div>
            
            <div class="modal-body">
                ${ordersHTML}
            </div>
        </div>
    `;
    
    let ordersModal = document.getElementById('orders-modal');
    if (!ordersModal) {
        ordersModal = document.createElement('div');
        ordersModal.id = 'orders-modal';
        ordersModal.className = 'modal';
        document.body.appendChild(ordersModal);
    }
    
    ordersModal.innerHTML = modalContent;
    openModal('orders-modal');
}

function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('datech_orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showNotification('Заказ не найден', 'error');
        return;
    }
    
    let detailsHTML = `
        <div class="order-details">
            <div class="detail-section">
                <h4>Информация о заказе</h4>
                <div class="detail-row">
                    <span>Номер заказа:</span>
                    <strong>${order.id}</strong>
                </div>
                <div class="detail-row">
                    <span>Дата:</span>
                    <span>${new Date(order.date).toLocaleString('ru-RU')}</span>
                </div>
                <div class="detail-row">
                    <span>Статус:</span>
                    <span class="order-status ${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Данные для доставки</h4>
                <div class="detail-row">
                    <span>Получатель:</span>
                    <span>${order.customer.name}</span>
                </div>
                <div class="detail-row">
                    <span>Телефон:</span>
                    <span>${order.customer.phone}</span>
                </div>
                <div class="detail-row">
                    <span>Адрес:</span>
                    <span>${order.customer.address}</span>
                </div>
                ${order.customer.email ? `
                    <div class="detail-row">
                        <span>Email:</span>
                        <span>${order.customer.email}</span>
                    </div>
                ` : ''}
                ${order.customer.comment ? `
                    <div class="detail-row">
                        <span>Комментарий:</span>
                        <span>${order.customer.comment}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="detail-section">
                <h4>Состав заказа</h4>
                <div class="order-items-detailed">
                    ${order.items.map(item => `
                        <div class="detailed-item">
                            <div class="item-main">
                                <div class="item-icon">${getProductIcon(item.category)}</div>
                                <div class="item-info">
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-category">${getCategoryName(item.category)}</div>
                                </div>
                            </div>
                            <div class="item-details">
                                <div class="item-quantity">${item.quantity} × ${item.price.toLocaleString()} ₽</div>
                                <div class="item-total">${(item.price * item.quantity).toLocaleString()} ₽</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-summary-detailed">
                    <div class="summary-row">
                        <span>Товары:</span>
                        <span>${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} ₽</span>
                    </div>
                    <div class="summary-row">
                        <span>Доставка:</span>
                        <span>${order.deliveryCost === 0 ? 'Бесплатно' : order.deliveryCost?.toLocaleString() + ' ₽' || 'Бесплатно'}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Итого:</span>
                        <span>${order.total.toLocaleString()} ₽</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalContent = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">Детали заказа #${order.id}</h3>
                <button class="modal-close" onclick="closeModal('order-details-modal')">&times;</button>
            </div>
            
            <div class="modal-body">
                ${detailsHTML}
            </div>
            
            <div class="modal-footer" style="padding: 20px; border-top: 1px solid rgba(0,0,0,0.1);">
                <button class="btn btn-primary" onclick="closeModal('order-details-modal')">
                    <i class="fas fa-check"></i> Понятно
                </button>
                ${order.status === 'new' ? `
                    <button class="btn btn-outline" onclick="cancelOrder('${order.id}')" style="margin-left: 10px;">
                        <i class="fas fa-times"></i> Отменить заказ
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    let detailsModal = document.getElementById('order-details-modal');
    if (!detailsModal) {
        detailsModal = document.createElement('div');
        detailsModal.id = 'order-details-modal';
        detailsModal.className = 'modal';
        document.body.appendChild(detailsModal);
    }
    
    detailsModal.innerHTML = modalContent;
    openModal('order-details-modal');
}

function showAdminPanel() {
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Доступ запрещен', 'error');
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('datech_orders')) || [];
    const users = JSON.parse(localStorage.getItem('datech_users')) || [];
    
    const modalContent = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3 class="modal-title">Админ-панель</h3>
                <button class="modal-close" onclick="closeModal('admin-modal')">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="admin-tabs">
                    <button class="admin-tab active" onclick="switchAdminTab('orders')">
                        <i class="fas fa-shopping-bag"></i> Заказы (${orders.length})
                    </button>
                    <button class="admin-tab" onclick="switchAdminTab('users')">
                        <i class="fas fa-users"></i> Пользователи (${users.length})
                    </button>
                    <button class="admin-tab" onclick="switchAdminTab('analytics')">
                        <i class="fas fa-chart-bar"></i> Аналитика
                    </button>
                </div>
                
                <div id="admin-orders-tab" class="admin-tab-content active">
                    ${orders.length === 0 ? 
                        '<p style="text-align: center; padding: 40px; color: var(--gray);">Заказов нет</p>' :
                        orders.map(order => `
                            <div class="admin-order-card">
                                <div class="admin-order-header">
                                    <div>
                                        <strong>#${order.id}</strong>
                                        <span class="order-customer">${order.customer.name}</span>
                                    </div>
                                    <div class="order-controls">
                                        <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 5px 10px; border-radius: 6px; border: 1px solid var(--light-dark);">
                                            <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новый</option>
                                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
                                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
                                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                                        </select>
                                        <button class="btn-icon" onclick="viewOrderDetails('${order.id}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="admin-order-info">
                                    <span><i class="fas fa-calendar"></i> ${new Date(order.date).toLocaleDateString()}</span>
                                    <span><i class="fas fa-ruble-sign"></i> ${order.total.toLocaleString()} ₽</span>
                                    <span><i class="fas fa-box"></i> ${order.items.length} товаров</span>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
                
                <div id="admin-users-tab" class="admin-tab-content">
                    ${users.length === 0 ? 
                        '<p style="text-align: center; padding: 40px; color: var(--gray);">Пользователей нет</p>' :
                        users.map(user => `
                            <div class="admin-user-card">
                                <div class="admin-user-header">
                                    <div class="user-avatar-sm">${user.name.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <div><strong>${user.name}</strong> <span class="user-role ${user.role}">${user.role === 'admin' ? 'Админ' : 'Пользователь'}</span></div>
                                        <div class="user-email">${user.email}</div>
                                    </div>
                                </div>
                                <div class="admin-user-info">
                                    <span>Зарегистрирован: ${new Date(user.createdAt).toLocaleDateString()}</span>
                                    <span>Телефон: ${user.phone || 'не указан'}</span>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
                
                <div id="admin-analytics-tab" class="admin-tab-content">
                    <div class="analytics-stats">
                        <div class="analytics-stat">
                            <div class="stat-value">${orders.length}</div>
                            <div class="stat-label">Всего заказов</div>
                        </div>
                        <div class="analytics-stat">
                            <div class="stat-value">${orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()} ₽</div>
                            <div class="stat-label">Общая выручка</div>
                        </div>
                        <div class="analytics-stat">
                            <div class="stat-value">${users.length}</div>
                            <div class="stat-label">Пользователей</div>
                        </div>
                        <div class="analytics-stat">
                            <div class="stat-value">${cart.length}</div>
                            <div class="stat-label">Активных корзин</div>
                        </div>
                    </div>
                    
                    <h4 style="margin-top: 30px;">Последние заказы</h4>
                    <div class="recent-orders">
                        ${orders.slice(-5).reverse().map(order => `
                            <div class="recent-order">
                                <div class="recent-order-id">#${order.id}</div>
                                <div class="recent-order-customer">${order.customer.name}</div>
                                <div class="recent-order-total">${order.total.toLocaleString()} ₽</div>
                                <div class="recent-order-status ${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    let adminModal = document.getElementById('admin-modal');
    if (!adminModal) {
        adminModal = document.createElement('div');
        adminModal.id = 'admin-modal';
        adminModal.className = 'modal';
        document.body.appendChild(adminModal);
    }
    
    adminModal.innerHTML = modalContent;
    openModal('admin-modal');
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function generateRecoveryToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getUserOrderCount() {
    if (!currentUser) return 0;
    const orders = JSON.parse(localStorage.getItem('datech_orders')) || [];
    return orders.filter(order => order.userId === currentUser.id).length;
}

function getDaysSinceRegistration() {
    if (!currentUser || !currentUser.createdAt) return 0;
    const created = new Date(currentUser.createdAt);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getOrderStatusClass(status) {
    const classes = {
        'new': 'status-new',
        'processing': 'status-processing',
        'shipped': 'status-shipped',
        'delivered': 'status-delivered',
        'cancelled': 'status-cancelled'
    };
    return classes[status] || 'status-new';
}

function getOrderStatusText(status) {
    const texts = {
        'new': 'Новый',
        'processing': 'В обработке',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен'
    };
    return texts[status] || 'Новый';
}

function getProductIcon(category) {
    const icons = {
        'smartphones': '📱',
        'laptops': '💻',
        'audio': '🎧',
        'smart_home': '🏠',
        'gaming': '🎮',
        'wearables': '⌚'
    };
    return icons[category] || '📦';
}

function getCategoryName(categoryId) {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
}

function updateUserActivity() {
    if (!currentUser) return;
    
    let activity = JSON.parse(localStorage.getItem('datech_activity')) || {};
    activity[currentUser.id] = {
        lastActive: new Date().toISOString(),
        pageViews: (activity[currentUser.id]?.pageViews || 0) + 1
    };
    
    localStorage.setItem('datech_activity', JSON.stringify(activity));
}

function addRegistrationBonus() {
    if (!currentUser) return;
    
    // В реальном приложении здесь можно добавить бонусные баллы
    showNotification('🎉 Спасибо за регистрацию! Вы получили 500 бонусных баллов!', 'success');
}

function updateOrderStatus(orderId, newStatus) {
    let orders = JSON.parse(localStorage.getItem('datech_orders')) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('datech_orders', JSON.stringify(orders));
        showNotification(`Статус заказа #${orderId} обновлен на "${getOrderStatusText(newStatus)}"`, 'success');
        
        // Обновляем UI если открыта админ-панель
        const adminModal = document.getElementById('admin-modal');
        if (adminModal && adminModal.classList.contains('active')) {
            showAdminPanel();
        }
    }
}

function cancelOrder(orderId) {
    if (confirm('Вы уверены, что хотите отменить этот заказ?')) {
        updateOrderStatus(orderId, 'cancelled');
        closeModal('order-details-modal');
    }
}

function switchAdminTab(tabName) {
    // Убираем активный класс со всех вкладок и контента
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
    
    // Активируем выбранную вкладку
    const tabButton = document.querySelector(`.admin-tab[onclick*="${tabName}"]`);
    if (tabButton) tabButton.classList.add('active');
    
    const tabContent = document.getElementById(`admin-${tabName}-tab`);
    if (tabContent) tabContent.classList.add('active');
}

// Экспортируем функции
window.showAuthModal = showAuthModal;
window.handleAuth = handleAuth;
window.togglePasswordVisibility = togglePasswordVisibility;
window.authWithTelegram = authWithTelegram;
window.authWithGoogle = authWithGoogle;
window.showPasswordRecovery = showPasswordRecovery;
window.handlePasswordRecovery = handlePasswordRecovery;
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;
window.showUserProfile = showUserProfile;
window.showUserOrders = showUserOrders;
window.showAdminPanel = showAdminPanel;
