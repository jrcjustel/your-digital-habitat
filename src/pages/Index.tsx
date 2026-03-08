import Navbar from "@/components/Navbar";
import HeroSearch from "@/components/HeroSearch";
import HowItWorks from "@/components/HowItWorks";
import QuickLinks from "@/components/QuickLinks";
import CategoryCards from "@/components/CategoryCards";
import InvestorMarketplace from "@/components/InvestorMarketplace";
import WhyInvest from "@/components/WhyInvest";
import ValuationCta from "@/components/ValuationCta";
import Newsletter from "@/components/Newsletter";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSearch />
      <HowItWorks />
      <QuickLinks />
      <CategoryCards />
      <InvestorMarketplace />
      <ValuationCta />
      <WhyInvest />
      <Newsletter />
      <BlogSection />
      <Footer />
    </div>
  );
};

export default Index;
