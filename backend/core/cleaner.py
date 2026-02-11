import pandas as pd 
import numpy as np

class DataCleaner:
    def execute_cleaning_code(self, df: pd.DataFrame, code_snippet: str) -> pd.DataFrame:
        """
        Executes the AI-generated Python code safely.
        """
        try:
            df_copy = df.copy()
            
            local_scope = {
                "df": df_copy, 
                "pd": pd, 
                "np": np
            }
            
            exec(code_snippet, globals(), local_scope)
            
            if "clean_data" in local_scope:
                clean_function = local_scope["clean_data"]
                cleaned_df = clean_function(df_copy)
                return cleaned_df
            
            elif "df" in local_scope:
                return local_scope["df"]
            
            else:
                raise Exception("The AI code ran, but didn't return a 'clean_data' function or a 'df' variable.")

        except Exception as e:
            print(f"CODE EXECUTION FAILED:\n{str(e)}")
            raise Exception(f"Error executing AI code: {str(e)}")