from flask import Flask, request, send_file, abort
import pandas as pd
import seaborn as sns
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from datetime import datetime
import numpy as np
import json
from matplotlib.colors import ListedColormap
import io
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
def sum_dosages(dosages):
    total = 0
    for i in dosages:
        try:
            total += float(i)
        except:
            pass
    return total

@app.route('/api/medicines')
def medicines():
    patient_id = request.args.get('id')
    if not patient_id:
        abort(400, description="Missing patient id")

    if not os.path.exists('history_new.json'):
        abort(500, description="history_new.json not found")
    with open('history_new.json') as f:
        history_data = json.load(f)
    history_df = pd.DataFrame(history_data)
    history_df = history_df[history_df["patient_id"] == patient_id]
    if history_df.empty:
        return {"medicines": []}

    # Get unique medicines for this patient
    medicine_list = sorted(history_df["medicine_name"].unique())
    return {"medicines": medicine_list}

@app.route('/api/heatmap')
def heatmap():
    patient_id = request.args.get('id')
    if not patient_id:
        abort(400, description="Missing patient id")

    # Load patient data
    if not os.path.exists('patients_new.json'):
        abort(500, description="patients_new.json not found")
    with open('patients_new.json') as f:
        patient_data = json.load(f)
    patient_df = pd.DataFrame(patient_data)
    patient_row = patient_df[patient_df["_id"] == patient_id]
    if patient_row.empty:
        abort(404, description="Patient not found")
    patient_name = patient_row["name"].iloc[0]

    # Load history
    if not os.path.exists('history_new.json'):
        abort(500, description="history_new.json not found")
    with open('history_new.json') as f:
        history_data = json.load(f)
    history_df = pd.DataFrame(history_data)
    history_df = history_df[history_df["patient_id"] == patient_id]
    if history_df.empty:
        abort(404, description="No history for patient")

    # Load alarm
    if not os.path.exists('alarm_new.json'):
        abort(500, description="alarm_new.json not found")
    with open('alarm_new.json') as f:
        alarm_data = json.load(f)
    alarm_df = pd.DataFrame(alarm_data)
    alarm_df = alarm_df[alarm_df["patient_id"] == patient_id]

    # Convert timestamp to datetime
    history_df["timestamp"] = pd.to_datetime(history_df["timestamp"]).dt.tz_localize(None)
    history_df["date"] = history_df["timestamp"].dt.date

    # Count frequency of each medicine per day
    frequency_df = history_df.groupby(['date', 'medicine_name']).size().reset_index(name='frequency')

    # Pivot for heatmap
    pivot = frequency_df.pivot(index="date", columns="medicine_name", values="frequency")
    pivot = pivot.fillna(0)
    pivot.index = pd.to_datetime(pivot.index).strftime("%d-%m-%Y")

    # Dosage calculations
    if not alarm_df.empty and "dosage" in alarm_df.columns and "schedule_name" in alarm_df.columns:
        alarm_df["total_scheduled_dosage"] = alarm_df["dosage"].apply(sum_dosages)
        scheduled_dosage_dict = dict(zip(alarm_df["schedule_name"], alarm_df["total_scheduled_dosage"]))
    else:
        scheduled_dosage_dict = {}

    # Color matrix: 0 for missed/overdose, 1 for within limit
    color_matrix = pivot.copy()
    for col in color_matrix.columns:
        sched = scheduled_dosage_dict.get(col, np.inf)
        color_matrix[col] = np.where((pivot[col] == 0) | (pivot[col] > sched), 0, 1)
    color_matrix.index = pivot.index

    # Custom colormap
    custom_cmap = ListedColormap(["#dc4c4c", "#62d666"])

    # Create heatmap
    plt.figure(figsize=(8, 5))
    sns.heatmap(
        color_matrix,
        annot=pivot,
        fmt=".0f",
        cmap=custom_cmap,
        cbar=False,
        linewidths=1,
        linecolor='black',
        annot_kws={"size": 16} 
    )
    plt.title(f"Doses(daily) of {patient_name}", fontsize=16)
    plt.xlabel("medicines taken", fontsize = 12)
    plt.ylabel("date", fontsize=12)
    plt.xticks(fontsize=12)
    plt.yticks(fontsize=10)
    plt.tight_layout()

    # Save image to buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    return send_file(buf, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)
