import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import GlobalWidgets from "@/components/layout/GlobalWidgets";
import StoreInitializer from "@/components/StoreInitializer";

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
    display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: '--font-space',
    display: 'swap',
});

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
        <html lang="pt-BR" suppressHydrationWarning={true} className="light">
            <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-[var(--bg)] text-[var(--text-main)] overflow-hidden`}>
                <StoreInitializer />

                <div className="flex min-h-screen">
                    {/* Fixed Sidebar */}
                    <Sidebar />

                    {/* Main Content Area */}
                    <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300 relative">
                        <Topbar />

                        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] scroll-smooth">
                            {children}
                            <GlobalWidgets />
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
}
