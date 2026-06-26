import React, { useMemo, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ChevronDown, ChevronRight } from "lucide-react"

import { extractMenusFromUser, IMenu, ISubMenu } from "@/utils/menuUtils"
import { getIconComponent } from "@/utils/iconUtils"
import { useAuth } from "@/contexts/auth"

interface Props {
  user: any
  isOpenMenu: boolean
  onSubMenuClick?: () => void
  setIsOpenMenu: (open: boolean) => void
}

const MergedSidebar: React.FC<Props> = ({
  user,
  isOpenMenu,
  onSubMenuClick,
  setIsOpenMenu,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logSubMenuClick } = useAuth()

  const menuData: IMenu[] = useMemo(
    () => extractMenusFromUser(user),
    [user]
  )

  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(
    new Set([1, 2, 3])
  )

  const toggleMenu = (menuId: number) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev)
      next.has(menuId) ? next.delete(menuId) : next.add(menuId)
      return next
    })
  }

  const handleSubMenuClick = (sub: ISubMenu) => {
    logSubMenuClick(sub.subMenuUrl)
    navigate(sub.subMenuUrl)
    onSubMenuClick?.()
  }

  if (!menuData.length) return null

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        isOpenMenu ? "w-[260px]" : "w-14"
      }`}
    >
      <nav className="p-2 space-y-1.5 overflow-y-auto h-full">

        {menuData.map((menu: IMenu) => {
          const subMenus = menu.subMenus || []
          const MenuIcon = getIconComponent(menu.menuIcon)

          return (
            <div key={menu.menuId} className="space-y-1">

              {/* Main Menu */}
              <button
                onClick={() => {
                  if (!isOpenMenu) {
                    setIsOpenMenu(true)
                    return
                  }

                  if (subMenus.length) {
                    toggleMenu(menu.menuId)
                  } else {
                    navigate(menu.menuUrl)
                  }
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 transition-all text-gray-700 font-semibold"
              >
                <div className="text-sm flex items-center gap-3 whitespace-nowrap overflow-hidden">
                  <MenuIcon className="w-5 h-5 flex-shrink-0 text-indigo-600" />

                  {isOpenMenu && (
                    <span className="truncate">
                      {menu.menuName}
                    </span>
                  )}
                </div>

                {isOpenMenu && subMenus.length > 0 && (
                  expandedMenus.has(menu.menuId) ? (
                    <ChevronDown size={14} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={14} className="text-gray-400" />
                  )
                )}
              </button>

              {/* Sub Menu */}
              {isOpenMenu && expandedMenus.has(menu.menuId) && (
                <div className="pl-4 space-y-1">

                  {menu.subMenus?.map((sub: ISubMenu) => {
                    const SubIcon = getIconComponent(sub.subMenuIcon)

                    const isActive =
                      location.pathname + location.search === sub.subMenuUrl ||
                      (sub.subMenuUrl !== "/" &&
                        location.pathname.startsWith(sub.subMenuUrl))

                    return (
                      <button
                        key={sub.subMenuId}
                        onClick={() => handleSubMenuClick(sub)}
                        className={`w-full text-xs flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                          isActive
                            ? "bg-indigo-600 text-white font-bold shadow-md"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <SubIcon className="w-4 h-4 flex-shrink-0" />

                        <span className="truncate">
                          {sub.subMenuName}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

export default MergedSidebar