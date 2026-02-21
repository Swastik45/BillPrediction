import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

# Simple historical data
data = {
    'units': [100, 200, 300, 400, 500],
    'bill': [15, 30, 45, 60, 75] 
}

df = pd.DataFrame(data)

# Train a basic model
model = LinearRegression()
model.fit(df[['units']], df['bill'])

# Save it to a file
joblib.dump(model, 'bill_model.pkl')
print("✅ Success: bill_model.pkl has been created!")