import { EditorProps } from "./common";

export default function StringReplaceEditor({ config, onChange }: EditorProps<{ search?: string; replace?: string }>) {
  return (
    <div className="flex gap-2">
      <input className="border rounded px-2 py-1 w-1/2" placeholder="search" value={config.search ?? ""} onChange={(e) => onChange({ search: e.target.value })} />
      <input className="border rounded px-2 py-1 w-1/2" placeholder="replace" value={config.replace ?? ""} onChange={(e) => onChange({ replace: e.target.value })} />
    </div>
  );
}
