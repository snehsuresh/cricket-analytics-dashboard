import csv
import random
import time

# Define the teams' batsmen and bowlers
team_a_batsmen = [
    "Rohit Sharma",
    "Shubman Gill",
    "Virat Kohli",
    "KL Rahul",
    "Hardik Pandya",
    "Ravindra Jadeja",
    "Rishabh Pant",
]
team_b_batsmen = [
    "David Warner",
    "Aaron Finch",
    "Steve Smith",
    "Marnus Labuschagne",
    "Glenn Maxwell",
    "Alex Carey",
    "Marcus Stoinis",
]
bowlers = [
    "Pat Cummins",
    "Josh Hazlewood",
    "Mitchell Starc",
    "Nathan Lyon",
    "Adam Zampa",
    "Glenn Maxwell",
]


# Function to simulate a ball delivery with Test match characteristics
def simulate_delivery(
    current_batsman,
    current_bowler,
    total_runs,
    total_wickets,
    batsman_balls,
    total_boundaries,
    total_extras,
):
    runs = random.choices([0, 1, 2, 3, 4, 6, "W"], weights=[40, 30, 15, 2, 7, 4, 2])[0]
    extras, wicket, boundaries = 0, 0, 0

    if runs == "W":
        wicket = 1
        runs = 0
    else:
        if runs in [4, 6]:
            boundaries = 1

    if random.random() < 0.03:
        extras = random.choice([1, 2])
        runs += extras

    total_runs += runs
    total_wickets += wicket
    batsman_balls[current_batsman] += 1
    total_boundaries += boundaries
    total_extras += extras

    return (
        runs,
        wicket,
        total_runs,
        total_wickets,
        batsman_balls,
        total_boundaries,
        total_extras,
    )


def simulate_innings(batsmen, bowlers, max_overs, csv_filename, team_name, innings_no):
    balls_per_over = 6
    current_total_runs, current_total_wickets, total_boundaries, total_extras = (
        0,
        0,
        0,
        0,
    )
    batsman_balls = {batsman: 0 for batsman in batsmen}
    current_batsmen = [batsmen.pop(0), batsmen.pop(0)]

    # Open the CSV file in append mode
    with open(csv_filename, mode="a", newline="") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "Team",
                "Innings",
                "Over",
                "Ball",
                "Runs Scored",
                "Batsman Name",
                "Bowler Name",
                "Wickets",
                "Total Runs",
                "Total Wickets",
                "Balls Faced by Batsman",
                "Total Boundaries",
                "Extras",
            ],
        )

        # If it's the first write (i.e., the first innings), write the header
        if innings_no == 1:
            writer.writeheader()

        for over in range(1, max_overs + 1):
            for ball in range(1, balls_per_over + 1):
                if current_total_wickets == 10 or not current_batsmen:
                    return current_total_runs  # End innings if all out

                current_batsman = random.choice(current_batsmen)
                current_bowler = random.choice(bowlers)

                # Simulate the delivery
                (
                    runs_scored,
                    wicket,
                    current_total_runs,
                    current_total_wickets,
                    batsman_balls,
                    total_boundaries,
                    total_extras,
                ) = simulate_delivery(
                    current_batsman,
                    current_bowler,
                    current_total_runs,
                    current_total_wickets,
                    batsman_balls,
                    total_boundaries,
                    total_extras,
                )

                # If there's a wicket, replace the current batsman
                if wicket == 1:
                    if batsmen:
                        new_batsman = batsmen.pop(0)
                        current_batsmen[current_batsmen.index(current_batsman)] = (
                            new_batsman
                        )
                    else:
                        current_batsmen.remove(current_batsman)

                # Write data for this ball to CSV after each delivery
                writer.writerow(
                    {
                        "Team": team_name,
                        "Innings": innings_no,
                        "Over": over,
                        "Ball": ball,
                        "Runs Scored": runs_scored,
                        "Batsman Name": current_batsman,
                        "Bowler Name": current_bowler,
                        "Wickets": wicket,
                        "Total Runs": current_total_runs,
                        "Total Wickets": current_total_wickets,
                        "Balls Faced by Batsman": batsman_balls[current_batsman],
                        "Total Boundaries": total_boundaries,
                        "Extras": total_extras,
                    }
                )

                # Flush the file after every write to ensure immediate update
                file.flush()

                time.sleep(1)  # Simulate real-time delivery (1 second per ball)

    return current_total_runs


# Function to simulate a full test match with live CSV updates
def simulate_test_match():
    overs_per_innings = 90  # Typical length of one Test innings
    csv_filename = "live_test_match_simulation.csv"

    # Simulate Team A's first innings
    team_a_batsmen_first = team_a_batsmen.copy()
    team_a_1st_innings_runs = simulate_innings(
        team_a_batsmen_first, bowlers, overs_per_innings, csv_filename, "Team A", 1
    )

    # Simulate Team B's first innings
    team_b_batsmen_first = team_b_batsmen.copy()
    team_b_1st_innings_runs = simulate_innings(
        team_b_batsmen_first, bowlers, overs_per_innings, csv_filename, "Team B", 1
    )

    # Simulate Team A's second innings
    team_a_batsmen_second = team_a_batsmen.copy()
    team_a_2nd_innings_runs = simulate_innings(
        team_a_batsmen_second, bowlers, overs_per_innings, csv_filename, "Team A", 2
    )

    # Simulate Team B's second innings
    team_b_batsmen_second = team_b_batsmen.copy()
    team_b_2nd_innings_runs = simulate_innings(
        team_b_batsmen_second, bowlers, overs_per_innings, csv_filename, "Team B", 2
    )

    print(f"CSV file '{csv_filename}' is being updated live with match data.")


# Start the live simulation
simulate_test_match()
