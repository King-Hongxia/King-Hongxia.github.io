// 全局变量存储生成的提示内容
let generatedPrompt = '';
// 主题状态
let isDarkMode = false;
// 对话历史
let conversationHistory = [];
// 原始问题
let originalPrompt = '';
// API配置
let apiMode = 'backend'; // 'backend' 或 'frontend'
let backendUrl = 'https://king-hongxia-github-io.vercel.app/';
let userApiKey = '';

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    // 初始化预览区域
    document.getElementById('original-content').textContent = '请填写核心模块并点击"生成提问"按钮';
    document.getElementById('optimized-content').textContent = '';
    
    // 加载保存的主题
    loadTheme();
    
    // 加载API配置
    loadApiConfig();
    
    // 加载历史记录
    loadHistory();
    
    // 加载对话历史
    loadConversationHistory();
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

// 切换历史记录和收藏面板
function toggleHistoryFavorites() {
    const content = document.getElementById('history-favorites-content');
    const icon = document.getElementById('history-favorites-icon');
    
    content.classList.toggle('active');
    icon.classList.toggle('rotate');
    
    // 显示历史记录和收藏
    if (content.classList.contains('active')) {
        loadHistory();
        loadFavorites();
    }
}

// 切换对话历史面板
function toggleConversationHistory() {
    const content = document.getElementById('conversation-content');
    const icon = document.getElementById('conversation-icon');
    
    content.classList.toggle('active');
    icon.classList.toggle('rotate');
    
    // 显示对话历史
    if (content.classList.contains('active')) {
        loadConversationHistory();
    }
}

// 切换API配置面板
function toggleApiConfig() {
    const content = document.getElementById('api-config-content');
    const icon = document.getElementById('api-config-icon');
    
    content.classList.toggle('active');
    icon.classList.toggle('rotate');
}

// 切换API模式
function changeApiMode(mode) {
    apiMode = mode;
    
    if (mode === 'backend') {
        document.getElementById('backend-config').style.display = 'block';
        document.getElementById('frontend-config').style.display = 'none';
    } else {
        document.getElementById('backend-config').style.display = 'none';
        document.getElementById('frontend-config').style.display = 'block';
    }
    
    // 保存配置
    saveApiConfig();
}

// 保存后端URL
function saveBackendUrl() {
    backendUrl = document.getElementById('backend-url').value.trim();
    saveApiConfig();
    alert('后端地址已保存');
}

// 保存用户API密钥
function saveUserApiKey() {
    userApiKey = document.getElementById('user-api-key').value.trim();
    saveApiConfig();
    alert('API密钥已保存');
}

// 保存API配置到本地存储
function saveApiConfig() {
    const config = {
        apiMode: apiMode,
        backendUrl: backendUrl,
        userApiKey: userApiKey
    };
    localStorage.setItem('apiConfig', JSON.stringify(config));
}

// 加载API配置
function loadApiConfig() {
    const savedConfig = localStorage.getItem('apiConfig');
    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        apiMode = config.apiMode || 'backend';
        backendUrl = config.backendUrl || 'http://localhost:3001';
        userApiKey = config.userApiKey || '';
        
        // 更新UI
        document.querySelector(`input[name="api-mode"][value="${apiMode}"]`).checked = true;
        document.getElementById('backend-url').value = backendUrl;
        document.getElementById('user-api-key').value = userApiKey;
        
        // 显示对应的配置区域
        changeApiMode(apiMode);
    }
}

// 搜索历史记录和收藏
function searchItems() {
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    if (searchTerm) {
        loadHistory(searchTerm);
        loadFavorites(searchTerm);
    }
}

// 清空搜索
function clearSearch() {
    document.getElementById('search-input').value = '';
    loadHistory();
    loadFavorites();
}

