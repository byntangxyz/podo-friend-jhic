<script setup lang="ts">
interface PartnerLogo {
  name: string
  src: string
  alt: string
  imgClass: string
}

const jhicLogos: PartnerLogo[] = [
  {
    name: 'JHIC 2.0',
    src: '/logoJHIC/1.%20LOGO%20JHIC%202.0.png',
    alt: 'Logo Jagoan Hosting Innovation Competition 2.0',
    imgClass: 'h-8 sm:h-9 max-w-[130px]',
  },
  {
    name: 'Jagoan Hosting',
    src: '/logoJHIC/2.%20Logo%20Jagoan%20Hosting.png',
    alt: 'Logo Jagoan Hosting',
    imgClass: 'h-6 sm:h-7 max-w-[140px]',
  },
  {
    name: 'KOMDIGI',
    src: '/logoJHIC/3.%20KOMDIGI.png',
    alt: 'Logo Kementerian Komunikasi dan Digital',
    imgClass: 'h-7 sm:h-8 max-w-[110px]',
  },
  {
    name: 'Garuda Spark',
    src: '/logoJHIC/4.%20Garuda%20Spark%20Full%20Color.png',
    alt: 'Logo Garuda Spark Innovation Hub',
    imgClass: 'h-8 sm:h-9 max-w-[130px]',
  },
  {
    name: 'NGALUP.CO',
    src: '/logoJHIC/5.%20LOGO%20NGALUP.png',
    alt: 'Logo Ngalup.co',
    imgClass: 'h-5 sm:h-6 max-w-[120px]',
  },
]
</script>

<template>
  <footer class="w-full bg-[#141416] text-stone-300 border-t border-stone-800 transition-colors pb-16 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col gap-10">
      <!-- Top Row: Brand & Team Yogaruh Info -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-stone-800/80">
        <!-- Brand Info -->
        <div class="flex flex-col gap-2 max-w-xl">
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <img src="/logo-podofriend.png" alt="">
          </div>
            <div class="flex flex-col">
              <span class="font-black text-xl sm:text-2xl text-white tracking-tight leading-tight">
                Podo<span class="text-orange-500">Friend</span>
              </span>
              <span class="text-[11px] sm:text-xs text-stone-400 font-semibold">
                Anti-Burnout Focus &amp; Study Companion
              </span>
            </div>
          </div>
          <p class="text-xs sm:text-sm text-stone-400 leading-relaxed mt-1">
            Platform manajemen fokus belajar dengan ritme Pomodoro adaptif dan AI Companion yang dirancang untuk mencegah burnout dan menjaga konsistensi belajar.
          </p>
        </div>

        <!-- Team Yogaruh Identity Badge -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-stone-900/90 border border-stone-700/80 rounded-2xl p-4 sm:px-5 sm:py-3.5 shadow-inner">
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-orange-400">Created &amp; Innovated By</span>
            </div>
            <span class="text-base sm:text-lg font-black text-white tracking-tight">
              Team Yogaruh
            </span>
          </div>
        </div>
      </div>

      <!-- Center Row: Logo JHIC & Partner Showcase -->
      <div class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2 text-stone-400 text-xs sm:text-sm font-bold">
            <Icon name="lucide:award" class="w-4 h-4 text-orange-400 shrink-0" />
            <span>Jagoan Hosting Innovation Competition (JHIC 2.0)</span>
          </div>
          <span class="text-[11px] text-stone-500 font-medium">
            Didukung oleh Jagoan Hosting, Komdigi, Garuda Spark &amp; Ngalup.co
          </span>
        </div>

        <!-- Logo Badges Grid / Row -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 items-center">
          <div
            v-for="logo in jhicLogos"
            :key="logo.name"
            class="bg-white/95 hover:bg-white rounded-2xl p-3 sm:p-3.5 flex items-center justify-center h-14 sm:h-16 shadow-md border border-stone-700/40 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg group"
            :title="logo.alt"
          >
            <img
              :src="logo.src"
              :alt="logo.alt"
              :class="logo.imgClass"
              class="w-auto object-contain transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <!-- Bottom Bar: Copyright & Attribution -->
      <div class="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <p class="text-center sm:text-left">
          &copy; 2026 <strong class="text-stone-300 font-bold">PodoFriend</strong> &bull; Dibuat dengan dedikasi oleh <strong class="text-stone-300 font-bold">Team Yogaruh</strong>.
        </p>

        <div class="flex items-center gap-4 text-[11px]">
          <span class="inline-flex items-center gap-1.5 text-stone-400">
            <span class="w-2 h-2 rounded-full bg-emerald-500" />
            JHIC 2.0 Innovation Project
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>
