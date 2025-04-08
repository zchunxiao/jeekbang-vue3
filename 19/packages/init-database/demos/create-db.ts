import mysql from "mysql2";
import dotenv from "dotenv";
/**
 * 用来加载 .env 文件中的环境变量到 process.env 中的函数。
 */
dotenv.config();

// 需要创建的数据库名称
const database = process.env.MYSQL_DATABASE;
// 数据库连接配置
const config = {
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};

/**
 * 创建一个数据库连接池
 * 用来建库
 */
const pool = mysql.createPool(config);

const querySQLByPool = (sql: string) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, (error, results, fields) => {
      if (error) {
        pool.end();
        reject(error);
      } else {
        pool.end();
        resolve({ results, fields });
      }
    });
  });
};
const init = async () => {
  const sqlDB = `CREATE DATABASE IF NOT EXISTS ${database}`;
  await querySQLByPool(sqlDB);
  console.log(`运营搭建平台-数据库${database}创建成功！`);
};
/**
 * 开始数据库初始化
 */
init();
