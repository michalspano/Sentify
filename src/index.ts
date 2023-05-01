#!/usr/bin/env ts-node

/**
 * The index.ts file is the entry point of the application.
 * It contains the main function of the application.
 * @author Michal Spano, Ionel Pop
 * @todo add more endpoints, fix the types of the functions
 * @todo add more comments
 */

// imports
import { config as dotenvConfig} from 'dotenv';
import express from 'express';
import { authenticateSpotify, formatAccessPoint } from './utils';

const app: express.Application = express();

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
  res.send(`<a href=${formatAccessPoint()}>Sign in</a>`);
});

/**
 * The "/account" endpoint is the endpoint that the user is redirected to after signing in to their Spotify account.
 * The response code is then used to authenticate the user's Spotify account.
 */
app.get("/account", async (req , res) => {
  console.log("Spotify response code: " + req.query.code);

  // Proceed to verify the response code against the Spotify API
  authenticateSpotify(req.query.code).then((response) => {
    console.log(response);
    res.send("Success");
    // TODO: do something with the response
  });
});
