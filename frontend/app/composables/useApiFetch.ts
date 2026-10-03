import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

export function useApiFetch<T = any>(
  request: NitroFetchRequest,
  opts?: NitroFetchOptions<NitroFetchRequest>
) {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const router = useRouter()

  const baseURL = config.public.apiBase || 'http://localhost:8000'

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts?.headers as Record<string, string>),
  }

  if (authStore.token) {
    headers.Authorization = `Bearer ${authStore.token}`
  }

  return $fetch<T>(request, {
    baseURL,
    ...opts,
    headers,
    onResponseError({ response }) {
      if (response.status === 401) {
        authStore.setToken(null)
        authStore.setUser(null)
        if (import.meta.client) {
          router.push('/login')
        }
      }
    },
  })
}
