import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game'

function App() {
  
  return (
    <Routes>
      <Route path = '/' element = {<Home/>}/>
      <Route path = '/game' element = {<Game/>}/>
    </Routes>
  )
}

export default App
