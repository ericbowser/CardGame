import React, {useState, useEffect} from "react";

const useGameLog = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
    }, [logs]);

    const addLog = (log) => {
        setLogs((prevLogs) => [...prevLogs, log]);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    return {logs, addLog, clearLogs};
}

export default useGameLog;