const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo và ép dùng API bản v1 ổn định
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
genAI.apiVersion = 'v1'; 

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

// Test endpoint
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
    
    // CÁCH LẤY TEXT CHUẨN AN TOÀN CHO CẢ BẢN CŨ VÀ MỚI:
    let text = '';
    if (result && result.response) {
      // Thử dùng hàm text() chuẩn của SDK
      if (typeof result.response.text === 'function') {
        text = result.response.text();
      } 
      // Nếu không phải hàm, kiểm tra xem nó có phải thuộc tính text thường không
      else if (result.response.text) {
        text = result.response.text;
      }
    }

    if (!text) {
      text = 'Không có phản hồi từ AI';
    }

    res.json({ response: text });
    
  } catch (error) {
    console.error('Lỗi thực thi:', error.message);
    res.json({ response: 'Lỗi server: [' + error.message + ']' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server chay cong ' + PORT);
});
