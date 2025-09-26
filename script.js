// Game state
let gameState = {
    currentLevel: null,
    score: 0,
    lives: 3,
    timeLeft: 60,
    currentQuestion: null,
    correctAnswers: 0,
    totalQuestions: 0,
    gameTimer: null,
    isGameActive: false,
    currentExplanation: null
};

// Difficulty configurations
const difficultyConfig = {
    easy: {
        tables: [1, 2, 3, 4, 5],
        timeLimit: 60,
        pointsPerCorrect: 10
    },
    medium: {
        tables: [1, 2, 3, 4, 5, 6, 7, 8],
        timeLimit: 60,
        pointsPerCorrect: 15
    },
    hard: {
        tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        timeLimit: 60,
        pointsPerCorrect: 20
    }
};

// DOM elements
const elements = {
    gameMenu: document.getElementById('gameMenu'),
    gameScreen: document.getElementById('gameScreen'),
    gameOver: document.getElementById('gameOver'),
    difficultyButtons: document.querySelectorAll('.difficulty-btn'),
    currentScore: document.getElementById('currentScore'),
    lives: document.getElementById('lives'),
    timeLeft: document.getElementById('timeLeft'),
    number1: document.getElementById('number1'),
    number2: document.getElementById('number2'),
    answerOptions: document.getElementById('answerOptions'),
    progressFill: document.getElementById('progressFill'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    finalScore: document.getElementById('finalScore'),
    correctAnswers: document.getElementById('correctAnswers'),
    accuracy: document.getElementById('accuracy'),
    playAgain: document.getElementById('playAgain'),
    backToMenu: document.getElementById('backToMenu'),
    bestScore: document.getElementById('bestScore'),
    gamesPlayed: document.getElementById('gamesPlayed'),
    celebration: document.getElementById('celebration'),
    homeBtn: document.getElementById('homeBtn')
};

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    loadGameStats();
    setupEventListeners();
    showMenu();
});

// Event listeners
function setupEventListeners() {
    // Difficulty selection
    elements.difficultyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const level = this.dataset.level;
            startGame(level);
        });
    });

    // Answer selection
    elements.answerOptions.addEventListener('click', function(e) {
        if (e.target.classList.contains('answer-btn') && gameState.isGameActive) {
            const selectedAnswer = parseInt(e.target.dataset.answer);
            checkAnswer(selectedAnswer, e.target);
        }
    });

    // Game over buttons
    elements.playAgain.addEventListener('click', function() {
        startGame(gameState.currentLevel);
    });

    elements.backToMenu.addEventListener('click', function() {
        showMenu();
    });

    // Home button during game
    elements.homeBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to go back to the menu? Your current progress will be lost.')) {
            showMenu();
        }
    });
}

// Start new game
function startGame(level) {
    // Clean up any existing explanation
    if (gameState.currentExplanation && document.body.contains(gameState.currentExplanation)) {
        document.body.removeChild(gameState.currentExplanation);
        gameState.currentExplanation = null;
    }
    
    gameState.currentLevel = level;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.correctAnswers = 0;
    gameState.totalQuestions = 0;
    gameState.isGameActive = true;
    
    const config = difficultyConfig[level];
    gameState.timeLeft = config.timeLimit;
    
    showGameScreen();
    updateDisplay();
    generateQuestion();
    startTimer();
}

// Show different screens
function showMenu() {
    // Clean up any existing explanation
    if (gameState.currentExplanation && document.body.contains(gameState.currentExplanation)) {
        document.body.removeChild(gameState.currentExplanation);
        gameState.currentExplanation = null;
    }
    
    elements.gameMenu.style.display = 'block';
    elements.gameScreen.style.display = 'none';
    elements.gameOver.style.display = 'none';
    gameState.isGameActive = false;
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
    }
}

function showGameScreen() {
    elements.gameMenu.style.display = 'none';
    elements.gameScreen.style.display = 'block';
    elements.gameOver.style.display = 'none';
}

