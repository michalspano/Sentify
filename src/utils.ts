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

/**
 * 
 * @param accessToken the response code from the login process in the "/account" end point
 * @returns the top 10 tracks of the user with relevant audio data
 * 
 * The getTopTracks function requests the top 10 tracks from the user's Spotify account.
 * It then gathers audio data from the tracks such as:
 *  name,
 *  id,
 *  key,
 *  energy,
 *  genres
 */
export const getTopTracks = async (accessToken: any) => {
    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
            params: {
                limit: 10,
                time_range: 'medium_term',
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const tracks = await Promise.all(response.data.items.map(async (item: any) => {
            const audio = await axios.get(`https://api.spotify.com/v1/audio-features/${item.id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${item.artists[0].id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            return {
                name: item.name,
                id: item.id,
                key: audio.data.key,
                energy: audio.data.energy,
                genres: artistResponse.data.genres,
            };
        }));
        return tracks;
    } catch (error) {
        console.error(error);
    }
}