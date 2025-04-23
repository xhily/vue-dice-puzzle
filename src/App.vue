<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from './stores/gameStore'
import { buffLibrary, diceLibrary, achievementLibrary, BUFF_TYPES } from './plugins/buffLibrary'

const gameStore = useGameStore()

// UI状态相关变量
const showDiceSelector = ref(false) // 是否显示骰子选择器界面
const showMainGame = ref(false) // 是否显示主游戏界面
const showBuffSelection = ref(false) // 是否显示增益选择界面
const selectedBuffs = ref([]) // 当前可选择的增益列表
const showRulesModal = ref(false) // 是否显示规则弹窗
const showAchievementsModal = ref(false) // 是否显示成就弹窗
const showSelectedBuffsModal = ref(false) // 是否显示已选增益弹窗
const debugBuffId = ref(null) // 当前测试的增益ID

// 游戏状态相关变量
const availableDice = computed(() => {
  // 读取玩家当前拥有的骰子
  const ownedDice = gameStore.dices // 玩家已解锁的骰子ID
  const defaultDice = Array(6).fill({ ...diceLibrary[0] }) // 默认骰子（普通骰子）
  const playerDice = diceLibrary.filter(die => ownedDice.includes(die.id)) // 玩家拥有的特殊骰子
  return [...defaultDice, ...playerDice] // 合并默认骰子和特殊骰子
})
const selectedStartingDice = ref([]) // 玩家选择的起始骰子索引
const buffsSelected = ref(0) // 当前已选择的增益数量
const round = ref(1) // 当前轮次(1-5)
const turn = ref(1) // 当前回合数
const totalScore = ref(0) // 游戏总分数
const roundScore = ref(0) // 当前轮次得分
const maxRounds = ref(5) // 最大轮次数
const selectedDice = ref([]) // 当前选中的骰子
const currentRollScore = ref(0) // 当前选择骰子组合的得分
const dice = ref([]) // 当前场上的骰子
const buffs = ref([]) // 当前已激活的增益效果

const maxBuffs = ref(4) // 最大可选增益数量
const sixCounter = ref(0) // 6点骰子计数器
const sixChainActive = ref(false) // 六链效果是否激活

// 添加一个新的状态变量来标记下一回合应用六链效果
const nextTurnSixChainActive = ref(false) // 下一回合是否应用六链效果

// 添加状态变量来跟踪六链是否已在当前轮次使用过
const sixChainUsedThisRound = ref(false) // 当前轮次是否已使用过六链效果

// 添加全局六链状态变量
const sixChainUsedInGame = ref(false) // 是否在当前游戏中已使用过六链效果

// 计算属性
const canScore = ref(false) // 当前选择是否可以得分
// 添加测试模式状态变量
const isTestMode = ref(false) // 是否处于测试模式
const testBuffId = ref(null) // 当前测试的增益ID
// 添加调试控制台状态
const showDebugConsole = ref(false)
const diceSetter = ref([1, 2, 3, 4, 5, 6]) // 骰子值
const isAdminTest = ref(false) // 是否处于管理员测试模式

const isValidSelection = (values) => {
  // 首先应用骰子变换增益
  let transformedValues = [...values]
  buffs.value.filter(buff => buff.type === BUFF_TYPES.DICE_TRANSFORM).forEach(buff => {
    transformedValues = transformedValues.map(value =>
      value === buff.params.fromValue ? buff.params.toValue : value
    )
  })
  // 检查单骰有效得分 - 使用变换后的值
  const isSingleDiceValid = (value) => {
    return (
      value === 1 ||
      value === 6 ||
      (value === 5 && buffs.value.some(b => b.type === BUFF_TYPES.SINGLE_DICE && b.params.diceValue === 5)) ||
      (value === 2 && buffs.value.some(b => b.type === BUFF_TYPES.SINGLE_DICE && b.params.diceValue === 2))
    )
  }
  // 检查对子得分 - 使用变换后的值
  const counts = {}
  transformedValues.forEach(value => {
    counts[value] = (counts[value] || 0) + 1
  })
  const hasValidPairs = Object.values(counts).some(count => count >= 3)
  // 检查顺子得分 - 使用变换后的值
  const has12345 = [1, 2, 3, 4, 5].every(v => transformedValues.includes(v))
  const has23456 = [2, 3, 4, 5, 6].every(v => transformedValues.includes(v))
  const has123456 = [1, 2, 3, 4, 5, 6].every(v => transformedValues.includes(v))
  // 检查是否每个骰子都是有效得分项
  const allDiceValid = computed(() => {
    // 如果是顺子，则所有骰子都有效
    if (has12345 || has23456 || has123456) {
      return true
    }
    // 如果有对子（三个或更多相同点数），则这些骰子都有效
    if (hasValidPairs) {
      // 找出所有构成对子的骰子值
      const pairValues = Object.entries(counts).filter(([_, count]) => count >= 3).map(([value, _]) => parseInt(value))
      // 检查每个骰子是否都是有效的单骰或者是对子的一部分
      return transformedValues.every(value => isSingleDiceValid(value) || pairValues.includes(value))
    }
    // 检查是否包含有效单骰和偶数组合
    const hasEvenComboSubset = (values) => {
      if (!buffs.value.some(b => b.type === BUFF_TYPES.COMBO && b.params.requiredValues && b.params.requiredValues.every(v => v % 2 === 0))) return false
      // 检查是否包含2,4,6
      return [2, 4, 6].every(v => values.includes(v));
    }
    // 检查是否有1-5组合增益
    const hasOneFiveCombo = buffs.value.some(b =>
      b.type === BUFF_TYPES.COMBO &&
      b.params.requiredValues &&
      b.params.requiredValues.length === 2 &&
      b.params.requiredValues.includes(1) &&
      b.params.requiredValues.includes(5)
    )
    // 检查1-5组合的骰子是否都有效
    if (hasOneFiveCombo && transformedValues.includes(1) && transformedValues.includes(5)) {
      // 在1-5组合中，所有的1和5都是有效的
      return transformedValues.every(value => value === 1 || value === 5 || isSingleDiceValid(value))
    }
    if (hasEvenComboSubset(transformedValues)) {
      // 找出所有非偶数组合的骰子
      const nonEvenComboDice = transformedValues.filter(v => v !== 2 && v !== 4 && v !== 6)
      // 检查非偶数组合的骰子是否都是有效单骰
      return nonEvenComboDice.every(isSingleDiceValid)
    }
    // 如果没有顺子、对子和偶数组合，则每个骰子都必须是有效的单骰
    return transformedValues.every(isSingleDiceValid)
  })

  // 检查偶数组合增益
  const hasEvenComboBuff = buffs.value.some(b =>
    b.type === BUFF_TYPES.COMBO &&
    b.params.requiredValues &&
    b.params.requiredValues.every(v => v % 2 === 0)
  )

  // 判断是否满足偶数组合增益
  const hasCompleteEvenCombo = hasEvenComboBuff && isCompleteEvenCombo(transformedValues);
  // 如果有完整的偶数组合，直接返回 true
  if (hasCompleteEvenCombo) {
    return true
  }
  // 检查是否有1-5组合增益
  const hasOneFiveCombo = buffs.value.some(b =>
    b.type === BUFF_TYPES.COMBO &&
    b.params.requiredValues &&
    b.params.requiredValues.length === 2 &&
    b.params.requiredValues.includes(1) &&
    b.params.requiredValues.includes(5)
  )
  // 判断是否满足1-5组合增益
  const hasValidOneFiveCombo = hasOneFiveCombo && canFormOneFiveCombo(transformedValues)
  // 输出调试信息
  // console.log(
  //   '检查选中的骰子组合是否有效:',
  //   transformedValues,
  //   'hasValidOneFiveCombo:',
  //   hasValidOneFiveCombo,
  //   'allDiceValid:',
  //   allDiceValid.value
  // )
  // 在检查最终有效性时考虑所有条件
  if (hasValidOneFiveCombo || hasCompleteEvenCombo || allDiceValid.value) {
    return true
  }
  return false
}

