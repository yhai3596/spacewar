#!/bin/bash

# Git Push Helper Script for spacewar game
# 这个脚本帮助你将代码推送到GitHub

echo "🚀 准备推送太空战机游戏到GitHub..."
echo "📁 当前目录: $(pwd)"

# 检查是否在正确的目录
if [ ! -f "game.js" ] || [ ! -f "index.html" ]; then
    echo "❌ 错误：请确保在正确的项目目录中运行此脚本"
    exit 1
fi

echo "✅ 检测到游戏文件"

# 显示当前git状态
echo "📊 Git 状态："
git status

echo ""
echo "🔗 远程仓库："
git remote -v

echo ""
echo "📝 提交历史："
git log --oneline -5

echo ""
echo "🔧 正在尝试推送..."

# 切换回HTTPS协议（更常用）
git remote set-url origin https://github.com/yhai3596/spacewar.git

echo "⚠️  注意：如果推送失败，请确保："
echo "   1. 你已经登录GitHub账号"
echo "   2. 有推送权限到仓库 yhai3596/spacewar"
echo "   3. 可能需要使用GitHub Personal Access Token"
echo ""
echo "🚀 开始推送..."

# 尝试推送
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功！"
    echo "🌐 你的游戏应该现在可以在 https://github.com/yhai3596/spacewar 看到"
    echo "🚀 接下来可以在 Vercel 中导入这个仓库进行部署"
else
    echo "❌ 推送失败"
    echo "💡 建议手动操作："
    echo "   1. 在浏览器中打开 https://github.com/yhai3596/spacewar"
    echo "   2. 点击 'uploading an existing file' 或 'drag files here'"
    echo "   3. 上传项目中的所有文件（除了 .git 文件夹）"
fi