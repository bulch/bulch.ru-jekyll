FROM ruby:3.0.6-slim-bullseye as jekyll-builder
RUN apt update && apt install -y --no-install-recommends \
    build-essential git nodejs npm \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN gem update --system \
    && gem install jekyll bundler \
    && gem cleanup
RUN npm install -g pug
RUN bundle install
RUN jekyll build


# Opty
FROM alpine:3.19 AS optimized-builder
RUN apk update && apk add --no-cache \
    brotli optipng jpegoptim \
    && rm -rf /var/cache/apk/ && rm -rf /root/.cache && rm -rf /tmp/*
WORKDIR /app
COPY --from=jekyll-builder /app/dist/ /app
# brotli
RUN find /app/ -maxdepth 10 -type f -name "*.js" -o -name "*.html" -o -name "*.css" | awk '{ print "\""$0"\""}' | xargs -n 1 gzip -9k
RUN find /app/ -maxdepth 10 -type f -name "*.js" -o -name "*.html" -o -name "*.css" | awk '{ print "\""$0"\""}' | xargs -n 1 brotli -Zk
# opti images
RUN find /app/ -maxdepth 10 -type f -name "*.png" | awk '{ print "\""$0"\""}' | xargs -n 1 optipng | true
RUN find /app/ -maxdepth 10 -type f -name "*.jpg" | awk '{ print "\""$0"\""}' | xargs -n 1 jpegoptim --strip-all | true


# Nginx instance
FROM alpine:3.19
ARG ENV=production
RUN apk update && apk add --no-cache \
    tzdata nginx nginx-mod-http-brotli \
    && rm -rf /var/cache/apk/ && rm -rf /root/.cache && rm -rf /tmp/* \
## tzdata config    
    && cp /usr/share/zoneinfo/Europe/Moscow /etc/localtime \
    && echo "Europe/Moscow" >> /etc/timezone \
## Create nginx fastcgi_cache_path cache
    && mkdir /var/cache/nginx && chown nginx:nginx /var/cache/nginx
USER nginx
COPY ./docker/nginx/config/ /etc/nginx/
WORKDIR /var/www/html
COPY --chown=nginx:nginx --from=optimized-builder  /app /var/www/html
HEALTHCHECK --interval=5s --timeout=2s \
  CMD nc -vz 127.0.0.1 8080 && echo 'true'  || exit 1
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
