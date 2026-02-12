import { API_BASE_URL } from '@/constants'

export const checkIsAdmin = async (address: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admins/check/${address}`)
    if (!res.ok) return false
    const data = await res.json()
    return data.isAdmin === true
  } catch {
    return false
  }
}
