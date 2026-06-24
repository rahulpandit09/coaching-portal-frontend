import { BrowserRouter } from "react-router-dom"
import AppRouter from "@/routes/AppRouter"
import Navbar from "@/navigation/Navbar"
import { AppConfig, UserNavigation } from "@/utils/AppConfig"
import MergedSidebar from "@/navigation/MergedSidebar"
import { IUser } from "@/utils/types"
import { useState } from "react"

interface IAuthenticatedProps {
  user: IUser
  username: string | null
  meta: React.ReactNode
  children?: React.ReactNode   
}

const NAVBAR_HEIGHT = 64

const Authenticated: React.FC<IAuthenticatedProps> = ({
  user,
  username,
  meta,
  children, 
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const handleClickMenu = () => setIsOpen(!isOpen)
  const handleCloseSidebar = () => setIsOpen(false)

  return (
    <BrowserRouter>
      {meta}
      <div className="flex flex-col min-h-screen w-full text-base-content bg-base-200 dark:bg-slate-900 transition-colors duration-200">
        {/* Navbar */}
        <div
          className="fixed top-0 left-0 right-0 z-50 border-b border-base-300 dark:border-slate-800"
          style={{ height: NAVBAR_HEIGHT }}
        >
          <Navbar
            user={user}
            username={username} 
            siteName={AppConfig.siteName}
            userNavigation={UserNavigation}
            handleMenuStatus={handleClickMenu}
            isOpenMenu={isOpen}
          />
        </div>

        {/* Main layout */}
        <div className="flex w-full" style={{ paddingTop: NAVBAR_HEIGHT }}>
          {/* Sidebar */}
          <div
            className={`bg-base-100 dark:bg-slate-950 z-40 fixed h-[calc(100vh-${NAVBAR_HEIGHT}px)] border-r border-base-300 dark:border-slate-850 transition-all duration-300 ${ 
              isOpen ? "left-0 sm:left-0" : "-left-full sm:left-0" } `}
          >
            <MergedSidebar
              user={user}
              isOpenMenu={isOpen}
              setIsOpenMenu={setIsOpen}
              onSubMenuClick={handleCloseSidebar}
            />
          </div>

          {/* Backdrop on Mobile */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-30 sm:hidden"
              style={{ top: NAVBAR_HEIGHT }}
              onClick={handleCloseSidebar}
            />
          )}

          {/* Routes / Content */}
          <main
            className={`flex-1 min-h-screen overflow-x-auto scrollbar-hide transition-all duration-300 ${
              isOpen ? "sm:ml-[260px] ml-0" : "sm:ml-12 ml-0"
            } p-6`}
          >
            <AppRouter isOpenMenu={isOpen} />
            {children}
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default Authenticated
