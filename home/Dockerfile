FROM nginx:alpine
COPY ./dist /home/node/app

COPY ./certs /home/node/certs

COPY ./nginx.conf /etc/nginx/nginx.conf

ENV TZ=Asia/Shanghai
EXPOSE 443
EXPOSE 80

