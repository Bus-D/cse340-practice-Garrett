import { getFacultyById, getSortedFaculty, getAllFaculty } from '../../models/faculty/faculty.js';

const facultyListPage = (req, res) => {
    const faculties = getAllFaculty();
    const sortBy = req.query.sort || 'name';
    const sortedFaculty = getSortedFaculty(sortBy);


    res.render('faculty/list', {
        title: 'Faculty List',
        faculty: sortedFaculty,
        currentSort: sortBy
    });
}

const facultyDetailPage = (req, res, next) => {
    const facultyId = req.params.facultyId;
    const faculty = getFacultyById(facultyId);

    if (!faculty) {
        const err = new Error(`Faculty ${facultyId} not found`);
        err.status = 404;
        return next(err);
    }

    res.render('faculty/detail', {
        faculty,
        title: `${faculty.name}`
    });
}

export { facultyListPage, facultyDetailPage };