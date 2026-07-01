const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Dùng DeepSeek API
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

app.get('/', (req, res) => {
  res.json({ message: 'ExamAI Server OK!' });
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.json({ response: 'Vui lòng nhập câu hỏi!' });
    }

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Trả lời ngắn gọn bằng tiếng Việt.' },
        { role: 'user', content: message }
      ]
    });

    const reply = completion.choices[0].message.content;
    res.json({ response: reply || 'Không có phản hồi' });
    
  } catch (error) {
    console.error('Lỗi:', error.message);
    res.json({ response: 'Lỗi: ' + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server chay cong ' + PORT);
});
