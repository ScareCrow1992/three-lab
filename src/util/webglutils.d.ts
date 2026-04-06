/**
 * webglutils.js 는 ES module export가 아니라 
 * 브라우저 전역 객체에 webglUtils를 추가하는 스크립트이다.
 * index.html 에서 이 스크립트를 먼저 로드하면,
 * 런타임에서 render.ts 가 실행될 때 webglUtils를 전역 변수처럼
 * 사용할 수 있다.

하지만 TypeScript는 index.html에서
어떤 스크립트가 먼저 로드되는지 기준으로타입을 추론하지 않는다.
그래서 webglutils.d.ts 에서
"webglUtils라는 전역 값이 존재하고, 그 타입은 이렇다"
라고 별도로 선언해줘야 한다.

더 정확히 쓰면 아래와 같다.

"webglutils.js는 브라우저 전역에 webglUtils를 등록한다.
index.html에서 이 스크립트를 로드하면 런타임에서 render.ts는 webglUtils를 사용할 수 있다.
하지만 TypeScript는 그 사실을 자동으로 알지 못하므로,
webglutils.d.ts를 통해 webglUtils가 전역에 존재한다는 타입 정보를 선언해줘야 한다."
 */

declare global {
  const webglUtils: {
    resizeCanvasToDisplaySize(
      canvas: HTMLCanvasElement | OffscreenCanvas,
      multiplier?: number,
    ): boolean;
  };
}

export {};
