
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata = {
  title: "My Store",
  description: "E-commerce platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
