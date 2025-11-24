import pandas as pd
import numpy as np

class DataCleaner:
    def execute_cleaning_code(self, df: pd.DataFrame, code_snippet: str) -> pd.DataFrame:
        """
        Executes the AI-generated Python code safely.
        """
        try:
            # Create a copy so we don't mess up the original memory
            df_copy = df.copy()
            
            # Define the environment for the code to run in
            # We must give it 'pd' and 'np' because the AI assumes they exist
            local_scope = {
                "df": df_copy, 
                "pd": pd, 
                "np": np
            }
            
            # Execute the string as Python code
            exec(code_snippet, globals(), local_scope)
            
            # The AI defines a function 'clean_data(df)'. Let's call it.
            if "clean_data" in local_scope:
                clean_function = local_scope["clean_data"]
                cleaned_df = clean_function(df_copy)
                return cleaned_df
            
            # Fallback: If AI modified 'df' directly in the script scope
            elif "df" in local_scope:
                return local_scope["df"]
            
            else:
                raise Exception("The AI code ran, but didn't return a 'clean_data' function or a 'df' variable.")

        except Exception as e:
            # This prints the specific error to your terminal so we can see it
            print(f"❌ CODE EXECUTION FAILED:\n{str(e)}")
            raise Exception(f"Error executing AI code: {str(e)}")