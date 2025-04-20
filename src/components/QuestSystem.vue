<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const gameStore = useGameStore()
// 当前活动标签页
const activeTab = ref('available')

// 任务列表
const questList = [
  {
    id: 'survival_basics',
    name: '生存基础',
    icon: '🏕️',
    description: '收集基本的生存资源，确保你能在这个荒野中生存下去。',
    difficulty: 1,
    objectives: {
      food: 20,
      water: 20,
      wood: 15
    },
    rewards: {
      exp: 30
    },
    timeLimit: null, // 无时间限制
    unlockRequirements: null // 无解锁要求
  },
  {
    id: 'shelter_building',
    name: '建造庇护所',
    icon: '🏠',
    description: '收集材料建造一个基本的庇护所，抵御恶劣天气。',
    difficulty: 2,
    objectives: {
      wood: 50,
      stone: 50,
      parts: 10,
      tools: 10
    },
    rewards: {
      exp: 50,
      maxHealth: 10,
      maxEnergy: 10
    },
    timeLimit: null,
    unlockRequirements: {
      days: 3,
      skills: { crafting: 2 }
    }
  },
  {
    id: 'medicinal_herbs',
    name: '药草收集',
    icon: '🌿',
    description: '收集各种药用植物，用于制作医疗物品。',
    difficulty: 2,
    objectives: {
      herb: 60,
      rare_herb: 30
    },
    rewards: {
      exp: 40,
      medicine: 2
    },
    timeLimit: 72, // 72小时内完成
    unlockRequirements: {
      days: 5,
      skills: { gathering: 2 }
    }
  },
  {
    id: 'tool_crafting',
    name: '工具制作',
    icon: '🔨',
    description: '制作基本工具，提高资源收集效率。',
    difficulty: 2,
    objectives: {
      tools: 20
    },
    rewards: {
      exp: 45
    },
    timeLimit: null,
    unlockRequirements: {
      skills: { crafting: 2 }
    }
  },
  {
    id: 'exploration_journey',
    name: '探索之旅',
    icon: '🧭',
    description: '探索周围的区域，寻找有用的资源和信息。',
    difficulty: 3,
    objectives: {
      crystal: 20 // 完成10次探索
    },
    rewards: {
      exp: 60,
      techFragment: 1,
      ancientRelic: 1
    },
    timeLimit: 120, // 120小时内完成
    unlockRequirements: {
      days: 7,
      skills: { survival: 3 }
    }
  },
  {
    id: 'ancient_technology',
    name: '古代科技',
    icon: '🔬',
    description: '收集古代科技碎片，研究先进技术。',
    difficulty: 4,
    objectives: {
      techFragment: 5,
      ancientRelic: 2
    },
    rewards: {
      exp: 100,
    },
    timeLimit: 240, // 240小时内完成
    unlockRequirements: {
      days: 15,
      skills: { research: 4 }
    }
  },
  {
    id: 'weather_station',
    name: '气象站建设',
    icon: '🌤️',
    description: '收集材料建造气象站，预测天气变化。',
    difficulty: 4,
    objectives: {
      metal: 50,
      electronic_components: 10,
      advanced_parts: 10
    },
    rewards: {
      exp: 120
    },
    timeLimit: 168, // 168小时内完成
    unlockRequirements: {
      days: 20,
      skills: { crafting: 5, research: 4 }
    }
  },
  {
    id: 'rare_resources',
    name: '稀有资源',
    icon: '💎',
    description: '收集稀有资源，用于高级制作。',
    difficulty: 3,
    objectives: {
      crystal: 10,
      rare_herb: 30,
      metal: 50
    },
    rewards: {
      exp: 80,
      advanced_parts: 2
    },
    timeLimit: 144, // 144小时内完成
    unlockRequirements: {
      days: 12,
      skills: { gathering: 4 }
    }
  },
  {
    id: 'communication_device',
    name: '通讯装置',
    icon: '📡',
    description: '建造通讯装置，尝试与外界取得联系。',
    difficulty: 5,
    objectives: {
      electronic_components: 10,
      crystal: 10,
      metal: 50
    },
    rewards: {
      exp: 150,
      techFragment: 1
    },
    timeLimit: 336, // 336小时内完成
    unlockRequirements: {
      days: 30,
      skills: { crafting: 5, research: 5 }
    }
  },
  {
    id: 'survival_master',
    name: '生存大师',
    icon: '👑',
    description: '证明你是真正的生存大师，完成一系列挑战。',
    difficulty: 5,
    objectives: {
      days: 120, // 生存60天
      completedQuests: 8 // 完成8个任务
    },
    rewards: {
      exp: 200,
      maxHealth: 20,
      maxEnergy: 20
    },
    timeLimit: null,
    unlockRequirements: {
      days: 45,
      skills: { survival: 5, crafting: 5, gathering: 5, research: 5, combat: 5 }
    }
  }
]