// 检查是否可以从骰子中提取1-5组合
const canFormOneFiveCombo = (values) => {
  // 必须只包含1和5，不能有其他骰子
  return values.includes(1) && values.includes(5) && values.every(v => v === 1 || v === 5)
}

// 检查完整的偶数组合 (2,4,6)，要求恰好只有这三个值
const isCompleteEvenCombo = (values) => {
  // 如果骰子数量不是3个，直接返回false
  if (values.length !== 3) {
    return false
  }
  const requiredValues = [2, 4, 6];
  let remainingValues = [...values]; // 复制一份用于操作
  for (const value of requiredValues) {
    const index = remainingValues.indexOf(value);
    if (index === -1) {
      return false // 如果找不到当前值，直接返回 false
    }
    remainingValues.splice(index, 1) // 找到后移除该值
  }
  // 如果remainingValues为空，说明恰好只有2,4,6三个值
  return remainingValues.length === 0 // 确保没有额外的骰子
}

// 初始化游戏
const initGame = () => {
  showDiceSelector.value = true
  showMainGame.value = false
  showBuffSelection.value = false
  // 判断是否新玩家
  if (gameStore.isNewPlayer) {
    showRulesModal.value = true
  }
  // 清空已选骰子
  selectedStartingDice.value = []
  // 清空已激活的增益
  buffs.value = []
  buffsSelected.value = 0
  // 自动选择最后6个骰子
  const availableDiceCount = availableDice.value.length
  // 如果所有骰子都解锁了, 自动开启测试模式
  if (availableDiceCount === 12) {
    isAdminTest.value = true
  }
  // 否则选择最后6个
  for (let i = availableDiceCount - 6; i < availableDiceCount; i++) {
    selectedStartingDice.value.push(i)
  }
}

// 开始游戏
const startGame = () => {
  showDiceSelector.value = false
  showMainGame.value = true
  round.value = 1
  turn.value = 1
  totalScore.value = 0
  roundScore.value = 0
  sixCounter.value = 0 // 重置6点计数器
  // 重置六链相关状态
  sixChainActive.value = false
  sixChainUsedThisRound.value = false
  nextTurnSixChainActive.value = false
  sixChainUsedInGame.value = false // 重置全局六链状态
  // 清空已激活的增益
  buffs.value = []
  buffsSelected.value = 0
  startNewRound()
}

// 开始新一轮
const startNewRound = () => {
  turn.value = 1
  roundScore.value = 0
  dice.value = []
  selectedDice.value = []
  currentRollScore.value = 0
  // 重置六链相关状态
  sixChainActive.value = false
  sixChainUsedThisRound.value = false
  rollDice()
  calculatePossibleScores()
}

// 切换骰子选择状态
const toggleSelectDie = (id) => {
  // 只保留基本的选择逻辑
  const die = dice.value.find(d => d.id === id)
  if (die && !die.used) {
    // 更改状态
    die.selected = !die.selected
    // 如果选中了骰子，并且有变换类buff，直接修改骰子值
    if (die.selected) {
      // 存储原始值用于显示变换效果
      die.originalValue = die.value
      // 应用二变六和三变六
      buffs.value.filter(buff => buff.type === BUFF_TYPES.DICE_TRANSFORM).forEach(buff => {
        if (die.value === buff.params.fromValue) {
          die.value = buff.params.toValue
        }
      })
    } else if (die.originalValue) {
      // 取消选择时恢复原始值
      die.value = die.originalValue
      delete die.originalValue
    }
    // 计算当前选择的得分情况
    calculatePossibleScores()
  }
}

