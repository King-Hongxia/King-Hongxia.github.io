// 全局变量存储生成的提示内容
let generatedPrompt = '';
// 主题状态
let isDarkMode = false;

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    // 初始化预览区域
    document.getElementById('preview-content').textContent = '请填写核心模块并点击"生成提问"按钮';
    
    // 加载保存的主题
    loadTheme();
    
    // 加载历史记录
    loadHistory();
});

// 切换折叠面板功能
function toggleAccordion() {
    const content = document.getElementById('accordion-content');
    const icon = document.getElementById('accordion-icon');
    
    content.classList.toggle('active');
    icon.classList.toggle('rotate');
}

// 切换文件上传面板功能
function toggleFileUpload() {
    const content = document.getElementById('file-upload-content');
    const icon = document.getElementById('file-upload-icon');
    
    content.classList.toggle('active');
    icon.classList.toggle('rotate');
}

// 切换自定义输入字段
function toggleCustomInput(field) {
    const select = document.getElementById(field);
    const customInput = document.getElementById(field + '-custom');
    
    if (select.value === '自定义') {
        customInput.style.display = 'block';
    } else {
        customInput.style.display = 'none';
    }
}

// 清空所有输入框
function clearAll() {
    // 核心模块
    document.getElementById('role').value = '';
    document.getElementById('task').value = '';
    document.getElementById('requirements').value = '';
    document.getElementById('info').value = '';
    document.getElementById('format').value = '';
    document.getElementById('notes').value = '';
    
    // 文件上传模块
    document.getElementById('file-type').value = '';
    document.getElementById('file-type-custom').value = '';
    document.getElementById('file-type-custom').style.display = 'none';
    document.getElementById('file-description').value = '';
    
    // 高级模块
    document.getElementById('scenario').value = '';
    document.getElementById('scenario-custom').value = '';
    document.getElementById('scenario-custom').style.display = 'none';
    document.getElementById('difficulty').value = '';
    document.getElementById('difficulty-custom').value = '';
    document.getElementById('difficulty-custom').style.display = 'none';
    document.getElementById('result').value = '';
    document.getElementById('result-custom').value = '';
    document.getElementById('result-custom').style.display = 'none';
    document.getElementById('prohibited').value = '';
    
    // 清空预览
    generatedPrompt = '';
    document.getElementById('preview-content').textContent = '请填写核心模块并点击"生成提问"按钮';
    document.getElementById('preview-content').classList.remove('highlight');
}

// 切换深色/浅色模式
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        body.classList.remove('dark-mode');
        themeToggle.textContent = '🌙';
    }
    
    // 保存主题设置
    localStorage.setItem('darkMode', isDarkMode);
}

// 加载保存的主题
function loadTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
        isDarkMode = savedTheme === 'true';
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');
        
        if (isDarkMode) {
            body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        } else {
            body.classList.remove('dark-mode');
            themeToggle.textContent = '🌙';
        }
    }
}

// 常用场景快速选择
function setQuickScenario(scenario) {
    switch(scenario) {
        case '编程求助':
            document.getElementById('role').value = '编程导师';
            break;
        case '学习解题':
            document.getElementById('role').value = '数学老师';
            break;
        case '文案写作':
            document.getElementById('role').value = '文案写手';
            break;
        case '职场工作':
            document.getElementById('role').value = '职场顾问';
            break;
        case '生活建议':
            document.getElementById('role').value = '生活顾问';
            break;
    }
}

// 输出格式快捷选择
function setFormat(format) {
    document.getElementById('format').value = format;
}

