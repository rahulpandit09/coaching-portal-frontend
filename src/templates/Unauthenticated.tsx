import { ReactNode } from "react"

interface IUnauthenticatedProps {
  children: ReactNode
  meta: React.ReactNode
}

const Unauthenticated = (props: IUnauthenticatedProps) => {
  return (
    <div className="h-full min-h-screen w-full text-base-content bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {props.meta}
      <div className="min-h-full mx-auto max-w-screen-xl flex items-center justify-center p-4">
        {props.children}
      </div>
    </div>
  )
}

export default Unauthenticated
