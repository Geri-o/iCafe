document.addEventListener('DOMContentLoaded', async () => {
    const pcContainer = document.getElementById('pc-container');
    const toggleDragBtn = document.getElementById('toggle-drag-btn');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const loadingIndicator = document.getElementById('loading');
    let dragEnabled = false;
    const token = 'Eyj0exaioijkv1qilcjhbgciojuzi1Nij9.Eyjhdwqioii2iiwianrpijoinznzdzzjzz dlzjdkmjnhodg1yjkilcjpyxqioje3mtgyode3ntaundg5mdy3lcjuymyioje3mtgyode3ntaun 29wzxmioltdfq.r0qwnmea6Uppm1uhwgcwmtcc_b4ebbugbrrwnfg9tflruhuw95gcfgcg9pi mly41mufykx4jmp5gkkkstjpzrf68hvjwfvha-5kb46Syaou9f6uzryuqesn5nkosouqh5h_QLKPSNQ2MW6t171Piekoirrmnwzp6ACyQGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGHG am5no_dhxtcz7r41_idv9_5utf2zeasmquac5Slz8MT6z8P6tayfk4kg2lse3xy9lsnn1 Exvxred7xsyqcn9daizkf4zibvsrir8qtmqtmq7Lokt1knuw-dhggcwe1gx-3Byslmzdfm62xgjrp_ir_NUAaxmvdeyjiwf-TDFWHX-OO9QWCBSA9WCB Xewnyokeubrdtfkakpvnlqao9anlqsez7393Q12Ahfsuw87vhtxFr58Misvanavsqkybspgg6sv6KHMKN7Qawyy -jtnapj8ouuep2Crse4'; // Securely fetch or store your token
    const history = [];
    let historyPointer = -1;

    async function fetchPCData() {
        try {
            const response = await fetch('https://api.icafecloud.com/api/v2/cafe/72471/pcs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch PC data. HTTP error! Status: ${response.status}`);
            }

            const jsonData = await response.json();
            console.log('Received PC data:', jsonData); // Add this line to log the received data

            if (!Array.isArray(jsonData.data)) {
                console.error('PC data is not an array:', jsonData);
                return [];
            }

            return jsonData.data;
        } catch (error) {
            console.error('Error fetching PC data:', error);
            return [];
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    function createPCCard(pc, index) {
        const isOnline = pc.pc_in_using === 1;
        const statusColor = isOnline ? 'green' : '';
        const displayName = pc.pc_name.length > 5 ? pc.pc_name.substring(0, 5) + '...' : pc.pc_name;
        const pcCard = document.createElement('div');
        pcCard.className = `pc-card ${isOnline ? 'online' : 'offline'}`;
        pcCard.id = `pc-${index}`;
        
        const pcIcon = document.createElement('img');
        pcIcon.src = "icon.png";
        pcIcon.alt = "PC Icon";
        pcIcon.classList.add('pc-icon');
        
        const pcName = document.createElement('h3');
        pcName.textContent = displayName;
        pcName.style.color = statusColor;

        pcCard.appendChild(pcIcon);
        pcCard.appendChild(pcName);

        const savedPosition = localStorage.getItem(pcCard.id);
        if (savedPosition) {
            const [left, top] = savedPosition.split(',');
            pcCard.style.left = `${left}px`;
            pcCard.style.top = `${top}px`;
        }

        pcCard.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            handlePcClick(pcCard, event);
        });

        return pcCard;
    }

    function renderPCs(pcData) {
        pcContainer.innerHTML = '';
        pcData.forEach((pc, index) => {
            const pcCard = createPCCard(pc, index);
            pcContainer.appendChild(pcCard);
        });
    }

    function handlePcClick(pcCard, event) {
        const existingOptionsMenu = document.querySelector('.options-menu');
        if (existingOptionsMenu) {
            pcContainer.removeChild(existingOptionsMenu);
        }

        const optionsMenu = document.createElement('div');
        optionsMenu.className = 'options-menu';
        optionsMenu.innerHTML = `
            <ul>
                <li><a href="#" class="book-pc">Book this PC</a></li>
                <li><a href="#" class="login-pc">Login to this PC</a></li>
            </ul>
        `;
        pcContainer.appendChild(optionsMenu);

        const rect = pcCard.getBoundingClientRect();
        const pcCardLeft = rect.left + window.scrollX;
        const pcCardTop = rect.top + window.scrollY;

        optionsMenu.style.left = `${pcCardLeft}px`;
        optionsMenu.style.top = `${pcCardTop}px`;

        optionsMenu.querySelector('.book-pc').addEventListener('click', () => {
            console.log('Book this PC clicked');
            pcContainer.removeChild(optionsMenu);
        });

        optionsMenu.querySelector('.login-pc').addEventListener('click', () => {
            console.log('Login to this PC clicked');
            pcContainer.removeChild(optionsMenu);
        });
    }

    function toggleDragAndDrop() {
        dragEnabled = !dragEnabled;
        const pcCards = document.querySelectorAll('.pc-card');

        if (dragEnabled) {
            toggleDragBtn.textContent = 'Save Layout';
            pcCards.forEach(card => {
                $(card).draggable({
                    containment: '#pc-container',
                    start: function() {
                        card.classList.add('dragging');
                    },
                    stop: function(event, ui) {
                        card.classList.remove('dragging');
                        const { left, top } = ui.position;
                        localStorage.setItem(card.id, `${left},${top}`);
                        saveHistory();
                    }
                });
            });
        } else {
            toggleDragBtn.textContent = 'Enable Drag and Drop';
            pcCards.forEach(card => {
                $(card).draggable('destroy');
            });
            saveHistory();
        }
    }

    function saveHistory() {
        const pcCards = document.querySelectorAll('.pc-card');
        const positions = Array.from(pcCards).map(card => ({
            id: card.id,
            left: card.style.left,
            top: card.style.top
        }));

        if (historyPointer < history.length - 1) {
            history.splice(historyPointer + 1);
        }

        history.push(positions);
        historyPointer = history.length - 1;

        updateHistoryButtons();
    }

    function updateHistoryButtons() {
        undoBtn.disabled = historyPointer <= 0;
        redoBtn.disabled = historyPointer >= history.length - 1;
    }

    function undo() {
        if (historyPointer > 0) {
            historyPointer--;
            applyHistory();
        }
    }

    function redo() {
        if (historyPointer < history.length - 1) {
            historyPointer++;
            applyHistory();
        }
    }

    function applyHistory() {
        const positions = history[historyPointer];
        positions.forEach(pos => {
            const card = document.getElementById(pos.id);
            if (card) {
                card.style.left = pos.left;
                card.style.top = pos.top;
                localStorage.setItem(pos.id, `${pos.left},${pos.top}`);
            }
        });
        updateHistoryButtons();
    }

    toggleDragBtn.addEventListener('click', toggleDragAndDrop);
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);

    loadingIndicator.style.display = 'block';
    fetchPCData().then(pcData => {
        renderPCs(pcData);
        saveHistory();
    });
});
