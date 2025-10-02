import random
from game import TicTacToe
from menace import Menace

def random_player(game):
    # Random move from available ones
    return random.choice(game.available_moves())

def play_game(agent: Menace, opponent_func, verbose=False):
    game = TicTacToe()
    letter = 'X'  # MENACE is always 'X'

    while game.empty_squares():
        # Choose move depending on whose turn it is
        if letter == agent.player_letter:
            move = agent.choose_move(game.board_state(), game.available_moves())
        else:
            move = opponent_func(game)

        game.make_move(move, letter)

        if verbose:
            print(f"{letter} moves to {move}")
            game.print_board()
            print()

        if game.current_winner:
            if letter == agent.player_letter:
                agent.update_after_game('win')
                return 'win'
            else:
                agent.update_after_game('loss')
                return 'loss'

        # Switch turn
        letter = 'O' if letter == 'X' else 'X'

    # Game is a draw
    agent.update_after_game('draw')
    return 'draw'

def train(agent: Menace, episodes=5000, verbose=False):
    results = {'win': 0, 'loss': 0, 'draw': 0}

    for i in range(episodes):
        result = play_game(agent, random_player, verbose)
        results[result] += 1

        if verbose and (i + 1) % 1000 == 0:
            print(f"Episode {i+1}: {results}")

    agent.save_matchboxes()
    return results