import * as nonLiteralRequire from "./non-literal-require";
import * as typedAst from "@r2c/typed-ast-util";

export const all: ReadonlyArray<typedAst.Rule> = [nonLiteralRequire.rule];
