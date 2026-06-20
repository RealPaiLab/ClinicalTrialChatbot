#!/bin/sh
set -e
envsubst '${API_BASE_URL} ${MAPBOX_TOKEN} ${ENABLE_DEBUG_PAGE}' \
  < /etc/nginx/app-template/config.template.js \
  > /usr/share/nginx/html/config.js
