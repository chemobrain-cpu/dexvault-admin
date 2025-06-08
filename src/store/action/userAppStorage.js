export const SIGNUP_USER = "SIGNUP_USER";
export const LOGIN_ADMIN = "LOGIN_ADMIN";
export const LOG_ADMIN_IN = 'LOG_ADMIN_IN'
export const LOGOUT = 'LOGOUT'
export const GET_THEME = 'GET_THEME'

export const FETCH_USERS = 'FETCH_USERS'
export const FETCH_USER = 'FETCH_USER'
export const UPDATE_USER = 'UPDATE_USER'
export const DELETE_USER = 'DELETE_USER'

export const FETCH_DEPOSITS = 'FETCH_DEPOSITS'
export const FETCH_DEPOSIT = 'FETCH_DEPOSIT'
export const UPDATE_DEPOSIT = 'UPDATE_DEPOSIT'
export const DELETE_DEPOSIT = 'DELETE_DEPOSIT'


export const FETCH_WITHDRAWS = 'FETCH_WITHDRAW'
export const FETCH_WITHDRAW = 'FETCH_WITHDRAW'
export const UPDATE_WITHDRAW = 'UPDATE_WITHDRAW'
export const DELETE_WITHDRAW = 'DELETE_WITHDRAW'

export const FETCH_TRADES = 'FETCH_TRADES'
export const FETCH_TRADE = 'FETCH_TRADE'
export const UPDATE_TRADE = 'UPDATE_TRADE'
export const DELETE_TRADE = 'DELETE_TRADE'
export const CREATE_TRADE = 'CREATE_TRADE'



// Investment actions
export const FETCH_INVESTMENTS = 'FETCH_INVESTMENTS';
export const DELETE_INVESTMENT = 'DELETE_INVESTMENT';
export const UPDATE_INVESTMENT = 'UPDATE_INVESTMENT';




export const FETCH_PACKAGES = 'FETCH_PACKAGES'
export const DELETE_PACKAGE = 'DELETE_PACKAGE'
export const UPDATE_PACKAGE = 'UPDATE_PACKAGE'
export const CREATE_PACKAGE = 'CREATE_PACKAGE'

export const FETCH_DEPOSIT_HANDLERS = 'FETCH_DEPOSIT_HANDLERS';
export const DELETE_DEPOSIT_HANDLER = 'DELETE_DEPOSIT_HANDLER';
export const UPDATE_DEPOSIT_HANDLER = 'UPDATE_DEPOSIT_HANDLER';
export const CREATE_DEPOSIT_HANDLER = 'CREATE_DEPOSIT_HANDLER';



export const UPDATE_ADMIN = 'UPDATE_ADMIN'

//pure functions to calculate the time remaining

let calculateRemainingTime = (expiryDate) => {
  //getting current time in milliseconds
  const currentTime = new Date().getMilliseconds()
  //getting expiration time in milliseconds
  const adjustExpirationTime = (expiryDate * 60 * 60 * 1000)
  const timeLeft = adjustExpirationTime - currentTime
  return timeLeft
}

/* admin section */
let retrievedAdminStoredToken = () => {
  let tokenFromStorage = localStorage.getItem('admin_token')
  let expiryDate = localStorage.getItem('admin_expiry')
  const timeLeft = calculateRemainingTime(expiryDate)

  if (timeLeft <= 3600) {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_expiry')
    localStorage.removeItem('admin')

    return {
      adminToken: "",
      adminExpiresIn: ""

    }
  }

  return {
    adminToken: tokenFromStorage,
    adminExpiresIn: timeLeft
  }
}

export const checkIfAdminIsLoggedIn = () => {
  return async (dispatch, getState) => {
    try {
      let response
      //check if token is expired
      let { adminToken, adminExpiresIn } = retrievedAdminStoredToken()

      if (!adminToken) {
        return
      }
      //convert expiresIN backt to hours
      adminExpiresIn = adminExpiresIn / (60 * 60 * 1000)

      localStorage.setItem('admin_token', adminToken)
      localStorage.setItem('admin_expiry', adminExpiresIn)

      let admin = JSON.parse(localStorage.getItem('admin'))

      if (!admin) {
        return
      }



      response = await fetch(`https://backend.dexvault.net/adminbytoken`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      })
      if (response.status == 200) {
        let data = await response.json()
        data.response.token = adminToken
        dispatch({ type: LOG_ADMIN_IN, payload: data.response })
      }
    } catch (err) {

    }
  }
}

