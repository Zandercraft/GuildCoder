![GuildCoder By Zandercraft](https://zandercraft.ca/wp-content/uploads/2022/12/GuildCoder_zc.png)

An open collaboration platform made to facilitate cooperation between developers on cool new projects; helping you find people to build your project with.


## Features

- Customizable Profile System
- Private Messaging
- Group Messaging
- Guilds
    - Collaborative Chat
- Projects
    - Reviews

## Technologies

**Client:** Foundation Framework, Socket.io, slick Media Carousel

**Server:** NodeJS, Express, MongoDB, Socket.io, bcrypt


## Authors

- [@ZandercraftGames](https://www.github.com/ZandercraftGames)
- [@Zandercraft](https://www.github.com/Zandercraft)


## Installation

Install the project's dependencies using the following command:

```bash
  npm install
```

Configure the database connection string by editing the following line in `app.js`:
```JS
store: MongoStore.create({ mongoUrl: "<MONGO CONNECTION STRING HERE>" })
```
and the following line in `./bin/www`:
```JS
database.connectToDB("<MONGO CONNECTION STRING HERE>")
```

Start the program using
```bash
  npm start
```
    
## Environment Variables

The following environment variables can be set to modify the behaviour of the program:

`PORT` - The port that the server will listen on. *(Default: 8080)*


## License

This software is the sole property of Zander Maitland. The use of it is governed under a restrictive license that can be accessed [here](./LICENSE.txt).


## Acknowledgements

 - [Foundation Framework](https://get.foundation/)
 


## Support

For help and support, send an email to support@zandercraft.ca.  


## Screenshots

![Home Page Screenshot](https://zandercraft.ca/wp-content/uploads/2022/12/GuildCoder-Home.png)

