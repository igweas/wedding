import React, { useState, useRef, useEffect } from "react"

const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  )
}

const DropdownMenuTrigger = ({ children, isOpen, setIsOpen }) => {
  return React.cloneElement(children, {
    onClick: () => setIsOpen(!isOpen)
  })
}

const DropdownMenuContent = ({ children, isOpen, className }) => {
  if (!isOpen) return null

  return (
    <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 ${className || ''}`}>
      <div className="py-1">
        {children}
      </div>
    </div>
  )
}

const DropdownMenuItem = ({ children, onClick, className }) => {
  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }