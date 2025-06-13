import createTableSQL from "../createTable";

const jobMeasuresProps = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    measure_id INTEGER NOT NULL,
    umr TEXT NOT NULL,
    info TEXT NOT NULL,
    created_at TEXT DEFAULT NULL,
    updated_at TEXT DEFAULT NULL,
    deleted_at TEXT DEFAULT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (measure_id) REFERENCES measures(id)
`;


const foreignKeys = [
    'job_id',
    'measure_id',

];

export const jobMeasuresTable = createTableSQL('job_measures', jobMeasuresProps, foreignKeys);

export const getJobMeasures = () => {
    return `SELECT j.job_number,
                m.measure_cat,
                jm.umr,
                jm.info,
                j.id as job_id,
                s.short_name,
                m.id as measure_id,
                s.description,
                j.scheme_id,
                s.survey_question_set_id as survey_question_set_id FROM jobs j
            LEFT JOIN job_measures jm
            ON jm.job_id = j.id
            LEFT JOIN measures m
            ON m.id = jm.measure_id
            LEFT JOIN schemes s 
            ON s.id = j.scheme_id
            WHERE j.job_number LIKE ?`;
}
