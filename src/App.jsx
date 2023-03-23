import { useState } from 'react'
import './App.css'
import BarChart from './pages/BarChart'

function App() {
  const [count, setCount] = useState(0)

  return (
   <div className="App">
    <BarChart />
    </div>
  )
}

export default App
