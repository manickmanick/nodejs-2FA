const express = require("express");
const bodyParser = require("body-parser");
const engine = require("ejs-locals");
const app = express();
var speakeasy = require("speakeasy");
var QRCode = require("qrcode");
// use ejs-locals for all ejs templates:
app.engine("ejs", engine);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs"); // so you can render('index')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var imageUrl = "";

// //////////////////////////////////////////////////////////
var userSecret = speakeasy.generateSecret();
QRCode.toDataURL(userSecret.otpauth_url, function (err, data_url) {
  imageUrl = data_url;
});

/////////////////////////////////////////////////////
app.get("/", function (req, res) {
  res.render("index", { imageUrl: imageUrl });
});

app.post("/verify", function (req,res) {
  var verified = speakeasy.totp.verify({
    secret: userSecret.base32,
    encoding: "base32",
    token: req.body.token,
  });
  if (verified) {
    res.send("success");
  }
});

app.listen(3000);
