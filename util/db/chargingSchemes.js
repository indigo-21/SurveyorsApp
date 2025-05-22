import createTableSQL from "../createTable";

const chargingSchemesProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL
`;

export const chargingSchemesTable = createTableSQL('charging_schemes', chargingSchemesProps);