// 计算可能的得分组合
const calculatePossibleScores = () => {
  const selectedDice = dice.value.filter(d => d.selected && !d.used)
  const selectedValues = selectedDice.map(d => d.value)
  const remainingValues = dice.value.filter(d => !d.used && !d.selected).map(d => d.value)

  // 如果没有选择骰子，直接返回
  if (selectedValues.length === 0) {
    currentRollScore.value = 0
    canScore.value = false
    return
  }

  // 应用骰子变换检查有效性
  const isValid = isValidSelection(selectedValues)

  // 输出调试信息
  // console.log('isValidSelection 结果:', isValid)

  if (!isValid) {
    currentRollScore.value = 0
    canScore.value = false
    return
  }

  // 检查是否有1-5组合增益
  const hasOneFiveCombo = buffs.value.some(b =>
    b.type === BUFF_TYPES.COMBO &&
    b.params.requiredValues &&
    b.params.requiredValues.length === 2 &&
    b.params.requiredValues.includes(1) &&
    b.params.requiredValues.includes(5)
  )

  // 检查是否有偶数组合增益
  const hasEvenCombo = buffs.value.some(b =>
    b.type === BUFF_TYPES.COMBO &&
    b.params.requiredValues &&
    b.params.requiredValues.every(v => v % 2 === 0)
  )

  // 如果满足1-5组合条件，并且只包含1和5
  const is15ComboOnly = hasOneFiveCombo &&
    selectedValues.includes(1) &&
    selectedValues.includes(5) &&
    selectedValues.every(v => v === 1 || v === 5)

  // 检查基础得分项 - 1点和6点
  const hasBasicScoringDice = selectedValues.some(v => v === 1 || v === 6)

  // 检查是否有有效单骰增益
  const hasSingleDiceBonus = selectedValues.some(v =>
    buffs.value.some(b => b.type === BUFF_TYPES.SINGLE_DICE && b.params.diceValue === v)
  )

  // 检查对子
  const hasPairs = (() => {
    const counts = {}
    selectedValues.forEach(v => counts[v] = (counts[v] || 0) + 1)
    return Object.values(counts).some(count => count >= 3)
  })()

  // 检查顺子
  const hasStraight =
    [1, 2, 3, 4, 5].every(v => selectedValues.includes(v)) ||
    [2, 3, 4, 5, 6].every(v => selectedValues.includes(v)) ||
    [1, 2, 3, 4, 5, 6].every(v => selectedValues.includes(v))

  // 检查偶数组合
  const hasCompleteEvenCombo = hasEvenCombo &&
    selectedValues.length === 3 &&
    [2, 4, 6].every(v => selectedValues.includes(v))

  // console.log('各项检查结果:', {
  //   is15ComboOnly,
  //   hasBasicScoringDice,
  //   hasSingleDiceBonus,
  //   hasPairs,
  //   hasStraight,
  //   hasCompleteEvenCombo
  // })

  // 如果满足任一条件，直接计算分数
  if (is15ComboOnly || hasBasicScoringDice || hasSingleDiceBonus || hasPairs || hasStraight || hasCompleteEvenCombo) {
    const result = calculateScore(selectedValues, remainingValues)
    currentRollScore.value = result
    canScore.value = result > 0
    return
  }

  // 如果不满足上述条件，检查每个骰子是否都有贡献分数
  // 这部分可能导致问题，先注释掉
  /*
  let allDiceContribute = true
  // 遍历每个选中的骰子，测试其贡献
  for (let i = 0; i < selectedDice.length; i++) {
    // 创建一个不包含当前骰子的副本
    const valuesWithoutCurrent = [...selectedValues]
    valuesWithoutCurrent.splice(i, 1)
    
    // 如果除去这个骰子，其他骰子组合仍然有效
    if (valuesWithoutCurrent.length > 0 && isValidSelection(valuesWithoutCurrent)) {
      // 计算完整选择和移除一个骰子后的分数
      const fullResult = calculateScore(selectedValues, remainingValues)
      const reducedResult = calculateScore(valuesWithoutCurrent, remainingValues)
      
      // 如果移除骰子后分数没有变化，说明该骰子不贡献分数
      if (fullResult <= reducedResult) {
        allDiceContribute = false
        break
      }
    }
  }
  */

  // 简化处理：直接认为已通过 isValidSelection 的组合是有效的
  const result = calculateScore(selectedValues, remainingValues)
  currentRollScore.value = result
  canScore.value = result > 0
}

