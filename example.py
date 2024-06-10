import streamlit as st

from streamlit_copilot_textarea import st_copilot_textarea

value = st_copilot_textarea(
    prompt_template="{input_text}",
    api_url="http://localhost:8000/generate",
    requests_per_minute=20,
    max_tokens=10,
    stop=["\n", "."],
)

st.write(f"Your text: {value}")
