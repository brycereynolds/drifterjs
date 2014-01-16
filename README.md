drifterjs
=========

Object movement using LERP and effects!

In the current demo just run index.html and click the icon to start. In the source you can see how to begin tweaking the configuration options. For convenience dots that are using variance (when they are off of the standard bearing they exhibit variance) will be colored green while dots on the bearing line to the destination are black.

More details to follow...

### Usage:
    // Element will fade in and out toward the end points
    // specified. Before one element fades out completely
    // the next element will start to fade in.

    var drifter = new Drifter(".demoOne", {
        effect  : "balloon",
        parent  : $('.container'),
        end     : {top: 200, left: 200},
        varianceBoundary : 75,
        effectPace: 800
    });

    drifter.start();


##[Demo coming soon!](http://www.google.com)
