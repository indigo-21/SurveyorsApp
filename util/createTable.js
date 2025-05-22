function createTableSQL(tableName, columns, foreignKeys = []) {

    const foreignSql = createForeignKeySQL(tableName, foreignKeys);

    return [
        {
            table: tableName,
            sql: `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`,
            foreignSql,
        }
    ];
}

function createForeignKeySQL(tableName, foreignKeys) {

    if (!foreignKeys || foreignKeys.length === 0) {
        return [];
    }
    
    return foreignKeys.map((key) => {
        return `CREATE INDEX IF NOT EXISTS idx_${tableName}_${key} ON ${tableName}(${key});`;
    });
}


export default createTableSQL;