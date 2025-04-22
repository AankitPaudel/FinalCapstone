from dotenv import load_dotenv
import os

def test_openai_connection():
    # Load environment variables
    load_dotenv()
    
    # Get API key
    api_key = os.getenv('OPENAI_API_KEY')
    
    try:
        # Import directly in function to avoid any env configurations
        from openai import OpenAI
        
        # Create a clean client instance
        client = OpenAI(
            api_key=api_key,
            # No proxy settings or other config
        )
        
        # Make a simple test request
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Using a more widely available model
            messages=[{"role": "user", "content": "Say hello!"}],
            max_tokens=50
        )
        
        print("\nOpenAI API Test Results:")
        print("------------------------")
        print("✓ Connection successful!")
        print("✓ Response received!")
        print("\nTest response:", response.choices[0].message.content)
        
    except Exception as e:
        print("\nError testing OpenAI API:", str(e))
        # Print more detailed error information
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_openai_connection() 