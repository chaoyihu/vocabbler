var express = require('express');
var path = require('path');
var router = express.Router();

const sqlite3 = require('sqlite3').verbose();

var fs = require('fs');


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

  db.run(`CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    en text NOT NULL,
    pt text DEFAULT "(blank)",
    zh_cn text DEFAULT "(blank)"
  )`);

  db.serialize(() => {
    db.get(
      `SELECT COUNT(*) as sig FROM sqlite_master WHERE type='table' AND name='langs';`,
      function (err, table_exists) {
        console.log(table_exists);
        if (err) {
          console.error(err.message);
          return;
        }
        if (table_exists.sig === 0) {
          console.log("Table does not exist, create it");
          createTable();
        }
      }
    );
  });
  
  function createTable() {
    db.run(
      `CREATE TABLE langs (
        iso_code text NOT NULL,
        lang_name text NOT NULL
      )`,
      function (err) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log("Table 'langs' created.");
        // Table created, now insert data
        insertData();
      }
    );
  }
  
  function insertData() {
    var lang_json = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../database/misc/isocode2language.json"), "utf8")
    );
    const pairs = Object.entries(lang_json)
      .map(([iso, common_name]) => `("${iso}", "${common_name}")`)
      .join(",");
    db.run(`INSERT INTO langs (iso_code, lang_name) VALUES ${pairs}`, function (err) {
      if (err) {
        console.log("inserting");
        console.error(err.message);
        return;
      }
      console.log("Data inserted into 'langs' table.");
      db.close();
    });
  }

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
        var subq = updates.map(([k, v]) => `${k} = ?`).join(',');
        db.get(`UPDATE words SET ${subq} WHERE en = ? RETURNING *`,
          [...updates.map(([k, v]) => v), row['en']], function(err, row) {
            if (err) {
              res.send({"status": 0});
              return console.log(err.message);
            }
            console.log(`A row has been updated.`);
            let data = {
              "status": 1, // success
              "updated": {}
            };
            for (const column in row) {
              data["updated"][column] = row[column];
            }
            res.send(data);
        })
      } else {
        db.get(`INSERT INTO words (${columns.join(',')}) VALUES (${values.map(() => '?').join(',')}) RETURNING *`, 
              values, function(err, row) {
          if (err) {
            res.send({"status": 0});
            return console.log(err.message);
          }
          console.log(`A row has been inserted with row_id ${this.lastID}`);
          let data = {
            "status": 1, // success
            "inserted": {}
          };
          for (const column in row) {
            data["inserted"][column] = row[column];
          }
          res.send(data);
        });
      }
    }
  );

  db.close();
});


router.delete('/delete/:id', function (req, res) {
  const wid = parseInt(req.params.id, 10);
  let db = new sqlite3.Database(path.join(__dirname, '../database/vocabbler.db'), (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Connected to database.');
    }
  });
  db.run(`DELETE FROM words WHERE id=?`, [wid], function (err) {
    if (err) {
      res.send({"status": 0});
      return console.log(err.message);
    }
    console.log(`Deleted row with id ${wid}`);
    res.send({"status": 1});
  })
  db.close();
})

module.exports = router;