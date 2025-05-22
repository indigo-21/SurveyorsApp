import createTableSQL from "../createTable";

const clientTypesProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL
`;

export const clientTypesTable = createTableSQL('client_types', clientTypesProps);
