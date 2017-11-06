import React from "react";
import { Shaders, Node, GLSL } from "gl-react";

// Our example will simply split R G B channels of the video.
const shaders = Shaders.create({
  SplitColor: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D children;
void main () {
  float y = uv.y * 3.0;
  vec4 c = texture2D(children, vec2(uv.x, mod(y, 1.0)));
  gl_FragColor = vec4(
    c.r * step(2.0, y) * step(y, 3.0),
    c.g * step(1.0, y) * step(y, 2.0),
    c.b * step(0.0, y) * step(y, 1.0),
    1.0);
}
`
  }
  //^NB perf: in fragment shader paradigm, we want to avoid code branch (if / for)
  // and prefer use of built-in functions and just giving the GPU some computating.
  // step(a,b) is an alternative to do if(): returns 1.0 if a<b, 0.0 otherwise.
});
const SplitColor = ({ children }) => (
  <Node shader={shaders.SplitColor} uniforms={{ children }} />
);

export default SplitColor;
