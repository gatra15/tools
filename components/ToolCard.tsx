export default function ToolCard({ title, desc, href }: any) {
    return (
        <a
            href={href}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition block border border-gray-100"
        >
            <h3 className="font-bold text-xl text-[var(--color-leaf-dark)]">{title}</h3>
            <p className="text-gray-600 mt-1">{desc}</p>
        </a>
    );
}
