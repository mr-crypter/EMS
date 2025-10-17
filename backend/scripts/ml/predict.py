import argparse
import os
import json
import joblib
import pandas as pd
from features import add_features  # ensure unpickling can resolve import path

parser = argparse.ArgumentParser()
parser.add_argument('--event_type', required=True)
parser.add_argument('--attendees', type=int, required=True)
parser.add_argument('--expenses', type=float, required=True)
parser.add_argument('--model', default=os.path.join(os.path.dirname(__file__), 'model.pkl'))
args = parser.parse_args()

model = joblib.load(args.model)
X = pd.DataFrame([{
    'event_type': args.event_type,
    'attendees': args.attendees,
    'expenses': args.expenses
}])
proba = model.predict_proba(X)[0][1]
print(json.dumps({ 'score': float(proba) }))
