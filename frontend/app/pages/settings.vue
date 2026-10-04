<script setup lang="ts">
import type { User, ApiResponse, ApiErrorResponse } from '~/types/auth'
import { PERSONALITY_OPTIONS } from '~/stores/preferences'

definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: 'Pengaturan Akun & Profil - PodoFriend',
})

const authStore = useAuthStore()
const router = useRouter()
const preferencesStore = usePreferencesStore()

// State Form Profil
const profileName = ref(authStore.user?.name || '')
const profileEmail = ref(authStore.user?.email || '')
const isUpdatingProfile = ref(false)
const profileSuccessMessage = ref<string | null>(null)
const profileErrorMessage = ref<string | null>(null)

// State Form Password
const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirmation = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isUpdatingPassword = ref(false)
const passwordSuccessMessage = ref<string | null>(null)
const passwordErrorMessage = ref<string | null>(null)

// State Preferensi AI
const selectedPersonality = ref(preferencesStore.activePersonality)
const isUpdatingPersonality = ref(false)
const personalitySuccessMessage = ref<string | null>(null)

onMounted(async () => {
  if (authStore.user) {
    profileName.value = authStore.user.name
    profileEmail.value = authStore.user.email
  }
  await preferencesStore.fetchPreferences()
  selectedPersonality.value = preferencesStore.activePersonality
})

// Watch auth user perubahan
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      profileName.value = newUser.name
      profileEmail.value = newUser.email
    }
  }
)

// Validasi Form Password
const isPasswordValid = computed(() => {
  return (
    currentPassword.value.length > 0 &&
    newPassword.value.length >= 8 &&
    newPassword.value === newPasswordConfirmation.value
  )
})

// Update Profil
const handleUpdateProfile = async () => {
  profileSuccessMessage.value = null
  profileErrorMessage.value = null

  const trimmedName = profileName.value.trim()
  const trimmedEmail = profileEmail.value.trim()

  if (!trimmedName || !trimmedEmail) {
    profileErrorMessage.value = 'Nama dan email tidak boleh kosong.'
    return
  }

  isUpdatingProfile.value = true
  try {
    const res = await useApiFetch<ApiResponse<User>>('/api/user/profile', {
      method: 'PUT',
      body: {
        name: trimmedName,
        email: trimmedEmail,
      },
    })

    if (res?.data) {
      authStore.setUser({
        ...authStore.user!,
        ...res.data,
      })
      profileSuccessMessage.value = 'Profil berhasil diperbarui!'
      setTimeout(() => {
        profileSuccessMessage.value = null
      }, 4000)
    }
  } catch (err: any) {
    const errorData = err?.data as ApiErrorResponse | undefined
    if (errorData?.errors) {
      const firstError = Object.values(errorData.errors)[0]
      profileErrorMessage.value = (Array.isArray(firstError) && firstError[0] ? firstError[0] : errorData.message) || 'Gagal memperbarui profil.'
    } else {
      profileErrorMessage.value = err?.data?.message || err?.message || 'Gagal memperbarui profil.'
    }
  } finally {
    isUpdatingProfile.value = false
  }
}

// Update Password
const handleUpdatePassword = async () => {
  passwordSuccessMessage.value = null
  passwordErrorMessage.value = null

  if (newPassword.value.length < 8) {
    passwordErrorMessage.value = 'Kata sandi baru minimal 8 karakter.'
    return
  }

  if (newPassword.value !== newPasswordConfirmation.value) {
    passwordErrorMessage.value = 'Konfirmasi kata sandi tidak cocok.'
    return
  }

  isUpdatingPassword.value = true
  try {
    await useApiFetch<ApiResponse<any>>('/api/user/password', {
      method: 'PUT',
      body: {
        current_password: currentPassword.value,
        new_password: newPassword.value,
        new_password_confirmation: newPasswordConfirmation.value,
      },
    })

    passwordSuccessMessage.value = 'Kata sandi berhasil diperbarui dengan aman!'
    currentPassword.value = ''
    newPassword.value = ''
    newPasswordConfirmation.value = ''

    setTimeout(() => {
      passwordSuccessMessage.value = null
    }, 4000)
  } catch (err: any) {
    const errorData = err?.data as ApiErrorResponse | undefined
    if (errorData?.errors) {
      const firstError = Object.values(errorData.errors)[0]
      passwordErrorMessage.value = (Array.isArray(firstError) && firstError[0] ? firstError[0] : errorData.message) || 'Gagal memperbarui kata sandi.'
    } else {
      passwordErrorMessage.value = err?.data?.message || err?.message || 'Gagal memperbarui kata sandi.'
    }
  } finally {
    isUpdatingPassword.value = false
  }
}

// Update AI Tone
const handleSelectPersonality = async (personalityId: string) => {
  selectedPersonality.value = personalityId
  isUpdatingPersonality.value = true
  personalitySuccessMessage.value = null

  const success = await preferencesStore.updatePersonality(personalityId)
  isUpdatingPersonality.value = false
  if (success) {
    personalitySuccessMessage.value = `Gaya respons Podo diubah ke: ${personalityId}`
    setTimeout(() => {
      personalitySuccessMessage.value = null
    }, 3500)
  }
}

