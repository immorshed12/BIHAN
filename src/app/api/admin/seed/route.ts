import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Book from '@/models/Book';

const BOOKS_TO_SEED = [
  {
    _id: "60c72b2f9b1d8a23c4d5e6f1",
    title: "ইউআই/ইউএক্স ডিজাইন গাইড",
    author: "বিহান পাবলিশার্স",
    description: "পেশাদার ইউজার ইন্টারফেস ডিজাইন, ভিজ্যুয়াল আর্ট সিস্টেম এবং আধুনিক ডিজাইন নিয়মের সম্পূর্ণ প্র্যাক্টিক্যাল গাইড বুক।",
    price: 250,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    filePath: "books/ui-ux-design-guide.pdf",
    pageCount: 320,
    previewLimit: 4,
    ratingsCount: 5,
    averageRating: 4.9,
    category: "ডিজাইন",
    isFree: false
  },
  {
    _id: "60c72b2f9b1d8a23c4d5e6f2",
    title: "ডিজিটাল আর্ট টেকনিকস",
    author: "ডিপমাইন্ড একাডেমি",
    description: "ডিজিটাল পেইন্টিং, ব্রাশ কাস্টমাইজেশন এবং নিয়ন কালার প্যালেটের মাধ্যমে আকর্ষণীয় আর্ট তৈরির অ্যাডভান্সড মেথড।",
    price: 180,
    coverImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800",
    filePath: "books/digital-art-techniques.pdf",
    pageCount: 145,
    previewLimit: 4,
    ratingsCount: 4,
    averageRating: 4.9,
    category: "ডিজাইন",
    isFree: false
  },
  {
    _id: "60c72b2f9b1d8a23c4d5e6f3",
    title: "টাইপোগ্রাফি মাস্টারক্লাস",
    author: "আস্ট্রা ডিজাইনার্স",
    description: "ডিজিটাল কনটেন্ট ও প্রিন্টিং পাবলিশিংয়ের জন্য প্রিমিয়াম ফন্ট কম্বিনেশন এবং ভিজ্যুয়াল স্পেসিং সায়েন্স।",
    price: 200,
    coverImage: "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&q=80&w=800",
    filePath: "books/typography-masterclass.pdf",
    pageCount: 210,
    previewLimit: 4,
    ratingsCount: 6,
    averageRating: 4.8,
    category: "ডিজাইন",
    isFree: false
  },
  {
    _id: "60c72b2f9b1d8a23c4d5e6f4",
    title: "ফ্রিল্যান্সিং ক্যারিয়ার গাইড",
    author: "ক্যারিয়ার ল্যাব",
    description: "ডিজিটাল প্রোডাক্ট সেল করে ইন্টারন্যাশনাল মার্কেটপ্লেসে সফল ক্যারিয়ার গড়ার চমৎকার ও পরীক্ষিত স্ট্র্যাটেজি।",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800",
    filePath: "books/freelancing-career-guide.pdf",
    pageCount: 180,
    previewLimit: 4,
    ratingsCount: 8,
    averageRating: 4.9,
    category: "ফ্রিল্যান্সিং",
    isFree: true
  },
  {
    _id: "60c72b2f9b1d8a23c4d5e6f5",
    title: "রেসপন্সিভ ওয়েব ডেভেলপমেন্ট",
    author: "কোর স্ট্যাক",
    description: "আধুনিক সিএসএস লেআউট, ফ্লেক্সিবল গ্রিড এবং মোবাইল-ফার্স্ট ডিজাইন নিয়ে তৈরি সম্পূর্ণ রিসোর্স হ্যান্ডবুক।",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800",
    filePath: "books/responsive-web-development.pdf",
    pageCount: 290,
    previewLimit: 4,
    ratingsCount: 12,
    averageRating: 4.9,
    category: "ওয়েব ডেভেলপমেন্ট",
    isFree: true
  },
  {
    _id: "60c72b2f9b1d8a23c4d5e6f6",
    title: "টুনটুনির বই",
    author: "উপেন্দ্রকিশোর রায়চৌধুরী",
    description: "ছোট বাচ্চাদের জন্য পাখির বুদ্ধি ও মজার মজার পশুপাখির গল্পের সেরা ক্লাসিক সংকলন।",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    filePath: "books/tuntunir-boi.pdf",
    pageCount: 150,
    previewLimit: 4,
    ratingsCount: 15,
    averageRating: 4.9,
    category: "ক্লাসিক",
    isFree: true
  },
  {
    _id: "60c72b2f9b1d8a23c4d5e6f7",
    title: "আবোল তাবোল",
    author: "সুকুমার রায়",
    description: "শিশুদের হাসির খোরাক জোগাতে ছড়া ও অদ্ভুত সব কাল্পনিক চরিত্রের এক জাদুকরী বই।",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
    filePath: "books/abol-tabol.pdf",
    pageCount: 95,
    previewLimit: 4,
    ratingsCount: 20,
    averageRating: 4.9,
    category: "ক্লাসিক",
    isFree: true
  },
  {
    _id: "60c72b2f9b1d8a23c4d5e6f8",
    title: "ঠাকুরমার ঝুলি",
    author: "দক্ষিণারঞ্জন মিত্র মজুমদার",
    description: "রূপকথা, রাজপুত্র, আর রাক্ষস-খোক্কসের চিরচেনা সব বাঙালি রূপকথার গল্প।",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
    filePath: "books/thakurmar-jhuli.pdf",
    pageCount: 220,
    previewLimit: 4,
    ratingsCount: 25,
    averageRating: 4.9,
    category: "ক্লাসিক",
    isFree: true
  },
  {
    _id: "60c72b2f9b1d8a23c4d5e6f9",
    title: "হযবরল",
    author: "সুকুমার রায়",
    description: "শিশুদের কল্পনার জগতকে বাড়িয়ে তুলতে এক অসাধারণ হাসির ও পাগলাটে অ্যাডভেঞ্চারের গল্প।",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800",
    filePath: "books/haw-jaw-baw-raw-law.pdf",
    pageCount: 80,
    previewLimit: 4,
    ratingsCount: 18,
    averageRating: 4.8,
    category: "ক্লাসিক",
    isFree: true
  }
];

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Clear existing books to avoid duplication of filePath and _id
    await Book.deleteMany({});
    
    // Insert new books
    const seeded = await Book.insertMany(BOOKS_TO_SEED);
    
    return NextResponse.json({ 
      success: true, 
      message: `${seeded.length} books successfully seeded.`,
      books: seeded
    }, { status: 200 });

  } catch (error: any) {
    console.error('Seed books error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
