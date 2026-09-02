import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react"

import { extractMenusFromUser, IMenu } from "@/utils/menuUtils"
import { getIconComponent } from "@/utils/iconUtils"
import SubMenu from "@/navigation/SubMenu"
import { menuApi } from "@/api/menu"

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
  const [fetchedMenus, setFetchedMenus] = useState<IMenu[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const userMenus: IMenu[] = useMemo(
    () => extractMenusFromUser(user),
    [user]
  )

  // Fetch menus dynamically from GET /menu/ endpoint if user rolePermissions are missing
  useEffect(() => {
    if (userMenus.length === 0) {
      setLoading(true)
      menuApi
        .getAllMenus()
        .then((res: any) => {
          const rawData = Array.isArray(res) ? res : res?.data || []
          if (Array.isArray(rawData)) {
            const mappedMenus: IMenu[] = rawData.map((item: any, idx: number) => {
              const rawSubMenus = item.subMenus || item.sub_menus || item.submenu || []
              return {
                menuId: Number(item.menuId ?? item.menu_id ?? item.id ?? idx + 1),
                menuName: item.menuName || item.menu_name || item.title || item.name || "",
                menuUrl: item.menuUrl || item.menu_url || item.path || item.url || "",
                menuIcon: item.menuIcon || item.menu_icon || item.icon,
                subMenus: rawSubMenus.map((sub: any, sIdx: number) => ({
                  subMenuId: Number(sub.subMenuId ?? sub.sub_menu_id ?? sub.id ?? sIdx + 1),
                  subMenuName: sub.subMenuName || sub.sub_menu_name || sub.title || sub.name || "",
                  subMenuUrl: sub.subMenuUrl || sub.sub_menu_url || sub.path || sub.url || "",
                  subMenuIcon: sub.subMenuIcon || sub.sub_menu_icon || sub.icon,
                })),
              }
            })
            setFetchedMenus(mappedMenus)
          }
        })
        .catch((err) => {
          console.error("Failed to fetch sidebar menus from API:", err)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [userMenus])

  const menuData: IMenu[] = userMenus.length > 0 ? userMenus : fetchedMenus

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
        {loading && menuData.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            {isOpenMenu && <span className="ml-2 text-xs font-medium">Loading menus...</span>}
          </div>
        ) : menuData.length === 0 ? (
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
