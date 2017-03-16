/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-2016 Eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const typeMap = {
  "img": "IMAGE",
  "input": "IMAGE",
  "picture": "IMAGE",
  "audio": "MEDIA",
  "video": "MEDIA",
  "frame": "SUBDOCUMENT",
  "iframe": "SUBDOCUMENT",
  "object": "OBJECT",
  "embed": "OBJECT"
};

function getURLsFromObjectElement(element)
{
  let url = element.getAttribute("data");
  if (url)
    return [url];

  for (let child of element.children)
  {
    if (child.localName != "param")
      continue;

    let name = child.getAttribute("name");
    if (name != "movie"  && // Adobe Flash
        name != "source" && // Silverlight
        name != "src"    && // Real Media + Quicktime
        name != "FileName") // Windows Media
      continue;

    let value = child.getAttribute("value");
    if (!value)
      continue;

    return [value];
  }

  return [];
}

function getURLsFromAttributes(element)
{
  let urls = [];

  if (element.src)
    urls.push(element.src);

  if (element.srcset)
  {
    for (let candidate of element.srcset.split(","))
    {
      let url = candidate.trim().replace(/\s+\S+$/, "");
      if (url)
        urls.push(url);
    }
  }

  return urls;
}

function getURLsFromMediaElement(element)
{
  let urls = getURLsFromAttributes(element);

  for (let child of element.children)
  {
    if (child.localName == "source" || child.localName == "track")
      urls.push.apply(urls, getURLsFromAttributes(child));
  }

  if (element.poster)
    urls.push(element.poster);

  return urls;
}

function getURLsFromElement(element)
{
  let urls;
  switch (element.localName)
  {
    case "object":
      urls = getURLsFromObjectElement(element);
      break;

    case "video":
    case "audio":
    case "picture":
      urls = getURLsFromMediaElement(element);
      break;

    default:
      urls = getURLsFromAttributes(element);
      break;
  }

  for (let i = 0; i < urls.length; i++)
  {
    if (/^(?!https?:)[\w-]+:/i.test(urls[i]))
      urls.splice(i--, 1);
  }

  return urls;
}

function checkCollapse(element)
{
  let mediatype = typeMap[element.localName];
  if (!mediatype)
    return;

  let urls = getURLsFromElement(element);
  if (urls.length == 0)
    return;

  ext.backgroundPage.sendMessage(
    {
      type: "filters.collapse",
      urls: urls,
      mediatype: mediatype,
      baseURL: document.location.href
    },

    collapse =>
    {
      function collapseElement()
      {
        let propertyName = "display";
        let propertyValue = "none";
        if (element.localName == "frame")
        {
          propertyName = "visibility";
          propertyValue = "hidden";
        }

        if (element.style.getPropertyValue(propertyName) != propertyValue ||
            element.style.getPropertyPriority(propertyName) != "important")
          element.style.setProperty(propertyName, propertyValue, "important");
      }

      if (collapse)
      {
        collapseElement();

        new MutationObserver(collapseElement).observe(
          element, {
            attributes: true,
            attributeFilter: ["style"]
          }
        );
      }
    }
  );
}

function checkSitekey()
{
  let attr = document.documentElement.getAttribute("data-adblockkey");
  if (attr)
    ext.backgroundPage.sendMessage({type: "filters.addKey", token: attr});
}

function getContentDocument(element)
{
  try
  {
    return element.contentDocument;
  }
  catch (e)
  {
    return null;
  }
}