// 辅助函数：计算选中骰子的得分
const calculateScore = (selectedValues, remainingValues) => {
  let score = 0
  let singleDieMultiplier = 1
  let turnBasedMultiplier = 1
  let roundBasedMultiplier = 1
  // 初始骰子值（可能会被变换）
  let transformedValues = [...selectedValues]
  // 创建计数对象用于对子计算
  const counts = {}
  transformedValues.forEach(value => {
    counts[value] = (counts[value] || 0) + 1
  })
  // 记录buff乘数，但先不应用
  // 仅记录单骰双倍乘数
  const selectionBuffs = buffs.value.filter(buff => buff.type === BUFF_TYPES.SELECTION)
  for (const buff of selectionBuffs) {
    // 最小选择奖励
    if (buff.params.minSelection && selectedValues.length >= buff.params.minSelection) {
      score += buff.params.bonusPoints || 0
    }
    // 单骰子出示奖励 - 只记录乘数，稍后应用
    if (buff.params.multiplier && buff.params.multiplier > 1 && selectedValues.length === 1) {
      const singleDie = selectedValues[0]
      const isValidSingle = singleDie === 1 || singleDie === 6 ||
        (singleDie === 5 && buffs.value.some(b => b.type === BUFF_TYPES.SINGLE_DICE && b.params.diceValue === 5)) ||
        (singleDie === 2 && buffs.value.some(b => b.type === BUFF_TYPES.SINGLE_DICE && b.params.diceValue === 2))
      if (isValidSingle) {
        singleDieMultiplier = buff.params.multiplier
      }
    }
  }
  // 应用抽骰子类增益
  buffs.value.filter(buff => buff.type === BUFF_TYPES.DRAW).forEach(buff => {
    score += buff.params.bonusPoints
  })
  // 应用组合得分类增益
  buffs.value.filter(buff => buff.type === BUFF_TYPES.COMBO).forEach(buff => {
    // 检查是否有单骰子限制
    const hasSingleDiceLimit = buffs.value.some(b =>
      b.type === BUFF_TYPES.SELECTION && b.params.maxSelection === 1
    )
    // 如果有单骰子限制，则特殊处理
    if (hasSingleDiceLimit) {
      // 如果只选了一个骰子，且该骰子是组合中的一部分，也给予部分奖励
      if (transformedValues.length === 1 && buff.params.requiredValues.includes(transformedValues[0])) {
        // 给予部分奖励（例如，每个匹配的骰子给予组合奖励的一部分）
        const partialBonus = Math.floor(buff.params.bonusPoints / buff.params.requiredValues.length)
        score += partialBonus
      }
    }
    // 标准处理：完整组合时给予全部奖励
    else if (buff.params.requiredValues.every(v => transformedValues.includes(v))) {
      score += buff.params.bonusPoints
    }
    // 检查是否是偶数组合增益
    if (buff.params.requiredValues &&
      buff.params.requiredValues.every(v => v % 2 === 0)) {
      // 检查是否恰好是完整的2,4,6组合（只有这三个值）
      const isExactEvenCombo = transformedValues.length === 3 &&
        transformedValues.includes(2) &&
        transformedValues.includes(4) &&
        transformedValues.includes(6) &&
        transformedValues.every(v => [2, 4, 6].includes(v));
      if (isExactEvenCombo) {
        score += 800  // 偶数组合的固定分数
      }
    }
  })
  // 计算单骰得分
  transformedValues.forEach(value => {
    if (value === 1) {
      score += 25
    } else if (value === 6) {
      score += 50
    }
    // 注意：此处不需要给2和5添加基础分，因为它们会在下面的单骰增益中处理
  })
  // 处理单骰子得分增益
  buffs.value.filter(buff => buff.type === BUFF_TYPES.SINGLE_DICE).forEach(buff => {
    const matchingDice = transformedValues.filter(v => v === buff.params.diceValue)
    if (matchingDice.length > 0) {
      // 确保每个匹配的骰子都获得额外分数
      const additionalPoints = matchingDice.length * buff.params.bonusPoints
      console.log(`单骰增益得分: ${buff.params.diceValue}点 × ${matchingDice.length} = ${additionalPoints}分`)
      score += additionalPoints
    }
  })
  // 计算对子得分
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
    }
  }
  // 计算顺子得分 - 修改为只取最高分
  if ([1, 2, 3, 4, 5, 6].every(v => transformedValues.includes(v))) {
    // 如果有123456，只计算这个最高分
    score += 3000
  } else if ([2, 3, 4, 5, 6].every(v => transformedValues.includes(v))) {
    // 如果有23456，只计算这个
    score += 1500
  } else if ([1, 2, 3, 4, 5].every(v => transformedValues.includes(v))) {
    // 如果有12345，只计算这个
    score += 1000
  }
  // 应用条件性奖励（包括偶数奖励）
  buffs.value.filter(buff => buff.type === BUFF_TYPES.CONDITIONAL).forEach(buff => {
    // 奇数/偶数骰子奖励
    if (buff.params.valueCondition) {
      let matchingDice = []
      if (buff.params.valueCondition === 'odd') {
        matchingDice = transformedValues.filter(v => v % 2 === 1)
        if (matchingDice.length > 0 && buff.params.bonusPerDie) {
          const bonusPoints = matchingDice.length * buff.params.bonusPerDie
          score += bonusPoints
        }
      }
      else if (buff.params.valueCondition === 'even') {
        // 找出所有偶数骰子
        const evenDice = transformedValues.filter(v => v % 2 === 0)
        if (evenDice.length > 0) {
          // 检查每个偶数骰子是否有分数贡献
          let validEvenDiceCount = 0
          evenDice.forEach(value => {
            // 检查这个骰子是否有分数贡献
            const isValidSingle = value === 6  // 6点本身有分数
            const isPartOfPair = counts[value] >= 3  // 是否是对子的一部分
            const isPartOfStraight =
              ([1, 2, 3, 4, 5].every(v => transformedValues.includes(v)) && value <= 5) || // 12345
              ([2, 3, 4, 5, 6].every(v => transformedValues.includes(v)) && value >= 2) || // 23456
              ([1, 2, 3, 4, 5, 6].every(v => transformedValues.includes(v)))  // 123456
            const isPartOfEvenCombo = [2, 4, 6].every(v => transformedValues.includes(v)) &&
              [2, 4, 6].includes(value)  // 是否是偶数组合的一部分

            if (isValidSingle || isPartOfPair || isPartOfStraight || isPartOfEvenCombo) {
              validEvenDiceCount++
            }
          })

          // 只为有效的偶数骰子添加额外分数
          if (validEvenDiceCount > 0) {
            score += validEvenDiceCount * 200
          }
        }
      }
    }
  })
  // 应用剩余骰子类增益
  buffs.value.filter(buff => buff.type === BUFF_TYPES.LEFTOVER).forEach(buff => {
    // 空骰子条件
    if (buff.params.condition === 'empty' && remainingValues.length === 0) {
      score += buff.params.bonusPoints
    }
    // 特定点数条件
    else if (buff.params.requiredValue && remainingValues.includes(buff.params.requiredValue)) {
      score += buff.params.bonusPoints
    }
    // 奇偶数条件
    else if (buff.params.valueCondition) {
      let matchingDice = []
      if (buff.params.valueCondition === 'odd') {
        matchingDice = remainingValues.filter(v => v % 2 === 1)
      } else if (buff.params.valueCondition === 'even') {
        matchingDice = remainingValues.filter(v => v % 2 === 0)
      }
      if (matchingDice.length > 0) {
        const additionalPoints = matchingDice.length * buff.params.pointsPerDie
        score += additionalPoints
      }
    }
    // 每个剩余骰子奖励
    else if (buff.params.pointsPerDie && remainingValues.length > 0) {
      const additionalPoints = remainingValues.length * buff.params.pointsPerDie
      score += additionalPoints
    }
  })
  // 应用计数器类增益
  buffs.value.filter(buff => buff.type === BUFF_TYPES.COUNTER).forEach(buff => {
    if (buff.id === 9) { // 6点计数器
      const matchingDice = transformedValues.filter(v => v === buff.params.diceValue)
      if (matchingDice.length > 0) {
        const bonusPoints = sixCounter.value * buff.params.pointsPerCount || 15
        score += bonusPoints
      }
    }
  })
  // 应用回合相关增益
  buffs.value.filter(buff => buff.type === BUFF_TYPES.TURN_BASED).forEach(buff => {
    // 特定回合数奖励
    if (buff.params.turnNumber && round.value === buff.params.turnNumber && score > 0) {
      if (buff.params.multiplier) {
        turnBasedMultiplier *= buff.params.multiplier
      } else if (buff.params.bonusPoints) {
        score += buff.params.bonusPoints
      }
    }
    // 回合数取模奖励
    if (buff.params.turnMod && turn.value % buff.params.turnMod === 0) {
      // 检查是否满足连续出示同一个骰子的条件
      const recentShows = gameStore.consecutiveShows.slice(-buff.params.turnMod)
      let hasConsecutiveDice = false
      if (recentShows.length === buff.params.turnMod) {
        // 检查最近三次出示中每次是否都有相同点数的骰子
        for (let value = 1; value <= 6; value++) {
          // 检查每个点数是否在所有记录中都出现
          if (recentShows.every(show => show.includes(value))) {
            hasConsecutiveDice = true
            break
          }
        }
      }
      // 只有当分数大于0且满足连续条件时才应用乘数
      if (hasConsecutiveDice && buff.params.multiplier && score > 0) {
        turnBasedMultiplier *= buff.params.multiplier
      }
    }
    // 添加新的单骰子连续出示检查
    if (buff.params.turnMod && buff.params.requireSingleDice) {
      // 获取最近三次出示记录
      const recentShows = gameStore.consecutiveShows.slice(-buff.params.turnMod)
      // 检查是否都是单骰子出示
      const isAllSingleDice = recentShows.every(show => show.length === 1)
      // 如果当前也是单骰子出示，且已经有两次单骰子记录
      if (isAllSingleDice &&
        selectedValues.length === 1 &&
        recentShows.length === buff.params.turnMod - 1) {
        // 应用分数翻倍
        score *= buff.params.singleDiceMultiplier
      }
    }
  })
  // 应用轮次相关增益
  buffs.value.filter(buff => buff.type === BUFF_TYPES.ROUND_BASED).forEach(buff => {
    // 首回合奖励
    if (buff.params.roundCondition === 'first' && turn.value === 1 && score > 0) {
      roundBasedMultiplier *= buff.params.multiplier || 1
    }
    // 低分奖励
    if (buff.params.maxRoundScore && roundScore.value <= buff.params.maxRoundScore && score > 0) {
      roundBasedMultiplier *= buff.params.multiplier || 1
    }
  })
  // 应用所有乘数
  if (score > 0) {
    // 应用所有乘数
    score *= singleDieMultiplier * turnBasedMultiplier * roundBasedMultiplier
  }
  // 添加新的六链效果逻辑
  // 如果当前回合六链效果处于激活状态，计算额外得分
  if (sixChainActive.value) {
    const evenDice = transformedValues.filter(v => v % 2 === 0)
    if (evenDice.length > 0) {
      // 查找六链buff以获取额外分数值
      const sixChainBuff = buffs.value.find(b => b.type === BUFF_TYPES.CONDITIONAL && b.params.chainEffect)
      if (sixChainBuff) {
        const bonusPerEven = sixChainBuff.params.bonusPerEven || 300
        const chainBonus = evenDice.length * bonusPerEven
        score += chainBonus
      }
    }
  }
  return score
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
  // 从availableDice获取骰子数据
  const selectedDiceIndices = selectedStartingDice.value.slice(0, 6)
  // 检查是否有偶数抽取buff
  const hasEvenDrawBuff = buffs.value.some(
    buff => buff.type === BUFF_TYPES.CONDITIONAL &&
      buff.params.specialEffect === 'draw'
  )
  // 只在每轮第一个回合确保有得分点
  if (turn.value === 1) {
    let hasValidCombination = false
    let attempts = 0
    const maxAttempts = 10
    do {
      dice.value = []
      for (let i = 0; i < diceCount; i++) {
        const dieIndex = selectedDiceIndices[i % selectedDiceIndices.length]
        const dieData = availableDice.value[dieIndex].data
        let randomValue = dieData[Math.floor(Math.random() * dieData.length)]
        // 如果是第一回合且有偶数抽取buff，确保骰子是偶数
        if (hasEvenDrawBuff && turn.value === 1 && randomValue % 2 === 1) {
          // 随机修改为2,4,6中的一个
          const evenValues = [2, 4, 6]
          randomValue = evenValues[Math.floor(Math.random() * evenValues.length)]
        }
        dice.value.push({
          id: i,
          type: availableDice.value[dieIndex].type,
          value: randomValue,
          selected: false,
          used: false
        })
      }
      // 检查是否有有效组合
      hasValidCombination = checkValidCombination(dice.value.map(d => d.value))
      attempts++
      // 如果尝试次数过多，强制生成一个有效骰子
      if (attempts >= maxAttempts && !hasValidCombination) {
        if (hasEvenDrawBuff) {
          dice.value[0].value = 2 // 有偶数抽取buff时使用2点
        } else {
          dice.value[0].value = 1 // 否则使用1点
        }
        hasValidCombination = true
      }
    } while (!hasValidCombination && attempts < maxAttempts)
  } else {
    // 非第一个回合
    for (let i = 0; i < diceCount; i++) {
      const dieIndex = selectedDiceIndices[i % selectedDiceIndices.length]
      const dieData = availableDice.value[dieIndex].data
      let randomValue = dieData[Math.floor(Math.random() * dieData.length)]
      // 非第一回合不应用偶数抽取效果
      dice.value.push({
        id: i,
        type: availableDice.value[dieIndex].type,
        value: randomValue,
        selected: false,
        used: false
      })
    }
  }
  calculatePossibleScores()
}

