import { useState } from 'react';

export function useGameLog() {
    const [logs, setLogs] = useState([]);

    const addLog = (log) => {
        setLogs((prevLogs) => [...prevLogs, log]);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    return { logs, addLog, clearLogs };
}