// 可用任务列表
const availableQuests = computed(() => {
  // 过滤出可用但未接受的任务
  return questList.filter(quest => {
    // 检查是否已接受或已完成
    const isActive = gameStore.activeQuests && gameStore.activeQuests.some(q => q.id === quest.id)
    const isCompleted = gameStore.completedQuests && gameStore.completedQuests.some(q => q.id === quest.id)
    if (isActive || isCompleted) return false
    // 检查解锁要求
    if (quest.unlockRequirements) {
      // 检查天数要求
      if (quest.unlockRequirements.days && gameStore.player.days < quest.unlockRequirements.days) return false
      // 检查技能要求
      if (quest.unlockRequirements.skills) {
        for (const [skill, level] of Object.entries(quest.unlockRequirements.skills)) {
          if (gameStore.newSkills[skill].level < level) return false
        }
      }
    }
    return true
  })
})

// 进行中的任务
const activeQuests = computed(() => {
  return gameStore.activeQuests || []
})

// 已完成的任务
const completedQuests = computed(() => {
  return gameStore.completedQuests || []
})

// 获取难度文本
const getDifficultyText = (difficulty) => {
  const difficultyTexts = {
    1: '简单',
    2: '普通',
    3: '困难',
    4: '挑战',
    5: '极限'
  }
  return difficultyTexts[difficulty] || '未知'
}

// 格式化时间限制
const formatTimeLimit = (hours) => {
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}天${remainingHours > 0 ? remainingHours + '小时' : ''}`
  }
  return `${hours}小时`
}

// 获取任务进度值
const getProgressValue = (quest, resource) => {
  // 根据不同的资源类型获取进度
  if (resource === 'explorationCompleted') return gameStore.player.explorationCompleted || 0
  else if (resource === 'days') return gameStore.player.days || 0
  else if (resource === 'completedQuests') return (gameStore.completedQuests || []).length
  else return gameStore.resources[resource] || 0
}

// 获取任务进度百分比
const getProgressPercentage = (quest, resource) => {
  const current = getProgressValue(quest, resource)
  const target = quest.objectives[resource]
  return Math.min(Math.floor((current / target) * 100), 100)
}

// 检查目标是否完成
const isObjectiveComplete = (quest, resource) => {
  return getProgressValue(quest, resource) >= quest.objectives[resource]
}

// 检查任务是否可以完成
const canCompleteQuest = (quest) => {
  // 检查所有目标是否都已完成
  for (const [resource, amount] of Object.entries(quest.objectives)) {
    if (getProgressValue(quest, resource) < amount) return false
  }
  return true
}

// 检查时间是否快要用完
const isTimeRunningOut = (quest) => {
  if (!quest.timeLimit || !quest.acceptedAt) return false
  const currentTime = gameStore.gameTime.timestamp
  const endTime = quest.acceptedAt + (quest.timeLimit * 60 * 60 * 1000) // 转换为毫秒
  const remainingTime = endTime - currentTime
  // 如果剩余时间少于总时间的20%，则返回true
  return remainingTime > 0 && remainingTime < (quest.timeLimit * 60 * 60 * 1000 * 0.2)
}

// 格式化剩余时间
const formatRemainingTime = (quest) => {
  if (!quest.timeLimit || !quest.acceptedAt) return '无限制'
  const currentTime = gameStore.gameTime.timestamp
  const endTime = quest.acceptedAt + (quest.timeLimit * 60 * 60 * 1000) // 转换为毫秒
  const remainingTime = endTime - currentTime
  if (remainingTime <= 0) return '已超时'
  // 转换为小时和分钟
  const hours = Math.floor(remainingTime / (60 * 60 * 1000))
  const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000))
  return `${hours}小时${minutes}分钟`
}

// 格式化完成时间
const formatCompletionTime = (timestamp) => {
  if (!timestamp) return '未知'
  const date = new Date(timestamp)
  const gameDay = Math.floor((timestamp - gameStore.gameTime.startTime) / (24 * 60 * 60 * 1000)) + 1
  return `第${gameDay}天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 接受任务
