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

  rolePermissions.forEach(role => {
    roleIds.push(role.roleId)
    
    const roleSubMenus = new Set<number>()

    role.menus?.forEach((menu: any) => {
      menus.add(menu.menuUrl)

      menu.subMenus?.forEach((subMenu: any) => {
        subMenus.add(subMenu.subMenuUrl)
        roleSubMenus.add(subMenu.subMenuId)
      })
    })

    roleSubMenuMap.set(role.roleId, roleSubMenus)
  })

  return { roleIds, menus, subMenus, roleSubMenuMap }
}
