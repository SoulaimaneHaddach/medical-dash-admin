import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorsAPI } from '@/lib/api';
import { message } from 'antd';
import { tSync, LocaleKey } from '@/lib/i18n'

export function useDoctors() {
  const queryClient = useQueryClient();

// Get a list of doctors
  const { data: rawDoctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await doctorsAPI.getAll();
      return response.data;
    },
  });

  // Normalize response: some backends return { items: [...] } or a direct array
  const doctors = (Array.isArray(rawDoctors) ? rawDoctors : (rawDoctors?.items ?? rawDoctors)) as any[] | undefined;

  // Doctor's approval
  const approveMutation = useMutation({
    mutationFn: (id: string) => doctorsAPI.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      let locale: LocaleKey = 'en'
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null
        if (stored) locale = stored
      } catch {}
      message.success(tSync('doctors.messages.approved', locale))
    },
    onError: (err) => {
      if (typeof console !== 'undefined') console.error('Approve doctor error', err)
      let locale: LocaleKey = 'en'
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null
        if (stored) locale = stored
      } catch {}
      message.error(tSync('doctors.messages.error', locale))
    },
  });

// Doctor refused
  const rejectMutation = useMutation({
    mutationFn: (id: string) => doctorsAPI.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      let locale: LocaleKey = 'en'
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null
        if (stored) locale = stored
      } catch {}
      message.success(tSync('doctors.messages.rejected', locale))
    },
    onError: (err) => {
      if (typeof console !== 'undefined') console.error('Reject doctor error', err)
      let locale: LocaleKey = 'en'
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null
        if (stored) locale = stored
      } catch {}
      message.error(tSync('doctors.messages.error', locale))
    },
  });

  // Disable doctor account
  const disableMutation = useMutation({
    mutationFn: (id: string) => doctorsAPI.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      let locale: LocaleKey = 'en'
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null
        if (stored) locale = stored
      } catch {}
      message.success(tSync('doctors.messages.disabled', locale))
    },
    onError: (err) => {
      if (typeof console !== 'undefined') console.error('Disable doctor error', err)
      let locale: LocaleKey = 'en'
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null
        if (stored) locale = stored
      } catch {}
      message.error(tSync('doctors.messages.error', locale))
    },
  });

  // Enable doctor account
  const enableMutation = useMutation({
    mutationFn: (id: string) => doctorsAPI.enable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      let locale: LocaleKey = 'en'
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null
        if (stored) locale = stored
      } catch {}
      message.success(tSync('doctors.messages.enabled', locale))
    },
    onError: (err) => {
      if (typeof console !== 'undefined') console.error('Enable doctor error', err)
      let locale: LocaleKey = 'en'
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null
        if (stored) locale = stored
      } catch {}
      message.error(tSync('doctors.messages.error', locale))
    },
  });

  // Delete doctor
  const deleteMutation = useMutation({
    mutationFn: (id: string) => doctorsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      let locale: LocaleKey = 'en'
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null
        if (stored) locale = stored
      } catch {}
      message.success(tSync('doctors.messages.deleted', locale))
    },
    onError: (err) => {
      if (typeof console !== 'undefined') console.error('Delete doctor error', err)
      let locale: LocaleKey = 'en'
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null
        if (stored) locale = stored
      } catch {}
      message.error(tSync('doctors.messages.error', locale))
    },
  });

  return {
    doctors,
    isLoading,
    approve: (id: string) => approveMutation.mutateAsync(id),
    reject: (id: string) => rejectMutation.mutateAsync(id),
    disable: (id: string) => disableMutation.mutateAsync(id),
    enable: (id: string) => enableMutation.mutateAsync(id),
    approveLoading: (approveMutation as any).isLoading,
    rejectLoading: (rejectMutation as any).isLoading,
    disableLoading: (disableMutation as any).isLoading,
    enableLoading: (enableMutation as any).isLoading,
    delete: (id: string) => deleteMutation.mutateAsync(id),
    deleteLoading: (deleteMutation as any).isLoading,
  };
}