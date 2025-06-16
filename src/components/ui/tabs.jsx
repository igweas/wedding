import React, { useState, createContext, useContext } from "react"

const TabsContext = createContext()

const Tabs = React.forwardRef(({ className, defaultValue, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = useState(defaultValue)
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`inline-flex items-center justify-start border-b border-gray-200 ${className || ''}`}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  const isActive = activeTab === value
  
  return (
    <button
      ref={ref}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        isActive 
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700'
      } ${className || ''}`}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { activeTab } = useContext(TabsContext)
  
  if (activeTab !== value) return null
  
  return (
    <div
      ref={ref}
      className={`mt-6 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }