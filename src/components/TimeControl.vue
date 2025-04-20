<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

// 时间流逝速度选项
const timeScaleOptions = [
  { label: '正常 (1x)', value: 1 },
  { label: '快速 (2x)', value: 2 },
  { label: '极速 (5x)', value: 5 }
]

// 当前选中的时间流逝速度
const currentTimeScale = computed({
  get: () => gameStore.gameTime.timeScale,
  set: (value) => {
    gameStore.gameTime.timeScale = value
    gameStore.addToEventLog(`时间流速调整为 ${value}x`)
  }
})

// 当前游戏时间的格式化显示
const formattedGameTime = computed(() => {
  const { day, hour, minute } = gameStore.gameTime
  return {
    day,
    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }
})

// 获取当前时间段（早晨、白天、傍晚、夜晚）
const dayPeriod = computed(() => {
  const hour = gameStore.gameTime.hour
  if (hour >= 5 && hour < 9) return { name: '早晨', icon: '🌅' }
  if (hour >= 9 && hour < 17) return { name: '白天', icon: '☀️' }
  if (hour >= 17 && hour < 21) return { name: '傍晚', icon: '🌇' }
  return { name: '夜晚', icon: '🌙' }
})

// 获取当前季节（基于天数）
const currentSeason = computed(() => {
  const day = gameStore.gameTime.day
  const seasonLength = 30 // 每个季节30天
  const seasonIndex = Math.floor((day - 1) % (seasonLength * 4) / seasonLength)
  // 计算季节进度（0-100%）
  const seasonProgress = (((day - 1) % seasonLength) / seasonLength) * 100
  const seasons = [
    {
      name: '春季',
      icon: '🌱',
      progress: seasonProgress.toFixed(0)
    },
    {
      name: '夏季',
      icon: '☀️',
      progress: seasonProgress.toFixed(0)
    },
    {
      name: '秋季',
      icon: '🍂',
      progress: seasonProgress.toFixed(0)
    },
    {
      name: '冬季',
      icon: '❄️',
      progress: seasonProgress.toFixed(0)
    }
  ]
  // 使用ref记录上次处理的季节和天数
  const lastProcessed = ref({ day: 0, seasonIndex: -1 })
  if (day !== lastProcessed.value.day || seasonIndex !== lastProcessed.value.seasonIndex) {
    // 检测季节变化（只在真正变化时处理一次）
    const previousDay = day - 1
    const previousSeasonIndex = Math.floor((previousDay - 1) % (seasonLength * 4) / seasonLength)
    // 如果季节发生变化，添加事件日志
    if (seasonIndex !== previousSeasonIndex && day > 1) {
      const newSeason = seasons[seasonIndex]
      gameStore.addToEventLog(`季节变化：${newSeason.name}已经到来`)
      // 季节变化特殊事件
      if (seasonIndex === 0) { // 春季开始
        gameStore.addToEventLog('春回大地，植物开始萌发，草药更容易找到了')
      } else if (seasonIndex === 1) { // 夏季开始
        gameStore.addToEventLog('炎炎夏日，记得储备足够的水源')
      } else if (seasonIndex === 2) { // 秋季开始
        gameStore.addToEventLog('丰收的季节，食物采集效率提高了')
      } else if (seasonIndex === 3) { // 冬季开始
        gameStore.addToEventLog('寒冬将至，需要更多食物和燃料来度过严冬')
      }
    }
    // 更新记录
    lastProcessed.value = { day, seasonIndex }
  }
  return seasons[seasonIndex]
})
</script>

<template>
  <div class="time-control">
    <div class="time-display">
      <div class="day-display">
        <span class="day-number">第 {{ formattedGameTime.day }} 天</span>
        <div class="season-info">
          <div class="season-header">
            <span class="season-indicator">{{ currentSeason.icon }} {{ currentSeason.name }}</span>
          </div>
          <div class="season-progress-bar">
            <div class="progress-fill" :style="{ width: currentSeason.progress + '%' }"></div>
          </div>
        </div>
      </div>
      <div class="time-of-day">
        <span class="time">{{ formattedGameTime.time }}</span>
        <span class="period-indicator">{{ dayPeriod.icon }} {{ dayPeriod.name }}</span>
      </div>
    </div>
    <div class="time-scale-control">
      <span class="time-scale-label">时间流速:</span>
      <el-select v-model="currentTimeScale" size="small" :disabled="gameStore.gameState !== 'playing'">
        <el-option v-for="option in timeScaleOptions" :key="option.value" :label="option.label" :value="option.value" />
      </el-select>
    </div>
  </div>
</template>

<style scoped>
.time-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}

.time-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-display,
.time-of-day {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.day-number {
  font-weight: bold;
  font-size: 1.1em;
}

.time {
  font-weight: bold;
  font-size: 1.1em;
  text-align: center;
}

.season-indicator,
.period-indicator {
  font-size: 0.9em;
  color: var(--el-text-color-secondary);
}

.season-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.season-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.season-progress-bar {
  height: 4px;
  width: 100%;
  background-color: var(--el-border-color-lighter);
  border-radius: 2px;
  overflow: hidden;
  margin: 2px 0;
}

.progress-fill {
  height: 100%;
  background-color: var(--el-color-primary);
  border-radius: 2px;
}

.time-scale-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.time-scale-label {
  font-size: 0.9em;
  color: var(--el-text-color-secondary);
  width: 90px;
}
</style>