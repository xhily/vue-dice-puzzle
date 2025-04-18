export const buffLibrary = [
  // 得分类增益
  { id: 'five_points', name: '可出示点数5的骰子得50分', effect: 'fivePoints', type: 'scoring', active: false },
  { id: 'two_points', name: '可出示点数2的骰子得50分', effect: 'twoPoints', type: 'scoring', active: false },
  // 抽骰子类增益
  { id: 'draw_bonus', name: '每次抽取骰子获得100分', effect: 'drawBonus', type: 'draw', active: false },
  // 出示限制类增益
  { id: 'single_double', name: '每次最多只能出示一颗骰子，但是获得的分数翻倍', effect: 'singleDouble', type: 'limit', active: false },
  // 组合得分类增益
  { id: 'even_combo', name: '点数为2、4、6的骰子可以组合出示，得800分', effect: 'evenCombo', type: 'combo', active: false },
  { id: 'one_five_combo', name: '点数1的骰子和点数5的骰子可以组合出示，获得300分', effect: 'oneFiveCombo', type: 'combo', active: false },
  // 骰子变化类增益
  { id: 'two_to_six', name: '本局游戏点数为2的骰子将变为点数为6的骰子', effect: 'twoToSix', type: 'transform', active: false },
  { id: 'three_to_six', name: '本局游戏点数为3的骰子将变为点数为6的骰子', effect: 'threeToSix', type: 'transform', active: false },
  // 连续出示类增益
  { id: 'triple_bonus', name: '本轮连续3次出示单个骰子时，第三次出示骰子得分翻倍', effect: 'tripleBonus', type: 'streak', active: false },
  // 轮次相关增益
  { id: 'next_round_bonus', name: '下一轮第一次出示骰子获得的分数翻倍', effect: 'nextRoundBonus', type: 'round', active: false },
  { id: 'even_draw', name: '每轮首次抽取的骰子必定都是偶数', effect: 'evenDraw', type: 'round', active: false },
  { id: 'third_triple', name: '每轮第三次出示骰子获得的分数翻3倍', effect: 'thirdTriple', type: 'round', active: false },
  { id: 'low_score_double', name: '每轮结束时，如果本轮获得的分数≤300，则本轮获得的分数翻倍', effect: 'lowScoreDouble', type: 'round', active: false },
  // 累计类增益
  { id: 'six_counter', name: '出示骰子的分数额外增加：15*获得本增益后抽中点数为6的骰子数', effect: 'sixCounter', type: 'accumulate', active: false },
  // 条件奖励类增益
  { id: 'empty_bonus', name: '出示骰子时，如果没有剩余未出示骰子则本次得分额外增加500', effect: 'emptyBonus', type: 'condition', active: false },
  { id: 'multi_bonus', name: '出示骰子时，如果单次出示了3个及以上数量的骰子后，本轮下一次出示骰子得分翻倍', effect: 'multiBonus', type: 'condition', active: false },
  { id: 'odd_bonus', name: '出示骰子时，出示骰子每有一颗奇数骰子，额外获得200分', effect: 'oddBonus', type: 'condition', active: false },
  { id: 'even_bonus', name: '出示骰子时，出示骰子每有一颗偶数骰子，额外获得200分', effect: 'evenBonus', type: 'condition', active: false },
  { id: 'round_match', name: '出示骰子时，每有一颗点数与当前轮次相等的骰子，额外获得500分', effect: 'roundMatch', type: 'condition', active: false },
  { id: 'leftover_odd', name: '出示骰子时，未出示骰子每有一颗奇数骰子，额外获得100分', effect: 'leftoverOdd', type: 'condition', active: false },
  { id: 'leftover_even', name: '出示骰子时，未出示骰子每有一颗偶数骰子，额外获得100分', effect: 'leftoverEven', type: 'condition', active: false },
  { id: 'leftover_bonus', name: '出示骰子时，每剩余一颗未出示骰子，额外获得50分', effect: 'leftoverBonus', type: 'condition', active: false },
  { id: 'leftover_six', name: '出示骰子时，未出示骰子中如果有6额外获得300分', effect: 'leftoverSix', type: 'condition', active: false },
  { id: 'leftover_one', name: '出示骰子时，未出示骰子中如果有1额外获得300分', effect: 'leftoverOne', type: 'condition', active: false },
  { id: 'late_turn', name: '出示骰子时，如果所处的回合数≥3则获得分数额外增加500', effect: 'lateTurn', type: 'condition', active: false },
  { id: 'six_chain', name: '出示单个点数为6的骰子后，下一次出示骰子每有一个偶数额外获得300分', effect: 'sixChain', type: 'condition', active: false },
  // 终局奖励类增益
  { id: 'final_bonus', name: '第5轮结束时，若第五轮获得的分数≥1500，则本次游戏额外获得1000分。', effect: 'finalBonus', type: 'final', active: false },
  { id: 'final_double', name: '第5轮结束时，若第五轮获得的分数≥3000，则获得的总分数翻倍', effect: 'finalDouble', type: 'final', active: false }
]

// 骰子类型库
export const diceLibrary = [
  { id: 1, name: '普通骰子', type: 'normal', data: [1, 2, 3, 4, 5, 6] },
  { id: 2, name: '三三骰子', type: 'three-three', data: [3, 3, 3, 2, 4, 6] },
  { id: 3, name: '双四双三', type: 'four-four-three-three', data: [4, 4, 3, 3, 5, 6] },
  { id: 4, name: '四平一峰', type: 'four-one-peak', data: [1, 1, 1, 1, 3, 6] },
]

// 成就库
export const achievementLibrary = [
  { id: 1, name: '单轮连续3次出示骰子都有点数为1的骰子', reward: '三三骰子', dice: 2, data: [3, 3, 3, 2, 4, 6] },
  { id: 2, name: '单轮连续2次出示骰子都有点数为2的骰子', reward: '三三骰子', dice: 2, data: [3, 3, 3, 2, 4, 6] },
  { id: 3, name: '单轮连续2次出示骰子都有点数为3的骰子', reward: '三三骰子', dice: 2, data: [3, 3, 3, 2, 4, 6] },
  { id: 4, name: '单轮连续3次出示骰子都有点数为6的骰子', reward: '双四双三骰子', dice: 3, data: [4, 4, 3, 3, 5, 6] },
  { id: 5, name: '游戏结束时总得分达到5000分', reward: '双四双三骰子', dice: 3, data: [4, 4, 3, 3, 5, 6] },
  { id: 6, name: '单轮获得分数达到5000分', reward: '四平一峰骰子', dice: 4, data: [1, 1, 1, 1, 3, 6] },
]