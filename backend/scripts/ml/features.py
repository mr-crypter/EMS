import numpy as np

def add_features(df):
	df = df.copy()
	bpa = df['expenses'] / np.clip(df['attendees'], 1, None)
	df['budget_per_attendee'] = bpa.astype(float)
	df['log_attendees'] = np.log1p(df['attendees'])
	df['log_expenses'] = np.log1p(df['expenses'])
	df['log_bpa'] = np.log1p(df['budget_per_attendee'])
	return df


