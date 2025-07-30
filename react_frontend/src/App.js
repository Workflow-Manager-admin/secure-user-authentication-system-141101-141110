import React from 'react'
import logo from './logo.svg'
import './App.css'

// PUBLIC_INTERFACE
function App () {
  return (
    <div className="App flex items-center justify-center min-h-screen bg-black text-white">
      <header className="App-header flex flex-col items-center gap-4">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link underline decoration-accent"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
