type Cfg = { path: string; depth?: number | "infinity" };

export default function FlattenArray(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const depth = cfg.depth === 'infinity' ? -1 : (cfg.depth ?? 1);
  return `# FlattenArray\n{
  __arr = list(${varName}${access} or [])
  __d = ${depth}
  if __d == -1:
    # flatten completely
    __out = []
    __stack = list(__arr)
    while __stack:
      __it = __stack.pop(0)
      if isinstance(__it, (list, tuple)):
        __stack = list(__it) + __stack
      else:
        __out.append(__it)
    ${varName}${access} = __out
  else:
    for _ in range(__d):
      __tmp = []
      for __it in __arr:
        if isinstance(__it, (list, tuple)):
          __tmp.extend(list(__it))
        else:
          __tmp.append(__it)
      __arr = __tmp
    ${varName}${access} = __arr
}`;
}
