<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from './stores/gameStore'
import { buffLibrary, diceLibrary, achievementLibrary } from './plugins/buffLibrary'

const gameStore = useGameStore()

// UI状态
const showDiceSelector = ref(false)
const showMainGame = ref(false)
const showBuffSelection = ref(false)
const scoreCombinations = ref([])
const selectedBuffs = ref([])
const showRulesModal = ref(false)
const showAchievementsModal = ref(false)
const showSelectedBuffsModal = ref(false)
const achievements = ref([])

// 游戏状态
const availableDice = computed(() => {
  // 读取玩家当前拥有的骰子
  const ownedDice = gameStore.dices
  const defaultDice = Array(6).fill({ ...diceLibrary[0] })
  const playerDice = diceLibrary.filter(die => ownedDice.includes(die.id))
  return [...defaultDice, ...playerDice]
})
const selectedStartingDice = ref([])
const buffsSelected = ref(0)
const round = ref(1)
const turn = ref(1)
const totalScore = ref(0)
const roundScore = ref(0)
const maxRounds = ref(5)
const selectedDice = ref([])
const currentRollScore = ref(0)
const dice = ref([])
const buffs = ref([])
const maxBuffs = ref(4)
const sixCounter = ref(0)

// 计算属性
const canScore = computed(() => currentRollScore.value > 0 && dice.value.filter(d => d.selected && !d.used).length > 0)

// 初始化游戏
const initGame = () => {
  showDiceSelector.value = true
  showMainGame.value = false
  showBuffSelection.value = false
  selectedStartingDice.value = []
}

// 开始游戏
const startGame = () => {
  showDiceSelector.value = false
  showMainGame.value = true
  round.value = 1
  turn.value = 1
  totalScore.value = 0
  roundScore.value = 0
  startNewRound()
}

// 开始新一轮
const startNewRound = () => {
  turn.value = 1
  roundScore.value = 0
  dice.value = []
  selectedDice.value = []
  rollDice()
}

// 切换骰子选择状态
const toggleSelectDie = (id) => {
  const die = dice.value.find(d => d.id === id)
  if (die && !die.used) {
    die.selected = !die.selected
    calculatePossibleScores()
  }
}

