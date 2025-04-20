// 定义buff类型常量
const BUFF_TYPES = {
  SINGLE_DICE: 'singleDice',     // 单骰子得分增益
  DICE_TRANSFORM: 'transform',   // 骰子点数转换
  COMBO: 'combo',                // 特殊组合增益
  TURN_BASED: 'turnBased',       // 回合相关增益
  ROUND_BASED: 'roundBased',     // 轮次相关增益
  LEFTOVER: 'leftover',          // 剩余骰子相关增益
  SELECTION: 'selection',        // 选择限制/奖励
  COUNTER: 'counter',            // 计数累积类
  FINAL: 'final',                // 终局奖励
  DRAW: 'draw',                  // 抽骰子奖励
  CONDITIONAL: 'conditional'     // 条件性奖励
}

const buffLibrary = [
  // 单骰子得分增益
  {
    id: 1,
    name: '五点得分',
    type: BUFF_TYPES.SINGLE_DICE,
    description: '可出示点数5的骰子得50分',
    params: {
      diceValue: 5,
      bonusPoints: 50,
    }
  },
  {
    id: 2,
    name: '二点得分',
    type: BUFF_TYPES.SINGLE_DICE,
    description: '可出示点数2的骰子得50分',
    params: {
      diceValue: 2,
      bonusPoints: 50,
    }
  },
  // 骰子变换类增益
  {
    id: 3,
    name: '二变六',
    type: BUFF_TYPES.DICE_TRANSFORM,
    description: '本局游戏点数为2的骰子选中后将变为点数为6的骰子',
    params: {
      fromValue: 2,
      toValue: 6
    }
  },
  {
    id: 4,
    name: '三变六',
    type: BUFF_TYPES.DICE_TRANSFORM,
    description: '本局游戏点数为3的骰子选中后将变为点数为6的骰子',
    params: {
      fromValue: 3,
      toValue: 6
    }
  },
  // 组合得分类增益
  {
    id: 5,
    name: '偶数组合',
    type: BUFF_TYPES.COMBO,
    description: '点数为2、4、6的骰子可以组合出示，得800分',
    params: {
      requiredValues: [2, 4, 6],
      bonusPoints: 800
    }
  },
  {
    id: 6,
    name: '1和5组合',
    type: BUFF_TYPES.COMBO,
    description: '点数1的骰子和点数5的骰子可以组合出示，获得300分',
    params: {
      requiredValues: [1, 5],
      bonusPoints: 300
    }
  },
  // 选择限制/奖励类增益
  {
    id: 7,
    name: '单骰双倍',
    type: BUFF_TYPES.SELECTION,
    description: '每次最多只能出示一颗骰子，但是获得的分数翻倍',
    params: {
      maxSelection: 1,
      multiplier: 2
    }
  },
  {
    id: 8,
    name: '多骰奖励',
    type: BUFF_TYPES.SELECTION,
    description: '同时出示3个或更多骰子额外获得500分',
    params: {
      minSelection: 3,
      bonusPoints: 500
    }
  },
  // 计数累积类增益
  {
    id: 9,
    name: '6点计数器',
    type: BUFF_TYPES.COUNTER,
    description: '出示骰子的分数额外增加：15*获得本增益后抽中点数为6的骰子数',
    params: {
      diceValue: 6,
      pointsPerCount: 15
    }
  },
  // 剩余骰子类增益
  {
    id: 10,
    name: '剩余骰子奖励',
    type: BUFF_TYPES.LEFTOVER,
    description: '出示骰子时，每剩余一颗未出示骰子，额外获得50分',
    params: {
      pointsPerDie: 50
    }
  },
  {
    id: 11,
    name: '无剩余奖励',
    type: BUFF_TYPES.LEFTOVER,
    description: '出示骰子时，如果没有剩余未出示骰子则本次得分额外增加500',
    params: {
      condition: 'empty',
      bonusPoints: 500
    }
  },
  {
    id: 12,
    name: '剩余6点',
    type: BUFF_TYPES.LEFTOVER,
    description: '出示骰子时，未出示骰子中如果有6额外获得300分',
    params: {
      requiredValue: 6,
      bonusPoints: 300
    }
  },
  {
    id: 13,
    name: '剩余1点',
    type: BUFF_TYPES.LEFTOVER,
    description: '出示骰子时，未出示骰子中如果有1额外获得300分',
    params: {
      requiredValue: 1,
      bonusPoints: 300
    }
  },
  {
    id: 14,
    name: '剩余奇数',
    type: BUFF_TYPES.LEFTOVER,
    description: '出示骰子时，未出示骰子每有一颗奇数骰子，额外获得100分',
    params: {
      valueCondition: 'odd',
      pointsPerDie: 100
    }
  },
  {
    id: 15,
    name: '剩余偶数',
    type: BUFF_TYPES.LEFTOVER,
    description: '出示骰子时，未出示骰子每有一颗偶数骰子，额外获得100分',
    params: {
      valueCondition: 'even',
      pointsPerDie: 100
    }
  },
  // 回合相关增益
  {
    id: 16,
    name: '三轮三倍',
    type: BUFF_TYPES.TURN_BASED,
    description: '每轮第三次出示骰子获得的分数翻3倍',
    params: {
      turnNumber: 3,
      multiplier: 3
    }
  },
  {
    id: 17,
    name: '连续三次',
    type: BUFF_TYPES.TURN_BASED,
    description: '本轮连续3次出示同一个骰子时，第三次出示骰子得分翻倍',
    params: {
      turnMod: 3,
      multiplier: 2
    }
  },
  {
    id: 18,
    name: '后期回合',
    type: BUFF_TYPES.TURN_BASED,
    description: '出示骰子时，如果所处的回合数≥3则获得分数额外增加500',
    params: {
      minTurn: 3,
      bonusPoints: 500
    }
  },
  // 轮次相关增益
  {
    id: 19,
    name: '下轮首次',
    type: BUFF_TYPES.ROUND_BASED,
    description: '下一轮第一次出示骰子获得的分数翻倍',
    params: {
      roundCondition: 'first',
      multiplier: 2
    }
  },
  {
    id: 20,
    name: '轮次匹配',
    type: BUFF_TYPES.CONDITIONAL,
    description: '出示骰子时，每有一颗点数与当前轮次相等的骰子，额外获得500分',
    params: {
      condition: 'roundMatch',
      bonusPoints: 500
    }
  },
  {
    id: 21,
    name: '低分双倍',
    type: BUFF_TYPES.ROUND_BASED,
    description: '每轮结束时，如果本轮获得的分数≤300，则本轮获得的分数翻倍',
    params: {
      maxRoundScore: 300,
      multiplier: 2
    }
  },
  // 条件性奖励
  {
    id: 22,
    name: '奇数奖励',
    type: BUFF_TYPES.CONDITIONAL,
    description: '出示骰子时，出示骰子每有一颗奇数骰子，额外获得200分',
    params: {
      valueCondition: 'odd',
      bonusPerDie: 200
    }
  },
  {
    id: 23,
    name: '偶数奖励',
    type: BUFF_TYPES.CONDITIONAL,
    description: '出示骰子时，出示骰子每有一颗偶数骰子，额外获得200分',
    params: {
      valueCondition: 'even',
      bonusPerDie: 200
    }
  },
  // 抽骰子奖励
  {
    id: 24,
    name: '抽骰奖励',
    type: BUFF_TYPES.DRAW,
    description: '每次抽取骰子获得100分',
    params: {
      bonusPoints: 100
    }
  },
  // 特殊链式效果
  {
    id: 25,
    name: '六链',
    type: BUFF_TYPES.CONDITIONAL,
    description: '出示单个点数为6的骰子后，下一次出示骰子每有一个偶数额外获得300分',
    params: {
      triggerValue: 6,
      chainEffect: true,
      bonusPerEven: 300
    }
  },
  // 终局奖励
  {
    id: 26,
    name: '终局加分',
    type: BUFF_TYPES.FINAL,
    description: '第5轮结束时，若第五轮获得的分数≥1500，则本次游戏额外获得1000分。',
    params: {
      threshold: 1500,
      bonusPoints: 1000
    }
  },
  {
    id: 27,
    name: '终局翻倍',
    type: BUFF_TYPES.FINAL,
    description: '第5轮结束时，若第五轮获得的分数≥3000，则获得的总分数翻倍',
    params: {
      threshold: 3000,
      multiplier: 2
    }
  },
  // 抽取效果
  {
    id: 28,
    name: '偶数抽取',
    type: BUFF_TYPES.CONDITIONAL,
    description: '每轮首次抽取的骰子必定都是偶数',
    params: {
      valueCondition: 'even',
      specialEffect: 'draw'
    }
  },
  // 计数累积类增益
  {
    id: 29,
    name: '1点计数器',
    type: BUFF_TYPES.COUNTER,
    description: '每出示一个点数为1骰子就会额外奖励15分',
    params: {
      diceValue: 1,
      pointsPerCount: 15
    }
  },
  {
    id: 30, // 请根据实际情况调整ID
    name: '三连单骰',
    description: '本轮连续3次出示单个骰子时，第三次出示骰子得分翻倍',
    type: BUFF_TYPES.TURN_BASED,
    params: {
      turnMod: 3, // 每3次检查一次
      singleDiceMultiplier: 2, // 第三次出示时的乘数
      requireSingleDice: true // 标记这是需要连续单骰子的buff
    }
  },
]

