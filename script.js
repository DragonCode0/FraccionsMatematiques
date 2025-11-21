// Configuració de nivells
const levels = {
    facil: { min: 1, max: 5, name: 'Fàcil' },
    mitja: { min: 1, max: 10, name: 'Mitjà' },
    dificil: { min: 1, max: 20, name: 'Difícil' }
};

let currentLevel = null;
let currentOperation = 'suma';
let exercises = [];

// Generar fraccions aleatòries
function generateFraction(maxDenominator) {
    const numerator = Math.floor(Math.random() * maxDenominator) + 1;
    const denominator = Math.floor(Math.random() * (maxDenominator - 1)) + 2;
    return { numerator, denominator };
}

// Simplificar fracció (MCD)
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(numerator, denominator) {
    const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
    return {
        numerator: numerator / divisor,
        denominator: denominator / divisor
    };
}

// Generar exercici
function generateExercise(operation, maxDenominator) {
    const f1 = generateFraction(maxDenominator);
    const f2 = generateFraction(maxDenominator);

    let result;
    switch (operation) {
        case 'suma':
            result = {
                numerator: f1.numerator * f2.denominator + f2.numerator * f1.denominator,
                denominator: f1.denominator * f2.denominator
            };
            break;
        case 'resta':
            result = {
                numerator: f1.numerator * f2.denominator - f2.numerator * f1.denominator,
                denominator: f1.denominator * f2.denominator
            };
            break;
        case 'multiplicacio':
            result = {
                numerator: f1.numerator * f2.numerator,
                denominator: f1.denominator * f2.denominator
            };
            break;
        case 'divisio':
            result = {
                numerator: f1.numerator * f2.denominator,
                denominator: f1.denominator * f2.numerator
            };
            break;
    }

    result = simplifyFraction(result.numerator, result.denominator);

    return {
        fraction1: f1,
        fraction2: f2,
        operation,
        result,
        symbol: {
            suma: '+',
            resta: '-',
            multiplicacio: '×',
            divisio: '÷'
        }[operation]
    };
}

// Generar llista d'exercicis
function generateExercises(operation, maxDenominator) {
    const exercisesList = [];
    for (let i = 0; i < 10; i++) {
        exercisesList.push(generateExercise(operation, maxDenominator));
    }
    return exercisesList;
}

// Renderitzar exercicis
function renderExercises(exercises) {
    const exercisesContainer = document.getElementById('exercisesList');
    exercisesContainer.innerHTML = '';

    exercises.forEach((exercise, index) => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.id = `exercise-${index}`;

        const problem = `${exercise.fraction1.numerator}/${exercise.fraction1.denominator} ${exercise.symbol} ${exercise.fraction2.numerator}/${exercise.fraction2.denominator}`;

        card.innerHTML = `
            <div class="exercise-problem">${problem}</div>
            <div class="exercise-input-group">
                <input type="number" class="numerator-input" placeholder="Numerador" data-index="${index}">
                <span style="font-size: 1.5em; display: flex; align-items: center;">―</span>
                <input type="number" class="denominator-input" placeholder="Denominador" data-index="${index}">
            </div>
            <div class="exercise-buttons">
                <button class="check-btn" onclick="checkAnswer(${index})">Comprovar</button>
                <button class="clear-btn" onclick="clearAnswer(${index})">Netejar</button>
            </div>
            <div class="result-message" id="result-${index}"></div>
        `;

        exercisesContainer.appendChild(card);
    });

    // Afegir event listeners per Enter
    document.querySelectorAll('.numerator-input, .denominator-input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const index = input.dataset.index;
                checkAnswer(index);
            }
        });
    });
}

// Comprovar resposta
function checkAnswer(index) {
    const exercise = exercises[index];
    const numeratorInput = document.querySelector(`input.numerator-input[data-index="${index}"]`);
    const denominatorInput = document.querySelector(`input.denominator-input[data-index="${index}"]`);
    const resultMessage = document.getElementById(`result-${index}`);
    const card = document.getElementById(`exercise-${index}`);

    const userNumerator = parseInt(numeratorInput.value);
    const userDenominator = parseInt(denominatorInput.value);

    if (!numeratorInput.value || !denominatorInput.value) {
        resultMessage.textContent = '⚠️ Omple tots els camps';
        resultMessage.className = 'result-message show incorrect';
        return;
    }

    const isCorrect = userNumerator === exercise.result.numerator && 
                      userDenominator === exercise.result.denominator;

    if (isCorrect) {
        resultMessage.textContent = '✅ Correcte! Bé fet!';
        resultMessage.className = 'result-message show correct';
        numeratorInput.classList.add('correct');
        denominatorInput.classList.add('correct');
        card.classList.add('correct');
    } else {
        resultMessage.textContent = `❌ Incorrecte. Resposta correcta: ${exercise.result.numerator}/${exercise.result.denominator}`;
        resultMessage.className = 'result-message show incorrect';
        numeratorInput.classList.add('incorrect');
        denominatorInput.classList.add('incorrect');
        card.classList.add('incorrect');
    }

    numeratorInput.disabled = true;
    denominatorInput.disabled = true;
}

// Netejar resposta
function clearAnswer(index) {
    const numeratorInput = document.querySelector(`input.numerator-input[data-index="${index}"]`);
    const denominatorInput = document.querySelector(`input.denominator-input[data-index="${index}"]`);
    const resultMessage = document.getElementById(`result-${index}`);
    const card = document.getElementById(`exercise-${index}`);

    numeratorInput.value = '';
    denominatorInput.value = '';
    numeratorInput.disabled = false;
    denominatorInput.disabled = false;
    numeratorInput.classList.remove('correct', 'incorrect');
    denominatorInput.classList.remove('correct', 'incorrect');
    resultMessage.className = 'result-message';
    card.classList.remove('correct', 'incorrect');
}

// Event listeners pels botons de nivell
document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const level = btn.dataset.level;
        currentLevel = level;
        currentOperation = 'suma';

        document.getElementById('levelSelector').style.display = 'none';
        document.getElementById('exercisesSection').style.display = 'block';
        document.getElementById('exerciseTitle').textContent = `Exercicis - Nivell ${levels[level].name}`;

        exercises = generateExercises('suma', levels[level].max);
        renderExercises(exercises);
    });
});

// Event listeners pels botons de tabulació
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentOperation = btn.dataset.operation;
        exercises = generateExercises(currentOperation, levels[currentLevel].max);
        renderExercises(exercises);
    });
});

// Botó enrere
document.getElementById('backBtn').addEventListener('click', () => {
    document.getElementById('levelSelector').style.display = 'block';
    document.getElementById('exercisesSection').style.display = 'none';
});