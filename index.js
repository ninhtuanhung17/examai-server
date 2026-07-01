const express = require('express');
const cors = require('cors');
// Sử dụng thư viện thế hệ mới của Google
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo SDK mới - Tự động nhận diện API chính thức v1 và chạy cực kỳ ổn định
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    
    // Cú pháp gọi hàm chuẩn của thư viện mới
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: prompt,
    });

    // Luôn trả về dữ liệu text sạch dạng JSON
    res.json({ response: response.text || 'Không có phản hồi từ AI' });
    
  } catch (error) {
    console.error('Lỗi:', error.message);
    res.json({ response: 'Lỗi server: [' + error.message + ']' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server chay cong ' + PORT);
});
