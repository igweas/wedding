import React, { useState, createContext, useContext } from "react"

const DialogContext = createContext()

const Dialog = ({ children, open, onOpenChange }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => onOpenChange(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-auto border border-gray-200">
            {children}
          </div>
        </div>
      )}
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ children, asChild }) => {
  const { onOpenChange } = useContext(DialogContext)
  
  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange(true)
    })
  }
  
  return (
    <button onClick={() => onOpenChange(true)}>
      {children}
    </button>
  )
}

const DialogContent = ({ children, className }) => {
  const { open } = useContext(DialogContext)
  
  if (!open) return null
  
  return (
    <div className={`p-6 ${className || ''}`}>
      {children}
    </div>
  )
}

const DialogHeader = ({ children, className }) => (
  <div className={`mb-4 ${className || ''}`}>
    {children}
  </div>
)

const DialogTitle = ({ children, className }) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className || ''}`}>
    {children}
  </h2>
)

const DialogDescription = ({ children, className }) => (
  <p className={`text-sm text-gray-600 ${className || ''}`}>
    {children}
  </p>
)

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription }