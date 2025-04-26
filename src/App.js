import React, { useEffect, Suspense } from "react";
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { checkIfAdminIsLoggedIn } from "./store/action/userAppStorage";
import { useDispatch, useSelector } from "react-redux";
import FallBackComponent from './component/general/Fallback'

// Admin dashboard section
const AdminLogin = React.lazy(() => import('./screen/admin_screen/Auth/Login'))
const Signup = React.lazy(() => import('./screen/admin_screen/Auth/Signup'))
const AdminUsers = React.lazy(() => import('./screen/admin_screen/Dashboard/AdminUsers'))
const AdminEditUser = React.lazy(() => import('./screen/admin_screen/Dashboard/AdminEditUser'))
const AdminDeposits = React.lazy(() => import('./screen/admin_screen/Dashboard/AminDeposits'))
const AdminEditDeposit = React.lazy(() => import('./screen/admin_screen/Dashboard/AdminEditDeposit'))
const AdminWithdraws = React.lazy(() => import('./screen/admin_screen/Dashboard/AdminWithdraws'))
const AdminEditWithdraw = React.lazy(() => import('./screen/admin_screen/Dashboard/AdminEditWithdraw'))
const AdminTrades = React.lazy(() => import('./screen/admin_screen/Dashboard/AdminTrades'))
const AdminEditTrade = React.lazy(() => import('./screen/admin_screen/Dashboard/AdminEditTrade'))
const AdminCreateTrade = React.lazy(() => import('./screen/admin_screen/Dashboard/AdminCreateTrade'))
const AdminEditAdmin = React.lazy(() => import('./screen/admin_screen/Dashboard/AdminEditAdmin'))

function App() {
  let dispatch = useDispatch()
  let { adminToken } = useSelector(state => state.userAuth)

  useEffect(() => {
    // Check if admin is logged in
    dispatch(checkIfAdminIsLoggedIn());
  }, [dispatch]);

  

  return (
    <div className="App">
      <Suspense fallback={<FallBackComponent />}>
        <Routes>
          {/* the general routes */}
          <Route path='/' element={<AdminLogin />} />
          <Route path='/login' element={<AdminLogin />} />

          {/* the Admin DASHBOARD routes */}
          <Route path='/signup' element={<Signup />} />
          <Route path='/admindashboard/users' element={adminToken ? <AdminUsers status={false} /> : <AdminLogin />} />
          <Route path='/admindashboard/users/:id' element={adminToken ? <AdminEditUser status={true} /> : <AdminLogin />} />
          <Route path='/admindashboard/deposits' element={adminToken ? <AdminDeposits status={false} /> : <AdminLogin />} />
          <Route path='/admindashboard/deposits/:id' element={adminToken ? <AdminEditDeposit status={true} /> : <AdminLogin />} />
          <Route path='/admindashboard/withdraws' element={adminToken ? <AdminWithdraws status={false} /> : <AdminLogin />} />
          <Route path='/admindashboard/withdraw/:id' element={adminToken ? <AdminEditWithdraw status={true} /> : <AdminLogin />} />
          <Route path='/admindashboard/trades' element={adminToken ? <AdminTrades status={false} /> : <AdminLogin />} />
          <Route path='/admindashboard/traders/:id' element={adminToken ? <AdminEditTrade status={true} /> : <AdminLogin />} />
          <Route path='/admindashboard/trade' element={adminToken ? <AdminCreateTrade status={true} /> : <AdminLogin />} />
          <Route path='/admindashboard/admin' element={adminToken ? <AdminEditAdmin status={true} /> : <AdminLogin />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
