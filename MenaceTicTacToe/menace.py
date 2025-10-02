import random
import json
import os

class Menace:
    def __init__(self, player_letter='X', beads_init=3, beads_reward=3, beads_penalty=1, data_file='MenaceTicTacToe/data/matchboxes.json'):
        self.player_letter = player_letter
        self.beads_init = beads_init
        self.beads_reward = beads_reward
        self.beads_penalty = beads_penalty
        self.data_file = data_file

        self.matchboxes = {}  # {state_str: {move_index: bead_count}}
        self.history = []     # list of (state, move) tuples from current game

        # Load saved matchboxes or initialize new ones
        if os.path.exists(data_file):
            self.load_matchboxes()
        else:
            os.makedirs(os.path.dirname(data_file), exist_ok=True)

    def load_matchboxes(self):
        # Load saved matchboxes from disk
        with open(self.data_file, 'r') as f:
            self.matchboxes = json.load(f)
            # Ensure keys are integers for moves
            for state in self.matchboxes:
                self.matchboxes[state] = {int(k): v for k, v in self.matchboxes[state].items()}

    def save_matchboxes(self):
        # Save matchboxes to disk
        with open(self.data_file, 'w') as f:
            json.dump(self.matchboxes, f)

    def get_moves(self, state, available_moves):
        # Create a new matchbox for unseen states
        if state not in self.matchboxes:
            self.matchboxes[state] = {move: self.beads_init for move in available_moves}
        else:
            # Add new possible moves if not already in matchbox
            for move in available_moves:
                if move not in self.matchboxes[state]:
                    self.matchboxes[state][move] = self.beads_init
        return self.matchboxes[state]

    def choose_move(self, state, available_moves):
        moves = self.get_moves(state, available_moves)

        # Choose move with probability proportional to bead count
        weighted_moves = []
        for move, beads in moves.items():
            weighted_moves.extend([move] * beads)

        # Fallback to random move if no beads
        chosen = random.choice(weighted_moves) if weighted_moves else random.choice(available_moves)

        # Save state and move for learning later
        self.history.append((state, chosen))
        return chosen

    def update_after_game(self, result):
        # Update bead counts based on game outcome
        for state, move in self.history:
            beads = self.matchboxes[state]
            if result == 'win':
                beads[move] += self.beads_reward
            elif result == 'loss':
                beads[move] = max(1, beads[move] - self.beads_penalty)
            elif result == 'draw':
                beads[move] += 1  # smaller reward for draw

        # Clear game history
        self.history.clear()