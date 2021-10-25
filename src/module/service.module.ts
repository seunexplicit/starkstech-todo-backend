import { google } from 'googleapis';

const googleUrl = new google.auth.OAuth2(
     process.env.OAUTH_CLIENT_ID,
     process.env.OAUTH_CLIENT_SECRET,
     process.env.OAUTH_REDIRECT_URL
)

export const getAuthUrl = () => {
     try {
          return googleUrl.generateAuthUrl({
               scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/drive']
          })
     }
     catch (err) { }
}

export const getAuthToken = async (
     { code, token }: { code?: string, token?: any }) => {
     try {

          let _token;
          code? _token = (await googleUrl.getToken(code)).tokens:_token = token;
          googleUrl.setCredentials(_token);
          return { oAuth: googleUrl, token:_token };
     }
     catch (err) {

     }
}