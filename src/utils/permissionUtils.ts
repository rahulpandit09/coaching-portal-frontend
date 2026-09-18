export interface PermissionMap {
  roleIds: number[]
  menus: Set<string>
  subMenus: Set<string>
  roleSubMenuMap: Map<number, Set<number>>
}

export function extractPermissions(rolePermissions: any[]): PermissionMap {
  const roleIds: number[] = []
  const menus = new Set<string>()
  const subMenus = new Set<string>()
  const roleSubMenuMap = new Map<number, Set<number>>()

  if (!Array.isArray(rolePermissions)) {
    return { roleIds, menus, subMenus, roleSubMenuMap }
  }

  rolePermissions.forEach((role: any) => {
    const roleId = Number(role.roleId ?? role.role_id ?? role.id)
    if (roleId) roleIds.push(roleId)

    const roleSubMenus = new Set<number>()
    const menuList = role.menus || role.role_menus || (role.title || role.menuId || role.menu_id ? [role] : [])

    menuList.forEach((menu: any) => {
      const menuUrl = menu.path || menu.menuUrl || menu.menu_url || menu.url
      if (menuUrl) menus.add(menuUrl)

      const subMenuList = menu.submenu || menu.subMenus || menu.sub_menus || []
      subMenuList.forEach((subMenu: any) => {
        const subMenuUrl = subMenu.path || subMenu.subMenuUrl || subMenu.sub_menu_url || subMenu.url
        const subMenuId = Number(subMenu.subMenuId ?? subMenu.sub_menu_id ?? subMenu.id)

        if (subMenuUrl) subMenus.add(subMenuUrl)
        if (subMenuId) roleSubMenus.add(subMenuId)
      })
    })

    if (roleId) {
      roleSubMenuMap.set(roleId, roleSubMenus)
    }
  })

  return { roleIds, menus, subMenus, roleSubMenuMap }
}

