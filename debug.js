// 调试工具 - 检查页面元素和控制台错误
// 在浏览器控制台中运行这段代码来排查问题

console.log("🔍 开始诊断太空战机游戏...");

// 检查必要的HTML元素
const requiredElements = [
    'gameCanvas', 'gameMenu', 'startButton', 'scoreValue',
    'levelValue', 'livesValue', 'bombsValue', 'backgroundSelect'
];

console.log("📋 检查HTML元素:");
requiredElements.forEach(id => {
    const element = document.getElementById(id);
    console.log(`${element ? '✅' : '❌'} ${id}: ${element ? '存在' : '缺失'}`);
});

// 检查游戏实例
console.log("🎮 检查游戏实例:");
if (window.game) {
    console.log("✅ 游戏实例存在");
    console.log("状态:", window.game.gameState);
    console.log("图片加载状态:", window.game.imagesLoaded);
    console.log("Canvas:", window.game.canvas);
    console.log("Context:", window.game.ctx);
} else {
    console.log("❌ 游戏实例不存在");
}

// 检查控制台错误
console.log("⚠️ 如果有任何红色错误信息，请将其复制并报告");

// 检查文件加载
console.log("📁 检查资源文件:");
['style.css', 'game.js'].forEach(file => {
    fetch(file)
        .then(response => console.log(`✅ ${file}: ${response.status}`))
        .catch(error => console.log(`❌ ${file}: 加载失败`, error));
});

// 尝试手动创建游戏（如果不存在）
if (!window.game) {
    console.log("🚀 尝试手动初始化游戏...");
    try {
        window.game = new SpaceFighterGame();
        console.log("✅ 游戏手动创建成功");
    } catch (error) {
        console.log("❌ 游戏创建失败:", error);
    }
}

console.log("🔍 诊断完成！");