// 计算可能的得分组合
const calculatePossibleScores = () => {
  const selectedValues = dice.value.filter(d => d.selected && !d.used).map(d => d.value)
  const remainingValues = dice.value.filter(d => !d.used && !d.selected).map(d => d.value)
  let score = 0
  let combinations = []
  // 应用抽骰子类增益
  if (buffs.value.some(b => b.effect === 'drawBonus')) {
    score += 100
    combinations.push('抽骰子奖励: 100分')
  }
  // 应用出示限制类增益
  if (buffs.value.some(b => b.effect === 'singleDouble')) {
    if (selectedValues.length > 1) {
      return { score: 0, combinations: ['每次最多只能出示一颗骰子'] }
    }
    score *= 2
    combinations.push('单骰出示奖励: 得分翻倍')
  }
  // 应用骰子变化类增益
  const transformedValues = selectedValues.map(value => {
    if (buffs.value.some(b => b.effect === 'twoToSix') && value === 2) return 6
    if (buffs.value.some(b => b.effect === 'threeToSix') && value === 3) return 6
    return value
  })
  // 计算组合得分类增益
  if (buffs.value.some(b => b.effect === 'evenCombo') && [2, 4, 6].every(v => transformedValues.includes(v))) {
    score += 800
    combinations.push('偶数组合2/4/6: 800分')
  }
  if (buffs.value.some(b => b.effect === 'oneFiveCombo') && transformedValues.includes(1) && transformedValues.includes(5)) {
    score += 300
    combinations.push('1和5组合: 300分')
  }
  // 计算连续出示类增益
  if (buffs.value.some(b => b.effect === 'tripleBonus') && turn.value % 3 === 0) {
    score *= 2
    combinations.push(`连续3次出示奖励: 得分翻倍`)
  }
  // 计算轮次相关增益
  if (buffs.value.some(b => b.effect === 'nextRoundBonus') && turn.value === 1) {
    score *= 2
    combinations.push('下一轮首次出示奖励: 得分翻倍')
  }
  if (buffs.value.some(b => b.effect === 'thirdTriple') && turn.value === 3) {
    score *= 3
    combinations.push('每轮第三次出示奖励: 得分3倍')
  }
  if (buffs.value.some(b => b.effect === 'lowScoreDouble') && roundScore.value <= 300) {
    score *= 2
    combinations.push('低分轮次奖励: 得分翻倍')
  }
  // 计算单骰得分
  transformedValues.forEach(value => {
    if (value === 1) {
      score += 25
      combinations.push('1点: 25分')
    } else if (value === 5 && buffs.value.some(b => b.effect === 'fivePoints')) {
      score += 50
      combinations.push('5点: 50分')
    } else if (value === 2 && buffs.value.some(b => b.effect === 'twoPoints')) {
      score += 50
      combinations.push('2点: 50分')
    } else if (value === 6) {
      score += 50
      combinations.push('6点: 50分')
      // 累计类增益计数
      if (buffs.value.some(b => b.effect === 'sixCounter')) {
        sixCounter.value++
      }
    }
  })
  // 计算累计类增益
  if (buffs.value.some(b => b.effect === 'sixCounter')) {
    const bonus = 15 * sixCounter.value
    score += bonus
    combinations.push(`累计6点骰子奖励: ${bonus}分`)
  }
  // 计算对子得分
  const counts = {}
  selectedValues.forEach(value => {
    counts[value] = (counts[value] || 0) + 1
  })
  for (const [value, count] of Object.entries(counts)) {
    const numValue = parseInt(value)
    if (count >= 3) {
      let pairScore = 0
      if (numValue === 1) pairScore = 100 * Math.pow(2, count - 3)
      else if (numValue === 2) pairScore = 150 * Math.pow(2, count - 3)
      else if (numValue === 3) pairScore = 200 * Math.pow(2, count - 3)
      else if (numValue === 4) pairScore = 250 * Math.pow(2, count - 3)
      else if (numValue === 5) pairScore = 300 * Math.pow(2, count - 3)
      else if (numValue === 6) pairScore = count === 6 ? 2800 : 350 * Math.pow(2, count - 3)
      score += pairScore
      combinations.push(`${value}点×${count}: ${pairScore}分`)
    }
  }
  // 计算顺子得分
  // 检查12345
  if ([1, 2, 3, 4, 5].every(v => selectedValues.includes(v))) {
    score += 1000
    combinations.push('顺子12345: 1000分')
  }
  // 检查23456
  if ([2, 3, 4, 5, 6].every(v => selectedValues.includes(v))) {
    score += 1500
    combinations.push('顺子23456: 1500分')
  }
  // 检查123456
  if ([1, 2, 3, 4, 5, 6].every(v => selectedValues.includes(v))) {
    score += 3000
    combinations.push('顺子123456: 3000分')
  }
  // 应用条件奖励类增益
  if (buffs.value.some(b => b.effect === 'oddBonus')) {
    const oddCount = transformedValues.filter(v => v % 2 === 1).length
    score += oddCount * 200
    if (oddCount > 0) combinations.push(`奇数骰子×${oddCount}: ${oddCount * 200}分`)
  }
  if (buffs.value.some(b => b.effect === 'evenBonus')) {
    const evenCount = transformedValues.filter(v => v % 2 === 0).length
    score += evenCount * 200
    if (evenCount > 0) combinations.push(`偶数骰子×${evenCount}: ${evenCount * 200}分`)
  }
  if (buffs.value.some(b => b.effect === 'roundMatch')) {
    const matchCount = transformedValues.filter(v => v === round.value).length
    score += matchCount * 500
    if (matchCount > 0) combinations.push(`轮次匹配骰子×${matchCount}: ${matchCount * 500}分`)
  }
  if (buffs.value.some(b => b.effect === 'leftoverOdd')) {
    const leftoverOddCount = remainingValues.filter(v => v % 2 === 1).length
    score += leftoverOddCount * 100
    if (leftoverOddCount > 0) combinations.push(`剩余奇数骰子×${leftoverOddCount}: ${leftoverOddCount * 100}分`)
  }
  if (buffs.value.some(b => b.effect === 'leftoverEven')) {
    const leftoverEvenCount = remainingValues.filter(v => v % 2 === 0).length
    score += leftoverEvenCount * 100
    if (leftoverEvenCount > 0) combinations.push(`剩余偶数骰子×${leftoverEvenCount}: ${leftoverEvenCount * 100}分`)
  }
  if (buffs.value.some(b => b.effect === 'emptyBonus') && remainingValues.length === 0) {
    score += 500
    combinations.push('无剩余骰子奖励: 500分')
  }
  if (buffs.value.some(b => b.effect === 'multiBonus') && selectedValues.length >= 3) {
    score += 500
    combinations.push('多骰出示奖励: 500分')
  }
  if (buffs.value.some(b => b.effect === 'sixChain') && selectedValues.length === 1 && selectedValues[0] === 6) {
    sixChainActive.value = true
    score += leftoverEvenCount * 100
    if (leftoverEvenCount > 0) combinations.push(`剩余偶数骰子×${leftoverEvenCount}: ${leftoverEvenCount * 100}分`)
  }
  if (buffs.value.some(b => b.effect === 'leftoverBonus')) {
    const leftoverCount = remainingValues.length
    score += leftoverCount * 50
    if (leftoverCount > 0) combinations.push(`剩余骰子×${leftoverCount}: ${leftoverCount * 50}分`)
  }
  if (buffs.value.some(b => b.effect === 'leftoverSix') && remainingValues.includes(6)) {
    score += 300
    combinations.push('剩余6点骰子: 300分')
  }
  if (buffs.value.some(b => b.effect === 'leftoverOne') && remainingValues.includes(1)) {
    score += 300
    combinations.push('剩余1点骰子: 300分')
  }
  if (buffs.value.some(b => b.effect === 'lateTurn') && turn.value >= 3) {
    score += 500
    combinations.push('回合≥3奖励: 500分')
  }
  currentRollScore.value = score
  scoreCombinations.value = combinations
}

