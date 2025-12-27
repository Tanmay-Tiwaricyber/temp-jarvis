const { Chess } = require('chess.js');

let chess = new Chess();
let isGameActive = false;

// 1. START GAME
function startGame(speak, updateUI) {
    chess.reset();
    isGameActive = true;
    speak("Initializing Chess Protocol. I will play as Black. You make the first move.");
    updateUI(chess.fen()); // Send board state to UI
}

// 2. STOP GAME
function stopGame(speak, updateUI) {
    isGameActive = false;
    speak("Chess game terminated. Returning to standard interface.");
    updateUI(null); // Hide board
}

// 3. HANDLE USER MOVE
function handleMove(command, speak, updateUI) {
    if (!isGameActive) return;

    // Parse "Pawn to e4" or just "e4"
    // We try to extract standard algebraic notation (e.g., "e4", "Nf3", "O-O")
    // Clean command: remove "move", "to", "jarvis"
    const cleanMove = command.replace(/move|to|jarvis|pawn|knight|bishop|rook|queen|king/gi, "").trim();

    // Try to find a valid move matching the input
    const moves = chess.moves();
    const move = moves.find(m => m.toLowerCase() === cleanMove.toLowerCase() || m.toLowerCase().includes(cleanMove.toLowerCase()));
    
    // Attempt move
    try {
        const result = chess.move(cleanMove) || chess.move(move);
        
        if (result) {
            updateUI(chess.fen());
            
            if (chess.isGameOver()) {
                handleGameOver(speak);
                return;
            }

            // JARVIS TURN (Delay slightly for realism)
            setTimeout(() => {
                makeAIMove(speak, updateUI);
            }, 1000);

        } else {
            speak("That is an invalid move, Sir.");
        }
    } catch (e) {
        speak("Invalid notation. Try saying 'e4' or 'knight to f3'.");
    }
}

// 4. JARVIS AI (Simple Minimax/Random for responsiveness)
function makeAIMove(speak, updateUI) {
    if (chess.isGameOver()) return;

    const moves = chess.moves();
    // Simple AI: Pick a random move for now (Upgrade to Stockfish later if needed)
    // For a "Smart" feel without heavy libraries, we capture if possible
    
    let chosenMove = moves[Math.floor(Math.random() * moves.length)];
    
    // Prioritize captures
    const captureMove = moves.find(m => m.includes("x"));
    if (captureMove) chosenMove = captureMove;

    chess.move(chosenMove);
    speak(`I move to ${chosenMove}.`);
    updateUI(chess.fen());

    if (chess.isGameOver()) handleGameOver(speak);
}

function handleGameOver(speak) {
    isGameActive = false;
    if (chess.isCheckmate()) speak("Checkmate. The game is over.");
    else if (chess.isDraw()) speak("It is a draw, Sir.");
    else speak("Game over.");
}

module.exports = { startGame, stopGame, handleMove, isGameActive: () => isGameActive };