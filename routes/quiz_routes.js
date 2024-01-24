var express = require('express');
var path = require('path');
var router = express.Router();

const sqlite3 = require('sqlite3').verbose();


router.get('/', function(req, res, next) {
    res.render('quiz');
  });


router.get('/question', function(req, res, next) {
    let db = new sqlite3.Database(path.join(__dirname, '../database/vocabbler.db'), (err) => {
        if (err) {
        console.error(err.message);
        } else {
        console.log('Connected to database.');
        }
    });
    db.all(`SELECT * FROM words ORDER BY RANDOM() LIMIT 1`, function(err, row) {
        if (err) {
            res.send({
                "status": 0  // failed
            });
            console.log(err.message);
        } else {
            var data = {
                'status': 1
            };
            var words = [];
            row.forEach((row) => {
                for (const lang in row) {
                    if (lang == 'id' || row[lang] === null || row[lang] == '') { continue; }
                    words.push([lang, row[lang]]);
                }
            })

            console.log(words);
            words = words.sort(() => { return 0.5 - Math.random(); });  // shuffle the words
            console.log(words);
            let i = 0;
            for ([lang_code, word_lang] of words) {
                if (i == 2) { break; }
                if (i == 0) {
                    data["lang1"] = lang_code;
                    data["word_lang1"] = word_lang;
                }
                if (i == 1) {
                    data["lang2"] = lang_code;
                    data["word_lang2"] = word_lang;
                }
                i++;
            }
        }

        db.get(`SELECT lang_name FROM langs WHERE iso_code=?`, data["lang1"],
            function (err, row1) {
                if (err) {
                    console.error(err.message);
                    res.send({ "status": 0 });
                    return;
                }
                data["lang1"] = row1.lang_name;
                db.get(`SELECT lang_name FROM langs WHERE iso_code=?`, data["lang2"],
                function (err, row2) {
                    if (err) {
                        console.error(err.message);
                        res.send({ "status": 0 });
                        return;
                    }
                    data["lang2"] = row2.lang_name;
                    console.log(data);
                    res.send(data);
                    db.close();
                }
            )
            }
        )
    });
});


module.exports = router;