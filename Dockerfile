FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    zip \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libicu-dev \
    libpq-dev \
    && docker-php-ext-configure gd --with-jpeg --with-freetype \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring xml zip bcmath intl gd \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts \
    && npm install \
    && npm run build \
    && cp .env.example .env || true \
    && php artisan key:generate --force \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 10000

CMD ["sh", "-lc", "php artisan serve --host 0.0.0.0 --port ${PORT:-10000}"]
