# ITEMFY - Products and Reviews Platform - Backend

In this platform users can create, view and review Products.

## How to set up the app locally

1.  Install the required dependencies

```
npm install
```

2.  Create a .env file in the root directory with the following variables

```
PORT=8000

DB_URL=""
DB_NAME="productsapp"

JWT_SECRET=59331e0c6f848dead8fbd38764a0aecc
JWT_REFRESH_SECRET=7afa67feebba1a76ae8d6a49fa162bff
```

Modify the DB_URL variable with the connection string of your MongoDB database.

4. To start the server locally run:

```
npm run dev
```

This will start the server on http://localhost:8000/

## Considerations and Notes

### Deployment

The app is currently deployed online to use, the server can be found at:

```
https://productsreviewsapp-backend.herokuapp.com
```

A cloud MongoDB Atlas database already loaded with data is used in the deployment.
If you have any error to set up the local environment, feel free to test the server in the deployed URL.

### Users to test

To test the app you can use the following  users, which are already loaded in the cloud database. Or you can create your own.

```
test@example.com - password1$
test1@example.com - password1$
test2@example.com - password1$
test3@example.com - password1$
```

## Tech Stack

- Node.js with Express.js
- Typescript
- JWT
- Mongo DB
- Mongo Driver for Node.js
