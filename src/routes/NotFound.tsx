import React from "react"

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center pt-24 md:pt-48">
      <div className="flex items-center gap-4">
        <div className="font-bold text-4xl text-indigo-600 border-r border-gray-300 dark:border-gray-700 pr-6">404</div>
        <div className="text-xl font-medium text-gray-800 dark:text-gray-200">Page Not Found</div>
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">The page you are looking for does not exist or you do not have permission to view it.</p>
    </div>
  )
}

export default NotFound
