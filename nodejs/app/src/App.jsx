import { useState } from "react"
import Login from "./pages/Login"
import AppLayout from "./pages/MainPage"
import * as auth from './api/auth'

function App() {

const [isLoggedIn, setIsLoggedIn] = useState(
  !!localStorage.getItem("access_token")
  );
  return isLoggedIn ? (
    <AppLayout setIsLoggedIn={setIsLoggedIn} />
  ) : (
    <Login setIsLoggedIn={setIsLoggedIn} />
  )
}

export default App