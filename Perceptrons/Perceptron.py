threshold = 1.0                 # threshold to decide if I get up or not
bias = -0.5                     # bias becasue I don't like getting up
inputs = {
    "Rested": 0,
    "Health": 0,
    "Weather": 0,
    "Importance": 0,
}
weights = {
    "RestedWeight": 0.2,        # being rested helps a bit
    "HealthWeight": 1.0,        # being healthy strongly helps
    "WeatherWeight": 0,         # good weather helps a bit
    "ImportanceWeight": 0.8,    # importance helps a lot 
}

def perceptron(inputs, weights, threshold, bias, label):
    total = 0
    for i in range(len(inputs)):
        total += inputs[i] * weights[i]
    activation = total + bias
    will_get_up = activation > threshold

    print(f"\n{label}")
    print(f"Total: {total:.2f} + Bias: {bias} = Activation: {activation:.2f}")
    print(f"Threshold: {threshold}")
    print("Yes! I will get up.\n" if will_get_up else "No... I will stay in bed. \n")
    print("-" * 30)

    return will_get_up

# XOR gate using a 2-layer perceptron
def xor_gate(inputs):
    # Hidden layer
    h1 = perceptron(inputs, [1, 1], 0, -0.5, label="OR gate")
    h2 = perceptron(inputs, [-1, -1], 0, 1.5, label="NAND gate")
    
    # Output layer
    print("\nXOR gate output:")
    perceptron([h1, h2], [1, 1], 0, -1.5, label="AND gate")

def get_valid_input(promt):
    while True:
        try:
            value = float(input(promt))
            if -1 <= value <= 1:
                return value
            else:
                print("Value must be between -1 and 1. Please try again.")
        except ValueError:
            print("Invalid input. Please enter a numeric value.")

print("Will I get up from the bed today?")
print("Enter between -1 to 1 for relevance for today.")

inputs["Rested"] = get_valid_input("How rested do I feel? ")
inputs["Health"] = get_valid_input("How healthy do I feel? ")
inputs["Weather"] = get_valid_input("Is the weather nice? ")
inputs["Importance"] = get_valid_input("Is it important to get up? ")

inputs = list(inputs.values())
weights = list(weights.values())

perceptron(inputs, weights, threshold, bias, label="Will I get up?") # Simple perceptron to decide if I will get up from bed or not

# AND gate example
input("\nAND Gate Example...")
and_inputs = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
]
and_weights = [1, 1]
and_threshold = 0
and_bias = -1.5 # bias to ensure both inputs must be 1
for inp in and_inputs:
    perceptron(inp, and_weights, and_threshold, and_bias, label=f"Input: {inp}")

# OR gate example
input("\nOR Gate Example...")
or_inputs = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
]
or_weights = [1, 1]
or_threshold = 0
or_bias = -0.5 # bias to ensure at least one input must be 1
for inp in or_inputs:
    perceptron(inp, or_weights, or_threshold, or_bias, label=f"Input: {inp}")

# XOR gate example
input("\nXOR Gate Example...")
xor_inputs = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
]
for inp in xor_inputs:
    xor_gate(inp)

