from menace import Menace
from gui import TicTacToeGUI

# Entry point for running the game with the GUI
if __name__ == "__main__":
    # Create MENACE agent as player 'X'
    agent = Menace(player_letter='X')

    # Launch the GUI and pass the MENACE agent to it
    TicTacToeGUI(agent)
