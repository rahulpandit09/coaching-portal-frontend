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

    if (!isOpenMenu || !subMenus || subMenus.length === 0) {
        return null
    }

    const handleSubMenuClick = (sub: ISubMenu) => {
        if (logSubMenuClick) {
            logSubMenuClick(sub.subMenuUrl)
        }

        navigate(sub.subMenuUrl)
        onSubMenuClick?.()
    }

    return (
        <div className="space-y-1">
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
                        type="button"
                        onClick={() => handleSubMenuClick(sub)}
                        className={`text-sm ml-6 w-[230px] flex items-center gap-1 p-1 rounded hover:bg-gray-100 transition-colors ${
                            isActive
                                ? "bg-blue-100 text-blue-700 font-medium"
                                : "text-gray-700"
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
    )
}

export default SubMenu