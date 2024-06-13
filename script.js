document.addEventListener('DOMContentLoaded', async () => {
    const pcContainer = document.getElementById('pc-container');
    const toggleDragBtn = document.getElementById('toggle-drag-btn');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const loadingIndicator = document.getElementById('loading');
    let dragEnabled = false;
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI2IiwianRpIjoiOTg1N2U4YzFiZjBmNGI2OTcxMTQ1MGFhNWFiOTExZDI0ODBlZWY5ZjE5NmY4MTRkNDA2MWZhYTg0ZjgxMmM4ZDg4NjM0NGE5MDE2MDRjNjEiLCJpYXQiOjE3MTgyODc3NzEuNzY0MTM5LCJuYmYiOjE3MTgyODc3NzEuNzY0MTQ0LCJleHAiOjE3NDk4MjM3NzEuNzU5OTg2LCJzdWIiOiIzODQxMTg4ODAxNzI0NzEiLCJzY29wZXMiOltdfQ.cBu-JqHzoBI09G8brn8KCgUXAcTP1PhFXaN2ujT31FZdIj8kLgYE-51ZHu1vn4qKXuuDJZ_Y3VlOs8yPPS9Z-5w7XoA-iZ6LNAxQY3JqCfdlFeBL3CSi4TIGDlFp_wSGEaO5YV6VdIVOWEDlHCRfpOaBfdEn-TikZw_LdUWLNF-FbRtwKc-cegR9vAugwcejj0e8Fp4a0er4OCg_EdJ3CthTKWjIbalVwB6UlIz-IeRJ0Kbd7kwqRGLJdyCWHZ4Rmtgc9bnwoCyhjyZPnmcmezUbT_8d_lFFJE8-yPpJJ_ENrXkYBU7AP63TB_uwPRxH65dlytznLKrblFJ9ooHdGfgUg0zpR0E2CU5IhNsN3BtZN-cPczWPgSQNUiYQK2B3RLfxxGziP_fClDiROCerorEDTu8NUpdui4X3k3weHrHKG9sxJUC9kH_l5jg6R0bO-MNJKXISEmVQNLOsdTihI3qRpXGGNzzyi1x9KyzHptXfxRKxaKKPWeXySW7QXnhPg-NaP8e-BuGY731MloeHCP-kIX7yEJuJNRfiSAom9DCn6j89L4bgB-4eO_9-lbOZdNJRpk5yPb3FQ9jTiGRCnVpigFNCM1fMx4F8quLOrLvmEmAaOlShOBiESSncEU84ZkcyMQ4kmcqBlFutTC11saGgSmDOzCtpA2Sic1j-7zI'; // Securely fetch or store your token
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
