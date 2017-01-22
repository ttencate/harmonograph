# Harmonograph in JavaScript

What's a harmonograph, you ask? Well, it's something like a Spirograph for
grown-ups. A harmonograph uses a construction with pendulums to draw pretty
patterns.

One particular incarnation uses two pendulums of nearly equal length, each
about two metres. To the right pendulum, a slowly revolving disk is attached,
which is driven by a small electrical motor. The drawing paper is taped onto
the disk. To the left pendulum, an arm is attached with the pen at the end.
When the pressure and thus the friction of the pen is sufficiently low, the
pendulums can keep swinging for tens of minutes.

For learning and fun, I replicated this harmonograph in JavaScript with the
HTML5 canvas element. The pendulum motion is approximated by a sine function,
and friction by an exponential, but apart from that it should be pretty
physically accurate.

Without further ado, I present to you this
[Harmonograph in JavaScript](https://ttencate.github.io/harmonograph/). Usage
should be self-evident. Although some input validation is done, you will be
able to break it with strange values.

You can save and bookmark your creations in the form as links. You can also
export images in PNG and SVG format. Enjoy!
