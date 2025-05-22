import createTableSQL from "../createTable";

const outwardPostcodesProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL
`;

export const outwardPostcodesTable = createTableSQL('outward_postcodes', outwardPostcodesProps);