// AI优化功能
async function optimizeWithAI() {
    if (!originalPrompt) {
        alert('请先生成提问');
        return;
    }
    
    // 检查API配置
    if (apiMode === 'frontend' && !userApiKey) {
        alert('请先配置API密钥');
        return;
    }
    
    // 显示加载状态
    document.getElementById('optimized-content').textContent = 'AI正在优化...';
    
    try {
        // 添加用户对话到历史
        addConversation('用户', originalPrompt);
        
        let optimizedResult;
        
        if (apiMode === 'backend') {
            // 调用后端API
            const response = await fetch(`${backendUrl}/api/optimize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: originalPrompt
                })
            });
            
            if (!response.ok) {
                throw new Error(`API调用失败: ${response.status}`);
            }
            
            const data = await response.json();
            optimizedResult = data.optimized;
        } else {
            // 前端直接调用豆包API
            const optimizationPrompt = `请优化以下AI提示词，使其更加清晰、具体、结构化，便于AI理解和执行：\n\n${originalPrompt}\n\n优化要求：\n1. 保持原始意图不变\n2. 增强指令的明确性和可操作性\n3. 结构化内容，使其逻辑清晰\n4. 补充必要的细节和约束条件\n5. 确保语言专业、准确`;
            
            const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userApiKey}`
                },
                body: JSON.stringify({
                    model: 'doubao-pro-32k',
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个AI提示词优化专家，擅长将模糊的用户需求转化为清晰、结构化、可执行的AI提示词。'
                        },
                        {
                            role: 'user',
                            content: optimizationPrompt
                        }
                    ],
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                throw new Error(`API调用失败: ${response.status}`);
            }
            
            const data = await response.json();
            optimizedResult = data.choices[0].message.content;
        }
        
        // 更新优化后的内容
        document.getElementById('optimized-content').textContent = optimizedResult;
        generatedPrompt = optimizedResult;
        
        // 添加AI回复到对话历史
        addConversation('AI', optimizedResult);
        
        // 保存到历史记录
        saveToHistory(optimizedResult);
        
        // 更新收藏按钮状态
        updateFavoriteButtonStatus();
    } catch (error) {
        console.error('优化失败:', error);
        document.getElementById('optimized-content').textContent = '优化失败，请稍后重试';
        
        // 模拟API调用（当后端不可用时）
        setTimeout(() => {
            // 模拟优化后的结果
            optimizedResult = `请你以专业的【${document.getElementById('role').value || 'AI助手'}】身份，帮我完成【${document.getElementById('task').value || '任务'}】。\n\n我的要求：【${document.getElementById('requirements').value || '无特殊要求'}】\n\n我已提供的内容：【${document.getElementById('info').value || '无'}】\n\n请按【${document.getElementById('format').value || '详细'}】的风格输出，清晰、准确、易懂。\n\n${document.getElementById('notes').value ? `【补充说明】${document.getElementById('notes').value}\n\n` : ''}`;
            
            // 更新优化后的内容
            document.getElementById('optimized-content').textContent = optimizedResult;
            generatedPrompt = optimizedResult;
            
            // 添加AI回复到对话历史
            addConversation('AI', optimizedResult);
            
            // 保存到历史记录
            saveToHistory(optimizedResult);
            
            // 更新收藏按钮状态
            updateFavoriteButtonStatus();
        }, 1500);
    }
}

// 重新优化
function reOptimize() {
    if (generatedPrompt) {
        originalPrompt = generatedPrompt;
        optimizeWithAI();
    } else {
        alert('请先生成或优化提问');
    }
}

// 加载对话历史
function loadConversationHistory() {
    conversationHistory = JSON.parse(localStorage.getItem('conversationHistory') || '[]');
    const conversationList = document.getElementById('conversation-list');
    
    // 清空对话历史列表
    conversationList.innerHTML = '';
    
    // 如果没有对话历史，显示提示信息
    if (conversationHistory.length === 0) {
        conversationList.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">暂无对话历史</p>';
        return;
    }
    
    // 显示对话历史
    conversationHistory.forEach((item, index) => {
        const conversationItem = document.createElement('div');
        conversationItem.className = 'conversation-item';
        
        conversationItem.innerHTML = `
            <div class="conversation-role">${item.role}</div>
            <div class="conversation-content">${item.content}</div>
        `;
        
        conversationList.appendChild(conversationItem);
    });
}

// 保存对话历史
function saveConversationHistory() {
    localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
    loadConversationHistory();
}

// 添加对话
function addConversation(role, content) {
    conversationHistory.push({ role, content });
    // 限制对话历史数量为20条
    if (conversationHistory.length > 20) {
        conversationHistory.shift();
    }
    saveConversationHistory();
}

// 清空对话历史
function clearConversationHistory() {
    conversationHistory = [];
    saveConversationHistory();
}

