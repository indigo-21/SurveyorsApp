import createTableSQL from "../createTable";

const installersProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
`;

const foreignKeys = [
    'user_id',
];

export const installersTable = createTableSQL('installers', installersProps, foreignKeys);
