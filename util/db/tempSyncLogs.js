import createTableSQL from "../createTable";

const tempSyncLogsProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sql_query TEXT NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL
`;

export const tempSyncLogsTable = createTableSQL('temp_sync_logs', tempSyncLogsProps);

export const storeLogs = () => {
    return `INSERT INTO
            temp_sync_logs ( sql_query, created_at, updated_at )
            VALUES
            ( ?, ?, ? )`;
};

export const getLogs = () => {
    return `SELECT * FROM temp_sync_logs`;
};

export const deleteLogs = () => {
    return `DELETE FROM temp_sync_logs WHERE id = ?`;
};
