import { Routes, Route } from "react-router-dom"
import Login from "./Login"
import Signup from "./Signup"
import Dashboard from "./dashboard"
import "./index.css"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App