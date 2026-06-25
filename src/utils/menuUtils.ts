import { IUser, IMenu, ISubMenu } from "@/utils/types"

export type { IMenu, ISubMenu }

export const extractMenusFromUser = (user: IUser | null): IMenu[] => {
  if (!user?.rolePermissions?.length) return []

  const menuMap = new Map<number, IMenu>()

  user.rolePermissions.forEach(role => {
    role.menus?.forEach(menu => {
      if (!menuMap.has(menu.menuId)) {
        menuMap.set(menu.menuId, {
          menuId: menu.menuId,
          menuName: menu.menuName,
          menuUrl: menu.menuUrl,
          menuIcon: menu.menuIcon,
          subMenus: [...(menu.subMenus || [])],
        })
      } else {
        const existing = menuMap.get(menu.menuId)!
        const subIds = new Set(existing.subMenus?.map(s => s.subMenuId))

        menu.subMenus?.forEach(sub => {
          if (!subIds.has(sub.subMenuId)) {
            existing.subMenus?.push(sub)
          }
        })
      }
    })
  })

  return Array.from(menuMap.values())
}
