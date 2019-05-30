const express = require('express')
const mysql = require('mysql')
const FilePath = require('path').join(__dirname, 'files')
const connectMySQL = () => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'newroot',
    password: '123456',
    database: 'note',
    charset: 'utf8mb4'
  })
  connection.connect()
  return connection
}
const Encode = str => {
  return Buffer.from(str).toString('base64')
}
const Decode = code => {
  return Buffer.from(code, 'base64').toString()
}
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(FilePath))

app.get('/register', (req, res) => {
  const connection = connectMySQL()
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
        connection.end()
      })
    }
  })
})
app.get('/allMyTags', (req, res) => {
  const connection = connectMySQL()
  let SQL = `
    SELECT tags.*
    FROM tags, users
    WHERE tags.USID = users.USID AND '${req.query.openid}' = users.openid
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    row.forEach(v => v.tag_name = Decode(v.tag_name).replace(v.USID.toString(),''))
    res.send(row)
    connection.end()
  })
})
app.get('/addTag', (req, res) => {
  const connection = connectMySQL()
  const data = req.query
  let SQL = `SELECT USID FROM users WHERE openid = '${data.openid}'`
  connection.query(SQL, (err, row) => {
    const USID = row[0].USID
    SQL = `
      SELECT *
      FROM tags
      WHERE tag_name = '${Encode(USID + data.tag)}' AND USID = ${USID}
    `
    connection.query(SQL, (err, row) => {
      if (err) throw err
      if (row.length > 0) res.send({msg:'标签已存在', code: 0})
      else {
        SQL = `
          INSERT INTO tags ( tag_name, USID )
          VALUES ('${Encode(USID + data.tag)}', ${USID})
        `
        connection.query(SQL, (err, row) => {
          if (err) throw err
          res.send({msg:'ok', code: 1})
          connection.end()
        })
      }
    })
  })
})
app.get('/updateTag', (req, res) => {
  const connection = connectMySQL()
  const data = req.query
  let SQL = `SELECT USID FROM users WHERE openid = '${data.openid}'`
  connection.query(SQL, (err, row) => {
    if (err) throw err
    const USID = row[0].USID
    SQL = `
      SELECT *
      FROM tags
      WHERE tag_name = '${Encode(USID + data.tag)}' AND USID = ${USID}
    `
    connection.query(SQL, (err, row) => {
      if (err) throw err
      if (row.length > 0) res.send({msg:'标签已存在', code: 0})
      else {
        SQL = `
          UPDATE tags
          SET tag_name = '${Encode(USID + data.tag)}'
          WHERE TGID = '${(data.TGID)}'
        `
        connection.query(SQL, (err, row) => {
          if (err) throw err
          res.send({msg:'ok', code: 1})
          connection.end()
        })
      }
    })
  })
})
app.get('/deleteTag', (req, res) => {
  const connection = connectMySQL()
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
  const connection = connectMySQL()
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
      tags_row.forEach(v => {
        v.RCID = TGID_RCID[v.TGID]
        v.tag_name = Decode(v.tag_name).replace(v.USID.toString(),'')
      })
      res.send(tags_row)
      connection.end()
    })
  })
})
app.get('/changeTagStatusOnDate', (req, res) => {
  const connection = connectMySQL()
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
  const connection = connectMySQL()
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
