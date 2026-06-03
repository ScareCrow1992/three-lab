// #version 300 es
// precision highp float;

in vec4 vInstanceColor;
out vec4 outColor;

void main(){
  outColor = vInstanceColor;
  // outColor = vec4(1.0, 1.0, instanceId, 1.0);
}