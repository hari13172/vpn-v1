import { Route, Routes } from 'react-router'
import Root from './pages'
import Home from './pages/dashboard/Home'
import Layout from './pages/layout'
import Users from './pages/dashboard/Users'


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Root />} />
        {/* <Route path="/auth/login" element={<Login />} /> */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/users" element={<Users />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
