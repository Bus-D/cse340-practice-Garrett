const faculty = {
    'brother-jack': { 
        name: 'Brother Jack',
        office: 'STC 392',
        phone: '208-496-1234',
        email: 'jackb@byui.edu',
        department: 'Computer Science',
        title: 'Associate Professor'
    },
    'sister-enkey': {
        name: 'Sister Enkey',
        office: 'STC 394',
        phone: '208-496-2345', 
        email: 'enkeys@byui.edu',
        department: 'Computer Science',
        title: 'Assistant Professor'
    },
    'brother-keers': {
        name: 'Brother Keers',
        office: 'STC 390',
        phone: '208-496-3456',
        email: 'keersb@byui.edu',
        department: 'Computer Science', 
        title: 'Professor'
    },
    'sister-anderson': {
        name: 'Sister Anderson',
        office: 'MC 301',
        phone: '208-496-4567',
        email: 'andersons@byui.edu',
        department: 'Mathematics',
        title: 'Professor'
    },
    'brother-miller': {
        name: 'Brother Miller',
        office: 'MC 305',
        phone: '208-496-5678',
        email: 'millerb@byui.edu',
        department: 'Mathematics',
        title: 'Associate Professor'
    },
    'brother-thompson': {
        name: 'Brother Thompson', 
        office: 'MC 307',
        phone: '208-496-6789',
        email: 'thompsonb@byui.edu',
        department: 'Mathematics',
        title: 'Assistant Professor'
    },
    'brother-davis': {
        name: 'Brother Davis',
        office: 'GEB 205',
        phone: '208-496-7890',
        email: 'davisb@byui.edu',
        department: 'English',
        title: 'Professor'
    },
    'brother-wilson': {
        name: 'Brother Wilson',
        office: 'GEB 301', 
        phone: '208-496-8901',
        email: 'wilsonb@byui.edu',
        department: 'History',
        title: 'Associate Professor'
    },
    'sister-roberts': {
        name: 'Sister Roberts',
        office: 'GEB 305',
        phone: '208-496-9012',
        email: 'robertss@byui.edu',
        department: 'History', 
        title: 'Assistant Professor'
    }
};

const getAllFaculty = () => {
    return faculty;
}

const getFacultyById = (facultyId) => {
    return faculty[facultyId] || null;
}

const getSortedFaculty = (sortBy) => {
    // USED CHATGPT TO HELP TUTOR IN UNDERSTANDING HOW TO WRITE THIS FUNCTION

    // TODO: validate sortBy parameter
    const allowedKeys = ['name', 'office', 'phone', 'email', 'department', 'title'];

    // Checks to see if sortBy is in allowedKeys, if not default ot 'name'
    if (!allowedKeys.includes(sortBy)) {
        sortBy = 'name';
    }

    // Makes an array to hold the faculty, then puts each one inside of the array
    const facultyArray = [];
    for (const [key, value] of Object.entries(faculty)) {
        facultyArray.push({...value , id: key});
    };
    console.log(facultyArray);

    facultyArray.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) {
            return -1;
        }
        if (a[sortBy] > b[sortBy]) {
            return 1;
        }
        return 0; // For if they are equal
    });

    const id = {...faculty, getFacultyById};

    return facultyArray;
}

export { getFacultyById, getSortedFaculty, getAllFaculty };