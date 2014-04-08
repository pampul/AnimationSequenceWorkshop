/**
 * Created by Hinderling Volkart AG.
 * User: sev
 * Date: 23.06.11
 * Time: 17:02
 * Copyright 2011, Hinderling Volkart AG. All rights reserved.
 */

function ProgressiveImageSequence(imgpath, count, options) {
  var myself = this;

  var images = [];
  var numLoaded = 0;
  var isComplete = false;
  this.length = count;

  var defaultOptions = {
    indexSize: 4,
    initialStep: 64,
    onComplete: null,
    onProgress: null,
    stopAt: 1
  };
  var pref = {};
  $.extend(pref, defaultOptions, options);

  var step = pref.initialStep;
  var current = 0;
  var hasRestepped = false;

  function callback(f, o) {
    if (!!f) f.apply(o);
  }

  this.stop = function () {
    step = pref.stopAt / 2;
  };

  this.reset = function () {
    isComplete = false;
    numLoaded = 0;
    step = pref.initialStep;
    current = 0;
    hasRestepped = false;
    this.nearestIndex = -1;
    $.each(images, function (k, v) {
      !!v && v.unload();
    });
  };

  this.getAt = function (index) {
    return images[index].image;
  };

  this.nearestIndex = -1;

  this.getNearest = function (index) {
    index = Math.floor(index);
    var diff = 0;
    var i, img;
    for (diff = 0; diff < images.length; diff++) {
      i = index + diff;
      if (i >= 0 && i < images.length) {
        img = images[i];
        if (img && img.isLoaded()) {
          this.nearestIndex = i;
          return img.image;
        }
      }
      i = index - diff;
      if (i >= 0 && i < images.length) {
        img = images[i];
        if (img && img.isLoaded()) {
          this.nearestIndex = i;
          return img.image;
        }
      }
    }
    return null;
  };

  // Loading

  this.getNumLoaded = function () {
    return numLoaded;
  };

  this.getLoadProgress = function () {
    return numLoaded * pref.stopAt / myself.length;
  };

  this.isLoaded = function (index) {
    if (index === undefined) {
      return numLoaded == myself.length;
    } else {
      return images[index].isLoaded();
    }
  };

  this.loadPosition = function (position, complete) {
    position = Math.min(1, Math.max(0, position));
    var index = position * (myself.length - 1);
    index = Math.round(index);
    myself.loadIndex(index, complete);
  };

  this.loadIndex = function (index, complete) {
    if (index < 0 || index >= myself.length) return false;

    if (index != Math.floor(index)) {
      return false;
    }

    //console.log( "Loading " + index + " ("+[current,step]+")" );

    var img = images[index];
    if (img == null) {
      var src = getSrcAt(index);
      img = new ImageLoader(src);
      images[index] = img;
    }
    img.load(function () {
      numLoaded++;
      if (!isComplete) {
        callback(pref.onProgress, this);
      } else {
        //console && console.log("On progress?");
      }
      callback(complete, this);
    });
  };

  this.loadNext = function (complete) {
    if (step < pref.stopAt) return; // in this case we've already loaded all images - other threads just don't know yet

    function next() {
      loadNextImage();
      callback(complete, this);
    }

    function end() {
      finished();
      callback(complete, this);
    }

    current += step;
    if (current >= myself.length) {
      if (hasRestepped) step /= 2;
      hasRestepped = true;
      current = step / 2;
      if (current >= pref.stopAt) {
        myself.loadIndex(current, next);
      } else {
        finished();
      }
    } else {
      myself.loadIndex(current, next);
    }
  };

  this.getImageLoader = function (index) {
    return images[index];
  };

  function loadNextImage() {
    setTimeout(function () {
      myself.loadNext();
    }, $.browser.mozilla || $.browser.msie ? 50 : 5);
  }

  function finished() {
    isComplete = true;
    callback(pref.onComplete, this);
    //console.log( "All images loaded" , numLoaded, 'of', myself.length );
  }

  function getSrcAt(index) {
    var str = (index + 1 + Math.pow(10, pref.indexSize)).toString(10).substr(1);
    return imgpath.replace('{index}', str);
  }

  this.load = function () {
    myself.loadIndex(0, loadNextImage);
  }
}

function ImageLoader(src) {
  //var elem = $('<img>');
  this.image = new Image();
  var img = this.image;
  var loadStarted = false;

  this.getSrc = function () {
    return src;
  };

  this.load = function (complete) {
    loadStarted = true;
    img.src = src;
    if (img.complete) {
      complete.apply(img);
    } else {
      $(img).load(complete);
    }
  };

  this.unload = function () {
    loadStarted = false;
    //img.src = '';
    img = this.image = new Image();
  };

  this.isLoaded = function () {
    return loadStarted && img.complete;
  }
}
