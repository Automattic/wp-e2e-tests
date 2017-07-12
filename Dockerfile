FROM	debian:jessie

MAINTAINER Automattic

WORKDIR /wp-e2e-tests

# Create empty directories to also support the wrapper repos
RUN	mkdir /wp-e2e-tests-canary /wp-e2e-tests-jetpack /wp-e2e-tests-visdiff /wp-e2e-tests-ie11 /wp-e2e-tests-woocommerce

# Version Numbers
ENV NODE_VERSION 6.11.1
ENV CHROMEDRIVER_VERSION 2.29
ENV CHROME_VERSION 57.0.2987.133

# Install dependencies
RUN     apt-get -y update && apt-get -y install \
          wget \
          git \
          python \
          make \
          build-essential \
	  curl \
	  unzip \
	  fonts-ipafont-gothic xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic \
	  xvfb \
	  sudo

# Install NodeJS
RUN     wget https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz && \
          tar -zxf node-v$NODE_VERSION-linux-x64.tar.gz -C /usr/local && \
          ln -sf /usr/local/node-v$NODE_VERSION-linux-x64 /usr/local/node && \
          ln -sf /usr/local/node/bin/npm /usr/local/bin/ && \
          ln -sf /usr/local/node/bin/node /usr/local/bin/ && \
          rm node-v$NODE_VERSION-linux-x64.tar.gz

# Install Chrome WebDriver
RUN mkdir -p /opt/chromedriver-$CHROMEDRIVER_VERSION && \
    curl -sS -o /tmp/chromedriver_linux64.zip http://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip && \
    unzip -qq /tmp/chromedriver_linux64.zip -d /opt/chromedriver-$CHROMEDRIVER_VERSION && \
    rm /tmp/chromedriver_linux64.zip && \
    chmod +x /opt/chromedriver-$CHROMEDRIVER_VERSION/chromedriver && \
    ln -fs /opt/chromedriver-$CHROMEDRIVER_VERSION/chromedriver /usr/local/bin/chromedriver

# Install Google Chrome
RUN wget http://www.slimjetbrowser.com/chrome/lnx/chrome64_$CHROME_VERSION.deb && \
	dpkg -i chrome64_$CHROME_VERSION.deb || \
	apt-get -fy install

# Remove install file
RUN rm -rf /wp-e2e-tests/chrome64_$CHROME_VERSION.deb

# Configure non-root account
RUN	useradd -m e2e-tester
RUN	adduser e2e-tester sudo

# Enable passwordless sudo for users under the "sudo" group
RUN sed -i.bkp -e \
      's/%sudo\s\+ALL=(ALL\(:ALL\)\?)\s\+ALL/%sudo ALL=NOPASSWD:ALL/g' \
      /etc/sudoers

RUN	chown -R e2e-tester /wp-e2e-tests*
USER    e2e-tester