// 切换初始骰子选择
const toggleStartingDie = (index) => {
  const selectedIndex = selectedStartingDice.value.indexOf(index)
  if (selectedIndex === -1) {
    if (selectedStartingDice.value.length < 6) {
      selectedStartingDice.value.push(index)
    }
  } else {
    selectedStartingDice.value.splice(selectedIndex, 1)
  }
}

// 掷骰子
const rollDice = () => {
  const diceCount = 6
  dice.value = []
  selectedDice.value = []
  currentRollScore.value = 0
  scoreCombinations.value = []
  // 从availableDice获取骰子数据
  const selectedDiceIndices = selectedStartingDice.value.slice(0, 6)
  for (let i = 0; i < diceCount; i++) {
    const dieIndex = selectedDiceIndices[i % selectedDiceIndices.length]
    const dieData = availableDice.value[dieIndex].data
    const randomValue = dieData[Math.floor(Math.random() * dieData.length)]
    dice.value.push({
      id: i,
      type: availableDice.value[dieIndex].type,
      value: randomValue,
      selected: false,
      used: false
    })
  }
  calculatePossibleScores()
}

// 计分继续本轮
const continueRound = () => {
  const selectedDiceData = dice.value.filter(d => d.selected && !d.used)
  // 更新连续出示记录
  const selectedValues = selectedDiceData.map(d => d.value)
  gameStore.consecutiveShows.push(selectedValues)
  // 保持最近5次记录
  if (gameStore.consecutiveShows.length > 5) {
    gameStore.consecutiveShows.shift()
  }
  // 标记已使用的骰子
  selectedDiceData.forEach(die => {
    die.used = true
    die.selected = false
  })
  roundScore.value += currentRollScore.value
  currentRollScore.value = 0
  scoreCombinations.value = []
  // 进入下一回合
  turn.value++
  // 检查是否还有骰子可以继续
  const remainingDice = dice.value.filter(d => !d.used)
  if (remainingDice.length === 0) {
    // 没有剩余骰子，重新获得6个骰子
    rollDice()
  } else {
    // 检查剩余骰子是否有得分可能
    const hasValidCombination = checkValidCombination(remainingDice.map(d => d.value))
    if (!hasValidCombination) {
      // 没有有效组合，结束本轮
      if (remainingDice.length > 0) {
        roundScore.value = 0
        alert('无可获得分数的骰子，本轮得分作废。')
      }
      endRound(false)
      return
    }
    // 继续本轮，自动进入下一回合
    rollDice()
  }
}

