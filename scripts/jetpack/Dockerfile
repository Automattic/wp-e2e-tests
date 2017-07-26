FROM wordpress:4.8

#Versions
ENV	NODE_VERSION 6.11.1

# Install dependencies
RUN     apt-get -y update && apt-get -y install \
	  wget \
          git

# Install NodeJS
RUN     wget https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz && \
          tar -zxf node-v$NODE_VERSION-linux-x64.tar.gz -C /usr/local && \
          ln -sf /usr/local/node-v$NODE_VERSION-linux-x64 /usr/local/node && \
          ln -sf /usr/local/node/bin/npm /usr/local/bin/ && \
          ln -sf /usr/local/node/bin/node /usr/local/bin/ && \
          rm node-v$NODE_VERSION-linux-x64.tar.gz

# Install wp-cli
RUN curl  -o /usr/local/bin/wp https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && chmod +x /usr/local/bin/wp

# Install npm packages at /node_modules
RUN npm install --prefix / localtunnel wp-cli config

# Copy tunnel/wp init scripts
ADD wp-tunnel-init.js /
# Use prefix apache2 on file to trigger docker-entrypoint check to install WordPress
ADD wp-init.sh /usr/local/bin/apache2-wp-init.sh
RUN chmod +x /usr/local/bin/apache2-wp-init.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-wp-init.sh"]
