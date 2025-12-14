/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { specialtiesAPI } from '@/lib/api'
import { message } from 'antd'
import { tSync, LocaleKey } from '@/lib/i18n'

export function useSpecialties() {
  const queryClient = useQueryClient()

    const { data: specialties, isLoading } = useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      try {
        const res = await specialtiesAPI.getAll()
        return res.data || []
      } catch (err: any) {
        // If unauthorized/forbidden, clear token and redirect to login so user can re-authenticate
        const status = err?.response?.status
        if (status === 401 || status === 403) {
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('adminToken')
              // navigate to login page
              window.location.href = '/login'
            }
          } catch (e) {}
        }
        if (typeof console !== 'undefined') console.error('Failed fetching specialties', err)
        return []
      }
    },
  })

  const createMutation = useMutation({
    // accept form-style payloads (value,labelEn,...) and map to { name, description }
    mutationFn: (payload: any) => {
      const body = {
        name: payload.name || payload.value || payload.labelEn || '',
        description: payload.description || payload.labelEn || ''
      }
      return specialtiesAPI.create(body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] })
      let locale: LocaleKey = 'en'
      try { const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null; if (stored) locale = stored } catch {}
      message.success(tSync('specialties.added', locale) || 'Specialty added')
    },
    onError: (err: any) => {
      if (typeof console !== 'undefined') console.error('Create specialty failed', err)
      let locale: LocaleKey = 'en'
      try { const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null; if (stored) locale = stored } catch {}
      const text = err?.response?.data?.message || err?.message || tSync('specialties.addError', locale) || 'Failed to add specialty'
      message.error(text)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number, data: any }) => {
      const body = {
        name: data.name || data.value || data.labelEn || '',
        description: data.description || data.labelEn || ''
      }
      return specialtiesAPI.update(id.toString(), body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] })
      let locale: LocaleKey = 'en'
      try { const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null; if (stored) locale = stored } catch {}
      message.success(tSync('specialties.updated', locale) || 'Specialty updated')
    },
    onError: (err: any) => {
      if (typeof console !== 'undefined') console.error('Update specialty failed', err)
      let locale: LocaleKey = 'en'
      try { const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null; if (stored) locale = stored } catch {}
      const text = err?.response?.data?.message || err?.message || tSync('specialties.updateError', locale) || 'Failed to update specialty'
      message.error(text)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => specialtiesAPI.delete(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] })
      let locale: LocaleKey = 'en'
      try { const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null; if (stored) locale = stored } catch {}
      message.success(tSync('specialties.deleted', locale) || 'Specialty deleted')
    },
    onError: (err: any) => {
      if (typeof console !== 'undefined') console.error('Delete specialty failed', err)
      let locale: LocaleKey = 'en'
      try { const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null; if (stored) locale = stored } catch {}
      const text = err?.response?.data?.message || err?.message || tSync('specialties.deleteError', locale) || 'Failed to delete specialty'
      message.error(text)
    }
  })

  return {
    specialties,
      isLoading,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: deleteMutation.mutate,
  }
}