// 计分结束本轮
const endRound = (completed) => {
  if (completed) {
    roundScore.value += currentRollScore.value
    totalScore.value += roundScore.value
    if (roundScore.value > gameStore.maxRoundScore) gameStore.maxRoundScore = roundScore.value
  }
  turn.value = 1
  round.value++
  gameStore.round++
  showBuffSelection.value = false
  if (round.value > maxRounds.value) {
    // 检查终局奖励类增益
    if (buffs.value.some(b => b.effect === 'finalBonus') && roundScore.value >= 1500) {
      totalScore.value += 1000
      gameStore.maxScore = Math.max(gameStore.maxScore, totalScore.value)
    }
    if (buffs.value.some(b => b.effect === 'finalDouble') && roundScore.value >= 3000) {
      totalScore.value *= 2
      gameStore.maxScore = Math.max(gameStore.maxScore, totalScore.value)
    }
    // 确保最终分数大于记录的最大值时更新
    gameStore.maxScore = Math.max(gameStore.maxScore, totalScore.value)
    // 游戏结束
    alert(`游戏结束! 你的最终得分是: ${totalScore.value}`)
    initGame()
  } else {
    // 只在第2-5轮的第一回合显示增益选择
    if (round.value >= 2 && round.value <= 5 && turn.value === 1 && buffsSelected.value < maxBuffs.value) {
      // 显示增益选择
      showBuffSelection.value = true
      // 随机选择4个增益
      const shuffled = [...buffLibrary].sort(() => 0.5 - Math.random())
      selectedBuffs.value = shuffled.slice(0, 4)
    } else {
      // 直接开始新一轮
      startNewRound()
    }
  }
}

// 检查是否有有效得分组合
const checkValidCombination = (values) => {
  // 应用出示限制类增益
  if (buffs.value.some(b => b.effect === 'singleDouble')) {
    return values.length <= 1
  }
  // 检查单骰得分
  if (values.includes(1) || values.includes(6)) {
    return true
  }
  // 检查对子得分
  const counts = {}
  values.forEach(value => {
    counts[value] = (counts[value] || 0) + 1
  })
  for (const count of Object.values(counts)) {
    if (count >= 3) {
      return true
    }
  }
  // 检查顺子得分
  // 检查12345
  if ([1, 2, 3, 4, 5].every(v => values.includes(v))) {
    return true
  }
  // 检查23456
  if ([2, 3, 4, 5, 6].every(v => values.includes(v))) {
    return true
  }
  // 检查123456
  if ([1, 2, 3, 4, 5, 6].every(v => values.includes(v))) {
    return true
  }
  return false
}

// 选择增益
const selectBuff = (buff) => {
  buffs.value.push(buff)
  buffsSelected.value++
  showBuffSelection.value = false
  // 开始新一轮
  startNewRound()
}
// 检查成就条件
const checkAchievementCondition = (achievement) => {
  switch (achievement.id) {
    case 1: return gameStore.consecutiveShows.some(arr => arr.filter(v => v === 1).length >= 3)
    case 2: return gameStore.consecutiveShows.some(arr => arr.filter(v => v === 2).length >= 2)
    case 3: return gameStore.consecutiveShows.some(arr => arr.filter(v => v === 3).length >= 2)
    case 4: return gameStore.consecutiveShows.some(arr => arr.filter(v => v === 6).length >= 3)
    case 5: return gameStore.maxScore >= 5000
    case 6: return gameStore.maxRoundScore >= 1000
    default: return false
  }
}

// 解锁成就
const unlockAchievement = (achievement) => {
  if (gameStore.achievement.includes(achievement.id)) return
  gameStore.achievement.push(achievement.id)
  gameStore.dices.push(achievement.dice)
}

const clickQun = () => {
  alert('群号:920930589')
}

// 初始化
onMounted(() => {
  initGame()
})
</script>

