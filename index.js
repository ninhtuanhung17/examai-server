const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

// Test
app.get('/', (req, res) => {
  res.json({ message: 'ExamAI Server OK!' });
});

// Chat với AI
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.json({ response: 'Vui lòng nhập câu hỏi!' });
    }

    const prompt = 'Trả lời ngắn gọn bằng tiếng Việt: ' + message;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Luôn trả về response
    res.json({ response: text || 'Không có phản hồi từ AI' });
    
  } catch (error) {
    console.error('Lỗi:', error.message);
    res.json({ response: 'Lỗi server: ' + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server chay cong ' + PORT);
});
