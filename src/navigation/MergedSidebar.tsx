import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ChevronDown, ChevronRight } from "lucide-react"

import { extractMenusFromUser, IMenu } from "@/utils/menuUtils"
import { getIconComponent } from "@/utils/iconUtils"
import SubMenu from "@/navigation/SubMenu"

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

  const menuData: IMenu[] = useMemo(
    () => extractMenusFromUser(user),
    [user?.rolePermissions]
  )

  // Track expanded menu IDs dynamically
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set())

  // Automatically expand parent menu if current location matches any of its submenus
  useEffect(() => {
    if (!menuData || menuData.length === 0) return

    const newlyExpanded = new Set(expandedMenus)
    let updated = false

    menuData.forEach((menu) => {
      if (menu.subMenus && menu.subMenus.length > 0) {
        const hasActiveSubMenu = menu.subMenus.some(
          (sub) =>
            location.pathname === sub.subMenuUrl ||
            (sub.subMenuUrl !== "/" && location.pathname.startsWith(sub.subMenuUrl))
        )
        if (hasActiveSubMenu && !newlyExpanded.has(menu.menuId)) {
          newlyExpanded.add(menu.menuId)
          updated = true
        }
      }
    })

    if (updated) {
      setExpandedMenus(newlyExpanded)
    }
  }, [location.pathname, menuData])

  const toggleMenu = (menuId: number) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev)
      if (next.has(menuId)) {
        next.delete(menuId)
      } else {
        next.add(menuId)
      }
      return next
    })
  }

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        isOpenMenu ? "w-[260px]" : "w-12"
      }`}
    >
      <nav className="p-1 space-y-1 overflow-y-auto h-full">
        {menuData.length === 0 ? (
          isOpenMenu && (
            <div className="p-4 text-center text-xs text-gray-400">
              No menu items found
            </div>
          )
        ) : (
          menuData.map((menu: IMenu) => {
            const subMenus = menu.subMenus || []
            const MenuIcon = getIconComponent(menu.menuIcon)
            const isExpanded = expandedMenus.has(menu.menuId)

            const isMainMenuActive =
              !subMenus.length &&
              (location.pathname === menu.menuUrl ||
                (menu.menuUrl !== "/" && location.pathname.startsWith(menu.menuUrl)))

            return (
              <div key={menu.menuId} className="space-y-1">
                {/* Main Menu Button */}
                <button
                  onClick={() => {
                    if (!isOpenMenu) {
                      setIsOpenMenu(true)
                      if (subMenus.length) {
                        setExpandedMenus((prev) => new Set(prev).add(menu.menuId))
                      }
                      return
                    }

                    if (subMenus.length) {
                      toggleMenu(menu.menuId)
                    } else if (menu.menuUrl) {
                      navigate(menu.menuUrl)
                    }
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors ${
                    isMainMenuActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  <div className="text-md font-semibold flex items-center gap-2 whitespace-nowrap overflow-hidden">
                    <MenuIcon className="w-6 h-6 flex-shrink-0" />
                    {isOpenMenu && <span className="truncate">{menu.menuName}</span>}
                  </div>

                  {isOpenMenu && subMenus.length > 0 && (
                    isExpanded ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    )
                  )}
                </button>

                {/* Sub Menu Component */}
                {isOpenMenu && isExpanded && (
                  <SubMenu
                    subMenus={subMenus}
                    isOpenMenu={isOpenMenu}
                    onSubMenuClick={onSubMenuClick}
                  />
                )}
              </div>
            )
          })
        )}
      </nav>
    </aside>
  )
}

export default MergedSidebar
