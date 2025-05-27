"use client"

import { motion } from "framer-motion"
import { Card } from "../components/ui/card" // Assuming this path is correct

interface TestimonialProps {
  testimonial: {
    name: string
    company: string
    text: string
    image: string
  }
  index: number
}

const TestimonialCard = ({ testimonial, index }: TestimonialProps) => {
  return (
      <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="h-full"
      >
        <Card className="h-full bg-gradient-to-br from-gray-900 to-black border-none shadow-xl shadow-cyan-500/10 p-6 hover:shadow-cyan-500/30 transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
              {/* Replaced next/image with standard img tag */}
              <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="object-cover w-full h-full" // Added classes for sizing and cover
                  onError={(e) => {
                    // Fallback for broken image links
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Prevent infinite loop if placeholder also fails
                    target.src = "/placeholder.svg"; // Default placeholder
                  }}
              />
            </div>
            <div>
              <h4 className="font-bold text-white">{testimonial.name}</h4>
              <p className="text-sm text-gray-400">{testimonial.company}</p>
            </div>
          </div>
          <p className="text-gray-300 italic">"{testimonial.text}"</p>
        </Card>
      </motion.div>
  )
}

export default TestimonialCard
