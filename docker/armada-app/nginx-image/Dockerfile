# Use official nginx docker image
FROM nginx

#Replace default nginx config file with our custom one
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf