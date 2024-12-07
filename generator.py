import random
import time
from kafka import KafkaProducer
import json

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

producer = KafkaProducer(
    bootstrap_servers="localhost:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),  # Serialize data to JSON
)


def simulate_delivery(
    current_batsman,
    current_bowler,
    total_runs,
    total_wickets,
    batsman_balls,
    total_boundaries,
    total_extras,
    batting_stats,
    bowling_stats,
):
    runs = random.choices([0, 1, 2, 3, 4, 6, "W"], weights=[40, 30, 15, 2, 7, 4, 2])[0]
    extras, wicket, boundaries = 0, 0, 0
    bowling_speed = random.uniform(
        70, 95
    )  # simulating bowling speed between 70 and 95 mph

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

    if current_batsman not in batting_stats:
        batting_stats[current_batsman] = {"runs": 0, "balls": 0, "boundaries": 0}

    batting_stats[current_batsman]["runs"] += runs
    batting_stats[current_batsman]["balls"] += 1
    batting_stats[current_batsman]["boundaries"] += boundaries

    if current_bowler not in bowling_stats:
        bowling_stats[current_bowler] = {
            "overs": 0,
            "runs_conceded": 0,
            "wickets": 0,
            "bowling_speeds": [],
        }

    bowling_stats[current_bowler]["overs"] += 1 / 6
    bowling_stats[current_bowler]["runs_conceded"] += runs
    bowling_stats[current_bowler]["wickets"] += wicket
    bowling_stats[current_bowler]["bowling_speeds"].append(bowling_speed)

    return (
        runs,
        wicket,
        total_runs,
        total_wickets,
        batsman_balls,
        total_boundaries,
        total_extras,
        batting_stats,
        bowling_stats,
    )


def simulate_innings(batsmen, bowlers, max_overs, team_name, innings_no):
    balls_per_over = 6
    current_total_runs, current_total_wickets, total_boundaries, total_extras = (
        0,
        0,
        0,
        0,
    )
    batsman_balls = {batsman: 0 for batsman in batsmen}
    batting_stats = {}
    bowling_stats = {}
    current_batsmen = [batsmen.pop(0), batsmen.pop(0)]

    for over in range(1, max_overs + 1):
        current_bowler = random.choice(bowlers)

        for ball in range(1, balls_per_over + 1):
            if current_total_wickets == 10 or not current_batsmen:
                return current_total_runs  # End innings if all out

            current_batsman = random.choice(current_batsmen)

            (
                runs_scored,
                wicket,
                current_total_runs,
                current_total_wickets,
                batsman_balls,
                total_boundaries,
                total_extras,
                batting_stats,
                bowling_stats,
            ) = simulate_delivery(
                current_batsman,
                current_bowler,
                current_total_runs,
                current_total_wickets,
                batsman_balls,
                total_boundaries,
                total_extras,
                batting_stats,
                bowling_stats,
            )

            if wicket == 1:
                if batsmen:
                    new_batsman = batsmen.pop(0)
                    current_batsmen[current_batsmen.index(current_batsman)] = (
                        new_batsman
                    )
                else:
                    current_batsmen.remove(current_batsman)

            match_update = {
                "team": team_name,
                "innings": innings_no,
                "over": over,
                "ball": ball,
                "runs_scored": runs_scored,
                "batsman": current_batsman,
                "bowler": current_bowler,
                "wickets": wicket,
                "total_runs": current_total_runs,
                "total_wickets": current_total_wickets,
                "balls_faced_by_batsman": batsman_balls[current_batsman],
                "total_boundaries": total_boundaries,
                "extras": total_extras,
                "batting_stats": batting_stats,  # Send the batting stats with each update
                "bowling_stats": bowling_stats,  # Send the bowling stats with each update
            }

            producer.send("cricket_match_topic", value=match_update)
            print(f"Sent: {match_update}")

            time.sleep(0.01)


def simulate_test_match():
    overs_per_innings = 90

    team_a_batsmen_first = team_a_batsmen.copy()
    simulate_innings(team_a_batsmen_first, bowlers, overs_per_innings, "Team A", 1)

    team_b_batsmen_first = team_b_batsmen.copy()
    simulate_innings(team_b_batsmen_first, bowlers, overs_per_innings, "Team B", 1)

    team_a_batsmen_second = team_a_batsmen.copy()
    simulate_innings(team_a_batsmen_second, bowlers, overs_per_innings, "Team A", 2)

    team_b_batsmen_second = team_b_batsmen.copy()
    simulate_innings(team_b_batsmen_second, bowlers, overs_per_innings, "Team B", 2)

    print("Match simulation complete.")


simulate_test_match()
