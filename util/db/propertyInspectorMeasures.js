import createTableSQL from "../createTable";

const propertyInspectorMeasuresProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_inspector_id INTEGER NOT NULL,
    measure_id INTEGER NOT NULL,
    fee_value REAL NOT NULL,
    fee_currency TEXT NOT NULL,
    expiry TEXT NOT NULL,
    cert TEXT NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    FOREIGN KEY (property_inspector_id) REFERENCES property_inspectors(id),
    FOREIGN KEY (measure_id) REFERENCES measures(id)
`;

const foreignKeys = [
    'property_inspector_id',
    'measure_id',
];

export const propertyInspectorMeasuresTable = createTableSQL('property_inspector_measures', propertyInspectorMeasuresProps, foreignKeys);
