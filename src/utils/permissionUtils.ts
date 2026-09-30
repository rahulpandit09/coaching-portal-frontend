export interface PermissionMap {
  roleIds: number[]
  menus: Set<string>
  subMenus: Set<string>
  roleSubMenuMap: Map<number, Set<number>>
}

export function extractPermissions(
  rolePermissions: any
): PermissionMap {
  const roleIds: number[] = []
  const menus = new Set<string>()
  const subMenus = new Set<string>()
  const roleSubMenuMap = new Map<number, Set<number>>()

  const permsList = Array.isArray(rolePermissions)
    ? rolePermissions
    : rolePermissions && typeof rolePermissions === "object"
    ? [rolePermissions]
    : []

  if (permsList.length === 0) {
    return {
      roleIds,
      menus,
      subMenus,
      roleSubMenuMap,
    }
  }

  permsList.forEach((rolePermission) => {
    const roleId = Number(rolePermission.roleId)

    if (!roleId) return

    roleIds.push(roleId)

    const roleSubMenus = new Set<number>()

    const menuList = Array.isArray(rolePermission.menus)
      ? rolePermission.menus
      : []

    menuList.forEach((menu: any) => {
      if (menu.path) {
        menus.add(menu.path)
      }

      const subMenuList = Array.isArray(menu.submenu)
        ? menu.submenu
        : []

      subMenuList.forEach((subMenu: any) => {
        if (subMenu.path) {
          subMenus.add(subMenu.path)
        }

        const subMenuId = Number(subMenu.subMenuId)

        if (subMenuId) {
          roleSubMenus.add(subMenuId)
        }
      })
    })

    roleSubMenuMap.set(roleId, roleSubMenus)
  })

  return {
    roleIds,
    menus,
    subMenus,
    roleSubMenuMap,
  }
}


