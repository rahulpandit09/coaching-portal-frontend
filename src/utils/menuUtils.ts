import { IUser, IMenu, ISubMenu } from "@/utils/types"

export type { IMenu, ISubMenu }

export const extractMenusFromUser = (user: IUser | null): IMenu[] => {
  if (!user || !user.rolePermissions) return []

  const permsList = Array.isArray(user.rolePermissions)
    ? user.rolePermissions
    : [user.rolePermissions]

  const menuMap = new Map<number, IMenu>()

  permsList.forEach((rolePermission: any) => {
    const menuList = Array.isArray(rolePermission.menus) ? rolePermission.menus : []

    menuList.forEach((menu: any, idx: number) => {
      const menuId = Number(menu.menuId ?? idx + 1)
      if (!menuId) return

      const rawSubMenus = Array.isArray(menu.submenu) ? menu.submenu : []
      const normalizedSubMenus: ISubMenu[] = rawSubMenus.map((sub: any, sIdx: number) => ({
        subMenuId: Number(sub.subMenuId ?? sIdx + 1),
        subMenuName: sub.title || sub.subMenuName || "",
        subMenuUrl: sub.path || sub.subMenuUrl || "",
        subMenuIcon: sub.icon || sub.subMenuIcon,
      }))

      if (!menuMap.has(menuId)) {
        menuMap.set(menuId, {
          menuId,
          menuName: menu.title || menu.menuName || "",
          menuUrl: menu.path || menu.menuUrl || "",
          menuIcon: menu.icon || menu.menuIcon,
          subMenus: normalizedSubMenus,
        })
      } else {
        const existing = menuMap.get(menuId)!
        const subIds = new Set(existing.subMenus?.map((s) => s.subMenuId))

        normalizedSubMenus.forEach((sub) => {
          if (!subIds.has(sub.subMenuId)) {
            existing.subMenus?.push(sub)
          }
        })
      }
    })
  })

  return Array.from(menuMap.values())
}




