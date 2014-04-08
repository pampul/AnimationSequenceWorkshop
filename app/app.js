/**
 * Created by Florian on 10/12/2013.
 */


$(function () {

  // Launching app
  var animationSequence = new AnimationSequence();
  animationSequence.launchSequence({
    firstFrame: "public/video/forza/large/frame-00001.jpg",
    indexFrames: "public/video/forza/min/frame-{index}.jpg",
    wrapperHeight: 8000,
    maxFrames: 432,
    ajaxCall: false,
    userScrollEnabled: true,
    autoScrollEnabled: false,
    autoScrollLength: 35000,
    autoScrollWaitingTime: 5000,
    dragDropScrollEnabled: false,
    classOptions: {
      indexSize: 5,
      initialStep: 64,
      onProgress: animationSequence.handleLoadProgress,
      onComplete: animationSequence.handleLoadComplete,
      stopAt: 1
    }
  });
});