const acceptQuest = (quest) => {
  // 复制任务并添加接受时间
  const acceptedQuest = {
    ...quest,
    acceptedAt: gameStore.gameTime.timestamp
  }
  // 检查任务是否已经在进行中
  if (gameStore.activeQuests.some(q => q.id === quest.id)) {
    gameStore.addToEventLog(`任务 ${acceptedQuest.name} 已经在进行中`)
    return
  }
  // 检查任务是否已经完成
  if (gameStore.completedQuests.some(q => q.id === quest.id)) {
    gameStore.addToEventLog(`任务 ${acceptedQuest.name} 已经完成`)
    return
  }
  // 添加任务到进行中列表
  gameStore.activeQuests.push(acceptedQuest)
  gameStore.addToEventLog(`接受了任务: ${acceptedQuest.name}`)
}

// 完成任务
const completeQuest = (quest) => {
  if (!canCompleteQuest(quest)) {
    ElMessage.warning('任务目标尚未完成')
    return
  }
  // 添加完成时间
  const newCompletedQuest = {
    ...quest,
    completedAt: gameStore.gameTime.timestamp
  }
  // 查找任务在进行中列表的索引
  const questIndex = gameStore.activeQuests.findIndex(q => q.id === newCompletedQuest.id)
  if (questIndex === -1) {
    gameStore.addToEventLog(`任务 ${newCompletedQuest.name} 不在进行中`)
    return
  }
  // 检查资源要求
  for (const [resource, amount] of Object.entries(quest.objectives)) {
    gameStore.resources[resource] -= amount
  }
  // 从进行中列表移除任务
  const completedQuest = gameStore.activeQuests.splice(questIndex, 1)[0]
  // 添加到已完成列表
  gameStore.completedQuests.push(completedQuest)
  // 处理各种类型的奖励
  for (const [rewardType, amount] of Object.entries(completedQuest.rewards)) {
    switch (rewardType) {
      case 'exp':
        // 增加经验值
        gameStore.player.exp += amount
        break
      case 'maxHealth':
        // 增加最大健康
        gameStore.player.maxHealth += amount
        gameStore.player.health += amount
        break
      case 'maxEnergy':
        // 增加最大体力
        gameStore.player.maxEnergy += amount
        gameStore.player.energy += amount
        break
      default:
        // 如果是资源类型的奖励
        if (gameStore.resources.hasOwnProperty(rewardType)) gameStore.addResource(rewardType, amount)
        break
    }
  }
  gameStore.addToEventLog(`完成了任务: ${completedQuest.name}`)
}

// 放弃任务
const abandonQuest = (quest) => {
  ElMessageBox.confirm('确定要放弃这个任务吗？你将失去所有进度。', '放弃任务', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 查找任务在进行中列表的索引
    const questIndex = gameStore.activeQuests.findIndex(q => q.id === quest.id)
    if (questIndex === -1) {
      gameStore.addToEventLog(`任务 ${quest.name} 不在进行中`)
      return
    }
    // 从进行中列表移除任务
    gameStore.activeQuests.splice(questIndex, 1)
    gameStore.addToEventLog(`放弃了任务: ${quest.name}`)
  }).catch(() => { })
}
</script>

