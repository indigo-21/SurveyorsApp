import createTableSQL from "../createTable";

const clientJobTypesProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    job_type_id INTEGER NOT NULL,
    visit_duration INTEGER DEFAULT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (job_type_id) REFERENCES job_types(id)
`;

const foreignKeys = [
    'client_id',
    'job_type_id',
];

export const clientJobTypesTable = createTableSQL('client_job_types', clientJobTypesProps, foreignKeys);
