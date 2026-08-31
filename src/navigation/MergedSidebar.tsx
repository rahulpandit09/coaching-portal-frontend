import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ChevronDown, ChevronRight } from "lucide-react"

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

const DEFAULT_FALLBACK_MENUS: IMenu[] = [
  {
    menuId: 1,
    menuName: "Dashboard",
    menuUrl: "/dashboard",
    menuIcon: "LayoutDashboard",
    subMenus: [],
  },
  {
    menuId: 2,
    menuName: "My Profile",
    menuUrl: "/profile",
    menuIcon: "User",
    subMenus: [],
  },
  {
    menuId: 3,
    menuName: "Roles & Permissions",
    menuUrl: "/roles",
    menuIcon: "ShieldCheck",
    subMenus: [
      { subMenuId: 31, subMenuName: "Roles", subMenuUrl: "/roles" },
      { subMenuId: 32, subMenuName: "Permissions", subMenuUrl: "/permissions" },
    ],
  },
  {
    menuId: 4,
    menuName: "Settings",
    menuUrl: "/settings",
    menuIcon: "Settings",
    subMenus: [],
  },
]

const MergedSidebar: React.FC<Props> = ({
  user,
  isOpenMenu,
  onSubMenuClick,
  setIsOpenMenu,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [fetchedMenus, setFetchedMenus] = useState<IMenu[]>([])

  const userMenus: IMenu[] = useMemo(
    () => extractMenusFromUser(user),
    [user]
  )

  // Fetch menus from GET /menu/ if user rolePermissions are missing
  useEffect(() => {
    if (userMenus.length === 0) {
      menuApi
        .getAllMenus()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const mappedMenus: IMenu[] = data.map((item, idx) => ({
              menuId: item.menuId ?? idx + 1,
              menuName: item.menuName || "",
              menuUrl: item.menuUrl || "",
              menuIcon: item.menuIcon,
              subMenus: (item.subMenus || []).map((sub, sIdx) => ({
                subMenuId: sub.subMenuId ?? sIdx + 1,
                subMenuName: sub.subMenuName || "",
                subMenuUrl: sub.subMenuUrl || "",
                subMenuIcon: sub.subMenuIcon,
              })),
            }))
            setFetchedMenus(mappedMenus)
          }
        })
        .catch(() => {
          // Silent catch if backend /menu/ is not active yet
        })
    }
  }, [userMenus])

  const menuData = userMenus.length > 0
    ? userMenus
    : fetchedMenus.length > 0
    ? fetchedMenus
    : DEFAULT_FALLBACK_MENUS

  // Track expanded menu IDs dynamically instead of hardcoded [1, 2, 3]
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
      className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ${isOpenMenu ? "w-[260px]" : "w-14"
        }`}
    >
      <nav className="p-2 space-y-1.5 overflow-y-auto h-full">
        {menuData.map((menu: IMenu) => {
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
                  } else {
                    navigate(menu.menuUrl)
                  }
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all font-semibold text-sm ${isMainMenuActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
              >
                <div className="flex items-center gap-3 whitespace-nowrap overflow-hidden">
                  <MenuIcon
                    className={`w-5 h-5 flex-shrink-0 ${isMainMenuActive ? "text-white" : "text-indigo-600"
                      }`}
                  />
                  {isOpenMenu && <span className="truncate">{menu.menuName}</span>}
                </div>

                {isOpenMenu && subMenus.length > 0 && (
                  isExpanded ? (
                    <ChevronDown size={14} className={isMainMenuActive ? "text-white" : "text-gray-400"} />
                  ) : (
                    <ChevronRight size={14} className={isMainMenuActive ? "text-white" : "text-gray-400"} />
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
        })}
      </nav>
    </aside>
  )
}

export default MergedSidebar
