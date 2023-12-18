require('dotenv').config();
var express = require('express');
var path = require('path');
var morgan = require('morgan');

var app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const usersRouter = require("./routes/usersRoutes");
const petsRouter = require("./routes/petsRoutes");

app.use("/users", usersRouter);
app.use("/pets", petsRouter);

// When we don't find anything

app.use((req, res, next) => {
  res.status(404).send({ msg: "No resource or page found." });
})

// When we find an error (means it was not treated previously)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send(err);
})

const port = parseInt(process.env.port || '8080');
app.listen(port, function () {
  console.log("Server running at http://localhost:" + port);
});