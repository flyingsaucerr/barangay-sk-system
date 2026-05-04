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
    libcurl4-openssl-dev \
    libexif-dev \
    libffi-dev \
    libsodium-dev \
    && docker-php-ext-configure gd --with-jpeg --with-freetype \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring xml zip bcmath intl gd curl fileinfo exif ffi sodium pcntl \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY . .

RUN cp .env.example .env || true

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts

RUN npm install

ENV APP_ENV=production
ENV APP_URL=https://placeholder.com
RUN npm run build

RUN php artisan key:generate --force

RUN php artisan config:cache

RUN php artisan route:cache

RUN php artisan view:cache

RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 10000

CMD ["sh", "-lc", "php artisan serve --host 0.0.0.0 --port ${PORT:-10000}"]
