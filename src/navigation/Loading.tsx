import React from "react"
import { classNames } from "@/utils/dom"

interface ILoadingProps {
  color?: string
}

const Loading: React.FC<ILoadingProps> = ({ color }) => {
  return (
    <div className="flex w-full items-center justify-center p-12">
      <span
        className={classNames(
          "loading loading-spinner loading-lg",
          color ?? "text-primary",
        )}
      ></span>
    </div>
  )
}

export default Loading
