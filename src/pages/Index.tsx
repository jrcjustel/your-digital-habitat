import Navbar from "@/components/Navbar";
import HeroSearch from "@/components/HeroSearch";
import QuickLinks from "@/components/QuickLinks";
import CategoryCards from "@/components/CategoryCards";
import InvestorMarketplace from "@/components/InvestorMarketplace";
import WhyInvest from "@/components/WhyInvest";
import Newsletter from "@/components/Newsletter";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSearch />
      <QuickLinks />
      <CategoryCards />
      <InvestorMarketplace />
      <WhyInvest />
      <Newsletter />
      <BlogSection />
      <Footer />
    </div>
  );
};

export default Index;
