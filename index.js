const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const fs = require("fs-extra");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("services"));
app.use(fileUpload());

const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i4bni.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookingsCollection = client.db("apartmentRent").collection("bookings");
  const housesCollection = client.db("apartmentRent").collection("houses");

  app.post("/addRentHouse", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const price = req.body.price;
    const location = req.body.location;
    const bedroom = req.body.bedroom;
    const bathroom = req.body.bathroom;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    housesCollection
      .insertOne({ name, price, location, bedroom, bathroom, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.post("/addBookings", (req, res) => {
    const order = req.body;
    bookingsCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/houses", (req, res) => {
    housesCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/bookings", (req, res) => {
    bookingsCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get("/allBookings", (req, res) => {
    bookingsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
});

app.get("/", (req, res) => {
  res.send("This Epic Shit is Really Working!");
});

app.listen(process.env.PORT || port);
