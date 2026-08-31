import React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ISubMenu } from "@/utils/types"
import { getIconComponent } from "@/utils/iconUtils"
import { useAuth } from "@/contexts/auth"

interface SubMenuProps {
    subMenus: ISubMenu[]
    isOpenMenu: boolean
    onSubMenuClick?: () => void
}

const SubMenu: React.FC<SubMenuProps> = ({
    subMenus,
    isOpenMenu,
    onSubMenuClick,
}) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { logSubMenuClick } = useAuth()

    if (!isOpenMenu || !subMenus || subMenus.length === 0) return null

    const handleSubMenuClick = (sub: ISubMenu) => {
        if (logSubMenuClick) {
            logSubMenuClick(sub.subMenuUrl)
        }
        navigate(sub.subMenuUrl)
        onSubMenuClick?.()
    }

    return (
        <div className="pl-4 space-y-1 mt-1 transition-all duration-200">
            {subMenus.map((sub: ISubMenu) => {
                const SubIcon = getIconComponent(sub.subMenuIcon)

                const isActive =
                    location.pathname === sub.subMenuUrl ||
                    location.pathname + location.search === sub.subMenuUrl ||
                    (sub.subMenuUrl !== "/" &&
                        location.pathname.startsWith(sub.subMenuUrl))

                return (
                    <button
                        key={sub.subMenuId || sub.subMenuUrl}
                        onClick={() => handleSubMenuClick(sub)}
                        className={`w-full text-xs flex items-center gap-2.5 p-2 rounded-xl transition-all ${isActive
                                ? "bg-indigo-600 text-white font-bold shadow-md"
                                : "text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                            }`}
                    >
                        <SubIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{sub.subMenuName}</span>
                    </button>
                )
            })}
        </div>
    )
}

export default SubMenu
