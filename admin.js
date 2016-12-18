const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Program = mongoose.model( 'Program');
const path = require('path');

router.use('/assets', express.static(path.join(__dirname, './app/assets')));

router.post('/add-program', (req, res) => {
  console.log(JSON.parse(req.body.data));
  const programData = JSON.parse(req.body.data);
  const newProg = new Program({
    title: programData.title,
    desc: programData.desc,
    testCases: programData.testCases,
    releaseDate: programData.releaseDate,
    functionName: programData.functionName,
    callSignature: programData.callSignature,
  });
  newProg
  .save()
  .then((data) => {
    res.send("yea");
  }, (err) => {
    res.send(err);
  });
});

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/index.html'));
});


module.exports = router;
