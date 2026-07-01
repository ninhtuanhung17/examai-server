const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ==========================================
// 1. HÀM TEST
// ==========================================
app.get('/', (req, res) => {
  res.json({ message: 'ExamAI Server đang chạy!' });
});

// ==========================================
// 2. HÀM CHAT VỚI AI
// ==========================================
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const prompt = `Bạn là trợ lý học tập thông minh. Trả lời ngắn gọn, dễ hiểu bằng tiếng Việt.
    
Câu hỏi: ${message}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ response: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. HÀM XỬ LÝ ĐỀ THI
// ==========================================
app.post('/process-exam', async (req, res) => {
  try {
    const { content, deckName, subject } = req.body;

    const prompt = `Từ nội dung sau, trích xuất câu hỏi trắc nghiệm.
    
YÊU CẦU:
- Tìm câu hỏi + 4 đáp án A, B, C, D
- Tìm đáp án đúng nếu có
- Phân loại độ khó: easy, medium, hard
- Trả về JSON

Trả về CHÍNH XÁC định dạng JSON:
{
  "questions": [
    {
      "questionNumber": 1,
      "question": "Nội dung câu hỏi",
      "options": {
        "A": "Đáp án A",
        "B": "Đáp án B",
        "C": "Đáp án C",
        "D": "Đáp án D"
      },
      "correctAnswer": "A",
      "explanation": "Giải thích ngắn",
      "topic": "Chủ đề",
      "difficulty": "medium"
    }
  ]
}

NỘI DUNG ĐỀ THI:
${content}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.json({
      success: true,
      deckName: deckName,
      subject: subject,
      questionsCount: parsed.questions.length,
      questions: parsed.questions
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy tại cổng ${PORT}`);
});
