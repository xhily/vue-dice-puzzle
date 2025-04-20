import { defineStore } from 'pinia'
import { encryptData, decryptData } from '../plugins/crypto'

export const useGameStore = defineStore('game', {
  state: () => ({
    // 是否新玩家
    isNewPlayer: true,
    // 成就完成情况
    achievement: [],
    // 已经拥有的骰子
    dices: [],
    // 每局最高总分数
    maxScore: 0,
    // 单论最高分数
    maxRoundScore: 0,
    // 累计完成的轮数
    round: 0,
    // 用于存储连续出示的骰子值
    consecutiveShows: [],
  }),
  persist: {
    key: __APP_NAME__,
    storage: {
      getItem(key) {
        const data = localStorage.getItem(key)
        const encodedAppName = btoa(`+++${key}`)
        const saveData = data.replace(encodedAppName, '')
        return saveData ? decryptData(saveData) : null
      },
      setItem(key, value) {
        const encodedAppName = btoa(`+++${key}`)
        localStorage.setItem(key, `${encryptData(value)}${encodedAppName}`)
      },
      removeItem(key) {
        localStorage.removeItem(key)
      }
    },
    paths: null
  }
})