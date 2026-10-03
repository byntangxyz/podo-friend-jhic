<script setup lang="ts">
import { z } from 'zod'
import type { AuthResponse, ApiErrorResponse } from '~/types/auth'

useHead({
  title: 'Masuk ke Akun',
})

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive<Record<string, string>>({
  email: '',
  password: '',
})

const generalError = ref('')
const isLoading = ref(false)

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

const clearErrors = () => {
  errors.email = ''
  errors.password = ''
  generalError.value = ''
}

const handleLogin = async () => {
  clearErrors()

  // 1. Client-side Zod validation
  const validationResult = loginSchema.safeParse(form)
  if (!validationResult.success) {
    for (const issue of validationResult.error.issues) {
      const field = issue.path[0] as string
      if (field && field in errors) {
        errors[field] = issue.message
      }
    }
    return
  }

  // 2. Submit to Laravel Backend API
  isLoading.value = true

  try {
    const response = await useApiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: {
        email: form.email.trim(),
        password: form.password,
      },
    })

    const authData = response?.data || (response as any)
    const user = authData?.user
    const token = authData?.token

    if (user && token) {
      authStore.setAuth(user, token)
      router.push('/dashboard')
    } else {
      generalError.value = response?.message || 'Gagal memproses login. Silakan periksa kembali akun Anda.'
    }
  } catch (err: any) {
    const status = err?.statusCode || err?.status
    const apiError = err?.data as ApiErrorResponse | undefined
    const validationErrors = apiError?.errors || (apiError?.data as any)?.errors

    if (status === 401) {
      generalError.value = apiError?.message || 'Email atau kata sandi yang Anda masukkan salah.'
    } else if (status === 422 && validationErrors) {
      for (const [key, messages] of Object.entries(validationErrors)) {
        if (key in errors && Array.isArray(messages) && messages.length > 0) {
          errors[key] = messages[0] || 'Validasi gagal'
        }
      }
      generalError.value = apiError?.message || 'Harap periksa kembali format data yang dimasukkan.'
    } else {
      generalError.value = apiError?.message || err?.message || 'Gagal terhubung ke server backend. Pastikan server aktif.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
    <div class="w-full max-w-md">
      <!-- Mascot Peek & Header -->
      <div class="text-center mb-6">
        <div class="inline-block relative">
          <AppMascot size="md" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
          Selamat Datang <span class="text-orange-500">Kembali</span>
        </h1>
        <p class="text-xs sm:text-sm text-stone-500 mt-1">
          Lanjutkan perjalanan fokus dan belajar sehatmu hari ini
        </p>
      </div>

      <!-- Login Card -->
      <BaseCard variant="white" padding="md">
        <!-- Error Banner -->
        <div
          v-if="generalError"
          class="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2"
        >
          <svg class="w-5 h-5 shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ generalError }}</span>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <!-- Email -->
          <BaseInput
            v-model="form.email"
            id="login-email"
            type="email"
            label="Alamat Email"
            placeholder="nama@email.com"
            :error="errors.email"
            required
            autocomplete="email"
          />

          <!-- Password -->
          <BaseInput
            v-model="form.password"
            id="login-password"
            type="password"
            label="Kata Sandi"
            placeholder="Masukkan kata sandi Anda"
            :error="errors.password"
            required
            autocomplete="current-password"
          />

          <!-- Submit Button -->
          <div class="pt-2">
            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              :loading="isLoading"
              block
            >
              Masuk Sekarang
            </BaseButton>
          </div>
        </form>

        <!-- Register Redirect Link -->
        <div class="mt-6 pt-4 border-t border-orange-100 text-center text-xs sm:text-sm text-stone-600">
          Belum punya akun?
          <NuxtLink
            to="/register"
            class="font-bold text-orange-600 hover:text-orange-700 hover:underline ml-1"
          >
            Daftar gratis di sini
          </NuxtLink>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
