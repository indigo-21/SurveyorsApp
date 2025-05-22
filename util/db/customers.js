import createTableSQL from "../createTable";

const customersProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_primary_tel TEXT NOT NULL,
    customer_secondary_tel TEXT DEFAULT NULL,
    customer_email TEXT NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
`;

const foreignKeys = [
    'job_id',
];

export const customersTable = createTableSQL('customers', customersProps, foreignKeys);