// 计分继续本轮
const continueRound = () => {
  const selectedDiceData = dice.value.filter(d => d.selected && !d.used)
  // 更新连续出示记录
  const selectedValues = selectedDiceData.map(d => d.value)
  // 添加 6 点计数器逻辑
  if (buffs.value.some(b => b.type === BUFF_TYPES.COUNTER && b.id === 9)) {
    const sixCount = selectedValues.filter(v => v === 6).length
    if (sixCount > 0) {
      sixCounter.value += sixCount
    }
  }
  // 检查是否应该在下一回合激活六链效果
  // 条件：只选择了一个骰子，且是6点，且有六链buff，且整个游戏未使用过六链效果
  const isSixChainActivator = selectedValues.length === 1 &&
    selectedValues[0] === 6 &&
    buffs.value.some(b => b.type === BUFF_TYPES.CONDITIONAL && b.params.chainEffect) &&
    !sixChainUsedInGame.value // 修改这里，使用全局状态
  // 如果满足条件，设置下一回合激活六链
  if (isSixChainActivator) {
    nextTurnSixChainActive.value = true
    // 标记已在当前轮次和整个游戏中使用过六链激活
    sixChainUsedThisRound.value = true
    // 新增：标记整个游戏中已使用过六链
    sixChainUsedInGame.value = true
  }
  // 检查当前回合是否应用六链效果
  if (sixChainActive.value) {
    // 计算偶数骰子数量
    const evenDiceCount = selectedValues.filter(v => v % 2 === 0).length
    if (evenDiceCount > 0) {
      // 应用六链效果
      const chainBonus = evenDiceCount * 300
      currentRollScore.value += chainBonus
    }
    // 使用后效果结束
    sixChainActive.value = false
  }
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
  // 进入下一回合前，检查是否应该激活六链效果
  if (nextTurnSixChainActive.value) {
    sixChainActive.value = true
    nextTurnSixChainActive.value = false
  }
  // 进入下一回合
  turn.value++
  // 检查是否还有骰子可以继续
  const remainingDice = dice.value.filter(d => !d.used)
  if (remainingDice.length === 0) {
    // 没有剩余骰子，重新获得6个骰子
    rollDice()
    // 检查新掷出的骰子是否有得分可能
    const hasValidCombination = checkValidCombination(dice.value.map(d => d.value))
    if (!hasValidCombination) {
      // 没有有效组合，结束本轮
      roundScore.value = 0
      alert('重新获得骰子后无可获得分数的组合，本轮得分作废。')
      endRound(false)
      return
    }
  } else {
    // 使用剩余骰子重新随机点数
    for (let die of remainingDice) {
      const dieIndex = selectedStartingDice.value[die.id % selectedStartingDice.value.length]
      const dieData = availableDice.value[dieIndex].data
      die.value = dieData[Math.floor(Math.random() * dieData.length)]
      die.selected = false
    }
    // 检查剩余骰子是否有得分可能
    const hasValidCombination = checkValidCombination(remainingDice.map(d => d.value))
    if (!hasValidCombination) {
      // 没有有效组合，结束本轮
      roundScore.value = 0
      alert('无可获得分数的骰子，本轮得分作废。')
      endRound(false)
      return
    }
  }
  // 重置选择状态
  currentRollScore.value = 0
  calculatePossibleScores()
}

