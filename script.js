let employees = [];
let nextId = 1;
let experienceCounter = 0;
let isEditMode = false;
let currentEditId = null;
let currentRoomId = null;

const rooms = {
    'conference': { allowed: ['all'], max: 10 },
    'reception': { allowed: ['Receptionist'], max: 2 },
    'security': { allowed: ['Security Agent'], max: 3 },
    'servers': { allowed: ['IT Technician'], max: 4 },
    'staff': { allowed: ['all'], max: 15 },
    'vault': { allowed: ['Receptionist', 'IT Technician', 'Security Agent', 'Manager'], max: 2 }
};

function canEnterRoom(role, roomId) {
    const room = rooms[roomId];
    if (role === 'Manager') return true;
    if (role === 'Cleaning Staff' && roomId === 'vault') return false;
    if (role === 'Cleaning Staff') return true;
    if (room.allowed.includes('all')) return true;
    return room.allowed.includes(role);
}

function isRoomFull(roomId) {
    let count = 0;
    for (let i = 0; i < employees.length; i++) {
        if (employees[i].room === roomId) {
            count++;
        }
    }
    return count >= rooms[roomId].max;
}

const modal = document.getElementById('addModal');
const addBtn = document.getElementById('addWorkerBtn');
const cancelBtn = document.getElementById('cancelBtn');
const form = document.getElementById('workerForm');
const addExperienceBtn = document.getElementById('addExperienceBtn');
const experienceContainer = document.getElementById('experienceContainer');
const modalTitle = document.getElementById('modalTitle');
const submitBtn = document.getElementById('submitBtn');

const profileModal = document.getElementById('profileModal');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const deleteProfileBtn = document.getElementById('deleteProfileBtn');

const selectModal = document.getElementById('selectModal');
const eligibleList = document.getElementById('eligibleList');
const closeSelectBtn = document.getElementById('closeSelectBtn');

addBtn.onclick = function() {
    isEditMode = false;
    currentEditId = null;
    modalTitle.textContent = 'Add New Employee';
    submitBtn.textContent = 'Add Employee';
    modal.classList.add('show');
};

cancelBtn.onclick = function() {
    modal.classList.remove('show');
    form.reset();
    clearExperience();
    isEditMode = false;
    currentEditId = null;
};

modal.onclick = function(e) {
    if (e.target === modal) {
        modal.classList.remove('show');
        form.reset();
        clearExperience();
        isEditMode = false;
        currentEditId = null;
    }
};

addExperienceBtn.onclick = function() {
    addExperienceField();
};

function addExperienceField(company, position, duration) {
    company = company || '';
    position = position || '';
    duration = duration || '';
    
    experienceCounter++;
    const currentExpId = experienceCounter;
    
    const expItem = document.createElement('div');
    expItem.className = 'experience-item';
    expItem.setAttribute('data-exp-id', currentExpId);
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-experience-btn';
    removeBtn.textContent = '×';
    removeBtn.onclick = function() {
        removeExperience(currentExpId);
    };
    
    const companyInput = document.createElement('input');
    companyInput.type = 'text';
    companyInput.className = 'exp-company';
    companyInput.placeholder = 'Company Name';
    companyInput.value = company;
    companyInput.required = true;
    
    const positionInput = document.createElement('input');
    positionInput.type = 'text';
    positionInput.className = 'exp-position';
    positionInput.placeholder = 'Position';
    positionInput.value = position;
    positionInput.required = true;
    
    const durationInput = document.createElement('input');
    durationInput.type = 'text';
    durationInput.className = 'exp-duration';
    durationInput.placeholder = 'Duration (e.g., 2020-2022)';
    durationInput.value = duration;
    durationInput.required = true;
    
    expItem.appendChild(removeBtn);
    expItem.appendChild(companyInput);
    expItem.appendChild(positionInput);
    expItem.appendChild(durationInput);
    
    experienceContainer.appendChild(expItem);
}

function removeExperience(expId) {
    const expItem = document.querySelector('[data-exp-id="' + expId + '"]');
    if (expItem) {
        expItem.remove();
    }
}

