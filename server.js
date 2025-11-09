const express = require("express");
const path = require("path");
const fs = require('fs-extra');
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

const dataPath = path.join("http://localhost:3001", 'data');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// Load JSON data
const loadData = async () => {
    const fetch = (url, init) => import("node-fetch").then(({ default: fetch }) => fetch(url, init));

    const url = 'http://localhost:3001/data'; // Replace with your file URL
    const response = await fetch(url);
    return await response.json();
};

app.get("/", async (req, res) => {
    const data = await loadData();
    res.render("index", { data });
});

app.get("/about", async (req, res) => {
    const data = await loadData();
    res.render("about", { data });
});

app.get("/contact", async (req, res) => {
    const data = await loadData();
    res.render("contact", { data, submitted: false });
});

app.post("/contact", async (req, res) => {
    const data = await loadData();
    const { name, email, message } = req.body;
    console.log("Contact form:", { name, email, message });
    res.render("contact", { data, submitted: true });
});

app.listen(PORT, () => {
    console.log(`🍞 Your Bakery running at http://localhost:${PORT}`);
});
