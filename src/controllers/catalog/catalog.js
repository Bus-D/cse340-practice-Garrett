import { getAllCourses, getCourseById, getSortedSections, getCoursesByDepartment } from '../../models/catalog/catalog.js';

const catalogPage = (req, res) => {
    const courses = getAllCourses();
    const sortBy = req.query.sort || 'time';
    const orderedDepartments = getCoursesByDepartment(courses.department, sortBy);

    res.render('catalog', {
    title: `${courses.id} - ${courses.title}`,
    course: { ...courses, sections: orderedDepartments },
    currentSort: sortBy
    });
};

const courseDetailPage = (req, res, next) => {
    const courseId = req.params.courseId;
    const course = getCourseById(courseId);

    if (!course) {
        const err = new Error(`Course ${courseId} not found`);
        err.status = 404;
        return next(err);
    }

    const sortBy = req.query.sort || 'time';
    const sortedSections = getSortedSections(course.sections, sortBy);

    res.render('course-detail', {
        title: `${course.id} - ${course.title}`,
        course: { ...course, sections: sortedSections },
        currentSort: sortBy
    });
};

export { courseDetailPage, catalogPage };