function showGameOver() {
    elements.gameScreen.style.display = 'none';
    elements.gameOver.style.display = 'block';
    gameState.isGameActive = false;
    
    // Update final stats
    elements.finalScore.textContent = gameState.score;
    elements.correctAnswers.textContent = gameState.correctAnswers;
    const accuracy = gameState.totalQuestions > 0 ? 
        Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100) : 0;
    elements.accuracy.textContent = accuracy + '%';
    
    // Update game over title based on performance
    if (accuracy >= 90) {
        elements.gameOverTitle.textContent = '🌟 Perfect! You\'re a Math Wizard! 🌟';
    } else if (accuracy >= 70) {
        elements.gameOverTitle.textContent = '🎉 Great Job! Keep Practicing! 🎉';
    } else if (accuracy >= 50) {
        elements.gameOverTitle.textContent = '👍 Good Effort! Try Again! 👍';
    } else {
        elements.gameOverTitle.textContent = '💪 Don\'t Give Up! Practice Makes Perfect! 💪';
    }
    
    // Save stats
    saveGameStats();
    
    // Show celebration for good performance
    if (accuracy >= 80) {
        showCelebration();
    }
}

// Generate new question
function generateQuestion() {
    if (!gameState.isGameActive) return;
    
    const config = difficultyConfig[gameState.currentLevel];
    const table1 = config.tables[Math.floor(Math.random() * config.tables.length)];
    const table2 = config.tables[Math.floor(Math.random() * config.tables.length)];
    
    const correctAnswer = table1 * table2;
    gameState.currentQuestion = { table1, table2, correctAnswer };
    
    // Update question display
    elements.number1.textContent = table1;
    elements.number2.textContent = table2;
    
    // Generate answer options
    generateAnswerOptions(correctAnswer);
    
    // Reset answer buttons
    const answerButtons = elements.answerOptions.querySelectorAll('.answer-btn');
    answerButtons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        btn.disabled = false;
    });
    
    gameState.totalQuestions++;
    updateProgress();
}

// Generate answer options
function generateAnswerOptions(correctAnswer) {
    const options = [correctAnswer];
    const config = difficultyConfig[gameState.currentLevel];
    
    // Generate wrong answers
    while (options.length < 4) {
        let wrongAnswer;
        do {
            // Generate wrong answer that's close to correct answer
            const variation = Math.floor(Math.random() * 10) - 5;
            wrongAnswer = correctAnswer + variation;
        } while (wrongAnswer <= 0 || options.includes(wrongAnswer));
        
        options.push(wrongAnswer);
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    // Update answer buttons
    const answerButtons = elements.answerOptions.querySelectorAll('.answer-btn');
    answerButtons.forEach((btn, index) => {
        btn.textContent = options[index];
        btn.dataset.answer = options[index];
    });
}

// Check answer
function checkAnswer(selectedAnswer, buttonElement) {
    if (!gameState.isGameActive) return;
    
    const isCorrect = selectedAnswer === gameState.currentQuestion.correctAnswer;
    
    // Disable all buttons
    const answerButtons = elements.answerOptions.querySelectorAll('.answer-btn');
    answerButtons.forEach(btn => btn.disabled = true);
    
    if (isCorrect) {
        // Correct answer
        buttonElement.classList.add('correct');
        gameState.score += difficultyConfig[gameState.currentLevel].pointsPerCorrect;
        gameState.correctAnswers++;
        
        // Show celebration for correct answer
        showAnswerFeedback(true);
        
        // Next question after delay
        setTimeout(() => {
            if (gameState.isGameActive) {
                generateQuestion();
            }
        }, 1500);
    } else {
        // Wrong answer
        buttonElement.classList.add('incorrect');
        gameState.lives--;
        
        // Highlight correct answer
        answerButtons.forEach(btn => {
            if (parseInt(btn.dataset.answer) === gameState.currentQuestion.correctAnswer) {
                btn.classList.add('correct');
            }
        });
        
        // Show educational feedback with the correct answer
        showEducationalFeedback();
        
        // Don't auto-advance - let the user click to continue
        // The educational feedback will handle the next question timing
    }
    
    updateDisplay();
}

// Show answer feedback
function showAnswerFeedback(isCorrect) {
    if (isCorrect) {
        // Create temporary success message
        const successMsg = document.createElement('div');
        successMsg.textContent = '🎉 Correct! 🎉';
        successMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4CAF50;
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 2em;
            font-weight: bold;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            document.body.removeChild(successMsg);
        }, 1000);
    }
}

