export async function checkIsAdmin(address: string): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:3001/api/admins/check/${address}`)
    if (!res.ok) return false
    const data = await res.json()
    return data.isAdmin === true
  } catch {
    return false
  }
}
