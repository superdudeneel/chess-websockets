import React from 'react'
import {useState, useEffect} from 'react';

function Home() {
    const [name, setname] = useState('');
    const [roomid, setroomid] = useState('');
    const handleclick = ()=>{
        window.location.href = `/game?name=${name}&id=${roomid}`
    }
  return (
    <div className = 'bg-white h-screen flex flex-col items-center justify-center'>
        <input type = 'text' placeholder = 'Enter name' className = 'bg-gray-200 text-gray-800 w-70 px-3 py-2 rounded-md' value = {name} onChange = {(e)=>{
            setname(e.target.value);
        }}>
        </input>
        <br></br>
        <input type = 'text' placeholder = 'Enter gameroom id' className = 'bg-gray-200 text-gray-800 w-70 px-3 py-2 rounded-md' value = {roomid} onChange = {(e)=>{
            setroomid(e.target.value);
        }}>
        </input>
        <br></br>
        <button onClick  = {handleclick} className = 'bg-green-700 cursor-pointer text-white rounded-md w-70 px-5 py-2'>Enter room</button>
    </div>
  )
}

export default Home