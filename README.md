# Data Ingestion System (ClickHouse + Flat File)

A user friendly data ingestion system for ClickHouse that supports both database tables and flat file uploads. Users can preview data, select specific columns, and seamlessly import into ClickHouse with automatic table creation. Backed by robust JWT based authentication and error handling, it ensures smooth and safe data operations end to end.

## Setup

```bash
git clone https://github.com/your-username/data-ingestion-system.git

cd client
npm install
cd server
npm install
```

## Connecting to ClickHouse

Before using the app, you’ll need to register or log in to your ClickHouse instance.  
Once logged in through the ClickHouse client or web interface, locate the following details required to connect:

- **Host** – The URL before the colon  
- **Port** – The number after the colon in the URL  
- **Username** – Your ClickHouse database username (set to `default` by default) 
- **Password** – Your ClickHouse databse password

These credentials are used to establish a secure connection to ClickHouse from the backend.

We’re using the [`@clickhouse/client`](https://www.npmjs.com/package/@clickhouse/client) Node.js library to manage communication with the ClickHouse database in this project.


## Configuration

Create a `.env` file inside the `server/` directory:

```env
JWT_SECRET=your_jwt_secret
```

## Run the Project

### Start Backend
```bash
cd server
node index.js
```

### Start Frontend
```bash
cd client
npm start
```

## Features
- Provides a system to authenticate users against a ClickHouse database using credentials and JWT tokens for secure access.
- Lets users browse ClickHouse database tables and columns easily through dedicated API endpoints.
- Supports uploading CSV files with smart column detection and automatic parsing.
- Offers a quick preview of data whether it’s from a database table or a CSV file before importing it.
- Allows users to select specific columns they want to import from the source data.
- Automatically creates tables in ClickHouse if they don’t already exist during the import process.
- Delivers a complete backend API covering everything from user authentication to data import.
- Secures all database operations with JWT-based authentication.
- Handles errors gracefully, whether it’s an authentication issue, a query failure, or a problem with file processing.
- Streamlines the entire process from selecting and previewing data to importing it smoothly into ClickHouse.

## Demo Video

Link To Video [watch the demo video here](https://drive.google.com/file/d/170OHWj1SmaEGr0XF-agwUA1NHnhwhgHE/view?usp=sharing).

