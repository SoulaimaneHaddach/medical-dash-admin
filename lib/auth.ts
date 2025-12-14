/* Lightweight JWT helpers used by the admin UI */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem('adminToken') } catch { return null }
}

function safeJsonParse(s: string) {
  try { return JSON.parse(s) } catch { return null }
}

function decodeBase64Url(str: string) {
  // base64url -> base64
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  try { return atob(str) } catch { return null }
}

export function parseJwt(token: string | null) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  const payload = decodeBase64Url(parts[1])
  if (!payload) return null
  return safeJsonParse(payload)
}

export function getRoles(): string[] {
  const t = getToken()
  const p = parseJwt(t)
  if (!p) return []
  const roles = p.role || p.roles || []
  if (Array.isArray(roles)) return roles.map(String)
  if (typeof roles === 'string') return [roles]
  return []
}

export function getPerms(): string[] {
  const t = getToken()
  const p = parseJwt(t)
  if (!p) return []
  const perms = p.perms || p.permissions || []
  if (Array.isArray(perms)) return perms.map(String)
  return []
}

export function hasRole(role: string) {
  const r = getRoles()
  return r.some(x => (x === role) || (x === `ROLE_${role}`) || (x === `ROLE_${role.toUpperCase()}`) || (x.toUpperCase() === `ROLE_${role.toUpperCase()}`))
}

export function hasPermission(perm: string) {
  const p = getPerms()
  return p.includes(perm)
}

export function logout() {
  if (typeof window !== 'undefined') try { localStorage.removeItem('adminToken') } catch {}
}

export function normalizeRoleName(r?: string | null) {
  if (!r) return ''
  try {
    return String(r).replace(/^ROLE_/i, '').toLowerCase()
  } catch { return String(r || '').toLowerCase() }
}

export function extractRolesFromUser(u: any): string[] {
  if (!u) return []
  let src = undefined as any
  if (u.role) src = u.role
  else if (u.roles) src = u.roles
  else if (u.authorities) src = u.authorities
  // if still not found, try token-based roles
  if (!src) {
    const tokenRoles = getRoles()
    if (tokenRoles && tokenRoles.length) return tokenRoles.map(normalizeRoleName)
    return []
  }

  if (Array.isArray(src)) return src.map((x: any) => normalizeRoleName(String(x)))
  if (typeof src === 'string') return String(src).split(/[\s,;|]+/).map(s => normalizeRoleName(s)).filter(Boolean)
  return []
}