// 文件上传功能
function uploadFile() {
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        document.getElementById('upload-status').textContent = '请选择文件';
        return;
    }
    
    document.getElementById('upload-status').textContent = '正在上传...';
    
    // 模拟文件上传过程
    setTimeout(() => {
        document.getElementById('upload-status').textContent = `文件上传成功：${file.name}`;
        
        // 读取文件内容（仅支持文本文件）
        if (file.type.includes('text') || file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                // 将文件内容添加到信息输入框
                document.getElementById('info').value += '\n' + content;
                autoResize(document.getElementById('info'));
            };
            reader.readAsText(file);
        } else {
            // 对于非文本文件，添加文件描述
            document.getElementById('info').value += `\n已上传文件：${file.name}`;
            autoResize(document.getElementById('info'));
        }
    }, 1000);
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
    originalPrompt = '';
    document.getElementById('original-content').textContent = '请填写核心模块并点击"生成提问"按钮';
    document.getElementById('optimized-content').textContent = '';
    
    // 重置收藏按钮状态
    const favoriteBtn = document.getElementById('favorite-btn');
    favoriteBtn.classList.remove('favorited');
    favoriteBtn.textContent = '❤️ 收藏';
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
    const roleInput = document.getElementById('role');
    switch(scenario) {
        case '编程求助':
            roleInput.value = '编程导师';
            break;
        case '学习解题':
            roleInput.value = '数学老师';
            break;
        case '文案写作':
            roleInput.value = '文案写手';
            break;
        case '职场工作':
            roleInput.value = '职场顾问';
            break;
        case '生活建议':
            roleInput.value = '生活顾问';
            break;
    }
    autoResize(roleInput);
}

// 输出格式快捷选择
function setFormat(format) {
    const formatInput = document.getElementById('format');
    formatInput.value = format;
    autoResize(formatInput);
}

// 自动调整文本域高度
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
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
    originalPrompt = prompt;
    
    // 更新预览
    document.getElementById('original-content').textContent = prompt;
    document.getElementById('optimized-content').textContent = '';
    
    // 保存到历史记录
    saveToHistory(prompt);
    
    // 更新收藏按钮状态
    updateFavoriteButtonStatus();
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
function loadHistory(searchTerm = '') {
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    const historyList = document.getElementById('history-list');
    
    // 过滤历史记录
    const filteredHistory = searchTerm
        ? history.filter(item => 
            item.content.toLowerCase().includes(searchTerm) ||
            new Date(item.timestamp).toLocaleString('zh-CN').toLowerCase().includes(searchTerm)
          )
        : history;
    
    // 清空历史记录列表
    historyList.innerHTML = '';
    
    // 如果没有历史记录，显示提示信息
    if (filteredHistory.length === 0) {
        const message = searchTerm ? '没有找到匹配的历史记录' : '暂无历史记录';
        historyList.innerHTML = `<p style="text-align: center; color: #7f8c8d; padding: 20px;">${message}</p>`;
        return;
    }
    
    // 显示历史记录
    filteredHistory.forEach((item, index) => {
        // 找到原始索引
        const originalIndex = history.findIndex(h => h.timestamp === item.timestamp);
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.onclick = () => loadFromHistory(originalIndex);
        
        // 格式化时间
        const date = new Date(item.timestamp);
        const timeString = date.toLocaleString('zh-CN');
        
        // 截取内容预览
        const previewContent = item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content;
        
        historyItem.innerHTML = `
            <div class="history-item-content">${previewContent}</div>
            <div class="history-item-time">${timeString}</div>
            <button class="favorite-btn" onclick="event.stopPropagation(); addToFavorites('${originalIndex}')">❤️</button>
        `;
        
        historyList.appendChild(historyItem);
    });
}

// 从历史记录中加载
function loadFromHistory(index) {
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    if (history[index]) {
        generatedPrompt = history[index].content;
        document.getElementById('preview-content').textContent = generatedPrompt;
        document.getElementById('preview-content').classList.add('highlight');
        // 更新收藏按钮状态
        updateFavoriteButtonStatus();
    }
}

