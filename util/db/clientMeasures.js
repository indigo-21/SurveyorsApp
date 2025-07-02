import createTableSQL from "../createTable";

const clientMeasuresProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    measure_id INTEGER NOT NULL,
    measure_fee REAL DEFAULT NULL,
    measure_fee_currency TEXT DEFAULT 'GBP',
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (measure_id) REFERENCES measures(id) ON DELETE CASCADE
`;

const foreignKeys = [
    'client_id',
    'measure_id',
];

export const clientMeasuresTable = createTableSQL('client_measures', clientMeasuresProps, foreignKeys);
