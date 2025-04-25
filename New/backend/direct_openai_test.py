"""
Direct OpenAI test file that bypasses any environment proxies
"""
from dotenv import load_dotenv
import os

def test_direct_openai():
    # Load environment variables
    load_dotenv()
    
    # Get API key
    api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        print("No API key found. Please check your .env file")
        return
    
    try:
        print("Testing direct HTTP request to OpenAI API...")
        
        # Use requests directly instead of the OpenAI client
        import requests
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": "Say hello!"}],
            "max_tokens": 50
        }
        
        # Make direct API call without using the client library
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\nOpenAI API Test Results:")
            print("------------------------")
            print("✓ Connection successful!")
            print("✓ Response received!")
            print("\nTest response:", result["choices"][0]["message"]["content"])
        else:
            print(f"Error: API returned status code {response.status_code}")
            print(response.text)
        
    except Exception as e:
        print("\nError testing OpenAI API:", str(e))
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_direct_openai() 