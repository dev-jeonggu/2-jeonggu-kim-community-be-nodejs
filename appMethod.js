const express = require('express');
const app = express();
const PORT = 3000;

// NOTE : JSON 파싱 미들웨어
app.use(express.json());

let items = []; // NOTE : 데이터를 저장할 임시 배열

// NOTE : GET 요청 - 모든 아이템 조회
app.get('/items', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fetched all items',
    data: items
  });
});

// NOTE : POST 요청 - 새로운 아이템 추가
app.post('/items', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  const newItem = { id: items.length + 1, name };
  items.push(newItem);
  res.status(201).json({
    success: true,
    message: 'Item created',
    data: newItem
  });
});

// NOTE : PUT 요청 - 전체 아이템 업데이트
app.put('/items/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  const item = items.find(item => item.id === parseInt(id));
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }
  
  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  item.name = name;
  res.status(200).json({
    success: true,
    message: 'Item updated',
    data: item
  });
});

// NOTE : PATCH 요청 - 특정 필드 수정
app.patch('/items/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const item = items.find(item => item.id === parseInt(id));
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  if (name) {
    item.name = name;
  }

  res.status(200).json({
    success: true,
    message: 'Item partially updated',
    data: item
  });
});

// NOTE : DELETE 요청 - 아이템 삭제
app.delete('/items/:id', (req, res) => {
  const { id } = req.params;
  
  const itemIndex = items.findIndex(item => item.id === parseInt(id));
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  items.splice(itemIndex, 1);
  res.status(200).json({
    success: true,
    message: 'Item deleted'
  });
});

// NOTE : 서버 실행
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});