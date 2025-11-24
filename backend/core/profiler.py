import pandas as pd
import numpy as np

class DataProfiler:
    def __init__(self, df: pd.DataFrame):
        self.df = df

    def compute_skewness(self, series):
        """
        Measures asymmetry. 
        0 = Normal distribution (Bell curve).
        > 1 or < -1 = Highly skewed (requires special cleaning).
        """
        return series.skew()

    def count_outliers_iqr(self, series):
        """
        Detects outliers using Interquartile Range (IQR).
        Any value below Q1 - 1.5*IQR or above Q3 + 1.5*IQR is an outlier.
        """
        Q1 = series.quantile(0.25)
        Q3 = series.quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        return ((series < lower_bound) | (series > upper_bound)).sum()

    def get_profile(self):
        """
        Main function to generate the health report.
        """
        profile = {
            "rows": int(self.df.shape[0]),
            "columns": int(self.df.shape[1]),
            "duplicates": int(self.df.duplicated().sum()),
            "column_details": {}
        }

        for col in self.df.columns:
            # Basic stats
            dtype = str(self.df[col].dtype)
            missing_count = int(self.df[col].isnull().sum())
            missing_percentage = round((missing_count / len(self.df)) * 100, 2)

            col_info = {
                "type": dtype,
                "missing_count": missing_count,
                "missing_percentage": missing_percentage,
                "unique_values": int(self.df[col].nunique()),
            }

            # Numeric specific stats (Outliers, Skew, Mean)
            if pd.api.types.is_numeric_dtype(self.df[col]):
                col_info["is_numeric"] = True
                col_info["mean"] = float(self.df[col].mean()) if not self.df[col].isnull().all() else 0
                col_info["median"] = float(self.df[col].median()) if not self.df[col].isnull().all() else 0
                col_info["std_dev"] = float(self.df[col].std()) if not self.df[col].isnull().all() else 0
                col_info["min"] = float(self.df[col].min()) if not self.df[col].isnull().all() else 0
                col_info["max"] = float(self.df[col].max()) if not self.df[col].isnull().all() else 0
                
                # Advanced Stats
                col_info["skewness"] = float(self.compute_skewness(self.df[col]))
                col_info["outlier_count"] = int(self.count_outliers_iqr(self.df[col]))
            else:
                col_info["is_numeric"] = False
                # For text columns, finding the most common value is useful
                if not self.df[col].empty:
                    col_info["top_value"] = str(self.df[col].mode()[0]) if not self.df[col].mode().empty else "N/A"

            profile["column_details"][col] = col_info

        return profile