// 计分结束本轮
const endRound = (completed) => {
  const selectedDiceData = dice.value.filter(d => d.selected && !d.used)
  const selectedValues = selectedDiceData.map(d => d.value)
  // 添加 6 点计数器逻辑
  if (completed && buffs.value.some(b => b.type === BUFF_TYPES.COUNTER && b.id === 9)) {
    const sixCount = selectedValues.filter(v => v === 6).length
    if (sixCount > 0) {
      sixCounter.value += sixCount
    }
  }
  // 检查是否应该在下一轮激活六链效果
  // 仅当整个游戏未使用过六链效果时才检查
  if (!sixChainUsedInGame.value) { // 修改这里，使用全局状态
    const isSixChainActivator = selectedValues.length === 1 &&
      selectedValues[0] === 6 &&
      buffs.value.some(b => b.type === BUFF_TYPES.CONDITIONAL && b.params.chainEffect)
    // 如果即将结束本轮且满足激活条件
    if (isSixChainActivator) {
      nextTurnSixChainActive.value = true
      // 标记已在当前轮次和整个游戏中使用过六链激活
      sixChainUsedThisRound.value = true
      // 标记整个游戏中已使用过六链
      sixChainUsedInGame.value = true
    }
  }
  // 检查当前回合是否应用六链效果
  if (sixChainActive.value && completed && !sixChainUsedThisRound.value) {
    // 计算偶数骰子数量
    const evenDiceCount = selectedValues.filter(v => v % 2 === 0).length
    if (evenDiceCount > 0) {
      // 应用六链效果
      const chainBonus = evenDiceCount * 300
      currentRollScore.value += chainBonus
    }
    // 使用后效果结束
    sixChainActive.value = false
  }
  // 重置六链状态
  sixChainActive.value = false
  if (completed) {
    roundScore.value += currentRollScore.value
    totalScore.value += roundScore.value
    gameStore.maxRoundScore = Math.max(gameStore.maxRoundScore, roundScore.value)
  }
  turn.value = 1
  round.value++
  gameStore.round++
  // 每轮结束时重置六链使用状态
  sixChainUsedThisRound.value = false
  if (round.value > maxRounds.value) {
    // 应用终局奖励
    totalScore.value = applyFinalBonuses()
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
      // 过滤掉已选择的增益和相同类型的增益
      const availableBuffs = buffLibrary.filter(buff =>
        !buffs.value.some(selectedBuff => selectedBuff.id === buff.id || selectedBuff.type === buff.type)
      )
      // 随机选择4个未选择过的增益
      const shuffled = [...availableBuffs].sort(() => 0.5 - Math.random())
      // 使用Set去重，确保增益不重复
      const uniqueBuffs = []
      const usedTypes = new Set()
      for (const buff of shuffled) {
        if (!usedTypes.has(buff.id)) {
          uniqueBuffs.push(buff)
          usedTypes.add(buff.id)
          if (uniqueBuffs.length === 4) break
        }
      }
      selectedBuffs.value = uniqueBuffs.slice(0, 4)
    } else {
      // 直接开始新一轮
      startNewRound()
    }
  }
}

// 检查是否有有效得分组合
const checkValidCombination = (values) => {
  // 应用骰子变换增益
  let transformedValues = [...values]
  buffs.value.filter(buff => buff.type === BUFF_TYPES.DICE_TRANSFORM).forEach(buff => {
    transformedValues = transformedValues.map(value =>
      value === buff.params.fromValue ? buff.params.toValue : value
    )
  })
  // 应用出示限制类增益
  if (buffs.value.some(b => b.type === BUFF_TYPES.SELECTION && b.params.maxSelection === 1)) {
    return values.length <= 1
  }
  // 检查单骰得分 - 使用变换后的值
  if (transformedValues.includes(1) || transformedValues.includes(6) ||
    (transformedValues.includes(5) && buffs.value.some(b => b.type === BUFF_TYPES.SINGLE_DICE && b.params.diceValue === 5)) ||
    (transformedValues.includes(2) && buffs.value.some(b => b.type === BUFF_TYPES.SINGLE_DICE && b.params.diceValue === 2))) {
    return true
  }
  // 检查对子得分 - 使用变换后的值
  const counts = {}
  transformedValues.forEach(value => {
    counts[value] = (counts[value] || 0) + 1
  })
  for (const count of Object.values(counts)) {
    if (count >= 3) return true
  }
  // 检查顺子得分 - 使用变换后的值
  if ([1, 2, 3, 4, 5].every(v => transformedValues.includes(v)) ||
    [2, 3, 4, 5, 6].every(v => transformedValues.includes(v)) ||
    [1, 2, 3, 4, 5, 6].every(v => transformedValues.includes(v))) {
    return true
  }
  return false
}

// 选择增益
const selectBuff = (buff) => {
  // buff: 选择的增益对象
  // 确保buff对象包含必要的属性
  if (!buff.type || !buff.params) {
    console.error('无效的buff对象:', buff)
    return
  }
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
    case 5: return totalScore.value >= 5000
    case 6: return roundScore.value >= 5000
    default: return false
  }
}

// 打开游戏规则弹窗
const openRulesModal = () => {
  showRulesModal.value = !showRulesModal.value
  if (gameStore.isNewPlayer) {
    gameStore.isNewPlayer = false
  }
}

