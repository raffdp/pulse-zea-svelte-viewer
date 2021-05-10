class Auth {
  async isAuthenticated() {
    return this.getUsername()
  }

  async getUsername() {
    const { username } = window.localStorage

    return username
  }

  async setUsername(username) {
    window.localStorage.username = username
  }
}

const auth = new Auth()

export { auth }
