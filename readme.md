# ChatGPT Web Application

A web application that allows users to interact with OpenAI's GPT-3 language model through a simple and user-friendly interface.
This app is for demo purpose to test OpenAI API and may contain issues/bugs.

If you are looking for a simple HTML/vanilla JavaScript version, check [here](https://github.com/ioanmo226/chatgpt-web-application)

![Demo Gif](/client/src/img/demo2.gif)



## Technologies Used
- For client, I used React.js.
- For server, I used Flask.

## Setup Introduction
This guide will help you set up the repository on your local machine. Please follow these steps carefully to ensure a smooth setup process.

### Cloning the repository
Use the following command to clone the repository:
```sh
git clone https://github.com/KhanhNguyen4999/code_understanding_with_langchain
```

### Backend Setup

- To do

### Frontend Setup

- Navigate to the client directory:
```sh
cd client
```

- Run the following command to install the frontend dependencies:
```sh
npm install
```

- Set the `REACT_APP_BACKEND_URL` in the `.env` file to the URL of your backend server. For local development, use the following URL:
```sh
REACT_APP_BACKEND_URL=http://localhost:3001/
```

- Start the frontend app by running the following command:
```sh
npm start
```


## Build with docker

### Frontend

```sh
cd client
```
- docker build:
```sh
docker build -t my-react-app .
```

- docker run:
```sh
docker run -p 3000:3000 my-react-app
```


