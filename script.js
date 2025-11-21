let employees = [];
let nextId = 1;
let experienceCounter = 0;

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

addBtn.onclick = function() {
    modal.classList.add('show');
};

cancelBtn.onclick = function() {
    modal.classList.remove('show');
    form.reset();
    clearExperience();
};

modal.onclick = function(e) {
    if (e.target === modal) {
        modal.classList.remove('show');
        form.reset();
        clearExperience();
    }
};

addExperienceBtn.onclick = function() {
    addExperienceField();
};

function addExperienceField() {
    experienceCounter++;
    const expItem = document.createElement('div');
    expItem.className = 'experience-item';
    expItem.setAttribute('data-exp-id', experienceCounter);
    
    expItem.innerHTML = `
        <button type="button" class="remove-experience-btn" onclick="removeExperience(${experienceCounter})">×</button>
        <input type="text" class="exp-company" placeholder="Company Name" required>
        <input type="text" class="exp-position" placeholder="Position" required>
        <input type="text" class="exp-duration" placeholder="Duration (e.g., 2020-2022)" required>
    `;
    
    experienceContainer.appendChild(expItem);
}

function removeExperience(expId) {
    const expItem = document.querySelector(`[data-exp-id="${expId}"]`);
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

    updateDisplay();
    modal.classList.remove('show');
    form.reset();
    clearExperience();
};

function renderUnassigned() {
    const list = document.getElementById('unassignedList');
    list.textContent = '';
    employees.filter(e => e.room === null).forEach(emp => {
        const card = document.createElement('div');
        card.className = 'employee-card';

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
        const staffDiv = document.querySelector(`#${roomId} .room-staff`);
        staffDiv.textContent = '';
        employees.filter(e => e.room === roomId).forEach(emp => {
            const card = document.createElement('div');
            card.className = 'employee-card';

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.onclick = function() {
                removeFromRoom(emp.id);
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

const selectModal = document.getElementById('selectModal');
const eligibleList = document.getElementById('eligibleList');
const closeSelectBtn = document.getElementById('closeSelectBtn');
let currentRoomId = null;

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

function updateDisplay() {
    renderUnassigned();
    renderRooms();
}

document.addEventListener('DOMContentLoaded', function() {
    updateDisplay();
});