// 骰子类型库
const diceLibrary = [
  { id: 1, name: '普通骰子', type: 'normal', data: [1, 2, 3, 4, 5, 6] },
  { id: 2, name: '三三骰子', type: 'three-three', data: [3, 3, 3, 2, 4, 6] },
  { id: 3, name: '双四双三', type: 'four-four-three-three', data: [4, 4, 3, 3, 5, 6] },
  { id: 4, name: '四平一峰', type: 'four-one-peak', data: [1, 1, 1, 1, 3, 6] },
]

// 成就库
const achievementLibrary = [
  { id: 1, name: '单轮连续3次出示骰子都有点数为1的骰子', reward: '三三骰子', dice: 2, data: [3, 3, 3, 2, 4, 6] },
  { id: 2, name: '单轮连续2次出示骰子都有点数为2的骰子', reward: '三三骰子', dice: 2, data: [3, 3, 3, 2, 4, 6] },
  { id: 3, name: '单轮连续2次出示骰子都有点数为3的骰子', reward: '三三骰子', dice: 2, data: [3, 3, 3, 2, 4, 6] },
  { id: 4, name: '单轮连续3次出示骰子都有点数为6的骰子', reward: '双四双三骰子', dice: 3, data: [4, 4, 3, 3, 5, 6] },
  { id: 5, name: '历史最高分达到5000分', reward: '双四双三骰子', dice: 3, data: [4, 4, 3, 3, 5, 6] },
  { id: 6, name: '历史单轮最高分达到5000分', reward: '四平一峰骰子', dice: 4, data: [1, 1, 1, 1, 3, 6] },
]

export { buffLibrary, BUFF_TYPES, diceLibrary, achievementLibrary }