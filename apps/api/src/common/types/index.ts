export type Role = 'admin' | 'manager' | 'valet' | 'Customer'

export type GetUserType = {
  uid: string
  roles: Role[]
}
