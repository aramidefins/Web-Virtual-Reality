import { useState } from 'react'
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom'
import './App.css'
import BarChart from './pages/BarChart'

function App() {
  const [count, setCount] = useState(0)

  return (
   <div className="App">
    <Router>
      <Routes>
        <Route path="/" element={<BarChart />} />
      </Routes>
    </Router>
    </div>
  )
}

export default App
