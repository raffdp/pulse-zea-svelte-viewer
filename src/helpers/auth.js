import sha256 from 'sha256'

// Authentication: This template provides a very simple authentication
// framework for building demos. A hardcoded passwrld has is provided here in the code.
// When a user logs in, the password hash is printed to the log, so you can simply copy/paste
// the hash into the code here to update the password.
// Note: the authentication can also be modified to support 3rd party tools like Firebase or Auth0.
// Note: to disable authentication here, simply set enableAuthentication to false and remove the

const enableAuthentication = true
// Mocked password(zea), please generate a new for your demo
const HASHED_PASSWORD = '2d37e395cc590b4e127317494566f1aaf881f0ac1b5ff7d4180506fd682d68ea'

class Auth {
  async isAuthenticated() {
    const userData = await this.getUserData()
    if (enableAuthentication) {
      return userData && userData.hashedPassword === HASHED_PASSWORD
    } else {
      return userData !== undefined
    }
  }

  async getUserData() {
    const { zeaUserData } = window.localStorage
    return zeaUserData && JSON.parse(zeaUserData)
  }

  async setUserData(userData) {
    if (enableAuthentication) {
      if (!userData.password) {
        return Promise.reject(new Error('Password not provided'))
      }
      userData.hashedPassword = sha256(userData.password)
      delete userData.password
      console.log('Password Hash:', userData.hashedPassword)
      if (userData.hashedPassword !== HASHED_PASSWORD) {
        return Promise.reject(new Error('Invalid Password'))
      }
    }

    window.localStorage.zeaUserData = JSON.stringify(userData)
  }

  async signOut() {
    localStorage.removeItem('zeaUserData')
  }
}

const auth = new Auth()

export { auth }
