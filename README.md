# 太空战机游戏 (Space Fighter Game)

一个使用HTML5 Canvas和JavaScript开发的太空射击游戏。

## 游戏特色

- 🚀 鼠标控制飞船移动
- 🔫 自动发射激光武器
- 🎯 多种类型的敌机
- 💎 特殊道具系统
- 🌌 可选择的动态背景
- 📱 响应式设计

## 游戏说明

- 使用鼠标控制飞船移动
- 自动发射激光击败敌人
- 收集特殊物品获得能力：
  - 🔫 武器增强 - 提升火力
  - 🛡️ 无敌护盾 - 暂时无敌
  - 💣 炸弹 - 清除所有敌人
- 按空格键使用炸弹

## 在线体验

🎮 [立即游玩](https://spacewar-yhai3596.vercel.app)

## 本地运行

1. 克隆仓库
```bash
git clone https://github.com/yhai3596/spacewar.git
```

2. 进入项目目录
```bash
cd spacewar
```

3. 启动本地服务器
```bash
python3 -m http.server 8000
```

4. 在浏览器中访问 `http://localhost:8000`

## 技术栈

- HTML5 Canvas
- JavaScript ES6+
- CSS3

## 项目结构

```
├── index.html          # 主页面
├── game.js            # 游戏逻辑
├── style.css          # 样式文件
├── image/             # 游戏图片资源
├── background/        # 背景图片
└── vercel.json        # Vercel部署配置
```

## 部署

项目已配置好Vercel部署，推送到GitHub后会自动部署。