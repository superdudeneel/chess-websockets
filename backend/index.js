import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import {WebSocketServer} from 'ws';
import { Chess } from "chess.js";


dotenv.config();


const app = express();
const port = process.env.PORT;
const myserver = http.createServer(app);

const rooms = new Map();


const wss = new WebSocketServer({server: myserver});

wss.on('connection', (socket)=>{
    console.log('socket connected');
    socket.on('message', (msg)=>{
        const message = JSON.parse(msg);
        if(message.type==='join-room'){
            const roomid = message.roomid
            socket.name = message.name;
            socket.roomid = message.roomid;
            if(!rooms.has(roomid)){
                rooms.set(roomid, new Set()); //create a room if it doesnt exist
            }
            rooms.get(roomid).add(socket);
            const clients = rooms.get(roomid);
            const names = Array.from(clients).map(client => client.name);

            clients.forEach((client)=>{
                client.send(JSON.stringify({
                    opponent: names.filter(name=> name!==client.name),
                    type: 'opponent',
                }))
            })
        }

        if(message.type==='move'){
            const clients = rooms.get(message.roomid);
            clients.forEach((client) => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'move',
                    move: message.move,
                    result: message.result || null, 
                    winner: message.winner
                }));
                }
            });
            
        }
        if(message.type==='request'){
            const clients = rooms.get(message.roomid);
            clients.forEach((client)=>{
                if(client!==socket && client.readyState===WebSocket.OPEN){
                    client.send(JSON.stringify({
                        type: 'response',
                        msg: `${message.msg}. Would you like to accept it`
                    }))
                }
            })
        }

        if(message.type==='acceptance'){
            const clients = rooms.get(message.roomid);
            clients.forEach((client)=>{
                if(client!==socket && client.readyState===WebSocket.OPEN){
                    client.send(JSON.stringify({
                        type: 'acceptance',
                        msg: 'Accepted request to draw',
                    }))

                }
            })
        }
        if(message.type==='rejection'){
            const clients = rooms.get(message.roomid);
            clients.forEach((client)=>{
                if(client!==socket && client.readyState===WebSocket.OPEN){
                    client.send(JSON.stringify({
                        type: 'rejection',
                        msg: `${socket.name} has rejected your request`,
                    }))
                }
            })
        }
        if(message.type==='resign'){
            const clients = rooms.get(message.roomid);
            clients.forEach((client)=>{
                if(client!==socket){
                    client.send(JSON.stringify({
                        type: 'resign',
                        msg: message.msg,
                    }))
                }
            })
        }

    })
    
})

myserver.listen(port, ()=>{
    console.log('server has been started');

})