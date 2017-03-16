/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

(function() {
  var platform = "chromium";
  var platformVersion = null;
  var application = null;
  var applicationVersion;

  var regexp = /(\S+)\/(\S+)(?:\s*\(.*?\))?/g;
  var match;

  while (match = regexp.exec(navigator.userAgent))
  {
    var app = match[1];
    var ver = match[2];

    if (app == "Chrome")
    {
      platformVersion = ver;
    }
    else if (app == "Edge")
    {
      platform = "edgehtml";
      platformVersion = ver;
      application = "edge";
      applicationVersion = "0";
    }
    else if (app != "Mozilla" && app != "AppleWebKit" && app != "Safari")
    {
      // For compatibility with legacy websites, Chrome's UA
      // also includes a Mozilla, AppleWebKit and Safari token.
      // Any further name/version pair indicates a fork.
      application = app == "OPR" ? "opera" : app.toLowerCase();
      applicationVersion = ver;
    }
  }

  // not a Chromium-based UA, probably modifed by the user
  if (!platformVersion)
  {
    application = "unknown";
    applicationVersion = platformVersion = "0";
  }

  // no additional name/version, so this is upstream Chrome
  if (!application)
  {
    application = "chrome";
    applicationVersion = platformVersion;
  }

  require.scopes.info = {
    addonName: "adblockpluschrome",
    addonVersion: "1.13",

    application: application,
    applicationVersion: applicationVersion,

    platform: platform,
    platformVersion: platformVersion
  };
})();