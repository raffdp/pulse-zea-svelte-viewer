const SOCKET_URL = 'https://websocket-staging.zea.live'
const ROOM_ID = 'zea-template-collab'


export const setupCollab = (userData, appData = {}) => {
  const { Session, SessionSync } = window.zeaCollab
  
  const session = new Session(userData, SOCKET_URL)
  session.joinRoom(ROOM_ID)
  const sessionSync = new SessionSync(session, appData, userData, {})

  return { session, sessionSync }
}