import { useState } from "react"
import Login from "./pages/Login/Login"
import AppLayout from "./pages/Main/MainPage"
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