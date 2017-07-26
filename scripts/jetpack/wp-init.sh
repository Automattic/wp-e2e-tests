#!/bin/bash

# Initialize WordPress with default info and unique URL
node /wp-tunnel-init.js&

# Install Jetpack master branch from git
cd /var/www/html/wp-content/plugins
#git clone --depth 1 https://github.com/Automattic/jetpack.git
git clone https://github.com/Automattic/jetpack.git
echo 'cloned'
chown -R www-data:www-data /var/www/html/wp-content/plugins/jetpack

exec apache2-foreground
