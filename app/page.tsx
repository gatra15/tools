import Link from 'next/link';
import Layout from '@/components/Layout';
import {
  FileSpreadsheet,
  Layers,
  Scissors,
  ArrowRight,
  Sparkles,
  FileEdit,
  Minimize2
} from 'lucide-react';

export default function HomePage() {
  const tools = [
    {
      title: 'Edit & Hapus Halaman PDF',
      desc: 'Pilih dan hapus halaman yang tidak diinginkan secara visual, lalu satukan kembali menjadi PDF baru.',
      href: '/tools/edit-page',
      icon: FileEdit,
      badge: 'Baru',
      badgeColor: 'bg-green-100 text-green-800',
    },
    {
      title: 'Compress PDF',
      desc: 'Kecilkan ukuran dokumen PDF dengan tingkat kompresi optimal, ekstrem, atau kualitas tinggi.',
      href: '/tools/compress-pdf',
      icon: Minimize2,
      badge: 'Baru',
      badgeColor: 'bg-green-100 text-green-800',
    },
    {
      title: 'Merge PDF',
      desc: 'Gabungkan beberapa file PDF dokumen menjadi satu kesatuan dokumen lengkap.',
      href: '/tools/merge-pdf',
      icon: Layers,
      badge: 'PDF Tool',
      badgeColor: 'bg-gray-100 text-gray-700',
    },
    {
      title: 'Split PDF',
      desc: 'Pisahkan setiap halaman dokumen PDF ke dalam berkas-berkas terpisah berformat ZIP.',
      href: '/tools/split-pdf',
      icon: Scissors,
      badge: 'PDF Tool',
      badgeColor: 'bg-gray-100 text-gray-700',
    },
    {
      title: 'Delimiter Converter',
      desc: 'Ubah baris data daftar Excel/teks menjadi format nilai yang dipisahkan tanda koma, titik koma, atau pipa.',
      href: '/tools/convert',
      icon: FileSpreadsheet,
      badge: 'Text Tool',
      badgeColor: 'bg-gray-100 text-gray-700',
    },
  ];

  return (
    // <Layout>
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B5E20] tracking-tight font-sans">
            FileTools & PDF Utilities
          </h1>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group p-6 rounded-2xl shadow-sm hover:shadow-md bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 text-[#1B5E20] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#1B5E20] group-hover:text-[#2E7D32] transition-colors">
                    {tool.title}
                  </h2>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-sm font-semibold text-[#2E7D32] group-hover:translate-x-1 transition-transform gap-1">
                  <span>Buka Alat</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Feature Highlights */}
        {/* <div className="bg-white rounded-2xl p-6 border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-600 mt-1.5 shrink-0" />
            <div>
              <strong className="text-gray-900 block mb-0.5">Keamanan & Privasi Terjamin</strong>
              Seluruh operasi manipulasi halaman dan kompresi PDF dilakukan langsung pada memori browser Anda.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-600 mt-1.5 shrink-0" />
            <div>
              <strong className="text-gray-900 block mb-0.5">Edit Halaman Interaktif</strong>
              Pratinjau visual setiap halaman, tandai halaman yang ingin dibuang, dan satukan kembali secara instan.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-600 mt-1.5 shrink-0" />
            <div>
              <strong className="text-gray-900 block mb-0.5">Kompresi Cerdas</strong>
              Pilihan tingkat kompresi fleksibel untuk mengecilkan ukuran PDF secara drastis dengan teks tetap jelas.
            </div>
          </div>
        </div> */}
      </div>
      {/* </Layout> */}
    </div>
  );
}
