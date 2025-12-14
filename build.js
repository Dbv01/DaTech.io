const fs = require('fs');
const path = require('path');

// Функция для чтения файла
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

// Функция для замены импортов
function buildFile() {
    console.log('🚀 Начинаем сборку проекта DaTech...');
    
    // Читаем основной index.html
    let indexHtml = readFile('index.html');
    
    // Заменяем загрузку компонентов на их реальное содержимое
    const componentPattern = /<!--\s*COMPONENT:\s*([^>]+)\s*-->/g;
    
    // Сначала загружаем все компоненты
    const components = {
        // Страницы
        'home': readFile('pages/home.html'),
        'catalog': readFile('pages/catalog.html'),
        'about': readFile('pages/about.html'),
        'contacts': readFile('pages/contacts.html'),
        'blog': readFile('pages/blog.html'),
        
        // Компоненты
        'footer': readFile('components/footer.html'),
        'auth-modal': readFile('components/auth-modal.html'),
        'products-modal': readFile('components/products-modal.html'),
        'cart-modal': readFile('components/cart-modal.html'),
        'checkout-modal': readFile('components/checkout-modal.html'),
        
        // Стили
        'styles': readFile('css/styles.css'),
        'responsive': readFile('css/responsive.css'),
        
        // Скрипты
        'main-js': readFile('js/main.js'),
        'auth-js': readFile('js/auth.js'),
        'cart-js': readFile('js/cart.js'),
        'products-js': readFile('js/products.js')
    };
    
    // Заменяем плейсхолдеры в index.html
    for (const [key, content] of Object.entries(components)) {
        const placeholder = `<!-- COMPONENT: ${key} -->`;
        if (indexHtml.includes(placeholder)) {
            indexHtml = indexHtml.replace(placeholder, content);
            console.log(`✅ Загружен компонент: ${key}`);
        }
    }
    
    // Убираем асинхронную загрузку
    indexHtml = indexHtml.replace(
        /<script>\s*async function loadComponents\(\)[\s\S]*?<\/script>/,
        '<script>// Компоненты уже загружены в сборке</script>'
    );
    
    // Создаем папку dist если её нет
    if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist');
    }
    
    // Сохраняем собранный файл
    fs.writeFileSync('dist/index.html', indexHtml);
    
    // Копируем CSS и JS файлы в dist
    fs.copyFileSync('css/styles.css', 'dist/styles.css');
    fs.copyFileSync('css/responsive.css', 'dist/responsive.css');
    fs.copyFileSync('js/main.js', 'dist/main.js');
    fs.copyFileSync('js/auth.js', 'dist/auth.js');
    fs.copyFileSync('js/cart.js', 'dist/cart.js');
    fs.copyFileSync('js/products.js', 'dist/products.js');
    
    console.log('✅ Сборка завершена! Файл создан: dist/index.html');
    console.log('📁 Для GitHub Pages залейте содержимое папки dist');
}

// Запускаем сборку
buildFile();
