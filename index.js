const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// SỬA TẠI ĐÂY: Thêm apiVersion: 'v1' để ép thư viện dùng bản ổn định, tránh lỗi 404 của v1beta
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1' });
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

// Test
app.get('/', (req, res) => {
  res.json({ message: 'ExamAI Server OK!' });
});

// Chat với AI
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ response: 'Vui lòng nhập câu hỏi!' });
    }

    const prompt = 'Trả lời ngắn gọn bằng tiếng Việt: ' + message;
    const result = await model.generateContent(prompt);
    
    // Đảm bảo lấy text an toàn
    const text = result.response && typeof result.response.text === 'function' 
      ? result.response.text() 
      : 'Không có phản hồi từ AI';

    // Luôn trả về response dạng JSON
    res.json({ response: text });
    
  } catch (error) {
    console.error('Lỗi:', error.message);
    // Trả về lỗi định dạng JSON sạch để app Android đọc được, không bị crash parse HTML
    res.json({ response: 'Lỗi server: [' + error.message + ']' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server chay cong ' + PORT);
});
