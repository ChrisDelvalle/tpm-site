export const componentSyntaxRestrictions = [
  {
    message:
      "Components must not declare mutable variables. Use const expressions or move logic into a helper/controller.",
    selector: "VariableDeclaration[kind='var']",
  },
  {
    message:
      "Components must not declare mutable local variables. Use const expressions or move logic into a helper/controller.",
    selector: "VariableDeclaration[kind='let']",
  },
  {
    message:
      "Components must not mutate values. Move stateful logic into a helper/controller or derive a new value immutably.",
    selector: "AssignmentExpression",
  },
  {
    message:
      "Components must not mutate values. Use immutable derivation instead.",
    selector: "UpdateExpression",
  },
  {
    message:
      "Components should not contain loops. Use map/filter/flatMap/reduce or move logic into a helper.",
    selector: "ForStatement",
  },
  {
    message:
      "Components should not contain loops. Use map/filter/flatMap/reduce or move logic into a helper.",
    selector: "ForInStatement",
  },
  {
    message:
      "Components should not contain loops. Use map/filter/flatMap/reduce or move logic into a helper.",
    selector: "ForOfStatement",
  },
  {
    message:
      "Components should not contain loops. Use map/filter/flatMap/reduce or move logic into a helper.",
    selector: "WhileStatement",
  },
  {
    message:
      "Components should not contain loops. Use map/filter/flatMap/reduce or move logic into a helper.",
    selector: "DoWhileStatement",
  },
  {
    message:
      "Components must not use mutating collection methods. Use immutable alternatives or move logic into a helper.",
    selector:
      "CallExpression > MemberExpression.callee > Identifier.property[name=/^(copyWithin|fill|pop|push|reverse|shift|sort|splice|unshift)$/]",
  },
  {
    message: "Components must be functions. Do not use React class components.",
    selector: "ClassDeclaration[superClass.name=/^(Component|PureComponent)$/]",
  },
  {
    message: "Components must be functions. Do not use React class components.",
    selector:
      "ClassDeclaration[superClass.property.name=/^(Component|PureComponent)$/]",
  },
  {
    message:
      "React stateful runtime hooks belong in external controller/hook files, not TSX view components.",
    selector:
      "CallExpression[callee.name=/^use(State|Reducer|Effect|LayoutEffect|InsertionEffect|Ref|ImperativeHandle)$/]",
  },
  {
    message:
      "React stateful runtime hooks belong in external controller/hook files, not TSX view components.",
    selector:
      "CallExpression[callee.property.name=/^use(State|Reducer|Effect|LayoutEffect|InsertionEffect|Ref|ImperativeHandle)$/]",
  },
];

export const normalModuleSyntaxRestrictions = [
  {
    message:
      "Do not export mutable bindings. Export an accessor function instead.",
    selector: "ExportNamedDeclaration > VariableDeclaration[kind='let']",
  },
  {
    message: "Use plain enums rather than const enums.",
    selector: "TSEnumDeclaration[const=true]",
  },
];

export const sourceModuleSyntaxRestrictions = [
  {
    message:
      "Use named exports. Default exports obscure the canonical symbol name.",
    selector: "ExportDefaultDeclaration",
  },
  ...normalModuleSyntaxRestrictions,
];

export const unsafeNumericGlobals = [
  {
    message: "Use Number() plus an explicit Number.isFinite() check.",
    name: "parseFloat",
  },
  {
    message:
      "Use Number() plus explicit validation unless parsing a non-decimal radix.",
    name: "parseInt",
  },
  {
    message: "Use Number.isFinite() to avoid implicit coercion.",
    name: "isFinite",
  },
  {
    message: "Use Number.isNaN() to avoid implicit coercion.",
    name: "isNaN",
  },
];

export const browserRuntimeGlobals = [
  {
    message:
      "Astro files are static views. Move browser runtime behavior into an island/controller.",
    name: "window",
  },
  {
    message:
      "Astro files are static views. Move browser runtime behavior into an island/controller.",
    name: "document",
  },
  {
    message:
      "Astro files are static views. Move browser runtime behavior into an island/controller.",
    name: "localStorage",
  },
  {
    message:
      "Astro files are static views. Move browser runtime behavior into an island/controller.",
    name: "sessionStorage",
  },
  {
    message:
      "Astro files are static views. Move browser runtime behavior into an island/controller.",
    name: "navigator",
  },
];
