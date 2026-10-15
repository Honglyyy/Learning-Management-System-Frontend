# Lesson 1.1: Data Wrangling with Pandas

```python
import pandas as pd

# Load dataset and clean missing values
df = pd.read_csv('transactions.csv')
df['amount'] = df['amount'].fillna(df['amount'].median())

# Aggregation by category
summary = df.groupby('category').agg({'amount': ['count', 'mean', 'sum']})
print(summary)
```
