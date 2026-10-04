<script setup lang="ts">
import { z } from 'zod'
import type { AuthResponse, ApiErrorResponse } from '~/types/auth'

useHead({
  title: 'Daftar Akun Baru',
})

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const errors = reactive<Record<string, string>>({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const generalError = ref('')
const isLoading = ref(false)

const registerSchema = z
  .object({
    name: z.string().min(1, 'Nama lengkap wajib diisi').max(255, 'Nama maksimal 255 karakter'),
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    password: z.string().min(8, 'Password minimal harus 8 karakter'),
    password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi password tidak cocok dengan password',
    path: ['password_confirmation'],
  })

const clearErrors = () => {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.password_confirmation = ''
  generalError.value = ''
}

const handleRegister = async () => {
  clearErrors()

  // 1. Client-side Zod validation
  const validationResult = registerSchema.safeParse(form)
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
    const response = await useApiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
      },
    })

    const authData = response?.data || (response as any)
    const user = authData?.user
    const token = authData?.token

    if (user && token) {
      authStore.setAuth(user, token)
      router.push('/dashboard')
    } else {
      generalError.value = response?.message || 'Gagal memproses pendaftaran. Silakan coba lagi.'
    }
  } catch (err: any) {
    const apiError = err?.data as ApiErrorResponse | undefined
    const validationErrors = apiError?.errors || (apiError?.data as any)?.errors

    if (err?.statusCode === 422 && validationErrors) {
      // Map Laravel 422 validation errors to corresponding input fields
      for (const [key, messages] of Object.entries(validationErrors)) {
        if (key in errors && Array.isArray(messages) && messages.length > 0) {
          errors[key] = messages[0] || 'Validasi gagal'
        }
      }
      generalError.value = apiError?.message || 'Harap periksa kembali data yang dimasukkan.'
    } else {
      generalError.value = apiError?.message || err?.message || 'Terjadi kesalahan pada server. Pastikan backend aktif.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
    <div class="w-full max-w-md">
      <!-- Mascot Peek & Header -->
      <div class="text-center mb-6">
        <div class="inline-block relative">
          <AppMascot size="md" :animation="isLoading ? 'thinking' : 'excited'" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
          Buat Akun <span class="text-orange-500">PodoFriend</span>
        </h1>
        <p class="text-xs sm:text-sm text-stone-500 mt-1">
          Mulai langkah fokus sehat dan bebas stres hari ini
        </p>
      </div>

      <!-- Register Card -->
      <BaseCard variant="white" padding="md">
        <!-- General error banner -->
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

        <form class="space-y-4" @submit.prevent="handleRegister">
          <!-- Name -->
          <BaseInput
            v-model="form.name"
            id="register-name"
            label="Nama Lengkap"
            placeholder="Misal: Budi Santoso"
            :error="errors.name"
            required
            autocomplete="name"
          />

          <!-- Email -->
          <BaseInput
            v-model="form.email"
            id="register-email"
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
            id="register-password"
            type="password"
            label="Kata Sandi"
            placeholder="Minimal 8 karakter"
            :error="errors.password"
            required
            autocomplete="new-password"
          />

          <!-- Password Confirmation -->
          <BaseInput
            v-model="form.password_confirmation"
            id="register-password-confirmation"
            type="password"
            label="Konfirmasi Kata Sandi"
            placeholder="Ulangi kata sandi"
            :error="errors.password_confirmation"
            required
            autocomplete="new-password"
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
              Daftar Sekarang
            </BaseButton>
          </div>
        </form>

        <!-- Login Redirect Link -->
        <div class="mt-6 pt-4 border-t border-orange-100 text-center text-xs sm:text-sm text-stone-600">
          Sudah punya akun?
          <NuxtLink
            to="/login"
            class="font-bold text-orange-600 hover:text-orange-700 hover:underline ml-1"
          >
            Masuk di sini
          </NuxtLink>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