<template>
  <div class="quest-system">
    <div class="quest-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="可用任务" name="available">
          <div class="quest-list">
            <el-empty v-if="availableQuests.length === 0" description="暂无可用任务"></el-empty>
            <div v-else>
              <div v-for="quest in availableQuests" :key="quest.id" class="quest-card">
                <div class="quest-header">
                  <div class="quest-icon" :class="`quest-${quest.difficulty}`">{{ quest.icon }}</div>
                  <div class="quest-info">
                    <div class="quest-name">{{ quest.name }}</div>
                    <div class="quest-difficulty">难度: {{ getDifficultyText(quest.difficulty) }}</div>
                  </div>
                </div>
                <div class="quest-description">{{ quest.description }}</div>
                <div class="quest-objectives">
                  <div class="objectives-title">目标:</div>
                  <ul class="objectives-list">
                    <li v-for="(amount, resource) in quest.objectives" :key="resource">
                      {{ gameStore.getResourceName(resource) }}: {{ amount }}
                    </li>
                  </ul>
                </div>
                <div class="quest-rewards">
                  <div class="rewards-title">奖励:</div>
                  <ul class="rewards-list">
                    <li v-for="(amount, reward) in quest.rewards" :key="reward">
                      {{ gameStore.getResourceName(reward) }}: {{ amount }}
                    </li>
                  </ul>
                </div>
                <div class="quest-time-limit" v-if="quest.timeLimit">
                  时间限制: {{ formatTimeLimit(quest.timeLimit) }}
                </div>
                <el-button @click="acceptQuest(quest)" :disabled="gameStore.gameState !== 'playing'" type="primary"
                  size="small" class="accept-button">
                  接受任务
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="进行中" name="active">
          <div class="quest-list">
            <el-empty v-if="activeQuests.length === 0" description="暂无进行中的任务"></el-empty>
            <div v-else>
              <div v-for="quest in activeQuests" :key="quest.id" class="quest-card">
                <div class="quest-header">
                  <div class="quest-icon" :class="`quest-${quest.difficulty}`">{{ quest.icon }}</div>
                  <div class="quest-info">
                    <div class="quest-name">{{ quest.name }}</div>
                    <div class="quest-difficulty">难度: {{ getDifficultyText(quest.difficulty) }}</div>
                  </div>
                </div>
                <div class="quest-description">{{ quest.description }}</div>
                <div class="quest-progress">
                  <div class="progress-title">进度:</div>
                  <ul class="progress-list">
                    <li v-for="(amount, resource) in quest.objectives" :key="resource">
                      {{ gameStore.getResourceName(resource) }}:
                      <span class="progress-value">
                        {{ getProgressValue(quest, resource) }}/{{ amount }}
                      </span>
                      <el-progress :percentage="getProgressPercentage(quest, resource)"
                        :status="isObjectiveComplete(quest, resource) ? 'success' : ''"></el-progress>
                    </li>
                  </ul>
                </div>
                <div class="quest-rewards">
                  <div class="rewards-title">奖励:</div>
                  <ul class="rewards-list">
                    <li v-for="(amount, reward) in quest.rewards" :key="reward">
                      {{ gameStore.getResourceName(reward) }}: {{ amount }}
                    </li>
                  </ul>
                </div>
                <div class="quest-time-remaining" v-if="quest.timeLimit">
                  <div :class="{ 'time-warning': isTimeRunningOut(quest) }">
                    剩余时间: {{ formatRemainingTime(quest) }}
                  </div>
                </div>
                <el-button @click="completeQuest(quest)" type="success" size="small" class="complete-button"
                  :disabled="!canCompleteQuest(quest) || gameStore.gameState !== 'playing'">
                  完成任务
                </el-button>
                <el-button @click="abandonQuest(quest)" type="danger" size="small" class="abandon-button"
                  :disabled="gameStore.gameState !== 'playing'">
                  放弃任务
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="已完成" name="completed">
          <div class="quest-list">
            <el-empty v-if="completedQuests.length === 0" description="暂无已完成的任务"></el-empty>
            <div v-else>
              <div v-for="quest in completedQuests" :key="quest.id" class="quest-card completed-quest">
                <div class="quest-header">
                  <div class="quest-icon" :class="`quest-${quest.difficulty}`">{{ quest.icon }}</div>
                  <div class="quest-info">
                    <div class="quest-name">{{ quest.name }}</div>
                    <div class="quest-difficulty">难度: {{ getDifficultyText(quest.difficulty) }}</div>
                  </div>
                  <div class="completion-badge">已完成</div>
                </div>
                <div class="quest-description">{{ quest.description }}</div>
                <div class="quest-rewards">
                  <div class="rewards-title">获得奖励:</div>
                  <ul class="rewards-list">
                    <li v-for="(amount, reward) in quest.rewards" :key="reward">
                      {{ gameStore.getResourceName(reward) }}: {{ amount }}
                    </li>
                  </ul>
                </div>
                <div class="completion-time">
                  完成时间: {{ formatCompletionTime(quest.completedAt) }}
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.quest-system {
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.quest-tabs {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
  padding-right: 5px;
}

:deep(.el-tabs__nav) {
  width: 100%;
}

:deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
}

