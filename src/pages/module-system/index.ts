type TVec2 = readonly [number, number];

type TPoint = TVec2;

class DrawWallState {
  public createCmd(from: TPoint, to: TPoint) {
    //
  }
}

type Command<
  TModule extends string,
  TFn extends string,
  TArgs extends readonly unknown[],
> = {
  module: TModule;
  fn: TFn;
  args: TArgs;
};

type DrawWallCommand = Command<"wall", "draw", [TPoint, TPoint]>;

// 매번 Command를 새로 만들수는 없다.
/* type DrawWallCommand = Command & {
  module: "wall"; // 반드시 WallModule의 draw를 추적가능한 타입이어야 한다.
  fn: "draw";
  args: [TPoint, TPoint]; // WallModule의 draw와 같은 타입임이 보장되어야한다.
}; */

//
// TCommand<"wall", "draw">

// WallModule을 주입받거나, 생성자를 통해 전달받는다.
class CadModule {
  constructor(private readonly wallModule: WallModule) {}

  execute(cmd: Command) {
    // cmd의 source를 읽어서, wallModule의 메서드를 호출하고 draw를 호출한 후, 반환값도 받아올 수 있어야한다.
  }
}

class WallModule {
  constructor(private readonly service: WallService) {}

  public execute(cmd: Command, depth: number) {
    //....
  }
}

class WallService {
  public draw(from: TPoint, to: TPoint): WallDrawPlan {
    return { result: {}, mutations: [] };
  }
}

type WallDrawPlan = {
  result: WallDrawResult;
  mutations: WallDrawMutation[];
};

type WallDrawResult = {};
type WallDrawMutation = {};

const wall = new WallModule();
