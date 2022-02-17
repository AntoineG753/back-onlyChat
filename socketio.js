import { Server } from "socket.io";
// import { DB } from './connectDB.js';
// import multer from 'multer';
// import jwt from "jsonwebtoken";

export const socketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  let userConnected = [];
  // DECLARATION SYSTEM room
  // const color = ["blue", "green", "yellow", "purple", "grey", "turquoise", "red", "navy_blue", "violet", "brown", "cyan", "corail", "prune", "salmon", "red_bright", "green_bright", "dark_cyan", "goldenrod", "dark_slate_gray", "golden"]
  // const currentColor = "";
  let Rooms = [
    [2, [], []],
    [3, [], []],
    [4, [], []],
    [5, [], []],
    [6, [], []],
    [7, [], []],
    [8, [], []],
    [9, [], []],
    [10, [], []],
  ];

  io.engine.on("headers", (headers) => {
    headers["Access-Control-Allow-Private-Network"] = true;
  });

  io.on("connection", (socket) => {
    let _user = [];
    let currentRoom = 0;
    let RoomMsg = [];
    let RoomsAvailable = [];
    console.log("un utilisateru c'est connecté: " + socket.id);

    const User = {
      uuid: socket.handshake.query.uuid,
      pseudo: socket.handshake.query.pseudo,
      admin: socket.handshake.query.admin,
      ban: socket.handshake.query.ban,
      number_connections: socket.handshake.query.number_connections,
      creation_date: socket.handshake.query.creation_date,
      id_socket: socket.id,
    };
    _user = User;
    userConnected.push(User);
    
    io.emit("userConnected", userConnected);

    // SUITE SYSTEM ROOMS RAMDOM

    // FUNCTION CREATING ROOM
    function createRoom() {
      
      const roomName = Rooms.length + 2;
      socket.join(`${roomName}`);
      RoomMsg.push(roomName, []);
      socket.emit("enter_room", roomName);
      
      Rooms.push([roomName, [user], []]);
      currentRoom = roomName;
     
    }

    // FUNCTION LEAVE ROOM
    function leaveRomm() {
      const LastCurrentRoom = currentRoom;
    
      socket.leave(`${currentRoom}`);
      for (let i = 0; i < Rooms.length; i++) {
        if (Rooms[i][0] === currentRoom) {
         
          let indexRoom = i;
          
          for (let I = 0; I < Rooms[indexRoom][1].length; I++) {
           
          
            if (Rooms[indexRoom][1][I].pseudo === _user.pseudo) {
              Rooms[indexRoom][1].splice(I, 1);
              RoomMsg=[];
              RoomsAvailable=[];
              
              io.to(`${LastCurrentRoom}`).emit("currentRoom", Rooms[indexRoom]);
              if (Rooms[indexRoom][1].length === 0 && Rooms.length > 10) {
              
                Rooms.splice(indexRoom, 1);
                
              }
            }
          }
        }
      }
    }

    function findRoom() {
      if (Rooms.length === 0) {
        // creation de rooms
        createRoom();
      } else {
        const random = Math.floor(Math.random() * (Rooms.length - 0)) + 0;
        
        
          for (let i = random; i < Rooms.length; i++) {
            if (Rooms[i][1].length === 20) {
              createRoom();
            } else {
              RoomsAvailable.push(i);
            }
          }
          const RoomJoin = Math.floor(Math.random() * RoomsAvailable.length);

          console.log(currentRoom + ' je viens de ')
          console.log(Rooms[RoomJoin][0] + ' je vais vers')
          if (currentRoom === Rooms[RoomJoin][0]) {
            
          }
          Rooms[RoomJoin][1].push(_user);
          socket.join(`${Rooms[RoomJoin][0]}`);
          
          RoomMsg.push(Rooms[RoomJoin][0], []);
          currentRoom = Rooms[RoomJoin][0];
          
          io.to(`${currentRoom}`).emit("currentRoom", Rooms[RoomJoin]);
        
      }
    }

    findRoom()

    // ON LISTENER LES RELOAD CHAT

    socket.on("ReloadChat", () => {
      
      leaveRomm();
      findRoom();
      
      io.to(_user.id_socket).emit('ReloadChatSuccess', {});
    });

    socket.on("chat_message", (message) => {
      io.to(`${currentRoom}`).emit("received_message", message);
    });

    

    // on ecoute les deconnexions
    socket.on("disconnect", () => {
    

      // leave room -------------
      leaveRomm()

      // leave array user connected
      for (let i = 0; i < userConnected.length; i++) {
        if (userConnected[i].pseudo === `${_user.pseudo}`) {
          userConnected.splice(i, 1);
          
          io.emit("userConnected", userConnected);
        }
      }

      io.emit("userDisconnect", userConnected);
      
      
      console.log("un utilisateru c'est deconnecté: " + socket.id);
    });
  });
};
