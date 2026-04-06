import VertexShaderSource from "@/pages/webgl/shaders/vertex/vertetx.glsl";
import FragmentShaderSource from "@/pages/webgl/shaders/fragment/fragment.glsl";

// 쉐이더를 생성후 컴파일한다.
function createShader(gl: WebGLRenderingContext, type: GLenum, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) return shader;
  else return null;
}

// 두 셰이더를 프로그램으로 연결한다.
function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

export function main(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    FragmentShaderSource,
  );

  if (!vertexShader || !fragmentShader) return;

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) return;

  // GLSL 프로그램에 데이터를 제공하기 위한 속성 설정
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // 속성(attribute)이 데이터를 가져오기 위한 GPU 버퍼를 생성
  const positionBuffer = gl.createBuffer();

  // 버퍼를 바인딩하여, 모든 함수가 바인드 포인트를 통해 리소스를 참조 가능하게 만든다.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // 이제 바인드 포인트를 통해, 해당 버퍼를 참조하여 데이터를 넣을 수 있다.
  // 2D 포인트 2개를 넣어보자
  // gl.bufferData는 positions 데이터를 GPU의 positionBuffer로 복사한다.
  // gl.STATIC_DRAW : 최적화 힌트 (자주 바뀌지 않는 Static 데이터라는 의미)
  const positions = [0, 0, 0, 0.5, 0.7, 0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // 이제 본격적으로 렌더링을 시작한다.
  webglUtils.resizeCanvasToDisplaySize(gl.canvas, 1);

  // Tell WebGL how to convert from clip space to pixels
  // gl_Position 으로 설정할 클립 공간 값을 화면 공간으로 변환시키기 위해
  // WebGL에 캔버스 크기를 전달한다.
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind the position buffer.

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 2; // 2 components per iteration
  const type = gl.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset,
  );

  // draw
  const primitiveType = gl.TRIANGLES;
  const count = 3;
  gl.drawArrays(primitiveType, offset, count);
}
