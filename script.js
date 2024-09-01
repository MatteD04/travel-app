document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('createPlan').addEventListener('click', createPlan);
    document.getElementById('showForm').addEventListener('click', showForm);
    document.getElementById('showPlans').addEventListener('click', showPlans);
    document.getElementById('closeSavedPlans').addEventListener('click', closeSavedPlans);

    const modal = document.getElementById('modal');
    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    const modalTappa = document.getElementById('modalTappa');
    const closeButtonTappa = document.querySelector('.close-button-tappa');
    closeButtonTappa.addEventListener('click', () => {
        modalTappa.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
        if (e.target === modalTappa) {
            modalTappa.classList.remove('show');
        }
    });
});

function showForm() {
    document.getElementById('vacationForm').classList.add('show');
    document.getElementById('savedPlansContainer').classList.remove('show');
}

function showPlans() {
    viewSavedPlans();
    document.getElementById('vacationForm').classList.remove('show');
    document.getElementById('savedPlansContainer').classList.add('show');
}

function closeSavedPlans() {
    document.getElementById('savedPlansContainer').classList.remove('show');
}

function createPlan() {
    const destination = document.getElementById('destination').value.trim();
    const startDate = document.getElementById('startDate').value;
    const duration = parseInt(document.getElementById('duration').value, 10);

    if (!destination || !startDate || isNaN(duration) || duration <= 0) {
        alert('Per favore, compila tutti i campi correttamente.');
        return;
    }

    const plan = {
        id: Date.now(),
        destination,
        startDate,
        duration,
        days: Array.from({ length: duration }, (_, i) => ({
            dayNumber: i + 1,
            date: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + i)).toLocaleDateString(),
            tappe: []
        }))
    };

    savePlan(plan);

    // Svuota il modulo dopo aver creato e salvato il piano
    document.getElementById('destination').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('duration').value = '';
}

function addTappa(planId, dayNumber) {
    const tappaTitle = prompt("Inserisci il titolo della tappa:");
    const tappaDescription = prompt("Inserisci la descrizione della tappa:");
    const tappaDate = prompt("Inserisci la data della tappa (Formato: YYYY-MM-DD):");
    const tappaImageUrl = prompt("Inserisci l'URL dell'immagine (opzionale):");
    const tappaFood = prompt("Inserisci il cibo consigliato (opzionale):");
    const tappaCuriosity = prompt("Inserisci una curiosità (opzionale):");

    if (!tappaTitle || !tappaDescription || !tappaDate) {
        alert("Titolo, descrizione e data sono obbligatori per aggiungere una tappa.");
        return;
    }

    const savedPlans = JSON.parse(localStorage.getItem('vacationPlans')) || [];
    const planIndex = savedPlans.findIndex(plan => plan.id === planId);

    if (planIndex === -1) {
        alert("Piano vacanza non trovato.");
        return;
    }

    const newTappa = {
        id: Date.now(),
        title: tappaTitle,
        description: tappaDescription,
        date: tappaDate,
        imageUrl: tappaImageUrl || '',
        food: tappaFood || '',
        curiosity: tappaCuriosity || '',
        rating: 0,
        notes: []
    };

    const day = savedPlans[planIndex].days.find(day => day.dayNumber === dayNumber);
    if (!day) {
        alert("Giorno non trovato.");
        return;
    }
    
    day.tappe.push(newTappa);
    localStorage.setItem('vacationPlans', JSON.stringify(savedPlans));

    displayPlan(savedPlans[planIndex], true);
}

function savePlan(plan) {
    const savedPlans = JSON.parse(localStorage.getItem('vacationPlans')) || [];
    savedPlans.push(plan);
    localStorage.setItem('vacationPlans', JSON.stringify(savedPlans));
    alert('Piano vacanza salvato con successo!');
    showForm(); // Torna al modulo dopo aver salvato
}

function viewSavedPlans() {
    const savedPlansContainer = document.getElementById('savedPlansContainer');
    const savedPlansDiv = document.getElementById('savedPlans');
    savedPlansDiv.innerHTML = '';

    const savedPlans = JSON.parse(localStorage.getItem('vacationPlans')) || [];

    if (!Array.isArray(savedPlans)) {
        alert('Errore nel recupero dei piani salvati.');
        return;
    }

    savedPlans.forEach(plan => {
        const planDiv = document.createElement('div');
        planDiv.className = 'day-plan';
        planDiv.innerHTML = `
            <h2>${plan.destination} - Inizia il ${plan.startDate}</h2>
            <button onclick="deletePlan(${plan.id})" class="delete-button">&times;</button>
            ${Array.isArray(plan.days) ? plan.days.map(day => `
                <div class="day-plan">
                    <h3>Giorno ${day.dayNumber} - ${day.date}</h3>
                    ${Array.isArray(day.tappe) ? day.tappe.map(tappa => `
                        <div class="tappa" onclick="viewTappaDetails(${plan.id}, ${day.dayNumber}, ${tappa.id})">
                            <h4>${tappa.title}</h4>
                            <p>${tappa.description}</p>
                        </div>
                    `).join('') : 'Nessuna tappa disponibile'}
                    <button onclick="addTappa(${plan.id}, ${day.dayNumber})">Aggiungi Tappa</button>
                </div>
            `).join('') : 'Nessun giorno disponibile'}
        `;
        savedPlansDiv.appendChild(planDiv);
    });
}

