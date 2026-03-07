# Operations

## Operation Shape
```ts
interface Operation {
  id: string;
  type: OperationType;
  config: JSONValue;
  enabled?: boolean;
  debugOpen?: boolean;
}
```

## Operation Module Contract
```ts
interface OperationModule<TConfig> {
  type: OperationType;
  apply: (input: JSONValue, config: TConfig) => JSONValue;
  validate: (config: TConfig, input: JSONValue) => string | undefined;
  defaultConfig?: TConfig;
}
```

## Runtime Semantics
- `validate` returns a string for invalid config/input; `undefined` means valid.
- `apply` must return transformed root JSON value.
- `enabled: false` skips apply/validate and keeps input unchanged.

## `writeResultTo`
Most operations support optional `writeResultTo`.
- Empty/not provided: operation writes to its normal target location.
- Provided: operation writes computed value to specified path on original root snapshot using `writeResult` helper.

## Adding a New Operation
1. Create `src/operations/<Operation>.ts` with `validate`, `apply`, `defaultConfig`.
2. Register in `src/operations/index.ts` and export config type.
3. Add editor component mapping if UI-editable.
4. Add unit tests in `tests/unit/` and integration tests in `tests/e2e/operations/`.
5. Run `pnpm run export:ops` if metadata is affected.
