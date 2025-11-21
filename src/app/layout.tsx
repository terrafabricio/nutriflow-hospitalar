import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import StoreInitializer from "@/components/StoreInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "NutriFlow - Gestão de Dietas Hospitalares",
    description: "Sistema de Gestão de Nutrição e Dietética Hospitalar",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning={true}>
            <body className={`${inter.className} bg-slate-50 text-slate-900`}>
                <StoreInitializer />
                <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
