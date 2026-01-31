import createTableSQL from "../createTable";

const accountLevelsProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    firm_data_only INTEGER DEFAULT 0,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL
`;

export const accountLevelsTable = createTableSQL('account_levels', accountLevelsProps);
