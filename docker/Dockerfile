# FROM jekyll/jekyll:4 AS jekyll-builder
# WORKDIR /app
# COPY . .
# RUN gem install jekyll bundler
# RUN bundle exec jekyll build
# FROM ruby:3.0.6-alpine3.16 AS jekyll-builder
# WORKDIR /app
# COPY . .
# RUN apk update \
#     && apk add --no-cache \
#     make
# RUN gem install ffi 
# RUN gem install jekyll bundler
# RUN bundle install
# RUN bundle exec jekyll build

FROM ruby:3.0.6-slim-bullseye as jekyll-builder
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN gem update --system \
    && gem install jekyll bundler\
    && gem cleanup
RUN npm install -g pug
RUN bundle install
RUN jekyll build

# Opty
FROM alpine:3.16 AS optimized-builder

RUN apk update \
    && apk add --no-cache \
    brotli \
    optipng \
    jpegoptim \
    curl \
    && rm -rf /var/cache/apk/ \
    && rm -rf /root/.cache \
    && rm -rf /tmp/*

WORKDIR /app
COPY --from=jekyll-builder /app/dist/ /app

# brotli
RUN find /app/ -maxdepth 10 -type f -name "*.js" -o -name "*.html" -o -name "*.css" | awk '{ print "\""$0"\""}' | xargs -n 1 gzip -9k
RUN find /app/ -maxdepth 10 -type f -name "*.js" -o -name "*.html" -o -name "*.css" | awk '{ print "\""$0"\""}' | xargs -n 1 brotli -Zk
# opti images
RUN find /app/ -maxdepth 10 -type f -name "*.png" | awk '{ print "\""$0"\""}' | xargs -n 1 optipng | true
RUN find /app/ -maxdepth 10 -type f -name "*.jpg" | awk '{ print "\""$0"\""}' | xargs -n 1 jpegoptim --strip-all | true


# Nginx instance
FROM alpine:3.18
ARG ENV=production
RUN apk update \
    && apk add --no-cache \
    tzdata \
    nginx \
    nginx-mod-http-brotli \
    curl \
# NAME        INSTALLED  FIXED-IN  TYPE  VULNERABILITY  SEVERITY 
# libcrypto3  3.1.3-r0   3.1.4-r1  apk   CVE-2023-5678  High      
# libcrypto3  3.1.3-r0   3.1.4-r0  apk   CVE-2023-5363  High      
# libssl3     3.1.3-r0   3.1.4-r1  apk   CVE-2023-5678  High      
# libssl3     3.1.3-r0   3.1.4-r0  apk   CVE-2023-5363  High
    && apk add --upgrade --no-cache libcrypto3 libssl3 \
    && rm -rf /var/cache/apk/ \
    && rm -rf /root/.cache \
    && rm -rf /tmp/* \
    && cp /usr/share/zoneinfo/Europe/Moscow /etc/localtime \
    && echo "Europe/Moscow" >> /etc/timezone \
## Create nginx fastcgi_cache_path cache
    && mkdir /var/cache/nginx \
    && chown nginx:nginx /var/cache/nginx
USER nginx
COPY ./docker/nginx/config/ /etc/nginx/
WORKDIR /var/www/html
COPY --chown=nginx:nginx --from=optimized-builder  /app /var/www/html
HEALTHCHECK --interval=5s --timeout=2s \
  CMD curl --silent -f http://127.0.0.1:8080/ping/ || exit 1
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
