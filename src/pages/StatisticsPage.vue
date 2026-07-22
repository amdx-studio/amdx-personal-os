<script setup lang="ts">
import { onMounted } from 'vue'
import { CheckSquare, FileText, Wallet, Target } from 'lucide-vue-next'
import { useStatisticsStore } from '../stores/useStatisticsStore'
import SummaryCard from '../components/SummaryCard.vue'

const statisticsStore = useStatisticsStore()

onMounted(() => {
  statisticsStore.loadAll()
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Tasks -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <SummaryCard
        label="Tasks Selesai"
        :value="`${statisticsStore.taskStats.completed}/${statisticsStore.taskStats.total}`"
        :icon="CheckSquare"
      />
      <SummaryCard
        label="Tingkat Penyelesaian"
        :value="`${statisticsStore.taskStats.completionRate}%`"
        :icon="CheckSquare"
      />
    </div>

    <!-- Notes & Finance -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard label="Total Catatan" :value="`${statisticsStore.noteStats.total}`" :icon="FileText" />
      <SummaryCard
        label="Saldo Saat Ini"
        :value="formatCurrency(statisticsStore.financeStats.balance)"
        :icon="Wallet"
      />
      <SummaryCard
        label="Pengeluaran Bulan Ini"
        :value="formatCurrency(statisticsStore.financeStats.monthExpense)"
        :icon="Wallet"
      />
    </div>

    <!-- Goals -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard label="Total Goals" :value="`${statisticsStore.goalStats.total}`" :icon="Target" />
      <SummaryCard label="Goals Tercapai" :value="`${statisticsStore.goalStats.completed}`" :icon="Target" />
      <SummaryCard
        label="Rata-rata Progress"
        :value="`${statisticsStore.goalStats.averageProgress}%`"
        :icon="Target"
      />
    </div>
  </div>
</template>