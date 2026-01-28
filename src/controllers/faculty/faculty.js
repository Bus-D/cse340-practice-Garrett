import { getFacultyById, getSortedfaculty } from '../../models/faculty/faculty.js';

const facultyListPage = (req, res) => {
    const getAllFaculty = getFacultyById();
    const sortBy = req.query.sort || 'name';

    res.render('faculty', {
        title: 'Faculty List',
        teacher: { ...faculty, name, office, phone, email, department },
        currentSort: sortBy
    });
}

const facultyDetailPage = (req, res) => {
    const faultyId = req.params.facultyId;

}