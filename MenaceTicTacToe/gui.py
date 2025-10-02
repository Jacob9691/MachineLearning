import tkinter as tk
import threading
from menace import Menace
from game import TicTacToe
from trainer import train

class TicTacToeGUI:
    def __init__(self, agent: Menace):
        self.agent = agent
        self.game = TicTacToe()

        # Setup main GUI window
        self.window = tk.Tk()
        self.window.title("MENACE Tic-Tac-Toe")

        self.buttons = []
        self.info_label = tk.Label(self.window, text="Your turn (O)")
        self.info_label.grid(row=0, column=0, columnspan=3)

        # Create 3x3 board buttons
        for i in range(9):
            btn = tk.Button(self.window, text=' ', font=('normal', 20), width=5, height=2,
                            command=lambda i=i: self.human_move(i))
            btn.grid(row=1 + i // 3, column=i % 3)
            self.buttons.append(btn)

        # Restart button
        self.reset_button = tk.Button(self.window, text="Restart", command=self.reset)
        self.reset_button.grid(row=4, column=0, columnspan=1)

        # Training button
        self.train_button = tk.Button(self.window, text="Train MENACE", command=self.train_menace)
        self.train_button.grid(row=4, column=1, columnspan=2)

        # Game configuration
        self.agent_letter = 'X'
        self.human_letter = 'O'
        self.current_letter = 'X'  # MENACE starts

        # Start game with MENACE's move
        self.after_agent_move()

        # Run the GUI loop
        self.window.mainloop()

    def human_move(self, idx):
        # Ignore if it's not human's turn
        if self.current_letter != self.human_letter:
            return

        # Ignore if the selected square is already taken
        if self.game.board[idx] != ' ':
            return

        # Make human move
        self.game.make_move(idx, self.human_letter)
        self.update_buttons()

        # Check for win/draw
        if self.check_winner(self.human_letter):
            self.info_label.config(text="You win!")
            self.disable_buttons()
            return
        elif not self.game.empty_squares():
            self.info_label.config(text="It's a draw!")
            self.disable_buttons()
            return

        # Switch to MENACE's turn
        self.current_letter = self.agent_letter
        self.info_label.config(text="MENACE is thinking...")
        self.window.after(500, self.after_agent_move)

    def after_agent_move(self):
        # Ignore if it's not MENACE's turn
        if self.current_letter != self.agent_letter:
            return

        # Let MENACE choose a move
        move = self.agent.choose_move(self.game.board_state(), self.game.available_moves())
        self.game.make_move(move, self.agent_letter)
        self.update_buttons()

        # Check for win/draw
        if self.check_winner(self.agent_letter):
            self.info_label.config(text="MENACE wins!")
            self.disable_buttons()
            return
        elif not self.game.empty_squares():
            self.info_label.config(text="It's a draw!")
            self.disable_buttons()
            return

        # Switch to human's turn
        self.current_letter = self.human_letter
        self.info_label.config(text="Your turn (O)")

    def update_buttons(self):
        # Refresh button texts based on board state
        for i in range(9):
            self.buttons[i].config(text=self.game.board[i])

    def check_winner(self, letter):
        return self.game.current_winner == letter

    def disable_buttons(self):
        for btn in self.buttons:
            btn.config(state='disabled')

    def reset(self):
        # Reset game state and board
        self.game = TicTacToe()
        self.current_letter = 'X'
        self.agent.history.clear()
        self.agent.update_after_game('draw')  # clear internal state
        self.agent.save_matchboxes()

        for btn in self.buttons:
            btn.config(text=' ', state='normal')

        self.info_label.config(text="MENACE starts (X)")
        self.window.after(500, self.after_agent_move)

    def train_menace(self):
        # Train the agent in a background thread
        def run_training():
            self.info_label.config(text="Training MENACE...")
            train(self.agent, episodes=5000, verbose=False)
            self.info_label.config(text="Training complete!")

        thread = threading.Thread(target=run_training)
        thread.start()