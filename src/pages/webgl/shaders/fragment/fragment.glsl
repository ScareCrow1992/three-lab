// 프래그먼트 셰이더는 기본 정밀도를 가지고 있지 않으므로 하나를 선택해야 합니다.
// mediump은 좋은 기본값으로 "중간 정밀도"를 의미합니다.
precision mediump float;
 
void main() {
  // gl_FragColor는 프래그먼트 셰이더가 설정을 담당하는 특수 변수
  gl_FragColor = vec4(1, 0, 0.5, 1); // 자주색 반환
}