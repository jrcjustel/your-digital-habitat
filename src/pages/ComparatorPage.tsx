import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AssetComparator from "@/components/AssetComparator";
import SEOHead from "@/components/SEOHead";

const ComparatorPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Comparador de Activos | IKESA" description="Compara activos de inversión lado a lado" canonical="/comparador" />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <AssetComparator />
      </div>
      <Footer />
    </div>
  );
};

export default ComparatorPage;