export const loginAdmin = (data) => {
  return async (dispatch, getState) => {
    try {
      let response = await fetch('https://backend.dexvault.net/adminlogin', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })
      if (response.status === 404) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: '/signup'
        }
      }

      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: '/login'
        }
      }


      if (response.status === 200) {
        let data = await response.json()
        //saving credentials to local storage

        localStorage.setItem("admin", JSON.stringify(data.response.admin))

        localStorage.setItem("admin_token", JSON.stringify(data.response.token))

        localStorage.setItem("admin_expiry", JSON.stringify(data.response.expiresIn))
        //dispatch login events
        dispatch({ type: LOGIN_ADMIN, payload: data.response })

        return {
          bool: true,
          message: data.response,
          url: `/admindashboard/users`
        }
      }
    }
    catch (err) {
      return {
        bool: false,
        message: err.message,
        url: `/login`
      }
    }
  }
}

export const signupAdmin = (data) => {
  return async (dispatch, getState) => {
    try {
      let response = await fetch(`https://backend.dexvault.net/adminsignup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })
      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
          url: '/signup'
        }
      }

      if (response.status === 301) {
        let data = await response.json()

        return {
          bool: false,
          message: data.response,
          url: '/login'
        }
      }


      if (response.status === 200) {
        let data = await response.json()


        localStorage.setItem("admin", JSON.stringify(data.response.admin))

        localStorage.setItem("admin_token", JSON.stringify(data.response.token))

        localStorage.setItem("admin_expiry", JSON.stringify(data.response.expiresIn))
        //dispatch login events
        dispatch({ type: LOGIN_ADMIN, payload: data.response })


        return {
          bool: true,
          message: data.response,
          url: `/admindashboard/users`
        }
      }

    }
    catch (err) {
      return {
        bool: false,
        message: err.message,
        url: `/signup`
      }
    }
  }
}


export const fetchUsers = () => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth
    try {
      let response = await fetch(`https://backend.dexvault.net/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      })
      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: FETCH_USERS, payload: data.response })

        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      return {
        bool: false,
        message: err.message
      }
    }
  }

}

export const deleteUser = (id) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      })
      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()

        dispatch({ type: DELETE_USER, payload: id })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      return {
        bool: false,
        message: err.message
      }
    }
  }

}

export const updateUser = (data) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/users/${data._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        },
        body: JSON.stringify(data)
      })


      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: UPDATE_USER, payload: data.response })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      console.log(err)
      return {
        bool: false,
        message: err.message
      }
    }
  }
}


//deposit controllers
export const fetchDeposits = () => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/deposits`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      })
      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: FETCH_DEPOSITS, payload: data.response })

        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      return {
        bool: false,
        message: err.message
      }
    }
  }

}

export const deleteDeposit = (id) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/deposits/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      })
      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()

        dispatch({ type: DELETE_DEPOSIT, payload: id })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      return {
        bool: false,
        message: err.message
      }
    }
  }

}

export const updateDeposit = (data) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/deposits/${data._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        },
        body: JSON.stringify(data)
      })


      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: UPDATE_DEPOSIT, payload: data.response })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      console.log(err)
      return {
        bool: false,
        message: err.message
      }
    }
  }
}



//withdraw methods
export const fetchWithdraws = () => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/withdraws`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      })
      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: FETCH_WITHDRAWS, payload: data.response })

        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      return {
        bool: false,
        message: err.message
      }
    }
  }

}
export const deleteWithdraw = (id) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/withdraws/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      })
      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()

        dispatch({ type: DELETE_WITHDRAW, payload: id })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      return {
        bool: false,
        message: err.message
      }
    }
  }

}
export const updateWithdraw = (data) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/withdraws/${data._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        },
        body: JSON.stringify(data)
      })


      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: UPDATE_WITHDRAW, payload: data.response })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      console.log(err)
      return {
        bool: false,
        message: err.message
      }
    }
  }
}







//withdraw methods
export const fetchTrades = () => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/trades`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      })
      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: FETCH_TRADES, payload: data.response })

        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      return {
        bool: false,
        message: err.message
      }
    }
  }

}
export const deleteTrade = (id) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/trades/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      })
      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()

        dispatch({ type: DELETE_TRADE, payload: id })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      return {
        bool: false,
        message: err.message
      }
    }
  }

}
export const updateTrade = (data) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/trades/${data._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        },
        body: JSON.stringify(data)
      })


      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: UPDATE_TRADE, payload: data.response })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      console.log(err)
      return {
        bool: false,
        message: err.message
      }
    }
  }
}


export const createTrade = (data) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/trades`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        },
        body: JSON.stringify(data)
      })


      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        console.log(data.response)
        dispatch({ type: CREATE_TRADE, payload: data.response })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      console.log(err)
      return {
        bool: false,
        message: err.message
      }
    }
  }
}



//package methods

