export const achievements = [
  {
    id: 'first_day',
    name: '新的开始',
    description: '在这个世界生存了一天',
    icon: '🌅',
    condition: (store) => store.player.days >= 1,
    reward: { exp: 10 },
    unlocked: false
  },
  {
    id: 'week_survivor',
    name: '一周生存者',
    description: '在这个世界生存了7天',
    icon: '📅',
    condition: (store) => store.player.days >= 7,
    reward: { exp: 30 },
    unlocked: false
  },
  {
    id: 'month_survivor',
    name: '月度生存者',
    description: '在这个世界生存了30天',
    icon: '🗓️',
    condition: (store) => store.player.days >= 30,
    reward: { exp: 100 },
    unlocked: false
  },
  {
    id: 'season_cycle',
    name: '四季循环',
    description: '经历了1个完整的四季循环',
    icon: '🔄',
    condition: (store) => store.player.days >= 120,
    reward: { exp: 200 },
    unlocked: false
  },
  {
    id: 'season_cycle-2',
    name: '四季循环-2',
    description: '经历了2个完整的四季循环',
    icon: '🔄',
    condition: (store) => store.player.days >= 240,
    reward: { exp: 200 },
    unlocked: false
  },
  {
    id: 'season_cycle-3',
    name: '四季循环-3',
    description: '经历了3个完整的四季循环',
    icon: '🔄',
    condition: (store) => store.player.days >= 360,
    reward: { exp: 200 },
    unlocked: false
  },
  {
    id: 'resource_collector',
    name: '资源收集者',
    description: '累计收集超过100单位的基础资源',
    icon: '📦',
    condition: (store) => {
      const basicResources = ['food', 'water', 'wood', 'stone']
      return basicResources.reduce((sum, res) => sum + store.resources[res], 0) >= 100
    },
    reward: { exp: 50 },
    unlocked: false
  },
  {
    id: 'resource_collector-2',
    name: '资源收集者-2',
    description: '累计收集超过200单位的基础资源',
    icon: '📦',
    condition: (store) => {
      const basicResources = ['food', 'water', 'wood', 'stone']
      return basicResources.reduce((sum, res) => sum + store.resources[res], 0) >= 200
    },
    reward: { exp: 50 },
    unlocked: false
  },
  {
    id: 'resource_collector-3',
    name: '资源收集者-3',
    description: '累计收集超过300单位的基础资源',
    icon: '📦',
    condition: (store) => {
      const basicResources = ['food', 'water', 'wood', 'stone']
      return basicResources.reduce((sum, res) => sum + store.resources[res], 0) >= 300
    },
    reward: { exp: 50 },
    unlocked: false
  },
  {
    id: 'master_gatherer',
    name: '采集大师',
    description: '采集技能达到5级',
    icon: '🧺',
    condition: (store) => store.newSkills.gathering.level >= 5,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_gatherer-2',
    name: '采集大师-2',
    description: '采集技能达到20级',
    icon: '🧺',
    condition: (store) => store.newSkills.gathering.level >= 20,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_gatherer-3',
    name: '采集大师-3',
    description: '采集技能达到50级',
    icon: '🧺',
    condition: (store) => store.newSkills.gathering.level >= 50,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_crafter',
    name: '制作大师',
    description: '制作技能达到5级',
    icon: '🔨',
    condition: (store) => store.newSkills.crafting.level >= 5,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_crafter-2',
    name: '制作大师-2',
    description: '制作技能达到20级',
    icon: '🔨',
    condition: (store) => store.newSkills.crafting.level >= 20,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_crafter-3',
    name: '制作大师-3',
    description: '制作技能达到50级',
    icon: '🔨',
    condition: (store) => store.newSkills.crafting.level >= 50,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_survivor',
    name: '生存大师',
    description: '生存技能达到5级',
    icon: '🏕️',
    condition: (store) => store.newSkills.survival.level >= 5,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_survivor-2',
    name: '生存大师-2',
    description: '生存技能达到20级',
    icon: '🏕️',
    condition: (store) => store.newSkills.survival.level >= 20,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_survivor-3',
    name: '生存大师-3',
    description: '生存技能达到50级',
    icon: '🏕️',
    condition: (store) => store.newSkills.survival.level >= 50,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_researcher',
    name: '研究大师',
    description: '研究技能达到5级',
    icon: '🔬',
    condition: (store) => store.newSkills.research.level >= 5,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_researcher-2',
    name: '研究大师-2',
    description: '研究技能达到20级',
    icon: '🔬',
    condition: (store) => store.newSkills.research.level >= 20,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'master_researcher-3',
    name: '研究大师-3',
    description: '研究技能达到50级',
    icon: '🔬',
    condition: (store) => store.newSkills.research.level >= 50,
    reward: { exp: 80 },
    unlocked: false
  },
  {
    id: 'tech_enthusiast',
    name: '科技爱好者',
    description: '解锁10项科技',
    icon: '💡',
    condition: (store) => store.researched.length >= 10,
    reward: { exp: 100 },
    unlocked: false
  },
  {
    id: 'builder',
    name: '建设者',
    description: '建造3座建筑',
    icon: '🏗️',
    condition: (store) => store.buildings.length >= 3,
    reward: { exp: 70 },
    unlocked: false
  },
  {
    id: 'builder-2',
    name: '建设者-2',
    description: '建造5座建筑',
    icon: '🏗️',
    condition: (store) => store.buildings.length >= 5,
    reward: { exp: 70 },
    unlocked: false
  },
  {
    id: 'explorer',
    name: '探险家',
    description: '完成100次探索活动',
    icon: '🧭',
    condition: (store) => store.player.explorationCount >= 100,
    reward: { exp: 90 },
    unlocked: false
  },
  {
    id: 'explorer-2',
    name: '探险家-2',
    description: '完成500次探索活动',
    icon: '🧭',
    condition: (store) => store.player.explorationCount >= 500,
    reward: { exp: 90 },
    unlocked: false
  },
  {
    id: 'explorer-3',
    name: '探险家-3',
    description: '完成1000次探索活动',
    icon: '🧭',
    condition: (store) => store.player.explorationCount >= 1000,
    reward: { exp: 90 },
    unlocked: false
  },
  {
    id: 'relic_hunter',
    name: '遗物猎人',
    description: '收集3个古代遗物',
    icon: '🏺',
    condition: (store) => store.resources.ancientRelic >= 3,
    reward: { exp: 120 },
    unlocked: false
  },
  {
    id: 'weather_survivor',
    name: '气象生存者',
    description: '在极端天气中生存',
    icon: '⛈️',
    condition: (store) => store.achievements.extremeWeatherSurvived,
    reward: { exp: 60 },
    unlocked: false
  },
  {
    id: 'healthy_survivor',
    name: '健康生存者-1',
    description: '保持健康在90%以上连续7天',
    icon: '❤️',
    condition: (store) => store.achievements.healthyDays >= 7,
    reward: { exp: 70 },
    unlocked: false
  },
  {
    id: 'healthy_survivor_2',
    name: '健康生存者-2',
    description: '保持健康在90%以上连续30天',
    icon: '❤️',
    condition: (store) => store.achievements.healthyDays >= 30,
    reward: { exp: 70 },
    unlocked: false
  },
  {
    id: 'healthy_survivor_3',
    name: '健康生存者-3',
    description: '四季循环中持续保持健康在90%以上',
    icon: '❤️',
    condition: (store) => store.achievements.healthyDays >= 120,
    reward: { exp: 70 },
    unlocked: false
  }
]