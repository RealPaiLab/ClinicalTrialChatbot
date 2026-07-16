#!/bin/sh
set -e
envsubst '${API_BASE_URL} ${MAPBOX_TOKEN} ${ENABLE_DEBUG_PAGE} ${TURNSTILE_SITE_KEY}' \
  < /etc/nginx/app-template/config.template.js \
  > /usr/share/nginx/html/config.js
