import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Utility Tools</h1>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link
          href="/tools/convert"
          className="p-6 rounded-xl shadow bg-white border hover:bg-green-50 transition"
        >
          <h2 className="text-xl font-semibold text-green-800">Delimiter Converter</h2>
          <p className="text-gray-600">Convert Excel rows to comma/semicolon separated values.</p>
        </Link>


        <Link
          href="/tools/merge-pdf"
          className="p-6 rounded-xl shadow bg-white border hover:bg-green-50 transition"
        >
          <h2 className="text-xl font-semibold text-green-800">Merge PDF</h2>
          <p className="text-gray-600">Combine multiple PDFs into one.</p>
        </Link>


        <Link
          href="/tools/split-pdf"
          className="p-6 rounded-xl shadow bg-white border hover:bg-green-50 transition"
        >
          <h2 className="text-xl font-semibold text-green-800">Split PDF</h2>
          <p className="text-gray-600">Extract pages from a PDF file.</p>
        </Link>
      </div>
    </div>
  );
}