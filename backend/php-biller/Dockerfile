FROM php:8.2-fpm-alpine

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apk add --no-cache \
    $PHPIZE_DEPS \
    libzip-dev \
    oniguruma-dev \
    libxml2-dev \
    curl \
    unzip \
    bash \
    icu-dev \
    zlib-dev \
    libpng-dev \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        zip \
        intl \
    && pecl install apcu redis \
    && docker-php-ext-enable apcu redis

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy application source
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Permissions
RUN chown -R www-data:www-data /var/www/html

# Expose Prometheus HTTP port (change to 9090 if running with php -S)
EXPOSE 9090

# Start via PHP built-in server (for standalone microservice)
CMD ["php", "-S", "0.0.0.0:9090", "-t", "public"]

