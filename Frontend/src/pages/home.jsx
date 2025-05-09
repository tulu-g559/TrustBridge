import Header from "../components/header"
import HeroSection from "../components/hero-section"
import HowItWorks from "../components/how-it-works"
import WhyTrustBridge from "../components/why-trustbridge"
import Testimonials from "../components/testimonials"
import GetStarted from "../components/get-started"
import Footer from "../components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <WhyTrustBridge />
        <Testimonials />
        <GetStarted />
      </main>
      <Footer />
    </div>
  )
}
