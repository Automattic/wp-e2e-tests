FROM	debian:jessie

MAINTAINER Automattic

WORKDIR /wp-e2e-tests

# Version Numbers
ENV NODE_VERSION 6.10.0
ENV CHROMEDRIVER_VERSION 2.28
ENV CHROME_VERSION 56.0.2924.87

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
	  xvfb tinywm

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

# Shared directories
VOLUME	/secrets
VOLUME /screenshots
RUN	ln -sf /screenshots ./screenshots

# Load the code
COPY     . /wp-e2e-tests

# Configure non-root account
RUN	useradd -m e2e-tester
RUN	chown -R e2e-tester /wp-e2e-tests
USER    e2e-tester

# Sometimes "npm install" fails the first time when the cache is empty, so we retry once if it failed
RUN     npm install || npm install

# Point to the secrets config file
ENV	NODE_ENV docker
RUN	["sh", "-c", "ln -sf /secrets/local-${NODE_ENV}.json ./config/local-${NODE_ENV}.json"]

# Run the tests
CMD ./run.sh -R -g -x
