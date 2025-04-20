const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export const explorationRegions = [
  {
    id: 'forest',
    name: '森林',
    description: '茂密的森林，蕴含丰富的木材和草药资源',
    difficulty: 1,
    amount: getRandomInt(1, 20),
    unlockRequirements: { survival: 1 },
    resources: ['wood', 'herb', 'food'],
    dangers: ['predator', 'storm'],
    image: '🌲',
    explorationTime: 300, // 秒
    energyCost: 30,
    resourceCost: { food: 2, water: 2 }
  },
  {
    id: 'hills',
    name: '丘陵',
    description: '崎岖的丘陵地带，可以找到石头和少量金属',
    difficulty: 2,
    amount: getRandomInt(1, 20),
    unlockRequirements: { survival: 2 },
    resources: ['stone', 'metal'],
    dangers: ['rockslide', 'predator'],
    image: '⛰️',
    explorationTime: 600,
    energyCost: 40,
    resourceCost: { food: 3, water: 3 }
  },
  {
    id: 'ruins',
    name: '废墟',
    description: '古老的废墟，可能藏有珍贵的科技碎片和遗物',
    difficulty: 3,
    amount: getRandomInt(1, 3),
    unlockRequirements: { survival: 3, combat: 2 },
    resources: ['metal', 'parts', 'techFragment', 'ancientRelic'],
    dangers: ['rockslide', 'radiation', 'hostiles'],
    image: '🏚️',
    explorationTime: 1200,
    energyCost: 50,
    resourceCost: { food: 5, water: 5, medicine: 1 }
  },
  {
    id: 'cave',
    name: '洞穴',
    description: '黑暗的洞穴系统，蕴含丰富的矿物资源',
    difficulty: 4,
    amount: getRandomInt(1, 10),
    unlockRequirements: { survival: 4, combat: 3 },
    resources: ['stone', 'metal', 'crystal'],
    dangers: ['rockslide', 'thirst', 'creatures'],
    image: '🕳️',
    explorationTime: 1800,
    energyCost: 60,
    resourceCost: { food: 6, water: 6, medicine: 2, tools: 1 }
  },
  {
    id: 'wasteland',
    name: '荒漠',
    description: '危险的辐射区域，但可能有高级科技残骸',
    difficulty: 5,
    amount: getRandomInt(1, 10),
    unlockRequirements: { survival: 5, combat: 4 },
    resources: ['metal', 'parts', 'techFragment', 'ancientRelic'],
    dangers: ['radiation', 'storm', 'hostiles', 'thirst'],
    image: '🏜️',
    explorationTime: 2400,
    energyCost: 70,
    resourceCost: { food: 8, water: 10, medicine: 3, tools: 2 }
  }
]