import random
import pandas as pd
from datetime import datetime, timedelta

# Define parameters for the IPL matches
teams = [
    "Mumbai Indians",
    "Chennai Super Kings",
    "Royal Challengers Bangalore",
    "Kolkata Knight Riders",
    "Sunrisers Hyderabad",
    "Rajasthan Royals",
    "Delhi Capitals",
    "Punjab Kings",
]

# Define world locations and their coordinates (latitude, longitude)
locations = {
    "Pakistan": (19.0760, 72.8777),
    "Brazil": (13.0827, 80.2707),
    "Fiji": (12.9716, 77.5946),
    "Kenya": (22.5726, 88.3639),
    "Bahamas": (17.3850, 78.4867),
    "Peru": (26.9124, 75.7873),
    "Columbia": (28.6139, 77.2090),
    "Venezuela": (30.7046, 76.7179),
    "Dubai": (25.276987, 55.296249),
    "Belarus": (51.5074, -0.1278),
    "New York": (40.7128, -74.0060),
    "Australia": (33.8688, 151.2093),
    "India": (-33.9249, 18.4241),
    "China": (19.0760, 72.8777),
}


# Function to generate random match data
def generate_ipl_data(num_matches):
    matches = []
    start_date = datetime(2024, 3, 20)  # Starting date of IPL 2024
    for i in range(num_matches):
        match_date = start_date + timedelta(
            days=random.randint(0, 30)
        )  # Random date within a month
        team1, team2 = random.sample(teams, 2)  # Pick two different teams
        location = random.choice(list(locations.keys()))  # Random location
        coordinates = locations[location]  # Get coordinates for the location
        matches.append(
            {
                "match_id": i + 1,
                "date": match_date.strftime("%Y-%m-%d"),
                "team1": team1,
                "team2": team2,
                "location": location,
                "latitude": coordinates[0],
                "longitude": coordinates[1],
            }
        )
    return matches


# Generate the data
num_matches = 50  # Specify how many matches you want to generate
ipl_data = generate_ipl_data(num_matches)

# Convert to a DataFrame
ipl_df = pd.DataFrame(ipl_data)

# Save to a CSV file
ipl_df.to_csv("ipl_matches_2024_with_coordinates.csv", index=False)

print("Generated IPL match data with world locations:")
print(ipl_df)
