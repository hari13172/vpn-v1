import { Route, Routes } from 'react-router'
import Root from './pages'
import Layout from './pages/layout'
import Login from './pages/auth/Login'
import Auth from './pages/auth/AdminAuth'
import Home from './pages/dashboard/Home'


function App() {

  return (
    <>

      <Routes>
        <Route path="/" element={<Root />} />
        {/* <Route path="/auth/login" element={<Login />} /> */}
        <Route path="/dashboard" element={<Home />} />

      </Routes>
    </>
  )
}

export default App
