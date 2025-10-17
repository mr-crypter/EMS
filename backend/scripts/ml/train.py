import argparse
import pandas as pd
from sklearn.preprocessing import OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
import joblib

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

preprocess = ColumnTransformer([
    ('cat', OneHotEncoder(handle_unknown='ignore'), ['event_type'])
], remainder='passthrough')

model = Pipeline([
    ('prep', preprocess),
    ('clf', RandomForestClassifier(n_estimators=200, random_state=42))
])

model.fit(X, y)
joblib.dump(model, args.out)
print('saved', args.out)
