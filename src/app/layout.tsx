import './globals.css';
import type { Metadata } from 'next';
import { Noto_Sans_Bengali, Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-bengali',
});

export const metadata: Metadata = {
  title: 'গ্রন্থী - প্রিমিয়াম পিডিএফ স্টোর',
  description: 'প্রিমিয়াম পিডিএফ রিডার ও স্টোর। বিকাশ ও নগদে সরাসরি সুরক্ষিত পেমেন্ট করুন এবং তাত্ক্ষনিকভাবে পিডিএফ ডাউনলোড করে পড়ুন।',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className={`${plusJakartaSans.variable} ${notoBengali.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
