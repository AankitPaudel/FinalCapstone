"""
Helper module to safely initialize OpenAI client
"""
import os
from openai import OpenAI
from dotenv import load_dotenv

def get_openai_client():
    """
    Creates and returns an OpenAI client with proper configuration
    while avoiding proxy issues.
    """
    # Load environment variables
    load_dotenv()
    
    # Get API key
    api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    
    # Create a clean client without proxies
    # Use direct kwargs to avoid any potential environment interference
    client = OpenAI(
        api_key=api_key,
    )
    
    return client

# Test function
def test_openai():
    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Say hello!"}],
            max_tokens=50
        )
        print("\nOpenAI API Test Results:")
        print("------------------------")
        print("✓ Connection successful!")
        print("✓ Response received!")
        print("\nTest response:", response.choices[0].message.content)
        return True
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_openai() 