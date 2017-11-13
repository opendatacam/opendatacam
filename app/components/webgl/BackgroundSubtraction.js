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
uniform sampler2D canvas2d;

float when_eq(float x, float y) {
  return 1.0 - abs(sign(x - y));
}

float when_gt(float x, float y) {
  return max(sign(x - y), 0.0);
}

float when_neq(float x, float y) {
  return abs(sign(x - y));
}

void main () {
  float y = uv.y * 3.0;
  vec3 averageColor = texture2D(average, uv).rgb;
  vec3 frameColor = texture2D(children, uv).rgb;
  vec3 canvas2DColor = texture2D(canvas2d, uv).rgb;
  float isMaskedPixel = 0.0;
  vec3 outputColor = vec3(0);

  isMaskedPixel = 1.0 * when_eq(canvas2DColor.r, 1.0) * when_gt(dot(sqrt(abs(frameColor - averageColor)), vec3(1)), 0.90);
  
  outputColor += frameColor * when_neq(isMaskedPixel, 1.0);
  outputColor += averageColor * when_eq(isMaskedPixel, 1.0);

  gl_FragColor = vec4(outputColor, 1.0);
}
`
  }
});
const BackgroundSubtraction = ({ children, average, canvas2d }) => (
  <Node shader={shaders.BackgroundSubtraction} uniforms={{ children, average, canvas2d }} />
);

export default BackgroundSubtraction;
