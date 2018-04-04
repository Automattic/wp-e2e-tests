# Other Information

## Table of Contents

- [NodeJS Version](#nodejs-version)
- [Git Pre-Commit Hook](#git-pre-commit-hook)
- [Launch Logged-In Window](#launch-logged-in-window)
- [User account requirements](#user-account-requirements)

## NodeJS Version

The node version should be defined in the `.nvmrc` file for use with the [nvm](https://github.com/creationix/nvm) project.  When changing the version a new Docker container should be built/pushed to Docker Hub for use on CircleCI 2.0

## Git Pre-Commit Hook

The file `/scripts/git-pre-commit-circleci-validate` will run `circleci validate` against the CircleCI config file prior to every commit.  This prevents the constant back-and-forth when making updates only to find that they fail immediately on CI.  Instructions in the file direct how to install the hook in your local Git environment (it won't run without this).

## Launch Logged-In Window

To facilitate manual testing, the [launch-wpcom-login.js](/scripts/launch-wpcom-login.js) file in `/scripts` will launch a Chrome browser window to WordPress.com and log in with the account definition given on the command line.  The only config requirement for this is that the `local-${NODE_ENV}.json` file needs to have the `testAccounts` object defined.  If no account is given on the command line, `defaultUser` will be used.

Example:

```bash
./node_modules/.bin/babel-node scripts/launch-wpcom-login.js multiSiteUser
```

## User account requirements

### jetpackUserPRESSABLE for PRESSABLE Target

- Selected main site (in Account Settings)
- Working Twitter Publicize integration
- Free plan
- Theme which is displaying tags and categories (e.g. Twenty Fifteen)
- Installed "Hello Dolly" plugin
