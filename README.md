# battery_type — нативный гостевой каталог

Tauri 2, React, TypeScript, CLIP через Transformers.js. Две страницы: каталог с фильтром и Подробнее. Вход, публикация и удаление исключены из маршрутов нативной сборки.

API: http://192.168.1.128:53000/api — реальный LAN IPv4 Ethernet на машине сборки. При смене сети изменить .env.production и пересобрать. Запуск сервера из Battery-type, src/main.ts слушает 0.0.0.0. NPM: npm ci; npm run native:build. Нужны Rust MSVC + C++ Build Tools + Windows SDK + WebView2. Результат: src-tauri/target/release/battery_type-native.exe. Dev режим не является итоговой сборкой.

CLIP выполняется локально в Web Worker. При первом запуске скачиваются открытые веса Xenova/clip-vit-base-patch32 с Hugging Face. Изображение пользователя не отправляется серверу; в сеть идут запросы моделей и каталога. Метрика S=(1+cosine)/2. Порог регулируется 0.4–0.9, TopK 1–20; начальные настройки 0.63 и TopK 3. Английские описания 50–100 символов берутся из API; совпадающие описания индексируются один раз. Для каждого найденного описания показывается один представитель.

Бэкенд: https://github.com/NXC0BM/Battery-type/tree/battery_type-lab8
Фронтенд: https://github.com/NXC0BM/Battery-type-frontend/tree/battery_type-lab8
