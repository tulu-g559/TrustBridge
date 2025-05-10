import { Link } from "react-router-dom";
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: "Company",
      links: [
        { name: "About", to: "/about" },
        { name: "Team", to: "/team" },
        { name: "Careers", to: "/careers" },
        { name: "Press", to: "/press" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Blog", to: "/blog" },
        { name: "FAQ", to: "/faq" },
        { name: "Support", to: "/support" },
        { name: "Documentation", to: "/docs" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy", to: "/privacy" },
        { name: "Terms", to: "/terms" },
        { name: "Security", to: "/security" },
        { name: "Compliance", to: "/compliance" },
      ],
    },
  ]

  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, to: "https://twitter.com" },
    { icon: <Facebook className="w-5 h-5" />, to: "https://facebook.com" },
    { icon: <Instagram className="w-5 h-5" />, to: "https://instagram.com" },
    { icon: <Linkedin className="w-5 h-5" />, to: "https://linkedin.com" },
  ]

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-2">
                <span className="font-bold text-white">TB</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                TrustBridge
              </span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Reimagining financial inclusion through AI and blockchain technology. Helping underserved individuals
              access microloans without traditional credit scores.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  to={link.to}
                  className="bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white p-2 rounded-full transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((column, index) => (
            <div key={index}>
              <h3 className="text-white font-bold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link to={link.to} className="text-gray-400 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">&copy; {currentYear} TrustBridge. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