// Show educational feedback for wrong answers
function showEducationalFeedback() {
    const { table1, table2, correctAnswer } = gameState.currentQuestion;
    
    // Create educational explanation popup
    const explanationPopup = document.createElement('div');
    explanationPopup.className = 'educational-feedback';
    explanationPopup.innerHTML = `
        <div class="explanation-content">
            <div class="explanation-header">
                <span class="explanation-icon">💡</span>
                <span class="explanation-title">Let's Learn Together!</span>
            </div>
            <div class="explanation-math">
                <div class="math-problem">
                    <span class="math-number">${table1}</span>
                    <span class="math-operator">×</span>
                    <span class="math-number">${table2}</span>
                    <span class="math-equals">=</span>
                    <span class="math-answer">${correctAnswer}</span>
                </div>
                <div class="math-explanation">
                    <p class="explanation-text">Make ${table2} rows of ${table1} dots.</p>
                    <div class="visual-explanation">
                        ${generateVisualExplanation(table1, table2, correctAnswer)}
                    </div>
                    <p class="encouragement-text">You got this! 🌟</p>
                </div>
            </div>
            <div class="explanation-buttons">
                <button class="continue-btn" id="continueFromExplanation">
                    Continue 🚀
                </button>
                <button class="read-again-btn" id="readAgain">
                    Show Again 📖
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(explanationPopup);
    
    // Add event listeners for the buttons
    const continueBtn = document.getElementById('continueFromExplanation');
    const readAgainBtn = document.getElementById('readAgain');
    
    continueBtn.addEventListener('click', function() {
        if (document.body.contains(explanationPopup)) {
            document.body.removeChild(explanationPopup);
        }
        
        // Proceed to next question or game over
        if (gameState.lives <= 0) {
            endGame();
        } else if (gameState.isGameActive) {
            generateQuestion();
        }
    });
    
    readAgainBtn.addEventListener('click', function() {
        // Re-highlight the explanation with animation
        const mathAnswer = explanationPopup.querySelector('.math-answer');
        const visualExplanation = explanationPopup.querySelector('.visual-explanation');
        
        mathAnswer.style.animation = 'none';
        visualExplanation.style.animation = 'none';
        
        setTimeout(() => {
            mathAnswer.style.animation = 'highlightAnswer 1s ease-in-out';
            visualExplanation.style.animation = 'fadeIn 0.5s ease-in-out';
        }, 10);
        
        // Show a brief "reading again" message
        const encouragementText = explanationPopup.querySelector('.encouragement-text');
        const originalText = encouragementText.textContent;
        encouragementText.textContent = 'Look at the rows and dots 👀';
        encouragementText.style.color = '#FFD700';
        
        setTimeout(() => {
            encouragementText.textContent = originalText;
        }, 2000);
    });
    
    // Store reference for cleanup
    gameState.currentExplanation = explanationPopup;
}

// Generate visual explanation for multiplication
function generateVisualExplanation(table1, table2, correctAnswer) {
    // Build a scalable grid that always fits the popup without scrolling
    // Cap the dot count visually but preserve the rows/columns meaning
    const maxCols = 10; // visual cap for columns
    const maxRows = 10; // visual cap for rows

    const cols = Math.min(table1, maxCols);
    const rows = Math.min(table2, maxRows);

    let visual = `<div class="dots-grid" style="--cols:${cols}; --rows:${rows};">`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            visual += `<span class="dot dot-small">●</span>`;
        }
    }
    visual += `</div>`;

    // Add caption that reinforces full size when capped
    let caption = `${table2} rows of ${table1} dots = ${correctAnswer}`;
    if (table1 > maxCols || table2 > maxRows) {
        caption += ` (showing ${rows}×${cols})`;
    }

    visual += `<p class="dots-text">${caption}</p>`;
    return visual;
}

// Update display
function updateDisplay() {
    elements.currentScore.textContent = gameState.score;
    elements.lives.textContent = '❤️'.repeat(gameState.lives);
    elements.timeLeft.textContent = gameState.timeLeft;
}

// Update progress bar
function updateProgress() {
    const progress = (gameState.correctAnswers / 20) * 100; // 20 questions target
    elements.progressFill.style.width = Math.min(progress, 100) + '%';
}

// Timer
function startTimer() {
    gameState.gameTimer = setInterval(() => {
        if (gameState.isGameActive) {
            gameState.timeLeft--;
            elements.timeLeft.textContent = gameState.timeLeft;
            
            if (gameState.timeLeft <= 0) {
                endGame();
            }
        }
    }, 1000);
}

// End game
function endGame() {
    gameState.isGameActive = false;
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
    }
    showGameOver();
}

// Show celebration
function showCelebration() {
    elements.celebration.style.display = 'block';
    setTimeout(() => {
        elements.celebration.style.display = 'none';
    }, 3000);
}

// Local storage functions
function saveGameStats() {
    const stats = JSON.parse(localStorage.getItem('mathGameStats') || '{}');
    
    if (gameState.score > (stats.bestScore || 0)) {
        stats.bestScore = gameState.score;
    }
    
    stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
    
    localStorage.setItem('mathGameStats', JSON.stringify(stats));
}

function loadGameStats() {
    const stats = JSON.parse(localStorage.getItem('mathGameStats') || '{}');
    elements.bestScore.textContent = stats.bestScore || 0;
    elements.gamesPlayed.textContent = stats.gamesPlayed || 0;
}

// Add some fun sound effects (using Web Audio API)
function playSound(frequency, duration, type = 'sine') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        // Silently fail if audio context is not available
    }
}

// Add sound effects to game events
const originalCheckAnswer = checkAnswer;
checkAnswer = function(selectedAnswer, buttonElement) {
    const isCorrect = selectedAnswer === gameState.currentQuestion.correctAnswer;
    
    if (isCorrect) {
        playSound(523, 0.2); // C5 note for correct answer
    } else {
        playSound(220, 0.3, 'sawtooth'); // Lower note for wrong answer
    }
    
    return originalCheckAnswer.call(this, selectedAnswer, buttonElement);
};

// Add keyboard support for accessibility
document.addEventListener('keydown', function(e) {
    if (!gameState.isGameActive) return;
    
    const key = e.key;
    if (key >= '1' && key <= '4') {
        const buttonIndex = parseInt(key) - 1;
        const buttons = elements.answerOptions.querySelectorAll('.answer-btn');
        if (buttons[buttonIndex] && !buttons[buttonIndex].disabled) {
            buttons[buttonIndex].click();
        }
    }
});

// Add some motivational messages
const motivationalMessages = [
    "You're doing great!",
    "Keep it up!",
    "Math is fun!",
    "You're getting better!",
    "Amazing work!",
    "You're a math star!",
    "Fantastic!",
    "Keep practicing!"
];

// Show random motivational message
function showMotivationalMessage() {
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    const msgElement = document.createElement('div');
    msgElement.textContent = message;
    msgElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        font-size: 1.2em;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(msgElement);
    
    setTimeout(() => {
        if (document.body.contains(msgElement)) {
            document.body.removeChild(msgElement);
        }
    }, 2000);
}

// Show motivational message every 5 correct answers
let correctStreak = 0;
const originalGenerateQuestion = generateQuestion;
generateQuestion = function() {
    if (gameState.correctAnswers > 0 && gameState.correctAnswers % 5 === 0) {
        showMotivationalMessage();
    }
    return originalGenerateQuestion.call(this);
};
