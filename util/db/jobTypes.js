import createTableSQL from "../createTable";

const jobTypesProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL
`;

export const jobTypesTable = createTableSQL('job_types', jobTypesProps);
