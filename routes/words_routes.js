var express = require('express');
var path = require('path');
var router = express.Router();

const sqlite3 = require('sqlite3').verbose();

// let db = new sqlite3.Database(path.join(__dirname, '../database/vocabbler.db'), (err) => {
//   if (err) {
//     console.error(err.message);
//   } else {
//     console.log('Connected to database.');
//   }
// });

// db.run(`CREATE TABLE words (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   en text NOT NULL UNIQUE,
//   he text DEFAULT "(blank)",
//   pt text DEFAULT "(blank)",
//   cn text DEFAULT "(blank)"
// )`);

// db.run(`INSERT INTO words(en, he, pt, cn) VALUES (?, ?, ?, ?)`, ["sugar", "סוכר", "açúcar", "糖"], function(err) {
//   if (err) {
//     return console.log(err.message);
//   }
//   // get the last insert id
//   console.log(`A row has been inserted with rowid ${this.lastID}`);
// });

// db.close();


router.get('/', function(req, res, next) {
  res.render('words');
});


router.get('/list', function(req, res, next) {
  let db = new sqlite3.Database(path.join(__dirname, '../database/vocabbler.db'), (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Connected to database.');
    }
  });
  var records = [];
  db.serialize(() => {
    db.each(`SELECT * FROM words LIMIT 25`, (err, row) => {
      if (err) {
          console.error(err.message);
      } else {
          records.push(`<tr>
            <td>${row.id}</td>
            <td>${row.en}</td>
            <td>${row.he}</td>
            <td>${row.pt}</td>
            <td>${row.cn}</td>
          </tr>`);
      }
    }, (err, num) => {
      // db.each is asynchronous, so make sure to place send() in the callback
      // so that data is sent after all rows are executed
      if (err) {
        console.error(err.message);
      } else {
        let data = { "txt": records.join('') };
        res.send(data);
        db.close();
      }
    });
  });
});



router.post('/create', function(req, res, next) {
  var row = req.body;
  let db = new sqlite3.Database(path.join(__dirname, '../database/vocabbler.db'), (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Connected to database.');
    }
  });
  db.run(`INSERT INTO words(en, he, pt, cn) VALUES (?, ?, ?, ?)`, 
          [row['en'], row['he'], row['pt'], row['cn']], function(err) {
    if (err) {
      res.send({
        "status": 0  // failed
      });
      return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`);
    let data = {
      "status": 1, // success
      "txt": `<tr>
                <td>${this.lastID}</td>
                <td>${row['en']}</td>
                <td>${row['he']}</td>
                <td>${row['pt']}</td>
                <td>${row['cn']}</td>
              </tr>`
    };
    res.send(data);
    db.close();
    });
});

module.exports = router;