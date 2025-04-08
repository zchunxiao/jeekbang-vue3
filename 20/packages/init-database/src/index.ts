/* eslint-disable no-console */
import {
  database,
  querySQLByPool,
  queryDatabaseSQLByPool,
  queryDatabaseSQL,
  closePools
} from './util';
import sqlUserInfo from './sql/user_info.sql?raw';
import sqlPageInfo from './sql/page_info.sql?raw';
import sqlPageSnapshot from './sql/page_snapshot.sql?raw';
import sqlMaterialInfo from './sql/material_info.sql?raw';
import sqlMaterialSnapshot from './sql/material_snapshot.sql?raw';

import sqlInsertUserInfo from './sql/insert_user_info.sql?raw';
import sqlInsertMaterialInfo from './sql/insert_material_info.sql?raw';
import sqlInsertMaterialSnapshot from './sql/insert_material_snapshot.sql?raw';

async function initDatabase() {
  const sqlDB = `CREATE DATABASE IF NOT EXISTS ${database};`;
  await querySQLByPool(sqlDB);
  console.log(`运营搭建平台 - 数据库 ${database} 建库成功！`);

  await queryDatabaseSQLByPool(sqlUserInfo);
  console.log(`运营搭建平台 - 数据库 ${database} 建表 user_info 成功！`);

  await queryDatabaseSQLByPool(sqlPageInfo);
  console.log(`运营搭建平台 - 数据库 ${database} 建表 page_info 成功！`);

  await queryDatabaseSQLByPool(sqlPageSnapshot);
  console.log(`运营搭建平台 - 数据库 ${database} 建表 page_snapshot 成功！`);

  await queryDatabaseSQLByPool(sqlMaterialInfo);
  console.log(`运营搭建平台 - 数据库 ${database} 建表 material_info 成功！`);

  await queryDatabaseSQLByPool(sqlMaterialSnapshot);
  console.log(
    `运营搭建平台 - 数据库 ${database} 建表 material_snapshot 成功！`
  );

  console.log(
    `运营搭建平台 - 数据库 ${database} 建表 material_snapshot 成功！`
  );

  await closePools();

  const userInfoCount: { user_count: number }[] = (await queryDatabaseSQL(
    'SELECT COUNT(*) AS user_count FROM user_info;',
    []
  )) as { user_count: number }[];
  if (userInfoCount?.[0]?.user_count === 0) {
    console.log(`运营搭建平台 - 数据库 ${database}.user_info 表暂无数据`);
    await queryDatabaseSQL(sqlInsertUserInfo, []);
    console.log(
      `运营搭建平台 - 数据库 ${database} 插入初始数据到 user_info 表成功！`
    );
    console.log('运营搭建平台 - 完成数据库初始化！');
  }

  const materialInfoCount: { material_count: number }[] =
    (await queryDatabaseSQL(
      'SELECT COUNT(*) AS material_count FROM material_info;',
      []
    )) as { material_count: number }[];
  if (materialInfoCount?.[0]?.material_count === 0) {
    console.log(`运营搭建平台 - 数据库 ${database}.material_info 表暂无数据`);
    await queryDatabaseSQL(sqlInsertMaterialInfo, []);
    console.log(
      `运营搭建平台 - 数据库 ${database} 插入初始数据到 material_info 表成功！`
    );
    console.log('运营搭建平台 - 完成数据库初始化！');
  }

  const materialSnapshotCount: { spanshot_count: number }[] =
    (await queryDatabaseSQL(
      'SELECT COUNT(*) AS spanshot_count FROM material_snapshot;',
      []
    )) as { spanshot_count: number }[];
  if (materialSnapshotCount?.[0]?.spanshot_count === 0) {
    console.log(
      `运营搭建平台 - 数据库 ${database}.material_snapshot 表暂无数据`
    );
    await queryDatabaseSQL(sqlInsertMaterialSnapshot, []);
    console.log(
      `运营搭建平台 - 数据库 ${database} 插入初始数据到 material_spanshot 表成功！`
    );
    console.log('运营搭建平台 - 完成数据库初始化！');
  }

  // const data = await queryDatabaseSQL(
  //   'SELECT `id`, `username`from user_info;',
  //   []
  // );
}

async function init() {
  await initDatabase();
}

init();
