import createTableSQL from "../createTable";

const bookingsProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_number TEXT NOT NULL,
    booking_outcome TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    property_inspector_id INTEGER NOT NULL,
    booking_date TEXT NOT NULL,
    booking_notes TEXT NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
    FOREIGN KEY (property_inspector_id) REFERENCES property_inspectors(id)
`;

const foreignKeys = [
    'user_id',
    'property_inspector_id',
];

export const bookingsTable = createTableSQL('bookings', bookingsProps, foreignKeys);

export const getPIBookings = () => {
    return `SELECT *
            FROM jobs j
            LEFT JOIN bookings  b
            ON j.job_number LIKE CONCAT(b.job_number, '-%')
            WHERE j.property_inspector_id = ?
			AND j.job_status_id = 25`;
}