;
(function ($) {
  $.fn.dragScroll = function (options) {

    var settings = $.extend(
      {
        dragSelector: '>:first',
        acceptPropagatedEvent: true,
        preventDefault: true,
        mainHandler: 'body',
        mainAnimation: 'html, body',
        dragMin: 0,
        dragMax: 1,
        maxHeight: 2000,
        enable: true
      }, options || {});


    var dragscroll = {
      mouseDownHandler: function (event) {
        // mousedown, left click, check propagation
        if (event.which != 1 ||
          (!event.data.acceptPropagatedEvent && event.target != this)) {
          return false;
        }

        // Initial coordinates will be the last when dragging
        event.data.lastCoord = {left: event.clientX, top: event.clientY};


        $(settings.dragSelector).
          bind('mousemove', event.data, dragscroll.mouseMoveHandler);
        $(settings.dragSelector).
          bind('mouseup', event.data, dragscroll.mouseUpHandler);
        if (event.data.preventDefault) {
          event.preventDefault();
          return false;
        }
      },
      mouseMoveHandler: function (event) { // User is dragging
        // How much did the mouse move?
        var delta = {
          left: (event.clientX - event.data.lastCoord.left),
          top: (event.clientY - event.data.lastCoord.top)
        };

        var targetPosition = $(window).scrollTop() / settings.maxHeight;
        var scrollTopResult = $(window).scrollTop() - delta.top;

        // Set the scroll position relative to what ever the scroll is now
        $("html, body").animate({
          scrollLeft: $(window).scrollLeft() - delta.left
        }, 0);
        $("html, body").animate({
          scrollTop: scrollTopResult
        }, 0);

        // Save where the cursor is
        event.data.lastCoord = {left: event.clientX, top: event.clientY}
        if (event.data.preventDefault) {
          event.preventDefault();
          return false;
        }

      },
      mouseUpHandler: function (event) { // Stop scrolling
        $(settings.dragSelector).unbind("mousemove");
        $(settings.dragSelector).unbind("mouseup");
        if (event.data.preventDefault) {
          event.preventDefault();
          return false;
        }
      }
    }

    // set up the initial events
    this.each(function () {
      // closure object data for each scrollable element
      var data = {scrollable: $(this),
        acceptPropagatedEvent: settings.acceptPropagatedEvent,
        preventDefault: settings.preventDefault }
      // Set mouse initiating event on the desired descendant
      if(settings.enable){
      $(this).find(settings.dragSelector).
        bind('mousedown', data, dragscroll.mouseDownHandler);
      }else{
        $(this).find(settings.dragSelector).unbind('mousedown');
      }

    });
  };

})(jQuery);