<script setup lang="ts">
/**
 * SidebarMascot.vue
 * Maskot Interaktif Pengganti pomodoro_right_bar.svg untuk Tepi Layar Kanan.
 * Spesifikasi Revisi:
 * 1. Default: Mata simpel mengikuti pergerakan kursor pengguna (cursor tracking) dengan kedipan natural.
 * 2. Background Ribbon (path tepi layar): Tetap diam di posisi semula menempel di tepi layar, tidak ikut menyembul.
 * 3. Hover: HANYA maskot Podo yang menyembul lebih jauh ke arah kiri layar (arah konten).
 * 4. Clicked: Maskot meluncur sembunyi ke kanan hingga benar-benar keluar layar sebelum redirect ke /chatbot.
 * 5. Tampilan bersih: Tanpa glint pupil dan tanpa blushed cheeks.
 */

interface Props {
  to?: string
}

const props = withDefaults(defineProps<Props>(), {
  to: '/chatbot',
})

const mascotContainerRef = ref<HTMLElement | null>(null)
const eyeShiftX = ref(0)
const eyeShiftY = ref(0)
const isExiting = ref(false)

// Sapaan ramah saat hover
const greetings = [
  'Tanya Podo AI!',
  'Mau ngobrol bareng Podo?',
  'Semangat belajarnya ya!',
  'Butuh bantuan materi?',
]

const currentGreetingIndex = ref(0)
let greetingTimer: ReturnType<typeof setInterval> | null = null

function cycleGreeting() {
  currentGreetingIndex.value = (currentGreetingIndex.value + 1) % greetings.length
}

// Mouse tracking agar mata mengikuti kursor
function handleMouseMove(e: MouseEvent) {
  if (isExiting.value || !mascotContainerRef.value) return

  const rect = mascotContainerRef.value.getBoundingClientRect()
  // Perkiraan titik tengah mata Podo di viewport
  const eyeCenterX = rect.left + rect.width * 0.35
  const eyeCenterY = rect.top + rect.height * 0.53

  const dx = e.clientX - eyeCenterX
  const dy = e.clientY - eyeCenterY
  const dist = Math.hypot(dx, dy)

  // Maksimal pergeseran mata agar tetap berada di rongga mata
  const maxShiftX = 14
  const maxShiftY = 10

  if (dist > 0) {
    const factor = Math.min(dist / 200, 1)
    eyeShiftX.value = (dx / dist) * maxShiftX * factor
    eyeShiftY.value = (dy / dist) * maxShiftY * factor
  }
}

// Penanganan klik: sembunyi ke kanan keluar layar lalu redirect
function handleClick(e: MouseEvent) {
  e.preventDefault()
  if (isExiting.value) return

  isExiting.value = true

  // Pastikan animasi meluncur keluar layar selesai sepenuhnya sebelum redirect
  setTimeout(() => {
    navigateTo(props.to)
  }, 500)
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  greetingTimer = setInterval(cycleGreeting, 8000)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  if (greetingTimer) clearInterval(greetingTimer)
})
</script>

