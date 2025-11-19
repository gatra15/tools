import './globals.css';

export const metadata = {
  title: 'Utility Tools',
  description: 'Convert, merge, split PDF, and more',
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f8fdf8] text-gray-900">
        {children}
      </body>
    </html>
  );
}