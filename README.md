# 掷骰迷局 (Dice Puzzle)

一款基于Vue 3的策略骰子游戏，融合了谜题解法和随机元素，考验玩家的决策能力。

## 游戏截图

![游戏截图](https://github.com/user-attachments/assets/9dbd37c4-d3cf-4293-9aa6-f1ff32962226)
![游戏截图](https://github.com/user-attachments/assets/9f605af4-8e62-44f2-8e1e-d625733e2761)
![游戏截图](https://github.com/user-attachments/assets/bc1d6bc9-395d-48d6-b913-73f5ee00c3b9)
![游戏截图](https://github.com/user-attachments/assets/36b30263-26e1-4287-811a-cce7922e3c92)

## 项目介绍

"掷骰迷局"是一款创新的骰子解谜游戏，玩家需要通过策略性地选择骰子组合来破解迷局。游戏特点包括：

- 🎲 多种特殊骰子类型，每种有不同的点数分布
- 🧩 迷局式关卡设计，每轮都有独特的解谜挑战
- 📊 复杂的得分计算系统，支持多种得分组合
- 🏆 终局谜题机制，考验玩家的全局策略能力

## 技术栈

- 前端框架: [Vue 3](https://vuejs.org)
- 构建工具: [Vite](https://vitejs.dev)

## 项目部署
### 安装项目
```bash
npm install
```

### 运行项目
```bash
npm run dev
```

### 编译项目
```bash
npm run build
```

### 构建镜像
```bash
docker build -t ghcr.io/setube/vue-dice-puzzle:latest .
```
### 拉取镜像
```bash
docker pull ghcr.io/setube/vue-dice-puzzle:latest
```
### 运行容器
```bash
docker run -d -p 25418:80 --name vue-dice-puzzle ghcr.io/setube/vue-dice-puzzle:latest
```

## 版权声明
知识共享署名-非商业性使用 4.0 国际许可协议

本作品采用知识共享署名-非商业性使用 4.0 国际许可协议进行许可。
要查看此许可协议的副本，请访问 http://creativecommons.org/licenses/by-nc/4.0/。

您自由地：
共享 — 在任何媒介以任何形式复制、发行本作品
改编 — 修改、转换或以本作品为基础进行创作

惟须遵守以下条件：
署名 — 您必须给出适当的署名，提供指向本许可协议的链接，同时标明是否（对原始作品）作了修改。您可以用任何合理的方式来署名，但不得以任何方式暗示许可人为您或您的使用背书。

非商业性使用 — 您不得将本作品用于商业目的。

没有附加限制 — 您不得适用法律术语或者技术措施从而限制其他人做许可协议允许的事情。

声明：
本作品是作者（谦君）的原创作品，项目源码地址：https://github.com/setube/vue-dice-puzzle
本授权条款不得被视为或解释为对任何版权的放弃或其他限制。

当您分享本作品的改编版本时，您必须：
- 在显著位置标注原作者的署名
- 保留本许可协议文档
- 明确说明修改内容及修改日期
- 使用相同的 CC BY-NC 4.0 协议进行分发

© 2025 谦君 - 保留所有权利（根据本许可协议授予的权限除外）
