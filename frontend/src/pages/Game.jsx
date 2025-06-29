import React from 'react'
import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import { useSearchParams } from "react-router";
import { Chess } from "chess.js"; // install with: npm install chess.js
import { Chessboard } from "react-chessboard"; 

function Game() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [socket, setsocket]  = useState(null);

    const [game,setgame] = useState(null);
    const [fen, setFen] = useState("start");
    const [orientation, setorientation] = useState('white');
    const [opponent, setopponent] = useState('');

    const name = searchParams.get('name');
    const roomid = searchParams.get('id');

    const handleSideSelect = (side) => {
      const chess = new Chess();
      setgame(chess);
      setFen(chess.fen());
      setorientation(side)
    }

    const handlemove = (from, to)=>{
      const move = game.move({ from, to, promotion: "q" });
      if (move){
        setFen(game.fen())
        socket.send(JSON.stringify({
          move: move,
          type: 'move',
          roomid: roomid
        }))
      } ;
      return !!move
    }
    useEffect(()=>{
      const newsocket = new WebSocket('ws://localhost:4000');
      newsocket.onopen = ()=>{
        setsocket(newsocket);
        const msgtosend  = {
          type: 'join-room',
          name: name,
          roomid: roomid,
        }
        newsocket.send(JSON.stringify(msgtosend));

      }
      newsocket.onmessage = (msg)=>{
        const message = JSON.parse(msg.data);
        if(message.type==='opponent'){
          console.log("Got opponent:", message.opponent); 
          setopponent(message.opponent[0])
        }
        if(message.type==='move'){
          
          setgame(currentGame => {
            if (!currentGame) {
          // Initialize game if not already done
              const newGame = new Chess();
              newGame.move(message.move);
              return newGame;
            }
            const newGame = new Chess(currentGame.fen());
            newGame.move(message.move);
            return newGame;
      });

        }
      }
      return ()=>{
        newsocket.close()
      }
    }, [])
  return (
    <div className = 'bg-white h-screen flex flex-col items-center justify-center'>
        {!game && (
          <>
            <h2>Choose sides</h2>
            <br></br>
            <button onClick = {()=>{
              handleSideSelect('white')
            }} className = 'bg-green-600 text-white px-5 py-2 rounded-md mr-2 mb-3'>White</button>
            <button onClick = {()=>{
              handleSideSelect('black')
            }} className = 'bg-green-600 text-white px-5 py-2 rounded-md mr-2'>Black</button>
          </>
        )}
        {game && (
          <div className = 'h-screen flex items-center justify-center bg-white'>
            <p className="mb-4 text-md text-gray-800">
              {opponent ? `Opponent: ${opponent}` : "Waiting for opponent..."}
            </p>
            <Chessboard
              position={game.fen()}
              onPieceDrop={(from, to)=>{
                handlemove(from, to)
              }}
              boardWidth={400}
              boardOrientation={orientation}
              isDraggablePiece={({ piece}) => {
                if (!game) return false;
                const turn = game.turn();
                
    // Only allow dragging pieces if the orientation is white and piece is white
                const playerColor = orientation === 'white' ? 'w' : 'b';
                 return turn === playerColor && piece.startsWith(playerColor);

              }}
            />
            <br></br>
            <br></br>
              <p>{name}</p>
          </div>
        )}
    </div>
  )
}

export default Game

;