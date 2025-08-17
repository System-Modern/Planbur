import streamlit as st
import google.generativeai as genai
import os

# ---------------------------------
# Konfigurasi API Key
# ---------------------------------
# Ambil dari environment variable atau secrets.toml
api_key = os.getenv("GEMINI_API_KEY") or st.secrets.get("GEMINI_API_KEY", "")

if not api_key:
    st.error("❌ GEMINI_API_KEY belum diset. Tambahkan di environment variable atau .streamlit/secrets.toml")
else:
    genai.configure(api_key=api_key)

# ---------------------------------
# Setup halaman
# ---------------------------------
st.set_page_config(page_title="Gemini Chatbot", page_icon="🤖")
st.title("🤖 Chatbot Gemini + Streamlit")

# Simpan riwayat percakapan
if "messages" not in st.session_state:
    st.session_state.messages = []

# Tampilkan chat sebelumnya
for role, text in st.session_state.messages:
    with st.chat_message(role):
        st.markdown(text)

# Input user
prompt = st.chat_input("Ketik pertanyaanmu di sini...")

if prompt and api_key:
    # Simpan pesan user
    st.session_state.messages.append(("user", prompt))
    with st.chat_message("user"):
        st.markdown(prompt)

    # Balasan AI
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        reply = response.text
        with st.chat_message("assistant"):
            st.markdown(reply)

        st.session_state.messages.append(("assistant", reply))
    except Exception as e:
        st.error(f"Terjadi error: {e}")
