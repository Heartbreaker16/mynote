const express = require('express')
const mysql = require('mysql')
const strFilter = str => {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
}
const correctTime = (myDate, format = 'date') => {
  const twoNum = num => {
    return ('0' + num).slice(-2)
  }
  switch (format) {
    case 'date':
      return `${myDate.getFullYear()}-${twoNum(myDate.getMonth() + 1)}-${twoNum(myDate.getDate())}`
    case 'full':
      return `${myDate.getFullYear()}-${twoNum(myDate.getMonth() + 1)}-${twoNum(myDate.getDate())} ${twoNum(myDate.getHours())}:${twoNum(myDate.getMinutes())}`
    case 'DateObj':
      return myDate
  }
}
const connectSQLConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'note',
  charset: 'utf8mb4'
}
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/register', (req, res) => {
  const connection = mysql.createConnection(connectSQLConfig)
  connection.connect()
  const user = req.body
  let SQL = `
    SELECT *
    FROM users
    WHERE users.account = '${user.account}'
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    if (row.length > 0) res.send('昵称已被注册')
    else {
      SQL = `
        INSERT INTO users ( account, password )
        VALUES ('${strFilter(user.account)}', '${strFilter(user.password)}')
      `
      connection.query(SQL, (err, row) => {
        if (err) throw err
        console.log(row)
        res.send('注册成功')
      })
    }
    connection.end()
  })
})
app.post('/login', (req, res) => {
  const connection = mysql.createConnection(connectSQLConfig)
  connection.connect()
  const user = req.body
  console.log(user)
  const SQL = `
    SELECT account, USID
    FROM users
    WHERE users.account = '${user.account}'  AND users.password = '${strFilter(user.password)}'
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    console.log(row)
    if (row.length === 1) res.send(row[0])
    else res.send('账户或密码错误')
  })
  connection.end()
})
app.get('/allMyTags', (req, res) => {
  const connection = mysql.createConnection(connectSQLConfig)
  connection.connect()
  let SQL = `
    SELECT *
    FROM tags
    WHERE tags.USID = '${req.query.USID}'
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    res.send(row)
    connection.end()
  })
})
app.post('/addTag', (req, res) => {
  const connection = mysql.createConnection(connectSQLConfig)
  connection.connect()
  const body = req.body
  let SQL = `
      SELECT *
      FROM tags
      WHERE tags.tag_name = '${strFilter(body.tag)}' AND tags.USID = '${body.USID}'
    `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    if (row.length > 0) res.send('标签已存在')
    else {
      SQL = `
          INSERT INTO tags ( tag_name, USID )
          VALUES ('${strFilter(body.tag)}', '${body.USID}')
        `
      connection.query(SQL, (err, row) => {
        if (err) throw err
        res.send('添加成功')
      })
    }
    connection.end()
  })
})
app.get('/tagsOfDay', (req, res) => {
  const connection = mysql.createConnection(connectSQLConfig)
  connection.connect()
  let SQL = `
    SELECT TGID, RCID
    FROM records
    WHERE records.USID = '${req.query.USID}' AND records.record_time = '${req.query.record_time}'
  `
  connection.query(SQL, (err, records_row) => {
    if (err) throw err
    const TGID_RCID = {}
    records_row.forEach(v => TGID_RCID[v.TGID] = v.RCID)
    SQL = `
      SELECT *
      FROM tags
      WHERE tags.USID = '${req.query.USID}'
    `
    connection.query(SQL, (err, tags_row) => {
      if (err) throw err
      tags_row.forEach(v => v.RCID = TGID_RCID[v.TGID])
      res.send(tags_row)
    })
    connection.end()
  })
})
app.get('/changeTagStatusOnDate', (req, res) => {
  const connection = mysql.createConnection(connectSQLConfig)
  connection.connect()
  // console.log(req.query) ;return
  const SQL = req.query.RCID ? 
    ` DELETE FROM records WHERE records.RCID = '${req.query.RCID}'
    `
    : `
      INSERT INTO records (TGID, USID, record_time)
      VALUES (${req.query.TGID},${req.query.USID},${req.query.record_time})
    `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    res.send({status:'ok', RCID: req.query.RCID ? undefined : row.insertId})
    connection.end()
  })
})
app.get('/overview', (req, res) => {
  const connection = mysql.createConnection(connectSQLConfig)
  connection.connect()
  const SQL = `
    SELECT record_time
    FROM records
    WHERE records.USID = ${req.query.USID} AND records.TGID = '${req.query.TGID}' AND records.record_time LIKE '${req.query.dateStr}%'
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    row.forEach((v,i)=> row[i] = parseInt(v.record_time.slice(-2)))
    res.send(row)
    connection.end()
  })
})
app.listen(1997, () => console.log('ok...' + new Date()))
