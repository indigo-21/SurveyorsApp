import createTableSQL from "../createTable";

const propertyProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    house_flat_prefix TEXT NOT NULL,
    address1 TEXT NOT NULL,
    address2 TEXT,
    address3 TEXT,
    city TEXT,
    county TEXT,
    postcode TEXT,
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
`;

const foreignKeys = [
    'job_id',
];

export const propertiesTable = createTableSQL('properties', propertyProps, foreignKeys);