<template>
  <div
    ref="mascotContainerRef"
    class="sidebar-mascot-wrapper fixed right-0 top-20 bottom-0 w-[240px] xl:w-[320px] 2xl:w-[354px] z-30 hidden xl:flex items-center justify-end overflow-visible select-none cursor-pointer"
    :class="{ 'pointer-events-none': isExiting }"
    @click="handleClick"
  >
    <!-- Interactive Speech Bubble on Hover -->
    <div
      class="speech-bubble absolute right-44 sm:right-52 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform pointer-events-none whitespace-nowrap z-40"
      :class="{ '!opacity-0': isExiting }"
    >
      <div
        class="relative bg-stone-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl border border-orange-500/30 flex flex-col gap-1"
      >
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span class="text-[11px] font-semibold text-orange-300 uppercase tracking-wider">Podo Companion</span>
        </div>
        <div class="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-stone-100">
          <Icon name="lucide:message-circle" class="w-4 h-4 text-orange-400 shrink-0" />
          <span>{{ greetings[currentGreetingIndex] }}</span>
        </div>
        <!-- Little bubble tail pointing right to Podo -->
        <div
          class="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-6 border-y-transparent border-l-8 border-l-stone-900/95"
        />
      </div>
    </div>

    <!-- Scalable Mascot SVG -->
    <svg
      viewBox="0 0 354 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="h-full max-h-[95vh] w-auto object-contain object-right drop-shadow-md overflow-visible"
    >
      <defs>
        <!-- Background Ribbon Drop Shadow -->
        <filter id="podo-sidebar-shadow" x="223.5" y="-28" width="137" height="1055.5" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="-4" />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.96 0 0 0 0 0.415 0 0 0 0 0.086 0 0 0 0.2 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>

        <!-- Clip Path untuk area intip Podo -->
        <clipPath id="podo-sidebar-clip">
          <rect width="708" height="708" fill="white" transform="matrix(0 -1 1 0 0 898.5)" />
        </clipPath>
      </defs>

      <!-- 1. Background Wave Ribbon: TETAP DI POSISI (Selalu Menempel di Tepi Layar, Tidak Ikut Menyembul) -->
      <g
        filter="url(#podo-sidebar-shadow)"
        class="transition-opacity duration-300"
        :class="{ 'opacity-0': isExiting }"
      >
        <path
          d="M271 89.5C302.6 9.1 257.833 -19.6667 231.5 -24H360.5L354.5 1023.5H283.5C285.5 1017.67 292.4 996.9 304 960.5C318.5 915 289.5 919.5 271 873.5C252.5 827.5 258 806 304 758.5C350 711 197 377.5 271 363.5C345 349.5 285 291 304 231C323 171 231.5 190 271 89.5Z"
          fill="#F56A16"
          fill-opacity="0.4"
          shape-rendering="crispEdges"
        />
      </g>

      <!-- 2. Interactive Peeking Mascot Character: HANYA INI YANG MENYEMBUL & EXIT -->
      <g
        class="podo-character-motion-group"
        :class="{ 'is-exiting': isExiting }"
      >
        <!-- Karakter Podo dengan Idle Breathing Float -->
        <g class="podo-peeking-character origin-[330px_540px]">
          <!-- Mascot Body (Clean Orange Podo) -->
          <g clip-path="url(#podo-sidebar-clip)">
            <path
              class="podo-body-path transition-all duration-300"
              d="M119.475 544.5C119.608 529.698 120.802 514.299 124.232 500.117C127.639 485.935 133.215 472.306 139.985 459.429C146.755 446.553 154.875 433.543 164.875 422.835C174.854 412.126 190.518 406.307 199.899 395.178C209.28 384.072 211.559 366.416 221.206 356.128C230.83 345.862 244.57 338.494 257.69 333.494C270.832 328.494 285.634 325.994 299.949 326.171C314.263 326.325 329.574 330.419 343.601 334.512C357.606 338.605 370.35 350.619 384.046 350.707C397.763 350.796 412.034 335.706 425.84 335.021C439.668 334.335 454.669 339.954 466.926 346.57C479.205 353.207 490.6 363.761 499.494 374.801C508.388 385.842 516.552 399.028 520.314 412.79C524.053 426.552 519.03 443.057 521.951 457.394C524.871 471.709 534.938 484.718 537.859 498.746C540.757 512.795 540.536 527.176 539.43 541.624C538.323 556.093 534.429 570.961 531.265 585.498C528.102 600.012 522.061 614.149 520.446 628.796C518.809 643.443 524.008 659.417 521.508 673.334C519.03 687.273 513.411 700.857 505.512 712.34C497.635 723.823 486.241 734.487 474.139 742.231C462.036 749.997 446.947 758.139 432.92 758.913C418.87 759.688 404.091 747.43 389.931 746.877C375.771 746.302 362.076 753.537 347.982 755.506C333.888 757.453 319.463 760.241 305.413 758.648C291.342 757.033 275.655 753.404 263.575 745.882C251.473 738.359 244.548 722.186 232.866 713.491C221.184 704.773 205.718 701.278 193.461 693.667C181.182 686.034 169.19 678.223 159.256 667.78C149.344 657.36 139.896 644.173 133.923 631.053C127.949 617.911 125.803 603.375 123.391 588.971C121.002 574.546 119.342 559.302 119.475 544.5Z"
              fill="#F56A16"
            />
          </g>

          <!-- Interactive Clean Eyes Group (Tracking cursor + Blink) -->
          <g
            class="podo-eyes-cursor-tracker"
            :style="{
              transform: `translate3d(${eyeShiftX}px, ${eyeShiftY}px, 0)`,
            }"
          >
            <g class="podo-eyes-blink origin-[328px_540px]">
              <!-- Left Eye (Clean solid dark fill, no glint) -->
              <path
                d="M250.49 472.047C250.076 466.085 250.88 458.54 253.216 453.867C255.577 449.17 259.325 446.712 264.63 443.962C269.912 441.187 274.779 439.119 284.976 437.245C295.174 435.346 312.137 433.594 325.79 432.621C339.444 431.671 356.504 431.063 366.872 431.525C377.24 431.963 382.326 433.326 387.948 435.322C393.57 437.342 397.635 439.24 400.628 443.548C403.597 447.856 405.447 455.206 405.861 461.193C406.275 467.155 405.471 474.7 403.135 479.373C400.774 484.07 397.026 486.528 391.721 489.278C386.44 492.053 381.572 494.121 371.375 495.995C361.177 497.894 344.214 499.646 330.561 500.619C316.907 501.569 299.847 502.177 289.479 501.715C279.111 501.277 274.025 499.914 268.403 497.918C262.781 495.898 258.716 494 255.723 489.692C252.754 485.384 250.904 478.034 250.49 472.047Z"
                fill="#151612"
              />

              <!-- Right Eye (Clean solid dark fill, no glint) -->
              <path
                d="M250.49 607.218C250.904 601.231 252.754 593.881 255.723 589.573C258.716 585.265 262.781 583.367 268.403 581.347C274.025 579.351 279.111 577.988 289.479 577.55C299.847 577.088 316.907 577.696 330.561 578.646C344.214 579.619 361.177 581.371 371.375 583.27C381.572 585.144 386.44 587.212 391.721 589.987C397.026 592.737 400.774 595.195 403.135 599.892C405.471 604.565 406.275 612.11 405.861 618.072C405.447 624.059 403.597 631.409 400.628 635.717C397.635 640.025 393.57 641.923 387.948 643.943C382.326 645.939 377.24 647.302 366.872 647.74C356.504 648.202 339.444 647.594 325.79 646.645C312.137 645.671 295.174 643.919 284.976 642.02C274.779 640.146 269.912 638.078 264.63 635.303C259.325 632.553 255.577 630.095 253.216 625.398C250.88 620.725 250.076 613.18 250.49 607.218Z"
                fill="#151612"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* Transisi karakter Podo saat hover (menyembul ke kiri) dan saat exit (sembunyi ke kanan) */
