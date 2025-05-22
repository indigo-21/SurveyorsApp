import createTableSQL from "../createTable";

const measuresProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    measure_cat TEXT NOT NULL,
    cert_required INTEGER NOT NULL,
    cert_description TEXT NOT NULL,
    cert_remediation_advice TEXT NOT NULL,
    measure_min_qual TEXT NOT NULL,
    measure_duration INTEGER NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL
`;

export const measuresTable = createTableSQL('measures', measuresProps);
