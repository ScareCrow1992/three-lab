precision highp float;

// RawShaderMaterial 이라면 모든 데이터를 직접 전달해야하지만,
// ShaderMaterial은 기본 uniform은 three.js가 기본적으로 선언/주입해준다.
// uniform mat4 instanceMatrix;
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 modelMatrix;

attribute vec3 picking;

varying vec4 vPicking;


void main(){
  vPicking = vec4(picking, 1.0);
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4( position, 1.0 );

}