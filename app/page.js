
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Hero2 from "@/components/Hero2";
import Hero3 from "@/components/Hero3";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Hero2 />
        <Hero3 />
      </main>
    </>
  );
}
