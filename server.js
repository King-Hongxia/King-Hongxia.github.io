const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 启用CORS
app.use(cors());
app.use(express.json());

// 优化提示词的API端点
app.post('/api/optimize', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: '缺少prompt参数' });
        }
        
        // 从环境变量获取API密钥
        const apiKey = process.env.DOUBAO_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: '服务器未配置API密钥' });
        }
        
        // 调用豆包API
        const response = await fetch('https://api.doubao.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'doubao-pro',
                messages: [
                    {
                        role: 'system',
                        content: '你是一个AI提示词优化专家，擅长将模糊的用户需求转化为清晰、结构化、可执行的AI提示词。'
                    },
                    {
                        role: 'user',
                        content: `请优化以下AI提示词，使其更加清晰、具体、结构化，便于AI理解和执行：\n\n${prompt}\n\n优化要求：\n1. 保持原始意图不变\n2. 增强指令的明确性和可操作性\n3. 结构化内容，使其逻辑清晰\n4. 补充必要的细节和约束条件\n5. 确保语言专业、准确`
                    }
                ],
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status}`);
        }
        
        const data = await response.json();
        const optimizedResult = data.choices[0].message.content;
        
        res.json({ optimized: optimizedResult });
    } catch (error) {
        console.error('优化失败:', error);
        res.status(500).json({ error: '优化失败，请稍后重试' });
    }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
