'use strict';

const cors = require('cors');
const express = require('express');
const smartcar = require('smartcar');

const app = express()
  .use(cors());
const port = 8000;

const client = new smartcar.AuthClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
  scope: ['read_vehicle_info','read_location'], 
  testMode: true,
});

// global variable to save our accessToken
let access;

app.get('/login', function(req, res) {
  const link = client.getAuthUrl();
  res.redirect(link);
});

app.get('/exchange', function(req, res) {
  const code = req.query.code;

  return client.exchangeCode(code)
    .then(function(_access) {
      // in a production app you'll want to store this in some kind of persistent storage
      access = _access;

      res.sendStatus(200);
    });
});

app.get('/vehicle', function(req, res) {
  return smartcar.getVehicleIds(access.accessToken)
    .then(function(data) {
      // the list of vehicle ids
      return data.vehicles;
    })
    .then(function(vehicleIds) {
      // instantiate the first vehicle in the vehicle id list
      let arrInfo = [];
      for(let i=0; i<vehicleIds.length; i++){
        let vehicle = new smartcar.Vehicle(vehicleIds[i], access.accessToken);
        
        arrInfo.push(vehicle.info());
      }
       return Promise.all(arrInfo);
      })
      .then(function(infos) {
        console.log(infos);
        res.json(infos)
      });
});


app.get('/location', function(req, res) {
  return smartcar.getVehicleIds(access.accessToken)
    .then(function(data) {
      // the list of vehicle ids
      return data.vehicles;
    })
    .then(function(vehicleIds) {
      // instantiate the first vehicle in the vehicle id list
      let arrLocations = [];
      for(let i=0; i<vehicleIds.length; i++){
        let vehicle = new smartcar.Vehicle(vehicleIds[i], access.accessToken);
        
        arrLocations.push(vehicle.location());
      }
      return Promise.all(arrLocations);
    })
    .then(function(locations) {
      console.log(locations);
      res.json(locations);
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
