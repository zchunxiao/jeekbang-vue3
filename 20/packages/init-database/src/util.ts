import mysql from "mysql2/promise"; // 使用 promise 版本的 mysql2
import dotenv from "dotenv";

dotenv.config();

export const database = process.env.MYSQL_DATABASE;

const config = {
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};

const pool = mysql.createPool(config);
const poolDatabase = mysql.createPool({ ...config, ...{ database } });

export async function querySQLByPool(sql: string) {
  const connection = await pool.getConnection();
  try {
    const [results, fields] = await connection.query(sql);
    return { results, fields };
  } catch (err) {
    throw err; // 抛出错误
  } finally {
    connection.release(); // 确保连接被释放
  }
}

export async function queryDatabaseSQLByPool(sql: string) {
  const connection = await poolDatabase.getConnection();
  try {
    const [results, fields] = await connection.query(sql);
    return { results, fields };
  } catch (err) {
    throw err; // 抛出错误
  } finally {
    connection.release(); // 确保连接被释放
  }
}

export async function queryDatabaseSQL(
  sql: string,
  values: (string | number)[]
) {
  const conn = await mysql.createConnection({ ...config, database }); // 使用 await 获取连接
  try {
    const [rows] = await conn.query(sql, values); // 使用 Promise 版本的 query 方法
    return rows;
  } catch (err) {
    throw err; // 抛出错误
  } finally {
    await conn.end(); // 确保连接被关闭
  }
}

export async function closePools() {
  await Promise.all([pool.end(), poolDatabase.end()]); // 确保两个池都关闭
}