.podo-character-motion-group {
  transition: transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1);
  will-change: transform;
}

/* 1. HOVER STATE: HANYA karakter maskot Podo yang menyembul ke kiri (-46px), latar belakang ribbon tetap di posisinya! */
.sidebar-mascot-wrapper:hover .podo-character-motion-group:not(.is-exiting) {
  transform: translate3d(-46px, 0, 0);
}

.sidebar-mascot-wrapper:hover .speech-bubble {
  opacity: 1;
  transform: translate3d(-46px, -50%, 0);
}

/* 2. CLICKED STATE (EXIT): Karakter maskot meluncur sembunyi sepenuhnya ke kanan ke luar layar */
.podo-character-motion-group.is-exiting {
  transform: translate3d(480px, 0, 0) !important;
  transition: transform 0.46s cubic-bezier(0.5, 0, 0.9, 0.3) !important;
}

/* Idle Breathing Float */
@keyframes podo-sidebar-peek {
  0%, 100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-4px, -8px, 0);
  }
}

.podo-peeking-character {
  animation: podo-sidebar-peek 4.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  will-change: transform;
}

/* Mata mengikuti kursor dengan pergerakan halus */
.podo-eyes-cursor-tracker {
  transition: transform 0.08s ease-out;
  will-change: transform;
}

/* Kedipan mata natural */
@keyframes podo-eye-blink {
  0%, 46%, 50%, 100% {
    transform: scaleX(1);
  }
  48% {
    transform: scaleX(0.12);
  }
}

.podo-eyes-blink {
  animation: podo-eye-blink 4.6s cubic-bezier(0.25, 1, 0.5, 1) infinite;
  transform-box: fill-box;
  transform-origin: center;
}
</style>
