import createTableSQL from "../createTable";

const clientsProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    client_abbrevation TEXT DEFAULT NULL,
    client_type_id INTEGER NOT NULL,
    address1 TEXT DEFAULT NULL,
    address2 TEXT DEFAULT NULL,
    address3 TEXT DEFAULT NULL,
    city TEXT DEFAULT NULL,
    country TEXT DEFAULT NULL,
    postcode TEXT DEFAULT NULL,
    date_last_activated TEXT,
    date_last_deactivated TEXT DEFAULT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_type_id) REFERENCES client_types(id) ON DELETE CASCADE
`;

const foreignKeys = [
    'user_id',
    'client_type_id',
];

export const clientsTable = createTableSQL('clients', clientsProps, foreignKeys);
