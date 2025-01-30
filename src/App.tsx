import { Route, Routes } from 'react-router'
import Root from './pages'
import Layout from './pages/layout'
import Login from './pages/auth/Login'


function App() {

  return (
    <>

      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/auth/login" element={<Login />} />
      </Routes>
    </>
  )
}

export default App
