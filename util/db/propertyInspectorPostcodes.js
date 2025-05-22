import createTableSQL from "../createTable";

const propertyInspectorPostcodesProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    outward_postcode_id INTEGER NOT NULL,
    property_inspector_id INTEGER NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    FOREIGN KEY (outward_postcode_id) REFERENCES outward_postcodes(id),
    FOREIGN KEY (property_inspector_id) REFERENCES property_inspectors(id)
`;

const foreignKeys = [
    'outward_postcode_id',
    'property_inspector_id',
];

export const propertyInspectorPostcodesTable = createTableSQL('property_inspector_postcodes', propertyInspectorPostcodesProps, foreignKeys);
