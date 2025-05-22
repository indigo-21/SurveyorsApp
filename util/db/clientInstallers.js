import createTableSQL from "../createTable";

const clientInstallersProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    installer_id INTEGER NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (installer_id) REFERENCES installers(id) ON DELETE CASCADE
`;

const foreignKeys = [
    'client_id',
    'installer_id',
];

export const clientInstallersTable = createTableSQL('client_installers', clientInstallersProps, foreignKeys);
