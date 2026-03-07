export default function StepList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2 pl-5 text-sm marker:font-semibold">
      {items.map((item, idx) => (
        <li key={`${idx}-${item}`} className="list-decimal">
          {item}
        </li>
      ))}
    </ol>
  );
}
