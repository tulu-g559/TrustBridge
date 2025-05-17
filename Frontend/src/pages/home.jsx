import { useEffect, useState } from "react"
import Header from "../components/header"
import HeroSection from "../components/hero-section"
import HowItWorks from "../components/how-it-works"
import WhyTrustBridge from "../components/why-trustbridge"
import Testimonials from "../components/testimonials"
import GetStarted from "../components/get-started"
import Footer from "../components/footer"


export default function Home() {
  const [role, setRole] = useState(null);
  useEffect(() => {
      const userType = localStorage.getItem("userType");
      setRole(userType);
    }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <WhyTrustBridge />
        <Testimonials />
        {role === "borrower" && (<GetStarted />)}
      </main>
      <Footer />
    </div>
  )
}