function ElementHidingTracer()
{
  this.selectors = [];
  this.filters = [];

  this.changedNodes = [];
  this.timeout = null;

  this.observer = new MutationObserver(this.observe.bind(this));
  this.trace = this.trace.bind(this);

  if (document.readyState == "loading")
    document.addEventListener("DOMContentLoaded", this.trace);
  else
    this.trace();
}
ElementHidingTracer.prototype = {
  addSelectors(selectors, filters)
  {
    if (document.readyState != "loading")
      this.checkNodes([document], selectors, filters);

    this.selectors.push(...selectors);
    this.filters.push(...filters);
  },

  checkNodes(nodes, selectors, filters)
  {
    let matchedSelectors = [];

    for (let i = 0; i < selectors.length; i++)
    {
      nodes: for (let node of nodes)
      {
        let elements = node.querySelectorAll(selectors[i]);

        for (let element of elements)
        {
          // Only consider selectors that actually have an effect on the
          // computed styles, and aren't overridden by rules with higher
          // priority, or haven't been circumvented in a different way.
          if (getComputedStyle(element).display == "none")
          {
            matchedSelectors.push(filters[i].replace(/^.*?##/, ""));
            break nodes;
          }
        }
      }
    }

    if (matchedSelectors.length > 0)
      ext.backgroundPage.sendMessage({
        type: "devtools.traceElemHide",
        selectors: matchedSelectors
      });
  },

  onTimeout()
  {
    this.checkNodes(this.changedNodes, this.selectors, this.filters);
    this.changedNodes = [];
    this.timeout = null;
  },

  observe(mutations)
  {
    // Forget previously changed nodes that are no longer in the DOM.
    for (let i = 0; i < this.changedNodes.length; i++)
    {
      if (!document.contains(this.changedNodes[i]))
        this.changedNodes.splice(i--, 1);
    }

    for (let mutation of mutations)
    {
      let node = mutation.target;

      // Ignore mutations of nodes that aren't in the DOM anymore.
      if (!document.contains(node))
        continue;

      // Since querySelectorAll() doesn't consider the root itself
      // and since CSS selectors can also match siblings, we have
      // to consider the parent node for attribute mutations.
      if (mutation.type == "attributes")
        node = node.parentNode;

      let addNode = true;
      for (let i = 0; i < this.changedNodes.length; i++)
      {
        let previouslyChangedNode = this.changedNodes[i];

        // If we are already going to check an ancestor of this node,
        // we can ignore this node, since it will be considered anyway
        // when checking one of its ancestors.
        if (previouslyChangedNode.contains(node))
        {
          addNode = false;
          break;
        }

        // If this node is an ancestor of a node that previously changed,
        // we can ignore that node, since it will be considered anyway
        // when checking one of its ancestors.
        if (node.contains(previouslyChangedNode))
          this.changedNodes.splice(i--, 1);
      }

      if (addNode)
        this.changedNodes.push(node);
    }

    // Check only nodes whose descendants have changed, and not more often
    // than once a second. Otherwise large pages with a lot of DOM mutations
    // (like YouTube) freeze when the devtools panel is active.
    if (this.timeout == null)
      this.timeout = setTimeout(this.onTimeout.bind(this), 1000);
  },

  trace()
  {
    this.checkNodes([document], this.selectors, this.filters);

    this.observer.observe(
      document,
      {
        childList: true,
        attributes: true,
        subtree: true
      }
    );
  },

  disconnect()
  {
    document.removeEventListener("DOMContentLoaded", this.trace);
    this.observer.disconnect();
    clearTimeout(this.timeout);
  }
};

function runInPageContext(fn, arg)
{
  let script = document.createElement("script");
  script.type = "application/javascript";
  script.async = false;
  script.textContent = "(" + fn + ")(" + JSON.stringify(arg) + ");";
  document.documentElement.appendChild(script);
  document.documentElement.removeChild(script);
}

// Chrome doesn't allow us to intercept WebSockets[1], and therefore
// some ad networks are misusing them as a way to serve adverts and circumvent
// us. As a workaround we wrap WebSocket, preventing blocked WebSocket
// connections from being opened.
// [1] - https://bugs.chromium.org/p/chromium/issues/detail?id=129353
function wrapWebSocket()
{
  let eventName = "abpws-" + Math.random().toString(36).substr(2);

  document.addEventListener(eventName, event =>
  {
    ext.backgroundPage.sendMessage({
      type: "request.websocket",
      url: event.detail.url
    }, block =>
    {
      document.dispatchEvent(
        new CustomEvent(eventName + "-" + event.detail.url, {detail: block})
      );
    });
  });

  runInPageContext(eventName =>
  {
    // As far as possible we must track everything we use that could be
    // sabotaged by the website later in order to circumvent us.
    let RealWebSocket = WebSocket;
    let closeWebSocket = Function.prototype.call.bind(RealWebSocket.prototype.close);
    let addEventListener = document.addEventListener.bind(document);
    let removeEventListener = document.removeEventListener.bind(document);
    let dispatchEvent = document.dispatchEvent.bind(document);
    let CustomEvent = window.CustomEvent;

    function checkRequest(url, callback)
    {
      let incomingEventName = eventName + "-" + url;
      function listener(event)
      {
        callback(event.detail);
        removeEventListener(incomingEventName, listener);
      }
      addEventListener(incomingEventName, listener);

      dispatchEvent(new CustomEvent(eventName, {
        detail: {url: url}
      }));
    }

    function WrappedWebSocket(url)
    {
      // Throw correct exceptions if the constructor is used improperly.
      if (!(this instanceof WrappedWebSocket)) return RealWebSocket();
      if (arguments.length < 1) return new RealWebSocket();

      let websocket;
      if (arguments.length == 1)
        websocket = new RealWebSocket(url);
      else
        websocket = new RealWebSocket(url, arguments[1]);

      checkRequest(websocket.url, blocked =>
      {
        if (blocked)
          closeWebSocket(websocket);
      });

      return websocket;
    }
    WrappedWebSocket.prototype = RealWebSocket.prototype;
    WebSocket = WrappedWebSocket.bind();
    Object.defineProperties(WebSocket, {
      CONNECTING: {value: RealWebSocket.CONNECTING, enumerable: true},
      OPEN: {value: RealWebSocket.OPEN, enumerable: true},
      CLOSING: {value: RealWebSocket.CLOSING, enumerable: true},
      CLOSED: {value: RealWebSocket.CLOSED, enumerable: true},
      prototype: {value: RealWebSocket.prototype}
    });

    RealWebSocket.prototype.constructor = WebSocket;
  }, eventName);
}

function ElemHide()
{
  this.shadow = this.createShadowTree();
  this.style = null;
  this.tracer = null;

  this.elemHideEmulation = new ElemHideEmulation(
    window,
    callback =>
    {
      ext.backgroundPage.sendMessage({
        type: "filters.get",
        what: "elemhideemulation"
      }, callback);
    },
    this.addSelectors.bind(this)
  );
}
ElemHide.prototype = {
  selectorGroupSize: 200,

  createShadowTree()
  {
    // Use Shadow DOM if available as to not mess with with web pages that
    // rely on the order of their own <style> tags (#309). However, creating
    // a shadow root breaks running CSS transitions. So we have to create
    // the shadow root before transistions might start (#452).
    if (!("createShadowRoot" in document.documentElement))
      return null;

    // Using shadow DOM causes issues on some Google websites,
    // including Google Docs, Gmail and Blogger (#1770, #2602, #2687).
    if (/\.(?:google|blogger)\.com$/.test(document.domain))
      return null;

    // Finally since some users have both AdBlock and Adblock Plus installed we
    // have to consider how the two extensions interact. For example we want to
    // avoid creating the shadowRoot twice.
    let shadow = document.documentElement.shadowRoot ||
                 document.documentElement.createShadowRoot();
    shadow.appendChild(document.createElement("shadow"));

    // Stop the website from messing with our shadow root (#4191, #4298).
    if ("shadowRoot" in Element.prototype)
    {
      runInPageContext(() =>
      {
        let ourShadowRoot = document.documentElement.shadowRoot;
        if (!ourShadowRoot)
          return;
        let desc = Object.getOwnPropertyDescriptor(Element.prototype, "shadowRoot");
        let shadowRoot = Function.prototype.call.bind(desc.get);

        Object.defineProperty(Element.prototype, "shadowRoot", {
          configurable: true, enumerable: true, get()
          {
            let shadow = shadowRoot(this);
            return shadow == ourShadowRoot ? null : shadow;
          }
        });
      }, null);
    }

    return shadow;
  },

  addSelectors(selectors, filters)
  {
    if (selectors.length == 0)
      return;

    if (!this.style)
    {
      // Create <style> element lazily, only if we add styles. Add it to
      // the shadow DOM if possible. Otherwise fallback to the <head> or
      // <html> element. If we have injected a style element before that
      // has been removed (the sheet property is null), create a new one.
      this.style = document.createElement("style");
      (this.shadow || document.head
                   || document.documentElement).appendChild(this.style);

      // It can happen that the frame already navigated to a different
      // document while we were waiting for the background page to respond.
      // In that case the sheet property will stay null, after addind the
      // <style> element to the shadow DOM.
      if (!this.style.sheet)
        return;
    }

    // If using shadow DOM, we have to add the ::content pseudo-element
    // before each selector, in order to match elements within the
    // insertion point.
    let preparedSelectors = [];
    if (this.shadow)
    {
      for (let selector of selectors)
      {
        let subSelectors = splitSelector(selector);
        for (let subSelector of subSelectors)
          preparedSelectors.push("::content " + subSelector);
      }
    }
    else
    {
      preparedSelectors = selectors;
    }

    // Safari only allows 8192 primitive selectors to be injected at once[1], we
    // therefore chunk the inserted selectors into groups of 200 to be safe.
    // (Chrome also has a limit, larger... but we're not certain exactly what it
    //  is! Edge apparently has no such limit.)
    // [1] - https://github.com/WebKit/webkit/blob/1cb2227f6b2a1035f7bdc46e5ab69debb75fc1de/Source/WebCore/css/RuleSet.h#L68
    for (let i = 0; i < preparedSelectors.length; i += this.selectorGroupSize)
    {
      let selector = preparedSelectors.slice(i, i + this.selectorGroupSize).join(", ");
      this.style.sheet.insertRule(selector + "{display: none !important;}",
                                  this.style.sheet.cssRules.length);
    }

    if (this.tracer)
      this.tracer.addSelectors(selectors, filters || selectors);
  },

  apply()
  {
    ext.backgroundPage.sendMessage({type: "get-selectors"}, response =>
    {
      if (this.tracer)
        this.tracer.disconnect();
      this.tracer = null;

      if (this.style && this.style.parentElement)
        this.style.parentElement.removeChild(this.style);
      this.style = null;

      if (response.trace)
        this.tracer = new ElementHidingTracer();

      this.addSelectors(response.selectors);
      this.elemHideEmulation.apply();
    });
  }
};

if (document instanceof HTMLDocument)
{
  checkSitekey();
  wrapWebSocket();

  // This variable is also used by our other content scripts, outside of the
  // current scope.
  var elemhide = new ElemHide();
  elemhide.apply();

  document.addEventListener("error", event =>
  {
    checkCollapse(event.target);
  }, true);

  document.addEventListener("load", event =>
  {
    let element = event.target;
    if (/^i?frame$/.test(element.localName))
      checkCollapse(element);
  }, true);
}