// Logout
const handleLogout = async () => {
  if (confirm('Apakah kamu yakin ingin keluar dari akun PodoFriend?')) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>

<template>
  <div class="w-full flex flex-col gap-8 max-w-5xl mx-auto py-2">
    <!-- Header Page Banner -->
    <div class="bg-white rounded-3xl border border-stone-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
      <div class="flex items-center gap-5 sm:gap-6 text-center sm:text-left">
        <!-- User Avatar Vector -->
        <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-orange-100 border-2 border-orange-300 flex items-center justify-center shrink-0 shadow-xs text-orange-600 font-black text-3xl">
          {{ authStore.user?.name ? authStore.user.name.charAt(0).toUpperCase() : 'U' }}
        </div>

        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold mb-1">
            <Icon name="lucide:settings" class="w-4 h-4 text-orange-600" />
            <span>Pengaturan Akun</span>
          </div>
          <h1 class="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            {{ authStore.user?.name || 'Pelajar Podo' }}
          </h1>
          <p class="text-xs sm:text-sm text-stone-500 mt-0.5">
            {{ authStore.user?.email }} • Kelola data diri &amp; preferensi akunmu
          </p>
        </div>
      </div>

      <!-- Quick Back to Timer -->
      <NuxtLink
        to="/dashboard"
        class="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow flex items-center gap-2 transition-transform hover:scale-105"
      >
        <Icon name="lucide:timer" class="w-4 h-4" />
        <span>Kembali ke Timer</span>
      </NuxtLink>
    </div>

    <!-- Main Grid Form Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Profil & Keamanan (7 Cols) -->
      <div class="lg:col-span-7 flex flex-col gap-8">
        <!-- Section 1: Profil Pengguna -->
        <div class="bg-white rounded-3xl border border-stone-800 p-6 sm:p-8 shadow-md flex flex-col gap-6">
          <div class="flex items-center gap-3 border-b border-orange-100 pb-4">
            <div class="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Icon name="lucide:user" class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-xl font-black text-stone-900">
                Informasi Profil
              </h2>
              <p class="text-xs text-stone-500">
                Perbarui nama tampilan dan alamat email akunmu.
              </p>
            </div>
          </div>

          <!-- Alert Feedback -->
          <div
            v-if="profileSuccessMessage"
            class="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2"
          >
            <Icon name="lucide:check-circle-2" class="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{{ profileSuccessMessage }}</span>
          </div>

          <div
            v-if="profileErrorMessage"
            class="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2"
          >
            <Icon name="lucide:alert-circle" class="w-5 h-5 text-rose-600 shrink-0" />
            <span>{{ profileErrorMessage }}</span>
          </div>

          <form class="flex flex-col gap-4" @submit.prevent="handleUpdateProfile">
            <div>
              <label class="block text-xs font-extrabold text-stone-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                v-model="profileName"
                type="text"
                placeholder="Nama kamu..."
                class="w-full text-sm font-semibold px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900 transition-all"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-extrabold text-stone-700 mb-1.5">
                Alamat Email
              </label>
              <input
                v-model="profileEmail"
                type="email"
                placeholder="nama@email.com"
                class="w-full text-sm font-semibold px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900 transition-all"
                required
              />
            </div>

            <div class="flex items-center justify-end pt-2">
              <button
                type="submit"
                :disabled="isUpdatingProfile"
                class="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Icon v-if="isUpdatingProfile" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Section 2: Keamanan & Kata Sandi -->
        <div class="bg-white rounded-3xl border border-stone-800 p-6 sm:p-8 shadow-md flex flex-col gap-6">
          <div class="flex items-center gap-3 border-b border-orange-100 pb-4">
            <div class="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Icon name="lucide:lock" class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-xl font-black text-stone-900">
                Ubah Kata Sandi
              </h2>
              <p class="text-xs text-stone-500">
                Pastikan akunmu tetap aman dengan menggunakan kombinasi kata sandi yang kuat.
              </p>
            </div>
          </div>

          <!-- Alert Feedback -->
          <div
            v-if="passwordSuccessMessage"
            class="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2"
          >
            <Icon name="lucide:check-circle-2" class="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{{ passwordSuccessMessage }}</span>
          </div>

          <div
            v-if="passwordErrorMessage"
            class="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2"
          >
            <Icon name="lucide:alert-circle" class="w-5 h-5 text-rose-600 shrink-0" />
            <span>{{ passwordErrorMessage }}</span>
          </div>

          <form class="flex flex-col gap-4" @submit.prevent="handleUpdatePassword">
            <!-- Current Password -->
            <div>
              <label class="block text-xs font-extrabold text-stone-700 mb-1.5">
                Kata Sandi Saat Ini
              </label>
              <div class="relative">
                <input
                  v-model="currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  placeholder="Masukkan kata sandi lama..."
                  class="w-full text-sm font-semibold px-4 py-3 pr-11 rounded-2xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900 transition-all"
                  required
                />
                <button
                  type="button"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  @click="showCurrentPassword = !showCurrentPassword"
                >
                  <Icon :name="showCurrentPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- New Password -->
            <div>
              <label class="block text-xs font-extrabold text-stone-700 mb-1.5">
                Kata Sandi Baru
              </label>
              <div class="relative">
                <input
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Minimal 8 karakter..."
                  class="w-full text-sm font-semibold px-4 py-3 pr-11 rounded-2xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900 transition-all"
                  required
                />
                <button
                  type="button"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  @click="showNewPassword = !showNewPassword"
                >
                  <Icon :name="showNewPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Confirm New Password -->
            <div>
              <label class="block text-xs font-extrabold text-stone-700 mb-1.5">
                Konfirmasi Kata Sandi Baru
              </label>
              <div class="relative">
                <input
                  v-model="newPasswordConfirmation"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Ulangi kata sandi baru..."
                  class="w-full text-sm font-semibold px-4 py-3 pr-11 rounded-2xl bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900 transition-all"
                  required
                />
                <button
                  type="button"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <Icon :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Validation Checklist Hints -->
            <div class="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col gap-1 text-[11px] text-stone-600">
              <div class="flex items-center gap-1.5" :class="newPassword.length >= 8 ? 'text-emerald-700 font-bold' : ''">
                <Icon :name="newPassword.length >= 8 ? 'lucide:check-circle-2' : 'lucide:circle'" class="w-3.5 h-3.5" />
                <span>Panjang kata sandi minimal 8 karakter</span>
              </div>
              <div
                class="flex items-center gap-1.5"
                :class="newPassword.length > 0 && newPassword === newPasswordConfirmation ? 'text-emerald-700 font-bold' : ''"
              >
                <Icon
                  :name="newPassword.length > 0 && newPassword === newPasswordConfirmation ? 'lucide:check-circle-2' : 'lucide:circle'"
                  class="w-3.5 h-3.5"
                />
                <span>Konfirmasi kata sandi cocok</span>
              </div>
            </div>

            <div class="flex items-center justify-end pt-2">
              <button
                type="submit"
                :disabled="isUpdatingPassword || !isPasswordValid"
                class="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                <Icon v-if="isUpdatingPassword" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                <span>Perbarui Kata Sandi</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Right Column: Gaya AI Companion & Keluar Akun (5 Cols) -->
      <div class="lg:col-span-5 flex flex-col gap-8">
        <!-- Section 3: Gaya Kepribadian AI Podo -->
        <div class="bg-white rounded-3xl border border-stone-800 p-6 sm:p-8 shadow-md flex flex-col gap-6">
          <div class="flex items-center gap-3 border-b border-orange-100 pb-4">
            <div class="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Icon name="lucide:bot" class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-xl font-black text-stone-900">
                Gaya Pendamping AI
              </h2>
              <p class="text-xs text-stone-500">
                Pilih persona respon Podo saat mengobrol di ruang chat.
              </p>
            </div>
          </div>

          <!-- Alert Feedback -->
          <div
            v-if="personalitySuccessMessage"
            class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2"
          >
            <Icon name="lucide:check" class="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{{ personalitySuccessMessage }}</span>
          </div>

          <!-- Personality Options List -->
          <div class="flex flex-col gap-3">
            <div
              v-for="opt in PERSONALITY_OPTIONS"
              :key="opt.id"
              class="p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5"
              :class="
                selectedPersonality === opt.id
                  ? 'bg-orange-50 border-orange-500 shadow-sm'
                  : 'bg-stone-50/70 border-stone-200 hover:border-orange-300 hover:bg-orange-50/40'
              "
              @click="handleSelectPersonality(opt.id)"
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                :class="selectedPersonality === opt.id ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-600'"
              >
                <Icon :name="opt.icon" class="w-5 h-5" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-black text-stone-900">
                    {{ opt.label }}
                  </h3>
                  <span
                    v-if="selectedPersonality === opt.id"
                    class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500 text-white"
                  >
                    Aktif
                  </span>
                </div>
                <p class="text-xs text-stone-600 mt-1 leading-relaxed">
                  {{ opt.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: Keluar Akun (Danger Zone) -->
        <div class="bg-white rounded-3xl border border-rose-300 p-6 sm:p-8 shadow-sm flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Icon name="lucide:log-out" class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-lg font-black text-stone-900">
                Keluar Sesi
              </h2>
              <p class="text-xs text-stone-500">
                Keluar dari akun PodoFriend pada perangkat ini.
              </p>
            </div>
          </div>

          <p class="text-xs text-stone-600">
            Setelah keluar, kamu perlu masuk kembali untuk mengakses riwayat sesi Pomodoro, daftar tugas, dan obrolan AI Companion.
          </p>

          <button
            type="button"
            class="w-full mt-2 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-extrabold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            @click="handleLogout"
          >
            <Icon name="lucide:log-out" class="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
