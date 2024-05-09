
import React, { useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const [code, setCode] = useState('');

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                // console.log('Received code change from server:', code);
                if (code !== null) {
                    setCode(code);
                }
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off(ACTIONS.CODE_CHANGE);
            }
        };
    }, [socketRef.current]);

    const handleEditorChange = (newCode) => {
        // console.log('Editor content changed:', newCode);
        setCode(newCode);
        onCodeChange(newCode);
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code: newCode,
        });
    };

    return (
        <MonacoEditor
            width="100%"
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={code}
            options={{
                automaticLayout: true,
                fontSize: 14,
                minimap: { enabled: false },
            }}
            onChange={handleEditorChange}
        />
    );
};

export default Editor;
