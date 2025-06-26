// src/comp/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ data,children }) => {
  const location = useLocation();
  if(!data){
   return <></>
  }
  const isLoggedIn = data.req; // or your actual auth check

  if (!isLoggedIn) {
    const redirectPath = encodeURIComponent(location.pathname);
    return <Navigate to={`../../?redirect=${redirectPath}`} replace />;
  }

  return children;
};

export default PrivateRoute;
