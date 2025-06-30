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
    const [fen, setFen] = useState('start');
    const [orientation, setorientation] = useState('white');
    const [opponent, setopponent] = useState('');

    const name = searchParams.get('name');
    const roomid = searchParams.get('id');

    const [iswon, setiswon] = useState(false);
    const [isdraw, setisdraw] = useState(false);
    const [isStalemate, setisstalemate]  = useState(false);
    const [winner, setwinner] = useState('');
    const [isdrawnotification, setisdrawnotification] = useState(false);
    const [drawmessage, setdrawmessage]  = useState('');
    const [drawrequest, setdrawrequest] = useState(false);
    const [rejectmessage, setrejectmessage] = useState('');


    const handleSideSelect = (side) => {
      const chess = new Chess();
      setgame(chess);
      setFen(chess.fen());
      setorientation(side)
      setisdraw(false);
      setisdrawnotification(false);
      setdrawrequest(false);
      

    }

    const handledraw = ()=>{
      setdrawrequest(true);
      setrejectmessage('');

      const msgtosend = {
        type: 'request',
        msg: `${name} requests to draw`,
        roomid: roomid,
      }
      socket.send(JSON.stringify(msgtosend))
    }

    const acceptdraw = ()=>{
      setisdraw(true);
      setisdrawnotification(false);

      const msgtosend = {
        type: 'acceptance',
        roomid: roomid,
      }
      socket.send(JSON.stringify(msgtosend));
      setgame(null);


    }
    const rejectdraw = ()=>{
      setisdrawnotification(false);
      setisdraw(false);
      const msgtosend = {
        type: 'rejection',
        roomid: roomid,
      }
      socket.send(JSON.stringify(msgtosend));

    }

    const handlemove = (from, to)=>{
      const move = game.move({ from, to, promotion: "q" });
      let result = null
      if (move){
        setFen(game.fen())
        if(game.isCheckmate()){
          result = 'won'
          setiswon(true)
          setwinner(name);
        }
        if(game.isDraw()){
          setisdraw(true)
          result = 'draw'
        }
        if(game.isStalemate()){
          setisstalemate(true);
          result = 'stalemate'
        }
        socket.send(JSON.stringify({
          move: { from, to, promotion: "q" },
          type: 'move',
          roomid: roomid,
          result:result,
          winner: name,
        }))
      } 
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

          
          if(message.result==='won'){
            setwinner(message.winner);
            setiswon(true);
          }
          else if(message.result ==='draw'){
            
            setisdraw(true);
          }
          else if(message.result ==='stalemate'){
            
            setisstalemate(true);
          }
          

        }

        if(message.type==='response'){
          setisdrawnotification(true);
          setdrawmessage(message.msg);

        }
        if(message.type==='acceptance'){
          setisdraw(true);
          setgame(null);

        }
        if(message.type==='rejection'){
          setdrawrequest(false);
          setisdraw(false)
          setrejectmessage(message.msg)
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
          <div className = 'h-screen flex  flex-col items-center justify-center bg-white'>
            {isdrawnotification && (
              <>
                <div className = 'bg-gray-100 text-gray-700 fixed h-20 w-140 flex mb-170 text-center'>
                  <p>{drawmessage}</p>
                  <button onClick = {acceptdraw} className = 'bg-green-600 text-white rounded-md mr-30 px-3 py-2 h-10 w-30 mt-5'>Accept</button>
                  <button onClick = {rejectdraw} className = 'bg-red-600 text-white rounded-md px-3 py-2 h-10 w-30 mt-5 mr-5'>Reject</button>
                </div>
              </>
            )}
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
              <p>{name}</p>
              <p>{rejectmessage ? rejectmessage : ''}</p>
              <button onClick = {handledraw} className = 'bg-green-600 text-white px-5 py-2 rounded-md'>{drawrequest ? 'Sent..' : 'Draw'}</button>
          </div>
        )}
        {iswon && (
          <>
            <p>{winner} has won the game</p>
          </>
        )}
        {isdraw && (
          <>
            <p>Draw between both the players</p>
          </>
        )}
        {isStalemate && (
          <>
            <p>Stalemate!!!!</p>
          </>
        )}
    </div>
  )
}

export default Game

;