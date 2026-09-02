import { IUser, IMenu, ISubMenu } from "@/utils/types"

export type { IMenu, ISubMenu }

export const extractMenusFromUser = (user: IUser | null): IMenu[] => {
  if (!user) return []

  const menuMap = new Map<number, IMenu>()

  const processMenuList = (menus: any[]) => {
    menus.forEach((menu: any, idx: number) => {
      const menuId = Number(menu.menuId ?? menu.menu_id ?? menu.id ?? idx + 1)
      if (!menuId) return

      const rawSubMenus = menu.subMenus || menu.sub_menus || menu.submenu || []
      const normalizedSubMenus: ISubMenu[] = rawSubMenus.map((sub: any, sIdx: number) => ({
        subMenuId: Number(sub.subMenuId ?? sub.sub_menu_id ?? sub.id ?? sIdx + 1),
        subMenuName: sub.subMenuName || sub.sub_menu_name || sub.title || sub.name || "",
        subMenuUrl: sub.subMenuUrl || sub.sub_menu_url || sub.path || sub.url || "",
        subMenuIcon: sub.subMenuIcon || sub.sub_menu_icon || sub.icon,
      }))

      if (!menuMap.has(menuId)) {
        menuMap.set(menuId, {
          menuId,
          menuName: menu.menuName || menu.menu_name || menu.title || menu.name || "",
          menuUrl: menu.menuUrl || menu.menu_url || menu.path || menu.url || "",
          menuIcon: menu.menuIcon || menu.menu_icon || menu.icon,
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
      const menus = role.menus || role.role_menus || []
      processMenuList(menus)
    })
  }

  if (Array.isArray((user as any).menus)) {
    processMenuList((user as any).menus)
  }

  return Array.from(menuMap.values())
}