// 生成提问模板
function generatePrompt() {
    // 获取核心模块的值
    const role = document.getElementById('role').value.trim();
    const task = document.getElementById('task').value.trim();
    const requirements = document.getElementById('requirements').value.trim();
    const info = document.getElementById('info').value.trim();
    const format = document.getElementById('format').value.trim();
    const notes = document.getElementById('notes').value.trim();
    
    // 获取文件上传信息
    let fileType = document.getElementById('file-type').value;
    if (fileType === '自定义') {
        fileType = document.getElementById('file-type-custom').value.trim();
    }
    const fileDescription = document.getElementById('file-description').value.trim();
    
    // 获取高级模块的值（包括自定义输入）
    let scenario = document.getElementById('scenario').value;
    if (scenario === '自定义') {
        scenario = document.getElementById('scenario-custom').value.trim();
    }
    
    let difficulty = document.getElementById('difficulty').value;
    if (difficulty === '自定义') {
        difficulty = document.getElementById('difficulty-custom').value.trim();
    }
    
    let result = document.getElementById('result').value;
    if (result === '自定义') {
        result = document.getElementById('result-custom').value.trim();
    }
    
    const prohibited = document.getElementById('prohibited').value.trim();
    
    // 构建优化后的提问模板
    let prompt = '';
    
    // 核心内容
    if (role && role !== '无') {
        prompt += `请你以专业的【${role}】身份，`;
    }
    
    if (task && task !== '无') {
        prompt += `帮我完成【${task}】。\n\n`;
    }
    
    if (requirements && requirements !== '无') {
        prompt += `我的要求：【${requirements}】\n\n`;
    }
    
    let existingContent = '';
    if (info && info !== '无') {
        existingContent += info;
    }
    
    // 添加文件上传信息
    if (fileType && fileDescription) {
        if (existingContent) existingContent += '，';
        existingContent += fileType + '：' + fileDescription;
    }
    
    if (existingContent) {
        prompt += `我已提供的内容：【${existingContent}】\n\n`;
    }
    
    if (format && format !== '无') {
        prompt += `请按【${format}】的风格输出，清晰、准确、易懂。\n\n`;
    }
    
    if (notes && notes !== '无') {
        prompt += `【补充说明】${notes}\n\n`;
    }
    
    // 添加高级模块（如果有填写）
    if (scenario || difficulty || result || prohibited) {
        if (scenario) {
            prompt += `- 使用场景：${scenario}\n`;
        }
        
        if (difficulty) {
            prompt += `- 难度等级：${difficulty}\n`;
        }
        
        if (result) {
            prompt += `- 希望得到的结果：${result}\n`;
        }
        
        if (prohibited) {
            prompt += `- 禁止内容：${prohibited}\n`;
        }
    }
    
    // 存储生成的提示
    generatedPrompt = prompt;
    
    // 更新预览并添加高亮效果
    const previewContent = document.getElementById('preview-content');
    previewContent.textContent = prompt;
    previewContent.classList.add('highlight');
    
    // 保存到历史记录
    saveToHistory(prompt);
}

// 保存到历史记录
function saveToHistory(prompt) {
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    
    // 添加新记录到开头
    history.unshift({
        content: prompt,
        timestamp: new Date().toISOString()
    });
    
    // 限制历史记录数量为10条
    if (history.length > 10) {
        history.pop();
    }
    
    // 保存到本地存储
    localStorage.setItem('promptHistory', JSON.stringify(history));
    
    // 更新历史记录显示
    loadHistory();
}

// 加载历史记录
function loadHistory() {
    // 这里可以实现历史记录的显示逻辑
    // 由于当前HTML中没有历史记录的容器，暂时只保存不显示
    // 后续可以添加历史记录面板
}

// 从历史记录中加载
function loadFromHistory(index) {
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    if (history[index]) {
        generatedPrompt = history[index].content;
        document.getElementById('preview-content').textContent = generatedPrompt;
        document.getElementById('preview-content').classList.add('highlight');
    }
}

// 复制到剪贴板
function copyToClipboard() {
    if (!generatedPrompt) {
        // 如果还没有生成提示，先调用生成函数
        generatePrompt();
    }
    
    // 创建临时文本区域
    const textArea = document.createElement('textarea');
    textArea.value = generatedPrompt;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    // 选择并复制文本
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        
        // 显示复制成功提示
        const message = document.getElementById('copy-message');
        message.classList.add('show');
        
        // 3秒后隐藏提示
        setTimeout(() => {
            message.classList.remove('show');
        }, 3000);
    } catch (err) {
        console.error('复制失败:', err);
    } finally {
        document.body.removeChild(textArea);
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    // 初始化预览区域
    document.getElementById('preview-content').textContent = '请填写核心模块并点击"生成提问"按钮';
});