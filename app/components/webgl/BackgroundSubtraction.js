import React from "react";
import { Shaders, Node, GLSL } from "gl-react";

// Our example will simply split R G B channels of the video.
const shaders = Shaders.create({
  BackgroundSubtraction: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D children;
uniform sampler2D average;
void main () {
  float y = uv.y * 3.0;
  vec3 averageColor = texture2D(average, uv).rgb;
  vec3 frameColor = texture2D(children, uv).rgb;
  gl_FragColor = vec4(frameColor - averageColor, 1.0);
}
`
  }
});
const BackgroundSubtraction = ({ children, average }) => (
  <Node shader={shaders.BackgroundSubtraction} uniforms={{ children, average }} />
);

export default BackgroundSubtraction;