// 解锁成就
const unlockAchievement = (achievement) => {
  if (gameStore.achievement.includes(achievement.id)) return
  gameStore.achievement.push(achievement.id)
  gameStore.dices.push(achievement.dice)
}

// Q群按钮点击
const clickQun = () => {
  alert('群号:920930589')
}

// 终局奖励逻辑
const applyFinalBonuses = () => {
  let finalScore = totalScore.value
  let bonusMessages = []
  // 按顺序应用增益
  const finalBuffs = buffs.value.filter(buff => buff.type === BUFF_TYPES.FINAL)
  // 先应用加分类增益
  finalBuffs.filter(buff => buff.params.bonusPoints).forEach(buff => {
    if (roundScore.value >= buff.params.threshold) {
      finalScore += buff.params.bonusPoints
      bonusMessages.push(`终局奖励: ${totalScore.value}分+${buff.params.bonusPoints}分=${finalScore}分`)
    }
  })
  // 再应用乘数类增益
  finalBuffs.filter(buff => buff.params.multiplier).forEach(buff => {
    if (roundScore.value >= buff.params.threshold) {
      const beforeMultiply = finalScore
      finalScore *= buff.params.multiplier
      bonusMessages.push(`终局奖励: ${beforeMultiply}分×${buff.params.multiplier}=${finalScore}分`)
    }
  })
  if (bonusMessages.length > 0) {
    alert(`获得终局奖励!\n${bonusMessages.join('\n')}\n最终得分: ${finalScore}分`)
  }
  return finalScore
}

// 六链状态
const getSixChainStatus = () => {
  if (sixChainActive.value) {
    return '本回合六链效果已激活 (每个偶数骰子+300分)'
  } else if (nextTurnSixChainActive.value) {
    return '六链效果已激活 (下一回合生效)'
  } else if (sixChainUsedInGame.value) {
    return '六链效果已使用 (本局游戏中)'
  }
  return null
}

// 在游戏界面顶部添加测试模式按钮
const toggleTestMode = () => {
  isTestMode.value = !isTestMode.value
  if (!isTestMode.value) {
    // 退出测试模式时清空测试增益
    buffs.value = []
    buffsSelected.value = 0
  }
  // 重置游戏
  initGame()
  startGame()
}

// 选择特定增益进行测试
const selectBuffForTest = (buffId) => {
  testBuffId.value = buffId
  // 清除当前所有增益
  buffs.value = []
  // 添加选中的测试增益
  const buffToTest = buffLibrary.find(buff => buff.id === buffId)
  if (buffToTest) {
    buffs.value.push(buffToTest)
    buffsSelected.value = 1
  }
  // 投掷骰子
  rollDice()
}

// 通过控制台直接添加增益
const addBuffFromConsole = (buffId) => {
  const buffToAdd = buffLibrary.find(buff => buff.id === buffId)
  if (buffToAdd) {
    buffs.value.push(buffToAdd)
    buffsSelected.value++
  }
}

// 设置指定点数的骰子
const setDiceValues = () => {
  if (!diceSetter.value || diceSetter.value.length > 6) return
  for (let i = 0; i < Math.min(diceSetter.value.length, dice.value.length); i++) {
    if (diceSetter.value[i] >= 1 && diceSetter.value[i] <= 6) {
      dice.value[i].value = diceSetter.value[i]
    }
  }
  calculatePossibleScores()
}

// 重置增益
const resetBuffs = () => {
  buffs.value = []
  buffsSelected.value = 0
}