// 加载收藏
function loadFavorites(searchTerm = '') {
    const favorites = JSON.parse(localStorage.getItem('promptFavorites') || '[]');
    const favoritesList = document.getElementById('favorites-list');
    
    // 过滤收藏
    const filteredFavorites = searchTerm
        ? favorites.filter(item => 
            item.content.toLowerCase().includes(searchTerm) ||
            new Date(item.timestamp).toLocaleString('zh-CN').toLowerCase().includes(searchTerm)
          )
        : favorites;
    
    // 清空收藏列表
    favoritesList.innerHTML = '';
    
    // 如果没有收藏，显示提示信息
    if (filteredFavorites.length === 0) {
        const message = searchTerm ? '没有找到匹配的收藏' : '暂无收藏';
        favoritesList.innerHTML = `<p style="text-align: center; color: #7f8c8d; padding: 20px;">${message}</p>`;
        return;
    }
    
    // 显示收藏
    filteredFavorites.forEach((item, index) => {
        // 找到原始索引
        const originalIndex = favorites.findIndex(f => f.timestamp === item.timestamp);
        
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.onclick = () => loadFromFavorites(originalIndex);
        
        // 截取内容预览
        const previewContent = item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content;
        
        favoriteItem.innerHTML = `
            <div class="history-item-content">${previewContent}</div>
            <button class="favorite-btn" onclick="event.stopPropagation(); removeFromFavorites('${originalIndex}')">💔</button>
        `;
        
        favoritesList.appendChild(favoriteItem);
    });
}

// 从收藏中加载
function loadFromFavorites(index) {
    const favorites = JSON.parse(localStorage.getItem('promptFavorites') || '[]');
    if (favorites[index]) {
        generatedPrompt = favorites[index].content;
        document.getElementById('preview-content').textContent = generatedPrompt;
        document.getElementById('preview-content').classList.add('highlight');
        // 更新收藏按钮状态
        updateFavoriteButtonStatus();
    }
}

// 添加到收藏
function addToFavorites(historyIndex) {
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    if (history[historyIndex]) {
        const favorites = JSON.parse(localStorage.getItem('promptFavorites') || '[]');
        const promptContent = history[historyIndex].content;
        
        // 检查是否已经收藏
        const isAlreadyFavorited = favorites.some(item => item.content === promptContent);
        if (!isAlreadyFavorited) {
            favorites.push({
                content: promptContent,
                timestamp: new Date().toISOString()
            });
            
            // 限制收藏数量为10条
            if (favorites.length > 10) {
                favorites.shift();
            }
            
            // 保存到本地存储
            localStorage.setItem('promptFavorites', JSON.stringify(favorites));
            
            // 更新收藏列表
            loadFavorites();
        }
    }
}

// 从收藏中删除
function removeFromFavorites(index) {
    const favorites = JSON.parse(localStorage.getItem('promptFavorites') || '[]');
    favorites.splice(index, 1);
    localStorage.setItem('promptFavorites', JSON.stringify(favorites));
    loadFavorites();
    // 更新收藏按钮状态
    updateFavoriteButtonStatus();
}

// 切换收藏状态
function toggleFavorite() {
    if (!generatedPrompt) return;
    
    const favorites = JSON.parse(localStorage.getItem('promptFavorites') || '[]');
    const isFavorited = favorites.some(item => item.content === generatedPrompt);
    
    if (isFavorited) {
        // 取消收藏
        const updatedFavorites = favorites.filter(item => item.content !== generatedPrompt);
        localStorage.setItem('promptFavorites', JSON.stringify(updatedFavorites));
    } else {
        // 添加收藏
        favorites.push({
            content: generatedPrompt,
            timestamp: new Date().toISOString()
        });
        
        // 限制收藏数量为10条
        if (favorites.length > 10) {
            favorites.shift();
        }
        
        localStorage.setItem('promptFavorites', JSON.stringify(favorites));
    }
    
    // 更新收藏按钮状态
    updateFavoriteButtonStatus();
    // 更新收藏列表
    loadFavorites();
}

// 更新收藏按钮状态
function updateFavoriteButtonStatus() {
    if (!generatedPrompt) return;
    
    const favorites = JSON.parse(localStorage.getItem('promptFavorites') || '[]');
    const isFavorited = favorites.some(item => item.content === generatedPrompt);
    const favoriteBtn = document.getElementById('favorite-btn');
    
    if (isFavorited) {
        favoriteBtn.classList.add('favorited');
        favoriteBtn.textContent = '💚 已收藏';
    } else {
        favoriteBtn.classList.remove('favorited');
        favoriteBtn.textContent = '❤️ 收藏';
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