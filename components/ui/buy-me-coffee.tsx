import React, { useEffect } from "react"
import { Coffee } from "lucide-react"

interface BuyMeCoffeeProps {
  username: string
  message?: string
  description?: string
  color?: string
  position?: "left" | "right"
  xMargin?: number
  yMargin?: number
  className?: string
}

export function BuyMeCoffee({
  username,
  message = "Thank you for playing! If you enjoyed this game, consider buying me a coffee! ☕",
  description = "Support the developer!",
  color = "#FFDD00",
  position = "right",
  xMargin = 18,
  yMargin = 18,
  className = ""
}: BuyMeCoffeeProps) {
  useEffect(() => {
    const script = document.createElement("script")
    const div = document.getElementById("supportByBMC")
    
    if (!div) return

    script.setAttribute("data-name", "BMC-Widget")
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
    script.setAttribute("data-id", username)
    script.setAttribute("data-description", description)
    script.setAttribute("data-message", message)
    script.setAttribute("data-color", color)
    script.setAttribute("data-position", position)
    script.setAttribute("data-x_margin", xMargin.toString())
    script.setAttribute("data-y_margin", yMargin.toString())
    script.async = true

    script.onload = function () {
      const evt = document.createEvent("Event")
      evt.initEvent("DOMContentLoaded", false, false)
      window.dispatchEvent(evt)
    }

    document.head.appendChild(script)
    div.appendChild(script)

    // Cleanup function
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
      if (div.contains(script)) {
        div.removeChild(script)
      }
    }
  }, [username, message, description, color, position, xMargin, yMargin])

  return <div id="supportByBMC" className={className} />
}

// Alternative inline button component for more control
interface BuyMeCoffeeButtonProps {
  username: string
  text?: string
  className?: string
}

export function BuyMeCoffeeButton({
  username,
  text = "Buy me a coffee",
  className = ""
}: BuyMeCoffeeButtonProps) {
  const handleClick = () => {
    window.open(`https://www.buymeacoffee.com/${username}`, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-yellow-400 hover:bg-yellow-500 
        text-black font-medium rounded-lg 
        transition-colors duration-200
        shadow-lg hover:shadow-xl
        ${className}
      `}
    >
      <Coffee className="h-4 w-4" />
      {text}
    </button>
  )
} 