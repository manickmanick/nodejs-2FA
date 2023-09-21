const express = require("express");
const bodyParser = require("body-parser");
const engine = require("ejs-locals");
const app = express();
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

// Use ejs-locals for all ejs templates:
app.engine("ejs", engine);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs"); // so you can render('index')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize userSecret and imageUrl as empty strings
var userSecret = {
  ascii: "{rrn9hBtu}>Iz{,(dL>i&q)hZ^g[}R]r",
  hex: "7b72726e39684274757d3e497a7b2c28644c3e69267129685a5e675b7d525d72",
  base32: "PNZHE3RZNBBHI5L5HZEXU6ZMFBSEYPTJEZYSS2C2LZTVW7KSLVZA",
  otpauth_url:
    "otpauth://totp/SecretKey?secret=PNZHE3RZNBBHI5L5HZEXU6ZMFBSEYPTJEZYSS2C2LZTVW7KSLVZA",
};

// Route to set up a new user with a secret and QR code
app.get("/setup", function (req, res) {
  // Generate a new user secret
  userSecret = speakeasy.generateSecret();
  console.log("secret", userSecret);
  // Generate QR code and set the imageUrl
  var url = speakeasy.otpauthURL({
    secret: userSecret.base32,
    label: "Name of Secret",
    encoding: "base32",
  });
  QRCode.toDataURL(
    url,
    { errorCorrectionLevel: "H" },
    function (err, data_url) {
      imageUrl = data_url;

      // Render the "index" page with the QR code
      console.log(imageUrl);
      res.render("index", { imageUrl: imageUrl });
    },
  );
});

app.get("/", function (req, res) {
  res.render("index");
});
// Route to handle token verification
app.post("/verify", function (req, res) {
  // Get the user's token from the form
  const userToken = req.body.token;

  // Verify the token against the user's secret
  const verified = speakeasy.totp.verify({
    secret: userSecret.base32,
    encoding: "base32",
    token: userToken,
  });

  if (verified) {
    // Token is valid, send a success response
    res.send("Token is valid");
  } else {
    // Token is invalid, send an error response
    res.send("Token is invalid");
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
