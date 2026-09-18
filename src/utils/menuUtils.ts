import { IUser, IMenu, ISubMenu } from "@/utils/types"

export type { IMenu, ISubMenu }

export const extractMenusFromUser = (user: IUser | null): IMenu[] => {
  if (!user) return []

  const menuMap = new Map<number, IMenu>()

  const processMenuList = (menus: any[]) => {
    menus.forEach((menu: any, idx: number) => {
      const menuId = Number(menu.menuId ?? menu.menu_id ?? menu.id ?? idx + 1)
      if (!menuId) return

      const rawSubMenus = menu.submenu || menu.subMenus || menu.sub_menus || []
      const normalizedSubMenus: ISubMenu[] = rawSubMenus.map((sub: any, sIdx: number) => ({
        subMenuId: Number(sub.subMenuId ?? sub.sub_menu_id ?? sub.id ?? sIdx + 1),
        subMenuName: sub.title || sub.subMenuName || sub.sub_menu_name || sub.name || "",
        subMenuUrl: sub.path || sub.subMenuUrl || sub.sub_menu_url || sub.url || "",
        subMenuIcon: sub.icon || sub.subMenuIcon || sub.sub_menu_icon,
      }))

      if (!menuMap.has(menuId)) {
        menuMap.set(menuId, {
          menuId,
          menuName: menu.title || menu.menuName || menu.menu_name || menu.name || "",
          menuUrl: menu.path || menu.menuUrl || menu.menu_url || menu.url || "",
          menuIcon: menu.icon || menu.menuIcon || menu.menu_icon,
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
  }

  if (user.rolePermissions?.length) {
    user.rolePermissions.forEach((role: any) => {
      const menus = role.menus || role.role_menus || (role.title || role.menuId ? [role] : [])
      processMenuList(menus)
    })
  }

  if (Array.isArray((user as any).menus)) {
    processMenuList((user as any).menus)
  }

  return Array.from(menuMap.values())
}



