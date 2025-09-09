#!/bin/sh
set -e
: ${PORT:=80}
# Replace template and start nginx
envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
