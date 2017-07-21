#!/bin/bash

echo ls /var/www/html

node /wp-tunnel-init.js&

exec apache2-foreground
