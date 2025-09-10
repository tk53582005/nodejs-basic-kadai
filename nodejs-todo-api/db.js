const mysql = require('mysql2/promise');

// DB接続設定
const dbConfig = {
  host: 'localhost',
  port: 8889,
  user: 'root',
  password: 'root',
  database: 'nodejs_db_kadai'
};

// DB接続プールの作成
const pool = mysql.createPool(dbConfig);

// DB接続プールを破棄するclosePool()関数
async function closePool() {
  try {
    await pool.end();
    console.log('データベース接続プールを破棄しました。');
  } catch (err) {
    console.error('データベース接続プールの破棄中にエラーが発生しました：', err);
  }
}

// SQL文を実行するexecuteQuery()関数
async function executeQuery(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// closePool()関数とexecuteQuery()関数のエクスポート
module.exports = {
  closePool,
  executeQuery
};