import createTableSQL from "../createTable";

const userTypesProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL
`;

export const userTypesTable = createTableSQL('user_types', userTypesProps);
