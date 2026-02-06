import { getFacultyBySlug, getSortedFaculty } from '../../models/faculty/faculty.js';

const facultyListPage = async (req, res) => {
    const validSortOption = ['name', 'department', 'title'];
    const sortBy = validSortOptions.includes(req.query.sort) ? req.qeury.sort : 'department';
    const sortedFaculty = await getSortedFaculty(sortBy);


    res.render('faculty/list', {
        title: 'Faculty Directory',
        faculty: sortedFaculty,
        currentSort: sortBy
    });
}

const facultyDetailPage = async (req, res, next) => {
    const facultySlug = req.params.facultyId;
    const facultyMember = await getFacultyBySlug(facultyId);

    if (Object.keys(facultyMember).length === 0) {
        const err = new Error(`Faculty ${facultySlug} not found`);
        err.status = 404;
        return next(err);
    }

    res.render('faculty/detail', {
        faculty: facultyMember,
        title: `${facultyMember.name} - Faculty Profile`
    });
}

export { facultyListPage, facultyDetailPage };