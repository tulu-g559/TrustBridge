"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "../components/ui/button"

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Kenya",
      quote:
        "TrustBridge helped me secure funding for my small business when traditional banks wouldn't even look at my application. Now my shop is thriving!",
      rating: 5,
      loanAmount: "$1,200",
    },
    {
      name: "Miguel Hernandez",
      location: "Mexico",
      quote:
        "I needed a small loan to repair my fishing boat. TrustBridge saw my potential when no one else would. I've since repaid and taken a second loan to expand.",
      rating: 5,
      loanAmount: "$800",
    },
    {
      name: "Priya Patel",
      location: "India",
      quote:
        "As a woman entrepreneur in my village, getting loans was impossible. TrustBridge gave me a chance based on who I am, not my lack of credit history.",
      rating: 5,
      loanAmount: "$650",
    },
    {
      name: "Emmanuel Okafor",
      location: "Nigeria",
      quote:
        "The Trust Score system is revolutionary! I've been able to fund my education and start a small tech repair business thanks to TrustBridge.",
      rating: 4,
      loanAmount: "$1,500",
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay, testimonials.length])

  const handlePrev = () => {
    setAutoplay(false)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setAutoplay(false)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-950 to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            People Like You Got Funded
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Real stories from real people who found financial opportunity through TrustBridge.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">{testimonials[currentIndex].name.charAt(0)}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonials[currentIndex].rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                    />
                  ))}
                </div>

                <blockquote className="text-lg md:text-xl italic mb-4 text-gray-200">
                  "{testimonials[currentIndex].quote}"
                </blockquote>

                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{testimonials[currentIndex].name}</p>
                    <p className="text-gray-400">{testimonials[currentIndex].location}</p>
                  </div>
                  <div className="mt-2 md:mt-0 bg-gray-800 rounded-full px-4 py-1">
                    <span className="text-sm">Loan Amount: </span>
                    <span className="font-bold text-green-400">{testimonials[currentIndex].loanAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous testimonial</span>
            </Button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${currentIndex === index ? "bg-purple-500" : "bg-gray-700"}`}
                  onClick={() => {
                    setAutoplay(false)
                    setCurrentIndex(index)
                  }}
                >
                  <span className="sr-only">Testimonial {index + 1}</span>
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next testimonial</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
