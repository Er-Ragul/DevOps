const express = require('express');
const app = express();
const multer = require('multer');
const cors = require('cors');
const Realm = require('realm');
const axios = require('axios');

app.use(cors())
app.use(express.json())

/* Endpoint to connect with transform server */
const ENDPOINT = process.env.endpoint || 'http://192.168.0.213:8000'

/* Realm db schema */
const realmConfig = {
  path: "db/default.realm",
  schema: [
    {
      name: 'exchange',
      properties: {
          uid: 'string',
          name: 'string',
          size: 'string',
          type: 'string'
      }
    }
  ],
}

/* Multer storage configuration */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'library');
  },
  filename: (req, file, cb) => {
    let uid = Date.now()
    req._uid = uid
    cb(null, `${uid}.${file.originalname.split('.')[1]}`);
  },
});

const upload = multer({ storage });

/* To handle/provide server status */
app.get('/', (req, res) => {
    res.status(200).json({status: 'success', endpoint: ENDPOINT, message: 'Upload server is online 😊'})
})

/*---------------------- To handle file upload from web ----------------------*/
app.post('/upload', upload.single('file'), (req, res) => {
  let { name, size, type } = JSON.parse(req.body.data)

  Realm.open(realmConfig)
  .then(realm => {
      realm.write(() => {
          realm.create('exchange', { 
            uid: req._uid.toString(), name, size: size.toString(), type})
      })
    })
    .catch(e =>{
      console.log('Failed to store data', e)
    })
  
  //res.status(200).json({status: 'success', message: 'File uploaded successfully 😁'});
  //axios.get(`${ENDPOINT}/transform/${name}`)

  axios.get(`http://${ENDPOINT}/transform/${req._uid.toString()}.${name.split('.')[1]}`)
  .then(response => {
    res.status(200).json({status: 'success', message: 'File uploaded successfully 😁'});
  })
  .catch(err => {
    res.status(500).json({status: 'failed', message: 'Something went wrong 😔'});
  })
});

app.get('/read', (req, res) => {
  Realm.open(realmConfig)
  .then(realm => {
      const stored = realm.objects('exchange');
      res.send(stored)
  })
  .catch(error => {
      res.send('Data read failed')
  })
})

app.post('/delete', (req, res) => {
  try{
    Realm.open(realmConfig)
    .then(realm => {
        realm.write(() => {
            const toDelete = realm.objects('exchange').filtered(`uid = "${req.body.uid}"`);
            realm.delete(toDelete);
            res.status(200).json({status: "success", message: "File deleted successfully"})
        })
    })
    .catch(error => {
        console.log(error);
        res.send('Failed to delete the entry')
    })
  }
  catch(e){
      res.send('Failed to delet the file.')
  }
})

app.listen(3002, () => console.log(`Storage Server is running on port 3002`))