<template>
  <div class="game-container">
    <div class="header-buttons">
      <button class="rules-btn" @click="showRulesModal = true">游戏规则</button>
      <template v-if="showMainGame">
        <button class="rules-btn" @click="showAchievementsModal = true">游戏成就</button>
        <button class="rules-btn" v-if="buffsSelected" @click="showSelectedBuffsModal = true">增益: {{ buffsSelected
        }}/4</button>
      </template>
      <template v-else>
        <button class="rules-btn" @click="clickQun">加入Q群</button>
        <a class="rules-btn" target="_blank" href="https://github.com/setube/vue-dice-puzzle">开源地址</a>
      </template>
    </div>
    <h1>掷骰迷局</h1>
    <div class="dice-selector" v-if="showDiceSelector">
      <h2>选择6个骰子开始游戏</h2>
      <div class="dice-pool">
        <div v-for="(die, index) in availableDice" :key="index" class="dice-option"
          :class="{ [`selected ${die.type}`]: selectedStartingDice.includes(index) }" @click="toggleStartingDie(index)">
          <div class="dice" data-value="6">
            <div :class="['dot', die.type]" v-for="item in 6" :key="item"></div>
          </div>
          <div class="desc">
            <div>{{ die.name }}</div>
            <div>{{ die.data }}</div>
          </div>
        </div>
      </div>
      <button style="width: 100%" :disabled="selectedStartingDice.length !== 6" @click="startGame">
        开始游戏
      </button>
    </div>
    <div class="main-game" v-if="showMainGame">
      <div class="round-info">
        <div>轮次: {{ round }}/5</div>
        <div>回合: {{ turn }}</div>
        <div>总分: {{ totalScore }}</div>
        <div>本轮得分: {{ roundScore }}</div>
      </div>
      <template v-if="!showBuffSelection">
        <div class="dice-container">
          <div v-for="die in dice" :key="die.id" class="dice" :data-value="die.value" :class="{
            selected: die.selected,
            used: die.used
          }" @click="!die.used && toggleSelectDie(die.id)">
            <div :class="['dot', die.type]" v-for="item in die.value" :key="item"></div>
          </div>
        </div>
        <!-- <div class="score-display" v-if="scoreCombinations.length">
        <h3>得分组合</h3>
        <div class="scoreCombinations">
          <span class="combo" v-for="(combo, index) in scoreCombinations" :key="index">
            {{ combo }}
          </span>
        </div>
        <h3>预计得分: {{ currentRollScore }}</h3>
      </div> -->
        <div class="score-display">
          <h3>预计得分: {{ currentRollScore }}</h3>
        </div>
        <div class="controls">
          <button :disabled="!canScore" @click="continueRound">
            计分继续本轮
          </button>
          <button :disabled="!canScore" @click="endRound(true)">
            计分结束本轮
          </button>
        </div>
      </template>
      <div class="buff-container" v-if="showBuffSelection">
        <h2>选择增益效果</h2>
        <div class="buff-options">
          <div v-for="buff in selectedBuffs" :key="buff.name" class="buff-option" @click="selectBuff(buff)">
            {{ buff.name }}
          </div>
        </div>
      </div>
    </div>
    <div class="modal-overlay" v-if="showRulesModal" @click="showRulesModal = false">
      <div class="modal-content" @click.stop>
        <h2>游戏规则</h2>
        <button class="close-btn" @click="showRulesModal = false">×</button>
        <div class="rules-section">
          <h3>游戏玩法</h3>
          <ol>
            <li><strong>选择骰子</strong>: 选择6个骰子开始游戏，某些骰子奇妙的特性，达成对应成就即可获得。</li>
            <li><strong>出示骰子得分</strong>: 选择构成得分组合的骰子并出示即可获得分数，出示的骰子将会消耗，未出示的骰子则会保留</li>
            <li><strong>计分并结束本轮</strong>: 出示骰子后可以选择记录本次分数并结束本轮，进入下一轮将重新获得6个骰子重新构建得分组合，5轮骰局后游戏结束</li>
            <li><strong>计分并继续本轮</strong>:
              <ul>
                <li>下一回合：出示骰子后可使用剩余骰子重新随机点数继续本轮游戏</li>
                <li>若重随后没有骰子可以得分，将失去本轮所有分数并结束本轮</li>
                <li>若没有剩余骰子可以重随将再次获得6个骰子继续本轮游戏</li>
              </ul>
            </li>
            <li><strong>骰局增益</strong>: 每轮骰局结束后将会随机抽取4个增益并选择1个，增益有各种奇特效果，甚至改变整局游戏的规则</li>
            <li><strong>达成成就</strong>: 成就奖励需要达成某些特定的条件才可获取，达成成就可获得各种特性的骰子，参与骰局并去赢得你的奖励吧。</li>
          </ol>
        </div>
        <div class="rules-section">
          <h3>基础得分规则</h3>
          <ul>
            <li><strong>单骰得分</strong>: 1点=25分, 6点=50分</li>
            <li><strong>对子得分</strong>:
              <ul>
                <li>1×3=100分, 2×3=150分, 3×3=200分</li>
                <li>4×3=250分, 5×3=300分, 6×3=350分</li>
                <li>6×6=2800分</li>
                <li>相同点数每增加一个，分数翻倍</li>
              </ul>
            </li>
            <li><strong>顺子得分</strong>: 12345=1000分, 23456=1500分, 123456=3000分</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="modal-overlay" v-if="showAchievementsModal" @click="showAchievementsModal = false">
      <div class="modal-content" @click.stop>
        <h2>成就</h2>
        <button class="close-btn" @click="showAchievementsModal = false">×</button>
        <div class="achievements-list">
          <div v-for="item in achievementLibrary" :key="item.id" class="achievement-item"
            :class="{ unlocked: gameStore.achievement.includes(item.id) }">
            <h3>{{ item.name }}</h3>
            <p>奖励: {{ item.reward }}</p>
            <p>骰子点数: {{ item.data }}</p>
            <button v-if="!gameStore.achievement.includes(item.id) && checkAchievementCondition(item)"
              @click="unlockAchievement(item)">
              领取奖励
            </button>
            <span v-else-if="gameStore.achievement.includes(item.id)">已领取</span>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-overlay" v-if="showSelectedBuffsModal" @click="showSelectedBuffsModal = false">
      <div class="modal-content" @click.stop>
        <h2>已选择增益效果</h2>
        <button class="close-btn" @click="showSelectedBuffsModal = false">×</button>
        <div class="selected-buffs-list">
          <div v-for="(buff, index) in buffs" :key="index" class="buff-item">
            <h3>{{ buff.name }}</h3>
            <p>{{ buff.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  font-family: 'Arial', sans-serif;
  background-color: #1a1a2e;
  color: #e6e6e6;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1,
h2,
h3 {
  color: #f5a623;
  text-align: center;
  margin-bottom: 15px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

::-webkit-scrollbar:horizontal {
  height: 6px
}

::-webkit-scrollbar-track {
  border-radius: 10px
}

::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all .2s ease-in-out
}

::-webkit-scrollbar-thumb:hover {
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.1);
}
</style>

<style scoped>
.game-container {
  padding: 25px;
}

.selected-buffs-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.buff-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.buff-item h3 {
  color: #f5a623;
  margin-bottom: 8px;
  font-size: 1.2rem;
}

.buff-item p {
  margin: 5px 0;
  color: #e6e6e6;
  font-size: 0.9rem;
}

.achievement-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  margin: 12px 0;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.achievement-item.unlocked {
  background: rgba(46, 204, 113, 0.2);
  border-color: #2ecc71;
}

.achievement-item h3 {
  color: #f5a623;
  margin-bottom: 8px;
}

.achievement-item p {
  margin: 5px 0;
}

.dice-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.dice {
  width: 50px;
  height: 50px;
  background: #a18b6d;
  border-radius: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  padding: 8px;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  align-self: center;
  justify-self: center;
  display: none;
}

.dot.normal {
  background: #e7e4d7;
}

.dot.three-three {
  background: #b62323;
}

.dot.four-four-three-three {
  background: #f9f505;
}

.dot.four-one-peak {
  background: #1949e6;
}


/* 1点 */
.dice[data-value="1"] .dot:nth-child(1) {
  display: block;
  grid-column: 2;
  grid-row: 2;
}

/* 2点 */
.dice[data-value="2"] .dot:nth-child(1) {
  display: block;
  grid-column: 1;
  grid-row: 1;
}

.dice[data-value="2"] .dot:nth-child(2) {
  display: block;
  grid-column: 3;
  grid-row: 3;
}

/* 3点 */
.dice[data-value="3"] .dot:nth-child(1) {
  display: block;
  grid-column: 1;
  grid-row: 1;
}

.dice[data-value="3"] .dot:nth-child(2) {
  display: block;
  grid-column: 2;
  grid-row: 2;
}

.dice[data-value="3"] .dot:nth-child(3) {
  display: block;
  grid-column: 3;
  grid-row: 3;
}

/* 4点 */
.dice[data-value="4"] .dot:nth-child(1) {
  display: block;
  grid-column: 1;
  grid-row: 1;
}

.dice[data-value="4"] .dot:nth-child(2) {
  display: block;
  grid-column: 3;
  grid-row: 1;
}

.dice[data-value="4"] .dot:nth-child(3) {
  display: block;
  grid-column: 1;
  grid-row: 3;
}

.dice[data-value="4"] .dot:nth-child(4) {
  display: block;
  grid-column: 3;
  grid-row: 3;
}

/* 5点 */
.dice[data-value="5"] .dot:nth-child(1) {
  display: block;
  grid-column: 1;
  grid-row: 1;
}

.dice[data-value="5"] .dot:nth-child(2) {
  display: block;
  grid-column: 3;
  grid-row: 1;
}

.dice[data-value="5"] .dot:nth-child(3) {
  display: block;
  grid-column: 2;
  grid-row: 2;
}

.dice[data-value="5"] .dot:nth-child(4) {
  display: block;
  grid-column: 1;
  grid-row: 3;
}

.dice[data-value="5"] .dot:nth-child(5) {
  display: block;
  grid-column: 3;
  grid-row: 3;
}

/* 6点 */
.dice[data-value="6"] .dot:nth-child(1) {
  display: block;
  grid-column: 1;
  grid-row: 1;
}

.dice[data-value="6"] .dot:nth-child(2) {
  display: block;
  grid-column: 3;
  grid-row: 1;
}

.dice[data-value="6"] .dot:nth-child(3) {
  display: block;
  grid-column: 1;
  grid-row: 2;
}

.dice[data-value="6"] .dot:nth-child(4) {
  display: block;
  grid-column: 3;
  grid-row: 2;
}

.dice[data-value="6"] .dot:nth-child(5) {
  display: block;
  grid-column: 1;
  grid-row: 3;
}

.dice[data-value="6"] .dot:nth-child(6) {
  display: block;
  grid-column: 3;
  grid-row: 3;
}

.dice.selected {
  background: linear-gradient(145deg, #f5a623, #f0932b);
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
  color: white;
}

.dice.used {
  opacity: 0.4;
  background: #7f8c8d;
  transform: scale(0.95);
}

.desc {
  text-align: center;
  margin-top: 5px;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
}

button {
  padding: 12px 25px;
  background: linear-gradient(to right, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
}

button:disabled {
  background: #95a5a6;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.score-display {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 10px;
  margin: 25px 0;
  border: 1px solid #2d4263;
}

.scoreCombinations {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.scoreCombinations .combo {
  width: 33%;
  text-align: center;
}

.round-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 25px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
}

@media screen and (max-width: 768px) {
  .round-info {
    grid-template-columns: repeat(2, 1fr);
  }
}

.round-info div {
  font-weight: bold;
  color: #f5a623;
}

.buff-container,
.dice-selector {
  padding: 20px;
  border-radius: 15px;
  margin-top: 25px;
}

.buff-option,
.dice-option {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  margin: 12px 0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dice-option.selected.normal {
  border: 1px solid #ffffff;
}

.dice-option.selected.three-three {
  border: 1px solid #b62323;
}

.dice-option.selected.four-four-three-three {
  border: 1px solid #f9f505;
}

.dice-option.selected.four-one-peak {
  border: 1px solid #1949e6;
}

.buff-option:hover,
.dice-option:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.dice-option.selected {
  transform: scale(1.02);
}

.dice-pool {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin: 20px 0;
  justify-content: center;
}

.dice-pool .dice {
  width: 50px;
  height: 50px;
  font-size: 20px;
  margin: 0 auto;
}

.buff-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #16213e;
  padding: 30px;
  border-radius: 15px;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  border: 2px solid #f5a623;
  box-shadow: 0 0 30px rgba(245, 166, 35, 0.3);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  color: #f5a623;
  cursor: pointer;
  padding: 5px 10px;
}

.rules-section {
  margin-bottom: 20px;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
}

.rules-section h3 {
  color: #f5a623;
  margin-top: 0;
  margin-bottom: 10px;
}

.rules-section ol,
.rules-section ul {
  padding-left: 20px;
}

.rules-section li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.header-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.rules-btn {
  padding: 8px 15px;
  background: linear-gradient(to right, #6a3093, #a044ff);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  text-decoration: none;
}

.rules-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>