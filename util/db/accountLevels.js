import createTableSQL from "../createTable";

const accountLevelsProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL
`;

export const accountLevelsTable = createTableSQL('account_levels', accountLevelsProps);
