# JSON Transformation Tool (MVP)

In-browser JSON transformation UI with Monaco editors, draggable operation stack, and live result.

Features (MVP):

- Three-column layout: Source, Operations, Result
- Operations: FilterByKey, RenameKey, MapArray, ExtractPath, StringReplace
- Drag to reorder, delete, undo/redo
- Paste/Upload source JSON, Copy/Download result
- JSON validation and 5 MB size guard

Dev:

1. Install deps with pnpm
2. Run dev server

Notes:

- All execution is client-side.
- No persistence/auth in MVP.This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Operations metadata export:

- Generate a JSON listing of all operations, their parameters, and descriptions:

```bash
pnpm run export:ops
```

- Output file: `app/operations.json`
