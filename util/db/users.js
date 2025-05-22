import createTableSQL from "../createTable";

const usersProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT DEFAULT NULL,
    email TEXT NOT NULL UNIQUE,
    organisation TEXT DEFAULT NULL,
    photo TEXT DEFAULT NULL,
    mobile TEXT NOT NULL,
    landline TEXT DEFAULT NULL,
    otp INTEGER DEFAULT NULL,
    otp_verified_at TEXT DEFAULT NULL,
    account_level_id INTEGER NOT NULL,
    user_type_id INTEGER NOT NULL,
    email_verified_at TEXT DEFAULT NULL,
    password TEXT NOT NULL,
    remember_token TEXT DEFAULT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL,
    FOREIGN KEY (account_level_id) REFERENCES account_levels(id),
    FOREIGN KEY (user_type_id) REFERENCES user_types(id)
`;

const foreignKeys = [
    'account_level_id',
    'user_type_id',
];

export const usersTable = createTableSQL('users', usersProps, foreignKeys);
