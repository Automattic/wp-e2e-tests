# WordPress.com End to End Tests

Automated end-to-end acceptance tests for the [wp-calypso](https://github.com/Automattic/wp-calypso) client and WordPress.com in general.

[![Circle CI](https://circleci.com/gh/Automattic/wp-e2e-tests/tree/master.svg?style=svg)](https://circleci.com/gh/Automattic/wp-e2e-tests/tree/master)

## Table of contents

- [Pre-requisites](#pre-requisites)
  - [Install NodeJS and ChromeDriver](#install-nodejs-and-chromedriver)
  - [Install dependencies](#install-dependencies)
  - [Configuration](docs/config.md#configuration)
    - [Test Configuration](docs/config.md#test-configuration)
    - [Config Values](docs/config.md#config-values)
    - [Standalone Environment Variables](docs/config.md#standalone-environment-variables)
    - [CircleCI Environment Variables](docs/config.md#circleci-environment-variables)
- [Running tests](#running-tests)   
  - [How to run tests](docs/running-tests.md)
    - [To run all the specs](docs/running-tests.md#to-run-all-the-specs-in-parallel-default-browser-sizes---mobile-and-desktop)
    - [To run an individual spec](docs/running-tests.md#to-run-an-individual-spec)
    - [To run with different modes](docs/running-tests.md#to-run-with-different-modes)
    - [To run a specific suite of specs](docs/running-tests.md#to-run-a-specific-suite-of-specs)
    - [To run headlessly](docs/running-tests.md#to-run-headlessly)
    - [To run inside a Docker container](docs/running-tests.md#to-run-inside-a-docker-container)
    - [Jetpack Tests on CircleCI](docs/running-tests.md#jetpack-tests-on-circleci)  
- [Other information](#other-information)    
  - [NodeJS Version](docs/miscellaneous.md#nodejs-version)
  - [Git Pre-Commit Hook](docs/miscellaneous.md#git-pre-commit-hook)
  - [Launch Logged-In Window](docs/miscellaneous.md#launch-logged-in-window)


## Pre-requisites


### Install NodeJS and ChromeDriver

```
brew install node chromedriver
```

### Install dependencies
```
npm install
```

### Configuration
See the [configuration documentation](docs/config.md) for details on setting configuration values and environment variables.

## Running tests
See the information on [how to run tests](docs/running-tests.md) where you'll find information on the flags and commands used to run the tests.

## Other information
See the [other information](docs/miscellaneous.md) documentation for other details that may be of interest.
