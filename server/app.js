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

app.get('/register', (req, res) => {
  const connection = mysql.createConnection(connectSQLConfig)
  connection.connect()
  const user = req.query
  let SQL = `
    SELECT *
    FROM users
    WHERE openid = '${user.openid}'
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    if (row.length > 0) res.send('ok')
    else {
      SQL = `
        INSERT INTO users ( openid )
        VALUES ('${user.openid}')
      `
      connection.query(SQL, (err, row) => {
        if (err) throw err
        res.send('ok')
      })
    }
    connection.end()
  })
})
app.get('/allMyTags', (req, res) => {
  const connection = mysql.createConnection(connectSQLConfig)
  connection.connect()
  let SQL = `
    SELECT tags.*
    FROM tags, users
    WHERE tags.USID = users.USID AND '${req.query.openid}' = users.openid
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    res.send(row)
    connection.end()
  })
})
app.get('/addTag', (req, res) => {
  const connection = mysql.createConnection(connectSQLConfig)
  connection.connect()
  const data = req.query
  let SQL = `
      SELECT tags.*
      FROM tags, users
      WHERE tag_name = '${strFilter(data.tag)}' AND openid = '${data.openid}' AND users.USID = tags.USID
    `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    if (row.length > 0) res.send('标签已存在')
    else {
      SQL = `
          INSERT INTO tags ( tag_name, USID )
          VALUES ('${strFilter(data.tag)}', (SELECT USID FROM users WHERE openid = '${data.openid}'))
        `
      connection.query(SQL, (err, row) => {
        if (err) throw err
        res.send('ok')
      })
    }
    connection.end()
  })
})
app.get('/updateTag', (req, res) => {
  const connection = mysql.createConnection(connectSQLConfig)
  connection.connect()
  const data = req.query
  let SQL = `
      SELECT tags.*
      FROM tags, users
      WHERE tag_name = '${strFilter(data.tag)}' AND openid = '${data.openid}' AND users.USID = tags.USID
    `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    if (row.length > 0) res.send({msg:'标签已存在', code: 0})
    else {
      SQL = `
          UPDATE tags
          SET tag_name = '${data.tag}'
          WHERE TGID = '${(data.TGID)}'
        `
      connection.query(SQL, (err, row) => {
        if (err) throw err
        res.send({msg:'ok', code: 1})
      })
    }
    connection.end()
  })
})
app.get('/deleteTag', (req, res) => {
  const connection = mysql.createConnection(connectSQLConfig)
  connection.connect()
  const data = req.query
  let SQL = `
      DELETE FROM records
      WHERE TGID = '${(data.TGID)}'
    `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    SQL = `
      DELETE FROM tags
      WHERE TGID = '${(data.TGID)}'
    `
    connection.query(SQL, (err, row) => {
      if (err) throw err
      res.send('ok')
      connection.end()
    })
  })
})
app.get('/tagsOfDay', (req, res) => {
  const connection = mysql.createConnection(connectSQLConfig)
  connection.connect()
  let SQL = `
    SELECT TGID, RCID
    FROM records, users
    WHERE users.openid = '${req.query.openid}' AND records.USID = users.USID AND records.record_time = '${req.query.record_time}'
  `
  connection.query(SQL, (err, records_row) => {
    if (err) throw err
    const TGID_RCID = {}
    records_row.forEach(v => TGID_RCID[v.TGID] = v.RCID)
    SQL = `
      SELECT tags.*
      FROM tags, users
      WHERE tags.USID = users.USID AND openid = '${req.query.openid}'
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
      VALUES (${req.query.TGID},(SELECT USID FROM users WHERE openid = '${req.query.openid}'),'${req.query.record_time}')
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
    FROM records, users
    WHERE records.USID = users.USID AND openid = '${req.query.openid}' AND records.TGID = '${req.query.TGID}' AND records.record_time LIKE '${req.query.dateStr}%'
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    row.forEach((v,i)=> row[i] = parseInt(v.record_time.slice(-2)))
    res.send(row)
    connection.end()
  })
})
app.listen(1997, () => console.log('ok...' + new Date()))
