const express = require('express');
const app = express();
const PORT = 3000;

const { executeQuery, closePool } = require('./db');

app.use(express.json());

// サーバーエラーを処理するhandleServerError()関数
function handleServerError(res, error, message = 'サーバーエラー') {
  console.error(error);
  res.status(500).json({ error: message });
}

// 作成
app.post('/todos', async (req, res) => {
  const { title, priority } = req.body;
  try {
    const result = await executeQuery(
      'INSERT INTO todos (title, priority) VALUES (?, ?);',
      [title, priority]
    );
    res.status(201).json({ 
      id: result.insertId, 
      title, 
      priority, 
      status: '未着手' 
    });
  } catch (err) {
    handleServerError(res, err, 'ToDo追加に失敗しました');
  }
});

// 読み取り
app.get('/todos', async (req, res) => {
  try {
    const rows = await executeQuery('SELECT * FROM todos;');
    res.status(200).json(rows);
  } catch (err) {
    handleServerError(res, err);
  }
});

// 更新
app.put('/todos/:id', async (req, res) => {
  const { title, priority, status } = req.body;
  try {
    const result = await executeQuery(
      'UPDATE todos SET title = ?, priority = ?, status = ? WHERE id = ?;',
      [title, priority, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: '更新対象のToDoが見つかりません' });
    } else {
      res.status(200).json({ 
        id: req.params.id, 
        title, 
        priority, 
        status 
      });
    }
  } catch (err) {
    handleServerError(res, err, 'ToDo更新に失敗しました');
  }
});

// 削除
app.delete('/todos/:id', async (req, res) => {
  try {
    const result = await executeQuery(
      'DELETE FROM todos WHERE id = ?;',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: '削除対象のToDoが見つかりません' });
    } else {
      res.status(200).json({ message: 'ToDoを削除しました' });
    }
  } catch (err) {
    handleServerError(res, err, 'ToDo削除に失敗しました');
  }
});

// アプリ終了時にDB接続プールを安全に閉じる処理
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
  process.on(signal, async () => {
    console.log(`\n${signal}を受信。アプリケーションの終了処理中...`);
    await closePool();
    process.exit();
  });
});

// Webサーバーを起動
app.listen(PORT, () => {
  console.log(`${PORT}番ポートでWebサーバーが起動しました。`);
});