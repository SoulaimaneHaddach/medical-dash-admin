import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI } from '@/lib/api'
import { message } from 'antd'
import { tSync, LocaleKey } from '@/lib/i18n'

export function useUsers() {
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await usersAPI.getAll()
      const d = res?.data
      // normalize response: accept either { items, total, ... } or an array
      if (Array.isArray(d)) return d
      if (d && Array.isArray(d.items)) return d.items
      return d || []
    },
  })

  const banMutation = useMutation({
    mutationFn: (id: number) => usersAPI.ban(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      let locale: LocaleKey = 'en'
      try { const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null; if (stored) locale = stored } catch {}
      message.success(tSync('users.actions.banned', locale) || 'User banned')
    }
  })

  const unbanMutation = useMutation({
    mutationFn: (id: number) => usersAPI.unban(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      let locale: LocaleKey = 'en'
      try { const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null; if (stored) locale = stored } catch {}
      message.success(tSync('users.actions.unbanned', locale) || 'User unbanned')
    }
  })

  return {
    users,
    isLoading,
    ban: banMutation.mutate,
    unban: unbanMutation.mutate,
  }
}
