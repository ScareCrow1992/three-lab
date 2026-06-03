// #version 300 es


out vec4 vInstanceColor;

void main(){

  int id = gl_InstanceID + 1;

  // 보기 쉬운 색으로 변환
  float b = float(id % 256) / 255.0;
  float g = float((id / 256) % 256) / 255.0;
  float r = float((id / 65536) % 256) / 255.0;

  vInstanceColor = vec4(r, g, b, 1.0);

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4( position, 1.0 );
}