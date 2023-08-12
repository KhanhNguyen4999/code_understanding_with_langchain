# Frontend Server

Run the following command to install the frontend dependencies:

```sh
npm install
```

Create .env file to store enviroment variable, and define 2 keys:

```sh
REACT_APP_BACKEND_URL=http://localhost:3001/
REACT_APP_CLIENT_ID=<xxxclient_idxxx>
```

- Set the `REACT_APP_BACKEND_URL` in the `.env` file to the URL of your backend server. For local

- With `REACT_APP_CLIENT_ID`, can get it as the client_id follow this instruction https://livefiredev.com/in-depth-guide-sign-in-with-google-in-a-react-js-application/

Start the frontend app by running the following command:

```sh
npm start
```

## Build with docker

- docker build:

```sh
docker build -t my-react-app .
```

- docker run:

```sh
docker run -p 3000:3000 my-react-app
```
