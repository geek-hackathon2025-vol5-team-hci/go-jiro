// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Geist} from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import { Header } from "./components/Header"; // Headerをインポート

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "二郎コールシミュレーター", // タイトルを変更
  description: "ラーメン二郎のコールを練習・シミュレーションできるサイトです。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full bg-gray-100">
      <body className={`${geistSans.variable} antialiased h-full flex flex-col`}>
        <Header />
        {/* main要素が残りの高さをすべて使うように設定 */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}