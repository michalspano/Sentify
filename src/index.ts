#!/usr/bin/env ts-node

/**
 * The index.ts file is the entry point of the application.
 * It contains the main function of the application.
 * @author Michal Spano, Ionel Pop
 * @todo add more endpoints, fix the types of the functions
 * @todo add more comments
 */

// global
let access_token: string | undefined = '';
let expiration_time: number | undefined = 0;
const viewsDirectory: string =  __dirname + '/../views/';

// imports
import { config as dotenvConfig} from 'dotenv';
import express, { response } from 'express';
import { authenticateSpotify, formatAccessPoint, getTopTracks } from './utils';

const app: express.Application = express();

// ejs settings
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Listen on the port 8080
app.listen(8080, () => {
  console.log("App is listening on port 8080!\n");
});

dotenvConfig(); // instanciate the dotenv config

/**
 * The "/" endpoint is the endpoint that the user is redirected to when they first visit the application.
 * The user is then redirected to the Spotify login page. The gathered response code is then used to 
 * authenticate the user's Spotify account; namely, the @code{authenticateSpotify()} function.
 */
app.get("/", (req, res) => {
  const accessPoint = formatAccessPoint();
  res.render(viewsDirectory + 'login', {
    access_point: accessPoint
  });
});

/**
 * The "/account" endpoint is the endpoint that the user is redirected to after signing in to their Spotify account.
 * The response code is then used to authenticate the user's Spotify account.
 */
app.get("/account", async (req , res) => {
  console.log("Spotify response code: " + req.query.code);

  // Proceed to verify the response code against the Spotify API
  authenticateSpotify(req.query.code).then((response) => {

    access_token = response?.access_token;
    expiration_time = response?.expiration_time;

    // TODO: do something with the response
    res.redirect("/home");
  });
});

/**
 * The "/home" endpoint is the user's main page.
 * Here the user will have options such as "get top tracks" or "personality test"
 */
app.get("/home",async (req, res) => {
  res.render(viewsDirectory + 'home');
});

/**
 * The "/tops" endpoint is the endpoint that the user is redirected once they click the
 * "Check your top tracks!" button in the Home page
 * The response code is then processed to display the user's top tracks and their respective audio data
 */
app.get("/tops", async (req, res) => {

  getTopTracks(access_token).then((response) => {
    res.render(viewsDirectory + 'tops', {
      tracks: response
    });

  });
});
