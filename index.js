const fs = require('fs');
const fetch = require('node-fetch')
const FormData = require('form-data')
const axios = require('axios')
const path = require('path')
const fbDownloader = require("fb-downloader-scrapper")
const igdl = require("./igdl")
const nsfw = require('nsfwjs')
const jpeg = require('jpeg-js')
const rimraf = require('rimraf')
const { Maker } = require('imagemaker.js')
rimraf(__dirname + "/uploads/*", function() { console.log("done"); })

//ATTP
async function attp(link, left, right) {
  new Maker()
    .TextPro(link, [left, right])
    .then(res => {
      return res
    })
}

let _model
const http = require("http");

const express = require("express");

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 3000;

// httpServer.listen(PORT, () => {
//   console.log(`Server is listening on port ${PORT}`);
// });

// put the HTML file containing your form in a directory named "public" (relative to where this script is located)
app.get("/", express.static(path.join(__dirname, "./public")));
var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const multer = require("multer");

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const upload = multer({
  dest: "./uploads"
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});
const upload2 = multer()

app.post(
  "/removebg",
  upload.single("file" /* name attribute of <file> element in your form */),
  async (req, res) => {
    const tempPath = req.file.path;
    const output = `./uploads/${Math.floor(Math.random() * 1000) + 1}.png`
    const targetPath = path.join(__dirname, output);

    if (path.extname(req.file.originalname).toLowerCase() === ".png" || path.extname(req.file.originalname).toLowerCase() === ".jpg" || path.extname(req.file.originalname).toLowerCase() === ".jpeg") {
      fs.rename(tempPath, targetPath, async (err) => {
        if (err) return handleError(err, res);
        // let a = await x()
        let data = new FormData();
        data.append('image_file', fs.createReadStream(targetPath));
        // const buffer = data.getBuffer()
        data.getLength(async function(err, length) {
          let response = await axios({
            method: 'post',
            url: 'https://api.baseline.is/v1/background-remover/',
            data: data,
            headers: {
              "Content-Type": "multipart/form-data",
              'Authorization': "Token 2f9b91b6a047821e3d6e0277ce1981d910d5f187",
              "Content-Length": length
            }
          })
          var img = Buffer.from(response.data.content, 'base64');
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
          });
          res.end(img)
          if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath)
        })


      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);

        res
          .status(403)
          .contentType("text/plain")
          .end("Only .png files are allowed!");
      });
    }
  }
)

app.post(
  "/facebook",
  async (req, res) => {
    let response = await fbDownloader(req.body.link)
    res.send(response)
  }
)

app.post("/instagram", async (req, res) => {
  let response = await igdl(req.body.link)
  res.send(response)
})

app.post(
  "/attp",
  async (req, res) => {
    // console.log(req.body.link + req.body.left + req.body.right)
    let attp = new Maker()
    let x = await attp.TextPro(req.body.link, [req.body.left, req.body.right])
    res.send(x)
  }
)

// app.post('/nsfw', upload2.single("image"), async (req, res) => {
//   if (!req.file)
//     res.status(400).send("Missing image multipart/form-data")
//   else {

//   }
// })

app.post(
  "/nsfw",
  upload.single("image" /* name attribute of <file> element in your form */),
  async (req, res) => {
    const tempPath = req.file.path;
    const output = `./uploads/${Math.floor(Math.random() * 1000) + 1}.jpg`
    const targetPath = path.join(__dirname, output);

    if (path.extname(req.file.originalname).toLowerCase() === ".png" || path.extname(req.file.originalname).toLowerCase() === ".jpg" || path.extname(req.file.originalname).toLowerCase() === ".jpeg") {
      fs.rename(tempPath, targetPath, async (err) => {
        if (err) return handleError(err, res);

        const image = await jpeg.decode(fs.readFileSync(targetPath))
        // const image = await convert(fs.readFileSync(targetPath))
        const predictions = await _model.classify(image)
        // image.dispose()
        res.json(predictions)


      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);

        res
          .status(403)
          .contentType("text/plain")
          .end("Only .png files are allowed!");
      });
    }
  }
)

const load_model = async () => {
  _model = await nsfw.load()
}

// Keep the model in memory, make sure it's loaded only once
load_model().then(() => app.listen(8080))