.quest-list {
  padding: 10px 0;
}

.quest-card {
  background-color: var(--el-bg-color);
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
}

.quest-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.quest-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.quest-icon {
  font-size: 1.8em;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 12px;
  background-color: var(--el-fill-color-light);
}

/* 任务难度图标样式 */
.quest-1 {
  background-color: rgba(103, 194, 58, 0.2);
  color: #67c23a;
}

.quest-2 {
  background-color: rgba(144, 147, 153, 0.2);
  color: #909399;
}

.quest-3 {
  background-color: rgba(230, 162, 60, 0.2);
  color: #e6a23c;
}

.quest-4 {
  background-color: rgba(245, 108, 108, 0.2);
  color: #f56c6c;
}

.quest-5 {
  background-color: rgba(121, 87, 213, 0.2);
  color: #7957d5;
}

.quest-info {
  flex: 1;
}

.quest-name {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 4px;
  color: var(--el-text-color-primary);
}

.quest-difficulty {
  font-size: 0.85em;
  color: var(--el-text-color-secondary);
}

.quest-description {
  margin-bottom: 12px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
  font-size: 0.95em;
}

.quest-objectives,
.quest-progress,
.quest-rewards {
  margin-bottom: 12px;
}

.objectives-title,
.progress-title,
.rewards-title {
  font-weight: bold;
  font-size: 0.9em;
  margin-bottom: 5px;
  color: var(--el-text-color-primary);
}

.objectives-list,
.progress-list,
.rewards-list {
  list-style: none;
  padding-left: 10px;
  margin: 0;
}

.objectives-list li,
.progress-list li,
.rewards-list li {
  margin-bottom: 5px;
  font-size: 0.9em;
  color: var(--el-text-color-regular);
}

.progress-value {
  font-weight: bold;
}

:deep(.el-progress) {
  margin-top: 3px;
  margin-bottom: 8px;
}

.quest-time-limit,
.quest-time-remaining {
  font-size: 0.9em;
  margin-bottom: 12px;
  color: var(--el-text-color-secondary);
}

.time-warning {
  color: var(--el-color-danger);
  font-weight: bold;
}

.accept-button,
.complete-button,
.abandon-button {
  margin-top: 5px;
}

.complete-button {
  margin-right: 10px;
}

.completed-quest {
  opacity: 0.8;
}

.completion-badge {
  background-color: var(--el-color-success);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  margin-left: auto;
}

.completion-time {
  font-size: 0.85em;
  color: var(--el-text-color-secondary);
  text-align: right;
  margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quest-card {
    padding: 12px;
  }

  .quest-icon {
    width: 35px;
    height: 35px;
    font-size: 1.5em;
  }

  .quest-name {
    font-size: 1em;
  }

  .quest-description {
    font-size: 0.9em;
  }
}
</style>