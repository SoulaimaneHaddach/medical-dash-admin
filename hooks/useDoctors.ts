import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorsAPI } from '@/lib/api';
import { message } from 'antd';
import { tSync, LocaleKey } from '@/lib/i18n'

export function useDoctors() {
  const queryClient = useQueryClient();

// Get a list of doctors
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await doctorsAPI.getAll();
      return response.data;
    },
  });

  // Doctor's approval
  const approveMutation = useMutation({
    mutationFn: (id: number) => doctorsAPI.approve(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      let locale: LocaleKey = 'en'
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null
        if (stored) locale = stored
      } catch (e) {}
      message.success(tSync('doctors.messages.approved', locale))
    },
    onError: () => {
      let locale: LocaleKey = 'en'
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null
        if (stored) locale = stored
      } catch (e) {}
      message.error(tSync('doctors.messages.error', locale))
    },
  });

// Doctor refused
  const rejectMutation = useMutation({
    mutationFn: (id: number) => doctorsAPI.reject(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      let locale: LocaleKey = 'en'
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') as LocaleKey | null : null
        if (stored) locale = stored
      } catch (e) {}
      message.success(tSync('doctors.messages.rejected', locale))
    },
  });

  return {
    doctors,
    isLoading,
    approve: approveMutation.mutate,
    reject: rejectMutation.mutate,
  };
}