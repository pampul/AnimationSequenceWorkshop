/**
 * Created by Florian on 08/11/2013.
 */
"use strict";

var AnimationSequence = function () {

  var $win = $(window);
  var $htmlBody = $("html, body");
  var $imgContainer = $('.street-view');
  var $imgElement = $('.street-view > img');
  var $hotspotElements = $('.hotspot');
  var $hotspotsList = $('#hotspots');
  var windowHeight, windowWidth;
  var fullHeight, scrollHeight;
  var streetImgWidth = 1024,
    streetImgHeight = 640;
  var currentPosition = -1;
  var targetPosition = 0;
  var isTouch = 'ontouchstart' in window;
  var currentSrc, highresTimeout;
  var loadCounterForIE = 0;
  var loadHighresCounter = 0;
  var imageSeqLoader;
  var sequencePos = 0;
  var autoScrollLength = 10000;
  var autoScrollWaitingTime = 5000;
  var autoScrollEnabled = true;
  var autoScrollLaunched = false;
  var userScrollEnabled = true;
  var wrapperHeight = 5000;
  var $clickableEvents;
  var scrollMin = 0,
    scrollMax = 1,
    dragScrollMin = 0,
    dragScrollMax = 1,
    dragScroll = false;

  this.init = function (maxImgHeight, maxImgWidth) {

    // Initialize vars
    $imgContainer = $('.street-view');
    $hotspotElements = $('.hotspot');
    $clickableEvents = $('.event-click');
    $imgElement = $('.street-view > img');
    currentPosition = -1;
    targetPosition = 0;
    loadCounterForIE = 0;
    loadHighresCounter = 0;

    // Set background img width and height
    streetImgWidth = maxImgWidth;
    streetImgHeight = maxImgHeight;

    // Clear the scrollTimer timeout
    clearTimeout($.data(this, 'scrollTimer'));

    // Detect when user scroll only
    $win.mousewheel(function (e) {
      mouseWheelMove(e);
    });

    handleFiredEvents();

    // Get the dimensions
    calculateDimensions();

    // Launch anim loop
    animloop();

    // Handle events (window resize and user or jquery scroll)
    $win.resize(handleResize);
    $win.scroll(handleScroll);

    // Resize the screen
    handleResize();

    if (!userScrollEnabled) {
      userScrollEnabled = false;
    } else {
      if (isTouch) {
        touchOverride();
      }
    }
  };

  function handleFiredEvents() {

    // Handle click events
    $clickableEvents.click(function () {
      clickEvent($(this));
    });

    // Manage draggable events
    $(".draggable").draggable({
      revert: true
    });

    // Fired event when dropped
    $(".droppable").droppable({
      hoverClass: "drop-hover",
      drop: function (event, ui) {
        dropItemEvent(event, $(this));
      }
    });

  }

  function completeFiredEvent($elem) {

    var eventLaunch = 'start';
    if ($elem.attr('data-event-launch')) {
      eventLaunch = $elem.attr('data-event-launch');
    }

    if (eventLaunch === 'end') {
      handleDataAttributes($elem);
    }
  }

  function dropItemEvent(event, $elem) {

    if ($elem.attr('data-scroll-to')) {
      setTimeout(function () {
        scrollToPos($elem.attr('data-scroll-to'), false, function () {
          completeFiredEvent($elem);
        });
      }, 250);
    }

  }

  function clickEvent($elem) {
    var scrollToY = $elem.attr('data-scroll-to');

    scrollToPos(scrollToY, false, function () {
      completeFiredEvent($elem);
    });
  }

  function mouseWheelMove(e) {

    // Check if the user can scroll
    if (userScrollEnabled) {

      // Stop animations
      $("html, body").stop();

      // Clear the scrollTimer timeout
      clearTimeout($.data(this, 'scrollTimer'));

      handleScrollControl();

    } else {
      e.preventDefault();
    }
  }

  function userScrollMinMaxHandler(oldTargetPosition, targetPosition) {

    if (userScrollEnabled) {
      if (targetPosition > oldTargetPosition) {
        // downscroll code
        if (scrollMax < targetPosition) {
          scrollToPos(scrollMax - 0.01, true, false);
        }
      } else {
        // upscroll code
        if (scrollMin > targetPosition) {
          scrollToPos(scrollMin + 0.01, true, false);
        }
      }
    } else {
      if (dragScrollMax < targetPosition) {
        scrollToPos(dragScrollMax, true, false);
      }
      if (dragScrollMin > targetPosition) {
        scrollToPos(dragScrollMin, true, false);
      }
    }

  }

  function handleScrollControl() {

    if (autoScrollEnabled && !autoScrollLaunched) {
      $.data(this, 'scrollTimer', setTimeout(function () {
        // fix bug if timeout still running after the seq change
        autoScrollLaunched = true;
        scrollToPos(1, false, false);

      }, autoScrollWaitingTime));
    }
  }

  function launchAutoScroll(timer) {
    if (autoScrollEnabled && !autoScrollLaunched) {
      $.data(this, 'scrollTimer', setTimeout(function () {
        // fix bug if timeout still running after the seq change
        autoScrollLaunched = true;
        scrollToPos(1, false, false);

      }, timer));
    }
  }

  function scrollToPos(posY, scrollQuick, callback) {
    var heightRequired = posY * scrollHeight;

    var scrollTime = getScrollTimeLeft(posY);

    $("html, body").animate({
      scrollTop: heightRequired
    }, (scrollQuick ? 0 : scrollTime), 'swing', (!callback ? bottomCompleteHandler : callback));

  }

  function bottomCompleteHandler() {

    // Clear the scrollTimer timeout
    clearTimeout($.data(this, 'scrollTimer'));
    autoScrollLaunched = false;

  }

  function getScrollTimeLeft(posY) {

    var scrollTime = Math.abs(posY - targetPosition) * autoScrollLength;

    return scrollTime;
  }

  function calculateDimensions() {
    // Get the browser height
    windowWidth = $win.width();
    windowHeight = $win.height();

    // Get the page height
    fullHeight = $('#main').height();

    // Get the total value to scroll
    scrollHeight = fullHeight - windowHeight;
  }

  function handleResize() {
    calculateDimensions();
    resizeBackgroundImage();
    centerItems();
    handleScroll();
  }

  function centerItems() {
    // Get the centered hotspot width and center it
    $('.hotspot-centered').each(function () {
      var centeredHotspotWidth = $(this).width();
      var pushLeft = (windowWidth - centeredHotspotWidth) / 2;
      $(this).css({
        left: pushLeft + 'px'
      });
    });
  }

  function resizeBackgroundImage() {
    // get image container size
    var scale = Math.max(windowHeight / streetImgHeight, windowWidth / streetImgWidth);
    var width = scale * streetImgWidth,
      height = scale * streetImgHeight;
    var left = (windowWidth - width) / 2,
      top = (windowHeight - height) / 2;
    var isChrome = false;
    if ($.browser.chrome) {
      isChrome = true;
    }

    var transform = "";

    if (($.browser.safari || isTouch) && !isChrome) {
      transform = 'translate3d(' + [-streetImgWidth / 2, -streetImgHeight / 2, 0].join('px,') + 'px) scale3d(' + scale + ',' + scale + ',1) translate3d(' + [windowWidth / 2 / scale, windowHeight / 2 / scale, 0].join('px,') + ')';
      $imgElement
        .width(streetImgWidth).height(streetImgHeight)
        .css('-webkit-transform', transform)
        .css({
          'position': 'fixed',
          top: 0,
          left: 0
        });
    } else if (Modernizr.csstransforms) {
      transform = 'translate(' + [-streetImgWidth / 2, -streetImgHeight / 2].join('px,') + 'px) scale(' + scale + ') translate(' + [windowWidth / 2 / scale, windowHeight / 2 / scale].join('px,') + 'px)';
      $imgElement
        .width(streetImgWidth).height(streetImgHeight)
        .css({
          '-webkit-transform': transform,
          '-moz-transform': transform,
          '-o-transform': transform,
          '-ms-transform': transform
        })
        .css({
          'position': 'fixed',
          top: 0,
          left: 0
        });
    } else {
      $imgElement
        .width(width).height(height)
        .css('position', 'fixed')
        .css('left', left + 'px')
        .css('top', top + 'px');
    }

  }

  function handleScroll() {
    // Clear the scrollTimer timeout
    clearTimeout($.data(this, 'scrollTimer'));

    // Keep the oldTargetPosition
    var oldTargetPosition = currentPosition;

    // Get the number of px scrolled by the total height (the percentage in fact)
    targetPosition = getScrollTop() / scrollHeight;

    // Re-launch scroll timer
    handleScrollControl();
  }

  function setScrollTop(value) {
    $win.scrollTop(value);
  }

  function getScrollTop() {
    return $win.scrollTop() || (document.documentElement && document.documentElement.scrollTop);
  }

  function animloop() {
    if (Math.floor(currentPosition * 5000) !== Math.floor(targetPosition * 5000)) {
      var deaccelerate = Math.max(Math.min(Math.abs(targetPosition - currentPosition) * 5000, 10), 2);
      currentPosition += (targetPosition - currentPosition) / deaccelerate;

      // Handle the scroll min & max
      if (userScrollEnabled || dragScroll) {
        userScrollMinMaxHandler(currentPosition, targetPosition);
      }

      render(currentPosition);
    }
    requestAnimFrame(animloop);
  }

  this.handleLoadProgress = function () {
    var progress = imageSeqLoader.getLoadProgress() * 100;
    $('#loading-bar').css({
      width: progress + '%',
      opacity: 1
    });
  };

  this.handleLoadComplete = function () {
    $('#loading-bar').css({
      width: '100%',
      opacity: 0
    });
  };

  function render(position) {
    // Get min height and max height
    var minY = -windowHeight,
      maxY = windowHeight;

    $.each($hotspotElements, function (index, element) {
        var $hotspot = $(element);
        var elemPosition = Number($hotspot.attr('data-position'));
        var elemSpeed = Number($hotspot.attr('data-speed'));
        var elemTimer = Number($hotspot.attr('data-timer'));
        var elemEffect = $hotspot.attr('data-effect');

        // get the item height
        var elemY = windowHeight / 2 + elemSpeed * (elemPosition - position) * scrollHeight;
        var elemYTimer = windowHeight / 2 + elemSpeed * (elemPosition + elemTimer - position) * scrollHeight;

        // If position isn't in the window
        if (elemYTimer < minY || elemY > maxY) {
          $hotspot.css({
            visiblity: 'none',
            top: '-1000px',
            'webkitTransform': 'none'
          });

          // If elem must be in window
        } else {

          var baseY = maxY / 2;
          if (elemYTimer < baseY && elemYTimer > 0) {
            launchMidEffect($hotspot);
          }

          // Make the effect for the slide effect wanted
          switch (elemEffect) {

          case 'slide-bottom':
            effectSlideFromBottom($hotspot, elemYTimer, elemY, maxY);
            break;

          case 'slide-left':
            effectSlideFromLeft($hotspot, elemYTimer, elemY, maxY);
            break;

          case 'slide-right':
            effectSlideFromRight($hotspot, elemYTimer, elemY, maxY);
            break;

          case 'fade':
            effectFadeIn($hotspot, elemYTimer, elemY, maxY);
            break;

          }

        }
      }

    );

    // Then, render the position of the video
    renderVideo(position);
  }

  function launchMidEffect($hotspot) {

    var eventLaunch = 'start';
    if ($hotspot.attr('data-event-launch')) {
      eventLaunch = $hotspot.attr('data-event-launch');
    }

    if (eventLaunch === 'start') {
      handleDataAttributes($hotspot);
    }

  }

  function handleDataAttributes($elem) {
    if ($elem.attr('data-scroll')) {
      var scrollVal = parseInt($elem.attr('data-scroll'));
      if (scrollVal === 1) {
        userScrollEnabled = true;
      } else {
        userScrollEnabled = false;
      }
    }

    if ($elem.attr('data-scroll-min')) {
      scrollMin = parseFloat($elem.attr('data-scroll-min'));
    }

    if ($elem.attr('data-scroll-max')) {
      scrollMax = parseFloat($elem.attr('data-scroll-max'));
    }

    if ($elem.attr('data-drag-min')) {
      dragScrollMin = parseFloat($elem.attr('data-drag-min'));
      if (isTouch) {
        scrollMin = parseFloat($elem.attr('data-drag-min'));
      }
    }

    if ($elem.attr('data-drag-max')) {
      dragScrollMax = parseFloat($elem.attr('data-drag-max'));
      if (isTouch) {
        scrollMax = parseFloat($elem.attr('data-drag-max'));
      }
    }

    if ($elem.attr('data-drag-scroll')) {
      var dragScrollVal = parseInt($elem.attr('data-drag-scroll'));
      if (dragScrollVal === 1) {
        setDragScroll(true);
      } else {
        if ($elem.attr('data-position') && dragScroll) {
          scrollToPos(parseFloat($elem.attr('data-position')), true, false);
        }
        setDragScroll(false);

      }
    }

    if ($elem.attr('data-auto-scroll')) {
      var autoScrollVal = parseInt($elem.attr('data-auto-scroll'));
      if (autoScrollVal === 1) {
        autoScrollEnabled = true;
        var timer = 500;
        if ($elem.attr('data-auto-scroll-timer')) {
          timer = parseFloat($elem.attr('data-auto-scroll-timer'));
        }

        launchAutoScroll(timer);
      } else {
        autoScrollEnabled = false;
      }
    }

  }

  function setDragScroll(val) {
    if (val) {
      dragScroll = true;
      if (isTouch) {
        userScrollEnabled = true;
      } else {
        $('#main').dragScroll({
          dragSelector: '.street-view',
          mainHandler: 'window',
          maxHeight: scrollHeight,
          dragMin: dragScrollMin,
          dragMax: dragScrollMax,
          enable: true
        });
      }
    } else {
      dragScroll = false;
      if (isTouch) {
        userScrollEnabled = false;
      } else {
        $('#main').dragScroll({
          enable: false
        });
      }
    }
  }

  function getXPosition(elemY, maxY) {

    var xValue = -((elemY / maxY) * windowWidth);

    return xValue;
  }

  function effectSlideFromRight($hotspot, elemYTimer, elemY, maxY) {
    var positionTop = $hotspot.attr('data-top-position');
    var elemX = 0;

    if (elemY < 0) {
      if (elemYTimer < 0) {
        elemX = getXPosition(elemYTimer, maxY);

        $hotspot.css({
          visiblity: 'visible',
          top: positionTop,
          right: elemX,
          position: 'fixed'
        });
      } else {
        // Fix a too fast scroll bug
        elemX = getXPosition(0, maxY);

        $hotspot.css({
          visiblity: 'visible',
          top: positionTop,
          right: elemX,
          position: 'fixed'
        });
      }
    } else {
      elemX = getXPosition(elemY, maxY);

      $hotspot.css({
        visiblity: 'visible',
        top: positionTop,
        right: elemX,
        position: 'fixed'
      });
    }
  }

  function effectSlideFromLeft($hotspot, elemYTimer, elemY, maxY) {
    var positionTop = $hotspot.attr('data-top-position');
    var elemX = 0;

    if (elemY < 0) {
      if (elemYTimer < 0) {
        elemX = getXPosition(elemYTimer, maxY);

        $hotspot.css({
          visiblity: 'visible',
          top: positionTop,
          left: elemX,
          position: 'fixed'
        });
      } else {
        // Fix a too fast scroll bug
        elemX = getXPosition(0, maxY);

        $hotspot.css({
          visiblity: 'visible',
          top: positionTop,
          left: elemX,
          position: 'fixed'
        });
      }
    } else {
      elemX = getXPosition(elemY, maxY);

      $hotspot.css({
        visiblity: 'visible',
        top: positionTop,
        left: elemX,
        position: 'fixed'
      });
    }
  }

  function effectSlideFromBottom($hotspot, elemYTimer, elemY, maxY) {

    var baseY = maxY / 2;
    var finalTranslate = 0;
    var transform = '';
    if (elemY < baseY) {
      if (elemYTimer < baseY) {
        $hotspot.css({
          visiblity: 'visible',
          top: elemYTimer,
          position: 'fixed'
        });

        if ($hotspot.hasClass('right')) {

          finalTranslate = getTranslation(elemYTimer, parseInt($hotspot[0].style.right), baseY);
          transform = 'translate3d(' + (finalTranslate) + 'px, 0px, 0px)';

          $hotspot.css({
            '-webkit-transform': transform,
            '-moz-transform': transform,
            '-o-transform': transform,
            '-ms-transform': transform
          });
        } else if ($hotspot.hasClass('left')) {

          finalTranslate = getTranslation(elemYTimer, parseInt($hotspot[0].style.left), baseY);
          transform = 'translate3d(-' + (finalTranslate) + 'px, 0px, 0px)';

          $hotspot.css({
            '-webkit-transform': transform,
            '-moz-transform': transform,
            '-o-transform': transform,
            '-ms-transform': transform
          });
        }
      }
    } else {
      $hotspot.css({
        visiblity: 'visible',
        top: elemY,
        position: 'fixed'
      });
    }

  }

  function effectFadeIn($hotspot, elemYTimer, elemY, maxY) {

    var positionTop = $hotspot.attr('data-top-position');
    var opacityEffect = 1 - (Math.abs(elemY) / maxY);
    if ($hotspot.attr('data-left-position')) {
      $hotspot.css({
        left: $hotspot.attr('data-left-position')
      });
    }
    if ($hotspot.attr('data-right-position')) {
      $hotspot.css({
        right: $hotspot.attr('data-right-position')
      });
    }
    var elemX = 0;

    if (elemY < 0) {
      if (elemYTimer < 0) {

        opacityEffect = 1 - (Math.abs(elemYTimer) / maxY);

        $hotspot.css({
          visiblity: 'visible',
          top: positionTop,
          position: 'fixed',
          opacity: opacityEffect
        });

      }
    } else {
      $hotspot.css({
        visiblity: 'visible',
        top: positionTop,
        position: 'fixed',
        opacity: opacityEffect
      });
    }

  }

  function getTranslation(topCurrentPosition, baseXPosition, baseYPosition) {

    baseXPosition = windowWidth * (baseXPosition / 100);

    // Get the percentage of completion
    var percentageCompleted = topCurrentPosition / baseYPosition;

    // get the final translation to put
    var finalTranslate = baseXPosition - ((percentageCompleted) * baseXPosition);

    return finalTranslate;
  }

  function renderVideo(position) {
    var index = Math.round(currentPosition * (imageSeqLoader.length - 1));
    var img = imageSeqLoader.getNearest(index);
    var nearestIndex = imageSeqLoader.nearestIndex;
    if (nearestIndex < 0) {
      nearestIndex = 0;
    }
    var $img = $(img);
    var src;
    if ( !! img) {
      src = img.src;
      if (src !== currentSrc) {
        $imgElement[0].src = src;
        currentSrc = src;
      }
    }

    clearTimeout(highresTimeout);
    highresTimeout = setTimeout(function () {
      if ( !! src) {
        var highSrc = src.split('/min/').join('/large/');
        loadHighres(highSrc);
      }
    }, isSlowBrowser() ? 500 : 150);

  }

  function loadHighres(src) {
    var videoImage = $imgElement[0];
    videoImage.src = src;
  }

  function isSlowBrowser() {
    return isTouch || ($.browser.msie && Number($.browser.version) <= 8) ? true : false;
  }

  window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function ( /* function */ callback, /* DOMElement */ element) {
        window.setTimeout(callback, 1000 / 60);
    };
  })();

  function getSeqHotspots() {
    // get the hotspots for the sequence by ajax request
    return '';
  }

  function putHotspots(htmlHotspots) {
    // Put the hotspots
    $hotspotsList.html(htmlHotspots);
  }

  this.launchSequence = function (seqOptions) {

    var self = this;
    sequencePos++;

    // Set the stopAt if slow browser
    seqOptions.classOptions.stopAt = isSlowBrowser() ? 4 : 1;

    // Stop animations
    $("html, body").stop();

    if (sequencePos > 1) {
      $imgContainer.fadeOut();
      $('.hotspot').each(function () {
        $(this).fadeOut();
      });

      setTimeout(function () {
        $('html, body').animate({
          scrollTop: 0
        }, 250);
        $('#main').css({
          height: seqOptions.wrapperHeight + 'px'
        });

        if (seqOptions.ajaxCall) {
          var htmlHotspots = getSeqHotspots();
          putHotspots(htmlHotspots);
        }

        self.sequenceInit(seqOptions);

        setTimeout(function () {
          $imgContainer.fadeIn();
          $('.hotspot').each(function () {
            $(this).fadeIn();
          });
        }, 500);
      }, 500);
    } else {
      $('#main').css({
        height: seqOptions.wrapperHeight + 'px'
      });
      self.sequenceInit(seqOptions);
    }

    // Log the sequence
    console.log('Sequence ' + sequencePos + ' loaded.');

  };

  this.sequenceInit = function (seqOptions) {

    var self = this;

    $imgElement.attr('src', seqOptions.firstFrame);

    autoScrollLength = seqOptions.autoScrollLength;
    autoScrollEnabled = seqOptions.autoScrollEnabled;
    autoScrollWaitingTime = seqOptions.autoScrollWaitingTime;
    userScrollEnabled = seqOptions.userScrollEnabled;
    wrapperHeight = seqOptions.wrapperHeight;
    setDragScroll(seqOptions.dragDropScrollEnabled);

    // video handling
    imageSeqLoader = new ProgressiveImageSequence(seqOptions.indexFrames, seqOptions.maxFrames, seqOptions.classOptions);

    self.init(640, 1024);

    imageSeqLoader.loadPosition(currentPosition, function () {
      loadCounterForIE++;
      if (loadCounterForIE === 1) {
        renderVideo(currentPosition);
        imageSeqLoader.load();
        imageSeqLoader.load();
        imageSeqLoader.load();
        imageSeqLoader.load();
      }
    });
  };

  this.reset = function () {
    // Clear the scrollTimer timeout
    clearTimeout($.data(this, 'scrollTimer'));
  };

  function touchOverride() {

    console.log('Mobile device settings enclenched.');

    $('#main').css('height', 1);

    var scrollPos = 0;
    var MAXSCROLL = autoScrollLength;

    var oldCalculateDimensions = calculateDimensions;
    calculateDimensions = function () {
      oldCalculateDimensions();
      scrollHeight = MAXSCROLL - windowHeight;
    };

    var oldGetScrollTop = getScrollTop;
    getScrollTop = function () {
      return scrollPos;
    };

    var oldSetScrollTop = setScrollTop;
    setScrollTop = function (value) {
      scrollPos = value;
      dispatchScroll();
    };

    function dispatchScroll() {
      targetPosition = scrollPos / scrollHeight;
      if (targetPosition > 1) {
        targetPosition = 1;
      }
    }

    var d = document;
    var touchMoved, touchDown, touchBeginPosition, isLinkTouch;

    function onTouchStart(event) {
      var isNavigation = $(event.target).filter('a');
      if (isNavigation.length) {
        isNavigation = isNavigation.parents('.navigation').length >= 1;
        return;
      }
      if ($(event.target).parents('a').length === 0) {
        event.preventDefault();
      }
      touchDown = true;
      var touch = event.touches[0];
      var touchX = touch.clientX;
      var touchY = touch.clientY;
      touchBeginPosition = {
        x: touchX,
        y: touchY,
        scroll: scrollPos
      };
      if (!d.addEventListener) {
        d.attachEvent("touchmove", onTouchMove);
        d.attachEvent('touchend', onTouchEnd);
      } else {
        d.addEventListener('touchmove', onTouchMove, false);
        d.addEventListener('touchend', onTouchEnd, false);
      }
    }

    function onTouchMove(event) {
      event.preventDefault();
      var touch = event.touches[0];
      var touchX = touch.clientX;
      var touchY = touch.clientY;
      var dy = (touchY - touchBeginPosition.y);
      if (Math.abs(dy) > 3) {
        touchMoved = true;
      }
      scrollPos = touchBeginPosition.scroll - dy * 2;
      scrollPos = Math.min(MAXSCROLL, Math.max(0, scrollPos));
      dispatchScroll();
    }

    function onTouchEnd(event) {
      if (touchMoved) {
        event.preventDefault();
      }

      if (!d.removeEventListener) {
        d.removeEvent('touchmove', onTouchMove);
        d.removeEvent('touchend', onTouchEnd);
      } else {
        d.removeEventListener('touchmove', onTouchMove, false);
        d.removeEventListener('touchend', onTouchEnd, false);
      }
      touchDown = false;
    }

    if (!d.addEventListener) {
      d.attachEvent('touchstart', onTouchStart);
    } else {
      d.addEventListener('touchstart', onTouchStart, false);
    }
  }
};
