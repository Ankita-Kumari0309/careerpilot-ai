import re
def clean_job_description(jd_text):
    """
    Clean job description by removing unnecessary whitespace , symbols and HTML tags if any
    """
    try:
        jd_text = re.sub(r'<.*?>','',jd_text)

        jd_text = re.sub(r'\s+',' ',jd_text)
        return jd_text.strip()
    
    except Exception as e:
        print("[ERROR] Failed to clean Job Description:",e)
        return jd_text
