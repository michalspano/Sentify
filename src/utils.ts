/**
 * The utils.ts file contains all the utility functions used in the application.
 * @author Michal Spano, Ionel Pop
 * @todo add more utility functions
 */

import axios, { AxiosResponse } from 'axios';
import queryString from 'node:querystring';

/**
 * 
 * @param code the response code from the user's Spotify account
 * @returns the access token and expiration time
 * @throws an error if the response code is invalid
 * 
 * The authenticateSpotify function authenticates the user's Spotify account.
 * It takes in the response code from the user's Spotify account and sends a POST request to the Spotify API.
 * The Spotify API then returns an access token and expiration time.
 * The access token is used to make requests to the Spotify API.
 * The expiration time is used to refresh the access token.
 */
export const authenticateSpotify = async (code: any) => {
    try {
        const spotifyResponse: AxiosResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
             queryString.stringify({
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.RED_URI_DEC,
            }),
            {
                headers: {
                    Authorization: "Basic " + process.env.BASE64_AUTH,
                    'Content-Type': "application/x-www-form-urlencoded",
                },
            }
        );

        const { access_token, expires_in } = spotifyResponse.data;

        const acc_token: string = access_token;
        // TODO: explain the calculation and why it's necessary
        const expiration_time: number = Date.now() + expires_in * 1000;

        return { access_token: acc_token,
                 expiration_time: expiration_time
        };

    } catch (error: any) {
        console.error(`Error refreshing token: ${error.message}`);
    }
}

/**
 * The formatAccessPoint function formats the access point for the Spotify API.
 * @returns the formatted access point for the Spotify API
 * @todo add reference to the Spotify API documentation which deatils the access point
 */
export const formatAccessPoint = (): string => {
    return 'https://accounts.spotify.com/authorize?client_id=' +
        process.env.CLIENT_ID +
        '&response_type=code&redirect_uri=http%3A%2F%2F' +
        'localhost%3A8080%2Faccount&' +
        'scope=user-top-read'
}
