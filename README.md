# AnimationSequence Workshop [![Build Status](https://travis-ci.org/Argetloum/AnimationSequenceWorkshop.png)](https://travis-ci.org/Argetloum/AnimationSequenceWorkshop)

The AnimationSequence is a workshop to render a video only with scroll events.
I used the ProgressiveImageSequence created by Hinderling Volkart AG to render images with the best performances.

The goal is to handle events easily and render a video only by scrool, drag n'drop and automatic scroll events.
We can display hotspots regardless the scroll position (percentage of the frames scrolled)

* View [the demo](http://animation-sequence-workshop.florian-mithieux.com)

* Source: [github.com/Argetloum/AnimationSequenceWorkshop](https://github.com/Argetloum/AnimationSequenceWorkshop)


## Jump start

Get started with the boilerplate:

1. Clone the git repo — `git clone https://github.com/Argetloum/AnimationSequenceWorkshop.git` and checkout the tagged release you need.
2. Execute in the shell `sudo npm install` to install each node.js dependencies, needed for [Grunt.](http://gruntjs.com/)
3. Execute in the shell `bower install` to install each front-end dependencies.
4. Execute in the shell `grunt` to generate the stylesheets and scripts files.

You can also execute `grunt dev` to watch modified files and re-generate scripts and stylesheets.


## How to implement a scroll app

Following the [app.js file](https://github.com/Argetloum/AnimationSequenceWorkshop/blob/master/app/app.js), you can implement several options :

```js
var animationSequence = new AnimationSequence();
  animationSequence.launchSequence({
    firstFrame: "public/video/forza/large/frame-00001.jpg", // first img loaded
    indexFrames: "public/video/forza/min/frame-{index}.jpg", // the position of the "index" to display frames
    wrapperHeight: 8000, // The base wrapper height (will be recalculated later)
    maxFrames: 432, // Total number of frames
    ajaxCall: false, // not implemented yet
    userScrollEnabled: true, // The user can scroll
    autoScrollEnabled: false, // If the user don't scroll, an auto-scroll start
    autoScrollLength: 35000, // The duration of the auto-scroll feature
    autoScrollWaitingTime: 5000, // The duration to wait before launching the auto-scroll feature
    dragDropScrollEnabled: false, // The user can scroll using drag n'drop
    classOptions: {
      indexSize: 5, // The index size (for example, 5 eq to : 00001 and 4 eq to : 0001)
      initialStep: 64, // The initial step to load images (The loader will load the img 1, then 64, then 128 ...)
      onProgress: animationSequence.handleLoadProgress, // Callback to handle the progress of images loading
      onComplete: animationSequence.handleLoadComplete, // Callback to handle the end of images loading
      stopAt: 1 // Percentage when the scroll stop (1 = 100%, then 0.5 = 50%)
    }
  });
```

## Handle hotspots

There is a lot of hotspots implementation. The classical one is :

```html
<div class="hotspot" data-position="0.3" data-speed="2" data-timer="0.2" data-effect="slide-bottom" style="left: 15%;">
      <div class="hotspot-wrapper blue">
        30%
      </div>
</div>
```

The hotspot must have the `hotspot` classe.
Then, to show the bubble, you need to set a `data-position`. For this exemple, `0.3` means 30%. The hotspot will show on 30% of the video.
The `data-speed` attribute handle the speed to show the bubble.
The `data-timer` will let the hotspot waiting in the middle of his animation during the time set. `20%` of the video for this example.
The `data-effect` attribute will make the effect wanted to show the hotspot.


**/!\**
**This is just a workshop, then you must understand that the project is not well documented.**
**/!\**