export const fetchPackages = () => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/packages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      })
      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: FETCH_PACKAGES, payload: data.response })

        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      return {
        bool: false,
        message: err.message
      }
    }
  }

}
export const deletePackage = (id) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/packages/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      })
      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()

        dispatch({ type: DELETE_PACKAGE, payload: id })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      return {
        bool: false,
        message: err.message
      }
    }
  }

}
export const updatePackage = (data) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/packages/${data._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        },
        body: JSON.stringify(data)
      })


      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: UPDATE_PACKAGE, payload: data.response })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      console.log(err)
      return {
        bool: false,
        message: err.message
      }
    }
  }
}
export const createPackage = (data) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        },
        body: JSON.stringify(data)
      })


      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }
      if (response.status === 500) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: CREATE_PACKAGE, payload: data.response })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      console.log(err)
      return {
        bool: false,
        message: err.message
      }
    }
  }
}




//investment controllers
export const fetchInvestments = () => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/investments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      })
      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: FETCH_INVESTMENTS, payload: data.response })

        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      return {
        bool: false,
        message: err.message
      }
    }
  }

}

export const deleteInvestment = (id) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/investments/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      })
      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()

        dispatch({ type: DELETE_INVESTMENT, payload: id })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      return {
        bool: false,
        message: err.message
      }
    }
  }

}

export const updateInvestment = (data) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth

    try {
      let response = await fetch(`https://backend.dexvault.net/investments/${data._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        },
        body: JSON.stringify(data)
      })


      //an error 
      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: UPDATE_INVESTMENT, payload: data.response })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      console.log(err)
      return {
        bool: false,
        message: err.message
      }
    }
  }
}



// deposit handlers

export const fetchDepositHandlers = () => {
  return async (dispatch, getState) => {
    let { adminToken } = getState().userAuth;

    try {
      let response = await fetch(`https://backend.dexvault.net/deposit-handlers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      });

      if (response.status === 200) {
        let data = await response.json();
       
        console.log(data)
        dispatch({ type: FETCH_DEPOSIT_HANDLERS, payload: data.response });
        return { bool: true, message: data.response };
      }

      let data = await response.json();
      console.log(data)
      return { bool: false, message: data.message || data.response };

    } catch (err) {
      console.log(err)
      return { bool: false, message: err.message };
    }
  };
};
export const deleteDepositHandler = (id) => {
  return async (dispatch, getState) => {
    let { adminToken } = getState().userAuth;

    try {
      let response = await fetch(`https://backend.dexvault.net/deposit-handlers/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        }
      });

      if (response.status === 200) {
        let data = await response.json();
        dispatch({ type: DELETE_DEPOSIT_HANDLER, payload: id });
        return { bool: true, message: data.message };
      }

      let data = await response.json();
      return { bool: false, message: data.message || data.response };

    } catch (err) {
      return { bool: false, message: err.message };
    }
  };
};
export const updateDepositHandler = (data) => {
  return async (dispatch, getState) => {
    let { adminToken } = getState().userAuth;

    try {
      let response = await fetch(`https://backend.dexvault.net/deposit-handlers/${data._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        },
        body: JSON.stringify(data)
      });

      if (response.status === 200) {
        let resData = await response.json();
        dispatch({ type: UPDATE_DEPOSIT_HANDLER, payload: resData.response });
        return { bool: true, message: resData.response };
      }

      let resData = await response.json();
      return { bool: false, message: resData.message || resData.response };

    } catch (err) {
      return { bool: false, message: err.message };
    }
  };
};
export const createDepositHandler = (data) => {
  return async (dispatch, getState) => {
    let { adminToken } = getState().userAuth;

    try {
      let response = await fetch(`https://backend.dexvault.net/deposit-handlers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        },
        body: JSON.stringify(data)
      });

      if (response.status === 200) {
        let resData = await response.json();
        dispatch({ type: CREATE_DEPOSIT_HANDLER, payload: resData.data });
        return { bool: true, message: resData.data };
      }

      let resData = await response.json();
      return { bool: false, message: resData.message || resData.response };

    } catch (err) {
      return { bool: false, message: err.message };
    }
  };
};







export const updateAdmin = (data) => {
  return async (dispatch, getState) => {
    let {
      adminToken
    } = getState().userAuth//http://localhost:xxxxxxx9090
    //https://backend.dexvaultxx.net
    try {
      let response = await fetch(`https://backend.dexvault.net/admin/${data._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "header": `${adminToken}`
        },
        body: JSON.stringify(data)
      })


      if (response.status === 300) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 301) {
        let data = await response.json()
        return {
          bool: false,
          message: data.response,
        }
      }

      if (response.status === 200) {
        let data = await response.json()
        dispatch({ type: UPDATE_ADMIN, payload: data.response })
        return {
          bool: true,
          message: data.response
        }
      }
    }

    catch (err) {
      console.log(err)
      return {
        bool: false,
        message: err.message
      }
    }
  }
}

export const logout = (id) => {
  return async (dispatch, getState) => {

  }

}


















