const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo an toàn: Nếu không có key, truyền một chuỗi tạm thời hợp lệ để thư viện không làm sập server lúc khởi động
const apiKey = process.env.DEEPSEEK_API_KEY || "sk-dummy-key-for-render-build";

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: apiKey
});

// Test Endpoint (Để bạn vào web kiểm tra xem server sống hay chết)
app.get('/', (req, res) => {
  res.json({ message: 'ExamAI Server OK với DeepSeek!' });
});

// Chat với AI
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ response: 'Vui lòng nhập câu hỏi!' });
    }

    // Kiểm tra nếu key vẫn là key fake, báo lỗi cho app Android biết
    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY.includes('dummy')) {
      return res.json({ response: 'Lỗi: Bạn chưa cấu hình đúng DEEPSEEK_API_KEY trên Render!' });
    }

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Trả lời ngắn gọn bằng tiếng Việt.' },
        { role: 'user', content: message }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content;
    res.json({ response: reply || 'Không có phản hồi từ DeepSeek' });
    
  } catch (error) {
    console.error('Lỗi khi gọi DeepSeek API:', error.message);
    res.json({ response: 'Lỗi: ' + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server DeepSeek đang chạy mượt mà ở cổng ' + PORT);
});
