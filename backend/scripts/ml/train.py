import argparse
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, FunctionTransformer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
import joblib
import numpy as np
from features import add_features

parser = argparse.ArgumentParser()
parser.add_argument('--csv', required=True)
parser.add_argument('--out', required=True)
args = parser.parse_args()

# Load data
DF = pd.read_csv(args.csv)
DF = DF.rename(columns={'Event Type':'event_type','Attendees':'attendees','Expenses':'expenses','Success':'success'})
DF = DF.dropna()

X = DF[['event_type','attendees','expenses']]
y = DF['success']

feature_adder = FunctionTransformer(add_features, validate=False)
num_features = ['attendees','expenses','budget_per_attendee','log_attendees','log_expenses','log_bpa']
preprocess = ColumnTransformer([
    ('cat', OneHotEncoder(handle_unknown='ignore'), ['event_type']),
    ('num', 'passthrough', num_features),
], remainder='drop')

rf = RandomForestClassifier(n_estimators=300, random_state=42, min_samples_leaf=5)
clf = CalibratedClassifierCV(rf, method='isotonic', cv=3)
model = Pipeline([
    ('add', feature_adder),
    ('prep', preprocess),
    ('clf', clf)
])

model.fit(X, y)
joblib.dump(model, args.out)
print('saved', args.out)
