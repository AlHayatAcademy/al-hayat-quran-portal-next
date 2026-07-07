import Link from "next/link";

export function AdminNav({ active }: { active: "overview" | "people" }) {
  const items = [
    { href: "/admin", label: "Overview", key: "overview" },
    { href: "/admin/people", label: "People", key: "people" },
  ] as const;

  return (
    <nav className="mt-6 flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`rounded-full px-4 py-2 text-sm font-bold ${
            active === item.key
              ? "bg-emerald-900 text-white"
              : "border border-emerald-900/15 bg-white text-emerald-950"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
