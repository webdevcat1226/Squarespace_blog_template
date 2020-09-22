// Amplitude Tracking
// This script has been ported from the main app and as such
// should be updated at the same time. This is not ideal,
// so long-term wise the blog should be merged with the main site.
// However, the blog might be migrated wholly into Hubspot, in which case
// this script will still apply.

(function() {
  "use strict";

  var thresholds = [[0, 25], [25, 50], [50, 75], [75, 100], [100, 100]];

  function removeTrailingSlash(str) {
    return typeof str === "string" && str[str.length - 1] === "/"
      ? str.slice(0, str.length - 1)
      : str;
  }

  function calcScrollPercentage() {
    var scrollHeight = document.documentElement
      ? document.documentElement.scrollHeight
      : 0;
    var scrollY = window.scrollY ? window.scrollY : window.pageYOffset;

    return Math.round((scrollY / (scrollHeight - window.innerHeight)) * 100);
  }

  function getCookieValue(a) {
    var b = document.cookie.match("(^|;)\\s*" + a + "\\s*=\\s*([^;]+)");
    return b ? b.pop() : "";
  }

  function getText(selector, index) {
    var node = document.querySelector(selector);
    return node ? node.innerText.toLowerCase() : "";
  }

  function getUrl() {
    return removeTrailingSlash(window.location.href);
  }

  function getPageType() {
    var href = window.location.href;

    var pageTypes = {
      blogLanding: /.*/,
      blog: /\/blog\/\d+\/\d+\/\d+\/.+/,
      blogTag: /\?tag=/,
      blogCategory: /\?category=/,
      blogAuthor: /\?author=/
    };

    return Object.keys(pageTypes).reduce(function(prev, pageType) {
      return pageTypes[pageType].test(href) ? pageType : prev;
    });
  }

  function getDaysSincePublished() {
    return document.querySelector(".blog-article__time").innerText;
  }

  function lowerCase(string) {
    return string.toLowerCase();
  }

  function lowerCaseAll(arr) {
    return arr.map(item => lowerCase(item));
  }

  function maybeObj(name, prop, transform) {
    var obj = {};

    if (prop) {
      obj[name] = transform ? transform(prop) : prop;
    }

    return obj;
  }

  function getUtmProperties() {
    var query = window.location.search.substr(1);

    var referrerProperties = { referrer: "internal" };

    if (query.indexOf("utm_source") >= 0) {
      var utmProperties = {};
      query.split("&").forEach(function(part) {
        var item = part.split("=");
        utmProperties[item[0]] = decodeURIComponent(item[1]);
      });

      referrerProperties = {
        referrer: utmProperties.utm_source,
        utmContent: utmProperties.utm_content,
        utmMedium: utmProperties.utm_medium
      };
    }

    return referrerProperties;
  }

  function getPageProperties() {
    var pageType = getPageType();
    var daysSincePublished = maybeObj(
      "daysSincePublished",
      pageType === "blog",
      getDaysSincePublished
    );

    var categories = maybeObj(
      "blogCategories",
      ampTracking.blogCategories,
      lowerCaseAll
    );
    var category = maybeObj("category", ampTracking.filterCategory, lowerCase);
    var tag = maybeObj("tag", ampTracking.filterTag, lowerCase);

    var eventProperties = Object.assign(
      {
        pageType: pageType,
        url: getUrl(),
        pageTitle: document.title
      },
      getUtmProperties(),
      ampTracking,
      daysSincePublished,
      categories,
      category,
      tag
    );

    return eventProperties;
  }

  function logEvent(eventType, eventProperties) {
    amplitude.getInstance().logEvent(eventType, eventProperties);
  }

  function logEventOnce(eventType, eventProperties) {
    const event = eventType
      .toLowerCase()
      .split(" ")
      .concat(["done"])
      .join("-");

    const doneCookie = getCookieValue(event);

    if (doneCookie === "1") return;

    document.cookie = event + "=1; path=/";
    logEvent(eventType, eventProperties);
  }

  function logAmplitudeEvent(eventType, eventProperties, once) {
    once
      ? logEventOnce(eventType, eventProperties)
      : logEvent(eventType, eventProperties);
  }

  function logPhoneContactUs() {
    logAmplitudeEvent("CLICK CONTACT US", {
      type: "phone",
      subject: "footer",
      url: getUrl()
    });
  }

  function logEmailContactUs() {
    logAmplitudeEvent("CLICK CONTACT US", {
      type: "email",
      subject: "footer",
      url: getUrl()
    });
  }

  function logPageLoaded() {
    logAmplitudeEvent("PAGE LOADED", getPageProperties());
  }

  function logEntryPage() {
    logAmplitudeEvent("ENTRY PAGE", getPageProperties(), true);
  }

  function logSocialShare(subject, type) {
    logAmplitudeEvent("CLICK SOCIAL SHARE", {
      subject: subject,
      url: getUrl(),
      type: type
    });
  }

  function logScrollDepth(scrollPercentage) {
    logAmplitudeEvent("SCROLL", {
      url: removeTrailingSlash(window.location.href),
      pageTitle: document.title,
      scrollPercentage
    });
  }

  var removeThreshold = i => {
    var leftSlice = thresholds.slice(0, i);
    var rightSlice = thresholds.slice(i + 1);
    thresholds = leftSlice.concat(rightSlice);
  };

  var ticking = false;

  function logFrame() {
    var scrollPercentage = calcScrollPercentage();
    ticking = false;

    thresholds.forEach((threshold, i) => {
      const [low, high] = threshold;

      if (
        (low < scrollPercentage && high >= scrollPercentage) ||
        (low === scrollPercentage && high === scrollPercentage)
      ) {
        logScrollDepth(low);
        removeThreshold(i);
      }
    });
  }

  function scrollHandler() {
    if (!ticking) {
      requestAnimationFrame(logFrame);
    }

    ticking = true;
  }

  window.addEventListener("scroll", scrollHandler);

  document.addEventListener("DOMContentLoaded", logPageLoaded);
  document.addEventListener("DOMContentLoaded", logEntryPage);

  document
    .querySelector(".site-footer__telLink")
    .addEventListener("click", logPhoneContactUs);

  document
    .querySelector(".site-footer__mailtoLink")
    .addEventListener("click", logEmailContactUs);

  var socialBlocks = {
    contentFooter: ".meta-block--repeated",
    sidebar: ".meta-block"
  };

  Object.keys(socialBlocks).forEach(function(subject) {
    document
      .querySelectorAll(
        [socialBlocks[subject], ".social-links__icon"].join(" ")
      )
      .forEach(function(node) {
        node.addEventListener(
          "click",
          logSocialShare.bind(
            this,
            subject,
            node.querySelector("img").getAttribute("title")
          )
        );
      });
  });
})();
