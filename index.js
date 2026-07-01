const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Ép thư viện sử dụng bản v1 chính thức
genAI.apiVersion = 'v1'; 

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

app.get('/', (req, res) => {
  res.json({ message: 'ExamAI Server OK!' });
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ response: 'Vui lòng nhập câu hỏi!' });

    const prompt = 'Trả lời ngắn gọn bằng tiếng Việt: ' + message;
    const result = await model.generateContent(prompt);
    const text = result.response && typeof result.response.text === 'function' 
      ? result.response.text() 
      : 'Không có phản hồi từ AI';

    res.json({ response: text });
  } catch (error) {
    console.error('Lỗi:', error.message);
    res.json({ response: 'Lỗi server: [' + error.message + ']' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server chay cong ' + PORT));
