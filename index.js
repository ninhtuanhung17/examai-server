const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_API_KEY || 'dummy-key';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

app.get('/', (req, res) => {
  res.json({ message: 'ExamAI Server OK!' });
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.json({ response: 'Vui lòng nhập câu hỏi!' });
    }

    // Gọi Gemini API bằng fetch (có sẵn trong Node 18+)
    const response = await fetch(GEMINI_URL + '?key=' + GEMINI_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Trả lời ngắn gọn bằng tiếng Việt: ' + message }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.json({ response: 'Lỗi Gemini: ' + data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ response: reply || 'Không có phản hồi' });

  } catch (error) {
    res.json({ response: 'Lỗi: ' + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server chay cong ' + PORT);
});
