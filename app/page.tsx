import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Work from '@/components/Work';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Effects from '@/components/Effects';
import BlobbyJourney from '@/components/BlobbyJourney';

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Work />
        <Contact />
      </main>
      <Footer />
      <Effects />
      <BlobbyJourney />
    </>
  );
}
