# model_train.py
import argparse
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib




def load_data(path):
    df = pd.read_csv(path)
    return df




def build_pipeline():
    # Define categorical and numeric columns
    cat_cols = ['day_of_week','time_slot','stop_name','weather']
    num_cols = ['distance_from_origin','temperature','traffic_level','is_holiday','is_festival','is_special_event','historical_crowd']
    
    preprocessor = ColumnTransformer([
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
        ], remainder='passthrough')
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    pipe = Pipeline(steps=[('pre', preprocessor), ('rf', model)])
    return pipe




def train(args):
    df = load_data(args.data)
    # Fill missing values
    # df.fillna({'temperature': df['temperature'].mean(), 'traffic_level': df['traffic_level'].median()}, inplace=True)
    

    X = df[['day_of_week','time_slot','stop_name','weather','distance_from_origin','temperature','traffic_level','is_holiday','is_festival','is_special_event','historical_crowd']]
    y = df['passenger_count']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    pipe = build_pipeline()
    pipe.fit(X_train, y_train)
    # Save the pipeline
    joblib.dump(pipe, args.out)
    print('Model saved to', args.out)




if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', required=True)
    parser.add_argument('--out', default='model.joblib')
    args = parser.parse_args()
    train(args)