function clearExperience() {
    const expItems = experienceContainer.querySelectorAll('.experience-item');
    expItems.forEach(item => item.remove());
    experienceCounter = 0;
}

function getExperienceData() {
    const experiences = [];
    const expItems = experienceContainer.querySelectorAll('.experience-item');
    
    expItems.forEach(item => {
        const company = item.querySelector('.exp-company').value;
        const position = item.querySelector('.exp-position').value;
        const duration = item.querySelector('.exp-duration').value;
        
        experiences.push({
            company: company,
            position: position,
            duration: duration
        });
    });
    
    return experiences;
}

function isValid(name, email, phone) {
    if (name.length < 2 || name.length > 50) {
        alert('Name must be 2-50 characters');
        return false;
    }

    if (!email.includes('@')) {
        alert('Invalid email');
        return false;
    }

    if (phone.length !== 10 || isNaN(phone)) {
        alert('Phone must be 10 digits');
        return false;
    }

    return true;
}

form.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const role = document.getElementById('role').value;
    const photo = document.getElementById('photo').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const experience = getExperienceData();

    if (!isValid(name, email, phone)) return;

    if (isEditMode && currentEditId !== null) {
        const emp = employees.find(e => e.id === currentEditId);
        emp.name = name;
        emp.role = role;
        emp.photo = photo;
        emp.email = email;
        emp.phone = phone;
        emp.experience = experience;
    } else {
        employees.push({
            id: nextId++,
            name: name,
            role: role,
            photo: photo,
            email: email,
            phone: phone,
            experience: experience,
            room: null
        });
    }

    updateDisplay();
    modal.classList.remove('show');
    form.reset();
    clearExperience();
    isEditMode = false;
    currentEditId = null;
};

closeProfileBtn.onclick = function() {
    profileModal.classList.remove('show');
};

profileModal.onclick = function(e) {
    if (e.target === profileModal) {
        profileModal.classList.remove('show');
    }
};

editProfileBtn.onclick = function() {
    const empId = parseInt(editProfileBtn.getAttribute('data-emp-id'));
    openEditModal(empId);
};

deleteProfileBtn.onclick = function() {
    const empId = parseInt(deleteProfileBtn.getAttribute('data-emp-id'));
    deleteEmployee(empId);
};

function showProfile(empId) {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    document.getElementById('profileImg').src = emp.photo;
    document.getElementById('profileName').textContent = emp.name;
    document.getElementById('profileRole').textContent = emp.role;
    document.getElementById('profileEmail').textContent = emp.email;
    document.getElementById('profilePhone').textContent = emp.phone;

    const expDiv = document.getElementById('profileExperience');
    expDiv.textContent = '';
    
    if (emp.experience && emp.experience.length > 0) {
        const expTitle = document.createElement('h4');
        expTitle.textContent = 'Experience:';
        expDiv.appendChild(expTitle);

        emp.experience.forEach(exp => {
            const expItem = document.createElement('div');
            expItem.className = 'exp-item';
            
            const positionPara = document.createElement('p');
            const strong = document.createElement('strong');
            strong.textContent = exp.position;
            positionPara.appendChild(strong);
            positionPara.appendChild(document.createTextNode(' at ' + exp.company));
            
            const durationPara = document.createElement('p');
            durationPara.style.color = '#666';
            durationPara.textContent = exp.duration;
            
            expItem.appendChild(positionPara);
            expItem.appendChild(durationPara);
            expDiv.appendChild(expItem);
        });
    }

    editProfileBtn.setAttribute('data-emp-id', empId);
    deleteProfileBtn.setAttribute('data-emp-id', empId);
    
    profileModal.classList.add('show');
}

function openEditModal(empId) {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    isEditMode = true;
    currentEditId = empId;

    document.getElementById('name').value = emp.name;
    document.getElementById('email').value = emp.email;
    document.getElementById('phone').value = emp.phone;
    document.getElementById('role').value = emp.role;
    document.getElementById('photo').value = emp.photo;

    clearExperience();
    if (emp.experience && emp.experience.length > 0) {
        emp.experience.forEach(exp => {
            addExperienceField(exp.company, exp.position, exp.duration);
        });
    }

    modalTitle.textContent = 'Edit Employee';
    submitBtn.textContent = 'Update Employee';
    
    profileModal.classList.remove('show');
    modal.classList.add('show');
}

