import createTableSQL from "../createTable";

const queuedSmsProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    is_sent INTEGER DEFAULT 0,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
`;

export const queuedSmstable = createTableSQL('queued_sms', queuedSmsProps);

export const storeLogs = () => {
    return `INSERT INTO
            queued_sms ( job_id, is_sent, created_at, updated_at )
            VALUES
            ( ?, ?, ?, ? )`;
};