function deletePlan(planId) {
    let savedPlans = JSON.parse(localStorage.getItem('vacationPlans')) || [];
    savedPlans = savedPlans.filter(plan => plan.id !== planId);
    localStorage.setItem('vacationPlans', JSON.stringify(savedPlans));
    viewSavedPlans(); // Ricarica i piani salvati dopo la cancellazione
}

function viewTappaDetails(planId, dayNumber, tappaId) {
    const savedPlans = JSON.parse(localStorage.getItem('vacationPlans')) || [];
    const plan = savedPlans.find(plan => plan.id === planId);

    if (!plan) {
        alert('Piano vacanza non trovato.');
        return;
    }

    const day = plan.days.find(day => day.dayNumber === dayNumber);
    const tappa = day.tappe.find(tappa => tappa.id === tappaId);

    if (!tappa) {
        alert('Tappa non trovata.');
        return;
    }

    const tappaDetailsDiv = document.getElementById('tappaDetails');
    tappaDetailsDiv.innerHTML = `
        <h2>${tappa.title}</h2>
        <p>${tappa.description}</p>
        <p><strong>Data:</strong> ${tappa.date}</p>
        <p><strong>Cibo Consigliato:</strong> ${tappa.food}</p>
        <p><strong>Curiosità:</strong> ${tappa.curiosity}</p>
        ${tappa.imageUrl ? `<img src="${tappa.imageUrl}" alt="Immagine della tappa">` : ''}
        <div class="rating">
            <label for="rating">Valutazione:</label>
            <select id="rating" onchange="updateRating(${plan.id}, ${day.dayNumber}, ${tappa.id}, this.value)">
                <option value="1" ${tappa.rating == 1 ? 'selected' : ''}>1 Stella</option>
                <option value="2" ${tappa.rating == 2 ? 'selected' : ''}>2 Stelle</option>
                <option value="3" ${tappa.rating == 3 ? 'selected' : ''}>3 Stelle</option>
                <option value="4" ${tappa.rating == 4 ? 'selected' : ''}>4 Stelle</option>
                <option value="5" ${tappa.rating == 5 ? 'selected' : ''}>5 Stelle</option>
            </select>
        </div>
        <button onclick="addNoteToTappa(${plan.id}, ${day.dayNumber}, ${tappa.id})">Aggiungi Nota</button>
        ${tappa.notes.length > 0 ? `<h4>Note:</h4><ul>${tappa.notes.map(note => `<li>${note}</li>`).join('')}</ul>` : ''}
    `;

    document.getElementById('modalTappa').classList.add('show');
}

function updateRating(planId, dayNumber, tappaId, rating) {
    const savedPlans = JSON.parse(localStorage.getItem('vacationPlans')) || [];
    const plan = savedPlans.find(plan => plan.id === planId);

    if (!plan) {
        alert('Piano vacanza non trovato.');
        return;
    }

    const day = plan.days.find(day => day.dayNumber === dayNumber);
    const tappa = day.tappe.find(tappa => tappa.id === tappaId);

    if (!tappa) {
        alert('Tappa non trovata.');
        return;
    }

    tappa.rating = parseInt(rating, 10);
    localStorage.setItem('vacationPlans', JSON.stringify(savedPlans));
}

function addNoteToTappa(planId, dayNumber, tappaId) {
    const note = prompt("Inserisci una nota:");

    if (!note) {
        alert("Nota non valida.");
        return;
    }

    const savedPlans = JSON.parse(localStorage.getItem('vacationPlans')) || [];
    const plan = savedPlans.find(plan => plan.id === planId);

    if (!plan) {
        alert('Piano vacanza non trovato.');
        return;
    }

    const day = plan.days.find(day => day.dayNumber === dayNumber);
    const tappa = day.tappe.find(tappa => tappa.id === tappaId);

    if (!tappa) {
        alert('Tappa non trovata.');
        return;
    }

    tappa.notes.push(note);
    localStorage.setItem('vacationPlans', JSON.stringify(savedPlans));
    viewTappaDetails(planId, dayNumber, tappaId);
}