import { getApiAdminsCheckAddress } from '@/api/generated/admins/admins'

export const checkIsAdmin = async (address: string): Promise<boolean> => {
  try {
    const res = await getApiAdminsCheckAddress(address)
    if (res.status !== 200) return false
    const data = res.data as unknown as { isAdmin?: boolean }
    return data?.isAdmin === true
  } catch {
    return false
  }
}
