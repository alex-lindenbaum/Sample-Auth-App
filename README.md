# Sample-Auth-App
Authentication with 2FA and authorization with JWT

POST /signup to register: email, password, phone

POST /login/know to send verification code: email, password

POST /login/have to get JWT: email, code

GET /protected to get secret: email, access_token
