const express = require("express");
const app = express();

//connecting to MongoDB
const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/Products")
  .then(() => console.log("Connected to MongoDB"))
  .catch((e) => console.log(e));

//creating schema

const Schema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  color: {
    type: String,
    require: true,
  },
  Instock: {
    type: Boolean,
    require: true,
  },
});
app.use(express.urlencoded({ extended: true }));

//creating model for the schema
const productModel = mongoose.model("Item", Schema);

const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index", { data: "Bikes data" });
});
app.get("/AddBike", (req, res) => {
  res.render("AddBike");
});

const InsertBike = (name, price, color, stock) => {
  try {
    const newBike = new productModel({
      name,
      price,
      color,
      Instock: stock,
    }).save();
    return newBike;
  } catch (e) {
    throw e;
  }
};

app.post("/AddBike", async (req, res) => {
  try {
    const { name, price, color, stock } = req.body;
    const newBike = await InsertBike(name, price, color, stock);
    res.redirect(`/bike/${newBike.id}`);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error!" });
  }
});
app.get("/bikes", async (req, res) => {
  const bikes = await productModel.find({});
  res.render("bikes", { bikes });
});

app.get("/bike/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await productModel.findById({ _id: id });
    if (data) {
      res.render("show", { data });
    } else {
      res.status(500).json({ message: "data not found!" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Invalid id entered!" });
  }
});

app.get("/bike/:id/Edit", async (req, res) => {
  const { id } = req.params;
  const data = await productModel.findById({ _id: id });
  console.log(data);
  res.render("edit", { data });
});
app.post("/bike/:id/edit", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, color, stock } = req.body;
    const updated = await productModel.findByIdAndUpdate(
      { _id: id },
      { name, price, color, Instock: stock },
      { new: true }
    );
    if (updated) {
      res.redirect(`/bike/${updated.id}`);
    } else {
      res.status(500).json({ message: "error occured check id" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: "Internal server error!" });
  }
});

app.get("/bike/:id/delete", async (req, res) => {
  const { id } = req.params;
  await productModel.findByIdAndDelete({ _id: id });
  res.redirect("/bikes");
});

app.listen("3000", (req, res) => {
  console.log("listening at port 3000");
});
