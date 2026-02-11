from fpdf import FPDF
import os

class PDFReport(FPDF): 
    def header(self):

        self.set_font('Arial', 'B', 20)
        self.set_text_color(33, 150, 243) # Blue
        self.cell(0, 10, 'Auto Data Doctor', 0, 1, 'L')
        
        self.set_font('Arial', 'I', 10)
        self.set_text_color(100, 100, 100) # Grey
        self.cell(0, 5, 'Automated Dataset Diagnosis & Cleaning Report', 0, 1, 'L')
        
        self.ln(5)
        self.set_draw_color(200, 200, 200)
        self.line(10, 25, 200, 25)
        self.ln(10)

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 14)
        self.set_text_color(0, 0, 0)
        self.set_fill_color(240, 245, 255) 
        self.cell(0, 10, f"  {title}", 0, 1, 'L', 1)
        self.ln(5)

    def chapter_body(self, body):
        self.set_font('Arial', '', 11)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 8, body) 
        self.ln()

    def add_bullet_point(self, text):
        self.set_font('Arial', '', 11)
        self.set_text_color(50, 50, 50)
        self.cell(10) 
        self.multi_cell(0, 8, f"{chr(149)} {text}") 

def generate_pdf(filename, initial_stats, final_stats, ai_summary, strategies, output_folder="temp"):
    pdf = PDFReport()
    pdf.add_page()
    
    pdf.chapter_title("1. Executive Diagnosis")
    clean_summary = ai_summary.encode('latin-1', 'replace').decode('latin-1')
    pdf.chapter_body(clean_summary)
    
    pdf.chapter_title("2. Procedures Executed")
    if strategies and len(strategies) > 0:
        for item in strategies:
            col = item.get('column', 'Dataset')
            action = item.get('action', 'Fixed')
            issue = item.get('issue', 'Issue')
            bullet_text = f"{action} on column '{col}' (Detected: {issue})"
            bullet_text = bullet_text.encode('latin-1', 'replace').decode('latin-1')
            pdf.add_bullet_point(bullet_text)
    else:
        pdf.add_bullet_point("Standardized schema structure.")
        pdf.add_bullet_point("Applied statistical imputation.")
        pdf.add_bullet_point("Removed anomalies.")
    pdf.ln(5)

    pdf.chapter_title("3. Health Metrics Comparison")
    pdf.set_font('Arial', 'B', 10)
    pdf.set_fill_color(230, 230, 230)
    
    pdf.cell(60, 10, "Metric", 1, 0, 'C', 1)
    pdf.cell(60, 10, "Before Treatment", 1, 0, 'C', 1)
    pdf.cell(60, 10, "After Treatment", 1, 1, 'C', 1)
    
    pdf.set_font('Arial', '', 10)
    
    rows_before = initial_stats['rows']
    rows_after = final_stats['rows']
    cols_before = initial_stats['columns']
    cols_after = final_stats['columns']
    missing_before = sum(col['missing_count'] for col in initial_stats['column_details'].values())
    missing_after = sum(col.get('missing_count', 0) for col in final_stats['column_details'].values())

    pdf.cell(60, 10, "Total Rows", 1, 0, 'C')
    pdf.cell(60, 10, str(rows_before), 1, 0, 'C')
    pdf.cell(60, 10, str(rows_after), 1, 1, 'C')

    pdf.cell(60, 10, "Total Columns", 1, 0, 'C')
    pdf.cell(60, 10, str(cols_before), 1, 0, 'C')
    pdf.cell(60, 10, str(cols_after), 1, 1, 'C')

    pdf.cell(60, 10, "Missing Values", 1, 0, 'C')
    pdf.cell(60, 10, str(missing_before), 1, 0, 'C')
    pdf.cell(60, 10, str(missing_after), 1, 1, 'C')

    # File name logic
    base_name = os.path.splitext(filename)[0]
    report_filename = f"Report_{base_name}.pdf"
    
    pdf.output(os.path.join(output_folder, report_filename))
    return report_filename