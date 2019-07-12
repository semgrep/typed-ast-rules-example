import * as estree from "estree";
import * as stadt from "stadt";
import { Context, Rule, getType, possibleTypes } from "./index";

function isRequire(ty: stadt.Type): boolean {
  if (!(ty instanceof stadt.NominativeType)) {
    return false;
  }
  const { name, packageName } = ty.fullyQualifiedName;
  return (
    packageName === "@types/node" &&
    (name == "NodeRequire" || name == "NodeRequireFunction")
  );
}

export const rule: Rule = {
  create(context: Context) {
    return {
      CallExpression(node: estree.CallExpression) {
        const ty = getType(node.callee);
        if (!(ty && possibleTypes(ty).some(isRequire))) {
          return;
        }
        const args = node.arguments;
        if (args.length == 0) {
          // An empty require is invalid, but not insecure.
          return;
        }
        const argType = getType(args[0]);
        const isSafe =
          argType &&
          possibleTypes(argType).every(t => t instanceof stadt.LiteralType);
        if (!isSafe) {
          context.report({
            node,
            checkId: "non-literal-require"
          });
        }
      }
    };
  }
};
