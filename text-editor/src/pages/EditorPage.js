import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';


const EditorPage = () => {
    const socketRef = useRef(null);
    const reactNavigator = useNavigate();
    const location = useLocation();
    const codeRef = useRef(null);
    const { roomId } = useParams();
    const [clients, setClients] = useState([]);
    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }
    
    function leaveRoom() {
        reactNavigator('/');
    }



    const init = async () => {
        socketRef.current = await initSocket();
        console.log('Socket initialized:', socketRef.current);
        socketRef.current.on('connect_error', (err) => handleErrors(err));
        socketRef.current.on('connect_failed', (err) => handleErrors(err));

        function handleErrors(e) {
            console.log('socket error', e);
            toast.error('Socket connection failed, try again later.');
            reactNavigator('/');
        }

        console.log('Joining room...');
        socketRef.current.emit(ACTIONS.JOIN, {
            roomId,
            username: location.state?.username
        });

        socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
            console.log("joined", clients);
            if (username !== location.state?.username) {
                // toast.success(`${username} joined the room...`);
            }
            setClients(clients);
            socketRef.current.emit(ACTIONS.SYNC_CODE, {
                code: codeRef.current,
                socketId,
            });
        });
        socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
            // toast.success(`${username} left the room.`);
            setClients((prev) => {
                return prev.filter((client) => client.socketId !== socketId);
            });
        });
    };

    useEffect(() => {
        console.log("ffect");
        init();
        // Cleanup function
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);
            }
        };
    },[]);

    if (!location.state) {
        return <Navigate to='/' />;
    }

    return (
        <div>
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client key={client.socketId} username={client.username} />
                        ))}
                    </div>
                </div>
                {/* <button className="btn highlightBtn" >
                    Highlight
                </button> */}
                <button className="btn copyBtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>
            <div className="editorWrap">
                <Editor socketRef={socketRef} roomId={roomId}  onCodeChange={(code) => {
                        codeRef.current = code;
                    }}/>
            </div>
        </div>
        <ToastContainer />
        </div>
    );
};

export default EditorPage;
