-- DROP TABLE IF EXISTS signatures;
-- DROP TABLE IF EXISTS users;


--    CREATE TABLE signatures (
--        id SERIAL PRIMARY KEY,
--        first VARCHAR NOT NULL CHECK (first != ''),
--        last VARCHAR NOT NULL CHECK (last != ''),
--        signature VARCHAR NOT NULL CHECK (signature != '')
--    );

 CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first VARCHAR(255) NOT NULL,
      last VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );


CREATE TABLE signatures(
      id SERIAL PRIMARY KEY,
      signature TEXT NOT NULL,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );