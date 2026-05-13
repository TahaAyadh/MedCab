import * as auth from '../api/auth'
import { useState } from "react"

function Login({ setIsLoggedIn }) {

  const [isLogin, setIsLogin] = useState(true)

  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [telephone, setTelephone] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [password, setPassword] = useState("")
  const [passcheck, setPasscheck] = useState("")

  const [successMsg, setSuccessMsg] = useState("")

  const passcomp = password === passcheck
  const warningCheck = password.length > 0 && passcheck.length > 0 && !passcomp

  async function handleLogin(e) {

  e.preventDefault()

    try {

      const response = await auth.loginUser({
        Mail_Adress: email,
        PassWord: password
      })
      localStorage.setItem("access_token", response.data.access)
      localStorage.setItem("refresh_token", response.data.refresh)
      localStorage.setItem("user", JSON.stringify(response.data.user))
      console.log(response.data)
      setIsLoggedIn(true)
    } 
    catch (error) {
      console.log(error.response?.data)
    }
  }

  async function handleSignup(e) {

    e.preventDefault()

    if (!passcomp) {
      return
    }

    try {

      const response = await auth.registerUser({
        Nom: nom,
        Prenom: prenom,
        birth_date: birthDate,
        phone: telephone,
        Mail_Adress: email,
        PassWord: password
      })

      console.log(response.data)

      setSuccessMsg("Account created successfully 🎉")

      setTimeout(() => {
        setSuccessMsg("")
        setIsLogin(true)
      }, 1500)

    } catch (error) {

      console.log(error.response?.data)

      alert(JSON.stringify(error.response?.data))
    }
  }


  return (

    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-blue-100">

        <h1 className="text-5xl select-none font-extrabold mb-6 text-center font-serif text-green-700">
          MedCab
        </h1>

        <h1 className="text-3xl select-none font-extrabold mb-6 text-center text-blue-800">
          {isLogin ? "Bienvenue" : "Creation du compte"}
        </h1>

        {/* SUCCESS BUBBLE */}
        {successMsg && (
          <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {successMsg}
          </div>
        )}

        <form
          onSubmit={isLogin ? handleLogin : handleSignup}
          className="flex flex-col gap-4"
        >

          {!isLogin && (
            <>
              <input
                type="text"
                name="nom"
                placeholder="Nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="border border-blue-100 p-3 rounded-lg"
              />

              <input
                type="text"
                name="prenom"
                placeholder="Prenom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="border border-blue-100 p-3 rounded-lg"
              />

              <input
                type="tel"
                name="telephone"
                placeholder="Telephone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="border border-blue-100 p-3 rounded-lg"
              />

              <input
                type="date"
                name="birth_date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="border border-blue-100 p-3 rounded-lg"
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Adresse Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-blue-100 p-3 rounded-lg"
          />

          <input
            type="password"
            name="password"
            placeholder="Mot de Passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-blue-100 p-3 rounded-lg"
          />

          {!isLogin && (
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirmer le mot de passe"
              value={passcheck}
              onChange={(e) => setPasscheck(e.target.value)}
              className="border border-blue-100 p-3 rounded-lg"
            />
          )}

          {warningCheck && (
            <p className="select-none text-sm text-red-700 text-center">
              Les mots de passe ne correspondent pas
            </p>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            {isLogin ? "Connexion" : "Inscription"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-4">

          {isLogin
            ? "Vous n'avez pas de compte ?"
            : "Vous avez deja un compte ?"
          }

          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 cursor-pointer hover:underline ml-1"
          >
            {isLogin ? "Inscription" : "Connexion"}
          </span>

        </p>

      </div>

    </div>
  )
}

export default Login