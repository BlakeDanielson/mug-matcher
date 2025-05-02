import csv

# Read the CSV file
with open('mugshots_data.csv', 'r', newline='') as csvfile:
    reader = csv.reader(csvfile)
    header = next(reader)  # Get the header row
    data = list(reader)    # Get all the data rows

# Find the index of the InmateID column
inmate_id_index = header.index('InmateID')

# Sort the data by InmateID (converting to integer for proper numeric sorting)
data.sort(key=lambda row: int(row[inmate_id_index]))

# Write the sorted data to a new CSV file
with open('sorted_mugshots.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(header)  # Write the header row
    writer.writerows(data)   # Write all the data rows

print("Sorting complete. Data saved to 'sorted_mugshots.csv'")
