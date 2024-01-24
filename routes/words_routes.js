var express = require('express');
var path = require('path');
var router = express.Router();

const sqlite3 = require('sqlite3').verbose();

var fs = require('fs');

// Check DB
try {
  fs.statSync(path.join(__dirname, '../database/vocabbler.db'));
  console.log('DB detected.');
}
catch (err) {
  if (err.code === 'ENOENT') {
    console.log('No DB file found. Initializing db...');
    create_db();
  }
}


function create_db() {
  let db = new sqlite3.Database(path.join(__dirname, '../database/vocabbler.db'), (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Connected to database.');
    }
  });

  db.get(
    `SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='langs';`, 
      function(err, table_exists) {
        if (err) {
          console.error(err.message);
          return;
        }
        if (table_exists == 1) {
          return;
        } else {
          db.run(`CREATE TABLE langs (
            iso_code text NOT NULL,
            lang_name text NOT NULL
          )`)
          var lang_json = JSON.parse(fs.readFileSync(
            path.join(__dirname, "../database/misc/isocode2language.json"), 'utf8'));
          const pairs = lang_json.map(([iso, common_name]) => `(${iso}, ${common_name})`).join("");
          db.run(`INSERT INTO langs (iso_code, lang_name) VALUES ${pairs}}`);
          db.serialize(() => {
            db.each(`SELECT * FROM langs`, (err, row) => {
            }, (err, num) => {
              // db.each is asynchronous, so make sure to place send() in the callback
              // so that data is sent after all rows are executed
              if (err) {
                console.error(err.message);
              } else {
                console.log(row.iso_code + "\t" + row.lang_name);
              }
            });
          });
        }
      }
  )


  db.run(`CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    en text NOT NULL,
    he text DEFAULT "(blank)",
    pt text DEFAULT "(blank)",
    cn text DEFAULT "(blank)"
  )`);
}


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
    db.each(`SELECT * FROM words LIMIT 20`, (err, row) => {
      if (err) {
          console.error(err.message);
      } else {
          var record = {};
          for (const column in row) {record[column] = row[column];}
          records.push(record);
      }
    }, (err, num) => {
      // db.each is asynchronous, so make sure to place send() in the callback
      // so that data is sent after all rows are executed
      if (err) {
        console.error(err.message);
      } else {
        let data = { "words": records };
        res.send(data);
        console.log(records);
        db.close();
      }
    });
  });
});


router.post('/create', function(req, res, next) {
  console.log(req.body);
  var row = req.body;
  var columns = Object.keys(row);
  var values = Object.values(row);
  // Connect to database
  let db = new sqlite3.Database(path.join(__dirname, '../database/vocabbler.db'), (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Connected to database.');
    }
  });
  
  db.get(
    `SELECT COUNT(*) AS cntr FROM words WHERE en = ?`,
    [row['en']], function(err, count_row) {
      if (err) {
        console.error(err.message);
        return;
      }
      // If the word is a duplicate, update empty columns of the existing record
      if (count_row.cntr == 1) {
        console.log("Updating existing row.");
        var updates = Object.entries(row).filter(([k, v]) => v !== '' && v!== null && v !== undefined);
        var subq= updates.map(([k, v]) => `${k} = ?`).join(',');
        db.run(`UPDATE words SET ${subq} WHERE en = ?`,
          [...updates.map(([k, v]) => v), row['en']], function(err) {
            if (err) {
              res.send({"status": 0});
              return console.log(err.message);
            }
            console.log(`A row has been updated.`);
            var updated = row;
            updated["id"] = this.lastID;
            let data = {
              "status": 1, // success
              "updated": updated
            };
            res.send(data);
        })
      } else {
        db.run(`INSERT INTO words(${columns.join(',')}) VALUES (${values.map(() => '?').join(',')})`, 
              values, function(err) {
          if (err) {
            res.send({"status": 0});
            return console.log(err.message);
          }
          // get the last insert id
          console.log(`A row has been inserted with row_id ${this.lastID}`);
          var inserted = row;
          inserted["id"] = this.lastID;
          let data = {
            "status": 1, // success
            "inserted": inserted
          };
          res.send(data);
        });
      }
    }
  );


    db.close();
});

module.exports = router;