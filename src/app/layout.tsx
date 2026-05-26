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
  title: 'বিহান BIHAN - প্রিমিয়াম পিডিএফ স্টোর',
  description: 'প্রিমিয়াম পিডিএফ রিডার ও স্টোর। বিকাশ ও নগদে সরাসরি সুরক্ষিত পেমেন্ট করুন এবং তাৎক্ষণিকভাবে পিডিএফ ডাউনলোড করে পড়ুন।',
  keywords: ['বিহান', 'BIHAN', 'PDF', 'বই', 'ডিজিটাল', 'বিকাশ', 'নগদ', 'ই-বুক', 'Bihan', 'bangla book', 'pdf selling'],
  themeColor: '#f59e0b',
  openGraph: {
    title: 'বিহান BIHAN — বাংলাদেশের প্রিমিয়াম ডিজিটাল বুক স্টোর',
    description: 'প্রিমিয়াম পিডিএফ গাইড ও ই-বুক। বিকাশ ও নগদে সহজ পেমেন্ট, তাৎক্ষণিক অ্যাক্সেস।',
    url: 'https://bihan-store.vercel.app',
    siteName: 'বিহান (BIHAN)',
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'বিহান BIHAN — বাংলাদেশের প্রিমিয়াম ডিজিটাল বুক স্টোর',
    description: 'প্রিমিয়াম পিডিএফ গাইড ও ই-বুক। বিকাশ ও নগদে সহজ পেমেন্ট।',
  },
  robots: {
    index: true,
    follow: true,
  },
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
