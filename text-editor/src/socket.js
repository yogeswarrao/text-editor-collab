
import { io } from 'socket.io-client';

let socketInstance = null;

export const initSocket = async () => {
    if (!socketInstance) {
        const options = {
            'force new connection': true,
            reconnectionAttempt: 'Infinity',
            timeout: 10000,
            transports: ['websocket'],
        };
        socketInstance = io(process.env.REACT_APP_BACKEND_URL, options);
    }
    return socketInstance;
};