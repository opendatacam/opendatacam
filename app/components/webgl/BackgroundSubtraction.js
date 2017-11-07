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
void main () {
  float y = uv.y * 3.0;
  vec3 averageColor = texture2D(average, uv).rgb;
  vec3 frameColor = texture2D(children, uv).rgb;
  vec3 canvas2DColor = texture2D(canvas2d, uv).rgb;
  if(canvas2DColor.r == 1.0) {
    if(dot(abs(frameColor - averageColor), vec3(1)) >= 0.25) {
      gl_FragColor = vec4(averageColor, 1.0);
    } else {
      gl_FragColor = vec4(frameColor, 1.0);
    }
  } else {
    gl_FragColor = vec4(frameColor, 1.0);
  }
}
`
  }
});
const BackgroundSubtraction = ({ children, average, canvas2d }) => (
  <Node shader={shaders.BackgroundSubtraction} uniforms={{ children, average, canvas2d }} />
);

export default BackgroundSubtraction;
