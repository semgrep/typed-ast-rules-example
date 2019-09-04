import * as estree from "estree";
import * as stadt from "stadt";
import { Context, Rule } from "@r2c/typed-ast-util";

function isRequire(ty: stadt.Type): boolean {
  if (!ty.isNominative()) {
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
        const ty = stadt.fromJSON(node.callee.inferredType);
        // We use mustSatisfy on the off chance that someone is doing something
        // like (someCondition ? require : someOtherThing)("module");
        if (ty.mustSatisfy(t => !isRequire(t))) {
          return;
        }
        const args = node.arguments;
        if (args.length == 0) {
          // An empty require is invalid, but not insecure.
          return;
        }
        const argType = stadt.fromJSON(args[0].inferredType);
        const isSafe = argType.mustSatisfy(t => t.isLiteral());
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
