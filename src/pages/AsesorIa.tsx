import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AiAdvisorChat from "@/components/AiAdvisorChat";

const AsesorIa = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <AiAdvisorChat />
    </main>
    <Footer />
  </div>
);

export default AsesorIa;