// 初始化
onMounted(() => {
  initGame()

  // 检查window对象上是否已经存在isAdminTest属性
  if (!Object.getOwnPropertyDescriptor(window, 'isAdminTest')) {
    Object.defineProperty(window, 'isAdminTest', {
      get() {
        return isAdminTest.value
      },
      set(newValue) {
        isAdminTest.value = newValue
        if (newValue) {
          toggleTestMode()
        }
      }
    })
  }
})
</script>
<template>
  <div class="game-container">
    <div class="header-buttons">
      <button class="rules-btn" @click="openRulesModal">游戏规则</button>
      <button class="test-btn" v-if="isAdminTest" @click="toggleTestMode">
        {{ isTestMode ? '退出测试' : '增益测试' }}
      </button>
      <template v-if="showMainGame">
        <button class="rules-btn" @click="showAchievementsModal = true">游戏成就</button>
        <button class="rules-btn" v-if="buffsSelected" @click="showSelectedBuffsModal = true">增益: {{ buffsSelected
          }}/4</button>
      </template>
      <template v-else-if="!showMainGame && !gameStore.isNewPlayer">
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
        <!-- 修改六链状态显示 -->
        <div v-if="getSixChainStatus()" class="chain-status">
          {{ getSixChainStatus() }}
        </div>
      </div>
      <template v-if="!showBuffSelection">
        <div class="dice-container">
          <div v-for="die in dice" :key="die.id" class="dice" :data-value="die.value" :class="{
            selected: die.selected,
            used: die.used,
            transformed: die.originalValue && die.value !== die.originalValue
          }" @click="!die.used && toggleSelectDie(die.id)">
            <div :class="['dot', die.type]" v-for="item in die.value" :key="item"></div>
            <span v-if="die.originalValue && die.value !== die.originalValue" class="transform-indicator">
              {{ die.originalValue }} → {{ die.value }}
            </span>
          </div>
        </div>
        <div class="score-display">
          <h3 v-if="canScore">预计得分: {{ currentRollScore }}</h3>
          <h3 v-else-if="dice.filter(d => d.selected && !d.used).length > 0" style="color: #e74c3c;">
            无效的骰子组合或包含不贡献分数的骰子
          </h3>
          <h3 v-else>请选择骰子</h3>
        </div>
        <div class="controls">
          <button :disabled="!canScore" @click="continueRound">
            计分继续本轮
          </button>
          <button :disabled="!canScore" @click="endRound(true)">
            计分结束本轮
          </button>
          <button @click="initGame">
            重新开始游戏
          </button>
        </div>
      </template>
      <div class="buff-container" v-if="showBuffSelection">
        <h2>选择增益效果</h2>
        <div class="buff-options">
          <div v-for="buff in selectedBuffs" :key="buff.name" class="buff-option" @click="selectBuff(buff)">
            <p>{{ buff.name }}</p>
            <p>{{ buff.description }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-overlay" v-if="showRulesModal" @click="openRulesModal">
      <div class="modal-content" @click.stop>
        <h2>游戏规则</h2>
        <button class="close-btn" @click="openRulesModal">×</button>
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
            <p v-if="item.id === 5">条件: 单局游戏总分达到5000分 (当前: {{ totalScore }})</p>
            <p v-else-if="item.id === 6">条件: 单轮得分达到5000分 (当前: {{ roundScore }})</p>
            <button v-if="!gameStore.achievement.includes(item.id) && checkAchievementCondition(item)"
              @click="unlockAchievement(item)">
              领取奖励
            </button>
            <button v-else-if="gameStore.achievement.includes(item.id)" disabled>已领取</button>
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
    <div class="test-mode-panel" v-if="isTestMode">
      <h2>增益测试模式</h2>
      <div class="buff-test-list">
        <div v-for="buff in buffLibrary" :key="buff.id" class="buff-test-item"
          :class="{ active: testBuffId === buff.id }" @click="selectBuffForTest(buff.id)">
          <p>{{ buff.name }}</p>
          <p>{{ buff.description }}</p>
        </div>
      </div>
    </div>
    <div class="debug-console" v-if="showDebugConsole">
      <div class="console-header">
        <h3>调试控制台</h3>
        <button @click="showDebugConsole = false">关闭</button>
      </div>
      <div class="console-body">
        <div class="command-section">
          <h4>当前增益</h4>
          <ul>
            <li v-for="(buff, index) in buffs" :key="index">
              {{ buff.id }}: {{ buff.name }}
            </li>
          </ul>
          <button @click="resetBuffs()">重置增益</button>
        </div>
        <div class="command-section">
          <h4>添加增益</h4>
          <select v-model="debugBuffId">
            <option v-for="buff in buffLibrary" :key="buff.id" :value="buff.id">
              {{ buff.id }}: {{ buff.name }}
            </option>
          </select>
          <button @click="addBuffFromConsole(debugBuffId)">添加</button>
        </div>
        <div class="command-section">
          <h4>设置骰子</h4>
          <div class="dice-setter">
            <input v-for="(value, index) in diceSetter" :key="index" type="number" min="1" max="6"
              v-model.number="diceSetter[index]" class="dice-input">
            <button style="margin-top: 10px" @click="setDiceValues">设置骰子</button>
          </div>
        </div>
      </div>
    </div>
    <button class="debug-btn" @click="showDebugConsole = !showDebugConsole" v-if="isTestMode">
      调试控制台
    </button>
  </div>
</template>
<style>
body {
  font-family: "Arial", sans-serif;
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
  height: 6px;
}

::-webkit-scrollbar-track {
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.2s ease-in-out;
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
  text-align: center;
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

.achievements-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 20px;
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
}

.achievement-item p {
  margin: 8px 0;
  color: #e6e6e6;
  font-size: 0.95rem;
  line-height: 1.5;
}

.dice-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
  padding: 20px 0;
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
  padding: 8px 15px;
  background: linear-gradient(to right, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s;
}

button:disabled {
  background: #95a5a6;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

button:hover {
  transform: translateY(-2px);
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

.dice-selector {
  padding: 0;
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

.buff-option {
  text-align: center;
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
  top: 15px;
  right: 15px;
  background: rgba(245, 166, 35, 0.2);
  border: 1px solid #f5a623;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 18px;
  color: #f5a623;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(245, 166, 35, 0.3);
  transform: none;
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
  padding-left: 25px;
}

.rules-section li {
  margin-bottom: 12px;
  line-height: 1.6;
  position: relative;
  padding-left: 10px;
}

.header-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.rules-btn,
.test-btn {
  padding: 8px 15px;
  background: linear-gradient(to right, #6a3093, #a044ff);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  text-decoration: none;
  margin-left: 10px;
}

.test-btn {
  background: linear-gradient(to right, #e74c3c, #c0392b);
}

.debug-console {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.9);
  color: #e6e6e6;
  z-index: 1100;
  height: 300px;
  font-family: "Consolas", monospace;
  border-top: 2px solid #f5a623;
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.3);
}

.console-header {
  position: sticky;
  top: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  border-bottom: 1px solid #f5a623;
  z-index: 1;
}

.console-body {
  overflow-y: auto;
  height: calc(100% - 60px);
}

.console-header h3 {
  color: #f5a623;
  margin: 0;
  font-size: 1.2rem;
}

.console-header button {
  padding: 5px 15px;
  background: #e74c3c;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.dice-input {
  width: 40px;
  height: 30px;
  background: #333;
  color: white;
  border-radius: 4px;
  margin-right: 8px;
  text-align: center;
  padding: 0 5px;
  border: 1px solid #2ecc71;
}

.dice-input:focus {
  outline: none;
  border-color: #f5a623;
}

select {
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 5px 10px;
  margin-right: 10px;
  min-width: 200px;
}

.debug-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(to right, #e74c3c, #c0392b);
  z-index: 1000;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* 测试模式样式 */
.test-mode-panel {
  background-color: rgba(0, 0, 0, 0.8);
  border: 1px solid #e74c3c;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.buff-test-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.buff-test-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 8px;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.buff-test-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.buff-test-item.active {
  background: rgba(231, 76, 60, 0.3);
  border: 1px solid #e74c3c;
}

.command-section {
  margin-bottom: 15px;
  padding: 10px 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  text-align: center;
}

.command-section li {
  list-style: none;
}

.command-section h4 {
  color: #2ecc71;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1rem;
}

.transform-indicator {
  font-size: 0.8em;
  color: #f5a623;
  margin-left: 5px;
}

.dice.transformed {
  background: linear-gradient(145deg, #a18b6d, #d4af37);
}

.transform-indicator {
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 10px;
  color: #f5a623;
  border-radius: 8px;
  padding: 2px;
}

/* 添加六链效果激活状态样式 */
.chain-active {
  color: #f1c40f;
  font-weight: bold;
  background-color: rgba(241, 196, 15, 0.2);
  border-radius: 5px;
  padding: 5px;
  animation: pulse 1.5s infinite;
  grid-column: 1 / -1;
  /* 让状态指示横跨整行 */
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.6;
  }
}

.chain-used {
  color: #95a5a6;
  font-style: italic;
  background-color: rgba(149, 165, 166, 0.2);
  border-radius: 5px;
  padding: 5px;
  grid-column: 1 / -1;
}

.chain-status {
  color: #f1c40f;
  font-weight: bold;
  background-color: rgba(241, 196, 15, 0.2);
  border-radius: 5px;
  padding: 5px;
  animation: pulse 1.5s infinite;
  grid-column: 1 / -1;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.6;
  }
}
</style>