function deleteEmployee(empId) {
    if (confirm('Are you sure you want to delete this employee?')) {
        const index = employees.findIndex(e => e.id === empId);
        if (index !== -1) {
            employees.splice(index, 1);
            updateDisplay();
            profileModal.classList.remove('show');
        }
    }
}

function renderUnassigned() {
    const list = document.getElementById('unassignedList');
    list.textContent = '';
    
    employees.filter(e => e.room === null).forEach(emp => {
        const card = document.createElement('div');
        card.className = 'employee-card';
        card.onclick = function() {
            showProfile(emp.id);
        };

        const img = document.createElement('img');
        img.src = emp.photo;
        img.alt = emp.name;

        const info = document.createElement('div');
        
        const name = document.createElement('strong');
        name.textContent = emp.name;
        
        const role = document.createElement('p');
        role.textContent = emp.role;

        info.appendChild(name);
        info.appendChild(role);
        card.appendChild(img);
        card.appendChild(info);
        list.appendChild(card);
    });
}

function renderRooms() {
    const roomIds = ['conference', 'reception', 'security', 'servers', 'staff', 'vault'];
    
    roomIds.forEach(roomId => {
        const staffDiv = document.querySelector('#' + roomId + ' .room-staff');
        staffDiv.textContent = '';
        
        employees.filter(e => e.room === roomId).forEach(emp => {
            const card = document.createElement('div');
            card.className = 'employee-card';

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.onclick = function(e) {
                e.stopPropagation();
                removeFromRoom(emp.id);
            };

            card.onclick = function() {
                showProfile(emp.id);
            };

            const img = document.createElement('img');
            img.src = emp.photo;
            img.alt = emp.name;

            const info = document.createElement('div');
            
            const name = document.createElement('strong');
            name.textContent = emp.name;

            info.appendChild(name);
            card.appendChild(removeBtn);
            card.appendChild(img);
            card.appendChild(info);
            staffDiv.appendChild(card);
        });
    });
}

function removeFromRoom(empId) {
    const emp = employees.find(e => e.id === empId);
    emp.room = null;
    updateDisplay();
}

function updateDisplay() {
    renderUnassigned();
    renderRooms();
}

closeSelectBtn.onclick = function() {
    selectModal.classList.remove('show');
    eligibleList.textContent = '';
};

selectModal.onclick = function(e) {
    if (e.target === selectModal) {
        selectModal.classList.remove('show');
        eligibleList.textContent = '';
    }
};

document.querySelectorAll('.room-add-btn').forEach(btn => {
    btn.onclick = function() {
        const roomId = btn.getAttribute('data-room');
        showEligibleEmployees(roomId);
    };
});

function showEligibleEmployees(roomId) {
    currentRoomId = roomId;

    if (isRoomFull(roomId)) {
        alert('Room is full!');
        return;
    }

    const unassigned = employees.filter(e => e.room === null);
    const eligible = unassigned.filter(e => canEnterRoom(e.role, roomId));

    if (eligible.length === 0) {
        alert('No eligible employees available');
        return;
    }

    eligibleList.textContent = '';
    
    eligible.forEach(emp => {
        const card = document.createElement('div');
        card.className = 'employee-card selectable';

        const img = document.createElement('img');
        img.src = emp.photo;
        img.alt = emp.name;

        const info = document.createElement('div');
        
        const name = document.createElement('strong');
        name.textContent = emp.name;
        
        const role = document.createElement('p');
        role.textContent = emp.role;

        info.appendChild(name);
        info.appendChild(role);
        card.appendChild(img);
        card.appendChild(info);

        card.onclick = function() {
            assignEmployeeToRoom(emp.id);
        };

        eligibleList.appendChild(card);
    });

    selectModal.classList.add('show');
}

function assignEmployeeToRoom(empId) {
    const emp = employees.find(e => e.id === empId);
    emp.room = currentRoomId;
    updateDisplay();
    selectModal.classList.remove('show');
    eligibleList.textContent = '';
}

document.addEventListener('DOMContentLoaded', function() {
    updateDisplay();
});
